import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
    try {
        const { blobs } = await list();

        return NextResponse.json({
            success: true,
            blobCount: blobs.length,
            blobs: blobs.map(b => ({
                pathname: b.pathname,
                url: b.url,
                size: b.size,
            })),
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
