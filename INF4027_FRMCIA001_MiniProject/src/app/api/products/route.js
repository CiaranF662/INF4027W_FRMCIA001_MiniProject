// src/app/api/products/route.js
// GET  /api/products  → list products (public, filter via query params)
// POST /api/products  → create a new product (admin only)

import { NextResponse } from 'next/server';
import productService from '@/services/productService';
import { verifyAdmin } from '@/lib/auth-helpers';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = {
            category:  searchParams.get('category'),
            brand:     searchParams.get('brand'),
            condition: searchParams.get('condition'),
            gender:    searchParams.get('gender'),
            fit:       searchParams.get('fit'),
            rise:      searchParams.get('rise'),
            wash:      searchParams.get('wash'),
            stretch:   searchParams.get('stretch'),
            size:      searchParams.get('size'),
            colour:    searchParams.get('colour'),
            search:    searchParams.get('search'),
            minPrice:  searchParams.get('minPrice'),
            maxPrice:  searchParams.get('maxPrice'),
            sortBy:    searchParams.get('sortBy') || 'newest',
            onSale:    searchParams.get('onSale'),
            adminView: searchParams.get('adminView') === 'true'
        };

        const products = await productService.getProducts(filters);
        return NextResponse.json(products);

    } catch (error) {
        console.error('GET /api/products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 401 });
        }

        const data = await request.json();

        const requiredFields = ['title', 'description', 'category', 'brand', 'size', 'condition', 'colour', 'gender', 'price', 'images'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        if (isNaN(data.price) || Number(data.price) <= 0) {
            return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
        }

        const productData = {
            title:       data.title.trim(),
            description: data.description.trim(),
            category:    data.category,
            brand:       data.brand.trim(),
            size:        data.size,
            condition:   data.condition,
            colour:      data.colour,
            gender:      data.gender,
            fit:         data.fit || '',
            rise:        data.rise || '',
            wash:        data.wash || '',
            weight:      data.weight || '',
            stretch:     data.stretch || '',
            selvedge:    data.selvedge || false,
            distressing: data.distressing || '',
            era:         data.era || '',
            style:       data.style || '',
            tags:         Array.isArray(data.tags) ? data.tags : [],
            price:        Number(data.price),
            originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
            costPrice:    data.costPrice ? Number(data.costPrice) : null,
            images:       Array.isArray(data.images) ? data.images : [data.images],
            // server-controlled fields
            sellerId:       'admin',
            sellerName:     'Denim Revibe',
            sellerLocation: 'South Africa',
            views:  0,
            status: 'available'
        };

        const product = await productService.create(productData);
        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        console.error('POST /api/products error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
