import { Submission } from './types';

// Build a CSV from submissions, unioning all form-data keys.
// Set includeClient for cross-client exports (adds a Client column).
export function submissionsToCSV(
    submissions: Submission[],
    opts: { includeClient?: boolean } = {}
): string {
    if (submissions.length === 0) return '';
    const includeClient = !!opts.includeClient;

    const keys = new Set<string>();
    submissions.forEach((s) =>
        Object.keys(s.formData || {}).forEach((k) => keys.add(k))
    );
    const formKeys = Array.from(keys);

    const headers = [
        'Timestamp',
        ...(includeClient ? ['Client'] : []),
        'Status',
        'Submission ID',
        ...formKeys,
    ];

    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = submissions.map((s) => {
        const cells = [
            new Date(s.timestamp).toLocaleString(),
            ...(includeClient ? [s.clientName || s.websiteName || 'Unassigned'] : []),
            s.status,
            s.id,
            ...formKeys.map((k) => {
                const v = s.formData?.[k];
                return typeof v === 'object' && v !== null ? JSON.stringify(v) : v ?? '';
            }),
        ];
        return cells.map(esc).join(',');
    });

    return [headers.map(esc).join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csv: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
