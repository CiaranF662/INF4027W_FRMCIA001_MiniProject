// src/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
    constructor() {
        // gemini-1.5-flash: widely available on free tier (15 RPM, 1500 RPD)
        // gemini-2.0-flash-lite: best free tier option — 1500 RPD, 30 RPM
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    }

    /**
     * Private helper — wraps the Gemini API call with retry + exponential backoff.
     * Retries up to 3 times on 429 (rate limit) errors, waiting 2s → 4s → 8s.
     */
    async _generate(prompt) {
        const MAX_RETRIES = 3;
        let lastError;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const result = await this.model.generateContent(prompt);
                return result.response.text();
            } catch (err) {
                lastError = err;
                const is429 = err?.status === 429 || err?.message?.includes('429');
                if (!is429 || attempt === MAX_RETRIES - 1) throw err;

                // Exponential backoff: 2s, 4s, 8s
                const wait = Math.pow(2, attempt + 1) * 1000;
                console.warn(`Gemini rate limited, retrying in ${wait / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
        throw lastError;
    }

    /**
     * FEATURE 1: Natural Language Search
     * Parses a plain-English query into structured filter parameters.
     */
    async parseSearchQuery(userQuery) {
        const prompt = `You are a search query parser for a South African second-hand denim marketplace called Denim Revibe.

Your job: extract structured filters from a natural language search query.

Return ONLY valid JSON (no markdown, no backticks, no explanation). Use only these fields (omit any that are not mentioned or implied):
{
  "category": "one of: Jeans, Jackets, Shorts, Skirts, Overalls, Shirts, Accessories",
  "gender": "one of: Men, Women, Unisex — use this if the user says mens, womens, ladies, guys, unisex, etc.",
  "brand": "brand name if mentioned (e.g. Levi's, Wrangler, Diesel, Guess, Mr Price)",
  "minPrice": number or null,
  "maxPrice": number or null,
  "size": "size if mentioned (e.g. 32, M, L, W34, 28, XL)",
  "condition": "one of: New with Tags, Like New, Good, Fair — only if explicitly mentioned",
  "fit": "one of: Skinny, Slim, Straight, Relaxed, Bootcut, Wide Leg, Mom, Boyfriend, Flare, Baggy — only if mentioned",
  "wash": "one of: Raw/Unwashed, Dark, Medium, Light, Acid, Distressed, Stone Wash — only if mentioned",
  "onSale": "true — only if the user mentions sale, deals, discounts, or bargains",
  "sortBy": "one of: newest, price-asc, price-desc, discount, views — only if sorting is implied (e.g. 'cheapest' = price-asc, 'newest' = newest, 'most popular' = views)",
  "search": "any remaining keywords that don't fit the above filters"
}

Important rules:
- "mens jeans" → gender: "Men", category: "Jeans"
- "womens jackets" → gender: "Women", category: "Jackets"
- "under R500" or "below 500" → maxPrice: 500
- "over R200" or "above 200" → minPrice: 200
- "on sale" or "deals" → onSale: "true"
- "cheapest" or "lowest price" → sortBy: "price-asc"
- "dark wash" → wash: "Dark"
- "relaxed fit" → fit: "Relaxed"
- If the user just says "jeans", only set category. Don't add gender unless specified.
- South African Rands use "R" prefix (R500 = 500)

User query: "${userQuery}"`;

        const text = await this._generate(prompt);
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            return JSON.parse(cleaned);
        } catch {
            return { search: userQuery };
        }
    }

    /**
     * FEATURE 2: Product Description Generator
     * Writes a compelling listing description from product details.
     */
    async generateProductDescription(productDetails) {
        const { title, brand, category, condition, size, colour, fit } = productDetails;

        const prompt = `You are a copywriter for Denim Revibe, a South African second-hand denim marketplace.

Write a short, authentic product listing description (2-3 sentences max).
- Mention the condition honestly
- Highlight what makes this piece desirable
- Keep the tone casual but premium — think vintage shop, not corporate
- Use South African English naturally
- Do NOT include the price or title — those are shown separately

Product details:
Title: ${title || 'Not provided'}
Brand: ${brand || 'Not provided'}
Category: ${category || 'Not provided'}
Condition: ${condition || 'Not provided'}
Size: ${size || 'Not provided'}
Color/Wash: ${colour || 'Not provided'}
Fit: ${fit || 'Not provided'}`;

        return await this._generate(prompt);
    }

    /**
     * FEATURE 3: Report Insights (on-demand only)
     * Analyzes report data and returns actionable business insights.
     */
    async generateReportInsights(reportType, reportData) {
        // Trim large arrays to reduce token usage and avoid hitting limits
        const trimmed = { ...reportData };
        for (const key of Object.keys(trimmed)) {
            if (Array.isArray(trimmed[key]) && trimmed[key].length > 10) {
                trimmed[key] = trimmed[key].slice(0, 10);
            }
        }

        const prompt = `You are a business analyst for Denim Revibe, a South African second-hand denim marketplace.

Analyze this ${reportType} report data and provide exactly 3-4 key actionable insights.
Format as bullet points starting with •. Keep each insight to one sentence.
Be specific — reference actual numbers, brands, categories, or trends from the data.
Focus on what the store owner should DO based on this data.
Use South African Rands (R) for currency.

Report data:
${JSON.stringify(trimmed, null, 2)}`;

        return await this._generate(prompt);
    }
}

export default new AIService();
