'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Submission, Client, SubmissionStatus, ClientStats } from '@/lib/types';
import SubmissionDetail from '@/components/SubmissionDetail';
import Chart from '@/components/Chart';
import { submissionsToCSV, downloadCSV } from '@/lib/csv';
import { ArrowLeft, Search, Calendar, Download, Filter } from 'lucide-react';

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as string;
    const isUnassigned = clientId === 'unassigned';

    const [client, setClient] = useState<Client | null>(null);
    const [stats, setStats] = useState<ClientStats | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Submission | null>(null);

    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<SubmissionStatus | ''>('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [spamFilter, setSpamFilter] = useState<'all' | 'hide' | 'only'>('all');

    // Client header + analytics
    useEffect(() => {
        if (!isUnassigned) {
            fetch(`/api/clients/${clientId}`)
                .then((r) => r.json())
                .then((d) => {
                    if (d.success) setClient(d.data);
                })
                .catch(() => {});
        }
        const p = new URLSearchParams();
        if (isUnassigned) p.set('unassigned', '1');
        else p.set('client', clientId);
        fetch(`/api/stats?${p.toString()}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setStats(d.data);
            })
            .catch(() => {});
    }, [clientId, isUnassigned]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const p = new URLSearchParams();
            if (isUnassigned) p.set('unassigned', '1');
            else p.set('client', clientId);
            if (search) p.set('search', search);
            if (startDate) p.set('startDate', startDate);
            if (endDate) p.set('endDate', endDate);
            if (status) p.set('status', status);
            if (unreadOnly) p.set('unread', '1');
            if (spamFilter !== 'all') p.set('spam', spamFilter);

            const res = await fetch(`/api/submissions?${p.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSubmissions(data.data);
                setCount(data.count);
            } else {
                setError(data.message || 'Failed to fetch submissions');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [clientId, isUnassigned, search, startDate, endDate, status, unreadOnly, spamFilter]);

    useEffect(() => {
        const t = setTimeout(fetchData, 250);
        return () => clearTimeout(t);
    }, [fetchData]);

    const openSubmission = (s: Submission) => {
        setSelected(s);
        if (!s.isRead) {
            fetch(`/api/submissions/${s.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true }),
            })
                .then(() =>
                    setSubmissions((prev) =>
                        prev.map((x) => (x.id === s.id ? { ...x, isRead: true } : x))
                    )
                )
                .catch(() => {});
        }
    };

    const onUpdated = (updated: Submission) => {
        setSubmissions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setSelected((cur) => (cur && cur.id === updated.id ? updated : cur));
    };

    const exportCSV = () => {
        if (submissions.length === 0) return;
        const title = client?.name || (isUnassigned ? 'unassigned' : 'submissions');
        downloadCSV(
            `${title}-submissions-${new Date().toISOString().split('T')[0]}.csv`,
            submissionsToCSV(submissions)
        );
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    const previewData = (formData: Record<string, any>) => {
        const entries = Object.entries(formData || {});
        if (entries.length === 0) return 'No data';
        const p = entries.slice(0, 3).map(([k, v]) => `${k}: ${String(v).substring(0, 30)}`).join(' • ');
        return p.length > 110 ? p.substring(0, 110) + '…' : p;
    };

    const title = client?.name || (isUnassigned ? 'Unassigned' : 'Submissions');

    const statCards = stats
        ? [
              { label: 'Total', value: stats.total },
              { label: 'Unread', value: stats.unread },
              { label: 'New', value: stats.byStatus.new },
              { label: 'Contacted', value: stats.byStatus.contacted },
              { label: 'Closed', value: stats.byStatus.closed },
              { label: 'Spam', value: stats.spam },
          ]
        : [];

    return (
        <div style={{ minHeight: '100vh', padding: '32px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <button onClick={() => router.push('/')} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
                        <ArrowLeft size={16} /> Back to Overview
                    </button>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '6px' }}>{title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        {count} submission{count !== 1 ? 's' : ''}
                        {client?.websiteUrl ? ` · ${client.websiteUrl.replace(/^https?:\/\//, '')}` : ''}
                    </p>
                </div>

                {/* Analytics */}
                {stats && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                            {statCards.map((c) => (
                                <div key={c.label} className="glass-card" style={{ padding: '16px' }}>
                                    <div className="stat-num" style={{ fontSize: '24px' }}>{c.value}</div>
                                    <div className="stat-label">{c.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Submissions over time</h3>
                            <Chart data={stats.series} height={120} />
                        </div>
                    </>
                )}

                {/* Filters */}
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Filters</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                <Search size={13} style={{ display: 'inline', marginRight: '4px' }} /> Search
                            </label>
                            <input type="text" placeholder="Search submissions…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus | '')}>
                                <option value="">All statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Spam</label>
                            <select value={spamFilter} onChange={(e) => setSpamFilter(e.target.value as 'all' | 'hide' | 'only')}>
                                <option value="all">Show all</option>
                                <option value="hide">Hide spam</option>
                                <option value="only">Spam only</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> Start date
                            </label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> End date
                            </label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'auto' }}>
                            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                            <span style={{ fontSize: '14px' }}>Unread only</span>
                        </label>
                        <button
                            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setStatus(''); setUnreadOnly(false); setSpamFilter('all'); }}
                            className="btn btn-secondary"
                            style={{ marginLeft: 'auto' }}
                        >
                            Clear
                        </button>
                        <button onClick={exportCSV} className="btn btn-primary" disabled={submissions.length === 0}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', background: '#fdeceb', borderColor: 'var(--error)' }}>
                        <p style={{ color: 'var(--error)' }}>{error}</p>
                    </div>
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!loading && !error && submissions.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No submissions found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                    </div>
                )}

                {!loading && !error && submissions.length > 0 && (
                    <div className="table-wrap">
                        <table className="leads">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px' }}></th>
                                    <th>Date &amp; Time</th>
                                    <th>Preview</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr key={s.id} className={!s.isRead ? 'row-unread' : ''} onClick={() => openSubmission(s)}>
                                        <td>{!s.isRead && <span className="unread-dot" />}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(s.timestamp)}</td>
                                        <td style={{ maxWidth: '460px' }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {previewData(s.formData)}
                                            </div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <span className={`badge badge-status badge-${s.status}`}>{s.status}</span>
                                            {s.isSpam && <span className="badge badge-spam" style={{ marginLeft: 6 }}>spam</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selected && (
                    <SubmissionDetail submission={selected} onClose={() => setSelected(null)} onUpdated={onUpdated} />
                )}
            </div>
        </div>
    );
}
