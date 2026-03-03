"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { getCart, removeFromCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer({ isOpen, onClose }) {
    const [cartItems, setCartItems] = useState([]);
    const drawerRef = useRef(null);

    // Sync cart items with localStorage whenever the drawer opens
    useEffect(() => {
        if (isOpen) setCartItems(getCart());
    }, [isOpen]);

    // Also listen for live cart updates (e.g. item added from product page while drawer is open)
    useEffect(() => {
        const handleUpdate = () => setCartItems(getCart());
        window.addEventListener('cartUpdated', handleUpdate);
        return () => window.removeEventListener('cartUpdated', handleUpdate);
    }, []);

    // Close when clicking the backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleRemoveItem = (idToRemove) => {
        removeFromCart(idToRemove);
        setCartItems(getCart());
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={handleBackdropClick}
            />

            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Your Cart
                        </h2>
                        {cartItems.length > 0 && (
                            <span className="ml-1 text-sm font-medium text-slate-400">
                                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body — scrollable item list */}
                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
                                <ShoppingBag className="w-8 h-8 text-indigo-300" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</p>
                            <p className="text-sm text-slate-500 mb-6 max-w-xs">
                                Browse our collection and add some denim to your cart.
                            </p>
                            <Link
                                href="/products"
                                onClick={onClose}
                                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                            >
                                Browse Denim
                            </Link>
                        </div>
                    ) : (
                        /* Cart items */
                        <div className="divide-y divide-slate-100">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 px-6 py-4 group hover:bg-slate-50/50 transition-colors">
                                    {/* Thumbnail */}
                                    <Link
                                        href={`/products/${item.id}`}
                                        onClick={onClose}
                                        className="relative w-20 h-20 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 flex items-center justify-center"
                                    >
                                        {item.image
                                            ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            : <span className="text-[9px] font-medium uppercase tracking-widest text-slate-400">{item.brand}</span>
                                        }
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{item.brand}</p>
                                            <Link
                                                href={`/products/${item.id}`}
                                                onClick={onClose}
                                                className="text-sm font-medium text-slate-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-1"
                                            >
                                                {item.title}
                                            </Link>
                                            {/* Quick attributes */}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-400">
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.colour && <span>• {item.colour}</span>}
                                                {item.fit && <span>• {item.fit}</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove
                                            </button>
                                            <span className="text-sm font-bold text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer — Order summary & CTA (only shown when cart has items) */}
                {cartItems.length > 0 && (
                    <div className="border-t border-slate-100 bg-white px-6 py-5 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                            <span className="text-lg font-black text-slate-900 tracking-tight">{formatPrice(subtotal)}</span>
                        </div>

                        <p className="text-xs text-slate-400">Shipping calculated at checkout</p>

                        {/* Checkout button */}
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 w-full h-13 py-3.5 text-base font-semibold tracking-wide text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all rounded-xl group"
                        >
                            Checkout
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Continue Shopping — closes the drawer */}
                        <button
                            onClick={onClose}
                            className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-xl transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
