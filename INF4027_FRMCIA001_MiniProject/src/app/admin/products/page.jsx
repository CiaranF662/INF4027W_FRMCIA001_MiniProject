"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Loader2, Eye, X, ChevronLeft, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getConditionStyles, formatPrice } from '@/lib/utils';

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest Added' },
    { value: 'oldest', label: 'Oldest Added' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'az', label: 'A → Z' },
    { value: 'za', label: 'Z → A' },
];

const CONDITIONS = ['new with tags', 'like new', 'good', 'fair'];
const ITEMS_PER_PAGE = 25;

const getTs = (ts) => {
    if (!ts) return 0;
    if (ts._seconds) return ts._seconds;
    return new Date(ts).getTime() / 1000;
};

export default function AdminProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [conditionFilter, setConditionFilter] = useState('all');
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('list');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const idToken = await user.getIdToken();
            const [res, catRes] = await Promise.all([
                fetch('/api/products?adminView=true', { headers: { Authorization: `Bearer ${idToken}` } }),
                fetch('/api/categories'),
            ]);
            const [data, cats] = await Promise.all([res.json(), catRes.json()]);
            setProducts(Array.isArray(data) ? data : []);
            setCategories(Array.isArray(cats) ? cats : []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchProducts(); }, [user]);
    useEffect(() => { setCurrentPage(1); }, [search, statusFilter, categoryFilter, conditionFilter, sortBy]);

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

    const availableCount = products.filter(p => p.status === 'available').length;
    const soldCount = products.filter(p => p.status === 'sold').length;
    const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || conditionFilter !== 'all' || search;

    const clearFilters = () => {
        setStatusFilter('all');
        setCategoryFilter('all');
        setConditionFilter('all');
        setSearch('');
        setSortBy('newest');
    };

    const processed = products
        .filter(p => {
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
            if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
            if (search) {
                const s = search.toLowerCase();
                return (
                    p.title?.toLowerCase().includes(s) ||
                    p.brand?.toLowerCase().includes(s) ||
                    p.category?.toLowerCase().includes(s)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest': return getTs(b.createdAt) - getTs(a.createdAt);
                case 'oldest': return getTs(a.createdAt) - getTs(b.createdAt);
                case 'most_viewed': return (b.views ?? 0) - (a.views ?? 0);
                case 'price_desc': return (Number(b.price) || 0) - (Number(a.price) || 0);
                case 'price_asc': return (Number(a.price) || 0) - (Number(b.price) || 0);
                case 'az': return (a.title ?? '').localeCompare(b.title ?? '');
                case 'za': return (b.title ?? '').localeCompare(a.title ?? '');
                default: return 0;
            }
        });

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {/* Header */}
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

            {/* Status Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {STATUS_TABS.map(tab => {
                    const count = tab.value === 'all' ? products.length
                        : tab.value === 'available' ? availableCount
                            : soldCount;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${statusFilter === tab.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.value
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filter / Sort Row */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search title, brand, category…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white border-slate-200 h-9 text-sm"
                    />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[175px] h-9 bg-white border-slate-200 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[155px] h-9 bg-white border-slate-200 text-sm">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[150px] h-9 bg-white border-slate-200 text-sm">
                        <SelectValue placeholder="All Conditions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        {CONDITIONS.map(c => (
                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                        {processed.length === 0 ? '0 results' : (
                            <>
                                Showing <span className="text-slate-600">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, processed.length)}</span> of <span className="text-slate-600">{processed.length}</span>
                            </>
                        )}
                    </span>

                    {/* View Toggle */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List view"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {!loading && Math.ceil(processed.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {Array.from({ length: Math.ceil(processed.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                        <Button
                            key={page}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`h-9 w-9 p-0 text-sm font-medium ${page === currentPage
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === Math.ceil(processed.length / ITEMS_PER_PAGE)}
                        className="h-9 w-9 p-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Products — List or Grid */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : processed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center py-16 text-slate-400">
                    {hasActiveFilters ? 'No products match the current filters.' : 'No products yet. Add your first one!'}
                </div>
            ) : viewMode === 'list' ? (
                /* ── TABLE VIEW ── */
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="font-semibold text-slate-500">Product</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Category</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Size</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Colour</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Condition</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Price</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-right">Views</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(product => (
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
                                        <TableCell className="text-slate-600 text-sm">{product.colour}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] font-bold uppercase rounded-sm ${getConditionStyles(product.condition)}`}>
                                                {product.condition}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">{formatPrice(product.price)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={product.status === 'available' ? 'outline' : 'secondary'}
                                                className={product.status === 'available'
                                                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] font-bold uppercase'
                                                    : 'bg-slate-100 text-slate-500 text-[10px] font-bold uppercase'}>
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                                <Eye className="w-3 h-3" />{product.views ?? 0}
                                            </div>
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
                                                    {deletingId === product.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                /* ── GRID / CARD VIEW ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(product => (
                        <div key={product.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Image */}
                            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-300 uppercase">No Image</div>
                                )}
                                {/* Status badge overlay */}
                                <Badge
                                    className={`absolute top-3 left-3 text-[10px] font-bold uppercase ${product.status === 'available'
                                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                    variant="outline"
                                >
                                    {product.status}
                                </Badge>
                                {/* Views badge */}
                                <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200/60 px-2 py-1 rounded-full">
                                    <Eye className="w-3 h-3" />{product.views ?? 0}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{product.brand}</p>
                                <p className="text-sm font-semibold text-slate-900 line-clamp-1 mt-0.5">{product.title}</p>

                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-slate-500">
                                    <span>{product.category}</span>
                                    {product.size && <span>· Size {product.size}</span>}
                                    {product.colour && <span>· {product.colour}</span>}
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
                                        <Badge variant="outline" className={`text-[9px] font-bold uppercase rounded-sm ${getConditionStyles(product.condition)}`}>
                                            {product.condition}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                        className="flex-1 h-8 text-xs font-medium gap-1.5 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
                                    >
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deletingId === product.id}
                                        className="h-8 w-8 p-0 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                                    >
                                        {deletingId === product.id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Trash2 className="w-3.5 h-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
