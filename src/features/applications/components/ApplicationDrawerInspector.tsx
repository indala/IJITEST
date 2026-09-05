import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Download, AlertCircle } from "lucide-react";
import { Drawer } from 'vaul';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Application } from "@/db/types";

interface ApplicationDrawerInspectorProps {
    inspectApp: Application | null;
    onClose: () => void;
    rejectionMode: boolean;
    setRejectionMode: (val: boolean) => void;
    rejectionReason: string;
    setRejectionReason: (val: string) => void;
    approveConfirm: boolean;
    setApproveConfirm: (val: boolean) => void;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
    isPendingAction: boolean;
}

export function ApplicationDrawerInspector({
    inspectApp,
    onClose,
    rejectionMode,
    setRejectionMode,
    rejectionReason,
    setRejectionReason,
    approveConfirm,
    setApproveConfirm,
    onApprove,
    onReject,
    isPendingAction,
}: ApplicationDrawerInspectorProps) {
    return (
        <Drawer.Root 
            open={!!inspectApp} 
            onOpenChange={(open) => { 
                if (!open) {
                    onClose();
                } 
            }}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col h-[90vh] bg-card border-t border-primary/5 rounded-t-[32px] outline-none shadow-2xl">
                    <Drawer.Title className="sr-only">Application Details</Drawer.Title>
                    <Drawer.Description className="sr-only">Detailed overview of the candidate&apos;s dossier and research profile.</Drawer.Description>
                    <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-primary/10 my-4" />
                    <div 
                        className="flex-1 overflow-y-auto min-h-0 px-6 pb-12 custom-scrollbar"
                        data-lenis-prevent
                    >
                        {inspectApp && (
                            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-full gap-8">
                                <div className="p-8 bg-primary/2 border rounded-3xl border-primary/5 space-y-8">
                                    <div className="space-y-6 text-center lg:text-left">
                                        <div className="w-40 h-40 rounded-3xl bg-muted border border-primary/5 mx-auto lg:mx-0 overflow-hidden shadow-2xl">
                                            {inspectApp.photoUrl ? (
                                                <NextImage src={inspectApp.photoUrl} alt={inspectApp.fullName || "Applicant photo"} width={300} height={300} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20 scale-150"><User /></div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black uppercase tracking-tight">{inspectApp.fullName}</h2>
                                            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] opacity-60">{inspectApp.designation}</p>
                                        </div>
                                    </div>

                                    <Separator className="bg-primary/5" />

                                    <div className="space-y-6">
                                        {[
                                            { label: 'Institution', value: inspectApp.institute },
                                            { label: 'Nationality', value: inspectApp.nationality },
                                            { label: 'Role Target', value: inspectApp.type },
                                            { label: 'Status', value: inspectApp.status, color: inspectApp.status === 'approved' ? 'text-emerald-500' : inspectApp.status === 'rejected' ? 'text-rose-500' : 'text-amber-500' }
                                        ].map(item => (
                                            <div key={item.label} className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{item.label}</span>
                                                <p className={`text-[11px] font-black uppercase tracking-widest ${item.color || 'text-foreground'}`}>{item.value}</p>
                                            </div>
                                        ))}

                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Core Expertise</span>
                                            <div className="flex flex-wrap gap-2">
                                                {inspectApp.researchInterests?.map((tag: string) => (
                                                    <span key={tag} className="text-[9px] font-black uppercase text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col bg-card border border-primary/5 rounded-3xl overflow-hidden shadow-inner">
                                    <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/2">
                                        <div className="flex items-center gap-4">
                                            <FileText className="text-primary w-5 h-5" />
                                            <span className="font-bold text-xs uppercase tracking-[0.2em]">Candidacy Dossier</span>
                                        </div>
                                        {inspectApp.cvUrl && (
                                            <Button variant="outline" size="sm" asChild className="h-9 px-5 rounded-xl border-primary/10 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                <a href={inspectApp.cvUrl || undefined} download>
                                                    <Download className="w-4 h-4 mr-2" /> Download Document
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex-1 min-h-[500px] bg-muted/10 relative">
                                        {!inspectApp.cvUrl ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                <AlertCircle className="w-16 h-16 opacity-20" />
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No CV document uploaded.</p>
                                            </div>
                                        ) : inspectApp.cvUrl?.toLowerCase().endsWith('.pdf') ? (
                                            <iframe src={inspectApp.cvUrl || undefined} title="Preview" className="w-full h-full border-none" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                <FileText className="w-16 h-16 opacity-20" />
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Document format requires local viewing.</p>
                                                <Button asChild className="rounded-2xl h-14 px-10 bg-primary text-white font-black uppercase tracking-widest">
                                                    <a href={inspectApp.cvUrl || undefined} download>Initialize Download</a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {inspectApp.status === 'pending' && (
                                        <div className="p-8 border-t border-primary/5 bg-primary/2">
                                            <AnimatePresence mode="wait">
                                                {rejectionMode ? (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-end">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rejection Rationale (Audit Log)</label>
                                                                <span className={`text-[10px] font-black ${rejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                    {rejectionReason.length}/20 chars
                                                                </span>
                                                            </div>
                                                            <textarea
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                className="w-full h-32 bg-background border-2 border-rose-500/20 rounded-2xl p-4 text-sm focus:border-rose-500 outline-none transition-all resize-none font-medium"
                                                                placeholder="Describe the grounds for declining this proposal..."
                                                            />
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <Button variant="ghost" onClick={() => setRejectionMode(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                            <Button 
                                                                disabled={rejectionReason.length < 20 || isPendingAction}
                                                                onClick={() => onReject(inspectApp.id, rejectionReason)}
                                                                className="flex-2 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest"
                                                            >
                                                                Confirm Terminal Rejection
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ) : approveConfirm ? (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                                                        <h4 className="text-xl font-black uppercase">Authorize Personnel?</h4>
                                                        <div className="flex gap-4">
                                                            <Button variant="ghost" onClick={() => setApproveConfirm(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                            <Button 
                                                                onClick={() => onApprove(inspectApp.id)}
                                                                disabled={isPendingAction}
                                                                className="flex-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                                            >
                                                                Authorize & Invite
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="flex gap-4">
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => setRejectionMode(true)}
                                                            disabled={isPendingAction}
                                                            className="flex-1 h-16 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase"
                                                        >
                                                            Decline Proposal
                                                        </Button>
                                                        <Button 
                                                            onClick={() => setApproveConfirm(true)}
                                                            disabled={isPendingAction}
                                                            className="flex-2 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                                        >
                                                            Authorize Request
                                                        </Button>
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
