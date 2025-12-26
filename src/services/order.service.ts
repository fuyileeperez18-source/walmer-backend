import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Order, OrderItem, OrderStatus } from '../types/index.js';

interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const orderService = {
  async create(orderData: Partial<Order>, items: Partial<OrderItem>[]): Promise<Order> {
    const client = await (await import('../config/database.js')).pool.connect();

    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, subtotal, discount, shipping_cost, tax, total, status,
          payment_status, payment_method, shipping_address, billing_address, notes, coupon_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          orderData.user_id,
          orderData.subtotal,
          orderData.discount || 0,
          orderData.shipping_cost || 0,
          orderData.tax || 0,
          orderData.total,
          'pending',
          'pending',
          orderData.payment_method,
          JSON.stringify(orderData.shipping_address),
          JSON.stringify(orderData.billing_address || orderData.shipping_address),
          orderData.notes,
          orderData.coupon_code,
        ]
      );

      const order = orderResult.rows[0] as Order;

      // Create order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            item.product_id,
            item.variant_id,
            item.quantity,
            item.price,
            (item.price || 0) * (item.quantity || 0),
          ]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getByUser(userId: string): Promise<Order[]> {
    const result = await query(
      `SELECT o.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'variant_id', oi.variant_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'slug', p.slug,
                'price', p.price,
                'images', (SELECT json_agg(pi) FROM product_images pi WHERE pi.product_id = p.id)
              )
            )
          )
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = o.id), '[]'
        ) as items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [userId]
    );

    return result.rows as Order[];
  },

  async getById(id: string): Promise<Order> {
    const result = await query(
      `SELECT o.*,
        json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'email', u.email
        ) as user,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'variant_id', oi.variant_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'slug', p.slug,
                'price', p.price
              ),
              'variant', (SELECT row_to_json(pv) FROM product_variants pv WHERE pv.id = oi.variant_id)
            )
          )
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = o.id), '[]'
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0] as Order;
  },

  async getAll(filters?: OrderFilters): Promise<{ data: Order[]; count: number }> {
    let sql = `
      SELECT o.*,
        json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'email', u.email
        ) as user,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      sql += ` AND o.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND o.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    // Get count
    const countResult = await query(
      `SELECT COUNT(*) FROM orders o WHERE 1=1 ${filters?.status ? 'AND o.status = $1' : ''}`,
      filters?.status ? [filters.status] : []
    );
    const count = parseInt(countResult.rows[0].count);

    sql += ' ORDER BY o.created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return { data: result.rows as Order[], count };
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0] as Order;
  },

  async updateTracking(id: string, trackingNumber: string, trackingUrl?: string): Promise<Order> {
    const result = await query(
      `UPDATE orders SET tracking_number = $1, tracking_url = $2, status = 'shipped', updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [trackingNumber, trackingUrl, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0] as Order;
  },

  async updatePaymentStatus(id: string, paymentStatus: string, paymentId?: string): Promise<Order> {
    const result = await query(
      `UPDATE orders SET payment_status = $1, payment_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [paymentStatus, paymentId, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0] as Order;
  },
};
