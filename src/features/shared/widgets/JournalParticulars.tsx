'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Globe, Mail, Info } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export const JournalParticulars = () => {
    const settings = useSettingsStore((state) => state.settings);
    const particulars = [
        { label: "Title", value: (settings.journalName || '') },
        { label: "Abbreviated Title", value: (settings.journalShortName || '') },
        { label: "ISSN (Online)", value: (settings.issnNumber || '') },
        { label: "Frequency", value: (settings.publicationFrequency || '') },
        { label: "Starting Year", value: (settings.startingYear || '') },
        { label: "Publication Format", value: (settings.publicationFormat || '') },
        { label: "Language", value: (settings.journalLanguage || '') },
        { label: "Subject", value: (settings.journalSubject || '') },
        { label: "Publisher", value: (settings.publisherName || '') },
        { label: "UDYAM", value: (settings.udyamRegistration || '') },
        { label: "Email", value: "felixtecsolutions@gmail.com" },
        { label: "Website", value: (settings.journalWebsite || '') },
    ];

    return (
        <Card className="bg-white border border-primary/5 shadow-vip rounded-xl overflow-hidden group">
            <div className="bg-[#000066] p-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-white/70" />
                <CardTitle className="text-white text-sm font-serif tracking-wide m-0">Journal Particulars</CardTitle>
            </div>
            <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                    {particulars.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-3 text-[10px] xl:text-xs group/item hover:bg-primary/5 transition-colors">
                            <span className="font-bold text-primary opacity-60 uppercase tracking-tighter">{item.label}</span>
                            <span className="col-span-2 text-primary font-medium pl-2 border-l border-primary/5">{item.value}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-muted/30 flex justify-between items-center border-t border-primary/5">
                    <div className="flex gap-3">
                        <a href={`https://${(settings.journalWebsite || '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-primary/60 hover:text-primary" aria-label="Visit Journal Website">
                            <Globe className="w-3.5 h-3.5" />
                        </a>
                        <a href={`mailto:${(settings.supportEmail || '')}`} className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-primary/60 hover:text-primary" aria-label="Send Email to Editor">
                            <Mail className="w-3.5 h-3.5" />
                        </a>
                    </div>
                    <span className="text-[10px] font-black text-primary/20 tracking-widest uppercase italic">{(settings.journalShortName || '')} {(settings.startingYear || '')}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default JournalParticulars;
