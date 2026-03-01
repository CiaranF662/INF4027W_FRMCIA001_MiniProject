// src/app/api/ai/analyse-product/route.js
//
// POST /api/ai/analyse-product
//
// Admin-only. Accepts a public image URL + optional product context (title, brand, category).
// Passes the image to Gemini Vision and returns structured denim attributes + a description.
//
// Body:   { imageUrl, title?, brand?, category? }
// Returns: { condition, colour, fit, rise, wash, era, description }

import { verifyAdmin } from '@/lib/auth-helpers';
import aiService from '@/services/aiService';
import categoryService from '@/services/categoryService';

export async function POST(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { imageUrl, ...productDetails } = body;

        if (!imageUrl) {
            return Response.json({ error: 'imageUrl is required' }, { status: 400 });
        }

        const categories = await categoryService.getAllSorted();
        const result = await aiService.analyseProductImage(imageUrl, productDetails, categories);
        return Response.json(result);

    } catch (error) {
        console.error('AI analyse-product error:', error);
        return Response.json({ error: 'Failed to analyse image' }, { status: 500 });
    }
}
