import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Form Submissions Dashboard',
    description: 'Centralized form submission management system',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
