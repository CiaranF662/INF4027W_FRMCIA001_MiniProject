"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Loader2, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConditionStyles, formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';

function WishlistCard({ product, onRemove }) {
    const [removing, setRemoving] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const { user } = useAuth();

    const handleRemove = async () => {
        setRemoving(true);
        const idToken = await user.getIdToken();
        await fetch(`/api/wishlist/${product.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${idToken}` },
        });
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { delta: -1 } }));
        onRemove(product.id);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="group bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden flex flex-col">

            {/* Image */}
            <Link href={`/products/${product.id}`} className="relative aspect-square w-full bg-slate-50 overflow-hidden block">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{product.brand}</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-sm shadow-sm">
                        -{discount}%
                    </div>
                )}
                {product.status === 'sold' && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sold</span>
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{product.brand}</p>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase rounded-sm shrink-0 ${getConditionStyles(product.condition)}`}>
                        {product.condition}
                    </Badge>
                </div>
                <Link href={`/products/${product.id}`} className="text-sm font-medium text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-3 flex-1">
                    {product.title}
                </Link>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mb-4">
                    <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.status === 'sold'}
                        size="sm"
                        className={`flex-1 text-xs rounded-lg gap-1.5 ${addedToCart ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {addedToCart ? 'Added!' : product.status === 'sold' ? 'Sold' : 'Add to Cart'}
                    </Button>
                    <Button
                        onClick={handleRemove}
                        disabled={removing}
                        size="sm"
                        variant="outline"
                        className="w-9 h-9 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                    >
                        {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function WishlistPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            // API returns the array directly (not wrapped in { products: [...] })
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, [user]);

    const handleRemove = (productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Wishlist</h2>
                {!loading && products.length > 0 && (
                    <span className="text-sm text-slate-500">{products.length} saved item{products.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16 flex flex-col items-center text-center px-4">
                    <Heart className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-700 font-semibold text-lg mb-1">No saved items yet</p>
                    <p className="text-slate-400 text-sm mb-6">Tap the heart on any product to save it here.</p>
                    <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Browse Denim →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(product => (
                        <WishlistCard key={product.id} product={product} onRemove={handleRemove} />
                    ))}
                </div>
            )}
        </div>
    );
}
