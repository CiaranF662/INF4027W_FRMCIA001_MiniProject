// src/app/api/categories/route.js
//                                                                                                                                                                           
// Handles requests to /api/categories
// GET  /api/categories  → list all categories (public)
// POST /api/categories  → create a new category (admin only)

import { NextResponse } from 'next/server';
import categoryService from '@/services/categoryService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/categories
 *
 * Public endpoint — returns all denim categories sorted A-Z.
 * Used to populate:
 *   - The filter sidebar on the browse page
 *   - The category grid on the homepage
 *   - The category dropdown on the admin add product form
 */
export async function GET() {
    try {
        const categories = await categoryService.getAllSorted();
        return NextResponse.json(categories);

    } catch (error) {
        console.error('GET /api/categories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/categories
 *
 * Admin only — creates a new category.
 * Rejects duplicate category names via categoryService.createCategory().
 */
export async function POST(request) {
    try {
        // Step 1: Verify admin access
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        // Step 2: Read the request body
        const data = await request.json();

        // Step 3: Validate required fields
        if (!data.name || !data.name.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Step 4: Create via service — this also checks for duplicate names
        // If a category with this name already exists, the service throws an error
        const category = await categoryService.createCategory({
            name: data.name.trim(),
            description: data.description?.trim() || ''
        });

        return NextResponse.json(category, { status: 201 });

    } catch (error) {
        // The service throws a specific error message for duplicate names
        // We send that message directly back so the admin form can display it
        if (error.message.includes('already exists')) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }  // 409 Conflict — the resource already exists
            );
        }

        console.error('POST /api/categories error:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}