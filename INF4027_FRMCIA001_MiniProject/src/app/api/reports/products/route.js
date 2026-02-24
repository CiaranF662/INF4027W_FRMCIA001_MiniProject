// src/app/api/reports/products/route.js
//
// GET /api/reports/products → returns all product report data (admin only)

import { NextResponse } from 'next/server';
import reportService from '@/services/reportService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/reports/products
 *
 * Admin only — returns aggregated product data for the product report page.
 *
 * Returns:
 *   mostViewed       → products ranked by view count
 *   bestSellingItems → products that appear most in orders
 *   salesByCategory  → data for the category bar chart
 *   salesByBrand     → data for the brand bar chart
 *   conditionBreakdown → data for the condition chart
 *   popularSizes     → data for the sizes chart
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

        const report = await reportService.getProductReport();
        return NextResponse.json(report);

    } catch (error) {
        console.error('GET /api/reports/products error:', error);
        return NextResponse.json(
            { error: 'Failed to generate product report' },
            { status: 500 }
        );
    }
}