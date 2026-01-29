import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search } from 'lucide-react';

const items = [
    { id: '2026-001', paper: 'ML for Energy', reviewer: 'Dr. Sarah Thompson', status: 'In Progress', deadline: 'Feb 10' },
    { id: '2025-098', paper: 'IoT Security Survey', reviewer: 'Dr. Elena R.', status: 'Completed', deadline: 'Jan 25' },
];

export default function Reviews() {
    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Peer Review Tracking</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Managing offline reviews. Reviewers receive files via email.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-lg transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter bg-gray-50 px-2 py-1 rounded">ID: {item.id}</span>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{item.paper}</h3>
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium">{item.reviewer}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                    <Clock className="w-4 h-4 text-gray-300" />
                                    <span className={item.status === 'Completed' ? 'text-gray-300 line-through' : 'text-orange-600'}>Deadline: {item.deadline}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {item.status === 'In Progress' ? (
                                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <FileUp className="w-5 h-5" /> Upload Feedback
                                </button>
                            ) : (
                                <button className="bg-gray-50 text-gray-400 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 border border-transparent">
                                    <CheckCircle className="w-5 h-5" /> View Feedback
                                </button>
                            )}
                            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-secondary/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-secondary/20">
                <ShieldAlert className="w-16 h-16 text-secondary/30 mb-6" />
                <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Ready to assign a new reviewer?</h3>
                <p className="text-gray-500 max-w-sm mb-8">Search for an accepted paper that hasn't been assigned yet.</p>
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input className="w-full bg-white border border-gray-100 pl-12 pr-4 py-4 rounded-2xl shadow-sm outline-none font-bold" placeholder="Enter Paper ID..." />
                </div>
            </div>
        </div>
    );
}
