"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40'];

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        location: '',
        preferredSizes: [],
    });

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(token =>
            fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        ).then(res => res.json()).then(data => {
            setForm({
                name: data.name || '',
                location: data.location || '',
                preferredSizes: data.preferredSizes || [],
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleSize = (size) => {
        setForm(prev => ({
            ...prev,
            preferredSizes: prev.preferredSizes.includes(size)
                ? prev.preferredSizes.filter(s => s !== size)
                : [...prev.preferredSizes, size],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to save');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('Could not save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Profile Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Info */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Personal Info</h3>

                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-sm font-medium text-slate-700">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Cape Town, Johannesburg"
                            className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                        />
                        <p className="text-xs text-slate-400">Used to show nearby listings in the future.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">Email</Label>
                        <Input
                            value={user?.email || ''}
                            disabled
                            className="h-11 rounded-xl bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400">Email cannot be changed.</p>
                    </div>
                </div>

                {/* Size Preferences */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Size Preferences</h3>
                        <p className="text-xs text-slate-400 mt-1">Select your usual denim sizes so we can highlight what fits.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SIZE_OPTIONS.map(size => {
                            const active = form.preferredSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                        ${active
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        className={`h-11 px-8 rounded-xl font-semibold gap-2 transition-colors
                            ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saved ? (
                            <><CheckCircle className="w-4 h-4" /> Saved!</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
