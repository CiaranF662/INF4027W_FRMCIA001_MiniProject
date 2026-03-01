"use client";

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, ChevronRight, Share2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getConditionStyles, formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { trackRecentlyViewed } from '@/lib/recentlyViewed';
import { useAuth } from '@/lib/auth-context';
import RecentlyViewed from '@/components/RecentlyViewed';

const PAGE_STYLES = `
    @keyframes rv-fade-left {
        from { opacity: 0; transform: translateX(-18px); }
        to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes rv-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes rv-img-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    .rv-fade-left { animation: rv-fade-left 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .rv-fade-up   { animation: rv-fade-up   0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .rv-img-fade  { animation: rv-img-fade 0.3s ease both; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// Compact pill showing a single attribute — label above value
const AttributePill = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col items-start px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">{label}</span>
            <span className="text-xs font-semibold text-slate-800 leading-none">{value}</span>
        </div>
    );
};

export default function ProductDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    // Tracks which product id has had its view recorded this mount cycle.
    // Using a ref (not state) means it survives React Strict Mode's double-invoke
    // without triggering a re-render, preventing the double-POST in development.
    const viewRecorded = useRef({ id: null });

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [alreadyInCart, setAlreadyInCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
                trackRecentlyViewed(data);
                // Only fire the view POST once per product, even under React Strict Mode
                if (viewRecorded.current.id !== id) {
                    viewRecorded.current.id = id;
                    fetch(`/api/products/${id}/view`, { method: 'POST' });
                }
            })
            .catch(() => { setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!user || !id) return;
        user.getIdToken().then(token =>
            fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            const ids = (Array.isArray(data) ? data : []).map(p => p.id);
            setWishlisted(ids.includes(id));
        });
    }, [user, id]);

    const handleWishlist = async () => {
        if (!user) { router.push('/auth/login'); return; }
        setWishlistLoading(true);
        const idToken = await user.getIdToken();
        if (wishlisted) {
            await fetch(`/api/wishlist/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
            setWishlisted(false);
            window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { delta: -1 } }));
        } else {
            await fetch(`/api/wishlist/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } });
            setWishlisted(true);
            window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { delta: 1 } }));
        }
        setWishlistLoading(false);
    };

    const handleAddToCart = () => {
        if (!product) return;
        const added = addToCart(product);
        if (added) {
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        } else {
            setAlreadyInCart(true);
            setTimeout(() => setAlreadyInCart(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-500 gap-4">
                <p className="text-xl font-semibold">Product not found.</p>
                <Button onClick={() => router.push('/products')} variant="outline">Back to Shop</Button>
            </div>
        );
    }

    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const images = product.images?.length ? product.images : [null];

    return (
        <div className="bg-white">
            <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

            {/* ── Full-viewport product section ──────────────────────────────────
                height: calc(100vh - 64px) fills exactly the screen below the navbar.
                flex-col lets breadcrumb stay fixed-height and the two columns flex-1
                to fill the rest. overflow-hidden prevents this section from growing. */}
            <div
                className="flex flex-col overflow-hidden"
                style={{ height: 'calc(100vh - 80px)' }}
            >
                <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col h-full">

                    {/* Breadcrumb — fixed height, doesn't stretch */}
                    <nav className="flex items-center text-xs text-slate-500 mb-3 font-medium shrink-0">
                        <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
                        <ChevronRight className="w-3 h-3 mx-1.5 text-slate-300" />
                        <a href="/products" className="hover:text-indigo-600 transition-colors">Shop All</a>
                        <ChevronRight className="w-3 h-3 mx-1.5 text-slate-300" />
                        <a href={`/products?category=${product.category}`} className="hover:text-indigo-600 transition-colors">{product.category}</a>
                        <ChevronRight className="w-3 h-3 mx-1.5 text-slate-300" />
                        <span className="text-slate-900 truncate max-w-[200px]">{product.title}</span>
                    </nav>

                    {/* Two-column layout — flex-1 fills remaining height, min-h-0
                        prevents flex children overflowing their parent */}
                    <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 flex-1 min-h-0">

                        {/* ── LEFT: Image Gallery ─────────────────────────────────── */}
                        <div className="rv-fade-left w-full lg:w-[52%] flex gap-3 min-h-0">

                            {/* Vertical thumbnail strip — only visible with multiple images */}
                            {images.length > 1 && (
                                <div className="flex flex-col gap-2 w-[58px] shrink-0 overflow-y-auto hide-scrollbar py-0.5">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-full aspect-square rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-200
                                                ${activeImage === idx
                                                    ? 'border-indigo-500 opacity-100 shadow-sm'
                                                    : 'border-transparent opacity-40 hover:opacity-75 hover:border-slate-200'
                                                }`}
                                        >
                                            {img
                                                ? <img src={img} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-slate-100" />
                                            }
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main image — flex-1 fills all available column height.
                                img uses absolute inset-0 so it respects the container height. */}
                            <div className="relative flex-1 min-h-0 bg-[#f7f9fc] rounded-xl border border-slate-100 overflow-hidden">
                                {images[activeImage] ? (
                                    <img
                                        key={activeImage}
                                        src={images[activeImage]}
                                        alt={product.title}
                                        className="rv-img-fade absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-widest">No Image</span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded shadow-sm tracking-wide">
                                        -{discount}%
                                    </div>
                                )}

                                {product.status === 'sold' && (
                                    <div className="absolute inset-0 bg-white/65 flex items-center justify-center">
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sold</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Product Info ──────────────────────────────────
                            overflow-y-auto lets this panel scroll internally if a product
                            has a very long description, without breaking the viewport fill. */}
                        <div className="w-full lg:w-[48%] overflow-y-auto hide-scrollbar">
                            <div className="flex flex-col gap-4 pb-4">

                                {/* Brand + Share */}
                                <div
                                    className="rv-fade-up flex justify-between items-center"
                                    style={{ animationDelay: '40ms' }}
                                >
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em]">{product.brand}</p>
                                    <button className="text-slate-300 hover:text-indigo-500 transition-colors" title="Share">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Title */}
                                <div className="rv-fade-up" style={{ animationDelay: '80ms' }}>
                                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">{product.title}</h1>
                                </div>

                                {/* Price row */}
                                <div
                                    className="rv-fade-up flex items-center gap-3 flex-wrap"
                                    style={{ animationDelay: '120ms' }}
                                >
                                    <span className="text-2xl font-black tracking-tight text-slate-900">{formatPrice(product.price)}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-sm font-medium text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full tracking-wide">
                                            SAVE {discount}%
                                        </span>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] uppercase font-bold rounded-sm px-2 py-0.5 ml-auto ${getConditionStyles(product.condition)}`}
                                    >
                                        {product.condition}
                                    </Badge>
                                </div>

                                {/* Attribute pills */}
                                <div
                                    className="rv-fade-up flex flex-wrap gap-2"
                                    style={{ animationDelay: '160ms' }}
                                >
                                    <AttributePill label="Size"    value={product.size ? `W${product.size}` : null} />
                                    <AttributePill label="Fit"     value={product.fit} />
                                    <AttributePill label="Wash"    value={product.wash} />
                                    <AttributePill label="Rise"    value={product.rise} />
                                    <AttributePill label="Gender"  value={product.gender} />
                                    <AttributePill label="Stretch" value={product.stretch} />
                                    <AttributePill label="Colour"  value={product.colour} />
                                    <AttributePill label="Era"     value={product.era} />
                                </div>

                                {/* CTA Buttons */}
                                <div
                                    className="rv-fade-up flex flex-col gap-2"
                                    style={{ animationDelay: '200ms' }}
                                >
                                    {product.status === 'sold' ? (
                                        <Button disabled className="w-full h-10 text-sm font-semibold rounded-xl gap-2 bg-slate-200 text-slate-500 cursor-not-allowed">
                                            Sold Out
                                        </Button>
                                    ) : addedToCart ? (
                                        <Button className="w-full h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
                                            <CheckCircle className="w-4 h-4" /> Added to Cart!
                                        </Button>
                                    ) : alreadyInCart ? (
                                        <Button variant="outline" onClick={() => router.push('/cart')} className="w-full h-10 text-sm font-medium rounded-xl gap-2 border-indigo-300 text-indigo-600">
                                            <ShoppingCart className="w-4 h-4" /> Already in Cart — View Cart
                                        </Button>
                                    ) : (
                                        <Button onClick={handleAddToCart} className="w-full h-10 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-xl gap-2">
                                            <ShoppingCart className="w-4 h-4" /> Add to Cart
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        onClick={handleWishlist}
                                        disabled={wishlistLoading}
                                        className={`w-full h-10 text-sm font-medium rounded-xl gap-2 transition-colors
                                            ${wishlisted
                                                ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                                : 'hover:border-rose-300 hover:text-rose-500'
                                            }`}
                                    >
                                        {wishlistLoading
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                                        }
                                        {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                                    </Button>
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <div className="rv-fade-up" style={{ animationDelay: '230ms' }}>
                                        <Separator className="mb-3" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Description</p>
                                        <p className="text-slate-600 text-xs leading-relaxed">{product.description}</p>
                                    </div>
                                )}

                                {/* Tags */}
                                {product.tags?.length > 0 && (
                                    <div
                                        className="rv-fade-up flex flex-wrap gap-1.5"
                                        style={{ animationDelay: '260ms' }}
                                    >
                                        {product.tags.map(tag => (
                                            <span key={tag} className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recently Viewed — lives BELOW the viewport fill, scroll to see ── */}
            <div className="container mx-auto px-4 md:px-6 pb-16">
                <RecentlyViewed currentProductId={id} />
            </div>
        </div>
    );
}
