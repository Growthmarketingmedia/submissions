import { NextResponse } from 'next/server';
import { getWebsites } from '@/lib/storage';

export async function GET() {
    try {
        const websites = await getWebsites();

        return NextResponse.json({
            success: true,
            data: websites,
            count: websites.length,
        });
    } catch (error) {
        console.error('Error fetching websites:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch websites',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
