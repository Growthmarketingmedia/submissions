import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission, generateId } from '@/lib/storage';
import { Submission, SubmissionResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.websiteName || !body.websiteUrl || !body.formData) {
            return NextResponse.json<SubmissionResponse>(
                {
                    success: false,
                    message: 'Missing required fields: websiteName, websiteUrl, formData',
                },
                { status: 400 }
            );
        }

        // Create submission object
        const submission: Submission = {
            id: generateId(),
            websiteName: body.websiteName,
            websiteUrl: body.websiteUrl,
            timestamp: new Date().toISOString(),
            formData: body.formData,
            metadata: {
                userAgent: request.headers.get('user-agent') || undefined,
                referrer: request.headers.get('referer') || undefined,
            },
        };

        // Save to file system
        await saveSubmission(submission);

        return NextResponse.json<SubmissionResponse>(
            {
                success: true,
                message: 'Submission received successfully',
                submissionId: submission.id,
            },
            {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        );
    } catch (error) {
        console.error('Error processing submission:', error);
        return NextResponse.json<SubmissionResponse>(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
