import { NextRequest, NextResponse } from 'next/server';
import { getClientStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams;
        const unassigned = sp.get('unassigned') === '1';
        const client = sp.get('client');

        if (!unassigned && !client) {
            return NextResponse.json(
                { success: false, message: 'client or unassigned is required' },
                { status: 400 }
            );
        }

        const data = await getClientStats(unassigned ? null : client, unassigned, 30);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to load stats' },
            { status: 500 }
        );
    }
}
