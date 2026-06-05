export type ClientStatus = 'active' | 'paused';
export type SubmissionStatus = 'new' | 'contacted' | 'closed';

export interface Client {
    id: string;
    name: string;
    websiteUrl?: string;
    ingestKey?: string;
    logoUrl?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    status: ClientStatus;
    submissionCount?: number;
    lastSubmission?: string;
    createdAt?: string;
}

export interface Submission {
    id: string;
    clientId?: string | null;
    clientName?: string | null;
    websiteName: string;
    websiteUrl: string;
    timestamp: string; // mapped from created_at
    formData: Record<string, any>;
    metadata?: {
        userAgent?: string;
        ip?: string;
        referrer?: string;
    };
    status: SubmissionStatus;
    isRead: boolean;
    isSpam: boolean;
    spamReason?: string | null;
    notes?: string;
}

// Kept for backward-compat with the legacy /api/websites response + WebsiteCard.
export interface Website {
    name: string;
    url: string;
    submissionCount: number;
    lastSubmission?: string;
}

export interface FilterOptions {
    client?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: SubmissionStatus;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface SubmissionResponse {
    success: boolean;
    message: string;
    submissionId?: string;
    error?: string;
}

export interface OverviewData {
    totalClients: number;
    totalSubmissions: number;
    unread: number;
    spam: number;
    thisWeek: number;
    series: { date: string; count: number }[];
    perClient: { clientId: string | null; name: string; count: number }[];
    recent: Submission[];
}

export interface ClientStats {
    total: number;
    unread: number;
    spam: number;
    thisWeek: number;
    byStatus: { new: number; contacted: number; closed: number };
    series: { date: string; count: number }[];
}
