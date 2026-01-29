"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileStack,
    Users,
    BookOpen,
    CreditCard,
    Settings,
    MessageSquare,
    LogOut,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';

const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/admin' },
    { name: 'Submissions', icon: <FileStack />, href: '/admin/submissions' },
    { name: 'Peer Review', icon: <ShieldAlert />, href: '/admin/reviews' },
    { name: 'Volumes & Issues', icon: <BookOpen />, href: '/admin/publications' },
    { name: 'Payments', icon: <CreditCard />, href: '/admin/payments' },
    { name: 'Messages', icon: <MessageSquare />, href: '/admin/messages' },
    { name: 'Users & Roles', icon: <Users />, href: '/admin/users' },
    { name: 'System Settings', icon: <Settings />, href: '/admin/settings' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Don't show sidebar for login page
    if (pathname === '/admin/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-gray-50 mb-6">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-black text-xl">IJ</span>
                        </div>
                        <div>
                            <h2 className="font-serif font-black text-gray-900 leading-none">IJITEST</h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editor Panel</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between p-4 rounded-2xl group transition-all ${isActive
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-white'
                                        }`}>
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="text-sm">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 h-24 sticky top-0 z-10">
                    <h1 className="text-xl font-serif font-black text-gray-900 uppercase tracking-widest">
                        {sidebarItems.find(i => pathname === i.href)?.name || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm font-black text-gray-900">Dr. Rajesh V. Patil</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Editor-in-Chief</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                            {/* Avatar Placeholder */}
                        </div>
                    </div>
                </header>

                <div className="p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
