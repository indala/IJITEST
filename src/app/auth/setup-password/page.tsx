"use client";

import { getPasswordSetupInfo, setupPassword } from '@/actions/users';
import { ShieldCheck, Lock, Mail, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { ActionResponse } from '@/db/types';
import { useState, useEffect, Suspense, useActionState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

function SetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const ctx = searchParams.get('ctx'); // 'reset' or null (setup)

    const [info, setInfo] = useState<{ email: string; role: string; fullName?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            // Defer to avoid synchronous setState in effect
            const id = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(id);
        }
        let isMounted = true;
        async function load() {
            try {
                const result = await getPasswordSetupInfo(token!);
                if (isMounted) {
                    if (result.success && result.data) {
                        setInfo(result.data);
                    }
                    setLoading(false);
                }
            } catch (_error) {
                console.error("Setup info load error:", _error);
                if (isMounted) setLoading(false);
            }
        }
        load();
        return () => { isMounted = false; };
    }, [token]);

    const [state, formAction, isPending] = useActionState(async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
        const password = formData.get('password') as string;
        const confirm = formData.get('confirmPassword') as string;

        if (password !== confirm) {
            return { success: false, error: "Passwords do not match" };
        }

        try {
            const result = await setupPassword(formData);
            if (result.success) {
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
            return result;
        } catch { // network error
            return { success: false, error: "A network error occurred. Please try again." };
        }
    }, null);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#000066]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Validating Credentials</p>
            </div>
        </div>
    );

    if (!token || !info) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-card rounded-xl p-8 sm:p-12 shadow-sm border border-border/50">
                <div className="w-16 h-16 bg-destructive/5 rounded-xl flex items-center justify-center mx-auto mb-6 border border-destructive/10">
                    <ShieldCheck className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid or Expired Link</h1>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">This invitation link is either incorrect or has expired. Please contact the administrator for a new one.</p>
                <Button asChild className="w-full h-11 bg-[#000066] hover:bg-[#000088] text-white">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    );

    if (state?.success) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-card rounded-xl p-8 sm:p-12 shadow-sm border border-border/50">
                <div className="w-16 h-16 bg-emerald-500/5 rounded-xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">{ctx === 'reset' ? 'Password Reset!' : 'Account Ready!'}</h1>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
                    {ctx === 'reset'
                        ? 'Your password has been reset successfully. You can now log in with your new credentials.'
                        : 'Your password has been set successfully. You are now being redirected to the login portal.'}
                </p>
                <Button asChild variant="ghost" className="text-[#000066] hover:text-[#000088] hover:bg-transparent font-bold text-xs uppercase tracking-widest gap-2">
                    <Link href="/login">Go to Login <ArrowRight className="w-4 h-4" /></Link>
                </Button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <section className="text-center mb-8">
                    <div className="bg-[#000066]/5 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#000066]/10">
                        <Lock className="w-8 h-8 text-[#000066]" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">
                        {ctx === 'reset' ? 'Password Recovery' : 'Secure Your Account'}
                    </h1>
                    <p className="text-[10px] font-bold text-[#000066] uppercase tracking-widest leading-relaxed">
                        International Journal of Innovative Trends
                    </p>
                </section>

                <div className="bg-card p-8 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border/50 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center text-[#000066] shrink-0">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5">Account Identity</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{info.email}</p>
                        </div>
                        <div className="ml-auto px-3 py-1 bg-[#000066]/10 text-[#000066] rounded-md text-[10px] font-bold tracking-widest uppercase">
                            {info.role}
                        </div>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <input type="hidden" name="token" value={token!} />
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Create Password</label>
                            <InputGroup className="h-11 rounded-lg border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3">
                                    <Lock className="w-4 h-4 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="text-xs font-medium"
                                />
                                <InputGroupAddon align="inline-end" className="pr-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="h-8 w-8 text-muted-foreground/60 hover:text-[#000066] transition-colors hover:bg-transparent"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm Password</label>
                            <InputGroup className="h-11 rounded-lg border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3">
                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="text-xs font-medium"
                                />
                            </InputGroup>
                        </div>

                        {state && !state.success && (
                            <div className="p-4 bg-destructive/5 border border-destructive/10 text-destructive rounded-lg text-xs font-semibold flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4" />
                                {state.error || "Failed to setup password"}
                            </div>
                        )}

                        <Button
                            disabled={isPending}
                            className="w-full h-11 bg-[#000066] hover:bg-[#000088] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {ctx === 'reset' ? 'Updating...' : 'Securing...'}
                                </>
                            ) : (
                                <>
                                    {ctx === 'reset' ? 'Update Password' : 'Activate Account'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <span className="text-center mt-8 text-[10px] text-muted-foreground font-semibold tracking-widest uppercase opacity-40 block">
                    Secure Setup Link • 128-bit Encryption
                </span>
            </div>
        </main>
    );
}

export default function SetupPassword() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Loader2 className="w-8 h-8 animate-spin text-[#000066]" />
            </div>
        }>
            <SetupContent />
        </Suspense>
    );
}
