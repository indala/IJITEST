import { memo } from 'react';
import { CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function ApcFeeWidget() {
    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <CreditCard className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </div>
                    <div>
                        <h3 className="m-0 text-primary">APC Structure</h3>
                        <p className="text-meta text-muted-foreground m-0">Zero Submission Fee</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40">
                    <p className="text-label text-muted-foreground mb-0.5 m-0">Indian Authors</p>
                    <p className="font-bold text-primary text-sm sm:text-base m-0">₹2,500 <span className="text-[10px] font-normal text-muted-foreground">INR</span></p>
                </div>
                <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40">
                    <p className="text-label text-muted-foreground mb-0.5 m-0">Foreign Authors</p>
                    <p className="font-bold text-primary text-sm sm:text-base m-0">$50 <span className="text-[10px] font-normal text-muted-foreground">USD</span></p>
                </div>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-tight m-0">
                    No charges for submission or peer review. APC applies only after formal paper acceptance.
                </p>
            </div>

            <Link
                href="/guidelines"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors text-center"
            >
                <span>View Author Fee Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

export default memo(ApcFeeWidget);
