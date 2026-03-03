"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getConditionStyles, formatPrice, calculateDiscount } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth-context';

export default function ProductCard({ item, isWishlisted = false }) {
    const router = useRouter();
    const { user } = useAuth();

    const [wishlisted, setWishlisted] = useState(isWishlisted);
    const [addedToCart, setAddedToCart] = useState(false);

    // Sync if the parent passes updated wishlist data (e.g. after a re-fetch)
    useEffect(() => { setWishlisted(isWishlisted); }, [isWishlisted]);

    // Toggle wishlist: POST to add, DELETE to remove
    // Calls POST /api/wishlist/:id  or  DELETE /api/wishlist/:id
    const handleWishlist = async (e) => {
        e.preventDefault(); // stop the card's Link from navigating
        if (!user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`); // must be logged in to wishlist                                                                
            return;
        }
        const newState = !wishlisted;
        setWishlisted(newState); // update UI immediately (optimistic)
        // Tell the Navbar to update its wishlist count badge
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { delta: newState ? 1 : -1 } }));
        const idToken = await user.getIdToken();
        await fetch(`/api/wishlist/${item.id}`, {
            method: newState ? 'POST' : 'DELETE',
            headers: { Authorization: `Bearer ${idToken}` },
        });
    };

    // Quick add to cart — adds to localStorage without going to the product page
    const handleAddToCart = (e) => {
        e.preventDefault(); // stop the card's Link from navigating
        if (item.status === 'sold') return;
        addToCart(item);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const discount = calculateDiscount(item.originalPrice, item.price) || item.discount || 0;

    return (
        <Link href={`/products/${item.id}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300">

            {/* Image */}
            <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                {item.images?.[0] ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded lg:mb-2 opacity-60"></div>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{item.brand}</span>
                    </div>
                )}

                {/* Wishlist heart — always visible on mobile, appears on hover on desktop */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md transition-all duration-200
                        opacity-100 md:opacity-0 md:group-hover:opacity-100
                        ${wishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Discount badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold tracking-wide rounded-sm shadow-sm">
                        -{discount}%
                    </div>
                )}

                {/* Sold overlay */}
                {item.status === 'sold' && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sold</span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1.5 gap-2">
                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase truncate">{item.brand}</p>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 py-0 border shrink-0 ${getConditionStyles(item.condition)}`}>
                        {item.condition}
                    </Badge>
                </div>

                <h3 className="font-medium text-slate-900 text-sm md:text-base leading-snug mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                </h3>

                <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {item.gender && (
                        <Badge variant="secondary" className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border-0 shadow-none tracking-wide
                            ${item.gender === 'Men'     ? 'bg-blue-50 text-blue-600'
                            : item.gender === 'Women'   ? 'bg-rose-50 text-rose-500'
                            : item.gender === 'Kids'    ? 'bg-amber-50 text-amber-600'
                            :                             'bg-slate-100 text-slate-500'}`}>
                            {item.gender}
                        </Badge>
                    )}
                    {item.fit && (
                        <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border-0 shadow-none tracking-wide">
                            {item.fit}
                        </Badge>
                    )}
                    {item.size && (
                        <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border-0 shadow-none tracking-wide">
                            W{item.size}
                        </Badge>
                    )}
                    {item.wash && (
                        <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border-0 shadow-none tracking-wide">
                            {item.wash}
                        </Badge>
                    )}
                </div>

                {/* Price + Quick Add to Cart button */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                        {item.originalPrice > item.price && (
                            <span className="text-xs font-medium text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                        )}
                    </div>

                    {/* Quick Add to Cart — icon button, turns green briefly when added */}
                    <button
                        onClick={handleAddToCart}
                        disabled={item.status === 'sold'}
                        title={item.status === 'sold' ? 'Sold out' : addedToCart ? 'Added!' : 'Add to cart'}
                        className={`p-2 rounded-lg transition-all duration-200
                            ${item.status === 'sold'
                                ? 'text-slate-300 cursor-not-allowed'
                                : addedToCart
                                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                    : 'bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white ring-1 ring-slate-200 hover:ring-indigo-600'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
