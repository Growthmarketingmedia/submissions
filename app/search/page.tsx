'use client';

import { useEffect, useState, useCallback } from 'react';
import { Submission, Client, SubmissionStatus } from '@/lib/types';
import SubmissionDetail from '@/components/SubmissionDetail';
import { submissionsToCSV, downloadCSV } from '@/lib/csv';
import { Search, Download, Filter } from 'lucide-react';

const LIMIT = 200;

export default function SearchPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [rows, setRows] = useState<Submission[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Submission | null>(null);

    const [search, setSearch] = useState('');
    const [clientId, setClientId] = useState('');
    const [status, setStatus] = useState<SubmissionStatus | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [spamFilter, setSpamFilter] = useState<'all' | 'hide' | 'only'>('all');

    useEffect(() => {
        fetch('/api/clients')
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setClients(d.data);
            })
            .catch(() => {});
    }, []);

    const run = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const p = new URLSearchParams();
            if (search) p.set('search', search);
            if (clientId === 'unassigned') p.set('unassigned', '1');
            else if (clientId) p.set('client', clientId);
            if (status) p.set('status', status);
            if (startDate) p.set('startDate', startDate);
            if (endDate) p.set('endDate', endDate);
            if (spamFilter !== 'all') p.set('spam', spamFilter);
            p.set('limit', String(LIMIT));

            const res = await fetch(`/api/submissions?${p.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRows(data.data);
                setCount(data.count);
            } else {
                setError(data.message || 'Search failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [search, clientId, status, startDate, endDate, spamFilter]);

    useEffect(() => {
        const t = setTimeout(run, 250);
        return () => clearTimeout(t);
    }, [run]);

    const onUpdated = (u: Submission) => {
        setRows((prev) => prev.map((x) => (x.id === u.id ? u : x)));
        setSelected((cur) => (cur && cur.id === u.id ? u : cur));
    };

    const exportCSV = () => {
        if (!rows.length) return;
        downloadCSV(
            `submissions-${new Date().toISOString().split('T')[0]}.csv`,
            submissionsToCSV(rows, { includeClient: true })
        );
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const previewData = (formData: Record<string, any>) => {
        const entries = Object.entries(formData || {});
        if (entries.length === 0) return 'No data';
        const p = entries.slice(0, 3).map(([k, v]) => `${k}: ${String(v).substring(0, 28)}`).join(' • ');
        return p.length > 100 ? p.substring(0, 100) + '…' : p;
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '28px' }}>
                    <h1 className="gradient-text" style={{ fontSize: '40px', fontWeight: 700, marginBottom: '8px' }}>
                        Search
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                        Search and export across every client
                    </p>
                </div>

                <div className="glass-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Filter size={20} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Filters</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                <Search size={14} style={{ display: 'inline', marginRight: '4px' }} /> Search
                            </label>
                            <input type="text" placeholder="Search all submissions…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Client</label>
                            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                                <option value="">All clients</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus | '')}>
                                <option value="">All statuses</option>
                                <option value="new">New</option>
                                <option value="lead">Lead</option>
                                <option value="contacted">Contacted</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Spam</label>
                            <select value={spamFilter} onChange={(e) => setSpamFilter(e.target.value as 'all' | 'hide' | 'only')}>
                                <option value="all">Show all</option>
                                <option value="hide">Hide spam</option>
                                <option value="only">Spam only</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Start date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>End date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => { setSearch(''); setClientId(''); setStatus(''); setStartDate(''); setEndDate(''); setSpamFilter('all'); }}
                            className="btn btn-secondary"
                        >
                            Clear
                        </button>
                        <button onClick={exportCSV} className="btn btn-primary" disabled={rows.length === 0} style={{ marginLeft: 'auto' }}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    {count} result{count !== 1 ? 's' : ''}
                    {count > rows.length ? ` (showing first ${rows.length})` : ''}
                </p>

                {error && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)' }}>
                        <p style={{ color: 'var(--error)' }}>{error}</p>
                    </div>
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!loading && !error && rows.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No submissions found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try a different search or filters</p>
                    </div>
                )}

                {!loading && !error && rows.length > 0 && (
                    <div className="table-wrap">
                        <table className="leads">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px' }}></th>
                                    <th>Date &amp; Time</th>
                                    <th>Client</th>
                                    <th>Preview</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((s) => (
                                    <tr key={s.id} className={!s.isRead ? 'row-unread' : ''} onClick={() => setSelected(s)}>
                                        <td>{!s.isRead && <span className="unread-dot" />}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(s.timestamp)}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{s.clientName || s.websiteName}</td>
                                        <td style={{ maxWidth: '420px' }}>
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
