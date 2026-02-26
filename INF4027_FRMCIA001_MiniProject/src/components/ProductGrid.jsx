import React from 'react';
import { Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ items, loading, wishlistIds }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <p className="font-medium">No denim items found for these filters.</p>
                <p className="text-sm mt-1">Try adjusting or clearing your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {items.map((product) => (
                <ProductCard key={product.id} item={product} isWishlisted={wishlistIds?.has(product.id) ?? false} />
            ))}
        </div>
    );
}
