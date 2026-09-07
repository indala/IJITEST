import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Globe, Mail, Info } from 'lucide-react';

import type { JournalSettings } from '@/db/types';

interface JournalParticularsProps {
    settings: JournalSettings | Record<string, string | undefined>;
    variant?: 'sidebar' | 'full';
}

export const JournalParticulars = ({ settings, variant = 'sidebar' }: JournalParticularsProps) => {
    const particulars = [
        { label: "Title", value: (settings['journalName'] || '') },
        { label: "Abbreviated Title", value: (settings['journalShortName'] || '') },
        { label: "ISSN (Online)", value: (settings['issnNumber'] || '') },
        { label: "Frequency", value: (settings['publicationFrequency'] || 'Monthly (12 Issues / Year)') },
        { label: "Starting Year", value: (settings['startingYear'] || '2026') },
        { label: "Publication Format", value: (settings['publicationFormat'] || 'Online Open Access') },
        { label: "Language", value: (settings['journalLanguage'] || 'English') },
        { label: "Subject", value: (settings['journalSubject'] || 'Engineering, Science & Technology') },
        { label: "Publisher", value: (settings['publisherName'] || 'Felix Academic Publications') },
        { label: "UDYAM Reg.", value: (settings['udyamRegistration'] || 'UDYAM-AP-03-0056972') },
        { label: "Email", value: (settings['supportEmail'] || 'felixtecsolutions@gmail.com') },
        { label: "Website", value: (settings['journalWebsite'] || 'https://ijitest.org') },
    ];

    const isFull = variant === 'full';

    return (
        <Card className="bg-card border border-border/70 shadow-2xs rounded-xl overflow-hidden group">
            <div className="bg-primary p-3.5 sm:p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-white/80 shrink-0" />
                    <CardTitle className="text-white text-sm font-semibold tracking-wide m-0">Journal Particulars</CardTitle>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 text-white font-medium">
                    {settings['journalShortName'] || 'IJITEST'}
                </span>
            </div>
            <CardContent className="p-0">
                <div className={isFull ? "grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 text-xs" : "divide-y divide-border/50 text-xs"}>
                    {isFull ? (
                        <>
                            <div className="divide-y divide-border/50">
                                {particulars.slice(0, Math.ceil(particulars.length / 2)).map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-2.5 sm:p-3 hover:bg-primary/5 transition-colors gap-3">
                                        <span className="text-label text-primary/80 font-semibold w-5/12 shrink-0">{item.label}</span>
                                        <span className="text-foreground font-medium w-7/12 pl-3 border-l border-border/50 break-words leading-relaxed">{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y divide-border/50 md:border-l md:border-border/50">
                                {particulars.slice(Math.ceil(particulars.length / 2)).map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-2.5 sm:p-3 hover:bg-primary/5 transition-colors gap-3">
                                        <span className="text-label text-primary/80 font-semibold w-5/12 shrink-0">{item.label}</span>
                                        <span className="text-foreground font-medium w-7/12 pl-3 border-l border-border/50 break-words leading-relaxed">{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        particulars.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between p-2.5 sm:p-3 hover:bg-primary/5 transition-colors gap-2.5">
                                <span className="text-label text-primary/80 font-semibold w-5/12 shrink-0">{item.label}</span>
                                <span className="text-foreground font-medium w-7/12 pl-2.5 border-l border-border/50 break-words leading-relaxed">{item.value || '—'}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-3 sm:p-3.5 bg-muted/30 flex justify-between items-center border-t border-border/50">
                    <div className="flex gap-2">
                        <a href={(settings['journalWebsite']?.startsWith('http') ? settings['journalWebsite'] : `https://${settings['journalWebsite'] || 'ijitest.org'}`)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-background border border-border/70 rounded-lg shadow-2xs hover:border-primary/40 hover:text-primary transition-all text-muted-foreground" aria-label="Visit Journal Website">
                            <Globe className="w-3.5 h-3.5" />
                        </a>
                        <a href={`mailto:${(settings['supportEmail'] || 'support@ijitest.org')}`} className="p-1.5 bg-background border border-border/70 rounded-lg shadow-2xs hover:border-primary/40 hover:text-primary transition-all text-muted-foreground" aria-label="Send Email to Editor">
                            <Mail className="w-3.5 h-3.5" />
                        </a>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">{(settings.journalShortName || 'IJITEST')} {(settings.startingYear || '2026')}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default JournalParticulars;
