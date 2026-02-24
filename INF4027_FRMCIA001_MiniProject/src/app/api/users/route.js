// src/app/api/users/route.js
//
// Handles requests to /api/users
// GET  /api/users  → list all users (admin only)
// POST /api/users  → create a new user account (public — called on signup)

import { NextResponse } from 'next/server';
import userService from '@/services/userService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/users
 *
 * Admin only — returns every registered user on the platform.
 * Used by the admin users table.
 */
export async function GET(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const users = await userService.getAllUsers();
        return NextResponse.json(users);

    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users
 *
 * Public endpoint — called immediately after Firebase Auth creates
 * a new account during signup.
 *
 * Flow:
 *   1. Signup form submits email + password to Firebase Auth directly
 *   2. Firebase Auth creates the account and returns a UID + token
 *   3. The signup page then calls POST /api/users to create the
 *      Firestore profile document for that new user
 *
 * Why two steps? Firebase Auth handles passwords — we never touch them.
 * Firestore stores everything else (name, location, role, wishlist).
 */
export async function POST(request) {
    try {
        // The new user is already authenticated — Firebase Auth just created them
        // We verify their token to get the UID
        const { verifyAuth } = await import('@/lib/auth-helpers');
        const authUser = await verifyAuth(request);

        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized — valid token required' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate required signup fields
        if (!data.name || !data.name.trim()) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        if (!data.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if a Firestore profile already exists for this UID
        // Prevents creating duplicate profiles if the request is sent twice
        const existing = await userService.getById(authUser.uid);
        if (existing) {
            return NextResponse.json(existing);
        }

        // Create the Firestore user document using their Firebase Auth UID
        const user = await userService.createUser(authUser.uid, {
            name: data.name.trim(),
            email: data.email,
            location: data.location?.trim() || ''
        });

        return NextResponse.json(user, { status: 201 });

    } catch (error) {
        console.error('POST /api/users error:', error);
        return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
        );
    }
}