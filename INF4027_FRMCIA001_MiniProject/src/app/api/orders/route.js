// src/app/api/orders/route.js
// GET  /api/orders  → admin gets all orders, customer gets their own
// POST /api/orders  → place an order (checkout)

import { NextResponse } from 'next/server';
import orderService from '@/services/orderService';
import productService from '@/services/productService';
import { verifyAuth, verifyAdmin } from '@/lib/auth-helpers';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized — please log in' }, { status: 401 });
        }

        if (user.role === 'admin') {
            const orders = await orderService.getAllOrders();
            return NextResponse.json(orders);
        }

        const orders = await orderService.getOrdersByUser(user.uid);
        return NextResponse.json(orders);

    } catch (error) {
        console.error('GET /api/orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized — please log in to checkout' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
        }

        const validPaymentMethods = ['card', 'paypal', 'cash_on_delivery'];
        if (!data.paymentMethod || !validPaymentMethods.includes(data.paymentMethod)) {
            return NextResponse.json({ error: 'Please select a valid payment method' }, { status: 400 });
        }

        for (const item of data.items) {
            if (!item.productId || !item.price || !item.title) {
                return NextResponse.json({ error: 'Invalid item in cart — missing required fields' }, { status: 400 });
            }
        }

        // Confirm each product is still available — someone else may have bought it
        for (const item of data.items) {
            const product = await productService.getById(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product "${item.title}" no longer exists` }, { status: 400 });
            }
            if (product.status !== 'available') {
                return NextResponse.json({ error: `"${item.title}" has already been sold` }, { status: 400 });
            }
        }

        // Recalculate server-side — never trust the total sent from the browser
        const totalAmount = data.items.reduce((sum, item) => sum + Number(item.price), 0);

        const orderData = {
            buyerId:       user.uid,
            buyerName:     user.name || data.buyerName,
            buyerEmail:    user.email,
            items:         data.items,
            totalAmount,
            paymentMethod: data.paymentMethod
        };

        const order = await orderService.createOrder(orderData);
        return NextResponse.json(order, { status: 201 });

    } catch (error) {
        console.error('POST /api/orders error:', error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}
