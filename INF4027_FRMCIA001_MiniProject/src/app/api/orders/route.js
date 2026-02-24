// src/app/api/orders/route.js
//                                                                                                                                                                           
// Handles requests to /api/orders
// GET  /api/orders  → admin gets all orders, customer gets their own orders
// POST /api/orders  → customer places an order (checkout)

import { NextResponse } from 'next/server';
import orderService from '@/services/orderService';
import { verifyAuth, verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/orders
 *
 * Behaviour depends on who is asking:
 *   - Admin    → returns every order on the platform
 *   - Customer → returns only their own orders
 *   - Guest    → rejected with 401
 *
 * This single endpoint serves both the admin orders table
 * and the customer "My Orders" page.
 */
export async function GET(request) {
    try {
        // Both admins and customers need to be logged in
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        // Admin sees all orders on the platform
        if (user.role === 'admin') {
            const orders = await orderService.getAllOrders();
            return NextResponse.json(orders);
        }

        const orders = await orderService.getOrdersByUser(user.uid); // Customer only sees their own orders,  user.uid is the Firebase Auth UID — matches the buyerId stored on each order

        return NextResponse.json(orders);

    } catch (error) {
        console.error('GET /api/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/orders
 *
 * The checkout endpoint — the most important POST route in the app.
 * Requires the customer to be logged in.
 *
 * What it does:
 *   1. Verifies the customer is logged in
 *   2. Validates the cart items and payment method
 *   3. Confirms every product in the cart is still available
 *   4. Creates the order and marks products as sold (atomic batch write)
 */
export async function POST(request) {
    try {
        // Step 1: Verify the customer is logged in
        // verifyAuth (not verifyAdmin) — any logged-in user can place an order
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in to checkout' },
                { status: 401 }
            );
        }

        // Step 2: Read the checkout data from the request body
        const data = await request.json();

        // Step 3: Validate the cart is not empty
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            return NextResponse.json(
                { error: 'Your cart is empty' },
                { status: 400 }
            );
        }

        // Step 4: Validate a payment method was selected
        const validPaymentMethods = ['card', 'paypal', 'cash_on_delivery'];
        if (!data.paymentMethod || !validPaymentMethods.includes(data.paymentMethod)) {
            return NextResponse.json(
                { error: 'Please select a valid payment method' },
                { status: 400 }
            );
        }

        // Step 5: Validate each item in the cart
        // Check every item has the minimum fields needed
        for (const item of data.items) {
            if (!item.productId || !item.price || !item.title) {
                return NextResponse.json(
                    { error: 'Invalid item in cart — missing required fields' },
                    { status: 400 }
                );
            }
        }

        // Step 6: Confirm every product is still available in Firestore
        // This prevents buying something that sold while it was in your cart
        const { adminDb } = await import('@/lib/firebaseAdmin');

        for (const item of data.items) {
            const productDoc = await adminDb.collection('products').doc(item.productId).get();

            if (!productDoc.exists) {
                return NextResponse.json(
                    { error: `Product "${item.title}" no longer exists` },
                    { status: 400 }
                );
            }

            if (productDoc.data().status !== 'available') {
                return NextResponse.json(
                    { error: `"${item.title}" has already been sold` },
                    { status: 400 }
                );
            }
        }

        // Step 7: Calculate the total server-side
        // Never trust the total sent from the browser — always recalculate it here
        // A malicious user could change the price in the browser before sending
        const totalAmount = data.items.reduce(
            (sum, item) => sum + Number(item.price), 0
        );

        // Step 8: Build the order using verified server-side data
        const orderData = {
            buyerId: user.uid,
            buyerName: user.name || data.buyerName,
            buyerEmail: user.email,
            items: data.items,
            totalAmount,                    // server-calculated, not trusted from client
            paymentMethod: data.paymentMethod
        };

        // Step 9: Create the order via service (atomic batch write)
        const order = await orderService.createOrder(orderData);

        return NextResponse.json(order, { status: 201 });

    } catch (error) {
        console.error('POST /api/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to place order' },
            { status: 500 }
        );
    }
}