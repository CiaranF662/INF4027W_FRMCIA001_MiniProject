"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, Truck, CheckCircle, Loader2, ShoppingBag, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/lib/auth-context';
import { getCart, clearCart } from '@/lib/cart';

const PAYMENT_METHODS = [
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'paypal', label: 'PayPal', icon: Wallet, description: 'Pay via PayPal balance or card' },
    { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: Truck, description: 'Pay when your order arrives' },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect to login if not authenticated
        if (user === null) {
            // AuthProvider sets user to null when confirmed not logged in
            // We wait briefly because AuthProvider might still be loading
        }
        setCartItems(getCart());
    }, [user]);

    // Redirect to login if user is definitively not logged in
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user) router.push('/auth/login');
        }, 500);
        return () => clearTimeout(timer);
    }, [user, router]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

    const handleConfirmOrder = async () => {
        if (!user || cartItems.length === 0) return;
        setError('');
        setLoading(true);

        try {
            const idToken = await user.getIdToken();

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        productId: item.id,
                        title: item.title,
                        brand: item.brand,
                        price: item.price,
                    })),
                    paymentMethod,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Order failed');

            // Clear cart and show success state
            // The API returns the order object directly (not wrapped in { order: ... })
            clearCart();
            setOrderId(data.id || '');
            setOrderSuccess(true);

        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Order success screen
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
                <p className="text-slate-500 mb-2 max-w-sm">
                    Your order has been placed successfully. Payment simulation complete.
                </p>
                {orderId && (
                    <p className="text-xs text-slate-400 mb-8 font-mono">Order ID: {orderId}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/account/orders">
                        <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold">
                            View My Orders
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="outline" className="h-12 px-8 rounded-xl font-semibold">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Empty cart guard
    if (cartItems.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-indigo-300" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
                <p className="text-slate-500 mb-8">Add some denim before checking out.</p>
                <Link href="/products">
                    <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold">Browse Denim</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Secure simulated checkout
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT: Payment Method Selection */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Payment Method</h2>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                                            ${paymentMethod === method.id
                                                ? 'border-indigo-600 bg-indigo-50/50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                            ${paymentMethod === method.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            <method.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${paymentMethod === method.id ? 'text-indigo-700' : 'text-slate-900'}`}>
                                                {method.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">{method.description}</p>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                            ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                            {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items being purchased */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Order Items ({cartItems.length})</h2>
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold uppercase text-slate-400">
                                                    {item.brand}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                                            <p className="text-xs text-slate-500">{item.brand} · Size {item.size}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 shrink-0">R{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="w-full lg:w-[320px] shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                                    <span className="font-medium text-slate-900">R{subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                            </div>

                            <Separator className="my-5" />

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-base font-bold text-slate-900">Total</span>
                                <span className="text-2xl font-black text-slate-900">R{subtotal}</span>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleConfirmOrder}
                                disabled={loading || cartItems.length === 0}
                                className="w-full h-14 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Confirm Order · R{subtotal}
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-slate-400 text-center mt-4">
                                This is a payment simulation. No real charges are made.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
