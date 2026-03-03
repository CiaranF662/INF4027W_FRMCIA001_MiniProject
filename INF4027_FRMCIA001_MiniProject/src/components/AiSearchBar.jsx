"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Loader2 } from 'lucide-react';


export default function AiSearchBar({ variant = 'desktop', onSearchComplete }) {
    const router = useRouter();
    const [aiQuery, setAiQuery] = useState('');
    const [aiSearching, setAiSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close the desktop search panel when the user clicks outside it
    useEffect(() => {
        if (variant !== 'desktop') return;
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [variant]);

    // Translate the natural language query into filter params and navigate
    const handleSubmit = async (e) => {
        e.preventDefault();
        const q = aiQuery.trim();
        if (!q) return;

        // Detect image URLs and run image search instead
        if (/^https?:\/\//i.test(q)) {
            setAiSearching(true);
            try {
                const imgRes = await fetch(q);
                const blob = await imgRes.blob();
                const formData = new FormData();
                formData.append('file', new File([blob], 'pasted-image.jpg', { type: blob.type || 'image/jpeg' }));
                const res = await fetch('/api/ai/search-by-image', { method: 'POST', body: formData });
                const { filters } = await res.json();
                const params = new URLSearchParams();
                if (filters.category) params.set('category', filters.category);
                if (filters.colour) params.set('colour', filters.colour);
                router.push(`/products?${params.toString()}`);
            } catch {
                router.push('/products');
            } finally {
                setAiSearching(false);
                setAiQuery('');
                setSearchOpen(false);
                onSearchComplete?.();
            }
            return;
        }

        setAiSearching(true);
        try {
            const res = await fetch('/api/ai/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });
            const { filters } = await res.json();

            // Build URL params from Gemini's parsed filters
            const params = new URLSearchParams();
            if (filters.category) params.set('category', filters.category);
            if (filters.gender) params.set('gender', filters.gender);
            if (filters.colour) params.set('colour', filters.colour);
            if (filters.brand) params.set('brand', filters.brand);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            if (filters.size) params.set('size', filters.size);
            if (filters.condition) params.set('condition', filters.condition);
            if (filters.fit) params.set('fit', filters.fit);
            if (filters.wash) params.set('wash', filters.wash);
            if (filters.onSale) params.set('onSale', filters.onSale);
            if (filters.sortBy) params.set('sortBy', filters.sortBy);
            if (filters.search) params.set('search', filters.search);

            router.push(`/products?${params.toString()}`);
        } catch {
            router.push(`/products?search=${encodeURIComponent(q)}`);
        } finally {
            setAiSearching(false);
            setAiQuery('');
            setSearchOpen(false);
            onSearchComplete?.(); // tells Navbar to close the mobile menu if open
        }
    };

    // ── Mobile variant ──────────────────────────────────────────────────────
    if (variant === 'mobile') {
        return (
            <form onSubmit={handleSubmit} className="relative flex items-center mb-6">
                <Sparkles className="w-4 h-4 text-indigo-400 absolute left-4 pointer-events-none" />
                <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder='Search or paste image URL...'
                    className="w-full pl-11 pr-11 h-12 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
                />
                <button type="submit" disabled={aiSearching} className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors">
                    {aiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
            </form>
        );
    }

    // ── Desktop variant (expandable icon) ───────────────────────────────────
    return (
        <div className="relative hidden sm:flex items-center" ref={searchRef}>
            <button
                onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 150);
                }}
                className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${searchOpen
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
            >
                {aiSearching ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Sparkles className="w-[18px] h-[18px]" />}
            </button>

            <form
                onSubmit={handleSubmit}
                className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-out origin-right ${searchOpen
                    ? 'w-72 opacity-100 pointer-events-auto'
                    : 'w-0 opacity-0 pointer-events-none'
                    }`}
            >
                <input
                    ref={searchInputRef}
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                    placeholder={`Search text or paste image URL...`}
                    className="w-full pl-11 pr-10 h-9 text-xs rounded-full bg-white border border-indigo-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 shadow-lg shadow-indigo-500/10"
                />
                <button type="submit" disabled={aiSearching} className="absolute right-3 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Search className="w-3.5 h-3.5" />
                </button>
            </form>
        </div>
    );
}
