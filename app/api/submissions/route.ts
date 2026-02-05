import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/storage';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const websiteName = searchParams.get('website') || undefined;
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
        const searchQuery = searchParams.get('search') || undefined;

        const submissions = await getSubmissions(websiteName, startDate, endDate, searchQuery);

        return NextResponse.json({
            success: true,
            data: submissions,
            count: submissions.length,
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch submissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
