import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "404 - Page Not Found | IJITEST",
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="max-w-md text-muted-foreground">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                Back to Home
            </Link>
        </div>
    );
}
