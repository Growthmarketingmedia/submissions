'use client';

import { useState } from 'react';
import { Client } from '@/lib/types';
import { X, Copy, Check } from 'lucide-react';

export default function EmbedSnippet({ client, onClose }: { client: Client; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    const origin =
        process.env.NEXT_PUBLIC_APP_ORIGIN ||
        (typeof window !== 'undefined' ? window.location.origin : '');

    const snippet = `<script>
// Call this from your form's submit handler. Pass an object of your form fields.
async function sendToDashboard(formData) {
  await fetch("${origin}/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      websiteName: ${JSON.stringify(client.name)},
      websiteUrl: ${JSON.stringify(client.websiteUrl || '')},
      formData: formData
    })
  });
}
</script>`;

    const copy = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Embed snippet</h2>
                    <button className="icon-btn" onClick={onClose}><X size={18} /></button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '18px' }}>
                    Paste this into <strong>{client.name}</strong>&apos;s website and call{' '}
                    <code style={{ color: 'var(--primary)' }}>sendToDashboard(formData)</code> when their form is submitted.
                </p>

                <pre
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '16px',
                        overflowX: 'auto',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                        color: 'var(--text)',
                        whiteSpace: 'pre',
                    }}
                >
                    {snippet}
                </pre>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={copy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy snippet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
