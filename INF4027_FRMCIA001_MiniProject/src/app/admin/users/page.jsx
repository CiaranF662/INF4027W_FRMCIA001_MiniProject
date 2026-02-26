"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            setUsers(data.users || []);
            setLoading(false);
        });
    }, [user]);

    const filtered = users.filter(u =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.location?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Users</h2>
                <p className="text-slate-500 mt-1">{users.filter(u => u.role !== 'admin').length} registered customers</p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by name, email, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-slate-200" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="font-semibold text-slate-500">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Email</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Location</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Role</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(u => (
                                    <TableRow key={u.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                                    {u.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="font-medium text-slate-900 text-sm">{u.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{u.email}</TableCell>
                                        <TableCell>
                                            {u.location && (
                                                <span className="flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {u.location}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={u.role === 'admin'
                                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase'
                                                : 'border-slate-200 text-slate-600 text-[10px] font-bold uppercase'}>
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{formatDate(u.createdAt)}</TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400">No users found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
