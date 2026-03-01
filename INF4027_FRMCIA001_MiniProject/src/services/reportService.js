// src/services/reportService.js                                                                                                                                             

import { adminDb } from '@/lib/firebaseAdmin';

// Aggregates across orders, products and users — does not extend FirestoreService.
class ReportService {

    // Revenue, profit, and payment breakdown — optionally scoped to a date range
    async getFinancialReport({ startDate, endDate } = {}) {
        // --- Build orders query — optionally scoped to a date range ---
        let ordersQuery = adminDb.collection('orders').orderBy('createdAt', 'asc');
        if (startDate) {
            ordersQuery = ordersQuery.where('createdAt', '>=', new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            ordersQuery = ordersQuery.where('createdAt', '<=', end);
        }

        const [ordersSnapshot, productsSnapshot] = await Promise.all([
            ordersQuery.get(),
            adminDb.collection('products').get()
        ]);

        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Build a lookup map: productId → product (for getting costPrice quickly)
        // Instead of searching the array every time, we use an object as a dictionary
        const productMap = {};
        productsSnapshot.docs.forEach(doc => {
            productMap[doc.id] = { id: doc.id, ...doc.data() };
        });

        // --- Calculate top-level totals ---
        let totalRevenue = 0;
        let totalCost = 0;

        // revenueByMonth tracks revenue grouped by "YYYY-MM" e.g. { "2026-01": 1500 }
        const revenueByMonth = {};

        // revenueByCategory tracks revenue grouped by denim category e.g. { "Jeans": 2400 }
        const revenueByCategory = {};

        // revenueByPayment tracks revenue by payment method e.g. { "card": 3200 }
        const revenueByPayment = {};

        // Loop through every order and every item inside each order
        for (const order of orders) {
            // Add this order's total to overall revenue
            totalRevenue += order.totalAmount || 0;

            // --- Revenue by month (for the line chart) ---
            // Convert Firestore timestamp to a JavaScript Date
            const orderDate = order.createdAt?.toDate
                ? order.createdAt.toDate()
                : new Date(order.createdAt);

            // Format as "2026-01" so orders in the same month group together
            const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.totalAmount;

            // --- Revenue by payment method (for the pie chart) ---
            const method = order.paymentMethod || 'unknown';
            revenueByPayment[method] = (revenueByPayment[method] || 0) + order.totalAmount;

            // --- Revenue by category + cost calculation (loops through each item) ---
            for (const item of order.items || []) {
                // Look up the full product to get its category and costPrice
                const product = productMap[item.productId];

                if (product) {
                    // Revenue by category (for the bar chart)
                    const category = product.category || 'Uncategorised';
                    revenueByCategory[category] = (revenueByCategory[category] || 0) + item.price;

                    // Add cost price to total cost (for profit calculation)
                    totalCost += product.costPrice || 0;
                }
            }
        }

        const totalProfit = totalRevenue - totalCost;
        const averageOrderValue = orders.length > 0
            ? Math.round(totalRevenue / orders.length)
            : 0;

        // --- Format data for Recharts ---
        // Recharts expects arrays of objects, not plain objects

        // Line chart: [{ month: "2026-01", revenue: 1500 }, ...]
        const revenueByMonthArray = Object.entries(revenueByMonth)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Bar chart: [{ category: "Jeans", revenue: 2400 }, ...]
        const revenueByCategoryArray = Object.entries(revenueByCategory)
            .map(([category, revenue]) => ({ category, revenue }))
            .sort((a, b) => b.revenue - a.revenue);

        // Pie chart: [{ method: "card", revenue: 3200 }, ...]
        const revenueByPaymentArray = Object.entries(revenueByPayment)
            .map(([method, revenue]) => ({ method, revenue }));

        return {
            totalRevenue,
            totalCost,
            totalProfit,
            averageOrderValue,
            totalOrders: orders.length,
            revenueByMonth: revenueByMonthArray,
            revenueByCategory: revenueByCategoryArray,
            revenueByPayment: revenueByPaymentArray
        };
    }

    // Sales and view counts per product, category, brand, condition and size
    async getProductReport() {
        const [ordersSnapshot, productsSnapshot] = await Promise.all([
            adminDb.collection('orders').get(),
            adminDb.collection('products').get()
        ]);

        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // --- Top-level inventory metrics ---
        const soldProducts = products.filter(p => p.status === 'sold');
        const totalListed = products.length;
        const totalSold = soldProducts.length;
        const sellThrough = totalListed > 0 ? Math.round((totalSold / totalListed) * 100) : 0;
        const avgSellingPrice = soldProducts.length > 0
            ? Math.round(soldProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / soldProducts.length)
            : 0;

        // --- Most Viewed Products ---
        // Sort all products by their view count, highest first
        const mostViewed = [...products]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10)
            .map(p => ({ id: p.id, title: p.title, brand: p.brand, views: p.views || 0 }));

        // --- Sales counts (loop through all order items) ---
        const itemSaleCount = {};   // productId → number of times sold
        const categorySales = {};   // category  → number of items sold
        const brandSales = {};      // brand     → number of items sold
        const conditionSales = {};  // condition → number of items sold
        const sizeSales = {};       // size      → number of items sold

        // Build a product lookup map for quick access
        const productMap = {};
        products.forEach(p => { productMap[p.id] = p; });

        for (const order of orders) {
            for (const item of order.items || []) {
                const product = productMap[item.productId];

                // Count how many times each product has been sold
                itemSaleCount[item.productId] = (itemSaleCount[item.productId] || 0) + 1;

                if (product) {
                    // Count sales per category
                    const cat = product.category || 'Uncategorised';
                    categorySales[cat] = (categorySales[cat] || 0) + 1;

                    // Count sales per brand
                    const brand = product.brand || 'Unbranded';
                    brandSales[brand] = (brandSales[brand] || 0) + 1;

                    // Count sales per condition
                    const condition = product.condition || 'Unknown';
                    conditionSales[condition] = (conditionSales[condition] || 0) + 1;

                    // Count sales per size
                    const size = product.size || 'Unknown';
                    sizeSales[size] = (sizeSales[size] || 0) + 1;
                }
            }
        }

        // --- Best Selling Individual Products ---
        const bestSellingItems = Object.entries(itemSaleCount)
            .map(([productId, timesSold]) => ({
                productId,
                title: productMap[productId]?.title || 'Unknown',
                brand: productMap[productId]?.brand || 'Unknown',
                timesSold
            }))
            .sort((a, b) => b.timesSold - a.timesSold)
            .slice(0, 10);

        // --- Format remaining data for Recharts ---
        const salesByCategoryArray = Object.entries(categorySales)
            .map(([category, sold]) => ({ category, sold }))
            .sort((a, b) => b.sold - a.sold);

        const salesByBrandArray = Object.entries(brandSales)
            .map(([brand, sold]) => ({ brand, sold }))
            .sort((a, b) => b.sold - a.sold);

        const conditionBreakdownArray = Object.entries(conditionSales)
            .map(([condition, sold]) => ({ condition, sold }))
            .sort((a, b) => b.sold - a.sold);

        const popularSizesArray = Object.entries(sizeSales)
            .map(([size, sold]) => ({ size, sold }))
            .sort((a, b) => b.sold - a.sold);

        return {
            totalListed,
            totalSold,
            sellThrough,
            avgSellingPrice,
            mostViewed,
            bestSellingItems,
            salesByCategory: salesByCategoryArray,
            salesByBrand: salesByBrandArray,
            conditionBreakdown: conditionBreakdownArray,
            popularSizes: popularSizesArray
        };
    }

