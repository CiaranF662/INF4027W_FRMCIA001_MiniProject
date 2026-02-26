// src/services/productService.js                                                                                                                                            

import FirestoreService from './baseService';
import admin from '@/lib/firebaseAdmin';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * ProductService — handles all database operations for the 'products' collection.
 *
 * Extends FirestoreService, so it inherits:
 *   getAll(), getById(), create(), update(), delete()
 *
 * This class adds product-specific methods on top of those:
 *   getProducts(filters)   — filtered + sorted product listing
 *   getFeatured()          — homepage featured products
 *   getLatest(limit)       — most recently listed items
 *   getBestDeals(limit)    — highest percentage discount items
 *   incrementViews(id)     — track how many times a product is viewed
 *   updateStatus(id, status) — mark a product as sold/available/removed
 */
class ProductService extends FirestoreService {

    constructor() {
        super('products');     // Tell the parent class to point at the 'products' Firestore collection
    }

    /**
     * GET PRODUCTS — fetch products with optional filtering and sorting.
     * Used by the browse/search results page and the admin products table.
     *
     * Because we have 20-30 products (small catalog), we fetch all available
     * products and filter them in memory. This avoids Firestore's strict
     * composite index requirements for multi-field queries.
     *
     * @param {Object} filters - optional filters to apply
     * @param {string} filters.category   - e.g. "Jeans"
     * @param {string} filters.brand      - e.g. "Levi's"
     * @param {string} filters.condition  - e.g. "Like New"
     * @param {string} filters.gender     - e.g. "Women"
     * @param {string} filters.fit        - e.g. "Slim"
     * @param {string} filters.rise       - e.g. "High Rise"
     * @param {string} filters.wash       - e.g. "Dark"
     * @param {string} filters.stretch    - e.g. "Stretch"
     * @param {string} filters.size       - e.g. "32"
     * @param {string} filters.colour     - e.g. "Indigo"
     * @param {number} filters.minPrice   - minimum price in Rands
     * @param {number} filters.maxPrice   - maximum price in Rands
     * @param {string} filters.sortBy     - "newest" | "price_asc" | "price_desc" | "discount"
     * @param {boolean} filters.adminView - if true, include sold/removed products
     * @returns {Array} filtered and sorted array of products
     */

    async getProducts(filters = {}) {
        // Start with only available products unless admin is viewing
        let query = filters.adminView
            ? this.collection
            : this.collection.where('status', '==', 'available');

        const snapshot = await query.get();

        // Convert all Firestore documents to plain JS objects
        let products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // --- IN-MEMORY FILTERING ---
        // Apply each filter only if a value was provided for it

        // Sale filter — only keep products that have a genuine discount (originalPrice > price)
        if (filters.onSale === 'true') {
            products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }

        if (filters.brand) {
            products = products.filter(p => p.brand === filters.brand);
        }

        if (filters.condition) {
            products = products.filter(p => p.condition === filters.condition);
        }

        if (filters.gender) {
            products = products.filter(p =>
                p.gender === filters.gender || p.gender === 'Unisex'
            );
        }

        // Denim-specific filters
        if (filters.fit) {
            products = products.filter(p => p.fit === filters.fit);
        }

        if (filters.rise) {
            products = products.filter(p => p.rise === filters.rise);
        }

        if (filters.wash) {
            products = products.filter(p => p.wash === filters.wash);
        }

        if (filters.stretch) {
            products = products.filter(p => p.stretch === filters.stretch);
        }

        if (filters.size) {
            products = products.filter(p => p.size === filters.size);
        }

        if (filters.colour) {
            products = products.filter(p => p.colour === filters.colour);
        }

        // Price range filter — only apply if a real value was given
        // We check for null AND undefined because searchParams.get() returns null (not undefined)
        // when a query param is missing. Number(null) === 0, which would wrongly filter everything out.
        if (filters.minPrice != null && filters.minPrice !== '') {
            products = products.filter(p => p.price >= Number(filters.minPrice));
        }

        if (filters.maxPrice != null && filters.maxPrice !== '') {
            products = products.filter(p => p.price <= Number(filters.maxPrice));
        }

        // --- SORTING ---
        const sortBy = filters.sortBy || 'newest';

        if (sortBy === 'newest') {   // Sort by createdAt descending (most recent first)
            products.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            });
        }

        if (sortBy === 'price_asc') {
            products.sort((a, b) => a.price - b.price);
        }

        if (sortBy === 'price_desc') {
            products.sort((a, b) => b.price - a.price);
        }

        if (sortBy === 'discount') {
            // Sort by highest percentage discount first
            products.sort((a, b) => {
                const discountA = a.originalPrice
                    ? ((a.originalPrice - a.price) / a.originalPrice) * 100
                    : 0;
                const discountB = b.originalPrice
                    ? ((b.originalPrice - b.price) / b.originalPrice) * 100
                    : 0;
                return discountB - discountA;
            });
        }

        return products;
    }

    /**
     * GET FEATURED — returns a small selection of products for the homepage.
     * Picks the 6 most recently listed available products.
     * @returns {Array} up to 6 products
     */
    async getFeatured() {
        // Filter in Firestore, sort and limit in JavaScript — avoids needing a composite index
        const snapshot = await this.collection.where('status', '==', 'available').get();

        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            })
            .slice(0, 6);
    }

    /**
     * GET LATEST — returns the most recently listed products.
     * Used for the "Just Listed" section on the homepage.
     * @param {number} limit - how many products to return (default 8)
     * @returns {Array} the newest products
     */
    async getLatest(limit = 8) {
        // Filter in Firestore, sort and limit in JavaScript — avoids needing a composite index
        const snapshot = await this.collection.where('status', '==', 'available').get();

        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            })
            .slice(0, limit);
    }

    /**
     * GET BEST DEALS — returns products sorted by highest discount percentage.
     * Used for the "Best Deals" section on the homepage.
     * @param {number} limit - how many products to return (default 8)
     * @returns {Array} products with the biggest savings first
     */
    async getBestDeals(limit = 8) {
        const snapshot = await this.collection
            .where('status', '==', 'available')
            .get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate discount percentage for each product and sort
        return products
            .map(p => ({
                ...p,
                discountPercent: p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0
            }))
            .sort((a, b) => b.discountPercent - a.discountPercent)
            .slice(0, limit);
    }

    /**
     * INCREMENT VIEWS — adds 1 to a product's view count every time
     * its detail page is visited. Used for the Product Report.
     *
     * Uses Firestore's FieldValue.increment() — this is atomic, meaning
     * if two people view the product at the same time it won't miss a count.
     *
     * @param {string} id - the product's Firestore document ID
     */
    async incrementViews(id) {
        await this.collection.doc(id).update({
            views: admin.firestore.FieldValue.increment(1)  // atomic +1, safe for concurrent views
        });
    }

    /**
     * UPDATE STATUS — change a product's status.
     * Called during checkout to mark purchased products as 'sold'.
     * Called by admin to remove a product from the listing.
     *
     * @param {string} id - the product's Firestore document ID
     * @param {string} status - 'available' | 'sold' | 'removed'
     */
    async updateStatus(id, status) {
        await this.collection.doc(id).update({
            status,
            updatedAt: new Date()
        });
    }
}

// Export a single shared instance.
// The 'new' keyword creates the object and calls the constructor once.
// Every API route that imports productService gets the same instance.
export default new ProductService();