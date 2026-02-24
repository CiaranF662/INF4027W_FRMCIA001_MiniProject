// src/app/api/products/[id]/route.js
//
// Handles requests to /api/products/:id
// GET    /api/products/abc123   → get one product by ID (public)
// PUT    /api/products/abc123   → update a product (admin only)
// DELETE /api/products/abc123   → delete a product (admin only)

import { NextResponse } from 'next/server';
import productService from '@/services/productService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/products/[id]
 *
 * Public endpoint — returns a single product by its Firestore document ID.
 * Also used by the product detail page.
 *
 * The { params } argument is how Next.js passes the [id] value from the URL.
 * e.g. /api/products/abc123 → params.id === "abc123"
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const product = await productService.getById(id);

        // If no product was found with that ID return a 404
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);

    } catch (error) {
        console.error('GET /api/products/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/products/[id]
 *
 * Admin only — updates an existing product's fields.
 * Only the fields included in the request body are changed.
 */
export async function PUT(request, { params }) {
    try {
        // Verify admin access
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const data = await request.json();

        // Confirm the product exists before trying to update it
        const existing = await productService.getById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate price if it was included in the update
        if (data.price !== undefined && (isNaN(data.price) || Number(data.price) <= 0)) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        // Update the product — only the fields provided in data will change
        const updated = await productService.update(id, data);

        return NextResponse.json(updated);

    } catch (error) {
        console.error('PUT /api/products/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/products/[id]
 *
 * Admin only — permanently removes a product from Firestore.
 */
export async function DELETE(request, { params }) {
    try {
        // Verify admin access
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Confirm the product exists before trying to delete it
        const existing = await productService.getById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        await productService.delete(id);

        // 200 with a message confirming deletion
        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('DELETE /api/products/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}