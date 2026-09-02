import { Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import type { JournalSettings } from '@/db/types';

interface PrivacyClientProps {
    settings: JournalSettings;
}

export default function PrivacyClient({ settings }: PrivacyClientProps) {
    const journalName = settings.journalName || '';
    const supportEmail = settings.supportEmail || '';

    const sections = [
        {
            title: "Data Stewardship",
            content: `The ${journalName} and Felix Academic Publications operate as sovereign guardians of scholarly data. We strictly collect essential metadata (Author identity, Institutional affiliation, and Contact credentials) solely to facilitate the rigorous peer-review and publication orchestration.`
        },
        {
            title: "Metadata Circulation",
            content: "Personal data circulation is restricted to the internal editorial workflow. Shared digital assets are limited to certified academic indexing protocols (CrossRef, ORCID, and global repository hubs) to ensure the permanence of your research."
        },
        {
            title: "Fortified Security",
            content: "All manuscript assets and author credentials reside behind multi-layered encryption protocols on audited secure servers. We maintain strictly controlled access to prevent unauthorized dissemination of unpublished intellectual property."
        }
    ];

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="space-y-2">
                        <h2 className="font-semibold m-0">
                            &quot;Data privacy is a pillar of scientific integrity. We protect your scholarly contributions with advanced security protocols.&quot;
                        </h2>
                    </section>

                    <div className="space-y-5">
                        {sections.map((section, idx) => (
                            <section key={idx} className="space-y-2">
                                <h3 className="flex items-center gap-2 m-0">
                                    <span className="text-meta">0{idx + 1}.</span>
                                    {section.title}
                                </h3>
                                <div className="text-muted-foreground border-l-2 border-border pl-3.5">
                                    <p className="m-0">{section.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-primary p-4 sm:p-6 rounded-xl text-white relative overflow-hidden shadow-xs">
                        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="m-0 text-white">Inquiries & Data Access</h3>
                                <p className="text-white/90 border-l-2 border-white/20 pl-3.5 m-0 leading-relaxed">
                                    For any privacy concerns or data access requests, please contact our verified Editorial Office at <span className="text-white font-semibold">{supportEmail}</span>.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <section className="space-y-2">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-label text-muted-foreground m-0">Related Policies</p>
                        </div>
                        <div className="space-y-2">
                            <Link href="/terms" className="flex items-center justify-between p-3 bg-card border border-border/70 rounded-xl hover:border-primary/30 transition-all group shadow-2xs">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Terms & Conditions</span>
                                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                            <Link href="/ethics" className="flex items-center justify-between p-3 bg-card border border-border/70 rounded-xl hover:border-primary/30 transition-all group shadow-2xs">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Publication Ethics</span>
                                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <section className={className}>{children}</section>;
}
