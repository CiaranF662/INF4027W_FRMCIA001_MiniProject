// src/app/api/orders/[id]/route.js
//
// Handles requests to /api/orders/:id
// GET /api/orders/abc123  → get one specific order

import { NextResponse } from 'next/server';
import orderService from '@/services/orderService';
import { verifyAuth } from '@/lib/auth-helpers';

/**
 * GET /api/orders/[id]
 *
 * Returns a single order by its ID.
 *
 * Security rule:
 *   - Admin can fetch any order
 *   - Customer can only fetch their own orders
 *   - If a customer tries to fetch someone else's order → 403 Forbidden
 *
 * Used by the order confirmation page and order detail view.
 */
export async function GET(request, { params }) {
    try {
        // Must be logged in
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const order = await orderService.getById(id);

        // Order does not exist
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Customer trying to view someone else's order
        // order.buyerId must match the logged-in user's UID
        // Admin bypasses this check
        if (user.role !== 'admin' && order.buyerId !== user.uid) {
            return NextResponse.json(
                { error: 'Forbidden — this is not your order' },
                { status: 403 }  // 403 Forbidden — you are logged in but not allowed
            );
        }

        return NextResponse.json(order);

    } catch (error) {
        console.error('GET /api/orders/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}