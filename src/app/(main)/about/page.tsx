import { ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AboutClient from '@/features/shared/components/AboutClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `About the Journal | ${settings.journal_name}`,
        description: `Learn about ${settings.journal_name} (${settings.journal_short_name}). We focus on rapid yet rigorous peer review for technically sound research in engineering, science, and technology.`,
        openGraph: {
            title: `About ${settings.journal_short_name}`,
            description: `Quality academic publishing for the modern era.`,
            type: 'website',
        }
    };
}

export default function About() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="About the Journal"
                description="Rapid yet rigorous peer review for technically sound research in engineering, science, and technology."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About', href: '/about' },
                ]}
                scrollOnComplete={true}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Main Content (Client Component handles animations) */}
                    <AboutClient />

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip">
                            <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                                <TrackManuscriptWidget />
                            </div>
                        </div>

                        <Card className="bg-secondary border-none text-white shadow-vip-hover rounded-[2.5rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <CardContent className="p-8 relative z-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                                    <ShieldAlert className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-black mb-2 text-white tracking-tighter">Ethics Policy</CardTitle>
                                <p className="text-sm text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE guidelines for scientific integrity and global best practices.</p>
                                <Link href="/policy" className="group/link inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                    <span className="border-b border-white/30 group-hover/link:border-white transition-all pb-1">View Policy</span>
                                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-primary/5 shadow-vip rounded-[2.5rem] group overflow-hidden relative">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <CardContent className="p-8 relative z-10">
                                <h4 className="text-2xl font-black text-primary mb-2 tracking-tighter italic">Call for <span className="text-secondary not-italic">Papers</span></h4>
                                <p className="text-sm text-primary/50 mb-8 font-medium leading-relaxed">Submit your breakthrough research for our upcoming 2026 Monthly edition.</p>
                                <Button asChild className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl group/btn transition-all duration-500 overflow-hidden relative">
                                    <Link href="/submit" className="flex items-center justify-center relative z-10">
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Submit Manuscript</span>
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
