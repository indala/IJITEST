import { Search, ShieldAlert, FileText, User, ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function TrackButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 2xl:h-14 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm transition-all active:scale-[0.99] hover:shadow-md hover:-translate-y-0.5 cursor-pointer font-bold text-label duration-300"
        >
            {pending ? (
                <div className="flex items-center gap-3">
                    Searching <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    Track Manuscript <ArrowRight className="w-4 h-4" />
                </div>
            )}
        </Button>
    );
}

import type { Submission, User as DBUser, JournalSettings } from "@/db/types";

interface TrackSearchFormProps {
    paperIdInput: Submission['paperId'];
    emailInput: DBUser['email'];
    onPaperIdChange: (val: Submission['paperId']) => void;
    onEmailChange: (val: DBUser['email']) => void;
    formAction: (formData: FormData) => void;
    journalShortName?: JournalSettings['journalShortName'];
}

export function TrackSearchForm({
    paperIdInput,
    emailInput,
    onPaperIdChange,
    onEmailChange,
    formAction,
    journalShortName = '',
}: TrackSearchFormProps) {
    return (
        <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs max-w-3xl mx-auto w-full group">
            <div className="bg-primary p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20 shrink-0">
                        <Search className="w-6 h-6" />
                    </div>
                    <div className="text-center sm:text-left space-y-0.5">
                        <h2 className="m-0 text-white">Track Manuscript Status</h2>
                        <p className="text-white/70 m-0 flex items-center justify-center sm:justify-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-white/50" /> Secure Double-Blind Tracking
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                        <label className="text-label text-muted-foreground ml-0.5">Manuscript ID</label>
                        <div className="relative">
                            <Input
                                name="paperId"
                                value={paperIdInput}
                                onChange={(e) => onPaperIdChange(e.target.value)}
                                required
                                className="h-10 rounded-lg bg-muted/20 border-border/70 text-primary px-3 text-body-sm"
                                placeholder={`${journalShortName}-2026-XXX`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-label text-muted-foreground ml-0.5">Corresponding Author Email</label>
                        <div className="relative">
                            <Input
                                type="email"
                                name="email"
                                value={emailInput}
                                onChange={(e) => onEmailChange(e.target.value)}
                                required
                                className="h-10 rounded-lg bg-muted/20 border-border/70 text-primary px-3 text-body-sm"
                                placeholder="author@institution.edu"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-2 pt-2">
                        <TrackButton />
                        <p className="text-label text-muted-foreground text-center mt-3 m-0">
                            Real-Time Editorial Workflow Pipeline
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
