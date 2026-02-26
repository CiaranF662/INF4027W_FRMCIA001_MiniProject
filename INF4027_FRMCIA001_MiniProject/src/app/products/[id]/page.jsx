"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, ChevronRight, Share2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getConditionStyles } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth-context';

// Reusable micro-component for the attribute grid
const AttributeBlock = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-900">{value}</span>
        </div>
    );
};

export default function ProductDetailPage({ params }) {
    // In Next.js 15+, params is a Promise — use React.use() to unwrap it
    const { id } = use(params);
    const router = useRouter();

    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [alreadyInCart, setAlreadyInCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Fetch product data from the API → GET /api/products/:id
        fetch(`/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                // The API returns the product object directly (not wrapped in { product: ... })
                setProduct(data);
                setLoading(false);
                // Track the view (fire-and-forget — we don't need to wait for this)
                fetch(`/api/products/${id}/view`, { method: 'POST' });
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    // Once both the user and the product are loaded, check if this product is already wishlisted
    // Calls GET /api/wishlist → returns all saved products for the logged-in user
    useEffect(() => {
        if (!user || !id) return;
        user.getIdToken().then(token =>
            fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            // Check if this product's id appears in the returned wishlist
            // API returns the array directly (not wrapped in { products: [...] })
            const ids = (Array.isArray(data) ? data : []).map(p => p.id);
            setWishlisted(ids.includes(id));
        });
    }, [user, id]);

    // Toggle wishlist: if not saved → POST /api/wishlist/:id  |  if already saved → DELETE /api/wishlist/:id
    const handleWishlist = async () => {
        if (!user) {
            // Not logged in — send them to the login page
            router.push('/auth/login');
            return;
        }
        setWishlistLoading(true);
        const idToken = await user.getIdToken();
        if (wishlisted) {
            // Already saved — remove it
            await fetch(`/api/wishlist/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${idToken}` },
            });
            setWishlisted(false);
            window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { delta: -1 } }));
        } else {
            // Not saved yet — add it
            await fetch(`/api/wishlist/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${idToken}` },
            });
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
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
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
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 md:px-6 py-6 md:pb-16">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium">
                    <a href="/" className="hover:text-indigo-600">Home</a>
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                    <a href="/products" className="hover:text-indigo-600">Shop All</a>
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                    <a href={`/products?category=${product.category}`} className="hover:text-indigo-600">{product.category}</a>
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                    <span className="text-slate-900 truncate">{product.title}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">

                    {/* LEFT: Image Gallery */}
                    <div className="w-full lg:w-[60%] flex flex-col gap-4">
                        <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full bg-[#f8fafc] rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center">
                            {images[activeImage] ? (
                                <img
                                    src={images[activeImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-semibold uppercase text-slate-400">No Image</span>
                            )}
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-md">
                                    -{discount}%
                                </div>
                            )}
                        </div>

                        {/* Thumbnails — only show if multiple images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-3">
                                {images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(idx)}
                                        className={`relative aspect-square rounded-xl bg-slate-50 border-2 overflow-hidden transition-all
                                            ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent'}`}
                                    >
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">img</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="w-full lg:w-[40%] flex flex-col">
                        <div className="sticky top-24">

                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-bold text-slate-400 uppercase">{product.brand}</p>
                                <button className="text-slate-400 hover:text-indigo-600"><Share2 className="w-5 h-5" /></button>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                {product.title}
                            </h1>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">R{product.price}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-lg font-medium text-slate-400 line-through">R{product.originalPrice}</span>
                                    )}
                                </div>
                                <Badge variant="outline" className={`text-xs uppercase font-bold rounded-sm px-2.5 py-1 ${getConditionStyles(product.condition)}`}>
                                    {product.condition}
                                </Badge>
                            </div>

                            {/* Add to Cart / Already in Cart */}
                            <div className="flex flex-col gap-3 mb-10">
                                {product.status === 'sold' ? (
                                    <Button disabled className="w-full h-14 text-base font-semibold rounded-xl gap-2 bg-slate-200 text-slate-500 cursor-not-allowed">
                                        Sold Out
                                    </Button>
                                ) : addedToCart ? (
                                    <Button className="w-full h-14 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
                                        <CheckCircle className="w-5 h-5" /> Added to Cart!
                                    </Button>
                                ) : alreadyInCart ? (
                                    <Button variant="outline" onClick={() => router.push('/cart')} className="w-full h-14 text-base font-medium rounded-xl gap-2 border-indigo-300 text-indigo-600">
                                        <ShoppingCart className="w-5 h-5" /> Already in Cart — View Cart
                                    </Button>
                                ) : (
                                    <Button onClick={handleAddToCart} className="w-full h-14 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl gap-2">
                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleWishlist}
                                    disabled={wishlistLoading}
                                    className={`w-full h-14 text-base font-medium rounded-xl gap-2 transition-colors
                                        ${wishlisted
                                            ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                            : 'hover:border-rose-300 hover:text-rose-500'
                                        }`}
                                >
                                    {wishlistLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    )}
                                    {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                                </Button>
                            </div>

                            <Separator className="mb-8" />

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Item Details</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <AttributeBlock label="Size" value={product.size} />
                                    <AttributeBlock label="Fit" value={product.fit} />
                                    <AttributeBlock label="Wash" value={product.wash} />
                                    <AttributeBlock label="Rise" value={product.rise} />
                                    <AttributeBlock label="Stretch" value={product.stretch} />
                                    <AttributeBlock label="Colour" value={product.colour} />
                                    <AttributeBlock label="Gender" value={product.gender} />
                                    <AttributeBlock label="Era" value={product.era} />
                                </div>
                            </div>

                            {product.description && (
                                <>
                                    <Separator className="mb-8" />
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Description</h3>
                                        <p className="text-slate-600 text-base leading-relaxed">{product.description}</p>
                                    </div>
                                </>
                            )}

                            {/* Tags */}
                            {product.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
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
    );
}
