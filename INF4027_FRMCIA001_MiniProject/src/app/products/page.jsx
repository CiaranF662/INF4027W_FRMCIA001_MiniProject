"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import { useAuth } from '@/lib/auth-context';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [wishlistIds, setWishlistIds] = useState(new Set());

    // Sync filters from the URL whenever the URL changes.
    // Using [searchParams] as the dependency means this runs every time the user
    // clicks a Navbar link (Category, Gender, Sale) — not just on first load.
    // This replaces whatever was in the filter before, so clicking "Men" after
    // "Sale" correctly switches to the Men filter instead of stacking them.
    useEffect(() => {
        const category = searchParams.get('category');
        const gender   = searchParams.get('gender');
        const sortBy   = searchParams.get('sortBy');
        const onSale   = searchParams.get('onSale');

        const filtersFromUrl = [];
        if (category) filtersFromUrl.push({ group: 'Category', value: category });
        if (gender)   filtersFromUrl.push({ group: 'Gender',   value: gender });
        if (onSale === 'true') filtersFromUrl.push({ group: 'OnSale', value: 'true' });

        // Always replace — even if empty (e.g. clicking "Shop All" clears all filters)
        setActiveFilters(filtersFromUrl);
        setSortBy(sortBy || 'newest');
    }, [searchParams]);

    // Fetch the user's saved wishlist IDs once so each ProductCard knows its initial heart state
    useEffect(() => {
        if (!user) { setWishlistIds(new Set()); return; }
        user.getIdToken()
            .then(token => fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } }))
            .then(res => res.json())
            .then(data => setWishlistIds(new Set((Array.isArray(data) ? data : []).map(p => p.id))))
            .catch(() => {});
    }, [user]);

    // Fetch products from the API whenever filters, price range, or sort changes
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // Map our activeFilters array to individual query params the API expects
            // "Category" → "category", "Gender" → "gender", "OnSale" → "onSale"
            activeFilters.forEach(({ group, value }) => {
                const key = group === 'OnSale' ? 'onSale' : group.toLowerCase();
                params.append(key, value);
            });

            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            if (sortBy) params.set('sortBy', sortBy);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            // The API returns the array directly (not wrapped in an object)
            setProducts(Array.isArray(data) ? data : []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilters, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const toggleFilter = (group, value) => {
        const exists = activeFilters.find(f => f.group === group && f.value === value);
        if (exists) {
            setActiveFilters(activeFilters.filter(f => f !== exists));
        } else {
            setActiveFilters([...activeFilters, { group, value }]);
        }
    };

    const removeFilter = (filterToRemove) => {
        setActiveFilters(activeFilters.filter(f => f !== filterToRemove));
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setMinPrice('');
        setMaxPrice('');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="container mx-auto px-4 md:px-6 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Vintage & Pre-loved Denim</h1>
                    <p className="text-slate-500 text-base max-w-2xl">Discover unique, high-quality second-hand pieces. Sustainable, stylish, and full of character.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Desktop Filter Sidebar */}
                    <aside className="hidden lg:block w-[280px] shrink-0 sticky top-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm overflow-y-auto max-h-[85vh]">
                            <FilterSidebar
                                activeFilters={activeFilters}
                                toggleFilter={toggleFilter}
                                clearFilters={clearFilters}
                                minPrice={minPrice} setMinPrice={setMinPrice}
                                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                            />
                        </div>
                    </aside>

                    <main className="flex-1 w-full min-w-0">

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">

                                {/* Mobile Filter Sheet */}
                                <div className="lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="border-slate-200 shadow-sm gap-2 bg-white text-slate-700">
                                                <SlidersHorizontal className="w-4 h-4" />
                                                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 overflow-y-auto bg-white">
                                            <FilterSidebar
                                                activeFilters={activeFilters}
                                                toggleFilter={toggleFilter}
                                                clearFilters={clearFilters}
                                                minPrice={minPrice} setMinPrice={setMinPrice}
                                                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                                            />
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                <span className="text-sm font-medium text-slate-500">
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    ) : (
                                        <><span className="text-slate-900 font-semibold">{products.length}</span> Results</>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 hidden sm:inline-block">Sort by:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-slate-700">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        <SelectItem value="discount">Biggest Discount</SelectItem>
                                        <SelectItem value="views">Most Viewed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {activeFilters.map((filter, index) => (
                                    <Badge key={index} variant="secondary"
                                        className="bg-white border-slate-200 text-slate-700 font-normal hover:bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm shadow-sm">
                                        <span className="text-slate-400">{filter.group}:</span> {filter.value}
                                        <button onClick={() => removeFilter(filter)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2">
                                    Clear all
                                </button>
                            </div>
                        )}

                        <ProductGrid items={products} loading={loading} wishlistIds={wishlistIds} />
                    </main>
                </div>
            </div>
        </div>
    );
}
