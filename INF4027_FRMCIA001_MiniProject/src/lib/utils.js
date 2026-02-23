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