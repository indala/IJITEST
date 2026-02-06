"use client";

import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { login } from '@/actions/auth';
import { useFormStatus } from 'react-dom';

function LoadingButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
            {pending ? "Authenticating..." : "Proceed to Dashboard"}
            <ShieldCheck className="w-6 h-6" />
        </button>
    );
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result: any = await login(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/10">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Editor Portal</h1>
                    <p className="text-gray-500 font-medium">International Journal of Innovative Trends (IJITEST)</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            {error}
                        </div>
                    )}
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-900"
                                    placeholder="editor@ijitest.org"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-900"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-primary transition-colors flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 group-hover:opacity-10"></div>
                                </div>
                                <span className="text-gray-600 font-medium">Remember me</span>
                            </label>
                            <button type="button" className="text-primary font-bold hover:underline">Forgot Password?</button>
                        </div>

                        <LoadingButton />
                    </form>
                </div>

                <p className="text-center mt-10 text-xs text-gray-400 font-medium uppercase tracking-widest leading-loose">
                    Authorized personnel only. All activities are logged.<br />
                    IP: 192.168.1.1 | v1.0.4-IJITEST
                </p>
            </motion.div>
        </div>
    );
}
