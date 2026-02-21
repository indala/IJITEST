"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2, Upload, CheckCircle2, AlertCircle, FileText, User, Mail, ChevronRight, BookOpen, Tag } from "lucide-react";
import { submitPaper } from "@/actions/submit-paper";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    author_name: z.string().min(2, "Author name must be at least 2 characters"),
    author_email: z.string().email("Invalid email address"),
    affiliation: z.string().min(5, "Affiliation must be at least 5 characters"),
    abstract: z.string().min(100, "Abstract must be at least 100 words (characters for now)"), // Simplified for demo
    keywords: z.string().min(10, "Provide at least 4 keywords"),
});

export default function SubmissionForm() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            author_name: "",
            author_email: "",
            affiliation: "",
            abstract: "",
            keywords: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!file) {
            setError("Please upload your manuscript file");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("file", file);

            const result = await submitPaper(formData);

            if (result.success) {
                setSuccess(true);
                form.reset();
                setFile(null);
            } else {
                setError(result.error || "Submission failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setUploading(false);
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500 bg-white rounded-3xl border border-primary/5 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">Submission <span className="text-emerald-600">Successful</span></h3>
                    <p className="text-primary/60 font-medium max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
                        Your manuscript has been received. Our editorial team will begin the screening process shortly.
                    </p>
                </div>
                <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest mt-4">
                    Submit Another Paper
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10">
                {error && (
                    <div className="p-5 bg-secondary/5 border border-secondary/20 rounded-2xl flex items-center gap-4 text-secondary text-xs font-black animate-in slide-in-from-top-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        {error}
                    </div>
                )}

                <div className="space-y-6 sm:space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Manuscript Title</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Enter the full title of your research..."
                                        {...field}
                                        className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <FormField
                            control={form.control}
                            name="author_name"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-3 mb-3 ml-1">
                                        <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Corresponding Author</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Full Name"
                                            {...field}
                                            className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_email"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-3 mb-3 ml-1">
                                        <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Contact Email</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@university.edu"
                                            {...field}
                                            className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="affiliation"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Institutional Affiliation</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Department, University, City, Country"
                                        {...field}
                                        className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="abstract"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Manuscript Abstract</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide a concise summary of your research objectives, methodology, and results..."
                                        className="bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm p-4 sm:p-6 resize-none min-h-[180px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary/50 mt-2 px-1">Min 100 characters. Summarize findings for indexing.</FormDescription>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Index Keywords</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Keyword 1, Keyword 2, Keyword 3, Keyword 4"
                                        {...field}
                                        className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6"
                                    />
                                </FormControl>
                                <FormDescription className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary/50 mt-2 px-1">Minimum 4 keywords separated by commas.</FormDescription>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-3 ml-1">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-primary" />
                            </div>
                            <FormLabel className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">Manuscript Dossier</FormLabel>
                        </div>
                        <div className="relative group/upload">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="manuscript-upload"
                                accept=".doc,.docx,.pdf"
                            />
                            <label
                                htmlFor="manuscript-upload"
                                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl sm:rounded-3xl transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden bg-white ${file
                                    ? 'border-emerald-300'
                                    : 'border-slate-300 hover:border-primary/40'
                                    }`}
                            >
                                {file ? (
                                    <div className="text-center px-8 relative z-10 animate-in fade-in zoom-in duration-500">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-black text-primary truncate max-w-sm mb-1">{file.name}</p>
                                        <p className="text-[10px] text-emerald-600/80 font-black uppercase tracking-widest">Asset Synchronized • Change Protocol</p>
                                    </div>
                                ) : (
                                    <div className="text-center relative z-10">
                                        <div className="w-14 h-14 bg-primary/5 border border-primary/10 rounded-xl shadow-inner flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-sm font-black text-primary uppercase tracking-[0.1em]">Transmit Manuscript</p>
                                        <p className="text-[10px] text-primary/50 font-black uppercase tracking-widest mt-2">DOC, DOCX, or PDF</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full h-14 sm:h-16 bg-primary text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] group/btn"
                >
                    {uploading ? (
                        <>In-Flight Transmission <Loader2 className="w-4 h-4 ml-3 animate-spin" /></>
                    ) : (
                        <div className="flex items-center gap-2">
                            Transmit To Editorial Council <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </form>
        </Form>
    );
}

