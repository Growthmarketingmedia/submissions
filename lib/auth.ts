import { SignJWT, jwtVerify } from 'jose';

// Edge-compatible single-admin session: a signed JWT stored in an HTTP-only cookie.
export const SESSION_COOKIE = 'admin_session';
const ALG = 'HS256';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): Uint8Array {
    const s = process.env.AUTH_SECRET;
    if (!s) throw new Error('Missing AUTH_SECRET env var');
    return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
    return new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime(`${MAX_AGE_SECONDS}s`)
        .sign(secret());
}

export async function verifySessionToken(
    token: string | undefined | null
): Promise<boolean> {
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
