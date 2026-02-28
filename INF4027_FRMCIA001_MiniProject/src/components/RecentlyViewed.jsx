"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getRecentlyViewed } from '@/lib/recentlyViewed';

// Renders a row of recently viewed product cards, excluding the current product.
// Reads entirely from localStorage — no API calls needed.
// Drop this anywhere: <RecentlyViewed currentProductId={id} />
export default function RecentlyViewed({ currentProductId }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const all = getRecentlyViewed();
        setItems(all.filter(p => p.id !== currentProductId).slice(0, 4));
    }, [currentProductId]);

    if (items.length === 0) return null;

    return (
        <section className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
                Recently Viewed
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map(item => (
                    <ProductCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
