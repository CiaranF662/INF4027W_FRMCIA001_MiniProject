"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Users, ShoppingBag, Wallet, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmtR = (n) =>
    `R\u00A0${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function StatCard({ label, value, sub, icon: Icon, bg, iconColor }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-4`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{label}</p>
            <p className="text-xs text-slate-400 mt-2 leading-snug">{sub}</p>
        </div>
    );
}

function AiInsights({ type, user }) {
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/ai/insights?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            setInsights(d.insights || 'Could not generate insights. Please try again.');
        } catch {
            setInsights('Failed to generate insights. You may have hit a rate limit — try again in a minute.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">AI Insights</h3>
                </div>
                {!loading && (
                    <button
                        onClick={generate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                    >
                        <Sparkles className="w-3 h-3" /> {insights ? 'Regenerate' : 'Generate Insights'}
                    </button>
                )}
            </div>
            {loading ? (
                <div className="space-y-2.5 animate-pulse">
                    <div className="h-3 bg-indigo-100 rounded w-full" />
                    <div className="h-3 bg-indigo-100 rounded w-5/6" />
                    <div className="h-3 bg-indigo-100 rounded w-4/6" />
                </div>
            ) : insights ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{insights}</div>
            ) : (
                <p className="text-sm text-slate-400">Click "Generate Insights" to analyse your customer data with AI.</p>
            )}
        </div>
    );
}

export default function CustomersReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token => {
            fetch('/api/reports/customers', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(d => { setData(d); setLoading(false); });
        });
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
    );
    if (!data) return null;

    const STAT_CARDS = [
        {
            label: 'Total Customers',
            value: data.totalCustomers,
            sub: 'Registered accounts',
            icon: Users,
            bg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            label: 'Total Orders',
            value: data.totalOrders,
            sub: 'All time',
            icon: ShoppingBag,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Avg Spend per Buyer',
            value: data.avgSpendPerBuyer != null ? fmtR(data.avgSpendPerBuyer) : '—',
            sub: `Across ${data.buyersWithOrders ?? 0} ordering customers`,
            icon: Wallet,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Repeat Buyers',
            value: data.repeatBuyerCount ?? 0,
            sub: 'Placed more than 1 order',
            icon: RefreshCw,
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customer Report</h2>
                <p className="text-slate-500 mt-1">Customer demographics, top buyers, and growth over time</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STAT_CARDS.map((card, i) => <StatCard key={i} {...card} />)}
            </div>

            {/* AI Insights */}
            <AiInsights type="customers" user={user} />

            {/* Growth + Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* New Customers Over Time */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">New Customers by Month</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Platform growth over time</p>
                    </div>
                    <div className="p-6">
                        {data.newCustomersByMonth?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={data.newCustomersByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                                    <Line type="monotone" dataKey="newCustomers" stroke="#6366f1" strokeWidth={2.5}
                                        dot={{ fill: '#6366f1', r: 4 }} name="New Customers" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No customer growth data yet.</p>}
                    </div>
                </div>

                {/* Customer Locations — horizontal progress bars */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Customer Locations</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Where your customers are based</p>
                    </div>
                    <div className="p-6">
                        {data.customerLocations?.length > 0 ? (
                            <div className="flex flex-col gap-5">
                                {data.customerLocations.slice(0, 8).map((item, i) => {
                                    const maxCount = data.customerLocations[0]?.count || 1;
                                    const barPct = Math.round((item.count / maxCount) * 100);
                                    const totalCount = data.customerLocations.reduce((s, l) => s + l.count, 0);
                                    const sharePct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                                    return (
                                        <div key={item.location}>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <span className="text-sm font-bold text-slate-700">{item.location}</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {item.count} customer{item.count !== 1 ? 's' : ''} · {sharePct}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${barPct}%`, backgroundColor: COLOURS[i % COLOURS.length] }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No location data yet.</p>}
                    </div>
                </div>

            </div>

            {/* Top Buyers */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Top Buyers</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customers ranked by lifetime spend</p>
                </div>
                <div className="p-6">
                    {data.topBuyers?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {data.topBuyers.slice(0, 8).map((buyer, i) => (
                                <div key={buyer.buyerId} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <span className="text-sm font-bold text-slate-300 w-5 shrink-0">#{i + 1}</span>
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                        {buyer.buyerName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{buyer.buyerName}</p>
                                        <p className="text-xs text-slate-500">
                                            {buyer.buyerEmail} · {buyer.orderCount} order{buyer.orderCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-slate-900">{fmtR(buyer.totalSpend)}</p>
                                        <p className="text-[10px] text-slate-400">lifetime spend</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-400 text-sm py-4 text-center">No buyer data yet.</p>}
                </div>
            </div>

        </div>
    );
}
