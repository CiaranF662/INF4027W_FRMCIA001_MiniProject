// src/app/api/categories/[id]/route.js
//
// Handles requests to /api/categories/:id
// PUT    /api/categories/abc123  → update a category (admin only)
// DELETE /api/categories/abc123  → delete a category (admin only)

import { NextResponse } from 'next/server';
import categoryService from '@/services/categoryService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * PUT /api/categories/[id]
 *
 * Admin only — updates a category's name or description.
 */
export async function PUT(request, { params }) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const data = await request.json();

        // Confirm the category exists before updating
        const existing = await categoryService.getById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Validate the new name if one was provided
        if (data.name !== undefined && !data.name.trim()) {
            return NextResponse.json(
                { error: 'Category name cannot be empty' },
                { status: 400 }
            );
        }

        const updated = await categoryService.update(id, {
            name: data.name?.trim(),
            description: data.description?.trim()
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error('PUT /api/categories/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/categories/[id]
 *
 * Admin only — permanently removes a category.
 *
 * NOTE: This does not automatically update products that use this category.
 * In a production app you would either block deletion if products use the
 * category, or reassign those products to "Uncategorised" first.
 * For this project, the admin is responsible for managing this manually.
 */
export async function DELETE(request, { params }) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Confirm the category exists before deleting
        const existing = await categoryService.getById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        await categoryService.delete(id);

        return NextResponse.json({ message: 'Category deleted successfully' });

    } catch (error) {
        console.error('DELETE /api/categories/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}