"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Upload, X, CheckCircle2, AlertCircle, FileText, ImageIcon, Loader2, ChevronRight } from 'lucide-react';
import { submitReviewerApplication } from '@/actions/reviewer';
import { checkUserEmail } from '@/actions/users';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function FileInput({
    name,
    label,
    accept,
    icon: Icon
}: {
    name: string;
    label: string;
    accept: string;
    icon: any
}) {
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileName(file ? file.name : null);
    };

    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">
                {label} <span className="text-secondary">*</span>
            </Label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    border-2 border-dashed rounded-[1.5rem] p-6
                    transition-all duration-500
                    ${fileName
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-primary/5 bg-primary/5 hover:border-secondary/30 hover:bg-primary/10'
                    }
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    required
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex items-center gap-4 relative z-10">
                    <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner
                        ${fileName ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-primary/40 group-hover:rotate-12'}
                    `}>
                        {fileName ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black italic truncate ${fileName ? 'text-emerald-700' : 'text-primary'}`}>
                            {fileName || "Transmit Asset"}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${fileName ? 'text-emerald-600/60' : 'text-primary/30'}`}>
                            {fileName ? "Asset Synchronized" : accept.replace(/\./g, ' ').toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            className="w-full h-16 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all group/btn"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    <span>Synchronizing...</span>
                </>
            ) : (
                <div className="flex items-center gap-3">
                    <span>Transmit Application</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </div>
            )}
        </Button>
    );
}

export default function ReviewerApplicationForm() {
    const [state, setState] = useState<{ success?: boolean; error?: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'reviewer' | 'editor'>('reviewer');
    const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<{ loading: boolean; exists: boolean | null }>({ loading: false, exists: null });

    useEffect(() => {
        if (!email || email.length < 5 || !email.includes('@')) {
            setEmailStatus({ loading: false, exists: null });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setEmailStatus({ loading: true, exists: null });
            const result = await checkUserEmail(email);
            setEmailStatus({ loading: false, exists: !!result.exists });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email]);

    async function handleSubmit(formData: FormData) {
        if (emailStatus.exists) return;
        formData.append('application_type', activeTab);
        const result = await submitReviewerApplication(formData);
        if (result.success) {
            setState({ success: true });
        } else {
            setState({ error: result.error });
        }
    }

    if (state?.success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-12 shadow-vip border border-primary/5 text-center overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none">
                    <CheckCircle2 className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-black text-primary tracking-tighter italic mb-4">Transmission <span className="text-secondary not-italic">Confirmed</span></h2>
                    <p className="text-primary/40 font-medium text-lg italic mb-10 max-w-md mx-auto">
                        {activeTab === 'reviewer'
                            ? "Your dossier has been successfully transmitted to our evaluation council for rigorous screening."
                            : "Your editorial profile is now being processed by our publication orchestration team."
                        }
                    </p>
                    <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/5 inline-block text-left shadow-inner">
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.3em] bg-white text-primary px-3 h-6 mb-4 italic">Next Protocol Steps</Badge>
                        <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 italic">
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Editorial Screening (24-48 hours)
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Official Invitation via Encryption
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Board Onboarding & Credentials
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] shadow-vip border border-primary/5 overflow-hidden">
            <div className="bg-primary p-10 md:p-14 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                    <FileText className="w-48 h-48" />
                </div>
                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.4em] bg-white/10 text-white border-white/20 px-4 h-7 rounded-full shadow-sm italic mb-4">Recruitment Protocol</Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none relative z-10">
                    Join the <span className="text-secondary not-italic">Elite</span> {activeTab === 'reviewer' ? 'Reviewers' : 'Editors'}
                </h2>
            </div>

            <div className="p-10 md:p-14 pt-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full -mt-6">
                    <TabsList className="w-full h-14 bg-white shadow-vip rounded-2xl border border-primary/5 p-1 gap-2">
                        <TabsTrigger value="reviewer" className="flex-1 h-full rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white italic transition-all">Review Board</TabsTrigger>
                        <TabsTrigger value="editor" className="flex-1 h-full rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white italic transition-all">Editorial Panel</TabsTrigger>
                    </TabsList>
                </Tabs>

                <AnimatePresence mode='wait'>
                    {state?.error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-10 p-5 bg-secondary/5 border border-secondary/10 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest italic flex items-center gap-4"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {state.error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form action={handleSubmit} className="mt-10 space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">Full Identity <span className="text-secondary">*</span></Label>
                            <Input
                                name="fullName"
                                type="text"
                                required
                                className="h-14 bg-primary/5 border-primary/10 rounded-2xl font-bold text-primary focus-visible:ring-primary shadow-inner px-6 italic"
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">Professional Status <span className="text-secondary">*</span></Label>
                            <Input
                                name="designation"
                                type="text"
                                required
                                className="h-14 bg-primary/5 border-primary/10 rounded-2xl font-bold text-primary focus-visible:ring-primary shadow-inner px-6 italic"
                                placeholder="Associate Professor"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">Institutional Provenance <span className="text-secondary">*</span></Label>
                        <Input
                            name="institute"
                            type="text"
                            required
                            className="h-14 bg-primary/5 border-primary/10 rounded-2xl font-bold text-primary focus-visible:ring-primary shadow-inner px-6 italic"
                            placeholder="University of Advanced Engineering..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between pl-1">
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Transmission Email <span className="text-secondary">*</span></Label>
                            {emailStatus.loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </div>
                        <div className="relative">
                            <Input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`h-14 rounded-2xl font-bold italic transition-all shadow-inner px-6 ${emailStatus.exists
                                    ? 'border-secondary/20 bg-secondary/5 focus-visible:ring-secondary'
                                    : 'bg-primary/5 border-primary/10 focus-visible:ring-primary'
                                    }`}
                                placeholder="email@institution.edu"
                            />
                            {emailStatus.exists && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute -bottom-7 left-1 flex items-center gap-1.5 text-secondary"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] italic">Identity already exists in our archives.</span>
                                </motion.div>
                            )}
                        </div>
                    </div>


                    <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-primary/5">
                        <FileInput
                            name="cv"
                            label="Curriculum Vitae"
                            accept=".doc,.docx,.pdf"
                            icon={FileText}
                        />
                        <FileInput
                            name="photo"
                            label="Professional Portrait"
                            accept=".jpg,.jpeg,.png"
                            icon={ImageIcon}
                        />
                    </div>

                    <div className="pt-8">
                        <SubmitButton disabled={!!emailStatus.exists} />
                        <p className="text-center mt-6 text-[10px] text-primary/30 font-black uppercase tracking-[0.2em] italic">
                            {emailStatus.exists
                                ? "Synchronize with existing credentials instead."
                                : "Encryption protocol secured for all transmissions."
                            }
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
