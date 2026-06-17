'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Client, OverviewData } from '@/lib/types';
import ClientCard from '@/components/WebsiteCard';
import Chart from '@/components/Chart';
import { Users, FileText, MailOpen, CalendarClock, ArrowRight, Inbox, ShieldAlert, Search } from 'lucide-react';

export default function HomePage() {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rescanning, setRescanning] = useState(false);
    const [clientQuery, setClientQuery] = useState('');

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [oRes, cRes] = await Promise.all([
                fetch('/api/overview'),
                fetch('/api/clients'),
            ]);
            const o = await oRes.json();
            const c = await cRes.json();
            if (o.success) setOverview(o.data);
            else setError(o.message || 'Failed to load overview');
            if (c.success) setClients(c.data);
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const rescanSpam = async () => {
        setRescanning(true);
        try {
            const res = await fetch('/api/admin/retag-spam', { method: 'POST' });
            const data = await res.json();
            if (data.success) await load();
        } catch {
            // ignore
        } finally {
            setRescanning(false);
        }
    };

    const unassigned = overview?.perClient.find((p) => p.clientId === null);

    const cq = clientQuery.trim().toLowerCase();
    const visibleClients = cq
        ? clients.filter(
              (c) =>
                  c.name.toLowerCase().includes(cq) ||
                  (c.websiteUrl || '').toLowerCase().includes(cq) ||
                  (c.contactName || '').toLowerCase().includes(cq) ||
                  (c.contactEmail || '').toLowerCase().includes(cq)
          )
        : clients;

    const kpis = [
        { icon: Users, label: 'Clients', value: overview?.totalClients ?? 0, color: 'var(--primary)' },
        { icon: FileText, label: 'Total Submissions', value: overview?.totalSubmissions ?? 0, color: 'var(--primary)' },
        { icon: MailOpen, label: 'Unread', value: overview?.unread ?? 0, color: 'var(--warning)' },
        { icon: CalendarClock, label: 'Last 7 Days', value: overview?.thisWeek ?? 0, color: 'var(--primary)' },
        { icon: ShieldAlert, label: 'Spam', value: overview?.spam ?? 0, color: 'var(--error)' },
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>Overview</h1>
                        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                            All your clients and their submissions in one place
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={rescanSpam} disabled={rescanning}>
                        <ShieldAlert size={16} /> {rescanning ? 'Scanning…' : 'Re-scan spam'}
                    </button>
                </div>

                {error && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)', marginBottom: '24px' }}>
                        <p style={{ color: 'var(--error)' }}>{error}</p>
                        <button onClick={load} className="btn btn-primary" style={{ marginTop: '16px' }}>Retry</button>
                    </div>
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            {kpis.map((k) => (
                                <div key={k.label} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <k.icon size={22} style={{ color: k.color }} />
                                    </div>
                                    <div>
                                        <div className="stat-num">{k.value}</div>
                                        <div className="stat-label">{k.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="glass-card" style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Submissions over time</h3>
                            <Chart data={overview?.series ?? []} />
                        </div>

                        {/* Clients */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 600 }}>Clients</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search clients…"
                                        value={clientQuery}
                                        onChange={(e) => setClientQuery(e.target.value)}
                                        style={{ width: 220, paddingLeft: 36 }}
                                    />
                                </div>
                                <Link href="/clients" className="btn btn-secondary" style={{ padding: '8px 14px' }}>
                                    Manage clients <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {clients.length === 0 && !unassigned && (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', marginBottom: '32px' }}>
                                <Users size={44} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No clients yet</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                    Add your first client to start collecting submissions.
                                </p>
                                <Link href="/clients" className="btn btn-primary">Add a client</Link>
                            </div>
                        )}

                        {(clients.length > 0 || unassigned) && (
                            <>
                                {cq && visibleClients.length === 0 && (
                                    <div className="glass-card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                                        No clients match your search.
                                    </div>
                                )}
                                {(visibleClients.length > 0 || (!cq && unassigned && unassigned.count > 0)) && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                                        {visibleClients.map((c) => (
                                            <ClientCard key={c.id} client={c} />
                                        ))}
                                        {!cq && unassigned && unassigned.count > 0 && (
                                            <Link href="/submissions/unassigned">
                                                <div className="glass-card fade-in" style={{ height: '100%', borderStyle: 'dashed' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                        <div className="avatar" style={{ color: 'var(--warning)' }}><Inbox size={20} /></div>
                                                        <div>
                                                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Unassigned</h3>
                                                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Not matched to a client</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{unassigned.count}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Submissions</div>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
