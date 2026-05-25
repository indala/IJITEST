"use client";

import { useState, useActionState } from "react";
import { UserPlus, Mail, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "@/actions/users";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionResponse } from "@/db/types";

export default function InviteEditorModal() {
    const [open, setOpen] = useState(false);

    const inviteAction = async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
        formData.append('role', 'editor');
        try {
            const res = await createUser(formData);
            if (res.success) {
                toast.success("Invitation Transmitted", {
                    description: "Secure protocol initiated. Setup instructions delivered to candidate."
                });
                setOpen(false);
            } else {
                toast.error("Operation Failed", {
                    description: res.error || "Failed to secure invitation link."
                });
            }
            return res;
        } catch (err) {
            console.error("Invite editor error:", err);
            const errRes = { success: false, error: "Critical failure during invitation protocol." };
            toast.error("Operation Failed", {
                description: errRes.error
            });
            return errRes;
        }
    };

    const [, formAction, isPending] = useActionState(inviteAction, null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-wider border-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                    Invite Editor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-xl border-border/40 shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary/5 p-8 border-b border-border/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-foreground tracking-wider">Expand Infrastructure</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    Adding high-priority personnel to the editorial board.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                <form action={formAction} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Candidate Name</Label>
                            <div className="relative">
                                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Dr. Alexander Thorne"
                                    required
                                    disabled={isPending}
                                    className="h-12 pl-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 text-sm font-semibold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Email Gateway</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="thorne@ijitest.org"
                                    required
                                    disabled={isPending}
                                    className="h-12 pl-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 text-sm font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="h-12 w-full bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {isPending ? (
                                <>Initiating Protocol <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
                            ) : (
                                <>Transmit Invitation <ShieldCheck className="ml-2 w-4 h-4" /></>
                            )}
                        </Button>
                        <p className="text-[9px] font-bold text-center text-muted-foreground uppercase tracking-widest">
                            Authorized personnel will receive a secure setup link via email.
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
