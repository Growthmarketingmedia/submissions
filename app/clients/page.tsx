'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Client } from '@/lib/types';
import ClientForm from '@/components/ClientForm';
import EmbedSnippet from '@/components/EmbedSnippet';
import { Plus, Code2, Pencil, Trash2, Inbox } from 'lucide-react';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState<Client | 'new' | null>(null);
    const [embedFor, setEmbedFor] = useState<Client | null>(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/clients');
            const data = await res.json();
            if (data.success) setClients(data.data);
            else setError(data.message || 'Failed to load clients');
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const remove = async (c: Client) => {
        if (!confirm(`Delete "${c.name}"? Their submissions are kept but become Unassigned.`)) return;
        try {
            const res = await fetch(`/api/clients/${c.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) setClients((prev) => prev.filter((x) => x.id !== c.id));
            else alert(data.message || 'Failed to delete');
        } catch {
            alert('Failed to connect to server');
        }
    };

    const formatDate = (s?: string) =>
        s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '40px', fontWeight: 700, marginBottom: '8px' }}>
                            Clients
                        </h1>
                        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                            Register clients and grab their embed snippet
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setFormOpen('new')}>
                        <Plus size={18} /> Add client
                    </button>
                </div>

                {error && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)' }}>
                        <p style={{ color: 'var(--error)' }}>{error}</p>
                        <button onClick={load} className="btn btn-primary" style={{ marginTop: '16px' }}>Retry</button>
                    </div>
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!loading && !error && clients.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Inbox size={44} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No clients yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Add your first client to generate an embed snippet and start collecting leads.
                        </p>
                        <button className="btn btn-primary" onClick={() => setFormOpen('new')}>
                            <Plus size={18} /> Add client
                        </button>
                    </div>
                )}

                {!loading && !error && clients.length > 0 && (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Website</th>
                                    <th>Status</th>
                                    <th>Submissions</th>
                                    <th>Last</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c.id} style={{ cursor: 'default' }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {c.logoUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={c.logoUrl} alt="" className="avatar" style={{ width: 36, height: 36 }} />
                                                ) : (
                                                    <div className="avatar" style={{ width: 36, height: 36 }}>{c.name.charAt(0).toUpperCase()}</div>
                                                )}
                                                <Link href={`/submissions/${c.id}`} style={{ fontWeight: 600 }}>
                                                    {c.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {c.websiteUrl ? c.websiteUrl.replace(/^https?:\/\//, '') : '—'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-status badge-${c.status}`}>{c.status}</span>
                                        </td>
                                        <td>{c.submissionCount ?? 0}</td>
                                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(c.lastSubmission)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="icon-btn" title="Embed snippet" onClick={() => setEmbedFor(c)}>
                                                    <Code2 size={16} />
                                                </button>
                                                <button className="icon-btn" title="Edit" onClick={() => setFormOpen(c)}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="icon-btn danger" title="Delete" onClick={() => remove(c)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {formOpen && (
                <ClientForm
                    initial={formOpen === 'new' ? null : formOpen}
                    onClose={() => setFormOpen(null)}
                    onSaved={() => {
                        setFormOpen(null);
                        load();
                    }}
                />
            )}

            {embedFor && <EmbedSnippet client={embedFor} onClose={() => setEmbedFor(null)} />}
        </div>
    );
}
