"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CartItem from '@/components/CartItem';
import { getCart, removeFromCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);

    // Read the real cart from localStorage on mount
    useEffect(() => {
        setCartItems(getCart());
        // Also listen for cart updates from other components (e.g. product detail page)
        const handleUpdate = () => setCartItems(getCart());
        window.addEventListener('cartUpdated', handleUpdate);
        return () => window.removeEventListener('cartUpdated', handleUpdate);
    }, []);

    const handleRemoveItem = (idToRemove) => {
        removeFromCart(idToRemove);
        // removeFromCart fires the cartUpdated event, so the useEffect above will refresh
        setCartItems(getCart());
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-indigo-300" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Your cart is empty</h1>
                <p className="text-slate-500 mb-8 max-w-sm text-center">You haven't added any denim to your cart yet.</p>
                <Link href="/products">
                    <Button className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl">
                        Browse Denim
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="container mx-auto px-4 md:px-6">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
                    <p className="text-slate-500 mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

                    {/* LEFT: Cart Items */}
                    <div className="w-full lg:w-[68%]">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                                <div className="col-span-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</div>
                                <div className="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {cartItems.map((item) => (
                                    <CartItem key={item.id} item={item} onRemove={handleRemoveItem} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="w-full lg:w-[32%]">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:sticky lg:top-8">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                                <Separator className="my-2 bg-slate-100" />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-base font-bold text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">{formatPrice(subtotal)}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-4">
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full h-14 text-base font-semibold tracking-wide bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all rounded-xl gap-2 group">
                                        Proceed to Checkout
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/products" className="w-full text-center">
                                    <Button variant="ghost" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 w-full h-10 transition-colors">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
