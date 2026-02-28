"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Wallet, Package, PackageCheck, TrendingUp,
    ArrowUpRight, Eye, Flame, BarChart3, Loader2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/lib/auth-context';

export default function AdminOverview() {
    const { user } = useAuth();

    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [hotInventory, setHotInventory] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const token = await user.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [ordersRes, productsRes, usersRes] = await Promise.all([
                fetch('/api/orders', { headers }),
                fetch('/api/products?adminView=true'),
                fetch('/api/users', { headers }),
            ]);

            const [orders, products, users] = await Promise.all([
                ordersRes.json(),
                productsRes.json(),
                usersRes.json(),
            ]);

            const ordersArr   = Array.isArray(orders)   ? orders   : [];
            const productsArr = Array.isArray(products) ? products : [];
            const usersArr    = Array.isArray(users)    ? users    : [];

            const available = productsArr.filter(p => p.status === 'available');
            const sold      = productsArr.filter(p => p.status === 'sold');

            const totalRevenue    = ordersArr.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
            const avgOrderValue   = ordersArr.length > 0 ? totalRevenue / ordersArr.length : 0;
            const inventoryValue  = available.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
            const sellThrough     = productsArr.length > 0
                ? Math.round((sold.length / productsArr.length) * 100)
                : 0;

            setStats({
                revenue: totalRevenue,
                orders: ordersArr.length,
                available: available.length,
                sold: sold.length,
                avgOrderValue,
                inventoryValue,
                sellThrough,
                customers: usersArr.filter(u => u.role !== 'admin').length,
            });

            // Most recent 5 orders
            setRecentOrders(ordersArr.slice(0, 5));

            // Hot inventory: available products with the most views — these are in demand but not yet sold
            setHotInventory(
                [...available]
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 4)
            );

            // Category breakdown: sold + available counts per category, sorted by sold desc
            const catMap = {};
            productsArr.forEach(p => {
                if (!p.category) return;
                if (!catMap[p.category]) catMap[p.category] = { available: 0, sold: 0 };
                if (p.status === 'available') catMap[p.category].available++;
                else if (p.status === 'sold') catMap[p.category].sold++;
            });
            setCategoryStats(
                Object.entries(catMap)
                    .map(([name, c]) => ({ name, ...c, total: c.available + c.sold }))
                    .filter(c => c.total > 0)
                    .sort((a, b) => b.sold - a.sold)
            );

            setLoading(false);
        };

        load().catch(() => setLoading(false));
    }, [user]);

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
    };

    const formatMethod = (m) =>
        ({ card: 'Card', paypal: 'PayPal', cash_on_delivery: 'CoD' }[m] ?? (m || '—'));

    const fmtR = (n) =>
        `R\u00A0${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    const STAT_CARDS = stats ? [
        {
            label: "Total Revenue",
            value: fmtR(stats.revenue),
            sub: `${stats.orders} orders total`,
            icon: Wallet,
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            label: "Available Products",
            value: stats.available,
            sub: `${fmtR(stats.inventoryValue)} at sale price`,
            icon: Package,
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            label: "Products Sold",
            value: stats.sold,
            sub: `${stats.sellThrough}% sell-through rate`,
            icon: PackageCheck,
            bg: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
        {
            label: "Avg Order Value",
            value: fmtR(stats.avgOrderValue),
            sub: `${stats.customers} registered customers`,
            icon: TrendingUp,
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
    ] : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-slate-500 mt-1">Live overview of Denim Revibe's performance.</p>
            </div>

            {/* ── STAT CARDS ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STAT_CARDS.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} mb-4`}>
                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xs text-slate-400 mt-2 leading-snug">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── RECENT ORDERS + INVENTORY HEALTH ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                            View all <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        {recentOrders.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-12">No orders yet.</p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="font-semibold text-slate-500 text-xs">Customer</TableHead>
                                        <TableHead className="font-semibold text-slate-500 text-xs">Items</TableHead>
                                        <TableHead className="font-semibold text-slate-500 text-xs">Total</TableHead>
                                        <TableHead className="font-semibold text-slate-500 text-xs">Payment</TableHead>
                                        <TableHead className="font-semibold text-slate-500 text-xs text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/50">
                                            <TableCell className="text-slate-600 text-sm">{order.buyerEmail}</TableCell>
                                            <TableCell className="text-slate-600 text-sm">{order.items?.length ?? 0}</TableCell>
                                            <TableCell className="font-bold text-slate-900 text-sm">R{order.totalAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium text-slate-600 bg-white text-xs shadow-none border-slate-200 py-0.5">
                                                    {formatMethod(order.paymentMethod)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">{formatDate(order.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Inventory Health</h3>
                    </div>

                    <div className="p-6 flex flex-col gap-5">

                        {/* Sell-through rate */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sell-through Rate</span>
                                <span className="text-lg font-black text-slate-900">{stats?.sellThrough ?? 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-700
                                        ${(stats?.sellThrough ?? 0) >= 70 ? 'bg-emerald-500'
                                        : (stats?.sellThrough ?? 0) >= 40 ? 'bg-amber-400'
                                        : 'bg-slate-300'}`}
                                    style={{ width: `${stats?.sellThrough ?? 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                                <span>{stats?.sold} sold</span>
                                <span>{stats?.available} available</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Hot inventory */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-3">
                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hot Inventory</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                                Most-viewed items still available — in demand but not yet sold.
                            </p>
                            {hotInventory.length === 0 ? (
                                <p className="text-xs text-slate-400">No views recorded yet.</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {hotInventory.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                {item.images?.[0]
                                                    ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                                                <p className="text-[10px] text-slate-400">{item.brand} · R{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 shrink-0 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                <Eye className="w-3 h-3" /> {item.views ?? 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                        <Link href="/admin/products" className="block w-full text-center text-xs font-bold uppercase tracking-wider text-indigo-600 py-1.5 hover:text-indigo-700 transition-colors">
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── CATEGORY PERFORMANCE ──────────────────────────────────────── */}
            {categoryStats.length > 0 && (
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                            <h3 className="text-base font-bold text-slate-900">Category Performance</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Sold / Total listed</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5">
                        {categoryStats.map((cat) => {
                            const pct = Math.round((cat.sold / cat.total) * 100);
                            return (
                                <div key={cat.name}>
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                                        <span className="text-[10px] text-slate-400">{cat.sold} sold · {cat.available} left</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500
                                                ${pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-slate-300'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">{pct}% sell-through</p>
                                </div>
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-5 mt-6 pt-4 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">SELL-THROUGH:</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 70%+ Healthy
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 40–69% Moderate
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Below 40% Slow
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
