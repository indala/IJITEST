"use client";

import { useState, useEffect, useTransition } from "react";
import { type Announcement, type AnnouncementType } from "@/db/types";
import {
    getAllAnnouncementsAdmin,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
} from "@/actions/announcements";
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
    Megaphone,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    Image as ImageIcon,
    Clock,
    Search,
    Loader2,
    ExternalLink,
    UploadCloud,
    X,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const TYPE_CONFIG: Record<AnnouncementType, { label: string; color: string }> = {
    call_for_papers: { label: "Call for Papers", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300" },
    news: { label: "Journal News", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
    editorial_update: { label: "Editorial Update", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
    event: { label: "Scholarly Event", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default function AnnouncementsManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [isPending, startTransition] = useTransition();

    // Dialog state
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Announcement | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [type, setType] = useState<AnnouncementType>("news");
    const [descriptionShort, setDescriptionShort] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [dateExpire, setDateExpire] = useState<string>("");
    const [imageAltText, setImageAltText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getAllAnnouncementsAdmin();
        if (res.success && res.data) {
            setAnnouncements(res.data);
        } else {
            toast.error(res.error || "Failed to load announcements");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateDialog = () => {
        setEditingItem(null);
        setTitle("");
        setType("news");
        setDescriptionShort("");
        setDescription("");
        setPriority(0);
        setIsActive(true);
        setDateExpire("");
        setImageAltText("");
        setImageFile(null);
        setImagePreview(null);
        setRemoveExistingImage(false);
        setIsOpen(true);
    };

    const openEditDialog = (item: Announcement) => {
        setEditingItem(item);
        setTitle(item.title);
        setType(item.type);
        setDescriptionShort(item.descriptionShort || "");
        setDescription(item.description);
        setPriority(item.priority);
        setIsActive(item.isActive);
        setDateExpire(item.dateExpire ? new Date(item.dateExpire).toISOString().split('T')[0] || "" : "");
        setImageAltText(item.imageAltText || "");
        setImageFile(null);
        setImagePreview(item.imageUrl || null);
        setRemoveExistingImage(false);
        setIsOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit");
                return;
            }
            setImageFile(file);
            setRemoveExistingImage(false);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Announcement title is required");
            return;
        }
        if (!description.trim()) {
            toast.error("Full announcement body is required");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("type", type);
            formData.append("descriptionShort", descriptionShort.trim());
            formData.append("description", description.trim());
            formData.append("priority", priority.toString());
            formData.append("isActive", isActive ? "true" : "false");
            if (dateExpire) formData.append("dateExpire", dateExpire);
            if (imageAltText.trim()) formData.append("imageAltText", imageAltText.trim());
            if (removeExistingImage) formData.append("removeImage", "true");
            if (imageFile) formData.append("image", imageFile);

            let res;
            if (editingItem) {
                res = await updateAnnouncement(editingItem.id, formData);
            } else {
                res = await createAnnouncement(formData);
            }

            if (res.success) {
                toast.success(editingItem ? "Announcement updated successfully" : "Announcement created successfully");
                setIsOpen(false);
                loadData();
            } else {
                toast.error(res.error || "Failed to save announcement");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const res = await deleteAnnouncement(id);
        if (res.success) {
            toast.success("Announcement deleted");
            setDeleteConfirmId(null);
            loadData();
        } else {
            toast.error(res.error || "Failed to delete announcement");
        }
    };

    const handleToggleStatus = (id: number) => {
        startTransition(async () => {
            const res = await toggleAnnouncementStatus(id);
            if (res.success) {
                setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: res.data.isActive } : a));
                toast.success(`Announcement ${res.data.isActive ? "activated" : "deactivated"}`);
            } else {
                toast.error(res.error || "Failed to update status");
            }
        });
    };

    const filtered = announcements.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.descriptionShort || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "all" || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-xl p-6 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Announcements & Notices</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Publish scholarly calls for papers, editorial changes, and indexing milestones directly linked with storage-service assets.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link href="/announcements" target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Public Feed
                        </Link>
                    </Button>
                    <Button onClick={openCreateDialog} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search announcements by title or keywords..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <Button
                        variant={selectedType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("all")}
                    >
                        All ({announcements.length})
                    </Button>
                    {(Object.keys(TYPE_CONFIG) as AnnouncementType[]).map(t => {
                        const count = announcements.filter(a => a.type === t).length;
                        return (
                            <Button
                                key={t}
                                variant={selectedType === t ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedType(t)}
                            >
                                {TYPE_CONFIG[t].label} ({count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Loading scholarly announcements...</p>
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                        <Megaphone className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="font-semibold text-foreground text-lg">No announcements found</h3>
                        <p className="text-sm max-w-sm">
                            {searchQuery ? "No results match your search filter." : "Create your first scholarly announcement or call for papers."}
                        </p>
                        <Button onClick={openCreateDialog} size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Announcement
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(item => {
                        const isExpired = item.dateExpire && new Date(item.dateExpire) < new Date();
                        const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG.news;

                        return (
                            <Card key={item.id} className={`overflow-hidden transition-all duration-150 ${!item.isActive ? 'opacity-60 bg-muted/30' : ''}`}>
                                <div className="flex flex-col md:flex-row items-start">
                                    {/* Thumbnail if image exists */}
                                    {item.imageUrl && (
                                        <div className="relative w-full md:w-48 h-36 md:h-full min-h-[140px] bg-muted shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.imageAltText || item.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 192px"
                                                unoptimized
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 p-5 space-y-3 w-full">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className={typeInfo.color}>
                                                    {typeInfo.label}
                                                </Badge>
                                                {item.priority > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Priority: {item.priority}
                                                    </Badge>
                                                )}
                                                {isExpired && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Expired
                                                    </Badge>
                                                )}
                                                {!item.isActive && (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                                        Draft / Inactive
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 mr-2">
                                                    <Switch
                                                        checked={item.isActive}
                                                        onCheckedChange={() => handleToggleStatus(item.id)}
                                                        disabled={isPending}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.isActive ? "Active" : "Hidden"}
                                                    </span>
                                                </div>

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

                                        <div>
                                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                                <Link href={`/announcements/${item.id}`} target="_blank" className="hover:underline flex items-center gap-1.5">
                                                    {item.title}
                                                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                                                </Link>
                                            </h3>
                                            {item.descriptionShort && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {item.descriptionShort}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Posted: {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                            {item.dateExpire && (
                                                <div className={`flex items-center gap-1 ${isExpired ? 'text-destructive font-medium' : ''}`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Expires: {new Date(item.dateExpire).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </div>
                                            )}
                                            {item.imageUrl && (
                                                <div className="flex items-center gap-1 text-primary">
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                    Banner attached
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Edit Announcement" : "Create Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure title, scholarly category, banner image, and expiration rules.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="ann-title">Title *</Label>
                            <Input
                                id="ann-title"
                                placeholder="e.g. Call for Papers: Volume 14, Issue 1 (2026)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="ann-type">Category *</Label>
                                <select
                                    id="ann-type"
                                    value={type}
                                    onChange={e => setType(e.target.value as AnnouncementType)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="call_for_papers">Call for Papers</option>
                                    <option value="news">Journal News</option>
                                    <option value="editorial_update">Editorial Update</option>
                                    <option value="event">Scholarly Event</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="ann-priority">Display Priority (higher = top)</Label>
                                <Input
                                    id="ann-priority"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={priority}
                                    onChange={e => setPriority(parseInt(e.target.value, 10) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ann-short">Short Summary (Lead for Homepage & Cards)</Label>
                            <Input
                                id="ann-short"
                                placeholder="Brief one-to-two sentence lead..."
                                value={descriptionShort}
                                onChange={e => setDescriptionShort(e.target.value)}
                                maxLength={500}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ann-desc">Full Content (Markdown supported) *</Label>
                            <Textarea
                                id="ann-desc"
                                placeholder="Detailed announcement, topics of interest, submission deadlines, instructions..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={8}
                                required
                            />
                        </div>

                        {/* Banner Image Upload with storage-service preview */}
                        <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                            <Label className="flex items-center gap-1.5">
                                <UploadCloud className="h-4 w-4 text-primary" />
                                Banner Image (Stored in storage-service)
                            </Label>
                            <div className="text-xs text-muted-foreground">
                                Supported formats: PNG, JPG, WEBP, GIF, SVG (Max: 5MB).
                            </div>

                            {imagePreview ? (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                                    <Image
                                        src={imagePreview}
                                        alt="Banner Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                            setRemoveExistingImage(true);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                    onChange={handleFileChange}
                                />
                            )}

                            {imagePreview && (
                                <div className="pt-2">
                                    <Label htmlFor="ann-alt" className="text-xs">Image Alt Text / Caption</Label>
                                    <Input
                                        id="ann-alt"
                                        placeholder="Accessible description of banner image"
                                        value={imageAltText}
                                        onChange={e => setImageAltText(e.target.value)}
                                        className="h-8 text-xs mt-1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1.5">
                                <Label htmlFor="ann-expire">Expiration Date (Optional)</Label>
                                <Input
                                    id="ann-expire"
                                    type="date"
                                    value={dateExpire}
                                    onChange={e => setDateExpire(e.target.value)}
                                />
                                <span className="text-xs text-muted-foreground">
                                    Announcement will automatically unpublish after this date.
                                </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-3 sm:pt-6">
                                <Switch
                                    id="ann-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <Label htmlFor="ann-active" className="cursor-pointer">
                                    Published & Visible to Public
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
                                        {editingItem ? "Update Announcement" : "Create Announcement"}
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
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this announcement? Any attached banner files in storage-service will also be purged.
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
