import React from 'react';
import ProductCard from './ProductCard';

const GRID_STYLES = `
    @keyframes rv-shimmer-move {
        0%   { background-position: -600px 0; }
        100% { background-position: 600px 0; }
    }
    .rv-shimmer {
        background: linear-gradient(90deg, #f1f5f9 25%, #e8edf5 50%, #f1f5f9 75%);
        background-size: 1200px 100%;
        animation: rv-shimmer-move 1.6s ease-in-out infinite;
    }
    @keyframes rv-card-enter {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .rv-card-enter {
        opacity: 0;
        animation: rv-card-enter 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    @keyframes rv-bounce-up {
        0%   { opacity: 0; transform: translateY(18px) scale(0.94); }
        65%  { opacity: 1; transform: translateY(-5px) scale(1.02); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .rv-empty-anim {
        animation: rv-bounce-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
`;

function SkeletonCard() {
    return (
        <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            {/* Image placeholder */}
            <div className="relative aspect-square w-full overflow-hidden">
                <div className="absolute inset-0 rv-shimmer" />
            </div>
            {/* Details */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center gap-2">
                    <div className="h-2.5 w-20 rounded-full rv-shimmer" />
                    <div className="h-4 w-14 rounded-sm rv-shimmer" />
                </div>
                <div className="space-y-2">
                    <div className="h-3.5 w-full rounded-full rv-shimmer" />
                    <div className="h-3.5 w-4/5 rounded-full rv-shimmer" />
                </div>
                <div className="flex gap-1.5 mt-1">
                    <div className="h-5 w-12 rounded-full rv-shimmer" />
                    <div className="h-5 w-10 rounded-full rv-shimmer" />
                    <div className="h-5 w-16 rounded-full rv-shimmer" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                    <div className="h-6 w-16 rounded-full rv-shimmer" />
                    <div className="h-8 w-8 rounded-lg rv-shimmer" />
                </div>
            </div>
        </div>
    );
}

export default function ProductGrid({ items, loading, wishlistIds }) {
    if (loading) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: GRID_STYLES }} />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </>
        );
    }

    if (!items || items.length === 0) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: GRID_STYLES }} />
                <div className="rv-empty-anim flex flex-col items-center justify-center py-24 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <div className="w-14 h-14 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="font-medium">No denim items found for these filters.</p>
                    <p className="text-sm mt-1">Try adjusting or clearing your filters.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: GRID_STYLES }} />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.map((product, index) => (
                    <div
                        key={product.id}
                        className="rv-card-enter"
                        style={{ animationDelay: `${Math.min(index, 12) * 42}ms` }}
                    >
                        <ProductCard
                            item={product}
                            isWishlisted={wishlistIds?.has(product.id) ?? false}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
