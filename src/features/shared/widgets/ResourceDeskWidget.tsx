import { Download } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

const resources = [
    { label: "Word Template", type: "DOCX", link: "/docs/template.docx" },
    { label: "PDF Template", type: "PDF", link: "/docs/template.pdf" },
    { label: "Copyright Form", type: "PDF", link: "/docs/copyright-form.pdf" }
];

function ResourceDeskWidget() {
    return (
        <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Resource Desk</h3>
            <div className="grid gap-3">
                {resources.map((doc, i) => (
                    <Link key={i} href={doc.link} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary group transition-all">
                        <div>
                            <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest mb-0.5 block">{doc.type}</span>
                            <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.label}</span>
                        </div>
                        <Download className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default memo(ResourceDeskWidget);
