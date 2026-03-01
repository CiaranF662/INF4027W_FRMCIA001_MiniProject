"use client";

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductPreviewModal from '@/components/admin/ProductPreviewModal';

const LETTER_SIZES = [
    { value: 'XXS', equiv: '24' },
    { value: 'XS',  equiv: '26-27' },
    { value: 'S',   equiv: '28-29' },
    { value: 'M',   equiv: '30-31' },
    { value: 'L',   equiv: '32-33' },
    { value: 'XL',  equiv: '34-35' },
    { value: 'XXL', equiv: '36-38' },
];
const WAIST_SIZES = ['24','25','26','27','28','29','30','31','32','33','34','35','36','38','40','42'];

const FIELD_OPTIONS = {
    condition: ["New with Tags", "Like New", "Good", "Fair"],
    gender: ["Men", "Women", "Unisex", "Kids"],
    fit: ["Skinny", "Slim", "Straight", "Relaxed", "Bootcut", "Wide Leg", "Mom", "Boyfriend", "Flare", "Baggy"],
    rise: ["Low Rise", "Mid Rise", "High Rise"],
    wash: ["Raw/Unwashed", "Dark", "Medium", "Light", "Acid", "Distressed", "Stone Wash"],
    stretch: ["No Stretch", "Slight Stretch", "Stretch", "Super Stretch"],
    colour: ["Blue", "Dark Indigo", "Black", "White", "Grey", "Green", "Olive", "Beige / Tan", "Brown", "Pink", "Red", "Burgundy", "Purple", "Orange", "Yellow", "Multi / Pattern"],
    era: ["Vintage 70s", "Vintage 80s", "Vintage 90s", "Y2K", "Modern"],
    style: ["Vintage", "Streetwear", "Classic", "Workwear", "Designer", "Casual"],
};

