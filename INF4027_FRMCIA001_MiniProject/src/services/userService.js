// src/services/userService.js
import FirestoreService from './baseService';
import admin from '@/lib/firebaseAdmin';

class UserService extends FirestoreService {

    constructor() {
        super('users');
    }

    // Doc ID must match the Firebase Auth UID so profiles can be fetched after login
    async createUser(uid, data) {
        const userData = {
            email: data.email,
            name: data.name,
            role: 'customer',
            location: data.location || '',
            sizeProfile: { top: '', bottom: '', shoe: '' },
            wishlist: [],
            createdAt: new Date()
        };
        await this.collection.doc(uid).set(userData);
        return { id: uid, ...userData };
    }

    // Role is intentionally excluded from allowed fields
    async updateProfile(uid, data) {
        const allowedFields = ['name', 'location', 'sizeProfile'];
        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }
        updateData.updatedAt = new Date();
        await this.collection.doc(uid).update(updateData);
        return this.getById(uid);
    }

    async addToWishlist(uid, productId) {
        await this.collection.doc(uid).update({
            wishlist: admin.firestore.FieldValue.arrayUnion(productId)
        });
    }

    async removeFromWishlist(uid, productId) {
        await this.collection.doc(uid).update({
            wishlist: admin.firestore.FieldValue.arrayRemove(productId)
        });
    }

    async getAllUsers() {
        const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export default new UserService();
