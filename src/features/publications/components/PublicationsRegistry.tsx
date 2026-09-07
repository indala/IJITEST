"use client";

import { useState, useTransition, useActionState } from 'react';
import { 
    Plus, BookOpen, Clock, CheckCircle2, 
    CheckCircle, Save, ChevronDown as ChevronDownIcon, ChevronUp, FileText, Eye, Unlink, Loader2 
} from 'lucide-react';
import {
    useVolumesIssues,
    usePapersByIssue
} from '@/hooks/queries/usePublications';
import {
    createVolumeIssue,
    updateVolumeIssue,
    deleteVolumeIssue,
    publishIssue,
    unassignPaperFromIssue
} from '@/actions/publications';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Issue, ActionResponse } from '@/db/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface PublicationsRegistryProps {
    role: 'admin' | 'editor';
}

export function PublicationsRegistry({ role }: PublicationsRegistryProps) {
    const queryClient = useQueryClient();
    const { data: volumes = [], isLoading: loading } = useVolumesIssues();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<(Issue & { paperCount: number }) | null>(null);
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

    const [isPublishing, startPublish] = useTransition();
    const [isDeleting, startDelete] = useTransition();
    const [isUnassigning, startUnassign] = useTransition();

    const { data: issuePapers = [], isLoading: loadingPapers } = usePapersByIssue(expandedIssue);

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

    const [, editAction, isEditing] = useActionState(async (_prev: ActionResponse | null, formData: FormData) => {
        if (!showEditModal) return { success: false, error: "No issue selected for edit" };
        const res = await updateVolumeIssue(showEditModal.id, formData);
        if (res.success) {
            setShowEditModal(null);
            toast.success("Metadata updated successfully");
            queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
        } else {
            toast.error(res.error || "Failed to update metadata");
        }
        return res;
    }, null);

    async function handlePublish(id: number) {
        if (!confirm('Are you sure you want to PUBLISH this issue? This will also update the status of all assigned papers.')) return;
        startPublish(async () => {
            try {
                const res = await publishIssue(id);
                if (res.success) {
                    toast.success("Issue published successfully");
                    queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                    queryClient.invalidateQueries({ queryKey: ['submissions'] });
                } else {
                    toast.error(res.error || "Failed to publish issue");
                }
            } catch {
                toast.error("Failed to publish issue");
            }
        });
    }

    function toggleExpand(id: number) {
        if (role !== 'admin') return; // Only admin can expand for now based on previous logic
        setExpandedIssue(expandedIssue === id ? null : id);
    }

    async function handleUnassign(paperId: number) {
        if (!confirm('Unlink this paper from this issue? Its status will revert to "Paid".')) return;
        startUnassign(async () => {
            try {
                const res = await unassignPaperFromIssue(paperId);
                if (res.success) {
                    toast.success("Paper unassigned successfully");
                    queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                    queryClient.invalidateQueries({ queryKey: ['issue-papers', expandedIssue] });
                } else {
                    toast.error(res.error || "Failed to unassign paper");
                }
            } catch {
                toast.error("Failed to unassign paper");
            }
        });
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this issue? All assigned papers will be unlinked and reverted to "Paid" status.')) return;
        startDelete(async () => {
            try {
                const res = await deleteVolumeIssue(id);
                if (res.success) {
                    toast.success("Issue deleted successfully");
                    queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                } else {
                    toast.error(res.error || "Failed to delete issue");
                }
            } catch {
                toast.error("Failed to delete issue");
            }
        });
    }

    const stats = {
        totalVolumes: new Set(volumes.map(v => v.volumeNumber)).size,
        publishedIssues: volumes.filter(v => v.status === 'published').length,
        openIssues: volumes.filter(v => v.status === 'open').length,
        totalPapers: volumes.reduce((acc, v) => acc + (v.paperCount || 0), 0)
    };

    if (loading) {
        return (
            <div className="p-20 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-primary/40 text-xs">Loading publications...</p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 text-primary shadow-xs">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <h1 className="panel-title m-0 text-xl xl:text-2xl font-bold text-primary">
                            Manage Publications
                        </h1>
                    </div>
                    <p className="panel-subtitle border-l-2 border-primary/20 pl-3 py-0.5 max-w-2xl leading-relaxed m-0 text-body-sm text-muted-foreground">
                        {role === 'admin' ? 'Manage the journal publication schedule, volumes, and archival issues.' : 'Review and manage editorial publication cycles.'}
                    </p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary h-9">
                            <Plus className="w-4 h-4 mr-2" /> New Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-5 sm:p-6 bg-card border-border/70 shadow-2xl">
                        <DialogHeader className="space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">New Publication Issue</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Define a new volume or issue to start collecting papers.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <form action={createAction} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-label text-foreground">Volume Number</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-10 bg-background border-border/70 focus-visible:ring-1 text-sm rounded-lg px-3"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-label text-foreground">Issue Number</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-10 bg-background border-border/70 focus-visible:ring-1 text-sm rounded-lg px-3"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-label text-foreground">Publication Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-10 bg-background border-border/70 focus-visible:ring-1 text-sm rounded-lg px-3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-label text-foreground">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    placeholder="e.g. Jan - Mar"
                                    className="h-10 bg-background border-border/70 focus-visible:ring-1 text-sm rounded-lg px-3"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isCreating} className="w-full btn-primary h-10 rounded-lg">
                                    {isCreating ? "Initializing..." : "Create Issue"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total Volumes', value: stats.totalVolumes, icon: BookOpen, colors: 'text-primary bg-primary/10 border-primary/20' },
                    { label: 'Published Issues', value: stats.publishedIssues, icon: CheckCircle2, colors: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Open Submissions', value: stats.openIssues, icon: Clock, colors: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
                    { label: 'Indexed', value: stats.totalPapers, icon: FileText, colors: 'text-primary bg-primary/10 border-primary/20' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="p-3.5 sm:p-4 bg-card rounded-xl shadow-2xs border border-border/70"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-label text-muted-foreground uppercase">{item.label}</p>
                                <h3 className="text-xl lg:text-2xl font-bold text-foreground">{item.value}</h3>
                            </div>
                            <div className={`w-9 h-9 rounded-lg ${item.colors} flex items-center justify-center border shadow-xs`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {volumes.map((v) => (
                    <div key={v.id}>
                        <Card className="border-border/70 shadow-2xs transition-all bg-card rounded-xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 sm:p-5 space-y-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-meta uppercase">Volume {v.volumeNumber}</p>
                                            <h3 className="font-semibold text-foreground leading-tight text-base">
                                                Issue {v.issueNumber}
                                            </h3>
                                        </div>
                                        <Badge className={`h-5 px-2 text-[10px] font-semibold rounded-md border-none ${v.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'badge-brand'}`}>
                                            {v.status === 'published' ? 'Published' : 'Open'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-muted/30 p-3 rounded-lg border border-border/70">
                                            <p className="text-meta mb-0.5">Year</p>
                                            <p className="text-base font-bold text-foreground">{v.year}</p>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-lg border border-border/70">
                                            <p className="text-meta mb-0.5">Duration</p>
                                            <p className="text-sm font-bold text-foreground truncate">{v.monthRange}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {role === 'admin' ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleExpand(v.id)}
                                                className="w-full h-9 gap-2 border-border/70 text-primary font-semibold text-xs rounded-lg hover:bg-primary/10"
                                            >
                                                {expandedIssue === v.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                                                {expandedIssue === v.id ? 'Hide Manuscripts' : `View Manuscripts (${v.paperCount || 0})`}
                                            </Button>
                                        ) : (
                                            <div className="w-full h-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 rounded-lg border border-border/70">
                                                {v.paperCount || 0} Linked
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {expandedIssue === v.id && role === 'admin' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-muted/30 rounded-xl border border-border/70"
                                                >
                                                    <div className="p-3 space-y-2">
                                                        {loadingPapers ? (
                                                            <div className="py-6 text-center">
                                                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                                                            </div>
                                                        ) : issuePapers.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {issuePapers.map((paper) => (
                                                                    <div key={paper.id} className="p-2.5 bg-card rounded-lg border border-border/70 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-2xs">
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{paper.title}</p>
                                                                            <p className="text-meta mt-0.5">ID: {paper.paperId}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <Button asChild variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary rounded-md">
                                                                                <a title='View' href={`/admin/submissions/${paper.id}`} target="_blank">
                                                                                    <Eye className="w-3.5 h-3.5" />
                                                                                </a>
                                                                            </Button>
                                                                            <Button disabled={isUnassigning} title='Unlink' onClick={() => handleUnassign(paper.id)} variant="ghost" size="icon" className="w-7 h-7 text-rose-500/70 hover:text-rose-600 rounded-md">
                                                                                {isUnassigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-6 text-center text-xs text-muted-foreground font-medium">No papers assigned yet.</div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {v.status === 'open' ? (
                                            <Button
                                                onClick={() => handlePublish(v.id)}
                                                disabled={isPublishing}
                                                className="w-full h-10 bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                            >
                                                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                Publish Issue
                                            </Button>
                                        ) : (
                                            <div className="w-full h-10 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-200/60">
                                                <CheckCircle2 className="w-4 h-4" /> Published
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/70">
                                            <button onClick={() => setShowEditModal(v)} className="text-label text-primary hover:underline font-medium cursor-pointer">Edit</button>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <button disabled={isDeleting} onClick={() => handleDelete(v.id)} className="text-label text-rose-500 hover:underline font-medium disabled:opacity-50 cursor-pointer">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-24 bg-card border border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/70 flex items-center justify-center text-muted-foreground/40 shadow-xs">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground text-lg">No Issues Found</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto px-6">There are no publication issues in the registry. Create your first volume and issue to begin.</p>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={!!showEditModal} onOpenChange={(open) => !open && setShowEditModal(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl p-6 sm:p-8 bg-card border-border/70 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Save className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Update Metadata</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Modify the volume and issue details.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    {showEditModal && (
                        <form action={editAction} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-label text-foreground">Volume</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.volumeNumber}
                                        className="h-10 bg-background border-border/70 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-label text-foreground">Issue</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.issueNumber}
                                        className="h-10 bg-background border-border/70 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-label text-foreground">Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={showEditModal.year}
                                    className="h-10 bg-background border-border/70 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-label text-foreground">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    defaultValue={showEditModal.monthRange || ""}
                                    className="h-10 bg-background border-border/70 text-sm"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button disabled={isEditing} type="submit" className="w-full h-10 btn-primary rounded-lg cursor-pointer">
                                    {isEditing ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

PublicationsRegistry.displayName = 'PublicationsRegistry';
