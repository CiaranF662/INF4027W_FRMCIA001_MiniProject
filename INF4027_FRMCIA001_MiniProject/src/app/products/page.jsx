"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import { useAuth } from '@/lib/auth-context';

const PAGE_STYLES = `
    @keyframes rv-slide-up {
        from { opacity: 0; transform: translateY(26px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes rv-slide-down {
        from { opacity: 0; transform: translateY(-14px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .rv-slide-up {
        animation: rv-slide-up 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .rv-slide-down {
        animation: rv-slide-down 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
`;

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [filtersReady, setFiltersReady] = useState(false);
    const [categories, setCategories] = useState([]);

    // Fetch categories once on mount
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    // Sync all filters from the URL whenever the URL changes.
    // This runs when the AI search navigates here with query params.
    useEffect(() => {
        const category = searchParams.get('category');
        const gender = searchParams.get('gender');
        const colour = searchParams.get('colour');
        const brand = searchParams.get('brand');
        const condition = searchParams.get('condition');
        const fit = searchParams.get('fit');
        const wash = searchParams.get('wash');
        const size = searchParams.get('size');
        const sortBy = searchParams.get('sortBy');
        const onSale = searchParams.get('onSale');
        const minPriceParam = searchParams.get('minPrice');
        const maxPriceParam = searchParams.get('maxPrice');
        const searchParam = searchParams.get('search');

        const filtersFromUrl = [];
        if (category) filtersFromUrl.push({ group: 'Category', value: category });
        if (gender) filtersFromUrl.push({ group: 'Gender', value: gender });
        if (colour) filtersFromUrl.push({ group: 'Colour', value: colour });
        if (brand) filtersFromUrl.push({ group: 'Brand', value: brand });
        if (condition) filtersFromUrl.push({ group: 'Condition', value: condition });
        if (fit) filtersFromUrl.push({ group: 'Fit', value: fit });
        if (wash) filtersFromUrl.push({ group: 'Wash', value: wash });
        if (size) filtersFromUrl.push({ group: 'Size', value: size });
        if (onSale === 'true') filtersFromUrl.push({ group: 'OnSale', value: 'true' });

        setActiveFilters(filtersFromUrl);
        setSortBy(sortBy || 'newest');
        setMinPrice(minPriceParam || '');
        setMaxPrice(maxPriceParam || '');
        setSearch(searchParam || '');
        setFiltersReady(true);
    }, [searchParams]);

    // Fetch the user's saved wishlist IDs once
    useEffect(() => {
        if (!user) { setWishlistIds(new Set()); return; }
        user.getIdToken()
            .then(token => fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } }))
            .then(res => res.json())
            .then(data => setWishlistIds(new Set((Array.isArray(data) ? data : []).map(p => p.id))))
            .catch(() => { });
    }, [user]);

    // Fetch products whenever filters, price range, or sort changes
    const fetchProducts = useCallback(async () => {
        if (!filtersReady) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Group filters by key and join multiple values with a comma so the
            // API receives ?category=Jeans,Shorts instead of two separate params
            // (URLSearchParams.get() only returns the first repeated key).
            const grouped = {};
            activeFilters.forEach(({ group, value }) => {
                const key = group === 'OnSale' ? 'onSale' : group.toLowerCase();
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(value);
            });
            Object.entries(grouped).forEach(([key, values]) => {
                params.set(key, values.join(','));
            });
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            if (sortBy) params.set('sortBy', sortBy);
            if (search) params.set('search', search);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filtersReady, activeFilters, minPrice, maxPrice, sortBy, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
        setSearch('');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

            <div className="container mx-auto px-4 md:px-6 py-8">

                {/* Page Header — staggered slide-up */}
                <div className="mb-8">
                    <h1
                        className="rv-slide-up text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2"
                        style={{ animationDelay: '0ms' }}
                    >
                        Vintage & Pre-loved Denim
                    </h1>
                    <p
                        className="rv-slide-up text-slate-500 text-base max-w-2xl"
                        style={{ animationDelay: '80ms' }}
                    >
                        Discover unique, high-quality second-hand pieces. Sustainable, stylish, and full of character.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Desktop Filter Sidebar */}
                    <aside
                        className="rv-slide-up hidden lg:block w-[280px] shrink-0 sticky top-6"
                        style={{ animationDelay: '120ms' }}
                    >
                        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm overflow-y-auto max-h-[85vh]">
                            <FilterSidebar
                                activeFilters={activeFilters}
                                toggleFilter={toggleFilter}
                                clearFilters={clearFilters}
                                minPrice={minPrice} setMinPrice={setMinPrice}
                                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                                categories={categories}
                            />
                        </div>
                    </aside>

                    <main className="flex-1 w-full min-w-0">

                        {/* Action Bar — slides down from above */}
                        <div
                            className="rv-slide-down flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                            style={{ animationDelay: '160ms' }}
                        >
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
                                                categories={categories}
                                            />
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                <span className="text-sm font-medium text-slate-500">
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    ) : products.length === 0 ? (
                                        <span className="text-slate-400">No results</span>
                                    ) : (
                                        <>
                                            Showing <span className="text-slate-900 font-semibold">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, products.length)}
                                            </span> of <span className="text-slate-900 font-semibold">{products.length}</span>
                                        </>
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

                        {/* Active Filter Chips — each one pops in individually */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {activeFilters.map((filter, index) => (
                                    <Badge
                                        key={`${filter.group}-${filter.value}`}
                                        variant="secondary"
                                        className="animate-in fade-in zoom-in-95 duration-200 bg-white border border-slate-200 text-slate-700 font-normal hover:bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm shadow-sm"
                                        style={{ animationDelay: `${index * 35}ms` }}
                                    >
                                        <span className="text-slate-400">{filter.group}:</span> {filter.value}
                                        <button
                                            onClick={() => removeFilter(filter)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        <ProductGrid
                            items={products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
                            loading={loading}
                            wishlistIds={wishlistIds}
                        />

                        {/* Pagination */}
                        {!loading && Math.ceil(products.length / ITEMS_PER_PAGE) > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 p-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                {Array.from({ length: Math.ceil(products.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === Math.ceil(products.length / ITEMS_PER_PAGE)}
                                    className="h-9 w-9 p-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
