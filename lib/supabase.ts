import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase admin client (service-role key — bypasses RLS).
// NEVER import this module into a 'use client' component.
// Constructed lazily so `next build` doesn't crash when env is absent at module load.
let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
    if (_client) return _client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error(
            'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
        );
    }

    _client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return _client;
}
