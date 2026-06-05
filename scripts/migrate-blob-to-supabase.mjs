// One-off migration: import existing submissions from Vercel Blob + local sample
// JSON files into Supabase. Idempotent (safe to re-run).
//
//   node scripts/migrate-blob-to-supabase.mjs
//
// Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BLOB_READ_WRITE_TOKEN from .env.local

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { list } from '@vercel/blob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---- load .env.local (no dependency) ----
function loadEnv() {
    const file = join(ROOT, '.env.local');
    if (!existsSync(file)) return;
    const text = readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!m) continue;
        const key = m[1];
        let val = m[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
    }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!SUPABASE_URL || !SERVICE_KEY || SERVICE_KEY.includes('REPLACE_WITH')) {
    console.error('❌ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

function hostKey(url) {
    if (!url) return null;
    try {
        const u = new URL(url.includes('://') ? url : `https://${url}`);
        return u.hostname.replace(/^www\./i, '').toLowerCase() || null;
    } catch {
        return null;
    }
}

// ---- gather source submissions ----
function readLocal() {
    const dir = join(ROOT, 'data', 'submissions');
    const out = [];
    if (!existsSync(dir)) return out;
    for (const sub of readdirSync(dir)) {
        const subdir = join(dir, sub);
        if (!statSync(subdir).isDirectory()) continue;
        for (const f of readdirSync(subdir)) {
            if (!f.endsWith('.json')) continue;
            try {
                out.push(JSON.parse(readFileSync(join(subdir, f), 'utf8')));
            } catch (e) {
                console.warn(`  skip ${f}: ${e.message}`);
            }
        }
    }
    return out;
}

async function readBlob() {
    if (!BLOB_TOKEN || BLOB_TOKEN.includes('REPLACE_WITH')) {
        console.warn('⚠️  BLOB_READ_WRITE_TOKEN not set — skipping Vercel Blob import.');
        return [];
    }
    const out = [];
    let cursor;
    do {
        const res = await list({ token: BLOB_TOKEN, cursor, limit: 1000 });
        for (const blob of res.blobs) {
            if (!blob.pathname.endsWith('.json')) continue;
            try {
                const r = await fetch(blob.url);
                out.push(await r.json());
            } catch (e) {
                console.warn(`  skip blob ${blob.pathname}: ${e.message}`);
            }
        }
        cursor = res.cursor;
    } while (cursor);
    return out;
}

// ---- client resolution (cached) ----
const clientCache = new Map(); // name_key -> id
async function ensureClient(name, websiteUrl) {
    const key = String(name).trim().toLowerCase();
    if (clientCache.has(key)) return clientCache.get(key);

    const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name_key', key)
        .maybeSingle();
    if (existing) {
        clientCache.set(key, existing.id);
        return existing.id;
    }

    const { data: created, error } = await supabase
        .from('clients')
        .insert({ name: String(name).trim(), website_url: websiteUrl || null, url_key: hostKey(websiteUrl) })
        .select('id')
        .single();
    if (error) {
        const { data: again } = await supabase.from('clients').select('id').eq('name_key', key).maybeSingle();
        if (again) {
            clientCache.set(key, again.id);
            return again.id;
        }
        throw error;
    }
    clientCache.set(key, created.id);
    return created.id;
}

async function main() {
    console.log('→ Reading sources…');
    const [local, blob] = await Promise.all([Promise.resolve(readLocal()), readBlob()]);
    const all = [...blob, ...local];
    console.log(`  ${blob.length} from Blob, ${local.length} local → ${all.length} total`);
    if (all.length === 0) {
        console.log('Nothing to migrate.');
        return;
    }

    // existing rows for dedupe
    const seen = new Set();
    const { data: existingRows } = await supabase
        .from('submissions')
        .select('website_name, created_at')
        .limit(100000);
    for (const r of existingRows ?? []) {
        seen.add(`${r.website_name}|${new Date(r.created_at).getTime()}`);
    }

    let inserted = 0;
    let skipped = 0;
    for (const s of all) {
        const websiteName = s.websiteName || s.website_name;
        const websiteUrl = s.websiteUrl || s.website_url || '';
        const ts = s.timestamp || s.created_at || new Date().toISOString();
        if (!websiteName) {
            skipped++;
            continue;
        }
        const dedupeKey = `${websiteName}|${new Date(ts).getTime()}`;
        if (seen.has(dedupeKey)) {
            skipped++;
            continue;
        }

        const clientId = await ensureClient(websiteName, websiteUrl);
        const { error } = await supabase.from('submissions').insert({
            client_id: clientId,
            website_name: websiteName,
            website_url: websiteUrl,
            form_data: s.formData || s.form_data || {},
            metadata: s.metadata || null,
            created_at: ts,
        });
        if (error) {
            console.warn(`  insert failed (${websiteName}): ${error.message}`);
            skipped++;
        } else {
            seen.add(dedupeKey);
            inserted++;
        }
    }

    console.log(`✅ Done. Inserted ${inserted}, skipped ${skipped} (already present / invalid).`);
    console.log(`   Clients touched: ${clientCache.size}`);
}

main().catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
});
