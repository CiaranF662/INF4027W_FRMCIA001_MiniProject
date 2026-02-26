"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, LayoutDashboard, Package, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { getCartCount } from '@/lib/cart';
import { Badge } from "@/components/ui/badge";

// Denim categories — links to /products with a pre-selected category filter
const CATEGORIES = [
    { name: 'Jeans',        href: '/products?category=Jeans' },
    { name: 'Jackets',      href: '/products?category=Jackets' },
    { name: 'Shorts',       href: '/products?category=Shorts' },
    { name: 'Skirts',       href: '/products?category=Skirts' },
    { name: 'Overalls',     href: '/products?category=Overalls' },
    { name: 'Shirts',       href: '/products?category=Shirts' },
    { name: 'Accessories',  href: '/products?category=Accessories' },
];

const GENDERS = [
    { name: 'Men',    href: '/products?gender=Men' },
    { name: 'Women',  href: '/products?gender=Women' },
    { name: 'Unisex', href: '/products?gender=Unisex' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, userProfile } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    // Refs used to detect clicks outside a dropdown so we can close it
    const userMenuRef = useRef(null);
    const categoriesRef = useRef(null);

    const isAdmin = userProfile?.role === 'admin';

    // Keep cart count badge in sync with localStorage
    useEffect(() => {
        setCartCount(getCartCount());
        const handleCartUpdate = () => setCartCount(getCartCount());
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    // Fetch wishlist count when user logs in, then keep in sync with toggle events
    useEffect(() => {
        if (!user) { setWishlistCount(0); return; }
        user.getIdToken()
            .then(token => fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } }))
            .then(res => res.json())
            .then(data => setWishlistCount(Array.isArray(data) ? data.length : 0))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        const handleWishlistUpdate = (e) =>
            setWishlistCount(prev => Math.max(0, prev + (e.detail?.delta ?? 0)));
        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    }, []);

    // Close any open dropdown when the user clicks somewhere else on the page
    useEffect(() => {
        function handleClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
                setCategoriesOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUserMenuOpen(false);
        router.push('/');
    };

    // Hide Navbar entirely on auth pages and admin pages
    if (pathname?.startsWith('/auth') || pathname?.startsWith('/admin')) return null;

    // Active state for each nav item — checks both pathname AND query params
    // so that "Shop All" doesn't stay highlighted when a category or sale filter is active
    const onProductsPage = pathname === '/products';
    const hasCategory    = !!searchParams.get('category') || !!searchParams.get('gender');
    const isSaleActive   = searchParams.get('onSale') === 'true';

    const shopAllActive   = onProductsPage && !hasCategory && !isSaleActive;
    const categoriesActive = onProductsPage && hasCategory;
    const saleActive       = onProductsPage && isSaleActive;

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/90">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-20 items-center justify-between">

                    {/* LEFT: Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-lg leading-none">D</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">Denim Revibe</span>
                    </Link>

                    {/* CENTER: Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">

                        {/* Home */}
                        <Link href="/"
                            className={`text-sm font-semibold transition-colors hover:text-indigo-600 relative py-2
                                ${pathname === '/' ? 'text-indigo-600' : 'text-slate-600'}`}>
                            Home
                            {pathname === '/' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                        </Link>

                        {/* Shop All — only active when on /products with no category/sale filter */}
                        <Link href="/products"
                            className={`text-sm font-semibold transition-colors hover:text-indigo-600 relative py-2
                                ${shopAllActive ? 'text-indigo-600' : 'text-slate-600'}`}>
                            Shop All
                            {shopAllActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                        </Link>

                        {/* Categories dropdown */}
                        <div className="relative" ref={categoriesRef}>
                            {/* Categories — highlighted when a category or gender filter is active */}
                            <button
                                onClick={() => setCategoriesOpen(!categoriesOpen)}
                                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 relative
                                    ${categoriesActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                            >
                                Categories
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                                {categoriesActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                            </button>

                            {categoriesOpen && (
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                                    {/* Category links */}
                                    <p className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Browse by Category</p>
                                    {CATEGORIES.map(cat => (
                                        <Link key={cat.name} href={cat.href}
                                            onClick={() => setCategoriesOpen(false)}
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            {cat.name}
                                        </Link>
                                    ))}

                                    <div className="border-t border-slate-100 my-2" />

                                    {/* Gender links */}
                                    <p className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Browse by Gender</p>
                                    {GENDERS.map(g => (
                                        <Link key={g.name} href={g.href}
                                            onClick={() => setCategoriesOpen(false)}
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            {g.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sale — red text always, underlined when active */}
                        <Link href="/products?onSale=true&sortBy=discount"
                            className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors relative py-2">
                            Sale
                            {saleActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full" />}
                        </Link>

                    </nav>

                    {/* RIGHT: Cart + User */}
                    <div className="flex items-center gap-3 sm:gap-5">

                        {/* Wishlist heart — only shown when logged in, links to saved items */}
                        {user && (
                            <Link href="/account/wishlist"
                                className="relative text-slate-500 hover:text-rose-500 transition-colors hidden sm:block">
                                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                                {wishlistCount > 0 && (
                                    <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-rose-500 hover:bg-rose-600 text-[10px] font-bold text-white border-2 border-white rounded-full">
                                        {wishlistCount}
                                    </Badge>
                                )}
                            </Link>
                        )}

                        {/* Admin "switch back" pill — only visible to logged-in admins browsing the customer site */}
                        {isAdmin && (
                            <Link href="/admin"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors">
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Admin Portal
                            </Link>
                        )}

                        {/* Cart icon with live count badge */}
                        <Link href="/cart" className="relative text-slate-500 hover:text-indigo-600 transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-rose-500 hover:bg-rose-600 text-[10px] font-bold text-white border-2 border-white rounded-full">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>

                        {/* User section — changes based on whether the user is logged in */}
                        {user ? (
                            <div className="relative hidden sm:block" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                        {userProfile?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{userProfile?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                            <User className="w-4 h-4" /> My Account
                                        </Link>
                                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                            <Package className="w-4 h-4" /> My Orders
                                        </Link>
                                        {isAdmin && (
                                            <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors">
                                                <LayoutDashboard className="w-4 h-4" /> Admin Portal
                                            </Link>
                                        )}
                                        <div className="border-t border-slate-100 mt-1 pt-1">
                                            <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                                                <LogOut className="w-4 h-4" /> Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative hidden sm:block" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link href="/auth/login" onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                            <User className="w-4 h-4" /> Sign In
                                        </Link>
                                        <Link href="/auth/signup" onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                            <User className="w-4 h-4" /> Create Account
                                        </Link>
                                        <div className="border-t border-slate-100 my-1" />
                                        <Link href="/auth/login" onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Portal
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors ml-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] bg-white border-t border-slate-100 overflow-y-auto flex flex-col pt-6 px-6 z-40">
                    <nav className="flex flex-col gap-1">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-bold text-slate-900 py-3 hover:text-indigo-600 transition-colors border-b border-slate-50">
                            Home
                        </Link>
                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-bold text-slate-900 py-3 hover:text-indigo-600 transition-colors border-b border-slate-50">
                            Shop All
                        </Link>

                        {/* Mobile Categories — expanded inline, no dropdown needed */}
                        <div className="py-3 border-b border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</p>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
                                    <Link key={cat.name} href={cat.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1 transition-colors">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="py-3 border-b border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gender</p>
                            <div className="flex gap-4">
                                {GENDERS.map(g => (
                                    <Link key={g.name} href={g.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link href="/products?onSale=true&sortBy=discount" onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-bold text-rose-500 py-3 hover:text-rose-600 transition-colors border-b border-slate-50">
                            Sale
                        </Link>

                        {isAdmin && (
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-bold text-indigo-600 py-3 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5" /> Admin Portal
                            </Link>
                        )}
                    </nav>

                    <div className="mt-auto pb-12 w-full">
                        <div className="h-px bg-slate-100 w-full mb-6"></div>
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <div className="px-1">
                                    <p className="font-semibold text-slate-900">{userProfile?.name}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full h-12 flex justify-center items-center text-slate-700 bg-slate-50 font-semibold rounded-xl border border-slate-200">
                                    My Account
                                </Link>
                                <button onClick={handleLogout}
                                    className="w-full h-12 flex justify-center items-center text-rose-600 bg-rose-50 font-semibold rounded-xl border border-rose-200">
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full h-12 flex justify-center items-center text-slate-700 bg-slate-50 font-semibold rounded-xl border border-slate-200">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full h-12 flex justify-center items-center text-white bg-indigo-600 font-semibold rounded-xl shadow-md">
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
