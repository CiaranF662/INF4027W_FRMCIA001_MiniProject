// src/app/api/ai/insights/route.js

import { verifyAdmin } from '@/lib/auth-helpers';
import aiService from '@/services/aiService';
import reportService from '@/services/reportService';

/**
 * GET /api/ai/insights?type=financial
 * GET /api/ai/insights?type=products
 * GET /api/ai/insights?type=customers
 * 
 * Returns: { "insights": "• Revenue grew 23%...\n• Levi's is your top brand..." }
 * 
 * ADMIN-ONLY — reports are sensitive business data.
 * 
 * This route is interesting because it chains two services together:
 * 1. ReportService fetches the raw data from Firestore
 * 2. AIService analyzes that data with Gemini
 */
export async function GET(request) {
    try {
        // 1. Admin auth check
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // 2. Read the report type from the URL query string
        //    e.g. /api/ai/insights?type=financial → reportType = "financial"
        const { searchParams } = new URL(request.url);
        const reportType = searchParams.get('type') || 'financial';

        // 3. Fetch the actual report data from Firestore via ReportService.
        //    This is the SAME data shown on the admin reports pages —
        //    we're just also sending it to Gemini for analysis.
        let reportData;
        switch (reportType) {
            case 'financial':
                reportData = await reportService.getFinancialReport();
                break;
            case 'products':
                reportData = await reportService.getProductReport();
                break;
            case 'customers':
                reportData = await reportService.getCustomerReport();
                break;
            default:
                return Response.json({ error: 'Invalid report type' }, { status: 400 });
        }

        // 4. Send the report data to AIService for analysis.
        //    Gemini sees the raw numbers and generates human-readable insights.
        const insights = await aiService.generateReportInsights(reportType, reportData);

        // 5. Return the insights as a text string
        return Response.json({ insights });

    } catch (error) {
        console.error('AI insights error:', error);
        return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
    }
}
