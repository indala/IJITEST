import { FileText, Clock, CheckCircle, AlertCircle, MessageSquare, CreditCard, ChevronRight, Plus, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { getMySubmissions } from '@/actions/my-submissions';

export default async function AuthorDashboard() {
    const submissions = await getMySubmissions();

    const stats = {
        total: submissions.length,
        published: submissions.filter((s: any) => s.status === 'published').length,
        review: submissions.filter((s: any) => s.status === 'under_review').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return "text-indigo-600 bg-indigo-50 border-indigo-100";
            case 'under_review': return "text-amber-600 bg-amber-50 border-amber-100";
            case 'accepted': return "text-purple-600 bg-purple-50 border-purple-100";
            case 'published': return "text-emerald-600 bg-emerald-50 border-emerald-100";
            case 'rejected': return "text-rose-600 bg-rose-50 border-rose-100";
            case 'paid': return "text-cyan-600 bg-cyan-50 border-cyan-100";
            default: return "text-gray-600 bg-gray-50 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Author Workspace</h1>
                    <p className="text-xs font-medium text-muted-foreground">Manage your research papers and publication progress.</p>
                </div>
                <Button asChild className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                    <Link href="/submit">
                        <Plus className="w-4 h-4" /> Submit New Paper
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Papers</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">{String(stats.total).padStart(2, '0')}</h3>
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
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">{String(stats.published).padStart(2, '0')}</h3>
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
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">{String(stats.review).padStart(2, '0')}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Your Submissions</h2>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-black">{submissions.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {submissions.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No manuscripts found for your account.</p>
                            <Button asChild variant="link" className="mt-2 text-primary">
                                <Link href="/submit">Submit your first paper</Link>
                            </Button>
                        </div>
                    ) : submissions.map((paper: any) => (
                        <Card key={paper.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black uppercase tracking-widest bg-muted/50 border-none font-mono">
                                                ID: {paper.paper_id}
                                            </Badge>
                                            <Badge className={`h-5 px-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border-none ${getStatusColor(paper.status)}`}>
                                                {getStatusIcon(paper.status)} {paper.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <h3 className="text-base font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors cursor-pointer capitalize">
                                            {paper.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(paper.submitted_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider">
                                                <MessageSquare className="w-3.5 h-3.5" /> 0 Messages
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                                        <Button asChild size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-muted-foreground/20 hover:bg-muted group/btn min-w-[120px]">
                                            <Link href={`/track?id=${paper.paper_id}`}>
                                                Track Progress <ExternalLink className="ml-2 w-3 h-3 text-muted-foreground transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                            </Link>
                                        </Button>
                                        {paper.status === "accepted" && (
                                            <Button asChild size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 min-w-[120px]">
                                                <Link href={`/payment/${paper.paper_id}`}>
                                                    Pay Now <CreditCard className="ml-2 w-3 h-3" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="h-1 bg-muted/50 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${paper.status === 'published' ? 'bg-emerald-500' : 'bg-primary'}`}
                                    style={{ width: paper.status === 'published' ? '100%' : paper.status === 'under_review' ? '40%' : '10%' }}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
