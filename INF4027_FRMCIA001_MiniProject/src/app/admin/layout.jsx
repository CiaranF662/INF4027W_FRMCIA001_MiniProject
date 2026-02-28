"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    BarChart3, Package, LayoutGrid, ShoppingBag, Users,
    LineChart, PieChart, Activity, LogOut, ExternalLink
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const NAV_ITEMS = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: LayoutGrid },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
];

const REPORT_ITEMS = [
    { name: 'Financial', href: '/admin/reports/financial', icon: LineChart },
    { name: 'Products', href: '/admin/reports/products', icon: PieChart },
    { name: 'Customers', href: '/admin/reports/customers', icon: Activity },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname() || '/admin';
    const router = useRouter();
    const { user, userProfile, loading } = useAuth();

    // Redirect non-admins away from the admin portal
    useEffect(() => {
        if (!loading && (!user || userProfile?.role !== 'admin')) {
            router.push('/auth/login');
        }
    }, [user, userProfile, loading, router]);

    if (loading || !user || userProfile?.role !== 'admin') return null;

    const NavLink = ({ item }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-300 group ${isActive
                        ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
            >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-sm tracking-wide">{item.name}</span>

                {/* Subtle active state indicator dot */}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FC] font-sans selection:bg-indigo-200">

            {/* SIDEBAR: Deep Premium Dark Theme */}
            <aside className="w-64 bg-[#111119] border-r border-[#1f1f2e] hidden md:flex flex-col shrink-0 sticky top-0 h-screen z-20">

                {/* Brand Area */}
                <div className="h-20 flex items-center px-8 border-b border-[#1f1f2e]/60 mb-6">
                    <div className="flex items-center gap-3">
                        {/* DR monogram — white strokes on dark sidebar */}
                        <svg width="44" height="30" viewBox="0 0 44 30" fill="none" className="shrink-0">
                            <path
                                d="M 2 2 L 2 28 M 2 2 L 8 2 C 20 2 23 8 23 15 C 23 22 20 28 8 28 L 2 28"
                                stroke="rgba(255,255,255,0.9)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path
                                d="M 29 2 L 29 28 M 29 2 L 35 2 C 42 2 42 12 35 12 L 29 12 M 35 12 L 42 28"
                                stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex flex-col leading-none" style={{ gap: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(129,140,248,1)', textTransform: 'uppercase', fontFamily: "'Barlow', sans-serif" }}>
                                Denim
                            </span>
                            <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', lineHeight: 1, fontFamily: "'Barlow', sans-serif" }}>
                                Revibe
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto px-1 hide-scrollbar">
                    <div className="mb-8">
                        <div className="px-8 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#5e5e78]">Main Menu</div>
                        <nav className="flex flex-col gap-1">
                            {NAV_ITEMS.map((item) => <NavLink key={item.name} item={item} />)}
                        </nav>
                    </div>

                    <div>
                        <div className="px-8 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#5e5e78]">Reports</div>
                        <nav className="flex flex-col gap-1">
                            {REPORT_ITEMS.map((item) => <NavLink key={item.name} item={item} />)}
                        </nav>
                    </div>
                </div>

                {/* View Store link */}
                <div className="px-4 pb-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm w-full"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Store
                    </Link>
                </div>

                {/* Admin Footer Area */}
                <div className="p-4 border-t border-[#1f1f2e]/60 mt-auto">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a24] rounded-xl border border-[#2a2a38]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            A
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-white truncate">Admin User</span>
                            <span className="text-xs text-slate-500">Platform Mgr</span>
                        </div>
                        <button
                            onClick={async () => { await signOut(auth); router.push('/'); }}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header/Nav area (Mobile friendly eventually, but clean desktop for now) */}
                <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
                    </div>

                    <div className="flex items-center gap-4">
                    </div>
                </header>

                {/* Injected Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@700;800&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    );
}
