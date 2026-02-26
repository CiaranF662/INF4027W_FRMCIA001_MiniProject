"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from "@/components/ui/badge";

function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const PAYMENT_LABELS = {
        card: 'Credit / Debit Card',
        paypal: 'PayPal',
        cash_on_delivery: 'Cash on Delivery',
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">

            {/* Order Header */}
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <p className="text-xs font-mono text-slate-400">#{order.id?.slice(-8).toUpperCase()}</p>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                            {order.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xl font-black text-slate-900">R{order.totalAmount}</p>
                        <p className="text-xs text-slate-400">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shrink-0"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Collapsed preview — first item */}
            {!expanded && order.items?.length > 0 && (
                <div className="px-6 pb-5 border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                            {order.items[0].image ? (
                                <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">img</div>
                            )}
                        </div>
                        <p className="text-sm text-slate-700 flex-1 truncate">{order.items[0].title}</p>
                        {order.items.length > 1 && (
                            <span className="text-xs text-slate-400 shrink-0">+{order.items.length - 1} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* Expanded — all items */}
            {expanded && (
                <div className="border-t border-slate-100">
                    <div className="divide-y divide-slate-50">
                        {order.items?.map((item, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase">{item.brand}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/products/${item.productId}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block">
                                        {item.title}
                                    </Link>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.brand}</p>
                                </div>
                                <span className="text-sm font-bold text-slate-900 shrink-0">R{item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            // API returns the array directly (not wrapped in { orders: [...] })
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, [user]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
                {!loading && <span className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16 flex flex-col items-center text-center px-4">
                    <Package className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-700 font-semibold text-lg mb-1">No orders yet</p>
                    <p className="text-slate-400 text-sm mb-6">When you complete a purchase, your orders will appear here.</p>
                    <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Browse Denim →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
