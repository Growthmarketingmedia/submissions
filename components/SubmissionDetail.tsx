'use client';

import { useState } from 'react';
import { Submission } from '@/lib/types';
import { X, Download, Calendar, Mail, Phone, User } from 'lucide-react';

interface SubmissionDetailProps {
    submission: Submission;
    onClose: () => void;
}

export default function SubmissionDetail({ submission, onClose }: SubmissionDetailProps) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const copyToClipboard = () => {
        const text = JSON.stringify(submission, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getFieldIcon = (key: string) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('email')) return <Mail size={16} />;
        if (lowerKey.includes('phone')) return <Phone size={16} />;
        if (lowerKey.includes('name')) return <User size={16} />;
        if (lowerKey.includes('date')) return <Calendar size={16} />;
        return null;
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                            Submission Details
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {formatDate(submission.timestamp)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--surface-light)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-light)')}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Metadata */}
                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Website
                            </div>
                            <div style={{ fontWeight: '500' }}>{submission.websiteName}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                URL
                            </div>
                            <a
                                href={submission.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary)', wordBreak: 'break-all' }}
                            >
                                {submission.websiteUrl}
                            </a>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Submission ID
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{submission.id}</div>
                        </div>
                    </div>
                </div>

                {/* Form Data */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                        Form Data
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {Object.entries(submission.formData).map(([key, value]) => (
                            <div
                                key={key}
                                style={{
                                    padding: '16px',
                                    background: 'var(--surface)',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid var(--primary)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {getFieldIcon(key)}
                                    {key}
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '500', wordBreak: 'break-word' }}>
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={copyToClipboard} className="btn btn-primary">
                        <Download size={16} />
                        {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button onClick={onClose} className="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
