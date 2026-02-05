"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Send, User, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function SubmitPaper() {
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
            // Create FormData for the server action
            const formData = new FormData();
            formData.append("authorName", values.authorName);
            formData.append("authorEmail", values.authorEmail);
            formData.append("affiliation", values.affiliation);
            formData.append("paperTitle", values.paperTitle);
            formData.append("abstract", values.abstract);
            formData.append("keywords", values.keywords);
            formData.append("manuscript", manuscript);

            // Submit to MySQL-based server action
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
            <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-4 rounded-full mb-6"
                >
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </motion.div>
                <h1 className="text-3xl font-serif font-black mb-4">Submission Successful!</h1>
                <p className="text-gray-600 max-w-md mb-8">
                    Your paper has been received and assigned ID: <strong>{submissionId}</strong>. A confirmation email has been sent to your inbox.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/'} className="btn-primary">Return Home</button>
                    <button className="btn-outline">Download Confirmation</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 bg-gray-50/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="bg-primary p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-serif font-bold">Paper Submission</h1>
                            <p className="text-white/70">Complete the form below to submit your research for review.</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                        {/* Author Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold border-b border-gray-100 pb-2">
                                <User className="w-5 h-5" />
                                <span>Author Details</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Corresponding Author Name*</label>
                                    <input
                                        {...register("authorName")}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Dr. John Doe"
                                    />
                                    {errors.authorName && <p className="text-red-500 text-xs mt-1">{errors.authorName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                                    <input
                                        {...register("authorEmail")}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="john@university.edu"
                                    />
                                    {errors.authorEmail && <p className="text-red-500 text-xs mt-1">{errors.authorEmail.message}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation / Organization*</label>
                                    <input
                                        {...register("affiliation")}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Department of CSE, IIT Bombay"
                                    />
                                    {errors.affiliation && <p className="text-red-500 text-xs mt-1">{errors.affiliation.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Paper Metadata */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold border-b border-gray-100 pb-2">
                                <FileText className="w-5 h-5" />
                                <span>Paper Metadata</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title*</label>
                                    <input
                                        {...register("paperTitle")}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Enter full title of your research"
                                    />
                                    {errors.paperTitle && <p className="text-red-500 text-xs mt-1">{errors.paperTitle.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract* (50-250 words)</label>
                                    <textarea
                                        {...register("abstract")}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Summarize your research objectives and findings..."
                                    />
                                    {errors.abstract && <p className="text-red-500 text-xs mt-1">{errors.abstract.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords* (comma separated)</label>
                                    <input
                                        {...register("keywords")}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Machine Learning, Cloud Computing, IoT"
                                    />
                                    {errors.keywords && <p className="text-red-500 text-xs mt-1">{errors.keywords.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold border-b border-gray-100 pb-2">
                                <Upload className="w-5 h-5" />
                                <span>Manuscript Upload</span>
                            </div>
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${manuscript ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
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
                                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-bold">Click to upload or drag and drop</p>
                                            <p className="text-gray-500 text-sm mt-1">Accepts PDF, DOCX (Max 10MB)</p>
                                        </label>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <FileText className="text-green-600 w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900">{manuscript.name}</p>
                                                <p className="text-xs text-gray-500">{(manuscript.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setManuscript(null)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ethics & Policy Agreement */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    className="w-5 h-5 mt-1 text-primary border-gray-300 rounded focus:ring-primary items-start"
                                />
                                <span className="text-sm text-gray-600 leading-relaxed">
                                    I confirm that this manuscript is <strong>original</strong>, has not been published elsewhere, and I have read and agree to the <a href="/guidelines" className="text-primary font-bold underline hover:text-primary/80">Author Guidelines</a> and <a href="/ethics" className="text-primary font-bold underline hover:text-primary/80">Ethics & Publication Policy</a>.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full btn-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>Uploading & Submitting... <Loader2 className="w-5 h-5 animate-spin" /></>
                            ) : (
                                <>Submit Manuscript <Send className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
