import { Mail, MapPin, ShieldAlert, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/features/contact/components/ContactForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card } from '@/components/ui/card';
import type { JournalSettings } from '@/db/types';

interface ContactClientProps {
    settings: JournalSettings | Record<string, string | undefined>;
}

export default function ContactClient({ settings }: ContactClientProps) {
    const supportEmail = settings['supportEmail'] || '';
    const supportPhone = settings['supportPhone'] || '';

    const contactMethods = [
        {
            icon: Mail,
            title: "Editorial Support",
            value: supportEmail,
            href: `mailto:${supportEmail}`,
            subtext: "24/7 Author Assistance",
            accent: "primary"
        },
        {
            icon: MessageSquare,
            title: "WhatsApp Hotline",
            value: supportPhone,
            href: `https://wa.me/${(supportPhone!).replace(/[\s+]/g, "")}`,
            subtext: "Immediate Technical Support",
            accent: "secondary"
        }
    ];

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Main Contact Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {contactMethods.map((method, idx) => (
                            <Card key={idx} className="p-4 border-border/70 bg-card rounded-xl hover:border-primary/20 transition-all shadow-2xs">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                        <method.icon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-label text-muted-foreground m-0">{method.title}</p>
                                        <a
                                            href={method.href}
                                            className="text-sm font-semibold text-primary hover:underline transition-all block truncate"
                                        >
                                            {method.value}
                                        </a>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3 opacity-50" />
                                            <span>{method.subtext}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form Section */}
                    <section className="space-y-3">
                        <Card className="p-4 sm:p-6 border-border/70 bg-card rounded-xl shadow-2xs">
                            <ContactForm />
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    {/* Office Address Card */}
                    <section className="space-y-2">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-label text-muted-foreground m-0">Editorial Headquarters</p>
                        </div>
                        <Card className="p-4 border-border/70 bg-card rounded-xl shadow-2xs">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary mt-0.5">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-foreground/90 m-0 font-medium whitespace-pre-line">
                                        {(settings['officeAddress'] || '')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Integrated Widgets */}
                    <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                        <TrackManuscriptWidget />
                    </div>

                    <div className="bg-[#000066] p-4 rounded-xl text-white space-y-2 shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            <h3 className="text-white m-0">Publication Ethics</h3>
                        </div>
                        <p className="text-white/70 m-0 leading-relaxed">IJITEST strictly adheres to COPE guidelines for scientific integrity and peer-review ethics.</p>
                        <div className="pt-1">
                            <Link href="/ethics" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-white transition-colors">
                                <span>View Policy</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
