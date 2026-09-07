"use client";

import { Users, UserPlus, Shield, Mail, Trash2, ShieldCheck, UserCog, CheckCircle, AlertCircle, ShieldAlert, Search } from 'lucide-react';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSession } from 'next-auth/react';
import React, { useState, useTransition, useCallback, useMemo, useActionState } from 'react';
import { toast } from 'sonner';
import { createUser, updateUserRole, deleteUser } from '@/actions/users';
import { useQueryClient } from '@tanstack/react-query';
import { type SafeUserWithProfile, type ActionResponse } from '@/db/types';
import { runCleanupInactiveAuthors as cleanupAuthors } from '@/actions/author-submissions';
import { Card, CardContent } from "@/components/ui/card";
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

const getRoleVariant = (role: string) => {
    switch (role) {
        case 'admin': return 'bg-primary text-white border-none  ';
        case 'editor': return 'bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/20  ';
        case 'reviewer': return 'bg-emerald-600/10 text-emerald-600 border-none hover:bg-emerald-600/20  ';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const ROLE_GUIDE_DATA = [
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
] as const;

const PERMISSIONS_TABLE_DATA = [
    { role: 'Admin', focus: 'Infrastructure', publish: true, staff: true },
    { role: 'Editor', focus: 'Workflow', publish: true, staff: false },
    { role: 'Reviewer', focus: 'Accuracy', publish: false, staff: false },
] as const;

const UserItemCard = React.memo(({ user, currentUserId, isUpdatingRole, onDelete, onUpdateRole }: { user: SafeUserWithProfile, currentUserId: string | null, isUpdatingRole: boolean, onDelete: (user: SafeUserWithProfile) => void, onUpdateRole: (userId: string, newRole: "admin" | "editor" | "reviewer" | "author") => void }) => {
    const isEditingSelf = currentUserId === String(user.id);

    return (
        <Card className="border-border/70 shadow-2xs hover:border-primary/30 transition-all bg-card rounded-xl">
            <CardContent className="p-3.5 sm:p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-xs">
                        <UserCog className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate mb-0.5">
                            {user.profile?.fullName || 'No Name'}
                        </h3>
                        <Badge className={`h-5 px-2 text-[10px] font-semibold border-none transition-all uppercase ${getRoleVariant(user.role)}`}>
                            {user.role}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/70">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-meta px-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                    </div>
                </div>

                <div className="pt-2.5 border-t border-border/70">
                    <div className="flex flex-col gap-2">
                        {isEditingSelf ? (
                            <Badge className="h-8 w-full justify-center px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg uppercase flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Active Session
                            </Badge>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-8 gap-1 border-border/70 bg-card text-foreground hover:bg-muted font-medium text-xs rounded-lg transition-colors cursor-pointer"
                                        >
                                            <UserCog className="w-3.5 h-3.5" /> Role
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-2xl p-5 sm:p-6 bg-card border-border/70 shadow-2xl">
                                        <DialogHeader className="space-y-2">
                                            <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Change Role</DialogTitle>
                                            <DialogDescription className="text-sm text-muted-foreground">
                                                Change the role for <span className="text-foreground font-semibold">{user.profile?.fullName}</span>.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-3 space-y-2">
                                            <label className="text-label text-foreground">Select Role</label>
                                            <select
                                                title="Select Role"
                                                defaultValue={user.role}
                                                disabled={isUpdatingRole}
                                                onChange={(e) => onUpdateRole(user.id, e.target.value as "admin" | "editor" | "reviewer" | "author")}
                                                className="w-full h-9 bg-background border border-border/70 rounded-lg px-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                            >
                                                <option value="reviewer">Reviewer</option>
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    onClick={() => onDelete(user)}
                                    className="h-8 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
UserItemCard.displayName = 'UserItemCard';

export default function UserManagement() {
    const { data: session } = useSession();
    const { data: users = [], isLoading: loading } = useUsers();
    const queryClient = useQueryClient();

    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<SafeUserWithProfile | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCleaning, startCleanup] = useTransition();
    const [isUpdatingRole, startUpdateRole] = useTransition();
    const [isDeletingUser, startDeleteUser] = useTransition();

    // React 19: useActionState for invitation form
    const [, createAction, isCreatingStaff] = useActionState(async (_prev: ActionResponse | null, formData: FormData) => {
        const result = await createUser(formData);
        if (result.success) {
            toast.success("Staff member invited successfully");
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } else {
            toast.error(result.error);
        }
        return result;
    }, { success: false, error: "" } as ActionResponse);

    const currentUserId = useMemo(() => session?.user?.id ? String(session.user.id) : null, [session]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter((user) => {
            const name = user.profile?.fullName?.toLowerCase() || "";
            const email = user.email?.toLowerCase() || "";
            return name.includes(query) || email.includes(query);
        });
    }, [users, searchQuery]);

    const handleCleanup = useCallback(() => {
        startCleanup(async () => {
            try {
                const result = await cleanupAuthors();
                if (result.success) {
                    toast.success(`Cleanup complete. Deleted ${result.data?.deletedCount || 0} inactive authors.`);
                } else {
                    toast.error(result.error || "Failed to perform cleanup");
                }
            } catch {
                toast.error("An unexpected error occurred during cleanup");
            }
        });
    }, []);

    const handleUpdateRole = useCallback(async (userId: string, role: "admin" | "editor" | "reviewer" | "author") => {
        const toastId = toast.loading('Synchronizing role update...');
        startUpdateRole(async () => {
            try {
                const result = await updateUserRole(userId, role);
                if (result.success) {
                    toast.success("Designation updated successfully", { id: toastId });
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                } else {
                    toast.error(result.error || "Execution fault", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
    }, [queryClient]);

    const handleSetUserToDelete = useCallback((user: SafeUserWithProfile) => {
        setUserToDelete(user);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!userToDelete) return;
        startDeleteUser(async () => {
            try {
                const result = await deleteUser(userToDelete.id);
                if (result.success) {
                    toast.success("Staff member removed successfully");
                    setUserToDelete(null);
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                } else {
                    toast.error(result.error);
                }
            } catch {
                toast.error("Failed to revoke access");
            }
        });
    }, [userToDelete, queryClient]);

    if (loading) return <div className="p-20 text-center font-semibold text-muted-foreground tracking-widest text-xs animate-pulse">Scanning Directory...</div>;

    return (
        <section className="space-y-4">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">Users & Roles</h1>
                    <p className="panel-subtitle text-body-sm text-muted-foreground">Manage editorial staff and reviewers.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <Button
                        variant="outline"
                        onClick={handleCleanup}
                        disabled={isCleaning}
                        className="h-9 px-3 gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {isCleaning ? "Cleaning..." : "Cleanup Inactive"}
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-56 pl-8 bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-primary text-xs sm:text-sm rounded-lg"
                            aria-label="Search users by name or email"
                        />
                    </div>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button className="h-9 btn-primary text-xs font-semibold rounded-lg">
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Staff
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-5 sm:p-6 bg-card border-border/70 shadow-2xl">
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Invite Staff Member</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    An invitation email will be sent with setup instructions.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={createAction} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="staff-fullName" className="text-label text-foreground">Full name</label>
                                    <Input id="staff-fullName" name="fullName" required className="h-10 bg-background border-border/70 text-sm rounded-lg" placeholder="Dr. Jane Smith" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="staff-email" className="text-label text-foreground">Email</label>
                                    <Input id="staff-email" name="email" type="email" required className="h-10 bg-background border-border/70 text-sm rounded-lg" placeholder="jane@ijitest.com" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="staff-role" className="text-label text-foreground">Role</label>
                                    <select id="staff-role" name="role" required className="flex h-10 w-full rounded-lg bg-background border border-border/70 px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-primary text-foreground">
                                        <option value="reviewer">Reviewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isCreatingStaff}
                                        className="w-full h-10 btn-primary rounded-lg cursor-pointer"
                                    >
                                        {isCreatingStaff ? "Sending..." : "Send Invite"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 bg-card border border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                        <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
                        <h3 className="font-semibold text-foreground text-base">{searchQuery ? "No matching users found" : "No Staff Found"}</h3>
                        <p className="text-xs text-muted-foreground">{searchQuery ? "Try a different search term." : "Start by adding your first team member."}</p>
                    </div>
                ) : filteredUsers.map((user) => (
                    <UserItemCard
                        key={user.id}
                        user={user}
                        currentUserId={currentUserId}
                        isUpdatingRole={isUpdatingRole}
                        onDelete={handleSetUserToDelete}
                        onUpdateRole={handleUpdateRole}
                    />
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-md rounded-xl p-6">
                    <DialogHeader className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <DialogTitle>Remove this user?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            This will remove <span className="text-foreground font-semibold">{userToDelete?.profile?.fullName || 'this user'}</span> and revoke their access. Any review assignments will also be cleared.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mb-2">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground truncate">{userToDelete?.email}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                            disabled={isDeletingUser}
                            className="flex-1 h-10 text-sm font-medium rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeletingUser}
                            className="flex-1 h-10 text-sm font-medium rounded-xl"
                        >
                            {isDeletingUser ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Reference Guide */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <h2>Role overview</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-8 transition-all duration-500">
                    {ROLE_GUIDE_DATA.map((guide) => (
                        <Card key={guide.role} className="border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-3 mb-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white  shadow-lg ${guide.variant === 'primary' ? 'bg-primary shadow-primary/20' : guide.variant === 'blue' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                                        {guide.role === 'Admin' ? <Shield className="w-6 h-6" /> : guide.role === 'Editor' ? <UserCog className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3>{guide.role} <span className="text-xs opacity-60 block mt-1">{guide.title}</span></h3>
                                    </div>
                                </div>
                                <p className="mb-6">{guide.desc}</p>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-muted-foreground/50 tracking-widest mb-3 uppercase">Key Actions</p>
                                    {guide.actions.map((action, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-semibold text-foreground bg-muted/30 px-3 py-2 rounded-xl">
                                            <CheckCircle className={`w-4 h-4 ${guide.variant === 'primary' ? 'text-primary' : guide.variant === 'blue' ? 'text-blue-600' : 'text-emerald-600'}`} />
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="border border-border/50 rounded-xl 2xl:rounded-4xl overflow-hidden mt-6 shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground tracking-widest">Level</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground tracking-widest">Focus</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground tracking-widest text-center">Publish?</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground tracking-widest text-center">Manage Staff?</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PERMISSIONS_TABLE_DATA.map((row) => (
                                <TableRow key={row.role} className="border-border/50 hover:bg-muted/20 transition-colors">
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 font-semibold text-sm 2xl:text-2xl text-foreground">{row.role}</TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-xs 2xl:text-xl font-semibold text-muted-foreground uppercase">{row.focus}</TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-center">
                                        <div className={`w-2.5 h-2.5 2xl:w-5 2xl:h-5 rounded-full mx-auto ${row.publish ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-center">
                                        <div className={`w-2.5 h-2.5 2xl:w-5 2xl:h-5 rounded-full mx-auto ${row.staff ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section >
    );
}
