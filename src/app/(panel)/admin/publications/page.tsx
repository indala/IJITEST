'use client'

import { Plus, BookOpen, Clock, CheckCircle2, AlertCircle, Trash2, Globe, Calendar, Layers, CheckCircle, AlertTriangle, Save, History } from 'lucide-react';
import { getVolumesIssues, createVolumeIssue, publishIssue } from '@/actions/publications';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="font-black text-primary/40 uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Syncing Publication Registry...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter italic">Volumes & Issues</h1>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mt-1 italic">Journal publication schedule & editorial cycles</p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-16 px-10 gap-3 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all italic">
                            <Plus className="w-5 h-5" /> Initialize New Cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 bg-white border-primary/5 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary/10" />
                        <DialogHeader className="space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner mb-2">
                                <Plus className="w-7 h-7" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-primary tracking-tighter italic">New Publication Hub</DialogTitle>
                            <DialogDescription className="text-[10px] font-medium text-primary/40 leading-relaxed uppercase tracking-widest italic">
                                Define a new volume or issue for manuscript aggregation and archival protocols.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Volume Designation</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Issue Index</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Temporal Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-black text-sm shadow-inner rounded-2xl italic"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Cycle Duration</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                />
                            </div>

                            {status?.error && (
                                <div className="flex items-center gap-4 p-4 bg-red-500/10 text-red-600 rounded-2xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest italic">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {status.error}
                                </div>
                            )}

                            <DialogFooter className="pt-4">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-16 font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all italic rounded-2xl">
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Deploy Publication Cycle'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {status?.success && (
                <div className="p-6 bg-emerald-500/10 text-emerald-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 border border-emerald-500/20 animate-in fade-in slide-in-from-top-2 italic shadow-inner">
                    <CheckCircle2 className="w-6 h-6" /> Cycle successfully initialized & registered in the global vault.
                </div>
            )}

            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {volumes.map((v) => (
                    <Card key={v.id} className="border-primary/5 shadow-vip hover:scale-[1.01] transition-all group overflow-hidden bg-white relative">
                        <div className={`absolute top-0 left-0 w-1 h-full ${v.status === 'published' ? 'bg-emerald-500/40' : 'bg-orange-500/40'}`} />
                        <CardContent className="p-0">
                            <div className="p-8 space-y-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] italic">Global Volume {v.volume_number}</p>
                                        <h3 className="text-2xl font-black text-primary tracking-tighter leading-none group-hover:text-secondary transition-colors italic">Issue {v.issue_number}</h3>
                                    </div>
                                    <Badge className={`h-6 px-2 text-[8px] font-black uppercase tracking-widest italic border-none ${v.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {v.status === 'published' ? (
                                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Published</span>
                                        ) : (
                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Open Cycle</span>
                                        )}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/5 shadow-inner">
                                        <Calendar className="w-4 h-4 text-primary/20 mb-2" />
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-0.5 italic">Year</p>
                                        <p className="text-sm font-black text-primary italic">{v.year}</p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/5 shadow-inner">
                                        <Layers className="w-4 h-4 text-primary/20 mb-2" />
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-0.5 italic">Cycle</p>
                                        <p className="text-sm font-black text-primary truncate italic">{v.month_range}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {v.status === 'open' ? (
                                        <Button
                                            onClick={() => handlePublish(v.id)}
                                            className="w-full h-12 gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all italic"
                                        >
                                            <Globe className="w-4 h-4" /> Commit to Archive
                                        </Button>
                                    ) : (
                                        <div className="w-full h-12 bg-emerald-500/5 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-500/10 shadow-inner italic">
                                            <CheckCircle className="w-4 h-4" /> Immutable Archive Locked
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-24 bg-primary/5 border-2 border-dashed border-primary/10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-inner">
                        <div className="w-20 h-20 rounded-3xl bg-white border border-primary/10 flex items-center justify-center text-primary/10 shadow-sm mb-6">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <h3 className="text-sm font-black text-primary/40 uppercase tracking-[0.3em] mb-2 italic">Global Vault Offline</h3>
                        <p className="text-[10px] font-medium text-primary/30 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">No publication cycles detected. Initialize first volume to begin manuscript tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
