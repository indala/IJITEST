import { Download } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

interface ResourceDeskWidgetProps {
    settings?: Record<string, string>;
}

function ResourceDeskWidget({ settings }: ResourceDeskWidgetProps) {
    const resources = [
        { label: "Word Template", type: "DOCX", link: settings?.template_url || "/docs/template.docx" },
        { label: "Copyright Form", type: "DOCX", link: settings?.copyright_url || "/docs/copyright-form.docx" }
    ];

    return (
        <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            <h3 className="text-xl font-sans font-black mb-6 text-gray-900">Resource Desk</h3>
            <div className="grid gap-3">
                {resources.map((doc, i) => (
                    <Link key={i} href={doc.link} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-400 hover:border-primary group transition-all">
                        <div>
                            <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest mb-0.5 block">{doc.type}</span>
                            <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.label}</span>
                        </div>
                        <Download className="w-4 h-4 text-gray-900 group-hover:text-primary transition-colors animate-bounce " />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default memo(ResourceDeskWidget);