    // Top buyers, location breakdown and sign-up trends
    async getCustomerReport() {
        const [usersSnapshot, ordersSnapshot] = await Promise.all([
            adminDb.collection('users').where('role', '==', 'customer').get(),
            adminDb.collection('orders').get()
        ]);

        const customers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // --- Top Buyers ---
        // Group all orders by buyerId and sum their totalAmount
        const spendByCustomer = {};

        for (const order of orders) {
            const buyerId = order.buyerId;
            if (!spendByCustomer[buyerId]) {
                spendByCustomer[buyerId] = {
                    buyerId,
                    buyerName: order.buyerName,
                    buyerEmail: order.buyerEmail,
                    totalSpend: 0,
                    orderCount: 0
                };
            }
            spendByCustomer[buyerId].totalSpend += order.totalAmount || 0;
            spendByCustomer[buyerId].orderCount += 1;
        }

        const topBuyers = Object.values(spendByCustomer)
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 10);

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const repeatBuyerCount = Object.values(spendByCustomer).filter(b => b.orderCount > 1).length;
        const buyersWithOrders = Object.keys(spendByCustomer).length;
        const avgSpendPerBuyer = buyersWithOrders > 0 ? Math.round(totalRevenue / buyersWithOrders) : 0;

        // --- Customer Locations ---
        // Count how many customers are in each city
        const locationCount = {};
        for (const customer of customers) {
            const location = customer.location || 'Unknown';
            locationCount[location] = (locationCount[location] || 0) + 1;
        }

        const customerLocations = Object.entries(locationCount)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count);

        // --- New Customers by Month ---
        // Groups customers by the month they signed up — shows platform growth over time
        const newByMonth = {};
        for (const customer of customers) {
            const joinDate = customer.createdAt?.toDate
                ? customer.createdAt.toDate()
                : new Date(customer.createdAt);

            const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
            newByMonth[monthKey] = (newByMonth[monthKey] || 0) + 1;
        }

        const newCustomersByMonth = Object.entries(newByMonth)
            .map(([month, newCustomers]) => ({ month, newCustomers }))
            .sort((a, b) => a.month.localeCompare(b.month));

        return {
            totalCustomers: customers.length,
            totalOrders: orders.length,
            totalRevenue,
            repeatBuyerCount,
            buyersWithOrders,
            avgSpendPerBuyer,
            topBuyers,
            customerLocations,
            newCustomersByMonth
        };
    }
}

// Export a single shared instance
export default new ReportService();