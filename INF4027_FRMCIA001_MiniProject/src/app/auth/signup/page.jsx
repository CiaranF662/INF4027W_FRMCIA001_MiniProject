"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SA_LOCATIONS = ["Cape Town", "Johannesburg", "Pretoria", "Durban", "Port Elizabeth", "Other"];

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!location) {
            setError('Please select your location.');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // 2. POST to /api/users — creates the Firestore profile with name, location, role
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ name, email, location }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create profile');
            }

            // 3. Redirect to homepage
            router.push('/');

        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 8 characters long.');
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 sm:py-12">

            <Link href="/" className="flex items-center gap-3 mb-8 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-xl leading-none">D</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">Denim Revibe</span>
            </Link>

            <Card className="w-full max-w-[450px] border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center bg-white border-b border-slate-50">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Create an account</CardTitle>
                    <CardDescription className="text-slate-500 text-sm">
                        Join South Africa's premium second-hand denim marketplace
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pt-6 pb-2 bg-white">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Sipho Dlamini"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="sipho@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all px-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all px-4"
                            />
                            <p className="text-[11px] text-slate-400 font-medium">Must be at least 8 characters long.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</Label>
                            <Select onValueChange={setLocation}>
                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-indigo-600 px-4 text-base sm:text-sm">
                                    <SelectValue placeholder="Select your city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SA_LOCATIONS.map(city => (
                                        <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide rounded-xl shadow-md transition-all mt-6 group">
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-4 bg-white flex flex-col items-center border-t border-slate-50 mt-2 gap-4">
                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                            Log In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
