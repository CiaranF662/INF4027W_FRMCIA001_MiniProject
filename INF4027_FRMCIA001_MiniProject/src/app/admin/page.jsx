"use client";

import React from 'react';
import {
    TrendingUp,
    Wallet,
    PackageSearch,
    Users,
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Mock Data targeting the specs
const STATS = [
    { label: "Total Revenue", value: "R 24,500", trend: "+12.5%", icon: Wallet, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Orders", value: "142", trend: "+5.2%", icon: TrendingUp, color: "from-indigo-400 to-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Products", value: "48", trend: "Active", icon: PackageSearch, color: "from-amber-400 to-amber-600", bg: "bg-amber-50" },
    { label: "Total Customers", value: "89", trend: "+18%", icon: Users, color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
];

const RECENT_ORDERS = [
    { id: "#ORD-8091", customer: "Thandi M.", items: 2, total: 1250, method: "Card", date: "Today, 14:20", status: "Complete" },
    { id: "#ORD-8090", customer: "Sipho D.", items: 1, total: 450, method: "PayPal", date: "Today, 10:15", status: "Complete" },
    { id: "#ORD-8089", customer: "Lerato N.", items: 3, total: 2100, method: "Cash on Delivery", date: "Yesterday", status: "Complete" },
    { id: "#ORD-8088", customer: "Michael K.", items: 1, total: 850, method: "Card", date: "Yesterday", status: "Complete" },
    { id: "#ORD-8087", customer: "Jessica R.", items: 2, total: 1600, method: "Card", date: "Feb 22, 2026", status: "Complete" },
];

const RECENTLY_SOLD = [
    { id: 1, title: "Vintage Levi's 501 Original", brand: "Levi's", price: 450, time: "2 hours ago" },
    { id: 2, title: "90s High Mom Jeans", brand: "Lee", price: 200, time: "5 hours ago" },
    { id: 3, title: "3301 Slim Fit Jacket", brand: "G-Star RAW", price: 850, time: "Yesterday" },
];

export default function AdminOverview() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header section */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Platform metrics and recent activity for Denim Revibe.</p>
            </div>

            {/* 4 STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STATS.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} style={{ color: "var(--tw-gradient-from)" }} />
                            </div>
                            <Badge variant="secondary" className="bg-slate-50 text-slate-600 font-medium border border-slate-100 shadow-none">
                                {stat.trend}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>

                        {/* Subtle decorative gradient blast on hover */}
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500 rounded-full`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* RECENT ORDERS TABLE (Takes up 2/3 of space on desktop) */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h3>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                            View All <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="font-semibold text-slate-500">Order ID</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Items</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Total</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Payment</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {RECENT_ORDERS.map((order) => (
                                    <TableRow key={order.id} className="border-slate-100 transition-colors hover:bg-slate-50/50 group">
                                        <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                                        <TableCell className="text-slate-600">{order.customer}</TableCell>
                                        <TableCell className="text-slate-600">{order.items}</TableCell>
                                        <TableCell className="font-bold text-slate-900">R{order.total}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium text-slate-600 bg-white shadow-sm border-slate-200 py-0.5">
                                                {order.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-slate-500">{order.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* RECENTLY SOLD ITEMS FEED (Takes up 1/3 of space) */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recently Sold</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        {RECENTLY_SOLD.map((item, idx) => (
                            <div key={item.id} className="flex gap-4 items-center group">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                        {item.brand}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{item.brand} • {item.time}</p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-sm font-bold text-slate-900 border-b border-indigo-100 pb-0.5">R{item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                        <button className="w-full text-sm font-semibold text-indigo-600 py-2 hover:text-indigo-700 transition-colors">
                            Manage Inventory
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
