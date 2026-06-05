'use client';

import { format, parseISO } from 'date-fns';

interface ChartProps {
    data: { date: string; count: number }[];
    height?: number;
}

// Dependency-free inline SVG bar chart for the submissions-over-time series.
export default function Chart({ data, height = 160 }: ChartProps) {
    if (!data || data.length === 0) {
        return (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
                No data yet
            </div>
        );
    }

    const max = Math.max(1, ...data.map((d) => d.count));
    const barW = 14;
    const gap = 6;
    const W = data.length * (barW + gap);
    const H = height;

    const safeFormat = (iso: string) => {
        try {
            return format(parseISO(iso), 'MMM d');
        } catch {
            return iso;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Last {data.length} days
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Peak: <strong style={{ color: 'var(--text)' }}>{max}</strong>
                </span>
            </div>
            <svg
                width="100%"
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ display: 'block' }}
            >
                {data.map((d, i) => {
                    const h = Math.round((d.count / max) * (H - 6));
                    const barH = d.count > 0 ? Math.max(h, 2) : 0;
                    const x = i * (barW + gap);
                    const y = H - barH;
                    return (
                        <g key={d.date}>
                            <rect x={x} y={y} width={barW} height={barH} rx={2} fill="var(--primary)" />
                            <title>{`${safeFormat(d.date)}: ${d.count}`}</title>
                        </g>
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {safeFormat(data[0].date)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {safeFormat(data[data.length - 1].date)}
                </span>
            </div>
        </div>
    );
}
