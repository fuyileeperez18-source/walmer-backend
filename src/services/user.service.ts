import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { User, Address } from '../types/index.js';

interface UserFilters {
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const userService = {
  async getProfile(userId: string): Promise<User & { addresses: Address[] }> {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.role, u.created_at, u.updated_at,
        COALESCE(
          (SELECT json_agg(ua) FROM user_addresses ua WHERE ua.user_id = u.id), '[]'
        ) as addresses
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0] as User & { addresses: Address[] };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['full_name', 'phone', 'avatar_url'];
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    values.push(userId);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, email, full_name, phone, avatar_url, role, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0] as User;
  },

  async getAll(filters?: UserFilters): Promise<{ data: User[]; count: number }> {
    let sql = `
      SELECT id, email, full_name, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.role) {
      sql += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    if (filters?.search) {
      sql += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Get count
    const countSql = sql.replace(
      'SELECT id, email, full_name, phone, avatar_url, role, created_at, updated_at',
      'SELECT COUNT(*)'
    );
    const countResult = await query(countSql, params);
    const count = parseInt(countResult.rows[0].count);

    sql += ' ORDER BY created_at DESC';

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
    return { data: result.rows as User[], count };
  },

  // Address management
  async addAddress(userId: string, address: Partial<Address>): Promise<Address> {
    // If this is the first address or marked as default, update other addresses
    if (address.is_default) {
      await query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await query(
      `INSERT INTO user_addresses (user_id, label, street, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        userId,
        address.label,
        address.street,
        address.city,
        address.state,
        address.postal_code,
        address.country || 'US',
        address.is_default || false,
      ]
    );

    return result.rows[0] as Address;
  },

  async updateAddress(addressId: string, userId: string, updates: Partial<Address>): Promise<Address> {
    if (updates.is_default) {
      await query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = ['label', 'street', 'city', 'state', 'postal_code', 'country', 'is_default'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    values.push(addressId, userId);
    const result = await query(
      `UPDATE user_addresses SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Address not found', 404);
    }

    return result.rows[0] as Address;
  },

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const result = await query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Address not found', 404);
    }
  },
};
