'use client';

import { useEffect, useState } from 'react';
import { Website } from '@/lib/types';
import WebsiteCard from '@/components/WebsiteCard';
import { Database, TrendingUp } from 'lucide-react';

export default function HomePage() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/websites');
            const data = await response.json();

            if (data.success) {
                setWebsites(data.data);
            } else {
                setError(data.message || 'Failed to fetch websites');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalSubmissions = websites.reduce((sum, w) => sum + w.submissionCount, 0);

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <h1
                        className="gradient-text"
                        style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}
                    >
                        Form Submissions Dashboard
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                        Centralized submission management for all your websites
                    </p>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '24px',
                        marginBottom: '48px',
                    }}
                >
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <Database size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
                            {websites.length}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Active Websites
                        </div>
                    </div>

                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <TrendingUp size={32} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
                            {totalSubmissions}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Total Submissions
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div
                        className="glass-card"
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'var(--error)',
                        }}
                    >
                        <p style={{ color: 'var(--error)', fontSize: '16px' }}>{error}</p>
                        <button
                            onClick={fetchWebsites}
                            className="btn btn-primary"
                            style={{ marginTop: '16px' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Websites Grid */}
                {!loading && !error && websites.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Database size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No submissions yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Start receiving form submissions from your websites
                        </p>
                    </div>
                )}

                {!loading && !error && websites.length > 0 && (
                    <>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                            Your Websites
                        </h2>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '24px',
                            }}
                        >
                            {websites.map((website) => (
                                <WebsiteCard key={website.name} website={website} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
