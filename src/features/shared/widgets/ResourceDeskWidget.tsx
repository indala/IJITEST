import { Download } from 'lucide-react';
import { memo } from 'react';

import type { JournalSettings } from '@/db/types';

interface ResourceDeskWidgetProps {
    settings: JournalSettings;
}

function ResourceDeskWidget({ settings }: ResourceDeskWidgetProps) {
    const resources = [
        { label: "Word Template", type: "DOCX", link: settings?.templateUrl || "/docs/template.docx" },
        { label: "Copyright Form", type: "DOCX", link: settings?.copyrightUrl || "/docs/copyright-form.docx" }
    ];

    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <h3 className="text-primary m-0">Resource Downloads</h3>
            <div className="grid gap-2">
                {resources.map((doc, i) => (
                    <a 
                        key={i} 
                        href={doc.link} 
                        download
                        className="flex items-center justify-between p-2.5 2xl:p-3 bg-muted/40 hover:bg-muted/70 rounded-lg border border-border/40 group transition-all"
                    >
                        <div className="min-w-0">
                            <span className="text-[10px] 2xl:text-xs font-mono font-bold text-secondary uppercase block">{doc.type} Format</span>
                            <p className="font-bold text-primary group-hover:text-secondary transition-colors m-0 truncate">{doc.label}</p>
                        </div>
                        <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-primary group-hover:text-secondary transition-colors shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
}

export default memo(ResourceDeskWidget);
