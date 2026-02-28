"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X, Sparkles, CheckCircle2, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// All attribute options except category — that comes from the database
const FIELD_OPTIONS = {
    condition: ["New with Tags", "Like New", "Good", "Fair"],
    gender: ["Men", "Women", "Unisex", "Kids"],
    fit: ["Skinny", "Slim", "Straight", "Relaxed", "Bootcut", "Wide Leg", "Mom", "Boyfriend", "Flare", "Baggy"],
    rise: ["Low Rise", "Mid Rise", "High Rise"],
    wash: ["Raw/Unwashed", "Dark", "Medium", "Light", "Acid", "Distressed", "Stone Wash"],
    stretch: ["No Stretch", "Slight Stretch", "Stretch", "Super Stretch"],
    colour: ["Indigo", "Dark Wash", "Medium Wash", "Light Wash", "Black", "White", "Grey", "Raw", "Acid Wash"],
    era: ["Vintage 70s", "Vintage 80s", "Vintage 90s", "Y2K", "Modern"],
    style: ["Vintage", "Streetwear", "Classic", "Workwear", "Designer", "Casual"],
};

// Fields the AI image analyser can fill
const AI_FIELDS = ['condition', 'colour', 'fit', 'rise', 'wash', 'era', 'description'];

function FormField({ label, required, children, isAiFilled }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                {label}
                {required && <span className="text-rose-500">*</span>}
                {isAiFilled && <Sparkles className="w-3 h-3 text-indigo-400" />}
            </Label>
            {children}
        </div>
    );
}

