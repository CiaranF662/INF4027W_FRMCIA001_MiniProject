"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // 2. Fetch the user's Firestore profile to check their role
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const role = userDoc.data()?.role || 'customer';

            // 3. Redirect: admins go to the admin portal, customers go to the homepage
            router.push(role === 'admin' ? '/admin' : '/');

        } catch (err) {
            // Map Firebase error codes to friendly messages
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect email or password. Please try again.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError('Something went wrong. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@700;800&display=swap');`}</style>
            <Link href="/" className="flex items-center gap-3 mb-8 group">
                <svg width="44" height="30" viewBox="0 0 44 30" fill="none"
                    className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                    <path
                        d="M 2 2 L 2 28 M 2 2 L 8 2 C 20 2 23 8 23 15 C 23 22 20 28 8 28 L 2 28"
                        stroke="#4F46E5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path
                        d="M 29 2 L 29 28 M 29 2 L 35 2 C 42 2 42 12 35 12 L 29 12 M 35 12 L 42 28"
                        stroke="#4F46E5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex flex-col leading-none" style={{ gap: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.26em', color: '#4F46E5', textTransform: 'uppercase', fontFamily: "'Barlow', sans-serif" }}>
                        Denim
                    </span>
                    <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', lineHeight: 1, fontFamily: "'Barlow', sans-serif" }}>
                        Revibe
                    </span>
                </div>
            </Link>

            <Card className="w-full max-w-[400px] border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center bg-white border-b border-slate-50">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</CardTitle>
                    <CardDescription className="text-slate-500 text-sm">
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pt-6 pb-2 bg-white">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all px-4"
                            />
                        </div>

                        <Button disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide rounded-xl shadow-md transition-all mt-4 group">
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Log In
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-4 bg-white flex justify-center border-t border-slate-50 mt-2">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                            Sign Up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
