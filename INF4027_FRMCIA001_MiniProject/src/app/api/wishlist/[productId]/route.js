// src/app/api/wishlist/[productId]/route.js
//
// Handles requests to /api/wishlist/:productId
// POST   /api/wishlist/abc123  → add product to wishlist
// DELETE /api/wishlist/abc123  → remove product from wishlist

import { NextResponse } from 'next/server';
import userService from '@/services/userService';
import productService from '@/services/productService';
import { verifyAuth } from '@/lib/auth-helpers';

/**
 * POST /api/wishlist/[productId]
 *
 * Adds a product to the logged-in customer's wishlist.
 * Called when the customer clicks the heart icon on a product.
 */
export async function POST(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        const { productId } = await params;

        // Confirm the product actually exists before adding it to the wishlist
        const product = await productService.getById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Add to wishlist via service — uses Firestore arrayUnion so no duplicates
        await userService.addToWishlist(user.uid, productId);

        return NextResponse.json({ message: 'Added to wishlist' });

    } catch (error) {
        console.error('POST /api/wishlist/[productId] error:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wishlist/[productId]
 *
 * Removes a product from the logged-in customer's wishlist.
 * Called when the customer clicks the heart icon on an already-saved product,
 * or clicks "Remove" on the wishlist page.
 */
export async function DELETE(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        const { productId } = await params;

        // Remove from wishlist via service — uses Firestore arrayRemove
        await userService.removeFromWishlist(user.uid, productId);

        return NextResponse.json({ message: 'Removed from wishlist' });

    } catch (error) {
        console.error('DELETE /api/wishlist/[productId] error:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}