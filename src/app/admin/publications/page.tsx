import { Plus, BookOpen, Layers, Calendar, ChevronRight, Lock } from 'lucide-react';

const publications = [
    { volume: 10, issue: 5, year: 2025, status: 'Open', papers: 12, date: 'Oct - Dec' },
    { volume: 10, issue: 4, year: 2025, status: 'Published', papers: 24, date: 'July - Sep' },
    { volume: 10, issue: 3, year: 2025, status: 'Published', papers: 18, date: 'Apr - June' },
];

export default function Publications() {
    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Volumes & Issues</h1>
                    <p className="text-gray-500 font-medium">Manage journal publication cycles and assign papers.</p>
                </div>
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create New Issue
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publications.map((item) => (
                    <div key={`${item.volume}-${item.issue}`} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                        <div className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.status === 'Open' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Open' ? 'text-primary bg-primary/10' : 'text-gray-400 bg-gray-50'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <h3 className="text-2xl font-serif font-black text-gray-900 mb-2">Volume {item.volume}, Issue {item.issue}</h3>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" /> <span>{item.date} {item.year}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Layers className="w-4 h-4" /> <span>{item.papers} Papers Assigned</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 pt-0">
                            <button className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${item.status === 'Open' ? 'bg-gray-50 text-gray-900 hover:bg-primary hover:text-white' : 'bg-gray-50 text-gray-400'
                                }`}>
                                <span className="font-bold text-sm">Manage Publication</span>
                                {item.status === 'Published' ? <Lock className="w-4 h-4 opacity-30" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create Ghost Card */}
                <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
                        <Plus className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-400 group-hover:text-primary transition-colors">New Volume / Year</h3>
                    <p className="text-xs text-gray-300 mt-2">Initialize a new academic publication year</p>
                </div>
            </div>
        </div>
    );
}
