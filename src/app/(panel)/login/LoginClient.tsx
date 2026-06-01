"use client";

import { useState, useActionState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

export default function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl');
    
    const [showPassword, setShowPassword] = useState(false);

    const [error, formAction, isPending] = useActionState(async (_prevState: string | null, formData: FormData) => {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            return "Invalid email or password";
        }

        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;

        if (callbackUrl && callbackUrl.startsWith('/')) {
            router.push(callbackUrl);
            router.refresh();
        } else if (role) {
            router.push(`/${role}`);
            router.refresh();
        } else {
            router.push('/login');
        }
        return null;
    }, null);

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 2xl:p-8">
            <div className="max-w-md w-full 2xl:max-w-lg">
                <section className="text-center mb-8 2xl:mb-12">
                    <div className="bg-[#000066]/5 w-16 h-16 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl flex items-center justify-center mx-auto mb-4 2xl:mb-6 border border-[#000066]/10">
                        <Lock className="w-8 h-8 2xl:w-10 2xl:h-10 text-[#000066]" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1 2xl:text-2xl 2xl:mb-2">Portal Access</h1>
                    <p className="text-sm text-[#000066] font-medium leading-relaxed 2xl:text-base">
                        International Journal of Innovative Trends in Science, Engineering and Technology
                    </p>
                </section>

                <div className="bg-card p-8 2xl:p-10 rounded-xl 2xl:rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/5 border border-destructive/10 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-destructive" />
                            {error}
                        </div>
                    )}
                    <form action={formAction} className="space-y-6 2xl:space-y-8">
                        <div className="space-y-2 2xl:space-y-3">
                            <label className="text-[10px] 2xl:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                            <InputGroup className="h-11 2xl:h-13 rounded-lg 2xl:rounded-xl border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3 2xl:pl-4">
                                    <Mail className="w-4 h-4 2xl:w-5 2xl:h-5 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="email"
                                    type="email"
                                    required
                                    disabled={isPending}
                                    placeholder="editor@ijitest.org"
                                    className="text-xs 2xl:text-sm font-medium"
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2 2xl:space-y-3">
                            <label className="text-[10px] 2xl:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                            <InputGroup className="h-11 2xl:h-13 rounded-lg 2xl:rounded-xl border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3 2xl:pl-4">
                                    <Lock className="w-4 h-4 2xl:w-5 2xl:h-5 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={isPending}
                                    placeholder="••••••••"
                                    className="text-xs 2xl:text-sm font-medium"
                                />
                                <InputGroupAddon align="inline-end" className="pr-1 2xl:pr-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={isPending}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="h-8 w-8 2xl:h-10 2xl:w-10 text-muted-foreground/60 hover:text-[#000066] transition-colors hover:bg-transparent"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 2xl:w-5 2xl:h-5" /> : <Eye className="w-4 h-4 2xl:w-5 2xl:h-5" />}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        <div className="flex items-center justify-between pt-2 2xl:pt-3">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-[10px] 2xl:text-xs font-bold text-muted-foreground tracking-widest uppercase">Remember session</span>
                            </label>
                            <Link href="/auth/forgot-password" title="Forgot Password" className="text-[10px] 2xl:text-xs font-bold text-[#000066] hover:text-[#000088] tracking-widest uppercase transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-11 2xl:h-13 bg-[#000066] hover:bg-[#000088] text-white font-semibold text-sm 2xl:text-base rounded-lg 2xl:rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>Logging in <Loader2 className="w-4 h-4 2xl:w-5 2xl:h-5 animate-spin" /></>
                            ) : (
                                <>Login <ShieldCheck className="w-4 h-4 2xl:w-5 2xl:h-5" /></>
                            )}
                        </Button>
                    </form>
                </div>

                <span className="text-center mt-8 2xl:mt-12 text-[10px] 2xl:text-xs text-muted-foreground font-semibold tracking-widest uppercase opacity-40 block">
                    Authorized Access Only
                </span>
            </div>
        </main>
    );
}