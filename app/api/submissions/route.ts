import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/queries';
import { SubmissionStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams;

        const status = (sp.get('status') as SubmissionStatus | null) || undefined;

        const startDate = sp.get('startDate') || undefined;
        let endDate = sp.get('endDate') || undefined;
        // bare YYYY-MM-DD end date -> include the whole day
        if (endDate && endDate.length <= 10) endDate = `${endDate}T23:59:59.999`;

        const limitRaw = sp.get('limit') ? parseInt(sp.get('limit')!, 10) : NaN;
        const offsetRaw = sp.get('offset') ? parseInt(sp.get('offset')!, 10) : NaN;

        const spamParam = sp.get('spam');
        const spam =
            spamParam === 'hide' || spamParam === 'only' || spamParam === 'all'
                ? spamParam
                : undefined;

        const { rows, count } = await getSubmissions({
            clientId: sp.get('client') || undefined,
            unassigned: sp.get('unassigned') === '1',
            status,
            unreadOnly: sp.get('unread') === '1',
            spam,
            startDate,
            endDate,
            search: sp.get('search') || undefined,
            limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
            offset: Number.isFinite(offsetRaw) ? offsetRaw : undefined,
        });

        return NextResponse.json({ success: true, data: rows, count });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch submissions',
            },
            { status: 500 }
        );
    }
}
