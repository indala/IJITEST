'use client'

import { Plus, BookOpen, Clock, CheckCircle2, AlertCircle, Trash2, Globe, Calendar, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import { getVolumesIssues, createVolumeIssue, publishIssue } from '@/actions/publications';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function PublicationsPage() {
    const [volumes, setVolumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getVolumesIssues();
        setVolumes(data);
        setLoading(false);
    }

    async function handleCreate(formData: FormData) {
        setIsSubmitting(true);
        setStatus(null);
        const res = await createVolumeIssue(formData);
        if (res.success) {
            setStatus({ success: true });
            setShowCreateModal(false);
            fetchData();
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus({ error: res.error });
        }
        setIsSubmitting(false);
    }

    async function handlePublish(id: number) {
        if (!confirm('Are you sure you want to PUBLISH this issue? This will also update the status of all assigned papers.')) return;
        const res = await publishIssue(id);
        if (res.success) fetchData();
        else alert(res.error);
    }

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Accessing Publication Archives...</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Volumes & Issues</h1>
                    <p className="text-xs font-medium text-muted-foreground">Manage journal publication schedule and editorial cycles.</p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> New Publication Cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-foreground tracking-tight">New Issue</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Initialize a new volume or issue for manuscript aggregation.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Volume</label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Issue</label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Year</label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Month Cycle</label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs"
                                />
                            </div>

                            {status?.error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20 text-[11px] font-bold">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {status.error}
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                    {isSubmitting ? 'Initializing...' : 'Create Publication Hub'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {status?.success && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4" /> Issue Synchronized Successfully
                </div>
            )}

            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volumes.map((v) => (
                    <Card key={v.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-background">
                        <CardContent className="p-0">
                            <div className="p-6 space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Archive Volume {v.volume_number}</p>
                                        <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">Issue {v.issue_number}</h3>
                                    </div>
                                    <Badge className={`h-5 px-1.5 text-[8px] font-black uppercase tracking-widest ${v.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-orange-500/10 text-orange-600 border-none'}`}>
                                        {v.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/30 p-3 rounded-lg border border-border/20">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 mb-2" />
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Year</p>
                                        <p className="text-sm font-black text-foreground">{v.year}</p>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-lg border border-border/20">
                                        <Layers className="w-3.5 h-3.5 text-muted-foreground/40 mb-2" />
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Cycle</p>
                                        <p className="text-sm font-black text-foreground truncate">{v.month_range}</p>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    {v.status === 'open' ? (
                                        <Button
                                            onClick={() => handlePublish(v.id)}
                                            className="w-full h-10 gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                        >
                                            <Globe className="w-3.5 h-3.5" /> Publish to Archive
                                        </Button>
                                    ) : (
                                        <div className="w-full h-10 bg-emerald-500/10 text-emerald-600 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/20">
                                            <CheckCircle className="w-3.5 h-3.5" /> Static in Archives
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                        <BookOpen className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Archive Unavailable</h3>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">Create first journal volume to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
}
