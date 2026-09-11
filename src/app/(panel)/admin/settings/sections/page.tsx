"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
    Bookmark,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    FileText,
    Layers,
    Hash,
    ShieldCheck,
    Search,
    Loader2,
    ArrowLeft,
    AlertTriangle,
    EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    getAllSectionsAdmin,
    createSection,
    updateSection,
    deleteSection
} from "@/actions/sections";
import type { Section } from "@/db/types";

type SectionWithCount = Section & { submissionCount: number };

interface SectionFormState {
    title: string;
    abbrev: string;
    policy: string;
    identifyType: string;
    wordCount: string;
    sequence: number;
    metaIndexed: boolean;
    metaReviewed: boolean;
    abstractsNotRequired: boolean;
    editorRestricted: boolean;
    isInactive: boolean;
}

const defaultFormState: SectionFormState = {
    title: "",
    abbrev: "",
    policy: "",
    identifyType: "Research Article",
    wordCount: "8000",
    sequence: 0,
    metaIndexed: true,
    metaReviewed: true,
    abstractsNotRequired: false,
    editorRestricted: false,
    isInactive: false,
};

export default function AdminSectionsPage() {
    const [sectionsList, setSectionsList] = useState<SectionWithCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<SectionWithCount | null>(null);
    const [formState, setFormState] = useState<SectionFormState>(defaultFormState);
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<SectionWithCount | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadSections = async () => {
        setIsLoading(true);
        try {
            const res = await getAllSectionsAdmin();
            if (res.success && res.data) {
                setSectionsList(res.data);
            } else {
                toast.error(res.error || "Failed to load journal sections");
            }
        } catch (error) {
            console.error("Load sections error:", error);
            toast.error("Network error while loading sections");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSections();
    }, []);

    const handleOpenCreate = () => {
        setEditingSection(null);
        setFormState({
            ...defaultFormState,
            sequence: sectionsList.length + 1,
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (sec: SectionWithCount) => {
        setEditingSection(sec);
        setFormState({
            title: sec.title,
            abbrev: sec.abbrev,
            policy: sec.policy || "",
            identifyType: sec.identifyType || "",
            wordCount: sec.wordCount ? String(sec.wordCount) : "",
            sequence: sec.sequence,
            metaIndexed: sec.metaIndexed,
            metaReviewed: sec.metaReviewed,
            abstractsNotRequired: sec.abstractsNotRequired,
            editorRestricted: sec.editorRestricted,
            isInactive: sec.isInactive,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title.trim()) {
            toast.error("Section title is required");
            return;
        }
        if (!formState.abbrev.trim()) {
            toast.error("Section abbreviation is required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formState.title.trim(),
                abbrev: formState.abbrev.trim().toUpperCase(),
                policy: formState.policy.trim() || null,
                identifyType: formState.identifyType.trim() || null,
                wordCount: formState.wordCount ? Number(formState.wordCount) : null,
                sequence: Number(formState.sequence) || 0,
                metaIndexed: formState.metaIndexed,
                metaReviewed: formState.metaReviewed,
                abstractsNotRequired: formState.abstractsNotRequired,
                editorRestricted: formState.editorRestricted,
                isInactive: formState.isInactive,
            };

            if (editingSection) {
                const res = await updateSection(editingSection.id, payload);
                if (res.success) {
                    toast.success("Section updated successfully");
                    setIsDialogOpen(false);
                    await loadSections();
                } else {
                    toast.error(res.error || "Failed to update section");
                }
            } else {
                const res = await createSection(payload);
                if (res.success) {
                    toast.success("Section created successfully");
                    setIsDialogOpen(false);
                    await loadSections();
                } else {
                    toast.error(res.error || "Failed to create section");
                }
            }
        } catch (err) {
            console.error("Save section error:", err);
            toast.error("Error saving section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await deleteSection(deleteTarget.id);
            if (res.success) {
                toast.success(res.message || "Section deleted");
                setDeleteTarget(null);
                await loadSections();
            } else {
                toast.error(res.error || "Failed to delete section");
            }
        } catch (err) {
            console.error("Delete section error:", err);
            toast.error("Error deleting section");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleQuickToggleActive = async (sec: SectionWithCount) => {
        startTransition(async () => {
            const newStatus = !sec.isInactive;
            const res = await updateSection(sec.id, { isInactive: newStatus });
            if (res.success) {
                toast.success(`Section ${newStatus ? "deactivated" : "activated"}`);
                setSectionsList(prev =>
                    prev.map(item => item.id === sec.id ? { ...item, isInactive: newStatus } : item)
                );
            } else {
                toast.error(res.error || "Failed to update status");
            }
        });
    };

    const filteredSections = sectionsList.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.abbrev.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.policy && s.policy.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeCount = sectionsList.filter(s => !s.isInactive).length;
    const inactiveCount = sectionsList.filter(s => s.isInactive).length;

    return (
        <div className="space-y-6">
            {/* Header & Back Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Link href="/admin/settings" className="hover:text-primary flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>System Settings</span>
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-foreground">Journal Sections</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                        <Bookmark className="w-6 h-6 text-primary" />
                        Journal Sections Management
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Configure manuscript classifications, word count restrictions, peer-review mandates, and indexing metadata (OJS Section Classification).
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-[#000088] text-white font-bold h-10 px-4 rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Section
                </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/60 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sections</p>
                            <p className="text-2xl font-black text-foreground mt-0.5">{sectionsList.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active for Submissions</p>
                            <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inactive / Hidden</p>
                            <p className="text-2xl font-black text-muted-foreground mt-0.5">{inactiveCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-muted/30 text-muted-foreground flex items-center justify-center">
                            <EyeOff className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search sections by title, abbreviation, or policy scope..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-border/70 bg-card"
                    />
                </div>
            </div>

            {/* Sections List */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold">Loading journal sections...</p>
                </div>
            ) : filteredSections.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-border/70 rounded-2xl bg-card p-6">
                    <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-foreground">No Journal Sections Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                        {searchQuery ? "No sections match your search query." : "No sections have been created yet. Click below to add one."}
                    </p>
                    <Button onClick={handleOpenCreate} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Section
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSections.map((sec) => (
                        <Card key={sec.id} className={`border transition-all ${
                            sec.isInactive ? "opacity-70 bg-muted/20 border-border/40" : "border-border/70 bg-card shadow-2xs hover:border-primary/30"
                        }`}>
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                                #{sec.sequence}
                                            </span>
                                            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-secondary/10 text-secondary-foreground font-black tracking-wide border border-secondary/20">
                                                {sec.abbrev}
                                            </span>
                                            <h3 className="text-base font-bold text-foreground m-0">
                                                {sec.title}
                                            </h3>
                                            {sec.identifyType && (
                                                <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                                                    {sec.identifyType}
                                                </Badge>
                                            )}
                                            {sec.isInactive && (
                                                <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/5">
                                                    Inactive
                                                </Badge>
                                            )}
                                            {sec.editorRestricted && (
                                                <Badge variant="outline" className="text-xs text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/5">
                                                    Editor Restricted
                                                </Badge>
                                            )}
                                        </div>

                                        {sec.policy ? (
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {sec.policy}
                                            </p>
                                        ) : (
                                            <p className="text-xs italic text-muted-foreground/60">
                                                No specific editorial policy defined.
                                            </p>
                                        )}

                                        {/* Policy flags & specs */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                                            {sec.wordCount ? (
                                                <span className="inline-flex items-center gap-1 text-muted-foreground px-2 py-1 rounded bg-muted/40 font-medium">
                                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                                    Max {sec.wordCount.toLocaleString()} words
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-muted-foreground px-2 py-1 rounded bg-muted/40 font-medium">
                                                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                                    No word limit
                                                </span>
                                            )}

                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium ${
                                                sec.metaReviewed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"
                                            }`}>
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {sec.metaReviewed ? "Peer Reviewed" : "Not Peer Reviewed"}
                                            </span>

                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium ${
                                                sec.metaIndexed ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-muted/40 text-muted-foreground"
                                            }`}>
                                                <Hash className="w-3.5 h-3.5" />
                                                {sec.metaIndexed ? "Indexed in Feeds & DOI" : "Not Indexed"}
                                            </span>

                                            <span className="inline-flex items-center gap-1 text-muted-foreground px-2 py-1 rounded bg-muted/40 font-medium">
                                                <Layers className="w-3.5 h-3.5" />
                                                {sec.submissionCount} {sec.submissionCount === 1 ? "submission" : "submissions"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickToggleActive(sec)}
                                            disabled={isPending}
                                            className="h-8 text-xs font-semibold"
                                        >
                                            {sec.isInactive ? "Activate" : "Deactivate"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(sec)}
                                            className="h-8 text-xs font-semibold"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteTarget(sec)}
                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSave} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-primary" />
                                {editingSection ? "Edit Journal Section" : "Create New Journal Section"}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Manage classification details, word limitations, and editorial review requirements.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="sec-title" className="text-xs font-semibold">
                                        Section Title *
                                    </Label>
                                    <Input
                                        id="sec-title"
                                        placeholder="e.g. Original Research Articles"
                                        value={formState.title}
                                        onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sec-abbrev" className="text-xs font-semibold">
                                        Abbreviation *
                                    </Label>
                                    <Input
                                        id="sec-abbrev"
                                        placeholder="e.g. RES"
                                        maxLength={10}
                                        value={formState.abbrev}
                                        onChange={(e) => setFormState(prev => ({ ...prev, abbrev: e.target.value.toUpperCase() }))}
                                        className="h-9 text-xs font-mono uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sec-policy" className="text-xs font-semibold">
                                    Section Policy & Scope
                                </Label>
                                <Textarea
                                    id="sec-policy"
                                    placeholder="Describe the scope, thematic criteria, and standards for papers submitted to this section..."
                                    rows={3}
                                    value={formState.policy}
                                    onChange={(e) => setFormState(prev => ({ ...prev, policy: e.target.value }))}
                                    className="text-xs leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="sec-identify-type" className="text-xs font-semibold">
                                        Content Identification Genre (OJS identifyType)
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">Used in JATS & CrossRef metadata</span>
                                </div>
                                <Input
                                    id="sec-identify-type"
                                    placeholder="e.g. Research Article, Review Article, Short Communication, Case Study"
                                    value={formState.identifyType}
                                    onChange={(e) => setFormState(prev => ({ ...prev, identifyType: e.target.value }))}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="sec-wordcount" className="text-xs font-semibold">
                                        Word Count Limit
                                    </Label>
                                    <Input
                                        id="sec-wordcount"
                                        type="number"
                                        placeholder="e.g. 8000 (leave blank for unlimited)"
                                        value={formState.wordCount}
                                        onChange={(e) => setFormState(prev => ({ ...prev, wordCount: e.target.value }))}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sec-sequence" className="text-xs font-semibold">
                                        Display Sequence Order
                                    </Label>
                                    <Input
                                        id="sec-sequence"
                                        type="number"
                                        placeholder="1, 2, 3..."
                                        value={formState.sequence}
                                        onChange={(e) => setFormState(prev => ({ ...prev, sequence: Number(e.target.value) || 0 }))}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Switches / Policy checkboxes */}
                            <div className="pt-2 border-t border-border/50 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground">Active for Submissions</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Allow authors to select this section when submitting manuscripts.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={!formState.isInactive}
                                        onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isInactive: !checked }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground">Peer Reviewed</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Manuscripts submitted to this section require formal peer review before acceptance.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formState.metaReviewed}
                                        onCheckedChange={(checked) => setFormState(prev => ({ ...prev, metaReviewed: checked }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground">Indexing & Metadata Feeds</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Include papers in this section in journal search indexing, DOAJ, and Crossref DOI feeds.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formState.metaIndexed}
                                        onCheckedChange={(checked) => setFormState(prev => ({ ...prev, metaIndexed: checked }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground">Editor-Restricted Section</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Items can only be submitted by Editors (e.g., Editorials, Retractions, Announcements).
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formState.editorRestricted}
                                        onCheckedChange={(checked) => setFormState(prev => ({ ...prev, editorRestricted: checked }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isSaving}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary hover:bg-[#000088] text-white font-bold h-9 text-xs px-5"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    editingSection ? "Save Changes" : "Create Section"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Journal Section
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Are you sure you want to delete <span className="font-bold text-foreground">"{deleteTarget?.title}"</span>?
                            {deleteTarget?.submissionCount && deleteTarget.submissionCount > 0 ? (
                                <span className="block mt-2 font-semibold text-destructive">
                                    Warning: {deleteTarget.submissionCount} submissions are currently associated with this section. Deleting it will detach them.
                                </span>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isDeleting}
                            className="h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-9 text-xs font-bold"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                "Confirm Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
