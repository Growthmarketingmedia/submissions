'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Search, LogOut } from 'lucide-react';

function NavLink({
    href,
    icon: Icon,
    label,
    pathname,
}: {
    href: string;
    icon: any;
    label: string;
    pathname: string;
}) {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
        <Link href={href} className={`nav-link${active ? ' active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
        </Link>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Login page renders without the nav shell.
    if (pathname === '/login') return <>{children}</>;

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <>
            <header className="app-nav">
                <div className="app-nav-inner">
                    <Link href="/" className="app-brand gradient-text">
                        Submissions
                    </Link>
                    <nav className="app-nav-links">
                        <NavLink href="/" icon={LayoutDashboard} label="Overview" pathname={pathname} />
                        <NavLink href="/clients" icon={Users} label="Clients" pathname={pathname} />
                        <NavLink href="/search" icon={Search} label="Search" pathname={pathname} />
                    </nav>
                    <button
                        onClick={logout}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px' }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>
            <main>{children}</main>
        </>
    );
}
