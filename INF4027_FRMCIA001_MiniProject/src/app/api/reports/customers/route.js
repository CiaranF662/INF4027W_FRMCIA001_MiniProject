// src/app/api/reports/customers/route.js
//
// GET /api/reports/customers → returns all customer report data (admin only)

import { NextResponse } from 'next/server';
import reportService from '@/services/reportService';
import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * GET /api/reports/customers
 *
 * Admin only — returns aggregated customer data for the customer report page.
 *
 * Returns:
 *   totalCustomers      → total registered customers
 *   totalOrders         → total orders placed
 *   topBuyers           → customers ranked by total spend
 *   customerLocations   → data for the locations chart
 *   newCustomersByMonth → data for the growth line chart
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

        const report = await reportService.getCustomerReport();
        return NextResponse.json(report);

    } catch (error) {
        console.error('GET /api/reports/customers error:', error);
        return NextResponse.json(
            { error: 'Failed to generate customer report' },
            { status: 500 }
        );
    }
}