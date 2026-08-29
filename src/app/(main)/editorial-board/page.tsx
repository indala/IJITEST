import { ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditorialBoardClient from '@/features/shared/components/EditorialBoardClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { getEditorialBoard } from '@/actions/users';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Editorial Board | ${settings['journalName']}`,
        description: `Meet the esteemed editorial board of ${settings['journalShortName']}. Our panel of global academic experts is committed to scientific excellence and rigorous peer review in engineering and technology.`,
        alternates: {
            canonical: '/editorial-board',
        },
        openGraph: {
            title: `Editorial Board - ${settings['journalShortName']}`,
            description: `Global academic experts steering the ${settings['journalName']}.`,
            type: 'website',
        }
    };
}

export default async function EditorialBoard() {
    const settings = await getSettingsData();
    const res = await getEditorialBoard();
    const initialMembers = res.success ? res.data || [] : [];

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Editorial Board"
                description="Our esteemed panel of global academic experts and researchers committed to scientific excellence."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Editorial Board', href: '/editorial-board' },
                ]}
                scrollOnComplete={true}
            />

            <section className="container-responsive py-6 sm:py-8 flex justify-center">
                <div className="space-y-6 w-full max-w-6xl">
                    {/* Main Content */}
                    <EditorialBoardClient settings={settings} initialMembers={initialMembers} />

                    {/* Ethics Policy Banner */}
                    <Card className="bg-primary border-none text-white shadow-md rounded-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors duration-500 pointer-events-none" />
                        <CardContent className="p-4 sm:p-5 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                                        <ShieldAlert className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-white tracking-wide m-0">Ethics Policy</CardTitle>
                                        <p className="text-white/80 max-w-xl m-0">
                                            IJITEST follows COPE guidelines for scientific integrity and global best practices.
                                        </p>
                                    </div>
                                </div>
                                <Button asChild size="sm" className="h-8 px-4 bg-white hover:bg-white/90 text-primary font-bold text-xs rounded-lg shadow-xs transition-all shrink-0">
                                    <Link href="/ethics" className="flex items-center">
                                        View Policy <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

