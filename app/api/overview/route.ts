import { NextResponse } from 'next/server';
import { getOverview } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const data = await getOverview(30);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to load overview',
            },
            { status: 500 }
        );
    }
}
