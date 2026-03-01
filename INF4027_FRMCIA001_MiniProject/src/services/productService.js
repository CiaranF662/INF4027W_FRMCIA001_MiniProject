// src/services/productService.js
import FirestoreService from './baseService';
import admin from '@/lib/firebaseAdmin';

class ProductService extends FirestoreService {

    constructor() {
        super('products');
    }

    // Small catalog so we fetch everything and filter in memory 
    async getProducts(filters = {}) {
        let query = filters.adminView
            ? this.collection
            : this.collection.where('status', '==', 'available');

        const snapshot = await query.get();
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filters.onSale === 'true') {
            products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        // Split comma-separated filter values so ?category=Jeans,Shorts matches both
        const toArray = (val) => (val ? val.split(',').map(v => v.trim()) : []);

        if (filters.category) {
            const vals = toArray(filters.category);
            products = products.filter(p => vals.includes(p.category));
        }
        if (filters.brand) {
            const vals = toArray(filters.brand);
            products = products.filter(p => vals.includes(p.brand));
        }
        if (filters.condition) {
            const vals = toArray(filters.condition);
            products = products.filter(p => vals.includes(p.condition));
        }
        if (filters.gender) {
            const vals = toArray(filters.gender);
            products = products.filter(p => vals.includes(p.gender) || p.gender === 'Unisex');
        }
        if (filters.fit) {
            const vals = toArray(filters.fit);
            products = products.filter(p => vals.includes(p.fit));
        }
        if (filters.rise) {
            const vals = toArray(filters.rise);
            products = products.filter(p => vals.includes(p.rise));
        }
        if (filters.wash) {
            const vals = toArray(filters.wash);
            products = products.filter(p => vals.includes(p.wash));
        }
        if (filters.stretch) {
            const vals = toArray(filters.stretch);
            products = products.filter(p => vals.includes(p.stretch));
        }
        if (filters.size) {
            const vals = toArray(filters.size);
            products = products.filter(p => vals.includes(p.size));
        }
        if (filters.colour) {
            const vals = toArray(filters.colour);
            products = products.filter(p => vals.includes(p.colour));
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            products = products.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        // Guard against Number(null) === 0 which would wrongly filter everything out
        if (filters.minPrice != null && filters.minPrice !== '') {
            products = products.filter(p => p.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice != null && filters.maxPrice !== '') {
            products = products.filter(p => p.price <= Number(filters.maxPrice));
        }

        const sortBy = filters.sortBy || 'newest';

        if (sortBy === 'newest') {
            products.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            });
        }
        if (sortBy === 'price-asc') products.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') products.sort((a, b) => b.price - a.price);
        if (sortBy === 'views') products.sort((a, b) => (b.views || 0) - (a.views || 0));
        if (sortBy === 'discount') {
            products.sort((a, b) => {
                const pctA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                const pctB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                return pctB - pctA;
            });
        }

        return products;
    }

    async _getAvailableProducts() {
        const snapshot = await this.collection.where('status', '==', 'available').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getFeatured() {
        const products = await this._getAvailableProducts();
        return products
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            })
            .slice(0, 6);
    }

    async getLatest(limit = 8) {
        const products = await this._getAvailableProducts();
        return products
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            })
            .slice(0, limit);
    }

    async getBestDeals(limit = 8) {
        const products = await this._getAvailableProducts();
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

    // Uses FieldValue.increment() so concurrent views don't cause race conditions
    async incrementViews(id) {
        await this.collection.doc(id).update({
            views: admin.firestore.FieldValue.increment(1)
        });
    }

    async updateStatus(id, status) {
        await this.collection.doc(id).update({ status, updatedAt: new Date() });
    }
}

export default new ProductService();
