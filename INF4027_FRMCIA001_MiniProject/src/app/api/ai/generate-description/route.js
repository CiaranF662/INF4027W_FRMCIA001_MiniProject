// src/app/api/ai/generate-description/route.js

import { verifyAdmin } from '@/lib/auth-helpers';
import aiService from '@/services/aiService';

/**
 * POST /api/ai/generate-description
 * 
 * Body: { "title": "Levi's 501", "brand": "Levi's", "category": "Jeans", ... }
 * Returns: { "description": "A beautifully worn-in pair of..." }
 * 
 * This route is ADMIN-ONLY — only admins create/edit products.
 * verifyAdmin() checks the Authorization header for a valid Firebase token
 * AND confirms the user has role: "admin" in Firestore.
 */
export async function POST(request) {
    try {
        // 1. Verify the request is from an authenticated admin
        //    This returns the admin user object, or null if not authorized.
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // 2. Extract the product details from the request body
        //    These come from whatever the admin has filled in on the form so far.
        const productDetails = await request.json();

        // 3. Call AIService to generate a description.
        //    The service builds a prompt with these details and sends it to Gemini.
        const description = await aiService.generateProductDescription(productDetails);

        // 4. Return the generated description
        return Response.json({ description });

    } catch (error) {
        console.error('AI description error:', error);
        return Response.json({ error: 'Failed to generate description' }, { status: 500 });
    }
}
