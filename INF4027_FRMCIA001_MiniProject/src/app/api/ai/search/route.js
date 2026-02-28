// src/app/api/ai/search/route.js

import aiService from '@/services/aiService';
import categoryService from '@/services/categoryService';

/**
 * Basic keyword parser — used as a fallback when Gemini is unavailable
 * (rate limited, quota exhausted, etc.).
 * Handles the most common patterns without needing any AI.
 */
function parseBasicQuery(query) {
    const q = query.toLowerCase();
    const filters = {};

    // Gender
    if (/\b(mens?|men'?s?|guys?|male)\b/.test(q))         filters.gender = 'Men';
    else if (/\b(womens?|women'?s?|ladies|female|girl)\b/.test(q)) filters.gender = 'Women';

    // Category
    if      (/\bjackets?\b/.test(q))               filters.category = 'Jackets';
    else if (/\bshorts?\b/.test(q))                filters.category = 'Shorts';
    else if (/\bskirts?\b/.test(q))                filters.category = 'Skirts';
    else if (/\b(overalls?|dungarees?)\b/.test(q)) filters.category = 'Overalls';
    else if (/\bshirts?\b/.test(q))                filters.category = 'Shirts';
    else if (/\b(bag|hat|accessories?)\b/.test(q)) filters.category = 'Accessories';
    else if (/\bjeans?\b/.test(q))                 filters.category = 'Jeans';

    // Price
    const under = q.match(/(?:under|below|less than|max|<)\s*r?\s*(\d+)/);
    if (under) filters.maxPrice = Number(under[1]);
    const over = q.match(/(?:over|above|more than|min|>)\s*r?\s*(\d+)/);
    if (over) filters.minPrice = Number(over[1]);

    // Common brands
    const brands = ["levi's", "levis", "wrangler", "lee", "diesel", "g-star", "guess",
                    "mr price", "woolworths", "cotton on"];
    for (const brand of brands) {
        if (q.includes(brand)) { filters.brand = brand; break; }
    }

    // Size (e.g. "size 32", "w32", "32 waist")
    const size = q.match(/(?:size\s*|w)(\d{2})\b/);
    if (size) filters.size = size[1];

    return filters;
}

/**
 * POST /api/ai/search
 *
 * Tries Gemini first for smart natural-language parsing.
 * Falls back to basic keyword matching if Gemini is unavailable.
 *
 * Body: { "query": "relaxed fit Levi's under R500 size 32" }
 * Returns: { "filters": { ... }, "fallback": true/false }
 */
export async function POST(request) {
    const { query } = await request.json();

    if (!query?.trim()) {
        return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Try Gemini AI first
    try {
        const categories = await categoryService.getAllSorted();
        const filters = await aiService.parseSearchQuery(query, categories);
        return Response.json({ filters, fallback: false });
    } catch (error) {
        console.error('AI search error:', error);
        // Gemini unavailable — use basic keyword parser so search still works
        const filters = parseBasicQuery(query);
        return Response.json({ filters, fallback: true });
    }
}
