"use client";

import { MessageSquare, Mail, Calendar, CheckCircle, Eye, Archive, Trash2, User, Clock, AlertCircle } from 'lucide-react';
import { getMessages, updateMessageStatus } from '@/actions/messages';
import { useState, useEffect } from 'react';

export default function Messages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getMessages();
        setMessages(data);
        setLoading(false);
    }

    async function handleStatusChange(id: number, status: string) {
        await updateMessageStatus(id, status);
        if (selectedMessage?.id === id) {
            setSelectedMessage({ ...selectedMessage, status });
        }
        fetchData();
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Inbox...</div>;

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-8 pb-10">
            {/* Sidebar List */}
            <div className="lg:w-1/3 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-serif font-black text-gray-900 flex items-center gap-3">
                        Inbox
                        {unreadCount > 0 && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => {
                                setSelectedMessage(m);
                                if (m.status === 'unread') handleStatusChange(m.id, 'read');
                            }}
                            className={`p-6 cursor-pointer transition-all hover:bg-gray-50 ${selectedMessage?.id === m.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''} ${m.status === 'unread' ? 'font-black' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{m.subject || 'No Subject'}</span>
                                <span className="text-[10px] text-gray-400">{new Date(m.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{m.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1 italic">{m.message}</p>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="p-20 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No messages</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {selectedMessage ? (
                    <>
                        <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                    <User className="w-8 h-8 text-primary/40" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif font-black text-gray-900">{selectedMessage.name}</h2>
                                    <p className="text-sm font-bold text-primary">{selectedMessage.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedMessage.status !== 'archived' ? (
                                    <button
                                        onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                                        className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                                        title="Archive"
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                                        className="p-4 bg-orange-50 rounded-2xl text-orange-600 hover:bg-orange-100 transition-all shadow-sm"
                                        title="Unarchive"
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                )}
                                <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm" title="Delete">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-12 overflow-y-auto space-y-8">
                            <div className="p-10 bg-gray-50 rounded-[2rem] border border-transparent">
                                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                                    <AlertCircle className="w-4 h-4" /> Message Content
                                </div>
                                <div className="text-lg font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>
                            <div className="flex items-center gap-10 text-xs font-bold text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Received: {new Date(selectedMessage.created_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Assigned Status: <span className="uppercase text-primary">{selectedMessage.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 border-t border-gray-50 bg-white">
                            <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-3">
                                <Mail className="w-5 h-5" /> Reply via Email
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Eye className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-serif font-black text-gray-300 uppercase tracking-widest">Select a message to read</h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Click on an inquiry from the inbox sidebar to view its full details and content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
