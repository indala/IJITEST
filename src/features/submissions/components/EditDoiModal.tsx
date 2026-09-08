"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updatePublicationDoi } from "@/actions/publications";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";

interface EditDoiModalProps {
    submissionId: number;
    paperId: string;
    currentDoi?: string | null | undefined;
}

export default function EditDoiModal({ submissionId, paperId, currentDoi }: EditDoiModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const settings = useSettingsContext();
    const queryClient = useQueryClient();

    const doiPrefix = settings['doiPrefix'] || '10.68139';
    const officialTargetDoi = `${doiPrefix}/${paperId}`;

    const isCurrentlyOfficial = currentDoi === officialTargetDoi;
    const isCurrentlyCustom = Boolean(currentDoi && !isCurrentlyOfficial);

    const initialMode: 'none' | 'official' | 'custom' = isCurrentlyOfficial
        ? 'official'
        : isCurrentlyCustom
        ? 'custom'
        : 'none';

    const [doiMode, setDoiMode] = useState<'none' | 'official' | 'custom'>(initialMode);
    const [customDoiValue, setCustomDoiValue] = useState(isCurrentlyCustom ? (currentDoi || '') : '');

    const handleOpen = (newOpen: boolean) => {
        if (newOpen) {
            setDoiMode(initialMode);
            setCustomDoiValue(isCurrentlyCustom ? (currentDoi || '') : '');
        }
        setOpen(newOpen);
    };

    const handleSave = () => {
        let finalDoi: string | null = null;
        if (doiMode === 'official') {
            finalDoi = officialTargetDoi;
        } else if (doiMode === 'custom') {
            finalDoi = customDoiValue.trim() || null;
            if (!finalDoi) {
                toast.error("Please enter a valid DOI string or select 'No DOI'.");
                return;
            }
        } else {
            finalDoi = null;
        }

        startTransition(async () => {
            try {
                const res = await updatePublicationDoi(submissionId, finalDoi);
                if (res.success) {
                    toast.success(
                        finalDoi
                            ? `DOI updated to ${finalDoi} & PDF re-branded!`
                            : "DOI removed & PDF re-branded without DOI.",
                        { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> }
                    );
                    queryClient.invalidateQueries({ queryKey: ['submissions'] });
                    queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                    setOpen(false);
                } else {
                    toast.error(res.error || "Failed to update publication DOI.");
                }
            } catch (err) {
                console.error("DOI update error:", err);
                toast.error("An unexpected error occurred while updating DOI.");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] rounded-lg border border-white/15 cursor-pointer transition-all"
                >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>{currentDoi ? "Change DOI" : "Assign DOI"}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                Manage Paper DOI
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Manuscript: <span className="font-mono font-semibold text-foreground">{paperId}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* Current Status */}
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Status</span>
                        <p className="font-mono font-medium text-foreground break-all">
                            {currentDoi ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{currentDoi}</span>
                            ) : (
                                <span className="text-muted-foreground italic">No DOI assigned (Unindexed)</span>
                            )}
                        </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Target DOI Allocation</label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50 text-xs">
                            <button
                                type="button"
                                onClick={() => setDoiMode('none')}
                                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer font-medium ${
                                    doiMode === 'none'
                                        ? 'bg-white text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                No DOI
                            </button>
                            <button
                                type="button"
                                onClick={() => setDoiMode('official')}
                                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer font-medium ${
                                    doiMode === 'official'
                                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Official CrossRef
                            </button>
                            <button
                                type="button"
                                onClick={() => setDoiMode('custom')}
                                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer font-medium ${
                                    doiMode === 'custom'
                                        ? 'bg-white text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Zenodo / Custom
                            </button>
                        </div>
                    </div>

                    {/* Detail for Mode */}
                    {doiMode === 'official' && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Official Journal DOI Target
                            </p>
                            <p className="font-mono text-emerald-950 dark:text-emerald-200 break-all font-semibold">
                                {officialTargetDoi}
                            </p>
                            <p className="text-[10px] text-muted-foreground pt-1">
                                Will be permanently stamped on the PDF and submitted to CrossRef metadata.
                            </p>
                        </div>
                    )}

                    {doiMode === 'custom' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Custom DOI / Identifier</label>
                            <Input
                                placeholder="e.g. 10.5281/zenodo.12345678"
                                value={customDoiValue}
                                onChange={(e) => setCustomDoiValue(e.target.value)}
                                className="h-10 text-xs font-mono bg-background"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Enter the persistent digital identifier from Zenodo, DataCite, or another provider.
                            </p>
                        </div>
                    )}

                    {doiMode === 'none' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
                            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                Unassigned Mode
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                This paper will not display a DOI badge or link. The PDF will be re-branded with only journal particulars and ISSN.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                        className="h-10 text-xs rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20"
                    >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                        Commit DOI Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
