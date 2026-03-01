import React from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartItem({ item, onRemove }) {
    return (
        <div className="p-4 sm:p-6 flex gap-4 sm:gap-6 group hover:bg-slate-50/50 transition-colors">

            {/* Item Image */}
            <Link href={`/products/${item.id}`} className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 flex items-center justify-center text-center">
                {item.image
                    ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{item.brand}</span>
                }
            </Link>

            {/* Item Details */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">
                            {item.brand}
                        </p>
                        <Link href={`/products/${item.id}`} className="font-medium text-slate-900 text-sm sm:text-base leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
                            {item.title}
                        </Link>

                        {/* Key Attributes */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-500">
                            {item.size    && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Size: {item.size}</span>}
                            {item.colour  && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>{item.colour}</span>}
                            {item.fit     && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>{item.fit}</span>}
                            {item.wash    && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>{item.wash} Wash</span>}
                        </div>
                    </div>

                    {/* Price (Desktop positioning) */}
                    <div className="hidden sm:block text-right shrink-0">
                        <span className="text-lg font-bold text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                    </div>
                </div>

                {/* Bottom Action Row (Mobile Price + Remove Button) */}
                <div className="flex items-center justify-between mt-4">
                    {onRemove ? (
                        <button
                            onClick={() => onRemove(item.id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove</span>
                        </button>
                    ) : (
                        <div /> // Spacer if readonly
                    )}

                    {/* Mobile positioning for Price */}
                    <span className="sm:hidden text-lg font-bold text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                </div>
            </div>
        </div>
    );
}
