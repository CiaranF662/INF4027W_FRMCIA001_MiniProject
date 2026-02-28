"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Package, PackageCheck, Tag, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

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
                <p className="text-sm text-slate-400">Click "Generate Insights" to analyse your product data with AI.</p>
            )}
        </div>
    );
}

export default function ProductsReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token => {
            fetch('/api/reports/products', { headers: { Authorization: `Bearer ${token}` } })
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

    const topViewed = data.mostViewed?.[0];

    const STAT_CARDS = [
        {
            label: 'Total Listed',
            value: data.totalListed ?? '—',
            sub: 'Items in catalogue',
            icon: Package,
            bg: 'bg-slate-100',
            iconColor: 'text-slate-600',
        },
        {
            label: 'Total Sold',
            value: data.totalSold ?? '—',
            sub: `${data.sellThrough ?? 0}% sell-through rate`,
            icon: PackageCheck,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Avg Selling Price',
            value: data.avgSellingPrice != null ? fmtR(data.avgSellingPrice) : '—',
            sub: 'Across sold items',
            icon: Tag,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Top Viewed',
            value: topViewed?.views ?? 0,
            sub: topViewed ? `views on "${topViewed.title}"` : 'No views recorded yet',
            icon: Eye,
            bg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Product Report</h2>
                <p className="text-slate-500 mt-1">Best sellers, views, categories, and sizes</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STAT_CARDS.map((card, i) => <StatCard key={i} {...card} />)}
            </div>

            {/* AI Insights */}
            <AiInsights type="products" user={user} />

            {/* Sales by Category + Brand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Sales by Category</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Units sold per denim category</p>
                    </div>
                    <div className="p-6">
                        {data.salesByCategory?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data.salesByCategory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                                    <Bar dataKey="sold" fill="#6366f1" radius={[6, 6, 0, 0]} name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No sales data yet.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Sales by Brand</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Top brands by units sold</p>
                    </div>
                    <div className="p-6">
                        {data.salesByBrand?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data.salesByBrand.slice(0, 8)} layout="vertical"
                                    margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis type="category" dataKey="brand" tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                                    <Bar dataKey="sold" fill="#10b981" radius={[0, 6, 6, 0]} name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No brand data yet.</p>}
                    </div>
                </div>

            </div>

            {/* Condition Breakdown + Popular Sizes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Condition Breakdown — horizontal progress bars */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Sales by Condition</h3>
                        <p className="text-xs text-slate-400 mt-0.5">What condition grades customers buy most</p>
                    </div>
                    <div className="p-6">
                        {data.conditionBreakdown?.length > 0 ? (
                            <div className="flex flex-col gap-5">
                                {data.conditionBreakdown.map((item, i) => {
                                    const maxSold = data.conditionBreakdown[0]?.sold || 1;
                                    const barPct = Math.round((item.sold / maxSold) * 100);
                                    const totalSold = data.conditionBreakdown.reduce((s, c) => s + c.sold, 0);
                                    const sharePct = totalSold > 0 ? Math.round((item.sold / totalSold) * 100) : 0;
                                    return (
                                        <div key={item.condition}>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <span className="text-sm font-bold text-slate-700 capitalize">{item.condition}</span>
                                                <span className="text-[10px] text-slate-400">{item.sold} sold · {sharePct}%</span>
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
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No condition data yet.</p>}
                    </div>
                </div>

                {/* Popular Sizes — bar chart */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Most Popular Sizes</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Helps decide what sizes to source more of</p>
                    </div>
                    <div className="p-6">
                        {data.popularSizes?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data.popularSizes.slice(0, 10)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                                    <Bar dataKey="sold" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-slate-400 text-sm py-8 text-center">No size data yet.</p>}
                    </div>
                </div>

            </div>

            {/* Most Viewed Products */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Most Viewed Products</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Products generating the most browsing interest — prime candidates for price review or promotion</p>
                </div>
                <div className="p-6">
                    {data.mostViewed?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {data.mostViewed.slice(0, 8).map((p, i) => (
                                <div key={p.id} className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-slate-300 w-6 shrink-0 text-right">#{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                                        <p className="text-xs text-slate-500">{p.brand}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-400 rounded-full"
                                                style={{ width: `${(p.views / (data.mostViewed[0]?.views || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 w-16 text-right">
                                            {p.views} views
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-400 text-sm py-4 text-center">No view data yet.</p>}
                </div>
            </div>

        </div>
    );
}
