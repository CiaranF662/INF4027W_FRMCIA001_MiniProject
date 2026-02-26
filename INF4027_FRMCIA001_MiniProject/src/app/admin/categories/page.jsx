"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCategoriesPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setError('');
        setAdding(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add category');
            setNewName('');
            fetchCategories();
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        setDeletingId(id);
        const idToken = await user.getIdToken();
        await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
        setCategories(prev => prev.filter(c => c.id !== id));
        setDeletingId(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h2>
                <p className="text-slate-500 mt-1">Manage your denim product categories</p>
            </div>

            {/* Add form */}
            <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Add New Category</h3>
                {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>}
                <div className="flex gap-3">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Denim Dresses"
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                    <Button type="submit" disabled={adding || !newName.trim()} className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-xl shrink-0">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add</>}
                    </Button>
                </div>
            </form>

            {/* Category list */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No categories yet.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <li key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <LayoutGrid className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <span className="font-medium text-slate-900">{cat.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}
                                    disabled={deletingId === cat.id}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600">
                                    {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
