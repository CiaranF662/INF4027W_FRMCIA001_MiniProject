// src/app/api/products/route.js
//
// Handles requests to /api/products
// GET  /api/products        → list products (public, with optional filters)
// POST /api/products        → create a new product (admin only)

import { NextResponse } from 'next/server';
import productService from '@/services/productService';
import { verifyAuth, verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/products
 *
 * Public endpoint — no login required.
 * Reads filter and sort options from the URL query string and returns
 * a filtered, sorted list of products.
 *
 * Example URL: /api/products?category=Jeans&fit=Slim&sortBy=price_asc
 */
export async function GET(request) {
    try {
        // Extract query parameters from the URL
        // e.g. /api/products?category=Jeans&minPrice=100 gives us these values
        const { searchParams } = new URL(request.url);

        // Build a filters object from whatever query params were sent
        // If a param wasn't included in the URL it will be null — the service ignores null values
        const filters = {
            category: searchParams.get('category'),
            brand: searchParams.get('brand'),
            condition: searchParams.get('condition'),
            gender: searchParams.get('gender'),
            fit: searchParams.get('fit'),
            rise: searchParams.get('rise'),
            wash: searchParams.get('wash'),
            stretch: searchParams.get('stretch'),
            size: searchParams.get('size'),
            colour: searchParams.get('colour'),
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
            sortBy: searchParams.get('sortBy') || 'newest',
            // onSale=true filters to only products with a genuine discount (originalPrice > price)
            onSale: searchParams.get('onSale'),
            // If request comes from admin panel, show all products including sold/removed
            adminView: searchParams.get('adminView') === 'true'
        };

        const products = await productService.getProducts(filters);

        return NextResponse.json(products);

    } catch (error) {
        console.error('GET /api/products error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/products
 *
 * Admin only — creates a new product listing.
 * Validates all required fields before writing to Firestore.
 */
export async function POST(request) {
    try {
        // Step 1: Verify the request comes from a logged-in admin
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        // Step 2: Read the request body (the product data sent from the form)
        const data = await request.json();

        // Step 3: Validate required fields
        // These fields must be present — without them the product is incomplete
        const requiredFields = [
            'title', 'description', 'category', 'brand',
            'size', 'condition', 'colour', 'gender', 'price', 'images'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Step 4: Validate that price is a positive number
        if (isNaN(data.price) || Number(data.price) <= 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        // Step 5: Build the product object with safe, controlled values
        // We set certain fields ourselves rather than trusting the client
        const productData = {
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category,
            brand: data.brand.trim(),
            size: data.size,
            condition: data.condition,
            colour: data.colour,
            gender: data.gender,
            // Denim-specific fields (optional — default to empty string if not provided)
            fit: data.fit || '',
            rise: data.rise || '',
            wash: data.wash || '',
            weight: data.weight || '',
            stretch: data.stretch || '',
            selvedge: data.selvedge || false,
            distressing: data.distressing || '',
            era: data.era || '',
            style: data.style || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            price: Number(data.price),
            originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
            costPrice: data.costPrice ? Number(data.costPrice) : null,
            images: Array.isArray(data.images) ? data.images : [data.images],
            // These are set by the server — client cannot fake them
            sellerId: 'admin',
            sellerName: 'Denim Revibe',
            sellerLocation: 'South Africa',
            views: 0,
            status: 'available'
        };

        // Step 6: Create the product in Firestore via the service
        const product = await productService.create(productData);

        // 201 Created — the standard HTTP status for a successful resource creation
        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        console.error('POST /api/products error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}