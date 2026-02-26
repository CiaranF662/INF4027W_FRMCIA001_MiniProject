"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getConditionStyles } from '@/lib/utils';

export default function AdminProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/products?adminView=true', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchProducts(); }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            const idToken = await user.getIdToken();
            await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${idToken}` }
            });
            setProducts(prev => prev.filter(p => p.id !== id));
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = products.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products</h2>
                    <p className="text-slate-500 mt-1">{products.length} items in catalogue</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-xl h-10">
                        <Plus className="w-4 h-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search by title, brand, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                />
            </div>

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
                                    <TableHead className="font-semibold text-slate-500">Product</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Category</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Size</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Condition</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Price</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(product => (
                                    <TableRow key={product.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm line-clamp-1">{product.title}</p>
                                                    <p className="text-xs text-slate-500">{product.brand}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
                                        <TableCell className="text-slate-600 text-sm">{product.size}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] font-bold uppercase rounded-sm ${getConditionStyles(product.condition)}`}>
                                                {product.condition}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">R{product.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'available' ? 'outline' : 'secondary'}
                                                className={product.status === 'available'
                                                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] font-bold uppercase'
                                                    : 'bg-slate-100 text-slate-500 text-[10px] font-bold uppercase'}>
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm"
                                                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deletingId === product.id}
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600">
                                                    {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                                            {search ? 'No products match your search.' : 'No products yet. Add your first one!'}
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
