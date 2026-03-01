// src/app/api/categories/route.js
// GET  /api/categories  → list all categories A-Z (public)
// POST /api/categories  → create a category (admin only)

import { NextResponse } from 'next/server';
import categoryService from '@/services/categoryService';
import { verifyAdmin } from '@/lib/auth-helpers';

export async function GET() {
    try {
        const categories = await categoryService.getAllSorted();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('GET /api/categories error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.name || !data.name.trim()) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const category = await categoryService.createCategory({
            name: data.name.trim(),
            description: data.description?.trim() || ''
        });

        return NextResponse.json(category, { status: 201 });

    } catch (error) {
        // Service throws a descriptive message for duplicate names — pass it through
        if (error.message.includes('already exists')) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        console.error('POST /api/categories error:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
