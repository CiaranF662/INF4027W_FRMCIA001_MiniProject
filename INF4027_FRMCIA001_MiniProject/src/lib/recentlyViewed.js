// src/lib/recentlyViewed.js

const KEY = 'revibe_recently_viewed';
const MAX = 8; // keep last 8 viewed products

// Adds a product to the recently-viewed list.
// Moves it to the front if already present. Trims to MAX.
export function trackRecentlyViewed(product) {
    if (typeof window === 'undefined') return;
    try {
        const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
        const filtered = stored.filter(p => p.id !== product.id);
        const updated = [product, ...filtered].slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {}
}

// Returns the recently-viewed product list (newest first).
export function getRecentlyViewed() {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}
