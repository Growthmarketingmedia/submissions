'use client';

import Link from 'next/link';
import { Client } from '@/lib/types';
import { ExternalLink, FileText, Clock } from 'lucide-react';

export default function ClientCard({ client }: { client: Client }) {
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
        <Link href={`/submissions/${client.id}`}>
            <div className="glass-card fade-in" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {client.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.logoUrl} alt="" className="avatar" />
                    ) : (
                        <div className="avatar">{client.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                marginBottom: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {client.name}
                        </h3>
                        {client.websiteUrl && (
                            <a
                                href={client.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '13px',
                                }}
                            >
                                <ExternalLink size={13} />
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '180px',
                                    }}
                                >
                                    {client.websiteUrl.replace(/^https?:\/\//, '')}
                                </span>
                            </a>
                        )}
                    </div>
                    <span className={`badge badge-status badge-${client.status}`}>{client.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} style={{ color: 'var(--primary)' }} />
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 700 }}>
                                {client.submissionCount ?? 0}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Submissions
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} style={{ color: 'var(--accent)' }} />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>
                                {formatDate(client.lastSubmission)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Last submission
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
