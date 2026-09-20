import { Download, FileDown, FileText } from 'lucide-react';
import { memo } from 'react';

import type { JournalSettings } from '@/db/protocols';

interface ResourceDeskWidgetProps {
    settings: JournalSettings;
}

function ResourceDeskWidget({ settings }: ResourceDeskWidgetProps) {
    const resources = [
        { 
            label: "Word Template", 
            type: "DOCX", 
            link: settings?.templateUrl || "/docs/template.docx",
            filename: "IJITEST-Manuscript-Template.docx"
        },
        { 
            label: "Copyright Form", 
            type: "DOCX", 
            link: settings?.copyrightUrl || "/docs/copyright-form.docx",
            filename: "IJITEST-Publication-License-Agreement.docx"
        }
    ];

    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileDown className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand m-0">
                    Resource Downloads
                </h3>
            </div>
            <div className="grid gap-2">
                {resources.map((doc, i) => (
                    <a 
                        key={i} 
                        href={doc.link} 
                        download={doc.filename}
                        className="flex items-center justify-between p-2.5 2xl:p-3 bg-muted/40 hover:bg-muted/70 rounded-lg border border-border/40 group transition-all"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-md bg-secondary/10 text-secondary shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="badge-secondary">{doc.type}</span>
                                </div>
                                <p className="font-bold text-primary group-hover:text-secondary transition-colors m-0 truncate">
                                    {doc.label}
                                </p>
                            </div>
                        </div>
                        <Download className="w-4 h-4 text-primary group-hover:text-secondary transition-colors shrink-0 ml-2" />
                    </a>
                ))}
            </div>
        </div>
    );
}

export default memo(ResourceDeskWidget);
