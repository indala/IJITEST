"use client";

import { Users, UserPlus, Shield, Mail, Trash2, X, ShieldCheck, UserCog } from 'lucide-react';
import { getUsers, createUser, deleteUser } from '@/actions/users';
import { useState, useEffect } from 'react';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Users...</div>;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Users & Roles</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage editorial staff and system access levels.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/95 transition-all"
                >
                    <UserPlus className="w-5 h-5" /> Add Staff Member
                </button>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Invite Staff Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form action={async (formData) => {
                            const result = await createUser(formData);
                            if (result.success) {
                                setShowAddModal(false);
                                fetchData();
                            } else {
                                alert(result.error);
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Full Name</label>
                                <input name="fullName" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Dr. Jane Smith" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Email Address</label>
                                <input name="email" type="email" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="jane@ijitest.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">User Role</label>
                                <select name="role" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none">
                                    <option value="reviewer">Reviewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Send Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {users.map((user) => (
                    <div key={user.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                <UserCog className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-serif font-black text-gray-900 leading-tight">{user.full_name}</h3>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{user.role}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Mail className="w-4 h-4 text-gray-300" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                <ShieldCheck className="w-4 h-4 text-gray-300" />
                                <span>Access granted {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Employee #{user.id}</span>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to revoke access for this user?")) {
                                        const result = await deleteUser(user.id);
                                        if (result?.error) {
                                            alert(result.error);
                                        } else {
                                            fetchData();
                                        }
                                    }
                                }}
                                className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {user.role === 'admin' && (
                            <div className="absolute top-4 right-4 text-green-600">
                                <Shield className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Role Reference Guide */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 mt-20">
                <div className="mb-10">
                    <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Role Reference Guide</h2>
                    <p className="text-gray-500 font-medium">Detailed breakdown of editorial responsibilities and access levels.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="p-8 bg-gray-50 rounded-3xl border border-transparent hover:border-primary/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif font-black text-xl text-gray-900 mb-2 uppercase tracking-tight">Admin <span className="text-sm font-bold text-gray-400 italic font-sans block mt-1">(The Architect)</span></h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">The Admin handles the system. They ensure the website stays online and the users are managed.</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                                <p className="text-xs font-bold text-gray-700 italic">"Main Job: Configuration and technical oversight"</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Actions</p>
                                <ul className="text-[10px] font-bold text-gray-600 space-y-1">
                                    <li>• Creating user accounts</li>
                                    <li>• Managing site security</li>
                                    <li>• Updating journal metadata</li>
                                    <li>• Fixing technical bugs</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-transparent hover:border-primary/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                            <UserCog className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif font-black text-xl text-gray-900 mb-2 uppercase tracking-tight">Editor <span className="text-sm font-bold text-gray-400 italic font-sans block mt-1">(The Decision-Maker)</span></h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">The Editor handles the content flow. They are the bridge between the author and the final publication.</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>
                                <p className="text-xs font-bold text-gray-700 italic">"Main Job: Managing the Life Cycle of a paper"</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Actions</p>
                                <ul className="text-[10px] font-bold text-gray-600 space-y-1">
                                    <li>• Pre-screening submissions</li>
                                    <li>• Assigning papers to reviewers</li>
                                    <li>• Making final Accept/Reject decisions</li>
                                    <li>• Scheduling publication issues</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-transparent hover:border-primary/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-green-600/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif font-black text-xl text-gray-900 mb-2 uppercase tracking-tight">Reviewer <span className="text-sm font-bold text-gray-400 italic font-sans block mt-1">(The Expert Witness)</span></h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">The Reviewer handles quality control. They provide an unbiased opinion on technical evaluation.</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></div>
                                <p className="text-xs font-bold text-gray-700 italic">"Main Job: Technical evaluation"</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Actions</p>
                                <ul className="text-[10px] font-bold text-gray-600 space-y-1">
                                    <li>• Reading manuscripts</li>
                                    <li>• Checking for plagiarism or errors</li>
                                    <li>• Providing recommendations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Comparison</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Can Publish?</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Can Delete Users?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 font-bold text-gray-900">Admin</td>
                                <td className="p-6 text-sm text-gray-600 font-medium italic">Infrastructure</td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-green-500 mx-auto"></div></td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-green-500 mx-auto"></div></td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 font-bold text-gray-900">Editor</td>
                                <td className="p-6 text-sm text-gray-600 font-medium italic">Workflow</td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-green-500 mx-auto"></div></td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-gray-200 mx-auto"></div></td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 font-bold text-gray-900">Reviewer</td>
                                <td className="p-6 text-sm text-gray-600 font-medium italic">Accuracy</td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-gray-200 mx-auto"></div></td>
                                <td className="p-6 text-center"><div className="w-2 h-2 rounded-full bg-gray-200 mx-auto"></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
