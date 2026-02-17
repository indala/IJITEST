import { FileText, Clock, CheckCircle, AlertCircle, MessageSquare, CreditCard, ChevronRight, Plus, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

const submissions = [
    {
        id: "IJITEST-2026-001",
        title: "Advancements in Machine Learning for Renewable Energy Optimization",
        status: "Under Review",
        date: "Jan 28, 2026",
        color: "text-blue-600 bg-blue-50 border-blue-100",
        icon: <Clock className="w-4 h-4" />,
        progress: 35
    },
    {
        id: "IJITEST-2025-098",
        title: "Security Protocols in IoT: A Survey",
        status: "Published",
        date: "Dec 15, 2025",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <CheckCircle className="w-4 h-4" />,
        progress: 100
    }
];

export default function AuthorDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Author Workspace</h1>
                    <p className="text-xs font-medium text-muted-foreground">Manage your research papers and publication progress.</p>
                </div>
                <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Submit New Paper
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Papers</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">04</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Published</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">02</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Under Review</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">01</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Active Submissions</h2>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-black">{submissions.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {submissions.map((paper) => (
                        <Card key={paper.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black uppercase tracking-widest bg-muted/50 border-none font-mono">
                                                ID: {paper.id}
                                            </Badge>
                                            <Badge className={`h-5 px-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border-none ${paper.color}`}>
                                                {paper.icon} {paper.status}
                                            </Badge>
                                        </div>
                                        <h3 className="text-base font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                                            {paper.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider">
                                                <Calendar className="w-3.5 h-3.5" /> {paper.date}
                                            </span>
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider">
                                                <MessageSquare className="w-3.5 h-3.5" /> 0 Messages
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-muted-foreground/20 hover:bg-muted group/btn min-w-[120px]">
                                            Full Details <ExternalLink className="ml-2 w-3 h-3 text-muted-foreground transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </Button>
                                        {paper.status === "Payment Pending" ? (
                                            <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 min-w-[120px]">
                                                Pay Now <CreditCard className="ml-2 w-3 h-3" />
                                            </Button>
                                        ) : paper.status === "Revision Required" ? (
                                            <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 min-w-[120px]">
                                                Revise <AlertCircle className="ml-2 w-3 h-3" />
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" disabled className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-40 min-w-[120px]">
                                                In Progress
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="h-1 bg-muted/50 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${paper.status === 'Published' ? 'bg-emerald-500' : 'bg-primary'}`}
                                    style={{ width: `${paper.progress}%` }}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
