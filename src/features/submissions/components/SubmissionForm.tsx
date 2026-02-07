"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Send, User, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { submitPaper } from '@/actions/submit-paper';

const submissionSchema = z.object({
    authorName: z.string().min(2, "Author name is required"),
    authorEmail: z.string().email("Invalid email address"),
    affiliation: z.string().min(2, "Affiliation is required"),
    paperTitle: z.string().min(10, "Paper title must be at least 10 characters"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters"),
    keywords: z.string().min(5, "Keywords are required"),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export default function SubmissionForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [manuscript, setManuscript] = useState<File | null>(null);
    const [submissionId, setSubmissionId] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SubmissionFormValues>({
        resolver: zodResolver(submissionSchema)
    });

    const onSubmit = async (values: SubmissionFormValues) => {
        if (!manuscript) {
            alert("Please upload your manuscript");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("authorName", values.authorName);
            formData.append("authorEmail", values.authorEmail);
            formData.append("affiliation", values.affiliation);
            formData.append("paperTitle", values.paperTitle);
            formData.append("abstract", values.abstract);
            formData.append("keywords", values.keywords);
            formData.append("manuscript", manuscript);

            const result = await submitPaper(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            setSubmissionId(result.paperId || 'UNKNOWN');
            setIsSubmitted(true);

        } catch (error: any) {
            console.error(error);
            alert("Submission failed: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-4 rounded-full mb-6"
                >
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-serif font-black mb-4">Submission Successful!</h2>
                <p className="text-gray-600 max-w-md mb-8 italic font-medium">
                    Your paper has been received and assigned ID: <strong className="text-primary">{submissionId}</strong>. A confirmation email has been sent to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Return Home</button>
                    <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-900/20">Track Submission</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {/* Author Information */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-primary font-black border-b border-gray-100 pb-3">
                    <User className="w-6 h-6" />
                    <span className="uppercase tracking-[0.2em] text-xs">Author Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Corresponding Author Name*</label>
                        <input
                            {...register("authorName")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="e.g. Dr. John Doe"
                        />
                        {errors.authorName && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.authorName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Email Address*</label>
                        <input
                            {...register("authorEmail")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="john@university.edu"
                        />
                        {errors.authorEmail && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.authorEmail.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Affiliation / Organization*</label>
                        <input
                            {...register("affiliation")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="e.g. Department of CSE, University of Engineering"
                        />
                        {errors.affiliation && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.affiliation.message}</p>}
                    </div>
                </div>
            </div>

            {/* Paper Metadata */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-primary font-black border-b border-gray-100 pb-3">
                    <FileText className="w-6 h-6" />
                    <span className="uppercase tracking-[0.2em] text-xs">Paper Metadata</span>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Paper Title*</label>
                        <input
                            {...register("paperTitle")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm italic"
                            placeholder="Enter full title of your research"
                        />
                        {errors.paperTitle && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.paperTitle.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Abstract* (50-250 words)</label>
                        <textarea
                            {...register("abstract")}
                            rows={4}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none font-medium text-sm italic"
                            placeholder="Summarize your research objectives and findings..."
                        />
                        {errors.abstract && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.abstract.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Keywords* (comma separated)</label>
                        <input
                            {...register("keywords")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="e.g. Machine Learning, Cloud Computing, IoT"
                        />
                        {errors.keywords && <p className="text-red-500 text-[10px] font-black uppercase mt-2 tracking-widest">{errors.keywords.message}</p>}
                    </div>
                </div>
            </div>

            {/* File Upload */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-primary font-black border-b border-gray-100 pb-3">
                    <Upload className="w-6 h-6" />
                    <span className="uppercase tracking-[0.2em] text-xs">Manuscript Upload</span>
                </div>
                <div
                    className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all ${manuscript ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                >
                    {!manuscript ? (
                        <>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setManuscript(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-gray-900 font-black uppercase text-[10px] tracking-widest mb-1">Click to upload or drag and drop</p>
                                <p className="text-gray-500 text-[9px] font-medium italic">Accepts PDF, DOCX (Max 10MB)</p>
                            </label>
                        </>
                    ) : (
                        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100 max-w-xl mx-auto">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm">
                                    <FileText className="text-emerald-600 w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-gray-900 truncate max-w-[200px]">{manuscript.name}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{(manuscript.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManuscript(null)}
                                className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-red-50"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Ethics & Policy Agreement */}
            <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                <label className="flex items-start gap-4 cursor-pointer">
                    <input
                        type="checkbox"
                        required
                        className="w-5 h-5 mt-1 text-primary border-gray-200 rounded-lg focus:ring-primary/20"
                    />
                    <span className="text-xs text-slate-950 font-medium leading-relaxed italic">
                        I confirm that this manuscript is <strong>original</strong>, has not been published elsewhere, and I have read and agree to the <a href="/guidelines" className="text-primary font-black underline decoration-primary/20 hover:decoration-primary transition-all">Author Guidelines</a> and <a href="/ethics" className="text-primary font-black underline decoration-primary/20 hover:decoration-primary transition-all">Ethics & Publication Policy</a>.
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isUploading}
                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <>Processing Submission... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                    <>Submit Manuscript <Send className="w-5 h-5" /></>
                )}
            </button>
        </form>
    );
}
