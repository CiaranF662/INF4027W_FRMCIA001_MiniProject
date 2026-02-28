"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
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

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, [user]);

    const filtered = orders.filter(o => {
        const matchesSearch = !search ||
            o.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.id?.toLowerCase().includes(search.toLowerCase()) ||
            o.buyerEmail?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h2>
                <p className="text-slate-500 mt-1">{orders.length} total orders</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search by customer or order ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-slate-200" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-200">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
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
                                    <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="font-mono text-xs text-slate-600">#{order.id?.slice(-8).toUpperCase()}</TableCell>
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
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">No orders found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
