import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Constant-time-ish string compare (length leak is acceptable for one admin secret).
function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let out = 0;
    for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return out === 0;
}

export async function POST(request: NextRequest) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
        return NextResponse.json(
            { success: false, message: 'Server auth is not configured (ADMIN_PASSWORD missing)' },
            { status: 500 }
        );
    }

    let password = '';
    try {
        const body = await request.json();
        password = typeof body?.password === 'string' ? body.password : '';
    } catch {
        // malformed body -> treated as wrong password below
    }

    if (!password || !safeEqual(password, expected)) {
        return NextResponse.json(
            { success: false, message: 'Invalid password' },
            { status: 401 }
        );
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
    });
    return res;
}
