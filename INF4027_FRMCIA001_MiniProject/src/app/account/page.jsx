"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from "@/components/ui/badge";
import { formatPrice } from '@/lib/utils';

export default function AccountOverviewPage() {
    const { user, userProfile } = useAuth();
    const [orders, setOrders] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            const idToken = await user.getIdToken();

            // Fetch orders and wishlist in parallel
            const [ordersRes, wishlistRes] = await Promise.all([
                fetch('/api/orders', { headers: { Authorization: `Bearer ${idToken}` } }),
                fetch('/api/wishlist', { headers: { Authorization: `Bearer ${idToken}` } }),
            ]);

            const ordersData = await ordersRes.json();
            const wishlistData = await wishlistRes.json();

            // API returns the array directly (not wrapped in { orders: [...] })
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            // API returns the array directly (not wrapped in { products: [...] })
            setWishlistCount(Array.isArray(wishlistData) ? wishlistData.length : 0);
            setLoading(false);
        };

        loadData();
    }, [user]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const recentOrders = orders.slice(0, 3);

    return (
        <div className="space-y-6">

            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                        {userProfile?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{userProfile?.name}</h2>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                        {userProfile?.location && (
                            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {userProfile.location}
                            </p>
                        )}
                    </div>
                    <Link href="/account/profile" className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
                        Edit <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/account/orders" className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{loading ? '—' : orders.length}</p>
                    <p className="text-sm text-slate-500 mt-1">Total Orders</p>
                </Link>
                <Link href="/account/wishlist" className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                        <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{loading ? '—' : wishlistCount}</p>
                    <p className="text-sm text-slate-500 mt-1">Saved Items</p>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
                    <Link href="/account/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
                        View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="px-6 py-8 text-slate-400 text-sm text-center">Loading orders...</div>
                ) : recentOrders.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No orders yet</p>
                        <p className="text-slate-400 text-sm mt-1">Your completed orders will appear here.</p>
                        <Link href="/products" className="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            Start shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentOrders.map(order => (
                            <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
