import { FileText, Clock, CheckCircle, AlertCircle, MessageSquare, CreditCard } from 'lucide-react';

const submissions = [
    {
        id: "IJITEST-2026-001",
        title: "Advancements in Machine Learning for Renewable Energy Optimization",
        status: "Under Review",
        date: "Jan 28, 2026",
        color: "text-blue-600 bg-blue-50",
        icon: <Clock className="w-5 h-5" />
    },
    {
        id: "IJITEST-2025-098",
        title: "Security Protocols in IoT: A Survey",
        status: "Published",
        date: "Dec 15, 2025",
        color: "text-green-600 bg-green-50",
        icon: <CheckCircle className="w-5 h-5" />
    }
];

export default function AuthorDashboard() {
    return (
        <div className="py-20 bg-gray-50/50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-black text-gray-900 mb-2">My Submissions</h1>
                        <p className="text-gray-500">Track the status of your research papers and revisions.</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        Submit New Paper
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {submissions.map((paper) => (
                        <div key={paper.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs font-bold text-gray-400 font-mono tracking-tighter bg-gray-100 px-2 py-1 rounded uppercase">Paper ID: {paper.id}</span>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${paper.color}`}>
                                                {paper.icon}
                                                {paper.status}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold font-serif text-gray-900 leading-tight mb-2">{paper.title}</h2>
                                        <p className="text-gray-500 text-sm flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Submitted on {paper.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-8">
                                    <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 text-gray-700 font-bold transition-all">
                                        <FileText className="w-5 h-5 text-gray-400" /> View Details
                                    </button>
                                    <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 text-gray-700 font-bold transition-all">
                                        <MessageSquare className="w-5 h-5 text-gray-400" /> Admin Messages
                                    </button>
                                    {paper.status === "Payment Pending" && (
                                        <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 scale-105">
                                            <CreditCard className="w-5 h-5" /> Pay Now
                                        </button>
                                    )}
                                    {paper.status === "Revision Required" && (
                                        <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 scale-105">
                                            <AlertCircle className="w-5 h-5" /> Upload Revision
                                        </button>
                                    )}
                                    {(paper.status === "Under Review" || paper.status === "Published") && (
                                        <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 opacity-50 cursor-not-allowed text-gray-400 font-bold border border-transparent">
                                            No Action Required
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Timeline Preview */}
                            <div className="bg-gray-50/80 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Progress
                                </div>
                                <div className="flex-1 mx-8 h-1 bg-gray-200 rounded-full relative">
                                    <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full"></div>
                                </div>
                                <div className="text-xs font-bold text-primary">35% Complete</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
