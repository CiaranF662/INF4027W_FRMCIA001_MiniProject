"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp, Wallet, PackageSearch, Users, ArrowUpRight, MoreHorizontal, Loader2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/lib/auth-context';

export default function AdminOverview() {
    const { user } = useAuth();

    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentlySold, setRecentlySold] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const token = await user.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch orders, products, and users in parallel
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

            // Calculate total revenue from all orders
            const totalRevenue = ordersArr.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

            setStats({
                revenue:   `R ${totalRevenue.toLocaleString('en-ZA')}`,
                orders:    ordersArr.length,
                products:  productsArr.filter(p => p.status === 'available').length,
                customers: usersArr.filter(u => u.role !== 'admin').length,
            });

            // Most recent 5 orders for the table
            setRecentOrders(ordersArr.slice(0, 5));

            // Recently sold: flatten items from the latest orders, deduplicate by productId
            const soldItems = [];
            const seen = new Set();
            for (const order of ordersArr) {
                for (const item of (order.items || [])) {
                    if (!seen.has(item.productId)) {
                        seen.add(item.productId);
                        soldItems.push({ ...item, orderedAt: order.createdAt });
                    }
                }
                if (soldItems.length >= 4) break;
            }
            setRecentlySold(soldItems);
            setLoading(false);
        };

        load().catch(() => setLoading(false));
    }, [user]);

    const formatDate = (ts) => {
        if (!ts) return '—';
        const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatMethod = (m) => {
        if (!m) return '—';
        return { card: 'Card', paypal: 'PayPal', cash_on_delivery: 'Cash on Delivery' }[m] ?? m;
    };

    const STAT_CARDS = stats ? [
        { label: "Total Revenue",   value: stats.revenue,   trend: "All time",  icon: Wallet,        color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50" },
        { label: "Total Orders",    value: stats.orders,    trend: "All time",  icon: TrendingUp,    color: "from-indigo-400 to-indigo-600",   bg: "bg-indigo-50" },
        { label: "Active Products", value: stats.products,  trend: "In stock",  icon: PackageSearch, color: "from-amber-400 to-amber-600",     bg: "bg-amber-50" },
        { label: "Total Customers", value: stats.customers, trend: "Registered",icon: Users,         color: "from-blue-400 to-blue-600",       bg: "bg-blue-50" },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Platform metrics and recent activity for Denim Revibe.</p>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STAT_CARDS.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className="w-6 h-6" style={{ color: "var(--tw-gradient-from)" }} />
                            </div>
                            <Badge variant="secondary" className="bg-slate-50 text-slate-600 font-medium border border-slate-100 shadow-none">
                                {stat.trend}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500 rounded-full`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                            View All <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {recentOrders.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-12">No orders yet.</p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="font-semibold text-slate-500">Customer</TableHead>
                                        <TableHead className="font-semibold text-slate-500">Items</TableHead>
                                        <TableHead className="font-semibold text-slate-500">Total</TableHead>
                                        <TableHead className="font-semibold text-slate-500">Payment</TableHead>
                                        <TableHead className="font-semibold text-slate-500 text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id} className="border-slate-100 transition-colors hover:bg-slate-50/50">
                                            <TableCell className="text-slate-600 text-sm">{order.buyerEmail}</TableCell>
                                            <TableCell className="text-slate-600">{order.items?.length ?? 0}</TableCell>
                                            <TableCell className="font-bold text-slate-900">R{order.totalAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium text-slate-600 bg-white shadow-sm border-slate-200 py-0.5">
                                                    {formatMethod(order.paymentMethod)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-slate-500">{formatDate(order.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* RECENTLY SOLD ITEMS */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recently Sold</h3>
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        {recentlySold.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center">No sold items yet.</p>
                        ) : (
                            recentlySold.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase text-slate-400">img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(item.orderedAt)}</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 shrink-0">R{item.price}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                        <Link href="/admin/products" className="block w-full text-center text-sm font-semibold text-indigo-600 py-2 hover:text-indigo-700 transition-colors">
                            Manage Inventory
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
