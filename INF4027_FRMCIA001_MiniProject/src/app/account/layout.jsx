"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, Heart, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
    { name: 'Overview', href: '/account', icon: User, exact: true },
    { name: 'My Orders', href: '/account/orders', icon: ShoppingBag },
    { name: 'My Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Profile Settings', href: '/account/profile', icon: Settings },
];

export default function AccountLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, userProfile, loading } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="container mx-auto px-4 md:px-6 py-8">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Account</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {userProfile?.name?.split(' ')[0] || 'there'}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-[240px] shrink-0">
                        <nav className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            {NAV_ITEMS.map((item, idx) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-5 py-4 transition-colors group
                                        ${idx < NAV_ITEMS.length - 1 ? 'border-b border-slate-100' : ''}
                                        ${isActive(item)
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-4 h-4 ${isActive(item) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    {isActive(item) && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Page Content */}
                    <main className="flex-1 w-full min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
