'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ScrollSpyNav } from '@/components/common/ScrollSpyNav';
import type { PolicySection, RelatedPolicyLink } from '../types';

interface PolicyPageClientProps {
    sections: PolicySection[];
    relatedLinks?: RelatedPolicyLink[] | undefined;
}

export default function PolicyPageClient({
    sections,
    relatedLinks = [
        { name: 'Open Access Policy', href: '/open-access' },
        { name: 'Publication Ethics', href: '/ethics' },
        { name: 'Peer Review Process', href: '/peer-review' },
        { name: 'Author Guidelines', href: '/guidelines' },
    ]
}: PolicyPageClientProps) {
    const scrollSpyItems = sections.map((s) => ({
        id: s.id,
        title: s.title,
    }));

    return (
        <Section>
            <SidebarLayout
                cols={4}
                sidebarClassName="hidden lg:block sticky top-28 h-fit"
                sidebar={
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-primary text-label m-0">Quick Navigation</h3>
                            <ScrollSpyNav items={scrollSpyItems} />
                        </div>

                        {relatedLinks && relatedLinks.length > 0 && (
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                    <BookOpen className="size-3.5" />
                                    <span>Related Policies</span>
                                </div>
                                <div className="flex flex-col gap-1.5 text-xs">
                                    {relatedLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            • {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                }
            >
                <div className="space-y-6 sm:space-y-8">
                    {sections.map((section) => (
                        <section key={section.id} id={section.id} className="scroll-mt-24 space-y-2">
                            <h2 className="m-0">
                                {section.title}
                            </h2>
                            <div className="text-muted-foreground border-l-2 border-border pl-3.5 space-y-3">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>
            </SidebarLayout>
        </Section>
    );
}
