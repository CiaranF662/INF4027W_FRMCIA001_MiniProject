// src/app/api/products/[id]/view/route.js
//
// POST /api/products/[id]/view
//
// Called every time a product detail page is opened.
// Increments the product's view count by 1.
// Public — no login required (guests can view products too).

import { NextResponse } from 'next/server';
import productService from '@/services/productService';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        await productService.incrementViews(id);
        return NextResponse.json({ message: 'View recorded' });

    } catch (error) {
        console.error('POST /api/products/[id]/view error:', error);
        return NextResponse.json(
            { error: 'Failed to record view' },
            { status: 500 }
        );
    }
}