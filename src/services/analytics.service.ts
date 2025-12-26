import { query } from '../config/database.js';
import type { DashboardMetrics } from '../types/index.js';

export const analyticsService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get today's orders and revenue
    const todayResult = await query(
      `SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE created_at >= $1`,
      [today]
    );

    // Get yesterday's orders and revenue
    const yesterdayResult = await query(
      `SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE created_at >= $1 AND created_at < $2`,
      [yesterday, today]
    );

    // Get pending orders
    const pendingResult = await query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`
    );

    // Get low stock products
    const lowStockResult = await query(
      `SELECT COUNT(*) as count FROM products WHERE quantity < 10 AND track_quantity = true`
    );

    // Get new customers today
    const newCustomersResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE created_at >= $1`,
      [today]
    );

    const todayRevenue = parseFloat(todayResult.rows[0].revenue) || 0;
    const yesterdayRevenue = parseFloat(yesterdayResult.rows[0].revenue) || 0;
    const todayOrders = parseInt(todayResult.rows[0].order_count) || 0;
    const yesterdayOrders = parseInt(yesterdayResult.rows[0].order_count) || 0;

    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    const ordersChange = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
      : 0;

    return {
      today_revenue: todayRevenue,
      today_orders: todayOrders,
      pending_orders: parseInt(pendingResult.rows[0].count) || 0,
      low_stock_products: parseInt(lowStockResult.rows[0].count) || 0,
      new_customers_today: parseInt(newCustomersResult.rows[0].count) || 0,
      revenue_change: revenueChange,
      orders_change: ordersChange,
    };
  },

  async getRevenueByPeriod(startDate: string, endDate: string) {
    const result = await query(
      `SELECT DATE(created_at) as date, SUM(total) as revenue
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2 AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [startDate, endDate]
    );

    return result.rows.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
    }));
  },

  async getTopProducts(limit = 10) {
    const result = await query(
      `SELECT p.id, p.name, p.price, SUM(oi.quantity) as total_sold,
        (SELECT json_agg(pi) FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as images
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name, p.price
       ORDER BY total_sold DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  },

  async getOrdersByStatus() {
    const result = await query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );

    return result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
    }));
  },

  async getSalesOverview(days = 30) {
    const result = await query(
      `SELECT DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    return result.rows;
  },
};
