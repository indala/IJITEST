"use client";

import { motion } from 'framer-motion';
import {
    FileText,
    Layout,
    Type,
    List,
    Image as ImageIcon,
    BookOpen,
    UserX,
    Download,
    Mail,
    CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function GuidelinesClient() {
    return (
        <div className="lg:col-span-2 space-y-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate max-w-none space-y-12"
            >
                {/* Introduction */}
                <section>
                    <p className="text-lg font-medium text-slate-600 leading-relaxed text-justify">
                        Authors are requested to read and follow the instructions below carefully before submitting their papers; so that it will be helpful for the publication of your paper is as rapid and efficient as possible. The Publisher of the journal reserves the right to return manuscripts that are not prepared in according to the guidelines of the journal.
                    </p>
                </section>

                {/* Paper Review */}
                <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-6 flex items-center gap-3">
                        <UserX className="w-6 h-6 text-secondary" />
                        Paper Review
                    </h3>
                    <ul className="space-y-4 text-slate-600 font-medium list-none pl-0">
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                            All submitted papers are subject to peer review and are expected to meet standards of academic excellence.
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                            The reviewers recommendations determine the process of whether the submitted paper should be accepted/accepted subject to changes/subject to resubmission with significant changes/rejected.
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                            The papers which needs change, will be requested for change and the modified paper will be reviewed by the same reviewers.
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                            The Review report of the reviewed articles will be kept in confidential.
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                            It will take 2-3 weeks to review a paper.
                        </li>
                    </ul>
                </section>

                {/* Formatting Guidelines */}
                <section className="space-y-12">
                    <h2 className="text-3xl font-black text-primary uppercase tracking-tighter border-b-4 border-secondary/20 pb-4 inline-block">
                        Paper Formatting Guidelines
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                    <Layout className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-primary uppercase text-sm mb-2">1. Text & Type Area</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Standard format (8.5" x 11"). Fully justified. Margins: Top 0.7", Bottom 0.7", Right 0.6", Left 0.6". Two column format (3.42" width, 0.2" space).
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                    <Type className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-primary uppercase text-sm mb-2">2. Titles Format</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                                        Title: Capitalize Each Word (14pt Times Roman Bold). Author: 10pt Times Roman. Heads: BOLD CAPITAL LETTERS (10pt).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                    <List className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-primary uppercase text-sm mb-2">3. Text Styling</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        10pt Times Roman, single spaced. First line of paragraphs indented. One line gap between consecutive paragraphs.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-primary uppercase text-sm mb-2">4. Figures & Tables</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Legends: 9pt Times Roman. Table legend above, Figure legend below. Must be cited in text.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Indexing Statement */}
                <section className="p-8 rounded-[2.5rem] border border-secondary/10 bg-secondary/5">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-4">Indexing in Database</h3>
                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                        The entire process of inclusion of any article (s) in the indexing and abstracting for bibliographic database (Scopus, WOS, etc..) is done by bibliographic database team only. Neither Journal nor the publisher has any involvement in the decision whether to accept or reject an article from indexing.
                    </p>
                </section>

                {/* Fees */}
                <section>
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                        Article Publication Fees
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indian Authors</p>
                            <p className="text-2xl font-black text-primary">₹2,000</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Africa Region</p>
                            <p className="text-2xl font-black text-primary">$52</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global/Others</p>
                            <p className="text-2xl font-black text-primary">$59</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 font-bold text-center uppercase tracking-widest">Includes up to 8 pages & maximum 5 authors per paper.</p>
                </section>

                {/* Submission CTA */}
                <section className="bg-primary rounded-[3rem] p-10 md:p-16 text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Ready to submit your paper?</h2>
                        <p className="text-slate-300 max-w-xl mx-auto font-medium">
                            Submit your manuscript electronically formatted according to the guidelines. Feel free to download our official template.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Button asChild size="lg" className="h-16 px-10 bg-secondary hover:bg-secondary/90 text-white rounded-2xl shadow-xl shadow-secondary/20 group">
                                <a href="/submit" className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Submit Manuscript</span>
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" className="h-16 px-10 border-white/20 hover:bg-white/10 text-white rounded-2xl backdrop-blur-sm group">
                                <a href="/docs/IJITEST_TEMPLATE.docx" className="flex items-center gap-3">
                                    <Download className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Download Template</span>
                                </a>
                            </Button>
                        </div>
                        <div className="pt-6 flex flex-col items-center gap-2">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Or Email Us at</p>
                            <a href="mailto:support@ijitest.com" className="flex items-center gap-2 text-secondary font-black hover:underline underline-offset-8">
                                <Mail className="w-5 h-5" />
                                support@ijitest.com
                            </a>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
