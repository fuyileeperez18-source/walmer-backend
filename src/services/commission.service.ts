import { query } from '../config/database.js';

/**
 * Servicio de comisiones para el super_admin (Fuyi)
 * Comisión: 12% de cada venta
 */

const COMMISSION_RATE = 0.12; // 12%

interface CommissionSummary {
  total_sales: number;
  total_commission: number;
  total_orders: number;
  average_order_value: number;
  commission_rate: number;
}

interface DailyCommission {
  date: string;
  sales: number;
  commission: number;
  orders: number;
}

interface OrderCommission {
  order_id: string;
  order_number: string;
  total: number;
  commission: number;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export const commissionService = {
  /**
   * Obtiene el resumen de comisiones
   */
  async getSummary(startDate?: string, endDate?: string): Promise<CommissionSummary> {
    let sql = `
      SELECT
        COALESCE(SUM(total), 0) as total_sales,
        COUNT(*) as total_orders
      FROM orders
      WHERE payment_status = 'paid'
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await query(sql, params);
    const row = result.rows[0];

    const totalSales = parseFloat(row.total_sales) || 0;
    const totalOrders = parseInt(row.total_orders) || 0;

    return {
      total_sales: totalSales,
      total_commission: totalSales * COMMISSION_RATE,
      total_orders: totalOrders,
      average_order_value: totalOrders > 0 ? totalSales / totalOrders : 0,
      commission_rate: COMMISSION_RATE * 100,
    };
  },

  /**
   * Obtiene comisiones por día
   */
  async getDailyCommissions(days: number = 30): Promise<DailyCommission[]> {
    const result = await query(
      `SELECT
        DATE(created_at) as date,
        SUM(total) as sales,
        COUNT(*) as orders
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC`
    );

    return result.rows.map((row) => ({
      date: row.date,
      sales: parseFloat(row.sales) || 0,
      commission: (parseFloat(row.sales) || 0) * COMMISSION_RATE,
      orders: parseInt(row.orders) || 0,
    }));
  },

  /**
   * Obtiene el detalle de comisiones por orden
   */
  async getOrderCommissions(limit: number = 50, offset: number = 0): Promise<OrderCommission[]> {
    const result = await query(
      `SELECT
        o.id as order_id,
        o.order_number,
        o.total,
        u.full_name as customer_name,
        u.email as customer_email,
        o.status,
        o.payment_status,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.payment_status = 'paid'
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map((row) => ({
      ...row,
      total: parseFloat(row.total),
      commission: parseFloat(row.total) * COMMISSION_RATE,
    }));
  },

  /**
   * Obtiene resumen de comisiones por mes
   */
  async getMonthlyCommissions(months: number = 12): Promise<{ month: string; sales: number; commission: number; orders: number }[]> {
    const result = await query(
      `SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(total) as sales,
        COUNT(*) as orders
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC`
    );

    return result.rows.map((row) => ({
      month: row.month,
      sales: parseFloat(row.sales) || 0,
      commission: (parseFloat(row.sales) || 0) * COMMISSION_RATE,
      orders: parseInt(row.orders) || 0,
    }));
  },

  /**
   * Obtiene estadísticas de comisiones pendientes de pago
   */
  async getPendingCommissions(): Promise<{ total: number; commission: number; count: number }> {
    const result = await query(
      `SELECT
        COALESCE(SUM(total), 0) as total,
        COUNT(*) as count
      FROM orders
      WHERE payment_status = 'paid'
        AND status NOT IN ('cancelled', 'refunded')`
    );

    const row = result.rows[0];
    const total = parseFloat(row.total) || 0;

    return {
      total,
      commission: total * COMMISSION_RATE,
      count: parseInt(row.count) || 0,
    };
  },
};
