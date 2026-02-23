// src/services/orderService.js                                                                                                                                              

import FirestoreService from './baseService';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * OrderService — handles all database operations for the 'orders' collection.
 *
 * Extends FirestoreService, so it inherits:
 *   getAll(), getById(), create(), update(), delete()
 *
 * Additional methods added here:
 *   createOrder(data)              — create order AND mark products as sold atomically
 *   getOrdersByUser(userId)        — fetch all orders for a specific customer
 *   getOrdersByStatus(status)      — admin filter orders by status
 *   getOrdersInDateRange(start, end) — used by the Financial Report
 */
class OrderService extends FirestoreService {

    constructor() {
        // Tell the parent class to point at the 'orders' Firestore collection
        super('orders');
    }

    /**
     * CREATE ORDER — the most critical method in the entire application.
     *
     * This method does two things at exactly the same time using a
     * Firestore BATCH WRITE:
     *   1. Creates the order document in the 'orders' collection
     *   2. Marks every purchased product's status as 'sold'
     *
     * WHY A BATCH? Imagine the server crashes between step 1 and step 2.
     * Without a batch, the order would exist but the products would still
     * show as 'available' — someone else could buy them again.
     * A batch is all-or-nothing: either BOTH writes succeed, or NEITHER does.
     * This guarantees the database stays consistent.
     *
     * @param {Object} data - the order data from the checkout form
     * @param {string} data.buyerId       - Firebase Auth UID of the customer
     * @param {string} data.buyerName     - customer's display name
     * @param {string} data.buyerEmail    - customer's email address
     * @param {Array}  data.items         - array of cart items being purchased
     * @param {number} data.totalAmount   - total price in Rands
     * @param {string} data.paymentMethod - "card" | "paypal" | "cash_on_delivery"
     * @returns {Object} the newly created order document
     */
    async createOrder(data) {
        // A batch lets us group multiple writes into one atomic operation
        const batch = adminDb.batch();

        // --- STEP 1: Prepare the new order document ---
        // Create a reference for a new document (Firestore generates the ID)
        const orderRef = this.collection.doc();

        const orderData = {
            buyerId: data.buyerId,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            items: data.items,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            status: 'complete',   // Per the brief: order goes directly to 'complete' — no delivery needed
            createdAt: new Date()
        };


        batch.set(orderRef, orderData);  // Add the order creation to the batch (not committed yet)

        // --- STEP 2: Mark every purchased product as 'sold' ---
        for (const item of data.items) {
            const productRef = adminDb.collection('products').doc(item.productId);
            batch.update(productRef, {
                status: 'sold',
                updatedAt: new Date()
            });
        }

        // --- STEP 3: Commit both writes simultaneously ---
        // If anything fails here, neither the order nor the product updates go through
        await batch.commit();

        // Return the full order object including its generated ID
        return {
            id: orderRef.id,
            ...orderData
        };
    }

    /**
     * GET ORDERS BY USER — fetch all orders placed by a specific customer.
     * Used on the "My Orders" page in the customer account dashboard.
     * Results are sorted newest first.
     *
     * @param {string} userId - the buyer's Firebase Auth UID
     * @returns {Array} all orders for that customer, newest first
     */
    async getOrdersByUser(userId) {
        const snapshot = await this.collection.where('buyerId', '==', userId).orderBy('createdAt', 'desc').get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * GET ORDERS BY STATUS — filter orders by their current status.
     * Used by the admin orders table filter.
     *
     * @param {string} status - "complete" | "pending"
     * @returns {Array} all orders with that status
     */
    async getOrdersByStatus(status) {
        const snapshot = await this.collection
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * GET ALL ORDERS — fetch every order on the platform.
     * Used by the admin orders table (unfiltered view).
     * Results are sorted newest first.
     *
     * Overrides the parent getAll() to add sorting by createdAt.
     *
     * @returns {Array} all orders on the platform, newest first
     */
    async getAllOrders() {
        const snapshot = await this.collection
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * GET ORDERS IN DATE RANGE — fetch orders between two dates.
     * Used by the Financial Report to calculate revenue over time.
     *
     * @param {Date} startDate - beginning of the date range
     * @param {Date} endDate   - end of the date range
     * @returns {Array} all orders placed within that range
     */
    async getOrdersInDateRange(startDate, endDate) {
        const snapshot = await this.collection
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .orderBy('createdAt', 'asc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

// Export a single shared instance
export default new OrderService();