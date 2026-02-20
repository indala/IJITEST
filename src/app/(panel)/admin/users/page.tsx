"use client";

import { Users, UserPlus, Shield, Mail, Trash2, X, ShieldCheck, UserCog, MoreVertical, Plus, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { getUsers, createUser, deleteUser } from '@/actions/users';
import { getSession } from '@/actions/session';
import { useState, useEffect } from 'react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [usersData, sessionData] = await Promise.all([
            getUsers(),
            getSession()
        ]);
        setUsers(usersData);
        setCurrentUser(sessionData);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Scanning Directory...</div>;

    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-primary text-white border-none';
            case 'editor': return 'bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/20';
            case 'reviewer': return 'bg-emerald-600/10 text-emerald-600 border-none hover:bg-emerald-600/20';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Users & Roles</h1>
                    <p className="text-xs font-medium text-muted-foreground">Manage editorial staff and system access levels.</p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                            <UserPlus className="w-4 h-4" /> Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-foreground tracking-tight">Invite Staff Member</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Access keys and credentials will be sent via email.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={async (formData) => {
                            const result = await createUser(formData);
                            if (result.success) {
                                setShowAddModal(false);
                                fetchData();
                            } else {
                                alert(result.error);
                            }
                        }} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="staff-fullName" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Full Name</label>
                                <Input id="staff-fullName" name="fullName" required className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs" placeholder="Dr. Jane Smith" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="staff-email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
                                <Input id="staff-email" name="email" type="email" required className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs" placeholder="jane@ijitest.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="staff-role" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">User Role</label>
                                <select id="staff-role" name="role" required className="flex h-11 w-full rounded-lg bg-muted/50 px-3 py-1 text-xs font-bold transition-colors outline-none border-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="reviewer">Reviewer (Expert witness)</option>
                                    <option value="editor">Editor (Decision-maker)</option>
                                    <option value="admin">Administrator (Architect)</option>
                                </select>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                        <Users className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-tight">No Staff Found</h3>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">Start by adding your first team member.</p>
                    </div>
                ) : users.map((user) => (
                    <Card key={user.id} className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 border border-border/10 shrink-0 shadow-inner">
                                    <UserCog className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-foreground text-sm tracking-tight truncate uppercase leading-none mb-1">{user.full_name}</h3>
                                    <Badge className={`h-4 px-1.5 text-[7px] font-black uppercase tracking-[0.1em] border-none shadow-sm ${getRoleVariant(user.role)}`}>
                                        {user.role}
                                    </Badge>
                                </div>
                                {user.role === 'admin' && (
                                    <div className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 truncate bg-muted/30 px-2 py-1.5 rounded-lg border border-border/5">
                                    <Mail className="w-3.5 h-3.5 opacity-40 text-primary" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
                                    <ShieldCheck className="w-3.5 h-3.5 opacity-30" />
                                    <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <Separator className="mb-4 opacity-50" />

                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-[8px] font-mono font-black text-muted-foreground/50 uppercase tracking-widest bg-muted/20 border-border/20">
                                    ID: STAFF-{String(user.id).padStart(3, '0')}
                                </Badge>
                                {currentUser && Number(currentUser.id) !== Number(user.id) ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to revoke access? This cannot be undone.")) {
                                                const result = await deleteUser(user.id);
                                                if (result?.error) {
                                                    alert(result.error);
                                                } else {
                                                    fetchData();
                                                }
                                            }
                                        }}
                                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-destructive rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="h-5 px-2 text-[8px] font-black uppercase tracking-widest text-emerald-600 border-emerald-500/20 bg-emerald-500/5">
                                        Primary Session
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Role Reference Guide */}
            <div className="mt-12 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Role Reference Guide</h2>
                    <Info className="w-4 h-4 text-muted-foreground/30" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                        {
                            role: 'Admin',
                            title: 'The Architect',
                            desc: 'Configuration and system oversight.',
                            variant: 'primary',
                            actions: ['Creating accounts', 'Site security', 'Metadata (ISSN)', 'Bug fixing']
                        },
                        {
                            role: 'Editor',
                            title: 'The Decision-Maker',
                            desc: 'Content Flow & Life Cycle management.',
                            variant: 'blue',
                            actions: ['Screening', 'Assigning reviewers', 'Final decisions', 'Scheduling releases']
                        },
                        {
                            role: 'Reviewer',
                            title: 'The Expert Witness',
                            desc: 'Technical evaluation & control.',
                            variant: 'emerald',
                            actions: ['Reading manuscripts', 'Error/Plagiarism check', 'Providing advice']
                        }
                    ].map((guide) => (
                        <Card key={guide.role} className="border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${guide.variant === 'primary' ? 'bg-primary shadow-primary/20' : guide.variant === 'blue' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                                        {guide.role === 'Admin' ? <Shield className="w-5 h-5" /> : guide.role === 'Editor' ? <UserCog className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground uppercase tracking-tight text-sm">{guide.role} <span className="text-[10px] text-muted-foreground font-medium italic normal-case block">{guide.title}</span></h3>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-4">{guide.desc}</p>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-2">Key Actions</p>
                                    {guide.actions.map((action, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-foreground bg-muted/30 px-2 py-1.5 rounded-md">
                                            <CheckCircle className={`w-3 h-3 ${guide.variant === 'primary' ? 'text-primary' : guide.variant === 'blue' ? 'text-blue-600' : 'text-emerald-600'}`} />
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="border border-border/50 rounded-xl overflow-hidden mt-6 shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="h-10 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Level</TableHead>
                                <TableHead className="h-10 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Focus</TableHead>
                                <TableHead className="h-10 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Publish?</TableHead>
                                <TableHead className="h-10 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Manage Staff?</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { role: 'Admin', focus: 'Infrastructure', publish: true, staff: true },
                                { role: 'Editor', focus: 'Workflow', publish: true, staff: false },
                                { role: 'Reviewer', focus: 'Accuracy', publish: false, staff: false },
                            ].map((row) => (
                                <TableRow key={row.role} className="border-border/50 hover:bg-muted/10">
                                    <TableCell className="px-6 py-3 font-black text-xs text-foreground">{row.role}</TableCell>
                                    <TableCell className="px-6 py-3 text-[11px] font-bold text-muted-foreground italic">{row.focus}</TableCell>
                                    <TableCell className="px-6 py-3 text-center">
                                        <div className={`w-2 h-2 rounded-full mx-auto ${row.publish ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-center">
                                        <div className={`w-2 h-2 rounded-full mx-auto ${row.staff ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
