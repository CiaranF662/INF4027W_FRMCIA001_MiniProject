"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Wallet, TrendingUp, Receipt, BarChart3, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PAYMENT_LABELS = { card: 'Card', paypal: 'PayPal', cash_on_delivery: 'Cash on Delivery' };

const fmtR = (n) =>
    `R\u00A0${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const PRESETS = [
    { value: 'all',         label: 'All Time' },
    { value: 'this_month',  label: 'This Month' },
    { value: 'last_month',  label: 'Last Month' },
    { value: 'last_3mo',    label: 'Last 3 Months' },
    { value: 'this_year',   label: 'This Year' },
    { value: 'custom',      label: 'Custom Range' },
];

function getPresetDates(preset) {
    const now = new Date();
    const iso = (d) => d.toISOString().split('T')[0];
    switch (preset) {
        case 'this_month':
            return { start: iso(new Date(now.getFullYear(), now.getMonth(), 1)), end: iso(now) };
        case 'last_month': {
            const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const e = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: iso(s), end: iso(e) };
        }
        case 'last_3mo': {
            const s = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return { start: iso(s), end: iso(now) };
        }
        case 'this_year':
            return { start: iso(new Date(now.getFullYear(), 0, 1)), end: iso(now) };
        default:
            return { start: '', end: '' };
    }
}

function getPeriodLabel(preset, customStart, customEnd) {
    if (preset === 'all')    return 'All time';
    if (preset === 'custom') return customStart && customEnd ? `${customStart} → ${customEnd}` : 'Select a date range';
    const { start, end } = getPresetDates(preset);
    const fmt = (d) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
}

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
                <p className="text-sm text-slate-400">Click "Generate Insights" to analyse your financial data with AI.</p>
            )}
        </div>
    );
}

export default function FinancialReportPage() {
    const { user } = useAuth();
    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [preset, setPreset]       = useState('all');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd]     = useState('');

    const fetchData = useCallback(async (startDate = '', endDate = '') => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate)   params.set('endDate', endDate);
            const url = `/api/reports/financial${params.toString() ? `?${params}` : ''}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            setData(await res.json());
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load
    useEffect(() => { fetchData(); }, [fetchData]);

    // Re-fetch when custom dates are both set
    useEffect(() => {
        if (preset === 'custom' && customStart && customEnd) {
            fetchData(customStart, customEnd);
        }
    }, [customStart, customEnd, preset, fetchData]);

    const handlePresetChange = (value) => {
        setPreset(value);
        if (value === 'all') {
            fetchData();
        } else if (value !== 'custom') {
            const { start, end } = getPresetDates(value);
            fetchData(start, end);
        }
        // 'custom' waits for both date inputs to be filled
    };

    const periodLabel = getPeriodLabel(preset, customStart, customEnd);
    const marginPct   = data?.totalRevenue > 0
        ? Math.round((data.totalProfit / data.totalRevenue) * 100) : 0;

    const STAT_CARDS = data ? [
        {
            label: 'Total Revenue',
            value: fmtR(data.totalRevenue),
            sub: `${data.totalOrders} order${data.totalOrders !== 1 ? 's' : ''} in period`,
            icon: Wallet,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Gross Profit',
            value: fmtR(data.totalProfit),
            sub: `${marginPct}% profit margin`,
            icon: TrendingUp,
            bg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            label: 'Avg Order Value',
            value: fmtR(data.averageOrderValue),
            sub: 'Per completed order',
            icon: BarChart3,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Cost of Sales',
            value: fmtR(data.totalCost),
            sub: 'Cost of goods sold',
            icon: Receipt,
            bg: 'bg-rose-50',
            iconColor: 'text-rose-600',
        },
    ] : [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Report</h2>
                    <p className="text-slate-500 mt-1">Revenue, cost of sales, and profit analysis</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {periodLabel}
                </div>
            </div>

            {/* Date Presets */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => handlePresetChange(p.value)}
                            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                preset === p.value
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom date inputs — only shown when Custom Range is selected */}
                {preset === 'custom' && (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-500">From</label>
                            <input
                                type="date"
                                value={customStart}
                                max={customEnd || undefined}
                                onChange={e => setCustomStart(e.target.value)}
                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-500">To</label>
                            <input
                                type="date"
                                value={customEnd}
                                min={customStart || undefined}
                                onChange={e => setCustomEnd(e.target.value)}
                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        {(!customStart || !customEnd) && (
                            <span className="text-xs text-slate-400">Select both dates to load data</span>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : !data ? null : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {STAT_CARDS.map((card, i) => <StatCard key={i} {...card} />)}
                    </div>

                    {/* AI Insights */}
                    <AiInsights type="financial" user={user} />

                    {/* Revenue Over Time */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Revenue Over Time</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Monthly revenue trend for the selected period</p>
                        </div>
                        <div className="p-6">
                            {data.revenueByMonth?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={data.revenueByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `R${v}`} />
                                        <Tooltip
                                            formatter={(v) => [fmtR(v), 'Revenue']}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                                            dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <p className="text-slate-400 text-sm py-8 text-center">No revenue data for this period.</p>}
                        </div>
                    </div>

                    {/* Revenue by Category + Payment Method */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-900">Revenue by Category</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Which denim categories drive the most revenue</p>
                            </div>
                            <div className="p-6">
                                {data.revenueByCategory?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={data.revenueByCategory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R${v}`} />
                                            <Tooltip
                                                formatter={(v) => [fmtR(v), 'Revenue']}
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-slate-400 text-sm py-8 text-center">No category data for this period.</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-900">Payment Method Breakdown</h3>
                                <p className="text-xs text-slate-400 mt-0.5">How customers prefer to pay</p>
                            </div>
                            <div className="p-6">
                                {data.revenueByPayment?.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        {data.revenueByPayment.map((item, i) => {
                                            const maxRevenue = data.revenueByPayment[0]?.revenue || 1;
                                            const barPct   = Math.round((item.revenue / maxRevenue) * 100);
                                            const sharePct = data.totalRevenue > 0
                                                ? Math.round((item.revenue / data.totalRevenue) * 100) : 0;
                                            return (
                                                <div key={item.method}>
                                                    <div className="flex justify-between items-baseline mb-2">
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {PAYMENT_LABELS[item.method] || item.method}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {fmtR(item.revenue)} · {sharePct}% of revenue
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
                                ) : <p className="text-slate-400 text-sm py-8 text-center">No payment data for this period.</p>}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
