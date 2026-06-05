import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const client = await getClientById(params.id);
        if (!client) {
            return NextResponse.json(
                { success: false, message: 'Client not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const client = await updateClient(params.id, {
            name: body.name,
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
                : 'Failed to update client';
        return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await deleteClient(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed' },
            { status: 500 }
        );
    }
}
