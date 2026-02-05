import { put, list, del } from '@vercel/blob';
import { Submission, Website } from './types';

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Save submission to Vercel Blob
export async function saveSubmission(submission: Submission): Promise<void> {
    try {
        const filename = `${submission.websiteName}/${submission.timestamp}-${submission.id}.json`;

        console.log('Attempting to save blob:', filename);

        const result = await put(filename, JSON.stringify(submission, null, 2), {
            access: 'public',
            addRandomSuffix: false,
        });

        console.log('Blob saved successfully:', result.url);
    } catch (error) {
        console.error('Error saving to blob storage:', error);
        throw error; // Re-throw so the API returns an error
    }
}

// Get all submissions with filtering
export async function getSubmissions(
    websiteName?: string,
    startDate?: Date,
    endDate?: Date,
    searchQuery?: string
): Promise<Submission[]> {
    const prefix = websiteName ? `${websiteName}/` : '';
    const { blobs } = await list({ prefix });

    const submissions: Submission[] = [];

    for (const blob of blobs) {
        try {
            const response = await fetch(blob.url);
            const submission: Submission = await response.json();

            // Apply filters
            if (startDate && new Date(submission.timestamp) < startDate) continue;
            if (endDate && new Date(submission.timestamp) > endDate) continue;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchableText = JSON.stringify(submission.formData).toLowerCase();
                if (!searchableText.includes(query)) continue;
            }

            submissions.push(submission);
        } catch (error) {
            console.error(`Error reading blob ${blob.pathname}:`, error);
        }
    }

    // Sort by timestamp descending
    return submissions.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

// Get all websites with submission counts
export async function getWebsites(): Promise<Website[]> {
    const { blobs } = await list();

    const websiteMap = new Map<string, { count: number; lastSubmission: Date }>();

    for (const blob of blobs) {
        try {
            const response = await fetch(blob.url);
            const submission: Submission = await response.json();

            const existing = websiteMap.get(submission.websiteName);
            const submissionDate = new Date(submission.timestamp);

            if (!existing) {
                // First submission for this website
                websiteMap.set(submission.websiteName, {
                    count: 1,
                    lastSubmission: submissionDate,
                });
            } else {
                // Increment count and update last submission if newer
                websiteMap.set(submission.websiteName, {
                    count: existing.count + 1,
                    lastSubmission: submissionDate > existing.lastSubmission ? submissionDate : existing.lastSubmission,
                });
            }
        } catch (error) {
            console.error(`Error reading blob ${blob.pathname}:`, error);
        }
    }

    return Array.from(websiteMap.entries()).map(([name, data]) => ({
        name,
        url: '', // We don't store URL separately, it's in each submission
        submissionCount: data.count,
        lastSubmission: data.lastSubmission.toISOString(),
    }));
}

// Delete a submission
export async function deleteSubmission(websiteName: string, submissionId: string): Promise<void> {
    const { blobs } = await list({ prefix: `${websiteName}/` });

    for (const blob of blobs) {
        if (blob.pathname.includes(submissionId)) {
            await del(blob.url);
            return;
        }
    }

    throw new Error('Submission not found');
}
