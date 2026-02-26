"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Wallet, ArrowUpRight, Receipt } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ label, value, sub, icon: Icon, colour }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colour}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function FinancialReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/reports/financial', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(d => { setData(d); setLoading(false); });
    }, [user]);

    if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
    if (!data) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Report</h2>
                <p className="text-slate-500 mt-1">Revenue, cost of sales, and profit analysis</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`R ${data.totalRevenue?.toLocaleString('en-ZA')}`} sub={`${data.totalOrders} orders`} icon={TrendingUp} colour="bg-indigo-500" />
                <StatCard label="Total Cost" value={`R ${data.totalCost?.toLocaleString('en-ZA')}`} sub="Cost of goods sold" icon={Receipt} colour="bg-rose-500" />
                <StatCard label="Gross Profit" value={`R ${data.totalProfit?.toLocaleString('en-ZA')}`} sub={data.totalRevenue > 0 ? `${Math.round((data.totalProfit / data.totalRevenue) * 100)}% margin` : ''} icon={Wallet} colour="bg-emerald-500" />
                <StatCard label="Avg. Order Value" value={`R ${data.averageOrderValue}`} sub="Per completed order" icon={ArrowUpRight} colour="bg-amber-500" />
            </div>

            {/* Revenue Over Time — Line Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-6">Revenue Over Time</h3>
                {data.revenueByMonth?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={data.revenueByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `R${v}`} />
                            <Tooltip formatter={(v) => [`R ${v.toLocaleString('en-ZA')}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-slate-400 text-sm py-8 text-center">No revenue data yet.</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Category — Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-6">Revenue by Category</h3>
                    {data.revenueByCategory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.revenueByCategory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R${v}`} />
                                <Tooltip formatter={(v) => [`R ${v.toLocaleString('en-ZA')}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No category data yet.</p>}
                </div>

                {/* Revenue by Payment Method — Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-6">Revenue by Payment Method</h3>
                    {data.revenueByPayment?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.revenueByPayment} dataKey="revenue" nameKey="method" cx="50%" cy="50%"
                                    outerRadius={90} label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={{ stroke: '#cbd5e1' }}>
                                    {data.revenueByPayment.map((_, i) => (
                                        <Cell key={i} fill={COLOURS[i % COLOURS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [`R ${v.toLocaleString('en-ZA')}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No payment data yet.</p>}
                </div>
            </div>
        </div>
    );
}
