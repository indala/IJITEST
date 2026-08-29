import { ChevronRight } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AboutClient from '@/features/shared/components/AboutClient';
import JournalParticulars from '@/features/shared/widgets/JournalParticulars';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `About the Journal | ${settings['journalName']}`,
        description: `Learn about ${settings['journalName']} (${settings['journalShortName']}). We focus on rapid yet rigorous peer review for technically sound research in engineering, science, and technology.`,
        alternates: {
            canonical: '/about',
        },
        openGraph: {
            title: `About ${settings['journalShortName']}`,
            description: `Quality academic publishing for the modern era.`,
            type: 'website',
        }
    };
}

export default async function About() {
    const settings = await getSettingsData();
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="About the Journal"
                description="Rapid yet rigorous peer review for technically sound research in engineering, science, and technology."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About', href: '/about' },
                ]}
                scrollOnComplete={true}
            />

            <Section>
                <SidebarLayout
                    sidebar={
                        <>
                            <JournalParticulars settings={settings} />

                            <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                                <TrackManuscriptWidget />
                            </div>

                            <Card className="bg-card border border-border/70 text-primary shadow-2xs rounded-xl overflow-hidden relative group">
                                <CardContent className="p-4 sm:p-5 relative z-10 space-y-2">
                                    <CardTitle className="m-0 text-primary">Ethics Policy</CardTitle>
                                    <p className="text-muted-foreground m-0 text-xs">IJITEST follows COPE guidelines for scientific integrity and global best practices.</p>
                                    <div className="pt-1">
                                        <Link href="/ethics" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline cursor-pointer">
                                            <span>View Policy</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#000066] border-none text-white shadow-md rounded-xl group overflow-hidden relative">
                                <CardContent className="p-4 sm:p-5 relative z-10 space-y-2">
                                    <h2 className="text-white m-0">Call for Papers</h2>
                                    <p className="text-white/70 m-0 text-xs">Submit your breakthrough research for our upcoming 2026 Monthly edition.</p>
                                    <div className="pt-2">
                                        <Button asChild size="sm" className="w-full h-9 bg-white text-[#000066] hover:bg-white/90 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
                                            <Link href="/submit" className="flex items-center justify-center gap-1.5">
                                                <span>Submit Manuscript</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    }
                >
                    <AboutClient settings={settings} />
                </SidebarLayout>
            </Section>
        </main>
    );
}
