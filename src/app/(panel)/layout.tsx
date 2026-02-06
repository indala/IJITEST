"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LogOut,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { getSession } from '@/actions/session';
import { useState, useEffect } from 'react';
import { sidebarItems, getFullHref } from '@/lib/navigation';

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        async function loadSession() {
            const session = await getSession();
            setUser(session);
        }
        loadSession();
    }, []);

    // Don't show sidebar for login page
    if (pathname === '/login') return <>{children}</>;

    const role = user?.role || 'reviewer';

    // Filter items based on user role and generate full hrefs
    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />

            <aside className={`w-72 bg-white border-r border-gray-100 flex flex-col fixed lg:sticky top-0 h-screen z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-8 border-b border-gray-50 mb-6 flex justify-between items-center">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-black text-xl">IJ</span>
                        </div>
                        <div>
                            <h2 className="font-serif font-black text-gray-900 leading-none">IJITEST</h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editor Panel</span>
                        </div>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredItems.map((item: any) => {
                        const isActive = pathname === item.fullHref;
                        return (
                            <Link
                                key={item.name}
                                href={item.fullHref}
                                onClick={() => setIsMobileMenuOpen(false)}
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
                                    <span className="font-bold text-sm tracking-tight">
                                        {item.labelOverrides?.[user?.role || ''] || item.name}
                                    </span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="text-sm">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 h-16 lg:h-24 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg lg:text-xl font-serif font-black text-gray-900 uppercase tracking-widest truncate">
                            {filteredItems.find(i => pathname === i.fullHref)?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-gray-900">{user?.fullName || 'Loading...'}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{user?.role || 'Staff'}</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-primary font-black flex-shrink-0">
                            {user?.fullName?.charAt(0) || 'J'}
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
