import { ChevronRight, Gavel } from 'lucide-react';
import Link from 'next/link';

import type { JournalSettings } from '@/db/types';

interface TermsClientProps {
    settings: JournalSettings;
}

export default function TermsClient({ settings }: TermsClientProps) {
    const journalName = settings.journalName || '';

    const framework = [
        {
            title: "Intellectual Sovereignty",
            content: `All published research assets are disseminated under global open-access protocols. Authors retain significant intellectual rights while granting ${journalName} the mandate for exclusive first publication and permanent archival management.`
        },
        {
            title: "Submission Mandate",
            content: "Authors are strictly obligated to ensure the absolute originality of their contributions. Any form of plagiarism or double-submission constitutes a severe protocol violation and will result in immediate rejection and potential ethical reporting."
        },
        {
            title: "Platform Conduct",
            content: "Interaction with the journal platform must adhere to elite professional standards. Unauthorized attempts to exploit digital assets or compromise system integrity will be met with immediate legal and technical countermeasures."
        }
    ];

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="space-y-2">
                        <h2 className="font-semibold m-0">
                            &quot;The {journalName} legal framework ensures a transparent, ethical, and professional ecosystem for engineering excellence.&quot;
                        </h2>
                    </section>

                    <div className="space-y-5">
                        {framework.map((item, idx) => (
                            <section key={idx} className="space-y-2">
                                <h3 className="flex items-center gap-2 m-0">
                                    <span className="text-meta">0{idx + 1}.</span>
                                    {item.title}
                                </h3>
                                <div className="text-muted-foreground border-l-2 border-border pl-3.5">
                                    <p className="m-0">{item.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-[#000066] p-4 sm:p-6 rounded-xl text-white relative overflow-hidden shadow-xs">
                        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                                <Gavel className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="m-0 text-white">Framework Evolution</h3>
                                <p className="text-white/75 border-l-2 border-white/20 pl-3.5 m-0 leading-relaxed">
                                    Felix Academic Publications reserves the right to update this legal framework in accordance with international publishing guidelines. Continued platform usage implies acceptance of these terms.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <section className="space-y-2">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-label text-muted-foreground m-0">Legal Nexus</p>
                        </div>
                        <div className="space-y-2">
                            <Link href="/privacy" className="flex items-center justify-between p-3 bg-card border border-border/70 rounded-xl hover:border-primary/30 transition-all group shadow-2xs">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Privacy Protocol</span>
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
