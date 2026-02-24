// src/app/api/wishlist/route.js
//
// GET /api/wishlist → get the logged-in customer's full wishlist with product details

import { NextResponse } from 'next/server';
import userService from '@/services/userService';
import productService from '@/services/productService';
import { verifyAuth } from '@/lib/auth-helpers';

/**
 * GET /api/wishlist
 *
 * Returns the logged-in customer's wishlist as full product objects —
 * not just an array of IDs, but the complete product data for each saved item.
 *
 * The wishlist stored on the user document is just an array of product IDs:
 *   wishlist: ["productId_1", "productId_2", "productId_3"]
 *
 * This route fetches the full product data for each ID so the
 * wishlist page can render product cards with images, prices, and attributes.
 */
export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        // Fetch the user's profile to get their wishlist array
        const profile = await userService.getById(user.uid);

        if (!profile || !profile.wishlist || profile.wishlist.length === 0) {
            // Return an empty array — not an error — if the wishlist is empty
            return NextResponse.json([]);
        }

        // Fetch the full product data for every ID in the wishlist
        // Promise.all runs all fetches simultaneously rather than one by one
        const productPromises = profile.wishlist.map(productId =>
            productService.getById(productId)
        );

        const products = await Promise.all(productPromises);

        // Filter out any nulls — a product might have been deleted since it was wishlisted
        const validProducts = products.filter(product => product !== null);

        return NextResponse.json(validProducts);

    } catch (error) {
        console.error('GET /api/wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}