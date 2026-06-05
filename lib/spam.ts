// Lightweight, transparent spam heuristic for contact-form submissions.
// Returns a tag decision + human-readable reason. No external services.

const HARD_KEYWORDS = [
    'viagra', 'cialis', 'casino', 'crypto', 'bitcoin', 'forex', 'porn',
    'escort', 'payday loan', 'sex dating',
];

const SOFT_KEYWORDS = [
    'seo', 'search engine optimization', 'backlink', 'rank your', 'rank higher',
    'first page of google', 'web traffic', 'increase traffic', 'buy now',
    'gambling', 'betting', 'weight loss', 'cbd', 'make money', 'work from home',
    'earn $', 'investment opportunity', 'guaranteed results', 'increase your sales',
    'marketing services', 'digital marketing services', 'web design services',
    'limited time offer', 'click here', 'act now',
];

export interface SpamResult {
    isSpam: boolean;
    reason: string | null;
    score: number;
}

export function scoreSpam(
    formData: Record<string, any>,
    _metadata?: Record<string, any>
): SpamResult {
    const reasons: string[] = [];
    let score = 0;

    const values = Object.values(formData || {}).map((v) =>
        typeof v === 'string' ? v : v == null ? '' : JSON.stringify(v)
    );
    const text = values.join(' \n ');
    const lower = text.toLowerCase();

    // Links
    const links = (text.match(/https?:\/\/|www\./gi) || []).length;
    if (links >= 3) {
        reasons.push(`${links} links`);
        score += 2;
    } else if (links >= 1) {
        reasons.push('contains link');
        score += 1;
    }

    // Markup / BBCode links (very strong spam signal)
    if (/\[url[=\]]|\[\/url\]|<a\s+href|\[link/i.test(text)) {
        reasons.push('markup link');
        score += 2;
    }

    // Keywords
    const hardHits = HARD_KEYWORDS.filter((k) => lower.includes(k));
    const softHits = SOFT_KEYWORDS.filter((k) => lower.includes(k));
    if (hardHits.length) reasons.push(`flagged words: ${hardHits.slice(0, 3).join(', ')}`);
    if (softHits.length) {
        reasons.push(`promo words: ${softHits.slice(0, 3).join(', ')}`);
        score += softHits.length >= 2 ? 2 : 1;
    }

    // Non-Latin scripts in an otherwise English form
    if (/[Ѐ-ӿ]/.test(text)) {
        reasons.push('cyrillic text');
        score += 1;
    }
    if (/[一-鿿]/.test(text)) {
        reasons.push('cjk text');
        score += 1;
    }

    // Name field anomalies
    const name = String(formData?.name ?? formData?.Name ?? '');
    if (/https?:\/\/|www\./i.test(name)) {
        reasons.push('url in name');
        score += 1;
    } else if (name && /^[bcdfghjklmnpqrstvwxz]{7,}$/i.test(name.replace(/\s/g, ''))) {
        reasons.push('gibberish name');
        score += 1;
    }

    // Email sanity
    const email = String(formData?.email ?? formData?.Email ?? '');
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        reasons.push('invalid email');
        score += 1;
    }

    // Long body + link (classic blast)
    if (links >= 1 && text.length > 800) {
        reasons.push('long message + link');
        score += 1;
    }

    const isSpam = hardHits.length > 0 || score >= 3;
    return { isSpam, reason: reasons.length ? reasons.join('; ') : null, score };
}
