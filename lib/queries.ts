import { supabaseAdmin } from './supabase';
import {
    Client,
    ClientStatus,
    Submission,
    SubmissionStatus,
    OverviewData,
    ClientStats,
} from './types';

const SUBMISSION_COLS =
    'id, client_id, website_name, website_url, form_data, metadata, status, is_read, is_spam, spam_reason, notes, created_at, clients(name)';

// ---------- row mappers (snake_case DB -> camelCase app) ----------

function mapClient(row: any): Client {
    return {
        id: row.id,
        name: row.name,
        websiteUrl: row.website_url ?? undefined,
        ingestKey: row.ingest_key ?? undefined,
        logoUrl: row.logo_url ?? undefined,
        contactName: row.contact_name ?? undefined,
        contactEmail: row.contact_email ?? undefined,
        contactPhone: row.contact_phone ?? undefined,
        status: row.status as ClientStatus,
        submissionCount:
            row.submission_count != null ? Number(row.submission_count) : undefined,
        lastSubmission: row.last_submission ?? undefined,
        createdAt: row.created_at ?? undefined,
    };
}

function mapSubmission(row: any): Submission {
    const rel = row.clients;
    const clientName = Array.isArray(rel) ? rel[0]?.name ?? null : rel?.name ?? null;
    return {
        id: row.id,
        clientId: row.client_id ?? null,
        clientName,
        websiteName: row.website_name,
        websiteUrl: row.website_url,
        timestamp: row.created_at,
        formData: row.form_data ?? {},
        metadata: row.metadata ?? undefined,
        status: row.status as SubmissionStatus,
        isRead: !!row.is_read,
        isSpam: !!row.is_spam,
        spamReason: row.spam_reason ?? null,
        notes: row.notes ?? undefined,
    };
}

// Normalize a URL to a bare host (no scheme, no leading www) for client matching.
export function hostKey(url?: string | null): string | null {
    if (!url) return null;
    try {
        const u = new URL(url.includes('://') ? url : `https://${url}`);
        return u.hostname.replace(/^www\./i, '').toLowerCase() || null;
    } catch {
        return null;
    }
}

// ---------- clients ----------

export interface ClientInput {
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    status?: ClientStatus;
}

export async function getClients(): Promise<Client[]> {
    const { data, error } = await supabaseAdmin()
        .from('client_overview')
        .select('*')
        .order('submission_count', { ascending: false })
        .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapClient);
}

export async function getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabaseAdmin()
        .from('client_overview')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data ? mapClient(data) : null;
}

export async function createClient(input: ClientInput): Promise<Client> {
    const { data, error } = await supabaseAdmin()
        .from('clients')
        .insert({
            name: input.name,
            website_url: input.websiteUrl ?? null,
            url_key: hostKey(input.websiteUrl),
            logo_url: input.logoUrl ?? null,
            contact_name: input.contactName ?? null,
            contact_email: input.contactEmail ?? null,
            contact_phone: input.contactPhone ?? null,
            status: input.status ?? 'active',
        })
        .select('*')
        .single();
    if (error) throw error;
    await backfillClientLinks(data.id);
    return mapClient(data);
}

export async function updateClient(
    id: string,
    patch: Partial<ClientInput>
): Promise<Client> {
    const upd: Record<string, any> = {};
    if (patch.name !== undefined) upd.name = patch.name;
    if (patch.websiteUrl !== undefined) {
        upd.website_url = patch.websiteUrl ?? null;
        upd.url_key = hostKey(patch.websiteUrl);
    }
    if (patch.logoUrl !== undefined) upd.logo_url = patch.logoUrl ?? null;
    if (patch.contactName !== undefined) upd.contact_name = patch.contactName ?? null;
    if (patch.contactEmail !== undefined) upd.contact_email = patch.contactEmail ?? null;
    if (patch.contactPhone !== undefined) upd.contact_phone = patch.contactPhone ?? null;
    if (patch.status !== undefined) upd.status = patch.status;

    const { data, error } = await supabaseAdmin()
        .from('clients')
        .update(upd)
        .eq('id', id)
        .select('*')
        .single();
    if (error) throw error;
    await backfillClientLinks(id);
    return mapClient(data);
}

export async function deleteClient(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('clients').delete().eq('id', id);
    if (error) throw error;
}

// Re-link previously unassigned submissions to a client by name/url. Returns count linked.
export async function backfillClientLinks(clientId: string): Promise<number> {
    const { data, error } = await supabaseAdmin().rpc('backfill_client_links', {
        p_client: clientId,
    });
    if (error) throw error;
    return typeof data === 'number' ? data : 0;
}

// ---------- submissions ----------

export interface GetSubmissionsOpts {
    clientId?: string;
    unassigned?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: SubmissionStatus;
    unreadOnly?: boolean;
    spam?: 'all' | 'hide' | 'only';
    limit?: number;
    offset?: number;
}

export async function getSubmissions(
    opts: GetSubmissionsOpts = {}
): Promise<{ rows: Submission[]; count: number }> {
    let q = supabaseAdmin()
        .from('submissions')
        .select(SUBMISSION_COLS, { count: 'exact' });

    if (opts.clientId) q = q.eq('client_id', opts.clientId);
    if (opts.unassigned) q = q.is('client_id', null);
    if (opts.status) q = q.eq('status', opts.status);
    if (opts.unreadOnly) q = q.eq('is_read', false);
    if (opts.spam === 'hide') q = q.eq('is_spam', false);
    else if (opts.spam === 'only') q = q.eq('is_spam', true);
    if (opts.startDate) q = q.gte('created_at', opts.startDate);
    if (opts.endDate) q = q.lte('created_at', opts.endDate);
    if (opts.search) {
        const term = opts.search.replace(/[%_\\]/g, (m) => '\\' + m);
        q = q.ilike('search_text', `%${term}%`);
    }

    let final = q.order('created_at', { ascending: false });
    if (opts.limit != null) {
        const offset = opts.offset ?? 0;
        final = final.range(offset, offset + opts.limit - 1);
    }

    const { data, error, count } = await final;
    if (error) throw error;
    return { rows: (data ?? []).map(mapSubmission), count: count ?? 0 };
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const { data, error } = await supabaseAdmin()
        .from('submissions')
        .select(SUBMISSION_COLS)
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data ? mapSubmission(data) : null;
}

