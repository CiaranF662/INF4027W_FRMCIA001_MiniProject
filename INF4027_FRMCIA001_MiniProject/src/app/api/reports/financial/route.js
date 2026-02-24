// src/app/api/reports/financial/route.js                                                                                                                                    
//                                                                                                                                                                           
// GET /api/reports/financial → returns all financial report data (admin only)                                                                                               

import { NextResponse } from 'next/server';
import reportService from '@/services/reportService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/reports/financial
 *
 * Admin only — returns aggregated financial data for the financial report page.
 *
 * Returns:
 *   totalRevenue, totalCost, totalProfit, averageOrderValue, totalOrders
 *   revenueByMonth    → data for the line chart
 *   revenueByCategory → data for the bar chart
 *   revenueByPayment  → data for the pie chart
 */
export async function GET(request) {
    try {
        // Financial data is sensitive — admin only
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized — admin access required' },
                { status: 401 }
            );
        }

        const report = await reportService.getFinancialReport();
        return NextResponse.json(report);

    } catch (error) {
        console.error('GET /api/reports/financial error:', error);
        return NextResponse.json(
            { error: 'Failed to generate financial report' },
            { status: 500 }
        );
    }
}