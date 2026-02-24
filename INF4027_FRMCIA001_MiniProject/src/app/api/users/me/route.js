// src/app/api/users/me/route.js                                                                                                                                             
//                                                                                                                                                                           
// Handles requests to /api/users/me                                                                                                                                         
// GET /api/users/me  → get the logged-in user's own profile
// PUT /api/users/me  → update the logged-in user's own profile

import { NextResponse } from 'next/server';
import userService from '@/services/userService';
import { verifyAuth } from '@/lib/auth-helpers';

/**
 * GET /api/users/me
 *
 * Returns the profile of whoever is currently logged in.
 * Used by the account dashboard and profile edit page.
 *
 * The "me" in the URL means "the currently logged-in user".
 * The server figures out who that is from their auth token —
 * the client never needs to send a user ID explicitly.
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

        // user.uid comes from the verified Firebase token
        const profile = await userService.getById(user.uid);

        if (!profile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(profile);

    } catch (error) {
        console.error('GET /api/users/me error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/me
 *
 * Updates the logged-in user's profile.
 * Used by the "Edit Profile" page in the customer dashboard.
 *
 * Customers can update: name, location, sizeProfile
 * Customers CANNOT update: role, email, wishlist (those have their own endpoints)
 * The service enforces this — the allowedFields list inside updateProfile()
 * silently ignores any other fields sent in the request.
 */
export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate name if provided — cannot be set to an empty string
        if (data.name !== undefined && !data.name.trim()) {
            return NextResponse.json(
                { error: 'Name cannot be empty' },
                { status: 400 }
            );
        }

        // Validate sizeProfile fields if provided
        if (data.sizeProfile !== undefined) {
            if (typeof data.sizeProfile !== 'object') {
                return NextResponse.json(
                    { error: 'Invalid size profile format' },
                    { status: 400 }
                );
            }
        }

        const updated = await userService.updateProfile(user.uid, data);

        return NextResponse.json(updated);

    } catch (error) {
        console.error('PUT /api/users/me error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}