export async function insertSubmission(input: {
    websiteName: string;
    websiteUrl: string;
    formData: Record<string, any>;
    metadata?: Record<string, any>;
    isSpam?: boolean;
    spamReason?: string | null;
}): Promise<string> {
    const { data, error } = await supabaseAdmin()
        .from('submissions')
        .insert({
            website_name: input.websiteName,
            website_url: input.websiteUrl,
            form_data: input.formData,
            metadata: input.metadata ?? null,
            is_spam: input.isSpam ?? false,
            spam_reason: input.spamReason ?? null,
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id as string;
}

export async function updateSubmission(
    id: string,
    patch: { status?: SubmissionStatus; isRead?: boolean; isSpam?: boolean; notes?: string }
): Promise<Submission> {
    const upd: Record<string, any> = {};
    if (patch.status !== undefined) upd.status = patch.status;
    if (patch.isRead !== undefined) upd.is_read = patch.isRead;
    if (patch.isSpam !== undefined) {
        upd.is_spam = patch.isSpam;
        if (patch.isSpam === false) upd.spam_reason = null;
    }
    if (patch.notes !== undefined) upd.notes = patch.notes;

    const { data, error } = await supabaseAdmin()
        .from('submissions')
        .update(upd)
        .eq('id', id)
        .select(SUBMISSION_COLS)
        .single();
    if (error) throw error;
    return mapSubmission(data);
}

// ---------- analytics ----------

export async function getOverview(days = 30): Promise<OverviewData> {
    const supabase = supabaseAdmin();

    const [totalSub, unreadSub, spamSub, totalCli, unassignedSub, seriesRes, perClientRes, recentRes] =
        await Promise.all([
            supabase.from('submissions').select('id', { count: 'exact', head: true }),
            supabase
                .from('submissions')
                .select('id', { count: 'exact', head: true })
                .eq('is_read', false),
            supabase
                .from('submissions')
                .select('id', { count: 'exact', head: true })
                .eq('is_spam', true),
            supabase.from('clients').select('id', { count: 'exact', head: true }),
            supabase
                .from('submissions')
                .select('id', { count: 'exact', head: true })
                .is('client_id', null),
            supabase.rpc('submissions_daily_counts', { p_days: days }),
            supabase
                .from('client_overview')
                .select('id, name, submission_count'),
            supabase
                .from('submissions')
                .select(SUBMISSION_COLS)
                .order('created_at', { ascending: false })
                .limit(10),
        ]);

    const series: { date: string; count: number }[] = (seriesRes.data ?? []).map((r: any) => ({
        date: r.date,
        count: Number(r.count),
    }));

    const perClient: { clientId: string | null; name: string; count: number }[] = (
        perClientRes.data ?? []
    ).map((r: any) => ({
        clientId: r.id as string | null,
        name: r.name as string,
        count: Number(r.submission_count),
    }));
    const unassignedCount = unassignedSub.count ?? 0;
    if (unassignedCount > 0) {
        perClient.push({ clientId: null, name: 'Unassigned', count: unassignedCount });
    }
    perClient.sort((a, b) => b.count - a.count);

    const thisWeek = series.slice(-7).reduce((sum, d) => sum + d.count, 0);

    return {
        totalClients: totalCli.count ?? 0,
        totalSubmissions: totalSub.count ?? 0,
        unread: unreadSub.count ?? 0,
        spam: spamSub.count ?? 0,
        thisWeek,
        series,
        perClient,
        recent: (recentRes.data ?? []).map(mapSubmission),
    };
}

// Per-client (or unassigned) analytics for the client detail page.
export async function getClientStats(
    clientId: string | null,
    isUnassigned: boolean,
    days = 30
): Promise<ClientStats> {
    const supabase = supabaseAdmin();
    const base = () => {
        const q = supabase.from('submissions').select('id', { count: 'exact', head: true });
        return isUnassigned ? q.is('client_id', null) : q.eq('client_id', clientId as string);
    };

    const [total, unread, spam, sNew, sLead, sContacted, sClosed, seriesRes] = await Promise.all([
        base(),
        base().eq('is_read', false),
        base().eq('is_spam', true),
        base().eq('status', 'new'),
        base().eq('status', 'lead'),
        base().eq('status', 'contacted'),
        base().eq('status', 'closed'),
        supabase.rpc('submissions_daily_counts_client', {
            p_client: clientId,
            p_unassigned: isUnassigned,
            p_days: days,
        }),
    ]);

    const series: { date: string; count: number }[] = (seriesRes.data ?? []).map((r: any) => ({
        date: r.date,
        count: Number(r.count),
    }));
    const thisWeek = series.slice(-7).reduce((sum, d) => sum + d.count, 0);

    return {
        total: total.count ?? 0,
        unread: unread.count ?? 0,
        spam: spam.count ?? 0,
        thisWeek,
        byStatus: {
            new: sNew.count ?? 0,
            lead: sLead.count ?? 0,
            contacted: sContacted.count ?? 0,
            closed: sClosed.count ?? 0,
        },
        series,
    };
}
