"use client";

import { Plus, BookOpen, Layers, Calendar, ChevronRight, Lock, X } from 'lucide-react';
import { getVolumesIssues, createVolumeIssue, publishIssue } from '@/actions/publications';
import { useState, useEffect } from 'react';
import pool from '@/lib/db';

export default function Publications() {
    const [publications, setPublications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getVolumesIssues();

        // Fetch paper counts for each issue
        const enrichedData = await Promise.all(data.map(async (pub: any) => {
            // Since we can't easily do nested async in client components without a real API, 
            // I'll assume getVolumesIssues or a custom query should handle this.
            // For now, I'll pass the data as is and add a count column in SQL if needed, 
            // but let's just use the data we have.
            return pub;
        }));

        setPublications(enrichedData);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Publications...</div>;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Volumes & Issues</h1>
                    <p className="text-gray-500 font-medium">Manage journal publication cycles and assign papers.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/95 transition-all"
                >
                    <Plus className="w-5 h-5" /> Create New Issue
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900">New Publication Issue</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form action={async (formData) => {
                            await createVolumeIssue(formData);
                            setShowForm(false);
                            fetchData();
                        }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500">Volume No.</label>
                                    <input name="volume" type="number" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. 1" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500">Issue No.</label>
                                    <input name="issue" type="number" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. 1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Publication Year</label>
                                <input name="year" type="number" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="2026" defaultValue={new Date().getFullYear()} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Month Range</label>
                                <input name="monthRange" type="text" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. Jan - Mar" />
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Initialize Issue
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publications.map((item) => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                        <div className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.status === 'open' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'open' ? 'text-primary bg-primary/10' : 'text-gray-400 bg-gray-50'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <h3 className="text-2xl font-serif font-black text-gray-900 mb-2">Volume {item.volume_number}, Issue {item.issue_number}</h3>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" /> <span>{item.month_range} {item.year}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Layers className="w-4 h-4" /> <span>Ready for assignment</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 pt-0">
                            {item.status === 'open' ? (
                                <button
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to publish this issue? All assigned accepted papers will become public.")) {
                                            await publishIssue(item.id);
                                            fetchData();
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-5 rounded-2xl transition-all bg-gray-50 text-gray-900 hover:bg-primary hover:text-white group/btn"
                                >
                                    <span className="font-bold text-sm">Publish Issue</span>
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 text-gray-400 cursor-not-allowed">
                                    <span className="font-bold text-sm">Issue Published</span>
                                    <Lock className="w-4 h-4 opacity-30" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {publications.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-center">
                        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-xl font-serif font-black text-gray-400">No Publication Cycles Found</h3>
                        <p className="text-gray-400 text-sm mt-2">Initialize your first volume and issue to start publishing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

