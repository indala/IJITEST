"use client";

import { useRef, useState, useTransition } from "react";
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
import { depositToCrossref, depositToZenodo } from "@/actions/doi-registration";
import { normalizeDoi, normalizeDoiPrefix, generateJackDoi } from "@/lib/doi-format";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { publicationKeys } from "@/features/publications";
import { submissionKeys } from "@/features/submissions";

interface EditDoiModalProps {
    submissionId: number;
    paperId: string;
    volumeNumber?: number | null | undefined;
    year?: number | null | undefined;
    currentDoi?: string | null | undefined;
    currentProvider?: 'none' | 'crossref' | 'zenodo' | 'custom' | null | undefined;
    zenodoDoi?: string | null | undefined;
    zenodoStatus?: 'none' | 'pending' | 'published' | 'failed' | null | undefined;
    zenodoRecordUrl?: string | null | undefined;
}

export default function EditDoiModal({
    submissionId,
    paperId,
    volumeNumber,
    year,
    currentDoi,
    currentProvider,
    zenodoDoi,
    zenodoStatus,
    zenodoRecordUrl,
}: EditDoiModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isDepositingZenodo, setIsDepositingZenodo] = useState(false);
    const [isDepositingCrossref, setIsDepositingCrossref] = useState(false);
    const doiActionInProgress = useRef(false);
    const settings = useSettingsContext();
    const queryClient = useQueryClient();

    const doiPrefix = normalizeDoiPrefix(settings['doiPrefix']);

    // JACK pattern suggested DOI: e.g. "ijitest.j2a6c1k11" (jack + 26 + 1 + 11)
    const jackDoiInfo = generateJackDoi(doiPrefix, paperId, volumeNumber, year);

    const suggestedCrossrefDoi = jackDoiInfo.fullDoi;

    const isCurrentlyOfficial = currentProvider === 'crossref';
    const isCurrentlyZenodo = currentProvider === 'zenodo' || Boolean(zenodoDoi) || (currentDoi ? currentDoi.toLowerCase().includes('zenodo') : false);
    const isCurrentlyCustom = currentProvider === 'custom' || (Boolean(currentDoi) && !isCurrentlyOfficial && !isCurrentlyZenodo);

    const initialMode: 'none' | 'official' | 'zenodo' | 'custom' = isCurrentlyOfficial
        ? 'official'
        : isCurrentlyZenodo
            ? 'zenodo'
            : isCurrentlyCustom
                ? 'custom'
                : 'none';

    const activeZenodoDoi = zenodoDoi || (isCurrentlyZenodo ? (currentDoi || '') : '');

    const [doiMode, setDoiMode] = useState<'none' | 'official' | 'zenodo' | 'custom'>(initialMode);
    const [customDoiValue, setCustomDoiValue] = useState(isCurrentlyCustom || isCurrentlyOfficial ? (currentDoi || '') : '');
    const [zenodoDoiValue, setZenodoDoiValue] = useState(activeZenodoDoi);

    const handleOpen = (newOpen: boolean) => {
        if (newOpen) {
            setDoiMode(initialMode);
            setCustomDoiValue(isCurrentlyCustom || isCurrentlyOfficial ? (currentDoi || '') : '');
            setZenodoDoiValue(activeZenodoDoi);
        }
        setOpen(newOpen);
    };

    // 1-Click Zenodo Deposit via API
    const handleDepositZenodoApi = async () => {
        if (doiActionInProgress.current) return;
        doiActionInProgress.current = true;
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
                toast.error(res.success ? "Zenodo deposit returned no record." : res.error);
            }
        } catch (err) {
            console.error("Zenodo deposit error:", err);
            toast.error("An unexpected error occurred while communicating with Zenodo.");
        } finally {
            setIsDepositingZenodo(false);
            doiActionInProgress.current = false;
        }
    };

    const handleSave = () => {
        if (doiActionInProgress.current) return;
        let finalDoi: string | null = null;
        let provider: 'none' | 'crossref' | 'zenodo' | 'custom' = 'none';

        if (doiMode === 'official') {
            finalDoi = customDoiValue.trim() ? normalizeDoi(customDoiValue, 'crossref') : null;
            provider = 'crossref';
            if (!finalDoi) {
                toast.error("Please enter the Crossref DOI assigned by the admin.");
                return;
            }
        } else if (doiMode === 'zenodo') {
            finalDoi = zenodoDoiValue.trim() ? normalizeDoi(zenodoDoiValue, 'zenodo') : null;
            provider = 'zenodo';
            if (!finalDoi) {
                toast.error("Please click 'Deposit via Zenodo API' or enter a valid Zenodo DOI.");
                return;
            }
        } else if (doiMode === 'custom') {
            finalDoi = customDoiValue.trim() ? normalizeDoi(customDoiValue, 'custom') : null;
            provider = 'custom';
            if (!finalDoi) {
                toast.error("Please enter a valid DOI string or select 'No DOI'.");
                return;
            }
        } else {
            finalDoi = null;
            provider = 'none';
        }

        doiActionInProgress.current = true;
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
            } finally {
                doiActionInProgress.current = false;
            }
        });
    };

    const handleSaveAndDepositCrossref = async () => {
        if (doiActionInProgress.current) return;
        const finalDoi = customDoiValue.trim() || suggestedCrossrefDoi;
        if (!finalDoi) {
            toast.error("Please enter or auto-suggest the Crossref DOI first.");
            return;
        }
        doiActionInProgress.current = true;
        setIsDepositingCrossref(true);
        toast.info("Saving DOI and submitting deposit to Crossref...");
        try {
            const saveRes = await updatePublicationDoi(submissionId, finalDoi, 'crossref');
            if (!saveRes.success) {
                toast.error(saveRes.error || "Failed to save DOI before deposit.");
                setIsDepositingCrossref(false);
                return;
            }
            const depRes = await depositToCrossref(submissionId);
            if (depRes.success && depRes.data) {
                toast.success(`DOI saved & Crossref deposit queued ✓ (Batch ID: ${depRes.data.batchId})`);
                queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                queryClient.invalidateQueries({ queryKey: publicationKeys.issues() });
                setOpen(false);
            } else {
                toast.error(depRes.success ? "Crossref deposit returned no batch information." : depRes.error);
            }
        } catch (err) {
            console.error("Crossref save & deposit error:", err);
            toast.error("An unexpected error occurred while communicating with Crossref.");
        } finally {
            setIsDepositingCrossref(false);
            doiActionInProgress.current = false;
        }
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
            <DialogContent className="panel-dialog-content sm:max-w-lg rounded-2xl p-4 sm:p-6 bg-card border-border shadow-2xl">
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

                <div className="panel-dialog-body space-y-4 py-3">
                    {/* Current Status */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3 bg-muted/40 rounded-xl border border-border/60 text-body-sm">
                        <span className="text-label font-bold text-muted-foreground uppercase tracking-wider">Current DOI</span>
                        <span className="text-badge px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-background border border-border/60 text-muted-foreground">
                            {currentProvider || (currentDoi ? 'custom' : 'none')}
                        </span>
                        <p className="w-full font-mono font-medium text-foreground break-all">
                            {currentDoi ? (
                                <span className="text-emerald-700 font-semibold">{currentDoi}</span>
                            ) : (
                                <span className="text-muted-foreground italic">No DOI assigned</span>
                            )}
                        </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="space-y-2">
                        <label className="form-label-brand font-semibold text-foreground">Target DOI Allocation Provider</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/50 rounded-xl border border-border/50 text-body-sm">
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
                                onClick={() => {
                                    setDoiMode('official');
                                    if (!customDoiValue.trim()) {
                                        setCustomDoiValue(suggestedCrossrefDoi);
                                    }
                                }}
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
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-body-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-label font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Crossref DOI Allocation
                                </p>
                                <span className="text-badge bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                    JACK Pattern
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 bg-background/90 border border-emerald-500/30 rounded-lg p-3">
                                <div className="min-w-0">
                                    <p className="text-caption font-semibold text-emerald-900">Suggested DOI</p>
                                    <code className="font-mono text-meta font-bold text-emerald-800 break-all">{jackDoiInfo.fullDoi}</code>
                                    <p className="text-caption mt-1">Year &apos;{jackDoiInfo.year2} · Volume {jackDoiInfo.vol} · Paper #{jackDoiInfo.paperNum}</p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={customDoiValue === jackDoiInfo.fullDoi ? "default" : "outline"}
                                    onClick={() => setCustomDoiValue(jackDoiInfo.fullDoi)}
                                    className={`h-7 text-[11px] font-semibold gap-1 cursor-pointer ${
                                        customDoiValue === jackDoiInfo.fullDoi
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300"
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Use suggestion</span>
                                </Button>
                            </div>

                            <div className="space-y-1.5">
                                <Input
                                    placeholder={`e.g. ${jackDoiInfo.fullDoi}`}
                                    value={customDoiValue}
                                    onChange={(e) => setCustomDoiValue(e.target.value)}
                                    className="h-9 text-meta font-mono bg-background"
                                />
                            </div>
                        </div>
                    )}

                    {/* Detail for Zenodo Mode */}
                    {doiMode === 'zenodo' && (
                        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-body-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-label font-bold text-sky-700 uppercase tracking-wider">
                                    Zenodo Deposit
                                </p>
                            </div>

                            {zenodoStatus === 'published' && (zenodoDoi || zenodoDoiValue) && (
                                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-caption font-bold text-emerald-700 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live on Zenodo
                                        </span>
                                        {zenodoRecordUrl && (
                                            <a
                                                href={zenodoRecordUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-caption text-sky-600 hover:underline font-semibold"
                                            >
                                                <ExternalLink className="w-3 h-3" /> View Record
                                            </a>
                                        )}
                                    </div>
                                    <p className="font-mono text-meta font-semibold text-emerald-950 break-all">{zenodoDoi || zenodoDoiValue}</p>
                                </div>
                            )}
                            
                            <p className="text-caption text-muted-foreground leading-relaxed">
                                Deposits the published PDF and article metadata to Zenodo under a CC-BY 4.0 license.
                            </p>

                            {zenodoStatus === 'pending' && (
                                <p className="text-caption text-amber-700" role="status">
                                    Deposit is processing. Check the Zenodo record before retrying.
                                </p>
                            )}

                            {zenodoStatus !== 'published' && zenodoStatus !== 'pending' && (
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
                                    {isDepositingZenodo ? "Depositing to Zenodo..." : "Deposit to Zenodo"}
                                </Button>
                            )}

                            {zenodoStatus !== 'published' && zenodoStatus !== 'pending' && (
                                <div className="pt-2 border-t border-sky-500/20 space-y-1">
                                <label className="text-caption font-medium text-muted-foreground">Or Manually Link Zenodo DOI:</label>
                                <Input
                                    placeholder="e.g. 10.5281/zenodo.12345678"
                                    value={zenodoDoiValue}
                                    onChange={(e) => setZenodoDoiValue(e.target.value)}
                                    className="h-9 text-meta font-mono bg-background"
                                />
                                {zenodoRecordUrl && !zenodoStatus && (
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
                            )}
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

                <DialogFooter className="gap-2 sm:gap-2 pt-2 flex-wrap sm:flex-nowrap justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending || isDepositingZenodo || isDepositingCrossref}
                        className="h-10 text-body-sm rounded-xl cursor-pointer"
                    >
                        Cancel
                    </Button>

                    {doiMode === 'official' ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSave}
                                disabled={isPending || isDepositingZenodo || isDepositingCrossref}
                                className="h-10 text-body-sm font-semibold rounded-xl cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                                Save DOI Only
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveAndDepositCrossref}
                                disabled={isPending || isDepositingZenodo || isDepositingCrossref}
                                className="h-10 text-body-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer gap-1.5"
                            >
                                {isDepositingCrossref ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Globe className="w-3.5 h-3.5" />
                                )}
                                Save & Deposit to Crossref
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isPending || isDepositingZenodo || isDepositingCrossref}
                            className="h-10 text-body-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                            Save DOI Settings
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
