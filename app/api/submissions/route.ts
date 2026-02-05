import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/storage';
import { FilterOptions } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const filters: FilterOptions = {
            website: searchParams.get('website') || undefined,
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            search: searchParams.get('search') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '50'),
        };

        const submissions = await getSubmissions(filters);

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
