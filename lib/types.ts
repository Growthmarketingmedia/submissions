export interface Submission {
    id: string;
    websiteName: string;
    websiteUrl: string;
    timestamp: string;
    formData: Record<string, any>;
    metadata?: {
        userAgent?: string;
        ip?: string;
        referrer?: string;
    };
}

export interface Website {
    name: string;
    url: string;
    submissionCount: number;
    lastSubmission?: string;
}

export interface FilterOptions {
    website?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface SubmissionResponse {
    success: boolean;
    message: string;
    submissionId?: string;
    error?: string;
}
