"use client";

import { useState, useEffect, useTransition } from "react";
import { type StaticPage } from "@/db/types";
import {
    getAllStaticPagesAdmin,
    createStaticPage,
    updateStaticPage,
    deleteStaticPage
} from "@/actions/static-pages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Globe,
    Plus,
    Edit2,
    Trash2,
    Search,
    Loader2,
    ExternalLink,
    Code2,
    CheckCircle2,
    Navigation,
    FileText
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLACEHOLDERS = [
    { token: "{{journalName}}", desc: "Official journal title" },
    { token: "{{issnNumber}}", desc: "Registered ISSN number" },
    { token: "{{publisher}}", desc: "Publishing press / entity" },
    { token: "{{contactEmail}}", desc: "Editorial contact email" },
    { token: "{{year}}", desc: "Current calendar year" },
];

export default function StaticPagesManager() {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    // Dialog state
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StaticPage | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Form fields
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [showInNav, setShowInNav] = useState(false);
    const [navLabel, setNavLabel] = useState("");
    const [navOrder, setNavOrder] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getAllStaticPagesAdmin();
        if (res.success && res.data) {
            setPages(res.data);
        } else {
            toast.error(res.error || "Failed to load static pages");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateDialog = () => {
        setEditingItem(null);
        setSlug("");
        setTitle("");
        setContent("");
        setIsPublished(true);
        setShowInNav(false);
        setNavLabel("");
        setNavOrder(pages.length + 1);
        setIsOpen(true);
    };

    const openEditDialog = (item: StaticPage) => {
        setEditingItem(item);
        setSlug(item.slug);
        setTitle(item.title);
        setContent(item.content);
        setIsPublished(item.isPublished);
        setShowInNav(item.showInNav);
        setNavLabel(item.navLabel || "");
        setNavOrder(item.navOrder);
        setIsOpen(true);
    };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!editingItem) {
            const generated = val
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            setSlug(generated);
        }
    };

    const insertToken = (token: string) => {
        setContent(prev => `${prev} ${token}`);
        toast.info(`Inserted placeholder: ${token}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug.trim()) {
            toast.error("URL slug is required");
            return;
        }
        if (!title.trim()) {
            toast.error("Page title is required");
            return;
        }
        if (!content.trim()) {
            toast.error("Page content is required");
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (editingItem) {
                res = await updateStaticPage(editingItem.id, {
                    slug: slug.trim(),
                    title: title.trim(),
                    content: content.trim(),
                    isPublished,
                    showInNav,
                    navLabel: navLabel.trim() || null,
                    navOrder,
                });
            } else {
                res = await createStaticPage({
                    slug: slug.trim(),
                    title: title.trim(),
                    content: content.trim(),
                    isPublished,
                    showInNav,
                    navLabel: navLabel.trim() || null,
                    navOrder,
                });
            }

            if (res.success) {
                toast.success(editingItem ? "Page updated successfully" : "Page created successfully");
                setIsOpen(false);
                loadData();
            } else {
                toast.error(res.error || "Failed to save page");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const res = await deleteStaticPage(id);
        if (res.success) {
            toast.success("Page deleted");
            setDeleteConfirmId(null);
            loadData();
        } else {
            toast.error(res.error || "Failed to delete page");
        }
    };

    const handleTogglePublished = (item: StaticPage) => {
        startTransition(async () => {
            const res = await updateStaticPage(item.id, { isPublished: !item.isPublished });
            if (res.success) {
                setPages(prev => prev.map(p => p.id === item.id ? { ...p, isPublished: !item.isPublished } : p));
                toast.success(`Page ${!item.isPublished ? "published" : "moved to draft"}`);
            } else {
                toast.error(res.error || "Failed to toggle status");
            }
        });
    };

    const filtered = pages.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-xl p-6 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Globe className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Custom CMS Pages</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Create and manage dynamic scholarly policy pages (Open Access, Ethics, Author Guidelines) with markdown rendering and dynamic metadata tokens.
                    </p>
                </div>
                <Button onClick={openCreateDialog} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search static pages by title or slug..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Loading CMS pages...</p>
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                        <FileText className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="font-semibold text-foreground text-lg">No static pages found</h3>
                        <p className="text-sm max-w-sm">
                            {searchQuery ? "No pages match your search." : "Create your first scholarly static page."}
                        </p>
                        <Button onClick={openCreateDialog} size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Page
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(item => (
                        <Card key={item.id} className={`overflow-hidden transition-all duration-150 ${!item.isPublished ? 'opacity-65 bg-muted/20' : ''}`}>
                            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                            <Link href={`/pages/${item.slug}`} target="_blank" className="hover:underline flex items-center gap-1.5">
                                                {item.title}
                                                <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                                            </Link>
                                        </h3>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            /pages/{item.slug}
                                        </Badge>
                                        {item.isPublished ? (
                                            <Badge variant="default" className="bg-emerald-600 text-xs">
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">
                                                Draft
                                            </Badge>
                                        )}
                                        {item.showInNav && (
                                            <Badge variant="outline" className="text-xs border-primary/40 text-primary flex items-center gap-1">
                                                <Navigation className="h-3 w-3" />
                                                In Navbar ({item.navLabel || item.title})
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {item.content.replace(/[#*`_]/g, "").slice(0, 140)}...
                                    </p>
                                    <div className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
                                        <span>Order: {item.navOrder}</span>
                                        <span>•</span>
                                        <span>Updated: {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 mr-2">
                                        <Switch
                                            checked={item.isPublished}
                                            onCheckedChange={() => handleTogglePublished(item)}
                                            disabled={isPending}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {item.isPublished ? "Active" : "Draft"}
                                        </span>
                                    </div>

                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/pages/${item.slug}`} target="_blank">
                                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditDialog(item)}
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteConfirmId(item.id)}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Edit Static Page" : "Create Static Page"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure title, clean URL slug, markdown content, and navigation options.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pg-title">Page Title *</Label>
                                <Input
                                    id="pg-title"
                                    placeholder="e.g. Open Access Policy"
                                    value={title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="pg-slug">URL Slug * (auto-generated)</Label>
                                <div className="flex items-center">
                                    <span className="text-xs font-mono bg-muted px-2 py-2 border border-r-0 rounded-l-md text-muted-foreground">
                                        /pages/
                                    </span>
                                    <Input
                                        id="pg-slug"
                                        placeholder="open-access-policy"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                        className="rounded-l-none font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata Token Helper */}
                        <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Code2 className="h-3.5 w-3.5 text-primary" />
                                Dynamic Scholarly Placeholders (click to insert into content):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {PLACEHOLDERS.map(p => (
                                    <button
                                        key={p.token}
                                        type="button"
                                        onClick={() => insertToken(p.token)}
                                        className="text-xs font-mono bg-background border hover:border-primary px-2 py-0.5 rounded shadow-sm transition-colors text-foreground"
                                        title={p.desc}
                                    >
                                        {p.token}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="pg-content">Content (Markdown Supported) *</Label>
                            <Textarea
                                id="pg-content"
                                placeholder="Write in GitHub Flavored Markdown (headings, lists, bold, links, tables)..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={12}
                                className="font-mono text-xs leading-relaxed"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="pg-nav"
                                    checked={showInNav}
                                    onCheckedChange={setShowInNav}
                                />
                                <Label htmlFor="pg-nav" className="text-xs cursor-pointer">
                                    Show in Navigation
                                </Label>
                            </div>

                            {showInNav && (
                                <div className="space-y-1">
                                    <Label htmlFor="pg-nav-label" className="text-xs">Navbar Label</Label>
                                    <Input
                                        id="pg-nav-label"
                                        placeholder="Short Nav Text"
                                        value={navLabel}
                                        onChange={e => setNavLabel(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label htmlFor="pg-order" className="text-xs">Nav / Listing Order</Label>
                                <Input
                                    id="pg-order"
                                    type="number"
                                    min="0"
                                    value={navOrder}
                                    onChange={e => setNavOrder(parseInt(e.target.value, 10) || 0)}
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="pg-published"
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                />
                                <Label htmlFor="pg-published" className="text-xs cursor-pointer">
                                    Published (Visible)
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        {editingItem ? "Update Page" : "Create Page"}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={open => !open && setDeleteConfirmId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Static Page</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this page? Any navigation links to /pages/{pages.find(p => p.id === deleteConfirmId)?.slug} will no longer resolve.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