function SelectField({ label, required, value, onChange, options, placeholder, isAiFilled }) {
    return (
        <FormField label={label} required={required} isAiFilled={isAiFilled}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={`h-10 border-slate-200 focus:ring-indigo-600 transition-colors
                    ${isAiFilled ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50'}`}>
                    <SelectValue placeholder={placeholder || `Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        </FormField>
    );
}

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const aiFileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Categories loaded from the database
    const [categories, setCategories] = useState([]);

    // AI fill state
    const [analysing, setAnalysing] = useState(false);
    const [aiImageUrl, setAiImageUrl] = useState('');
    const [aiFilledFields, setAiFilledFields] = useState(new Set());
    const [aiResultCount, setAiResultCount] = useState(0);
    const [aiError, setAiError] = useState('');
    const [aiDragActive, setAiDragActive] = useState(false);

    const [form, setForm] = useState({
        title: '', description: '', brand: '', category: '', size: '',
        condition: '', gender: '', colour: '', fit: '', rise: '', wash: '',
        stretch: '', era: '', style: '', price: '', originalPrice: '', costPrice: '',
        images: [], tags: [],
    });

    // Fetch categories from the database on mount
    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setCategories(data.map(c => c.name)); })
            .catch(() => {});
    }, []);

    const clearAiField = (field) =>
        setAiFilledFields(prev => { const n = new Set(prev); n.delete(field); return n; });

    const set = (field) => (val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        clearAiField(field);
    };
    const setInput = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        clearAiField(field);
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

    // Upload a file to Firebase Storage and add the resulting URL to form.images
    const uploadFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const path = `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setForm(prev => ({ ...prev, images: [...prev.images, url] }));
        } catch {
            // silent — file simply won't be added
        }
        setUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        Array.from(e.dataTransfer.files)
            .filter(f => f.type.startsWith('image/'))
            .forEach(uploadFile);
    };

    // Core analysis logic — accepts a URL directly so it can be called from
    // both the manual Analyse button and the drag-and-drop file upload path.
    const runAiAnalysis = async (url) => {
        setAnalysing(true);
        setAiFilledFields(new Set());
        setAiResultCount(0);
        setAiError('');
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/ai/analyse-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ imageUrl: url, title: form.title, brand: form.brand, category: form.category }),
            });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();

            const updates = {};
            const filled = new Set();
            AI_FIELDS.forEach(f => {
                if (data[f] != null && data[f] !== '') { updates[f] = data[f]; filled.add(f); }
            });
            setForm(prev => ({
                ...prev,
                ...updates,
                images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
            }));
            setAiFilledFields(filled);
            setAiResultCount(filled.size);
        } catch {
            setAiError('Could not analyse the image. Check the URL and try again.');
        }
        setAnalysing(false);
    };

    // Called by the Analyse button when URL is typed/pasted manually
    const handleAiAnalyse = () => { if (aiImageUrl) runAiAnalysis(aiImageUrl); };

    // Called when a file is dropped/selected in the AI section —
    // uploads to Firebase Storage then immediately triggers analysis
    const handleAiFileDrop = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setAnalysing(true);
        setAiError('');
        try {
            const path = `products/ai_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setAiImageUrl(url);
            await runAiAnalysis(url);
        } catch {
            setAiError('Could not upload image. Try a URL instead.');
            setAnalysing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                    costPrice: form.costPrice ? Number(form.costPrice) : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create product');
            router.push('/admin/products');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const isAiFilled = (field) => aiFilledFields.has(field);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/products')} className="gap-2 text-slate-600 hover:text-slate-900 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add New Product</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Fill in the details for the new denim item</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── AI Quick Fill ─────────────────────────────────────────────── */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50/40 rounded-2xl border border-indigo-200/60 shadow-sm p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Quick Fill with AI</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Drop or paste one image — AI auto-fills up to 7 fields instantly</p>
                            </div>
                        </div>
                        {aiResultCount > 0 && (
                            <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {aiResultCount} fields filled
                            </span>
                        )}
                    </div>

                    {/* AI drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setAiDragActive(true); }}
                        onDragLeave={() => setAiDragActive(false)}
                        onDrop={(e) => { e.preventDefault(); setAiDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleAiFileDrop(f); }}
                        onClick={() => !analysing && aiFileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors select-none
                            ${aiDragActive
                                ? 'border-indigo-500 bg-indigo-100/60'
                                : analysing
                                    ? 'border-indigo-300 bg-indigo-50/60 cursor-not-allowed'
                                    : 'border-indigo-200 bg-white/60 hover:border-indigo-400 hover:bg-indigo-50/40'
                            }`}
                    >
                        <input
                            ref={aiFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAiFileDrop(f); e.target.value = ''; }}
                        />
                        {analysing ? (
                            <div className="flex items-center justify-center gap-2 text-indigo-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-semibold">
                                    {aiImageUrl ? 'Analysing image…' : 'Uploading & analysing…'}
                                </span>
                            </div>
                        ) : aiImageUrl ? (
                            <div className="flex items-center justify-center gap-3">
                                <img src={aiImageUrl} alt=""
                                    className="w-10 h-10 rounded-lg object-cover border border-indigo-200 shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <span className="text-xs text-indigo-600 font-medium">Drop a new image to re-analyse</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-indigo-400">
                                <Upload className="w-5 h-5" />
                                <p className="text-xs font-semibold text-indigo-600">Drop image here or click to browse</p>
                                <p className="text-[10px] text-slate-400">PNG, JPG, WebP</p>
                            </div>
                        )}
                    </div>

                    {/* URL paste as alternative */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-indigo-100" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">or paste a URL</span>
                        <div className="flex-1 h-px bg-indigo-100" />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={aiImageUrl}
                            onChange={(e) => { setAiImageUrl(e.target.value); setAiResultCount(0); setAiError(''); }}
                            placeholder="https://images.unsplash.com/..."
                            className="bg-white border-indigo-200 focus-visible:ring-indigo-600 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAiAnalyse())}
                        />
                        <Button
                            type="button"
                            onClick={handleAiAnalyse}
                            disabled={analysing || !aiImageUrl}
                            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl"
                        >
                            {analysing
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                                : <><Sparkles className="w-4 h-4" /> Analyse</>
                            }
                        </Button>
                    </div>

                    {aiError && (
                        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{aiError}</p>
                    )}

                    {!aiImageUrl && !analysing && (
                        <p className="text-xs text-slate-400">
                            Fills: Condition, Colour, Fit, Wash, Rise, Era, Description. All editable after. The image is also added to product photos.
                        </p>
                    )}
                </div>

                {/* ── Core Information ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Core Information</h3>
                    <FormField label="Product Title" required>
                        <Input value={form.title} onChange={setInput('title')} required
                            placeholder="e.g. Vintage Levi's 501 Original Fit Jeans"
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Brand" required>
                            <Input value={form.brand} onChange={setInput('brand')} required placeholder="e.g. Levi's"
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                        <SelectField
                            label="Category" required
                            value={form.category} onChange={set('category')}
                            options={categories.length ? categories : ['Loading…']}
                            placeholder="Select Category"
                        />
                    </div>
                    <FormField label="Description" isAiFilled={isAiFilled('description')}>
                        <textarea
                            value={form.description}
                            onChange={setInput('description')}
                            rows={3}
                            placeholder="Describe the item — notable features, history, or flaws..."
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none transition-colors
                                ${isAiFilled('description') ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                        />
                    </FormField>
                </div>

                {/* ── Denim Attributes ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Denim Attributes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        <SelectField label="Condition" required value={form.condition} onChange={set('condition')}
                            options={FIELD_OPTIONS.condition} isAiFilled={isAiFilled('condition')} />
                        <FormField label="Size" required>
                            <Input value={form.size} onChange={setInput('size')} required placeholder="e.g. 32 or M"
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                        <SelectField label="Gender" required value={form.gender} onChange={set('gender')}
                            options={FIELD_OPTIONS.gender} />
                        <SelectField label="Colour" value={form.colour} onChange={set('colour')}
                            options={FIELD_OPTIONS.colour} isAiFilled={isAiFilled('colour')} />
                        <SelectField label="Fit" value={form.fit} onChange={set('fit')}
                            options={FIELD_OPTIONS.fit} isAiFilled={isAiFilled('fit')} />
                        <SelectField label="Rise" value={form.rise} onChange={set('rise')}
                            options={FIELD_OPTIONS.rise} isAiFilled={isAiFilled('rise')} />
                        <SelectField label="Wash" value={form.wash} onChange={set('wash')}
                            options={FIELD_OPTIONS.wash} isAiFilled={isAiFilled('wash')} />
                        <SelectField label="Stretch" value={form.stretch} onChange={set('stretch')}
                            options={FIELD_OPTIONS.stretch} />
                        <SelectField label="Era" value={form.era} onChange={set('era')}
                            options={FIELD_OPTIONS.era} isAiFilled={isAiFilled('era')} />
                        <SelectField label="Style" value={form.style} onChange={set('style')}
                            options={FIELD_OPTIONS.style} />
                    </div>
                </div>

                {/* ── Pricing ───────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <FormField label="Sale Price (R)" required>
                            <Input type="number" value={form.price} onChange={setInput('price')} required min="1" placeholder="450"
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                        <FormField label="Original / RRP (R)">
                            <Input type="number" value={form.originalPrice} onChange={setInput('originalPrice')} min="1" placeholder="899"
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                        <FormField label="Cost Price (R)">
                            <Input type="number" value={form.costPrice} onChange={setInput('costPrice')} min="0" placeholder="150"
                                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600" />
                        </FormField>
                    </div>
                    <p className="text-xs text-slate-400">
                        <strong className="text-slate-500">Sale Price</strong> — what the customer pays. &nbsp;
                        <strong className="text-slate-500">Original / RRP</strong> — shows a strikethrough "was" price and discount %. Leave blank for no discount badge. &nbsp;
                        <strong className="text-slate-500">Cost Price</strong> — private, used only in profit reports.
                    </p>
                </div>

                {/* ── Product Images ────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Product Images</h3>

                    {/* Drag-and-drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors select-none
                            ${dragActive
                                ? 'border-indigo-400 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => Array.from(e.target.files).forEach(uploadFile)}
                        />
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

                    {/* URL paste fallback */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 shrink-0">or paste a URL</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="flex gap-2">
                        <Input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                        />
                        <Button type="button" onClick={addImageUrl} variant="outline" className="shrink-0 gap-1.5">
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>

                    {/* Image thumbnails */}
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
                            placeholder="e.g. selvedge, vintage, 501"
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="outline" className="shrink-0 gap-1.5">
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>
                    {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pb-8">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} className="rounded-xl">Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 min-w-[140px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
