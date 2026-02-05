'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Submission } from '@/lib/types';
import SubmissionDetail from '@/components/SubmissionDetail';
import { ArrowLeft, Search, Calendar, Download, Filter } from 'lucide-react';

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const websiteName = decodeURIComponent(params.website as string);

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, [websiteName]);

    useEffect(() => {
        applyFilters();
    }, [submissions, searchQuery, startDate, endDate]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/submissions?website=${encodeURIComponent(websiteName)}`);
            const data = await response.json();

            if (data.success) {
                setSubmissions(data.data);
            } else {
                setError(data.message || 'Failed to fetch submissions');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...submissions];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((sub) =>
                JSON.stringify(sub.formData).toLowerCase().includes(query)
            );
        }

        // Date filters
        if (startDate) {
            filtered = filtered.filter(
                (sub) => new Date(sub.timestamp) >= new Date(startDate)
            );
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            filtered = filtered.filter(
                (sub) => new Date(sub.timestamp) <= endDateTime
            );
        }

        setFilteredSubmissions(filtered);
    };

    const exportToCSV = () => {
        if (filteredSubmissions.length === 0) return;

        // Get all unique keys from form data
        const allKeys = new Set<string>();
        filteredSubmissions.forEach((sub) => {
            Object.keys(sub.formData).forEach((key) => allKeys.add(key));
        });

        const headers = ['Timestamp', 'Submission ID', ...Array.from(allKeys)];
        const rows = filteredSubmissions.map((sub) => {
            const row = [
                new Date(sub.timestamp).toLocaleString(),
                sub.id,
                ...Array.from(allKeys).map((key) => sub.formData[key] || ''),
            ];
            return row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${websiteName}-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPreviewData = (formData: Record<string, any>) => {
        const entries = Object.entries(formData);
        if (entries.length === 0) return 'No data';

        const preview = entries
            .slice(0, 3)
            .map(([key, value]) => `${key}: ${String(value).substring(0, 30)}`)
            .join(' • ');

        return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-secondary"
                        style={{ marginBottom: '16px' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                    <h1 className="gradient-text" style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
                        {websiteName}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
                        {filteredSubmissions.length !== submissions.length && ` (filtered from ${submissions.length})`}
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Filter size={20} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Filters</h3>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                <Search size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search in submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="btn btn-secondary"
                        >
                            Clear Filters
                        </button>
                        <button onClick={exportToCSV} className="btn btn-primary" disabled={filteredSubmissions.length === 0}>
                            <Download size={16} />
                            Export CSV
                        </button>
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
                    </div>
                )}

                {/* Submissions Table */}
                {!loading && !error && filteredSubmissions.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No submissions found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {submissions.length > 0 ? 'Try adjusting your filters' : 'No submissions yet for this website'}
                        </p>
                    </div>
                )}

                {!loading && !error && filteredSubmissions.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Preview</th>
                                    <th>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.map((submission) => (
                                    <tr
                                        key={submission.id}
                                        onClick={() => setSelectedSubmission(submission)}
                                    >
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            {formatDate(submission.timestamp)}
                                        </td>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getPreviewData(submission.formData)}
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {submission.id.substring(0, 8)}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Submission Detail Modal */}
                {selectedSubmission && (
                    <SubmissionDetail
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                    />
                )}
            </div>
        </div>
    );
}
