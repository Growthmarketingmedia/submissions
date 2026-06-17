'use client';

import { useState } from 'react';
import { Client, ClientStatus } from '@/lib/types';
import { X } from 'lucide-react';

interface Props {
    initial?: Client | null;
    onClose: () => void;
    onSaved: (client: Client) => void;
}

export default function ClientForm({ initial, onClose, onSaved }: Props) {
    const editing = !!initial;
    const [name, setName] = useState(initial?.name ?? '');
    const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? '');
    const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '');
    const [contactName, setContactName] = useState(initial?.contactName ?? '');
    const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '');
    const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');
    const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'active');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Client name is required');
            return;
        }
        setSaving(true);
        setError(null);
        const payload = {
            name: name.trim(),
            websiteUrl: websiteUrl.trim() || null,
            logoUrl: logoUrl.trim() || null,
            contactName: contactName.trim() || null,
            contactEmail: contactEmail.trim() || null,
            contactPhone: contactPhone.trim() || null,
            status,
        };
        try {
            const res = await fetch(editing ? `/api/clients/${initial!.id}` : '/api/clients', {
                method: editing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.success) onSaved(data.data);
            else setError(data.message || 'Failed to save');
        } catch {
            setError('Failed to connect to server');
        } finally {
            setSaving(false);
        }
    };

    const labelStyle = { display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' } as const;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
            }}
        >
            <div
                className="glass-card"
                style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{editing ? 'Edit client' : 'Add client'}</h2>
                    <button className="icon-btn" onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={save}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Name *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optima Spray Foam" autoFocus />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Website URL</label>
                        <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://www.example.com" />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Logo URL</label>
                        <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={labelStyle}>Contact name</label>
                            <input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Contact email</label>
                            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={labelStyle}>Contact phone</label>
                            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '14px' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
