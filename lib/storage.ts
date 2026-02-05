import fs from 'fs';
import path from 'path';
import { Submission, Website, FilterOptions } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'submissions');

// Ensure data directory exists
export function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Save a submission to file system
export async function saveSubmission(submission: Submission): Promise<void> {
    ensureDataDir();

    const websiteDir = path.join(DATA_DIR, sanitizeFilename(submission.websiteName));
    if (!fs.existsSync(websiteDir)) {
        fs.mkdirSync(websiteDir, { recursive: true });
    }

    const filename = `${submission.timestamp.replace(/:/g, '-')}-${submission.id}.json`;
    const filepath = path.join(websiteDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(submission, null, 2));
}

// Get all submissions with optional filters
export async function getSubmissions(filters?: FilterOptions): Promise<Submission[]> {
    ensureDataDir();

    const submissions: Submission[] = [];

    // Determine which directories to read
    const websiteDirs = filters?.website
        ? [path.join(DATA_DIR, sanitizeFilename(filters.website))]
        : fs.readdirSync(DATA_DIR).map(dir => path.join(DATA_DIR, dir));

    // Read all submission files
    for (const websiteDir of websiteDirs) {
        if (!fs.existsSync(websiteDir) || !fs.statSync(websiteDir).isDirectory()) {
            continue;
        }

        const files = fs.readdirSync(websiteDir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(websiteDir, file), 'utf-8');
                const submission: Submission = JSON.parse(content);
                submissions.push(submission);
            } catch (error) {
                console.error(`Error reading submission file ${file}:`, error);
            }
        }
    }

    // Apply filters
    let filtered = submissions;

    if (filters?.startDate) {
        filtered = filtered.filter(s => new Date(s.timestamp) >= new Date(filters.startDate!));
    }

    if (filters?.endDate) {
        filtered = filtered.filter(s => new Date(s.timestamp) <= new Date(filters.endDate!));
    }

    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(s =>
            JSON.stringify(s.formData).toLowerCase().includes(searchLower) ||
            s.websiteName.toLowerCase().includes(searchLower)
        );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filtered = filtered.slice(start, end);
    }

    return filtered;
}

// Get list of all websites with submission counts
export async function getWebsites(): Promise<Website[]> {
    ensureDataDir();

    const websites: Website[] = [];

    if (!fs.existsSync(DATA_DIR)) {
        return websites;
    }

    const dirs = fs.readdirSync(DATA_DIR);

    for (const dir of dirs) {
        const websiteDir = path.join(DATA_DIR, dir);
        if (!fs.statSync(websiteDir).isDirectory()) continue;

        const files = fs.readdirSync(websiteDir).filter(f => f.endsWith('.json'));

        if (files.length === 0) continue;

        // Get the most recent submission
        let lastSubmission: string | undefined;
        let websiteUrl = '';

        try {
            const latestFile = files.sort().reverse()[0];
            const content = fs.readFileSync(path.join(websiteDir, latestFile), 'utf-8');
            const submission: Submission = JSON.parse(content);
            lastSubmission = submission.timestamp;
            websiteUrl = submission.websiteUrl;
        } catch (error) {
            console.error(`Error reading latest submission for ${dir}:`, error);
        }

        websites.push({
            name: dir,
            url: websiteUrl,
            submissionCount: files.length,
            lastSubmission,
        });
    }

    // Sort by most recent submission
    websites.sort((a, b) => {
        if (!a.lastSubmission) return 1;
        if (!b.lastSubmission) return -1;
        return new Date(b.lastSubmission).getTime() - new Date(a.lastSubmission).getTime();
    });

    return websites;
}

// Get a specific submission by ID
export async function getSubmissionById(id: string, websiteName: string): Promise<Submission | null> {
    ensureDataDir();

    const websiteDir = path.join(DATA_DIR, sanitizeFilename(websiteName));
    if (!fs.existsSync(websiteDir)) return null;

    const files = fs.readdirSync(websiteDir).filter(f => f.includes(id));
    if (files.length === 0) return null;

    try {
        const content = fs.readFileSync(path.join(websiteDir, files[0]), 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading submission ${id}:`, error);
        return null;
    }
}

// Sanitize filename to prevent directory traversal
function sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9-_.]/gi, '_');
}

// Generate unique ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
