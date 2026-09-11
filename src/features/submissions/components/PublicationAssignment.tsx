'use client'

import { useState, useTransition, useActionState } from 'react'
import { Plus, Globe, Loader2, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    useVolumesIssues
} from '@/hooks/queries/usePublications'
import {
    createVolumeIssue,
    assignPaperToIssue
} from '@/actions/publications'
import { depositToCrossref } from '@/actions/doi-registration'
import { useQueryClient } from '@tanstack/react-query'
import { type ActionResponse } from '@/db/types'
import { useSettingsContext } from '@/components/providers/SettingsContext'

interface PublicationAssignmentProps {
    submissionId: number;
    currentIssueId?: number | null;
    paperId?: string;
}

export default function PublicationAssignment({ submissionId, currentIssueId, paperId }: PublicationAssignmentProps) {
    const queryClient = useQueryClient();
    const settings = useSettingsContext();
    const doiPrefix = settings['doiPrefix'] || '10.68139';
    const isAutoMode = settings['doiAssignmentMode'] === 'auto';
    const { data: volumes = [], isLoading: loading } = useVolumesIssues();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<string>(currentIssueId?.toString() || "");
    const [startPage, setStartPage] = useState<string>("");
    const [endPage, setEndPage] = useState<string>("");
    const [doiChoice, setDoiChoice] = useState<'none' | 'official' | 'zenodo' | 'custom'>(isAutoMode ? 'official' : 'none');
    const [customDoiValue, setCustomDoiValue] = useState<string>("");
    const [depositStatus, setDepositStatus] = useState<{
        status: 'idle' | 'depositing' | 'success' | 'error';
        batchId?: string;
        message?: string;
    }>({ status: 'idle' });
    const [isAssigning, startAssign] = useTransition();

    const [, createAction, isCreating] = useActionState(async (_prev: ActionResponse | null, formData: FormData) => {
        const res = await createVolumeIssue(formData);
        if (res.success) {
            setShowCreateModal(false);
            toast.success("Publication cycle initialized");
            queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
        } else {
            toast.error(res.error || "Failed to initialize cycle");
        }
        return res;
    }, null);

    async function handleAssign() {
        if (!selectedIssueId) {
            toast.error("Please select a target issue node");
            return;
        }

        let targetDoi: string | null = null;
        if (doiChoice === 'official') {
            targetDoi = paperId ? `${doiPrefix}/${paperId}` : doiPrefix;
        } else if (doiChoice === 'custom') {
            targetDoi = customDoiValue.trim() || null;
        } else if (doiChoice === 'zenodo') {
            targetDoi = customDoiValue.trim() || null;
        } else {
            targetDoi = null;
        }

        startAssign(async () => {
            try {
                const res = await assignPaperToIssue(
                    submissionId,
                    parseInt(selectedIssueId),
                    startPage ? parseInt(startPage) : undefined,
                    endPage ? parseInt(endPage) : undefined,
                    targetDoi,
                    doiChoice === 'official' ? 'crossref' : doiChoice
                );
                if (res.success) {
                    queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                    queryClient.invalidateQueries({ queryKey: ['submissions'] });

                    if (doiChoice === 'official') {
                        setDepositStatus({ status: 'depositing' });
                        toast.info("Manuscript archived. Submitting to CrossRef...");
                        const depRes = await depositToCrossref(submissionId);
                        if (depRes.success) {
                            setDepositStatus({
                                status: 'success',
                                batchId: depRes.data.batchId,
                                message: depRes.data.message
                            });
                            toast.success(`Registered with CrossRef ✓ (Batch: ${depRes.data.batchId})`);
                        } else {
                            setDepositStatus({
                                status: 'error',
                                message: depRes.error
                            });
                            toast.warning(`Archived, but CrossRef deposit needs review: ${depRes.error}`);
                        }
                    } else {
                        toast.success("Manuscript committed to archive");
                    }
                } else {
                    toast.error(res.error || "Failed to assign paper to issue");
                }
            } catch {
                toast.error("Failed to assign paper to issue");
            }
        });
    }

    if (loading) return (
        <div className="h-11 bg-primary/5 rounded-xl animate-pulse flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary/20 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-4 pt-4 border-t border-emerald-500/10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="opacity-40 leading-none">Volume and Issue</label>
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer">
                                    <Plus className="w-2.5 h-2.5" /> Add new
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/10" />
                                <DialogHeader className="space-y-2">
                                    <DialogTitle className="text-2xl text-foreground">Quick Terminal</DialogTitle>
                                    <DialogDescription className="opacity-60 leading-relaxed">
                                        Instantly define a new publication node for immediate manuscript archival.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={createAction} className="space-y-5 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="opacity-40">Volume</Label>
                                            <Input
                                                name="volume"
                                                type="number"
                                                required
                                                className="h-12 bg-primary/5 border-none rounded-xl px-4"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="opacity-40">Issue</Label>
                                            <Input
                                                name="issue"
                                                type="number"
                                                required
                                                className="h-12 bg-primary/5 border-none rounded-xl px-4"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="opacity-40">Year</Label>
                                        <Input
                                            name="year"
                                            type="number"
                                            required
                                            defaultValue={new Date().getFullYear()}
                                            className="h-12 bg-primary/5 border-none rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="opacity-40">Month Range</Label>
                                        <Input
                                            name="monthRange"
                                            type="text"
                                            required
                                            placeholder="e.g. Jan - Mar"
                                            className="h-12 bg-primary/5 border-none rounded-xl px-4"
                                        />
                                    </div>
                                    <DialogFooter className="pt-2">
                                         <Button disabled={isCreating} type="submit" className="w-full h-12 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer">
                                             {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                                         </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative">
                        <select
                            title="issueId"
                            value={selectedIssueId}
                            onChange={(e) => setSelectedIssueId(e.target.value)}
                            className="w-full h-11 bg-background border border-emerald-500/20 rounded-xl px-4 appearance-none outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-emerald-900 cursor-pointer"
                        >
                            <option value="">Select Target Issue...</option>
                            {volumes.map((vi) => (
                                <option key={vi.id} value={vi.id}>
                                    VOL {vi.volumeNumber} ISSUE {vi.issueNumber} ({vi.year})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Layers className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="opacity-40 leading-none">Start Page</label>
                        <Input
                            type="number"
                            placeholder="e.g. 4"
                            value={startPage}
                            onChange={(e) => setStartPage(e.target.value)}
                            className="h-10 bg-background border-emerald-500/10 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="opacity-40 leading-none">End Page</label>
                        <Input
                            type="number"
                            placeholder="e.g. 8"
                            value={endPage}
                            onChange={(e) => setEndPage(e.target.value)}
                            className="h-10 bg-background border-emerald-500/10 rounded-lg"
                        />
                    </div>
                </div>

                {/* DOI Allocation Protocol */}
                <div className="space-y-2 pt-3 border-t border-emerald-500/10">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-foreground">DOI Assignment</label>
                        <span className="text-[10px] text-muted-foreground font-mono">Prefix: {doiPrefix}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-muted/40 rounded-lg border border-border/40 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setDoiChoice('none')}
                            className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${
                                doiChoice === 'none' ? 'bg-white text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            No DOI
                        </button>
                        <button
                            type="button"
                            onClick={() => setDoiChoice('official')}
                            className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${
                                doiChoice === 'official' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            CrossRef
                        </button>
                        <button
                            type="button"
                            onClick={() => setDoiChoice('zenodo')}
                            className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${
                                doiChoice === 'zenodo' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Zenodo
                        </button>
                        <button
                            type="button"
                            onClick={() => setDoiChoice('custom')}
                            className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${
                                doiChoice === 'custom' ? 'bg-white text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Custom
                        </button>
                    </div>

                    {doiChoice === 'official' && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Official CrossRef DOI</p>
                                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">Auto-Deposit</span>
                            </div>
                            <p className="font-mono text-emerald-900 dark:text-emerald-300 break-all">{doiPrefix}/{paperId || '...'}</p>
                            <p className="text-[10px] text-muted-foreground">Generates CrossRef Schema 5.3 XML & queues live deposit to CrossRef API.</p>
                        </div>
                    )}

                    {doiChoice === 'zenodo' && (
                        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs space-y-1">
                            <p className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Zenodo Self-Archiving</p>
                            <p className="text-[10px] text-muted-foreground">Paper will be published immediately; authors or editors can deposit directly to Zenodo from the manuscript console.</p>
                        </div>
                    )}

                    {doiChoice === 'custom' && (
                        <div className="space-y-1 pt-1">
                            <Input
                                placeholder="e.g. 10.5281/zenodo.12345678"
                                value={customDoiValue}
                                onChange={(e) => setCustomDoiValue(e.target.value)}
                                className="h-9 bg-background text-xs font-mono"
                            />
                            <p className="text-[10px] text-muted-foreground">Enter the persistent digital identifier (external registrar or pre-reserved DOI).</p>
                        </div>
                    )}

                    {depositStatus.status === 'success' && depositStatus.batchId && (
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-800">
                            <p className="font-bold">CrossRef Deposit Submitted ✓</p>
                            <p className="text-[10px] font-mono">Batch ID: {depositStatus.batchId}</p>
                        </div>
                    )}
                </div>
            </div>

            <Button
                onClick={handleAssign}
                disabled={isAssigning || !selectedIssueId}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
                {isAssigning ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                    <Globe className="w-4 h-4 mr-2" />
                )}
                {isAssigning ? 'ARCHIVING & REGISTERING...' : 'Commit to Archive'}
            </Button>
        </div>
    );
}
