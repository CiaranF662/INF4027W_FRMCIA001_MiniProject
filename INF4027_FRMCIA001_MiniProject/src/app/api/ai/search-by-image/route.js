// src/app/api/ai/search-by-image/route.js
// POST /api/ai/search-by-image
// Public. Accepts a FormData file upload, runs it through Gemini Vision,
// and returns filter params that can be applied to the products page.

import { NextResponse } from 'next/server';
import aiService from '@/services/aiService';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = file.type || 'image/jpeg';

        const filters = await aiService.searchByImage(base64, mimeType);
        return NextResponse.json({ filters });

    } catch (error) {
        console.error('Image search error:', error);
        return NextResponse.json({ error: 'Failed to analyse image' }, { status: 500 });
    }
}
