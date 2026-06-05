import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token)) {
        return NextResponse.next();
    }

    const { pathname, search } = req.nextUrl;

    // Protected API routes answer with JSON 401 so client fetch() can react cleanly.
    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Pages redirect to login, preserving where the user was headed.
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
}

// Everything is protected EXCEPT the public ingest endpoint, the auth endpoints,
// the login page, and Next.js internals/static assets.
export const config = {
    matcher: ['/((?!api/submit|api/auth|login|_next/static|_next/image|favicon.ico).*)'],
};
