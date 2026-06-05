import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scoreSpam } from '@/lib/spam';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Re-scan all submissions and tag spam (additive: never un-tags a manual decision).
// Protected by middleware (admin cookie required). Safe to run repeatedly.
export async function POST() {
    try {
        const supabase = supabaseAdmin();
        const { data, error } = await supabase
            .from('submissions')
            .select('id, form_data, is_spam')
            .limit(100000);
        if (error) throw error;

        let scanned = 0;
        let tagged = 0;
        for (const row of data ?? []) {
            scanned++;
            if (row.is_spam) continue; // preserve existing / manual decisions
            const res = scoreSpam(row.form_data || {});
            if (res.isSpam) {
                const { error: uerr } = await supabase
                    .from('submissions')
                    .update({ is_spam: true, spam_reason: res.reason })
                    .eq('id', row.id);
                if (!uerr) tagged++;
            }
        }

        return NextResponse.json({ success: true, scanned, tagged });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed' },
            { status: 500 }
        );
    }
}
