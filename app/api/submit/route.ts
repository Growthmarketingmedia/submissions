import { NextRequest, NextResponse } from 'next/server';
import { insertSubmission } from '@/lib/queries';
import { scoreSpam } from '@/lib/spam';
import { SubmissionResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Public ingestion endpoint. Client websites POST here from the browser, so it
// must stay open (no auth) and keep permissive CORS. Contract is unchanged:
//   body: { websiteName, websiteUrl, formData }
//   200:  { success, message, submissionId }
const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.websiteName || !body.websiteUrl || !body.formData) {
            return NextResponse.json<SubmissionResponse>(
                {
                    success: false,
                    message: 'Missing required fields: websiteName, websiteUrl, formData',
                },
                { status: 400, headers: CORS }
            );
        }

        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

        const spam = scoreSpam(body.formData);

        const submissionId = await insertSubmission({
            websiteName: body.websiteName,
            websiteUrl: body.websiteUrl,
            formData: body.formData,
            metadata: {
                userAgent: request.headers.get('user-agent') || undefined,
                referrer: request.headers.get('referer') || undefined,
                ip,
            },
            isSpam: spam.isSpam,
            spamReason: spam.reason,
        });

        return NextResponse.json<SubmissionResponse>(
            {
                success: true,
                message: 'Submission received successfully',
                submissionId,
            },
            { status: 200, headers: CORS }
        );
    } catch (error) {
        console.error('Error processing submission:', error);
        return NextResponse.json<SubmissionResponse>(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500, headers: CORS }
        );
    }
}

// CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS });
}
