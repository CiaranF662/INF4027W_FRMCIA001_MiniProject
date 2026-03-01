// src/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

    // Parses a plain-English search query into structured filter params
    async parseSearchQuery(userQuery, categories = []) {
        const categoryList = categories.length
            ? categories.map(c => c.name).join(', ')
            : 'Jeans, Jackets, Shorts, Skirts, Overalls & Dungarees, Denim Shirts, Denim Accessories, Jorts';
        const prompt = `You are a search query parser for a South African second-hand denim marketplace called Denim Revibe.

Your job: extract structured filters from a natural language search query.

Return ONLY valid JSON (no markdown, no backticks, no explanation). Use only these fields (omit any that are not mentioned or implied):
{
  "category": "one of: ${categoryList}",
  "gender": "one of: Men, Women, Unisex — use this if the user says mens, womens, ladies, guys, unisex, etc.",
  "colour": "one of: Blue, Dark Indigo, Black, White, Grey, Green, Olive, Beige / Tan, Brown, Pink, Red, Burgundy, Purple, Orange, Yellow, Multi / Pattern — only if a colour is mentioned or clearly implied. 'blue jeans' or 'navy' → Blue. 'indigo' or 'dark indigo' or 'dark denim' → Dark Indigo. 'white jeans' → White. 'khaki' or 'sand' → Beige / Tan.",
  "brand": "brand name if mentioned (e.g. Levi's, Wrangler, Diesel, Guess, Mr Price)",
  "minPrice": number or null,
  "maxPrice": number or null,
  "size": "size if mentioned (e.g. 32, M, L, W34, 28, XL)",
  "condition": "one of: New with Tags, Like New, Good, Fair — only if explicitly mentioned",
  "fit": "one of: Skinny, Slim, Straight, Relaxed, Bootcut, Wide Leg, Mom, Boyfriend, Flare, Baggy — only if mentioned",
  "wash": "one of: Raw/Unwashed, Dark, Medium, Light, Acid, Distressed, Stone Wash — only if the washing/finish treatment is mentioned (e.g. 'acid wash', 'raw denim', 'distressed')",
  "onSale": "true — only if the user mentions sale, deals, discounts, or bargains",
  "sortBy": "one of: newest, price-asc, price-desc, discount, views — only if sorting is implied (e.g. 'cheapest' = price-asc, 'newest' = newest, 'most popular' = views)",
  "search": "any remaining keywords that don't fit the above filters"
}

Important rules:
- "mens jeans" → gender: "Men", category: "Jeans"
- "womens jackets" → gender: "Women", category: "Jackets"
- "blue jeans" or "navy jeans" or "indigo jeans" → colour: "Blue", category: "Jeans"
- "green jeans" → colour: "Green", category: "Jeans"
- "black jeans" → colour: "Black", category: "Jeans"
- "under R500" or "below 500" → maxPrice: 500
- "over R200" or "above 200" → minPrice: 200
- "on sale" or "deals" → onSale: "true"
- "cheapest" or "lowest price" → sortBy: "price-asc"
- "dark wash" → wash: "Dark" (this is a wash treatment, NOT a colour)
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

    // Generates a listing description from the product's known details
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

    // Sends the image to Gemini and returns structured denim attributes + a description
    async analyseProductImage(imageUrl, productDetails, categories = []) {
        const { title, brand, category } = productDetails;
        const categoryList = categories.length
            ? categories.map(c => c.name).join(' | ')
            : 'Jeans | Jackets | Shorts | Skirts | Overalls & Dungarees | Denim Shirts | Denim Accessories | Jorts';

        // Fetch the image server-side and convert to base64 for the Gemini multimodal API
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) throw new Error('Could not fetch image from URL');
        const imageBuffer = await imageResp.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

        const prompt = `Analyse this denim garment image. Return ONLY valid JSON — no markdown, no code block, no explanation.

{
  "condition": "one of: New with Tags | Like New | Good | Fair",
  "colour": "one of: Blue | Dark Indigo | Black | White | Grey | Green | Olive | Beige / Tan | Brown | Pink | Red | Burgundy | Purple | Orange | Yellow | Multi / Pattern — pick the closest hue. Classic blue denim → Blue. Very dark/raw indigo denim → Dark Indigo.",
  "fit": "one of: Skinny | Slim | Straight | Relaxed | Bootcut | Wide Leg | Mom | Boyfriend | Flare | Baggy — or null if unclear",
  "rise": "one of: Low Rise | Mid Rise | High Rise — or null if unclear",
  "wash": "one of: Raw/Unwashed | Dark | Medium | Light | Acid | Distressed | Stone Wash — or null if unclear",
  "era": "one of: Vintage 70s | Vintage 80s | Vintage 90s | Y2K | Modern — or null if unclear",
  "category": "one of: ${categoryList} — dungarees/bibs count as Overalls & Dungarees",
  "gender": "one of: Men | Women | Unisex — or null if genuinely unclear",
  "style": "one of: Vintage | Streetwear | Classic | Workwear | Designer | Casual — or null if unclear",
  "tags": ["3 to 4 specific lowercase descriptive tags, e.g. selvedge, wide-leg, acid-wash, y2k, bootcut, distressed — based on what you can see"],
  "description": "2-3 sentences, authentic South African English, casual-premium tone. Do not include price or title."
}

Product context — Title: ${title || 'Unknown'}, Brand: ${brand || 'Unknown'}, Category: ${category || 'Denim'}`;

        const MAX_RETRIES = 3;
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const result = await this.model.generateContent([
                    { inlineData: { data: base64Image, mimeType } },
                    { text: prompt },
                ]);
                const text = result.response.text();
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleaned);
            } catch (err) {
                lastError = err;
                const is429 = err?.status === 429 || err?.message?.includes('429');
                if (!is429 || attempt === MAX_RETRIES - 1) throw err;
                await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
            }
        }
        throw lastError;
    }

    // Summarises a report into 3-4 actionable bullet points
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
