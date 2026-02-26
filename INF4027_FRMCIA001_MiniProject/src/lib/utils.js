import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format a number as South African Rand (e.g. 1500 → "R 1 500")
export function formatPrice(amount) {
  return `R ${Number(amount).toLocaleString('en-ZA')}`;
}

// Calculate percentage discount between original and sale price (e.g. 650, 180 → 72)
export function calculateDiscount(originalPrice, salePrice) {
  if (!originalPrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Returns Tailwind classes for condition badge colour coding
// Used by ProductCard, ProductDetailPage, and any other component showing condition
export function getConditionStyles(condition) {
  switch (condition) {
    case 'New with Tags':
    case 'Like New': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Good':     return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Fair':     return 'bg-rose-50 text-rose-700 border-rose-200';
    default:         return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}