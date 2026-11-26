'use client'

import { useState, useTransition, useActionState, useRef, useEffect, useCallback } from 'react'
import { Plus, Globe, Loader2, Layers, Sparkles, Tag, AlertCircle, CheckCircle2 } from 'lucide-react'
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
} from '@/features/publications'
import { publicationKeys } from '@/features/publications'
import { submissionKeys } from '@/features/submissions'
import {
    createVolumeIssue,
    assignPaperToIssue,
    getIssueNextPages
} from '@/actions/publications'
import { depositToCrossref, depositToZenodo } from '@/actions/doi-registration'
import { normalizeDoi, normalizeDoiPrefix, generateJackDoi } from '@/lib/doi-format'
import { useQueryClient } from '@tanstack/react-query'
import type { ActionResponse } from '@/db/contracts'
import { useSettingsContext } from '@/components/providers/SettingsContext'

interface PublicationAssignmentProps {
    submissionId: number;
    currentIssueId?: number | null | undefined;
    paperId?: string | undefined;
    volumeNumber?: number | null | undefined;
    year?: number | null | undefined;
}

export default function PublicationAssignment({
    submissionId,
    currentIssueId,
    paperId,
    volumeNumber,
    year,
}: PublicationAssignmentProps) {
    const queryClient = useQueryClient();
    const settings = useSettingsContext();
    const doiPrefix = normalizeDoiPrefix(settings['doiPrefix']);
    const { data: volumes = [], isLoading: loading } = useVolumesIssues();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<string>(currentIssueId?.toString() || "");
    const [startPage, setStartPage] = useState<string>("");
    const [endPage, setEndPage] = useState<string>("");
    const [isCalculatingPages, setIsCalculatingPages] = useState<boolean>(false);
    const [pageCalcInfo, setPageCalcInfo] = useState<{ previousEndPage: number; pageCount: number } | null>(null);

    const [doiChoice, setDoiChoice] = useState<'none' | 'official' | 'zenodo' | 'custom'>('none');
    const [customDoiValue, setCustomDoiValue] = useState<string>("");
    const [depositStatus, setDepositStatus] = useState<{
        status: 'idle' | 'depositing' | 'success' | 'error';
        batchId?: string;
        message?: string;
        provider?: 'crossref' | 'zenodo';
    }>({ status: 'idle' });
    const [isAssigning, startAssign] = useTransition();
    const assignmentInProgress = useRef(false);

    // Dynamically compute JACK pattern DOI when issue / volume / year is selected
    const selectedIssue = volumes.find((v) => String(v.id) === String(selectedIssueId));
    const effectiveVolume = selectedIssue?.volumeNumber ?? volumeNumber;
    const effectiveYear = selectedIssue?.year ?? year;
    const jackDoiInfo = paperId
        ? generateJackDoi(doiPrefix, paperId, effectiveVolume, effectiveYear)
        : null;

    // Auto-calculate start and end page for a selected issue
    const calculatePages = useCallback(async (issueIdStr: string) => {
        const issueIdNum = parseInt(issueIdStr);
        if (isNaN(issueIdNum)) {
            setPageCalcInfo(null);
            setStartPage("");
            setEndPage("");
            return;
        }

        setIsCalculatingPages(true);
        try {
            const res = await getIssueNextPages(issueIdNum, submissionId);
            if (res.success && res.data) {
                setStartPage(String(res.data.startPage));
                setEndPage(String(res.data.endPage));
                setPageCalcInfo({
                    previousEndPage: res.data.previousEndPage,
                    pageCount: res.data.pageCount,
                });
            }
        } catch (err) {
            console.error("Auto page calculation failed:", err);
        } finally {
            setIsCalculatingPages(false);
        }
    }, [submissionId]);

    // Handle issue selection change
    const handleIssueChange = (newIssueId: string) => {
        setSelectedIssueId(newIssueId);
        if (newIssueId) {
            calculatePages(newIssueId);
        } else {
            setPageCalcInfo(null);
            setStartPage("");
            setEndPage("");
        }
    };

    // Calculate on initial mount if an issue is already assigned but pages are empty
    useEffect(() => {
        if (currentIssueId && !startPage) {
            calculatePages(String(currentIssueId));
        }
    }, [currentIssueId, calculatePages, startPage]);

    const [, createAction, isCreating] = useActionState(async (_prev: ActionResponse | null, formData: FormData) => {
        const res = await createVolumeIssue(formData);
        if (res.success) {
            setShowCreateModal(false);
            toast.success("Publication cycle initialized");
            queryClient.invalidateQueries({ queryKey: publicationKeys.issues() });
        } else {
            toast.error(res.error || "Failed to initialize cycle");
        }
        return res;
    }, null);

    async function handleAssign() {
        if (assignmentInProgress.current) return;
        if (!selectedIssueId) {
            toast.error("Please select a target issue node");
            return;
        }

        let targetDoi: string | null = null;
        let provider: 'none' | 'crossref' | 'zenodo' | 'custom' = 'none';

        if (doiChoice === 'official') {
            targetDoi = customDoiValue.trim() ? normalizeDoi(customDoiValue, 'crossref') : null;
            provider = 'crossref';
            if (!targetDoi) {
                toast.error("Enter the Crossref DOI assigned by the admin.");
                return;
            }
        } else if (doiChoice === 'zenodo') {
            targetDoi = customDoiValue.trim() ? normalizeDoi(customDoiValue, 'zenodo') : null;
            provider = 'zenodo';
        } else if (doiChoice === 'custom') {
            targetDoi = customDoiValue.trim() ? normalizeDoi(customDoiValue, 'custom') : null;
            provider = 'custom';
            if (!targetDoi) {
                toast.error("Please enter a custom DOI or select 'No DOI'.");
                return;
            }
        } else {
            targetDoi = null;
            provider = 'none';
        }

        assignmentInProgress.current = true;
        startAssign(async () => {
            try {
                const res = await assignPaperToIssue(
                    submissionId,
                    parseInt(selectedIssueId),
                    startPage ? parseInt(startPage) : undefined,
                    endPage ? parseInt(endPage) : undefined,
                    targetDoi,
                    provider
                );
                if (res.success) {
                    queryClient.invalidateQueries({ queryKey: publicationKeys.issues() });
                    queryClient.invalidateQueries({ queryKey: submissionKeys.all });

                    if (doiChoice === 'zenodo') {
                        // If target issue is open, Zenodo deposit must wait until the issue is published
                        if (selectedIssue?.status === 'open') {
                            toast.success(`Archived to Vol ${selectedIssue.volumeNumber}, Issue ${selectedIssue.issueNumber}. Zenodo DOI will be registered once the issue is published.`);
                        } else {
                            setDepositStatus({ status: 'depositing', provider: 'zenodo' });
                            toast.info("Manuscript archived. Depositing to Zenodo via API...");
                            const zenodoRes = await depositToZenodo(submissionId);
                            if (!zenodoRes.success) {
                                setDepositStatus({
                                    status: 'error',
                                    provider: 'zenodo',
                                    message: zenodoRes.error
                                });
                                toast.warning(`Archived, but Zenodo deposit needs review: ${zenodoRes.error}`);
                            } else if (zenodoRes.data) {
                                setDepositStatus({
                                    status: 'success',
                                    provider: 'zenodo',
                                    batchId: zenodoRes.data.zenodoDoi,
                                    message: `Zenodo record: ${zenodoRes.data.recordUrl}`
                                });
                                toast.success(`Deposited to Zenodo ✓ (DOI: ${zenodoRes.data.zenodoDoi})`);
                                queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                            }
                        }
                    } else if (doiChoice === 'official') {
                        setDepositStatus({ status: 'depositing', provider: 'crossref' });
                        toast.info("Manuscript archived. Depositing to Crossref...");
                        const crossrefRes = await depositToCrossref(submissionId);
                        if (!crossrefRes.success) {
                            setDepositStatus({
                                status: 'error',
                                provider: 'crossref',
                                message: crossrefRes.error
                            });
                            toast.warning(`Archived with DOI, but Crossref deposit needs review: ${crossrefRes.error}`);
                        } else if (crossrefRes.data) {
                            setDepositStatus({
                                status: 'success',
                                provider: 'crossref',
                                batchId: crossrefRes.data.batchId,
                                message: crossrefRes.data.message
                            });
                            toast.success("Crossref deposit submitted for processing ✓");
                            queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                        }
                    } else {
                        toast.success("Manuscript assigned to issue successfully");
                    }
                } else {
                    toast.error(res.error || "Failed to assign paper to issue");
                }
            } catch {
                toast.error("Failed to assign paper to issue");
            } finally {
                assignmentInProgress.current = false;
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
                {/* Step 1: Target Issue Selection */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Step 1: Volume & Issue Cycle
                        </label>
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer text-xs font-medium">
                                    <Plus className="w-3 h-3" /> Add new issue
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/10" />
                                <DialogHeader className="space-y-2">
                                    <DialogTitle className="text-foreground">Quick Terminal</DialogTitle>
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
                            onChange={(e) => handleIssueChange(e.target.value)}
                            className="w-full h-11 bg-background border border-emerald-500/20 rounded-xl px-4 appearance-none outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-emerald-950 font-medium cursor-pointer"
                        >
                            <option value="">Select Target Issue...</option>
                            {volumes.map((vi) => (
                                <option key={vi.id} value={vi.id}>
                                    VOL {vi.volumeNumber} ISSUE {vi.issueNumber} ({vi.year}) • {vi.status === 'published' ? 'Published' : 'Open'}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Layers className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* If NO issue is selected, guide the user */}
                {!selectedIssueId ? (
                    <div className="p-5 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 text-center space-y-1.5 text-body-sm text-muted-foreground">
                        <Layers className="w-5 h-5 mx-auto text-emerald-600/60 mb-1" />
                        <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Select an Issue First</p>
                        <p className="text-caption text-muted-foreground/80 max-w-xs mx-auto">
                            Choose or create a volume and issue cycle above to reveal automatic page numbering and DOI assignment options.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Step 2: Page Numbering (Auto-calculated) */}
                        <div className="space-y-2.5 pt-2 border-t border-emerald-500/10">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Step 2: Pagination (Auto-Calculated)
                                </label>
                                {isCalculatingPages ? (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Calculating...
                                    </span>
                                ) : pageCalcInfo ? (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                                        <Sparkles className="w-3 h-3 text-emerald-600" />
                                        Auto-sequenced ({pageCalcInfo.pageCount} pp.)
                                    </span>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-caption text-muted-foreground">Start Page</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 1"
                                        value={startPage}
                                        onChange={(e) => setStartPage(e.target.value)}
                                        className="h-10 bg-background border-emerald-500/20 rounded-lg font-mono font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-caption text-muted-foreground">End Page</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 10"
                                        value={endPage}
                                        onChange={(e) => setEndPage(e.target.value)}
                                        className="h-10 bg-background border-emerald-500/20 rounded-lg font-mono font-medium"
                                    />
                                </div>
                            </div>

                            {pageCalcInfo && (
                                <div className="flex items-center justify-between text-caption text-emerald-800 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/15">
                                    <span>
                                        Sequenced from Issue {selectedIssue?.issueNumber} (previous last page: <strong className="font-mono">{pageCalcInfo.previousEndPage || 0}</strong>)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => calculatePages(selectedIssueId)}
                                        className="text-emerald-700 hover:text-emerald-900 underline text-xs font-semibold cursor-pointer"
                                    >
                                        Recalculate
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 3: DOI Allocation Protocol */}
                        <div className="space-y-2.5 pt-3 border-t border-emerald-500/10">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Step 3: DOI Assignment
                                </label>
                                <span className="text-meta text-muted-foreground font-mono">Prefix: {doiPrefix}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/40 rounded-lg border border-border/40 text-body-sm">
                                <button
                                    type="button"
                                    onClick={() => setDoiChoice('none')}
                                    className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${doiChoice === 'none' ? 'bg-white text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                                        } `}
                                >
                                    No DOI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDoiChoice('official')}
                                    className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${doiChoice === 'official' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                                        } `}
                                >
                                    CrossRef
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDoiChoice('zenodo')}
                                    className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${doiChoice === 'zenodo' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                                        } `}
                                >
                                    Zenodo API
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDoiChoice('custom')}
                                    className={`py-1.5 px-1.5 rounded text-center transition-all cursor-pointer font-medium ${doiChoice === 'custom' ? 'bg-white text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                                        } `}
                                >
                                    Custom DOI
                                </button>
                            </div>

                            {doiChoice === 'official' && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-body-sm space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-label font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5" />
                                            Crossref DOI Allocation
                                        </p>
                                        <span className="text-badge bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">JACK Pattern</span>
                                    </div>

                                    {jackDoiInfo && (
                                        <div className="bg-background/90 border border-emerald-500/30 rounded-lg p-2.5 space-y-2 shadow-xs">
                                            <div className="flex items-center justify-between text-caption">
                                                <span className="font-semibold text-emerald-900 flex items-center gap-1">
                                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                                    Suggested Suffix Formula:
                                                </span>
                                                <code className="font-mono text-meta font-bold text-emerald-800">
                                                    /{jackDoiInfo.suffix}
                                                </code>
                                            </div>

                                            {/* Visual breakdown of jack + 26 + 1 + 11 */}
                                            <div className="flex flex-wrap items-center gap-1 text-meta font-mono bg-emerald-500/5 p-1.5 rounded border border-emerald-500/15">
                                                <span className="font-bold text-foreground">j</span>
                                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[11px] font-bold" title="Year 1st digit">
                                                    {jackDoiInfo.year2[0]}
                                                </span>
                                                <span className="font-bold text-foreground">a</span>
                                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[11px] font-bold" title="Year 2nd digit">
                                                    {jackDoiInfo.year2[1]}
                                                </span>
                                                <span className="font-bold text-foreground">c</span>
                                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[11px] font-bold" title="Volume number">
                                                    {jackDoiInfo.vol}
                                                </span>
                                                <span className="font-bold text-foreground">k</span>
                                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[11px] font-bold" title="Paper sequence number">
                                                    {jackDoiInfo.paperNum}
                                                </span>
                                                <span className="text-muted-foreground ml-auto text-[11px] font-sans">
                                                    (Yr: &apos;{jackDoiInfo.year2}, Vol: {jackDoiInfo.vol}, Paper: {jackDoiInfo.paperNum})
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
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
                                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                                    <span>Use JACK: <code className="font-mono">{jackDoiInfo.suffix}</code></span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Input
                                        placeholder={`e.g. ${jackDoiInfo ? jackDoiInfo.fullDoi : `${doiPrefix}/ijitest.2026.001`}`}
                                        value={customDoiValue}
                                        onChange={(e) => setCustomDoiValue(e.target.value)}
                                        className="h-9 bg-background text-meta font-mono"
                                    />
                                    <p className="text-caption text-muted-foreground">Enter or auto-fill the DOI assigned by the journal. Crossref submission will occur during issue indexing.</p>
                                </div>
                            )}

                            {doiChoice === 'zenodo' && (
                                <div className="space-y-2">
                                    {selectedIssue?.status === 'open' ? (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-body-sm space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-label font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                    Issue Currently Open
                                                </p>
                                                <span className="text-badge bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">Pending Release</span>
                                            </div>
                                            <p className="text-caption text-muted-foreground leading-relaxed">
                                                This issue (Vol {selectedIssue.volumeNumber}, Issue {selectedIssue.issueNumber}) is in <strong>Open</strong> status. The manuscript will be assigned now. Zenodo requires an official release date, so the DOI will be registered upon issue publication.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-body-sm space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-label font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                                                    Zenodo REST API Automation
                                                </p>
                                                <span className="text-badge bg-sky-600 text-white px-1.5 py-0.2 rounded-full font-bold">Auto-Deposit</span>
                                            </div>
                                            <p className="text-caption text-muted-foreground">
                                                Uploads manuscript metadata & open-access CC-BY 4.0 license directly to Zenodo via API to assign an official <span className="font-mono font-semibold text-foreground">10.5281/zenodo</span> DOI upon archiving.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {doiChoice === 'custom' && (
                                <div className="space-y-1 pt-1">
                                    <Input
                                        placeholder="e.g. 10.1234/external-identifier"
                                        value={customDoiValue}
                                        onChange={(e) => setCustomDoiValue(e.target.value)}
                                        className="h-9 bg-background text-meta font-mono"
                                    />
                                    <p className="text-caption text-muted-foreground">Enter an external persistent digital identifier (e.g. from DataCite or institutional repository).</p>
                                </div>
                            )}

                            {depositStatus.status === 'success' && depositStatus.batchId && (
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-body-sm text-emerald-800">
                                    <p className="font-bold">
                                        {depositStatus.provider === 'zenodo' ? 'Zenodo Deposit Succeeded ✓' : 'CrossRef Deposit Submitted ✓'}
                                    </p>
                                    <p className="text-meta font-mono">
                                        {depositStatus.provider === 'zenodo' ? `DOI: ${depositStatus.batchId}` : `Batch ID: ${depositStatus.batchId}`}
                                    </p>
                                    {depositStatus.message && (
                                        <p className="text-caption text-muted-foreground mt-0.5">{depositStatus.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <Button
                onClick={handleAssign}
                disabled={isAssigning || !selectedIssueId}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.98] font-semibold tracking-wide"
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
