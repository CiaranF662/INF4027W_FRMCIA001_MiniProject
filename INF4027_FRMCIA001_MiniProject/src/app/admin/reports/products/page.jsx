"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6">{title}</h3>
            {children}
        </div>
    );
}

export default function ProductsReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/reports/products', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(d => { setData(d); setLoading(false); });
    }, [user]);

    if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
    if (!data) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Product Report</h2>
                <p className="text-slate-500 mt-1">Best sellers, views, categories, and sizes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Sales by Category */}
                <ChartCard title="Sales by Category">
                    {data.salesByCategory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.salesByCategory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="sold" fill="#6366f1" radius={[6, 6, 0, 0]} name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No sales data yet.</p>}
                </ChartCard>

                {/* Sales by Brand */}
                <ChartCard title="Sales by Brand">
                    {data.salesByBrand?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.salesByBrand.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="brand" tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="sold" fill="#10b981" radius={[0, 6, 6, 0]} name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No brand data yet.</p>}
                </ChartCard>

                {/* Condition Breakdown */}
                <ChartCard title="Sales by Condition">
                    {data.conditionBreakdown?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.conditionBreakdown} dataKey="sold" nameKey="condition"
                                    cx="50%" cy="50%" outerRadius={90}
                                    label={({ condition, percent }) => `${condition} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={{ stroke: '#cbd5e1' }}>
                                    {data.conditionBreakdown.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No condition data yet.</p>}
                </ChartCard>

                {/* Popular Sizes */}
                <ChartCard title="Most Popular Sizes">
                    {data.popularSizes?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.popularSizes.slice(0, 10)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="sold" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No size data yet.</p>}
                </ChartCard>
            </div>

            {/* Most Viewed Products */}
            <ChartCard title="Most Viewed Products">
                {data.mostViewed?.length > 0 ? (
                    <div className="space-y-3">
                        {data.mostViewed.slice(0, 8).map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-400 w-5 shrink-0">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                                    <p className="text-xs text-slate-500">{p.brand}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(p.views / (data.mostViewed[0]?.views || 1)) * 100}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 w-12 text-right">{p.views} views</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-400 text-sm py-4 text-center">No view data yet.</p>}
            </ChartCard>
        </div>
    );
}
