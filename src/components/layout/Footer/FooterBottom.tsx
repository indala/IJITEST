import { Shield, Globe } from 'lucide-react';

export function FooterBottom() {
    return (
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
            <div className="flex items-center gap-4">
                <p>© {new Date().getFullYear()} Felix Academic Publications</p>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <p>All Rights Reserved</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-secondary" />
                    <span>COPE Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <Globe className="w-3 h-3" />
                    <span>Open Access Journal</span>
                </div>
            </div>
        </div>
    );
}
