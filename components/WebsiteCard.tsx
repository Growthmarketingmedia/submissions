'use client';

import Link from 'next/link';
import { Website } from '@/lib/types';
import { ExternalLink, FileText, Clock } from 'lucide-react';

interface WebsiteCardProps {
    website: Website;
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No submissions yet';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Link href={`/submissions/${encodeURIComponent(website.name)}`}>
            <div className="glass-card fade-in">
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                        {website.name}
                    </h3>
                    {website.url && (
                        <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                transition: 'color 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                            <ExternalLink size={14} />
                            {website.url}
                        </a>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700' }}>
                                {website.submissionCount}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Submissions
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} style={{ color: 'var(--accent)' }} />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                {formatDate(website.lastSubmission)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Last Submission
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
