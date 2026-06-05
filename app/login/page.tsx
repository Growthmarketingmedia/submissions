'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const next =
                    new URLSearchParams(window.location.search).get('next') || '/';
                router.push(next);
                router.refresh();
            } else {
                setError(data.message || 'Invalid password');
            }
        } catch {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: 'var(--surface-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        <Lock size={26} style={{ color: 'var(--text)' }} />
                    </div>
                    <h1
                        className="gradient-text"
                        style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}
                    >
                        Dashboard Login
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Enter your admin password to continue
                    </p>
                </div>

                <form onSubmit={submit}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '14px',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                        style={{ marginBottom: '16px' }}
                    />

                    {error && (
                        <p
                            style={{
                                color: 'var(--error)',
                                fontSize: '14px',
                                marginBottom: '16px',
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !password}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
