"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAYMENT_LABELS = {
    card: 'Card',
    paypal: 'PayPal',
    cash_on_delivery: 'Cash on Delivery',
};

const DATE_PRESETS = [
    { value: 'all',        label: 'All Time' },
    { value: 'today',      label: 'Today' },
    { value: 'week',       label: 'Last 7 Days' },
    { value: 'month',      label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
];

const getOrderDate = (ts) => {
    if (!ts) return new Date(0);
    if (ts._seconds) return new Date(ts._seconds * 1000);
    return new Date(ts);
};

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter]     = useState('all');
    const [expandedId, setExpandedId]     = useState(null);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, [user]);

    const now            = new Date();
    const startOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7          = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
    const last30         = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const filtered = orders.filter(o => {
        if (search) {
            const s = search.toLowerCase();
            const matchesSearch =
                o.buyerName?.toLowerCase().includes(s) ||
                o.id?.toLowerCase().includes(s) ||
                o.buyerEmail?.toLowerCase().includes(s);
            if (!matchesSearch) return false;
        }

        if (statusFilter !== 'all' && o.status !== statusFilter) return false;

        if (dateFilter !== 'all') {
            const d = getOrderDate(o.createdAt);
            if (dateFilter === 'today'      && d < startOfToday)   return false;
            if (dateFilter === 'week'       && d < last7)           return false;
            if (dateFilter === 'month'      && d < last30)          return false;
            if (dateFilter === 'this_month' && d < startThisMonth)  return false;
        }

        return true;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

    // Revenue total for the current filtered view
    const filteredRevenue = filtered.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const fmtR = (n) =>
        `R\u00A0${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h2>
                    <p className="text-slate-500 mt-1">{orders.length} total orders</p>
                </div>
                {/* Summary chip for current view */}
                {dateFilter !== 'all' && (
                    <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
                        {filtered.length} order{filtered.length !== 1 ? 's' : ''} · {fmtR(filteredRevenue)} revenue
                    </div>
                )}
            </div>

            {/* Date Preset Tabs */}
            <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map(p => (
                    <button
                        key={p.value}
                        onClick={() => setDateFilter(p.value)}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                            dateFilter === p.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Search + Status */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by customer or order ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-white border-slate-200 h-9 text-sm"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-sm">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
                <span className="self-center ml-auto text-xs text-slate-400 font-medium shrink-0">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="w-10" />
                                    <TableHead className="font-semibold text-slate-500">Order ID</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Items</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Total</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Payment</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Date</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(order => (
                                    <React.Fragment key={order.id}>
                                        {/* Summary row — click to expand */}
                                        <TableRow
                                            className={`border-slate-100 cursor-pointer select-none transition-colors ${
                                                expandedId === order.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                                            }`}
                                            onClick={() => toggleExpand(order.id)}
                                        >
                                            <TableCell className="pl-4 pr-0">
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                                    expandedId === order.id ? 'rotate-180' : ''
                                                }`} />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-600">
                                                #{order.id?.slice(-8).toUpperCase()}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-slate-900 text-sm">{order.buyerName}</p>
                                                <p className="text-xs text-slate-500">{order.buyerEmail}</p>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{order.items?.length || 0}</TableCell>
                                            <TableCell className="font-bold text-slate-900">R{order.totalAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-medium border-slate-200 text-slate-600">
                                                    {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">{formatDate(order.createdAt)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={order.status === 'complete'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase'
                                                    : 'border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded items detail row */}
                                        {expandedId === order.id && (
                                            <TableRow className="border-slate-100 hover:bg-transparent">
                                                <TableCell colSpan={8} className="pt-0 pb-4 px-6 bg-slate-50/70">
                                                    <div className="ml-3 pl-5 border-l-2 border-indigo-100">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                            Order Items
                                                        </p>
                                                        {order.items?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.items.map((item, i) => (
                                                                    <div
                                                                        key={item.productId || i}
                                                                        className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-sm"
                                                                    >
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                                            <span className="text-[9px] font-black text-slate-400">{i + 1}</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-slate-800 leading-tight">
                                                                                {item.title}
                                                                            </p>
                                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                                {item.brand} · <span className="font-semibold text-slate-600">R{item.price}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-slate-400">No item details available.</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                                            {dateFilter !== 'all' || search || statusFilter !== 'all'
                                                ? 'No orders match the current filters.'
                                                : 'No orders yet.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
