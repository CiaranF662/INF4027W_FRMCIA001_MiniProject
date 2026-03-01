// src/services/orderService.js
import FirestoreService from './baseService';
import { adminDb } from '@/lib/firebaseAdmin';

class OrderService extends FirestoreService {

    constructor() {
        super('orders');
    }

    // Creates the order and marks all purchased products as sold in a single atomic batch.
    // If anything fails, niether write goes through — keeps the DB consistent.
    async createOrder(data) {
        const batch = adminDb.batch();
        const orderRef = this.collection.doc();

        const orderData = {
            buyerId: data.buyerId,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            items: data.items,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            status: 'complete',
            createdAt: new Date()
        };

        batch.set(orderRef, orderData);

        for (const item of data.items) {
            const productRef = adminDb.collection('products').doc(item.productId);
            batch.update(productRef, { status: 'sold', updatedAt: new Date() });
        }

        await batch.commit();

        return { id: orderRef.id, ...orderData };
    }

    async getOrdersByUser(userId) {
        const snapshot = await this.collection.where('buyerId', '==', userId).get();
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            });
    }

    async getOrdersByStatus(status) {
        // Filter in Firestore, sort in JS — avoids needing a composite index
        const snapshot = await this.collection.where('status', '==', status).get();
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            });
    }

    async getAllOrders() {
        const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getOrdersInDateRange(startDate, endDate) {
        const snapshot = await this.collection
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .orderBy('createdAt', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export default new OrderService();
