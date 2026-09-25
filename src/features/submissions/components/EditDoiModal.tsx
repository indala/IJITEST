"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, CheckCircle2, Tag, ExternalLink, Sparkles } from "lucide-react";
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
import { depositToZenodo } from "@/actions/doi-registration";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { publicationKeys } from "@/features/publications";
import { submissionKeys } from "@/features/submissions";

interface EditDoiModalProps {
    submissionId: number;
    paperId: string;
    currentDoi?: string | null | undefined;
    currentProvider?: 'none' | 'crossref' | 'zenodo' | 'custom' | null | undefined;
    zenodoRecordUrl?: string | null | undefined;
}

export default function EditDoiModal({
    submissionId,
    paperId,
    currentDoi,
    currentProvider,
    zenodoRecordUrl,
}: EditDoiModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isDepositingZenodo, setIsDepositingZenodo] = useState(false);
    const settings = useSettingsContext();
    const queryClient = useQueryClient();

    const doiPrefix = settings['doiPrefix'] || '10.68139';
    const officialTargetDoi = `${doiPrefix}/${paperId}`;

    const isCurrentlyOfficial = currentProvider === 'crossref' || currentDoi === officialTargetDoi;
    const isCurrentlyZenodo = currentProvider === 'zenodo' || (currentDoi ? currentDoi.toLowerCase().includes('zenodo') : false);
    const isCurrentlyCustom = currentProvider === 'custom' || (Boolean(currentDoi) && !isCurrentlyOfficial && !isCurrentlyZenodo);

    const initialMode: 'none' | 'official' | 'zenodo' | 'custom' = isCurrentlyOfficial
        ? 'official'
        : isCurrentlyZenodo
            ? 'zenodo'
            : isCurrentlyCustom
                ? 'custom'
                : 'none';

    const [doiMode, setDoiMode] = useState<'none' | 'official' | 'zenodo' | 'custom'>(initialMode);
    const [customDoiValue, setCustomDoiValue] = useState(isCurrentlyCustom ? (currentDoi || '') : '');
    const [zenodoDoiValue, setZenodoDoiValue] = useState(isCurrentlyZenodo ? (currentDoi || '') : '');

    const handleOpen = (newOpen: boolean) => {
        if (newOpen) {
            setDoiMode(initialMode);
            setCustomDoiValue(isCurrentlyCustom ? (currentDoi || '') : '');
            setZenodoDoiValue(isCurrentlyZenodo ? (currentDoi || '') : '');
        }
        setOpen(newOpen);
    };

    // 1-Click Zenodo Deposit via API
    const handleDepositZenodoApi = async () => {
        setIsDepositingZenodo(true);
        toast.info("Submitting manuscript metadata to Zenodo API...");
        try {
            const res = await depositToZenodo(submissionId);
            if (res.success && res.data) {
                toast.success(`Successfully deposited to Zenodo! DOI: ${res.data.zenodoDoi}`, {
                    icon: <CheckCircle2 className="w-5 h-5 text-sky-500" />,
                });
                setZenodoDoiValue(res.data.zenodoDoi);
                queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                queryClient.invalidateQueries({ queryKey: publicationKeys.issues() });
                setOpen(false);
            } else {
                toast.error(res.error || "Failed to deposit to Zenodo.");
            }
        } catch (err) {
            console.error("Zenodo deposit error:", err);
            toast.error("An unexpected error occurred while communicating with Zenodo.");
        } finally {
            setIsDepositingZenodo(false);
        }
    };

    const handleSave = () => {
        let finalDoi: string | null = null;
        let provider: 'none' | 'crossref' | 'zenodo' | 'custom' = 'none';

        if (doiMode === 'official') {
            finalDoi = officialTargetDoi;
            provider = 'crossref';
        } else if (doiMode === 'zenodo') {
            finalDoi = zenodoDoiValue.trim() || null;
            provider = 'zenodo';
            if (!finalDoi) {
                toast.error("Please click 'Deposit via Zenodo API' or enter a valid Zenodo DOI.");
                return;
            }
        } else if (doiMode === 'custom') {
            finalDoi = customDoiValue.trim() || null;
            provider = 'custom';
            if (!finalDoi) {
                toast.error("Please enter a valid DOI string or select 'No DOI'.");
                return;
            }
        } else {
            finalDoi = null;
            provider = 'none';
        }

        startTransition(async () => {
            try {
                const res = await updatePublicationDoi(submissionId, finalDoi, provider);
                if (res.success) {
                    toast.success(
                        finalDoi
                            ? `DOI updated to ${finalDoi} & PDF re-branded!`
                            : "DOI removed & PDF re-branded without DOI.",
                        { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> }
                    );
                    queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                    queryClient.invalidateQueries({ queryKey: publicationKeys.issues() });
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
                    className="h-7 px-2.5 gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/15 cursor-pointer transition-all"
                >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>{currentDoi ? "Change DOI" : "Assign DOI"}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="font-bold text-foreground">
                                Manage Manuscript DOI
                            </DialogTitle>
                            <DialogDescription className="text-caption text-muted-foreground">
                                Manuscript: <span className="font-mono font-semibold text-foreground">{paperId}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* Current Status */}
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-body-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-label font-bold text-muted-foreground uppercase tracking-wider">Current Allocation</span>
                            <span className="text-badge px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-background border border-border/60 text-muted-foreground">
                                Provider: {currentProvider || (currentDoi ? 'custom' : 'none')}
                            </span>
                        </div>
                        <p className="font-mono font-medium text-foreground break-all">
                            {currentDoi ? (
                                <span className="text-emerald-700 font-semibold">{currentDoi}</span>
                            ) : (
                                <span className="text-muted-foreground italic">No DOI assigned (Unindexed)</span>
                            )}
                        </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="space-y-2">
                        <label className="form-label-brand font-semibold text-foreground">Target DOI Allocation Provider</label>
                        <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-xl border border-border/50 text-body-sm">
                            <button
                                type="button"
                                onClick={() => setDoiMode('none')}
                                className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${doiMode === 'none'
                                        ? 'bg-white text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                No DOI
                            </button>
                            <button
                                type="button"
                                onClick={() => setDoiMode('official')}
                                className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${doiMode === 'official'
                                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                CrossRef
                            </button>
                            <button
                                type="button"
                                onClick={() => setDoiMode('zenodo')}
                                className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${doiMode === 'zenodo'
                                        ? 'bg-sky-600 text-white shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Zenodo API
                            </button>
                            <button
                                type="button"
                                onClick={() => setDoiMode('custom')}
                                className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${doiMode === 'custom'
                                        ? 'bg-white text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Custom
                            </button>
                        </div>
                    </div>

                    {/* Detail for CrossRef Mode */}
                    {doiMode === 'official' && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-body-sm space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-label font-bold text-emerald-700 uppercase tracking-wider">
                                    Official CrossRef DOI Target
                                </p>
                                <span className="text-badge bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">CrossRef Prefix</span>
                            </div>
                            <p className="font-mono text-emerald-950 break-all font-semibold">
                                {officialTargetDoi}
                            </p>
                            <p className="text-caption text-muted-foreground pt-1">
                                Will stamp the journal&apos;s CrossRef prefix onto the PDF and enable CrossRef Schema 5.3 XML metadata submission.
                            </p>
                        </div>
                    )}

                    {/* Detail for Zenodo Mode */}
                    {doiMode === 'zenodo' && (
                        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-body-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-label font-bold text-sky-700 uppercase tracking-wider">
                                    Zenodo REST API Integration
                                </p>
                                <span className="text-badge bg-sky-600 text-white px-1.5 py-0.2 rounded-full font-bold">1-Click API</span>
                            </div>
                            
                            <p className="text-caption text-muted-foreground leading-relaxed">
                                Uploads manuscript metadata and CC-BY 4.0 license directly to Zenodo via REST API to generate a <span className="font-mono font-semibold text-foreground">10.5281/zenodo</span> DOI.
                            </p>

                            <Button
                                type="button"
                                onClick={handleDepositZenodoApi}
                                disabled={isDepositingZenodo || isPending}
                                className="w-full h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md shadow-sky-600/20 gap-2 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                {isDepositingZenodo ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                {isDepositingZenodo ? "Depositing to Zenodo API..." : "Deposit to Zenodo via API (1-Click)"}
                            </Button>

                            <div className="pt-2 border-t border-sky-500/20 space-y-1">
                                <label className="text-caption font-medium text-muted-foreground">Or Manually Link Zenodo DOI:</label>
                                <Input
                                    placeholder="e.g. 10.5281/zenodo.12345678"
                                    value={zenodoDoiValue}
                                    onChange={(e) => setZenodoDoiValue(e.target.value)}
                                    className="h-9 text-meta font-mono bg-background"
                                />
                                {zenodoRecordUrl && (
                                    <a
                                        href={zenodoRecordUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-caption text-sky-600 hover:underline pt-1 font-medium"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Linked Zenodo Record
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Detail for Custom Mode */}
                    {doiMode === 'custom' && (
                        <div className="space-y-1.5">
                            <label className="form-label-brand font-semibold text-foreground">Custom External DOI / URI</label>
                            <Input
                                placeholder="e.g. 10.1234/custom-identifier"
                                value={customDoiValue}
                                onChange={(e) => setCustomDoiValue(e.target.value)}
                                className="h-10 text-meta font-mono bg-background"
                            />
                            <p className="text-caption text-muted-foreground">
                                Enter a persistent digital identifier from DataCite, Figshare, or another external registrar.
                            </p>
                        </div>
                    )}

                    {/* Detail for None Mode */}
                    {doiMode === 'none' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-body-sm space-y-1">
                            <p className="text-label font-bold text-amber-700 uppercase tracking-wider">
                                Unassigned Mode
                            </p>
                            <p className="text-caption text-muted-foreground leading-relaxed">
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
                        disabled={isPending || isDepositingZenodo}
                        className="h-10 text-body-sm rounded-xl cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending || isDepositingZenodo}
                        className="h-10 text-body-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                        Save DOI Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
