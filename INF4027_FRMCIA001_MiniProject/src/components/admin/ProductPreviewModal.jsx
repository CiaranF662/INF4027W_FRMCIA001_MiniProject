import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatPrice, calculateDiscount } from '@/lib/utils';

/**
 * ProductPreviewModal — shared between the Add and Edit product pages.
 *
 * Shows a structured preview of the product form data before the admin
 * commits the save/update, so they can catch any mistakes first.
 *
 * Props:
 *   form         — the current form state object
 *   onClose      — called when the user clicks "Back to Edit" or closes the dialog
 *   onConfirm    — called when the user clicks the confirm button (triggers the API call)
 *   saving       — true while the API call is in flight (disables buttons, shows spinner)
 *   confirmLabel — label for the confirm button (default: "Confirm & Save")
 */
export default function ProductPreviewModal({ form, onClose, onConfirm, saving, confirmLabel = 'Confirm & Save' }) {
    const firstImage = form.images[0];
    const discount = calculateDiscount(Number(form.originalPrice), Number(form.price));

    const ATTR_FIELDS = [
        { label: 'Size',    value: form.size },
        { label: 'Fit',     value: form.fit },
        { label: 'Wash',    value: form.wash },
        { label: 'Colour',  value: form.colour },
        { label: 'Rise',    value: form.rise },
        { label: 'Stretch', value: form.stretch },
        { label: 'Era',     value: form.era },
        { label: 'Style',   value: form.style },
    ].filter(a => a.value);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900">Product Preview</DialogTitle>
                    <p className="text-sm text-slate-500 mt-0.5">Review everything before saving</p>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5 overflow-y-auto">

                    {/* Hero row: image + core info */}
                    <div className="flex gap-5">
                        <div className="w-32 h-40 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {firstImage
                                ? <img src={firstImage} alt="" className="w-full h-full object-cover"
                                    onError={e => { e.target.style.display = 'none'; }} />
                                : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center px-2">
                                    No image added
                                  </div>
                            }
                        </div>

                        <div className="flex-1 min-w-0 space-y-2.5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">{form.brand}</p>
                                <h2 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{form.title}</h2>
                            </div>

                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-2xl font-bold text-slate-900">{formatPrice(form.price)}</span>
                                {form.originalPrice && (
                                    <span className="text-sm text-slate-400 line-through">{formatPrice(form.originalPrice)}</span>
                                )}
                                {discount > 0 && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        -{discount}%
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {form.category && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                        {form.category}
                                    </span>
                                )}
                                {form.gender && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                        {form.gender}
                                    </span>
                                )}
                                {form.condition && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                                        {form.condition}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Attribute grid */}
                    {ATTR_FIELDS.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attributes</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {ATTR_FIELDS.map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                                        <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {form.description && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{form.description}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {form.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {form.tags.map(tag => (
                                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* All images strip */}
                    {form.images?.length > 1 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                All Images ({form.images.length})
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {form.images.map((url, i) => (
                                    <img key={i} src={url} alt=""
                                        className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
                    <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 rounded-xl">
                        Back to Edit
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Saving…' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
