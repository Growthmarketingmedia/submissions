import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmission } from '@/lib/queries';
import { SubmissionStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUSES: SubmissionStatus[] = ['new', 'contacted', 'closed'];

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sub = await getSubmissionById(params.id);
        if (!sub) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: sub });
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
        const patch: {
            status?: SubmissionStatus;
            isRead?: boolean;
            isSpam?: boolean;
            notes?: string;
        } = {};

        if (body.status !== undefined) {
            if (!STATUSES.includes(body.status)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid status' },
                    { status: 400 }
                );
            }
            patch.status = body.status;
        }
        if (body.isRead !== undefined) patch.isRead = !!body.isRead;
        if (body.isSpam !== undefined) patch.isSpam = !!body.isSpam;
        if (body.notes !== undefined) patch.notes = String(body.notes);

        const sub = await updateSubmission(params.id, patch);
        return NextResponse.json({ success: true, data: sub });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed' },
            { status: 500 }
        );
    }
}
