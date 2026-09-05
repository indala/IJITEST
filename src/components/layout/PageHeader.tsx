import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PageHeaderScroll from './PageHeaderScroll';

export interface BreadcrumbItem {
    name: string;
    href: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string | undefined;
    breadcrumbs: BreadcrumbItem[];
    scrollOnComplete?: boolean | undefined;
    disableBreadcrumbJsonLd?: boolean | undefined;
}

function BreadcrumbJsonLd({ items, baseUrl }: { items: BreadcrumbItem[]; baseUrl: string }) {
    const itemListElement = items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: `${baseUrl}${item.href}`,
    }));

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement,
                }),
            }}
        />
    );
}

export default function PageHeader({
    title,
    description,
    breadcrumbs,
    scrollOnComplete = true,
    disableBreadcrumbJsonLd = false
}: PageHeaderProps) {
    const rawBaseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org';
    const baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl.replace(/\/$/, '') : `https://${rawBaseUrl.replace(/\/$/, '')}`;
    const headerId = 'page-header-section';

    return (
        <>
            {!disableBreadcrumbJsonLd && (
                <BreadcrumbJsonLd items={breadcrumbs} baseUrl={baseUrl.replace(/\/$/, '')} />
            )}
            {scrollOnComplete && <PageHeaderScroll targetId={headerId} />}
            <section id={headerId} className="relative py-5 sm:py-7 bg-primary border-b border-white/10 overflow-hidden">
                <div className="container-responsive relative z-10 space-y-2">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                            {breadcrumbs.map((crumb, idx) => {
                                const isLast = idx === breadcrumbs.length - 1;
                                return (
                                    <li
                                        key={crumb.href + idx}
                                        className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <Link
                                            href={crumb.href}
                                            aria-current={isLast ? "page" : undefined}
                                            className={`text-[11px] sm:text-xs font-medium tracking-tight transition-all duration-200 ${isLast ? "text-white font-semibold" : "text-white/60 hover:text-white"}`}
                                        >
                                            {crumb.name}
                                        </Link>
                                        {!isLast && (
                                            <ChevronRight className="w-3 h-3 text-secondary" />
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>

                    <div className="grid grid-cols-1 gap-4 items-end">
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
                            <h1 className="text-white m-0">
                                {title}
                            </h1>
                            {description && (
                                <p className="max-w-3xl text-white/80 border-l-2 border-white/30 pl-3.5 m-0 mt-1 animate-in fade-in duration-700 delay-200 fill-mode-both">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
