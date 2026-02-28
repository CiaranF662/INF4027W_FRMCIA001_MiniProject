"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Users, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CustomersReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState('');
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token => {
            fetch('/api/reports/customers', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(d => { setData(d); setLoading(false); });
        });
    }, [user]);

    const fetchInsights = async () => {
        setInsightsLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/ai/insights?type=customers', { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            if (d.insights) setInsights(d.insights);
            else setInsights('Could not generate insights. Please try again.');
        } catch {
            setInsights('Failed to generate insights. You may have hit a rate limit — try again in a minute.');
        } finally {
            setInsightsLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
    if (!data) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customer Report</h2>
                <p className="text-slate-500 mt-1">Customer demographics, top buyers, and growth over time</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Customers</p>
                    <p className="text-3xl font-black text-slate-900">{data.totalCustomers}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                    <p className="text-3xl font-black text-slate-900">{data.totalOrders}</p>
                </div>
            </div>

            {/* AI Insights — on-demand */}
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">AI Insights</h3>
                    </div>
                    {!insights && !insightsLoading && (
                        <button
                            onClick={fetchInsights}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                        >
                            <Sparkles className="w-3 h-3" /> Generate Insights
                        </button>
                    )}
                </div>
                {insightsLoading ? (
                    <div className="space-y-2.5 animate-pulse">
                        <div className="h-3 bg-indigo-100 rounded w-full" />
                        <div className="h-3 bg-indigo-100 rounded w-5/6" />
                        <div className="h-3 bg-indigo-100 rounded w-4/6" />
                    </div>
                ) : insights ? (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{insights}</div>
                ) : (
                    <p className="text-sm text-slate-400">Click "Generate Insights" to analyze your customer data with AI.</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* New Customers Over Time */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-6">New Customers by Month</h3>
                    {data.newCustomersByMonth?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={data.newCustomersByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                <Line type="monotone" dataKey="newCustomers" stroke="#6366f1" strokeWidth={2.5}
                                    dot={{ fill: '#6366f1', r: 4 }} name="New Customers" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No customer growth data yet.</p>}
                </div>

                {/* Customer Locations */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-6">Customer Locations</h3>
                    {data.customerLocations?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.customerLocations} dataKey="count" nameKey="location"
                                    cx="50%" cy="50%" outerRadius={90}
                                    label={({ location, percent }) => `${location} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={{ stroke: '#cbd5e1' }}>
                                    {data.customerLocations.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-8 text-center">No location data yet.</p>}
                </div>
            </div>

            {/* Top Buyers */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-6">Top Buyers</h3>
                {data.topBuyers?.length > 0 ? (
                    <div className="space-y-3">
                        {data.topBuyers.slice(0, 8).map((buyer, i) => (
                            <div key={buyer.buyerId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="text-sm font-bold text-slate-400 w-5 shrink-0">#{i + 1}</span>
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                    {buyer.buyerName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">{buyer.buyerName}</p>
                                    <p className="text-xs text-slate-500">{buyer.buyerEmail} · {buyer.orderCount} order{buyer.orderCount !== 1 ? 's' : ''}</p>
                                </div>
                                <span className="text-sm font-bold text-slate-900 shrink-0">
                                    R {buyer.totalSpend?.toLocaleString('en-ZA')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-400 text-sm py-4 text-center">No buyer data yet.</p>}
            </div>
        </div>
    );
}
