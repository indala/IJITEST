"use client";

import { useEffect, useState } from 'react';
import { getApplications, approveApplication, rejectApplication } from '@/actions/applications';
import {
    User,
    FileText,
    Mail,
    Building2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    Clock,
    UserCheck,
    Briefcase,
    CheckCircle,
    X,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ManageApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'reviewer' | 'editor'>('all');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        const data = await getApplications();
        setApplications(data);
        setLoading(false);
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to APPROVE this application?\nThis will automatically create a user account and send an invitation.')) return;

        setProcessingId(id);
        const result = await approveApplication(id);
        if (result.success) {
            loadApplications();
        } else {
            alert(result.error);
        }
        setProcessingId(null);
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to REJECT this application?\nThis will delete the record and send a rejection email.')) return;

        setProcessingId(id);
        const result = await rejectApplication(id);
        if (result.success) {
            loadApplications();
        } else {
            alert(result.error);
        }
        setProcessingId(null);
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || app.application_type === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight whitespace-nowrap">Manuscript Review Board</h1>
                    <p className="text-xs font-medium text-muted-foreground">Assess incoming reviewer and editor join requests.</p>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0">
                    <Button
                        variant={filterRole === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('all')}
                        className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'all' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        All
                    </Button>
                    <Button
                        variant={filterRole === 'reviewer' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('reviewer')}
                        className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'reviewer' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Reviewers
                    </Button>
                    <Button
                        variant={filterRole === 'editor' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('editor')}
                        className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'editor' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Editors
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-muted/10">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="Search applicant pool..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-background border-none h-10 pl-10 text-xs font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border/50 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{filteredApps.length} Candidates</span>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] animate-pulse italic">Scanning Candidates...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                        <Filter className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No active applications in queue</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredApps.map((app) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="border-border/50 shadow-sm overflow-hidden hover:border-primary/20 transition-all group">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                                            <div className="w-20 h-20 rounded-xl bg-muted border border-border/50 flex-shrink-0 overflow-hidden group-hover:shadow-lg transition-all">
                                                {app.photo_url ? (
                                                    <img src={app.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-8 h-8 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3 flex-1 text-center sm:text-left min-w-0">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <h3 className="text-base font-black text-foreground tracking-tight truncate">{app.full_name}</h3>
                                                    <Badge className={`h-5 px-1.5 text-[8px] font-black uppercase tracking-widest ${app.application_type === 'editor'
                                                        ? 'bg-purple-500/10 text-purple-600 border-none'
                                                        : 'bg-emerald-500/10 text-emerald-600 border-none'
                                                        }`}>
                                                        {app.application_type}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-muted-foreground text-[11px] font-bold">
                                                    <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary/60" /> {app.email}</p>
                                                    <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-primary/60" /> {app.institute}</p>
                                                    <p className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary/60" /> {app.designation}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                                                    <Button asChild variant="secondary" size="sm" className="h-8 px-4 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                        <a href={app.cv_url} target="_blank">
                                                            <FileText className="w-3.5 h-3.5" /> View Curriculum Vitae
                                                        </a>
                                                    </Button>
                                                    <p className="text-[10px] font-black text-muted-foreground opacity-50 uppercase tracking-widest">
                                                        Received: {new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 md:w-64 p-5 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center gap-2">
                                            <Button
                                                disabled={processingId !== null}
                                                onClick={() => handleApprove(app.id)}
                                                className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-sm transition-all"
                                            >
                                                {processingId === app.id ? (
                                                    <span className="animate-pulse">Onboarding...</span>
                                                ) : (
                                                    <>
                                                        Approve & Invite
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                disabled={processingId !== null}
                                                variant="outline"
                                                onClick={() => handleReject(app.id)}
                                                className="w-full h-10 gap-2 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                {processingId === app.id ? (
                                                    <span className="animate-pulse">Terminating...</span>
                                                ) : (
                                                    <>
                                                        Reject Request
                                                        <X className="w-3.5 h-3.5" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
