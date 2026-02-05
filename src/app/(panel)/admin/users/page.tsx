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
                            <h2 className="text-2xl font-serif font-black text-gray-900">Add New Editor</h2>
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
                                <label className="text-sm font-bold text-gray-500">Password</label>
                                <input name="password" type="password" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">User Role</label>
                                <select name="role" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none">
                                    <option value="editor">Editor</option>
                                    <option value="admin">Administrator</option>
                                    <option value="reviewer">Reviewer</option>
                                </select>
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Create Account
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
                                        await deleteUser(user.id);
                                        fetchData();
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
        </div>
    );
}
