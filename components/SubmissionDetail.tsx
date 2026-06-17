'use client';

import { useState } from 'react';
import { Submission, SubmissionStatus } from '@/lib/types';
import { X, Copy, Calendar, Mail, Phone, User, Check } from 'lucide-react';

interface SubmissionDetailProps {
    submission: Submission;
    onClose: () => void;
    onUpdated?: (updated: Submission) => void;
}

const STATUSES: SubmissionStatus[] = ['new', 'contacted', 'closed'];

export default function SubmissionDetail({ submission, onClose, onUpdated }: SubmissionDetailProps) {
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<SubmissionStatus>(submission.status);
    const [isRead, setIsRead] = useState<boolean>(submission.isRead);
    const [isSpam, setIsSpam] = useState<boolean>(submission.isSpam);
    const [notes, setNotes] = useState<string>(submission.notes ?? '');
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    const patch = async (body: Record<string, any>) => {
        const res = await fetch(`/api/submissions/${submission.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok && data.success && onUpdated) onUpdated(data.data);
        return data;
    };

    const changeStatus = async (s: SubmissionStatus) => {
        setStatus(s);
        setBusy(true);
        try {
            await patch({ status: s });
        } finally {
            setBusy(false);
        }
    };

    const toggleRead = async () => {
        const next = !isRead;
        setIsRead(next);
        setBusy(true);
        try {
            await patch({ isRead: next });
        } finally {
            setBusy(false);
        }
    };

    const toggleSpam = async () => {
        const next = !isSpam;
        setIsSpam(next);
        setBusy(true);
        try {
            await patch({ isSpam: next });
        } finally {
            setBusy(false);
        }
    };

    const saveNotes = async () => {
        setSavingNotes(true);
        setNotesSaved(false);
        try {
            await patch({ notes });
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2000);
        } finally {
            setSavingNotes(false);
        }
    };

    const formatDate = (s: string) =>
        new Date(s).toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(submission, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fieldIcon = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('email')) return <Mail size={16} />;
        if (k.includes('phone')) return <Phone size={16} />;
        if (k.includes('name')) return <User size={16} />;
        if (k.includes('date')) return <Calendar size={16} />;
        return null;
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
            }}
        >
            <div
                className="glass-card"
                style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Submission Details</h2>
                            {isSpam && <span className="badge badge-spam">spam</span>}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {(submission.clientName || submission.websiteName)} · {formatDate(submission.timestamp)}
                        </p>
                    </div>
                    <button className="icon-btn danger" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Workflow panel */}
                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--surface)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Status
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        disabled={busy}
                                        onClick={() => changeStatus(s)}
                                        className={`badge badge-status badge-${s}`}
                                        style={{
                                            cursor: 'pointer',
                                            border: status === s ? '1px solid currentColor' : '1px solid transparent',
                                            opacity: status === s ? 1 : 0.55,
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Read
                                </div>
                                <button className="btn btn-secondary" onClick={toggleRead} disabled={busy} style={{ padding: '8px 14px' }}>
                                    {isRead ? 'Mark unread' : 'Mark read'}
                                </button>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Spam
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={toggleSpam}
                                    disabled={busy}
                                    style={{ padding: '8px 14px', color: isSpam ? 'var(--error)' : undefined, borderColor: isSpam ? 'var(--error)' : undefined }}
                                >
                                    {isSpam ? 'Not spam' : 'Mark spam'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {isSpam && submission.spamReason && (
                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Why flagged: {submission.spamReason}
                        </div>
                    )}
                </div>

                {/* Meta */}
                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--surface)', borderRadius: '10px', display: 'grid', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Website URL</div>
                        <a href={submission.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                            {submission.websiteUrl}
                        </a>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Submission ID</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>{submission.id}</div>
                    </div>
                </div>

                {/* Form data */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Form Data</h3>
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {Object.entries(submission.formData).map(([key, value]) => (
                            <div key={key} style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {fieldIcon(key)}
                                    {key}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 500, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Notes</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add internal notes about this lead…"
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                    <div style={{ marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={saveNotes} disabled={savingNotes}>
                            {notesSaved ? <Check size={16} /> : null}
                            {savingNotes ? 'Saving…' : notesSaved ? 'Saved' : 'Save notes'}
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={copyJSON} className="btn btn-primary">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
}
