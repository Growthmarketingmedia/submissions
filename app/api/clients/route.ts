import { NextRequest, NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const data = await getClients();
        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to load clients',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
            return NextResponse.json(
                { success: false, message: 'Client name is required' },
                { status: 400 }
            );
        }
        const client = await createClient({
            name: body.name.trim(),
            websiteUrl: body.websiteUrl,
            logoUrl: body.logoUrl,
            contactName: body.contactName,
            contactEmail: body.contactEmail,
            contactPhone: body.contactPhone,
            status: body.status,
        });
        return NextResponse.json({ success: true, data: client });
    } catch (error: any) {
        const msg =
            error?.code === '23505'
                ? 'A client with that name already exists'
                : error instanceof Error
                ? error.message
                : 'Failed to create client';
        return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }
}