function FormField({ label, required, children, error }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

function SelectField({ label, required, value, onChange, options, error }) {
    return (
        <FormField label={label} required={required} error={error}>
            <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger className={`h-10 focus:ring-indigo-600 transition-colors
                    ${error ? 'border-rose-400 bg-rose-50/30' : 'bg-slate-50 border-slate-200'}`}>
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        </FormField>
    );
}

export default function EditProductPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null);

    // Load product and categories in parallel
    useEffect(() => {
        if (!id || !user) return;
        Promise.all([
            fetch(`/api/products/${id}`).then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([product, cats]) => {
            setForm({
                title: product.title || '', description: product.description || '',
                brand: product.brand || '', category: product.category || '',
                size: product.size || '', condition: product.condition || '',
                gender: product.gender || '', colour: product.colour || '',
                fit: product.fit || '', rise: product.rise || '', wash: product.wash || '',
                stretch: product.stretch || '', era: product.era || '', style: product.style || '',
                price: String(product.price || ''), originalPrice: String(product.originalPrice || ''),
                costPrice: String(product.costPrice || ''),
                images: product.images || [], tags: product.tags || [],
            });
            if (Array.isArray(cats)) setCategories(cats.map(c => c.name));
            setLoading(false);
        });
    }, [id, user]);

    const clearFormError = (field) =>
        setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

    const set = (field) => (val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        clearFormError(field);
    };
    const setInput = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        clearFormError(field);
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !form.tags.includes(tag)) setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
    };
    const removeTag = (tag) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

    const addImageUrl = () => {
        const url = imageInput.trim();
        if (url && !form.images.includes(url)) setForm(prev => ({ ...prev, images: [...prev.images, url] }));
        setImageInput('');
    };
    const removeImage = (url) => setForm(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));

    const uploadFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const path = `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setForm(prev => ({ ...prev, images: [...prev.images, url] }));
        } catch { /* silent */ }
        setUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        Array.from(e.dataTransfer.files)
            .filter(f => f.type.startsWith('image/'))
            .forEach(uploadFile);
    };

    const validate = () => {
        const errors = {};
        if (!form.title.trim())    errors.title     = 'Title is required';
        if (!form.brand.trim())    errors.brand     = 'Brand is required';
        if (!form.category)        errors.category  = 'Category is required';
        if (!form.condition)       errors.condition = 'Condition is required';
        if (!form.size)            errors.size      = 'Size is required';
        if (!form.gender)          errors.gender    = 'Gender is required';
        if (!String(form.price).trim() || Number(form.price) <= 0) errors.price = 'A valid sale price is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) setShowPreview(true);
    };

    // called from the preview modal's Confirm button
    const doSave = async () => {
        setError('');
        setSaving(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                    costPrice: form.costPrice ? Number(form.costPrice) : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            router.push('/admin/products');
        } catch (err) {
            setError(err.message);
            setShowPreview(false);
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
    );
    if (!form) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/products')} className="gap-2 text-slate-600 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Product</h2>
                    <p className="text-slate-500 text-sm mt-0.5 truncate max-w-md">{form.title}</p>
                </div>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* ── Core Information ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Core Information</h3>
                    <FormField label="Product Title" required error={formErrors.title}>
                        <Input value={form.title} onChange={setInput('title')}
                            className={`focus-visible:ring-indigo-600 ${formErrors.title ? 'border-rose-400 bg-rose-50/30' : 'bg-slate-50 border-slate-200'}`} />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <FormField label="Brand" required error={formErrors.brand}>
                            <Input value={form.brand} onChange={setInput('brand')}
                                className={`focus-visible:ring-indigo-600 ${formErrors.brand ? 'border-rose-400 bg-rose-50/30' : 'bg-slate-50 border-slate-200'}`} />
                        </FormField>
                        <SelectField label="Category" required value={form.category} onChange={set('category')}
                            options={categories.length ? categories : ['Loading…']}
                            error={formErrors.category} />
                        <FormField label="Size" required error={formErrors.size}>
                            <Select value={form.size} onValueChange={set('size')}>
                                <SelectTrigger className={`bg-slate-50 border-slate-200 text-sm focus:ring-indigo-600 ${formErrors.size ? 'border-rose-400 bg-rose-50/30' : ''}`}>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Letter Size</SelectLabel>
                                        {LETTER_SIZES.map(({ value, equiv }) => (
                                            <SelectItem key={value} value={value}>
                                                <span className="flex items-center gap-4">
                                                    <span className="font-medium w-8">{value}</span>
                                                    <span className="text-slate-400 text-xs">≈ {equiv}"</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Waist Size (inches)</SelectLabel>
                                        {WAIST_SIZES.map(s => (
                                            <SelectItem key={s} value={s}>{s}"</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                    <FormField label="Description">
                        <textarea value={form.description} onChange={setInput('description')} rows={3}
                            className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none" />
                    </FormField>
                </div>

                {/* ── Denim Attributes ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Denim Attributes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        <SelectField label="Condition" required value={form.condition} onChange={set('condition')}
                            options={FIELD_OPTIONS.condition} error={formErrors.condition} />
                        <SelectField label="Gender" required value={form.gender} onChange={set('gender')}
                            options={FIELD_OPTIONS.gender} error={formErrors.gender} />
                        <SelectField label="Colour" value={form.colour} onChange={set('colour')} options={FIELD_OPTIONS.colour} />
                        <SelectField label="Fit" value={form.fit} onChange={set('fit')} options={FIELD_OPTIONS.fit} />
                        <SelectField label="Rise" value={form.rise} onChange={set('rise')} options={FIELD_OPTIONS.rise} />
                        <SelectField label="Wash" value={form.wash} onChange={set('wash')} options={FIELD_OPTIONS.wash} />
                        <SelectField label="Stretch" value={form.stretch} onChange={set('stretch')} options={FIELD_OPTIONS.stretch} />
                        <SelectField label="Era" value={form.era} onChange={set('era')} options={FIELD_OPTIONS.era} />
                        <SelectField label="Style" value={form.style} onChange={set('style')} options={FIELD_OPTIONS.style} />
                    </div>
                </div>

                {/* ── Pricing ───────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <FormField label="Sale Price (R)" required error={formErrors.price}>
                            <Input type="number" value={form.price} onChange={setInput('price')} min="1"
                                className={`focus-visible:ring-indigo-600 ${formErrors.price ? 'border-rose-400 bg-rose-50/30' : 'bg-slate-50 border-slate-200'}`} />
                        </FormField>
                        <FormField label="Original / RRP (R)">
                            <Input type="number" value={form.originalPrice} onChange={setInput('originalPrice')}
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                        <FormField label="Cost Price (R)">
                            <Input type="number" value={form.costPrice} onChange={setInput('costPrice')}
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                    </div>
                    <p className="text-xs text-slate-400">
                        <strong className="text-slate-500">Original / RRP</strong> — shows a strikethrough "was" price and discount %. Leave blank to hide discount badge.
                    </p>
                </div>

                {/* ── Product Images ────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Product Images</h3>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors select-none
                            ${dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'}`}
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => Array.from(e.target.files).forEach(uploadFile)} />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2 text-indigo-500">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-xs font-medium">Uploading…</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Upload className="w-6 h-6" />
                                <p className="text-sm font-medium text-slate-500">Drag & drop or click to browse</p>
                                <p className="text-xs">PNG, JPG, WebP — multiple files supported</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 shrink-0">or paste a URL</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="flex gap-2">
                        <Input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                            placeholder="Paste image URL"
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} />
                        <Button type="button" onClick={addImageUrl} variant="outline" className="shrink-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {form.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                            {form.images.map((url, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(url)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Tags ──────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Tags</h3>
                    <div className="flex gap-2">
                        <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                            placeholder="e.g. selvedge, 501"
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                        <Button type="button" onClick={addTag} variant="outline" className="shrink-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pb-8">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 min-w-[140px]">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preview & Save'}
                    </Button>
                </div>
            </form>

            {showPreview && (
                <ProductPreviewModal
                    form={form}
                    onClose={() => setShowPreview(false)}
                    onConfirm={doSave}
                    saving={saving}
                    confirmLabel="Confirm & Update"
                />
            )}
        </div>
    );
}
