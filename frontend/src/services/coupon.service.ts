import { apiClient } from '@/lib/api-client';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  starts_at?: string;
  applicable_to: 'all' | 'specific';
  product_ids?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  expires_at?: string;
  starts_at?: string;
  applicable_to?: 'all' | 'specific';
  product_ids?: string[];
  active?: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}

export interface ValidateCouponData {
  code: string;
  cartItems: any[];
  subtotal: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    coupon: {
      id: string;
      code: string;
      discount_type: string;
      discount_value: number;
    };
    discount_amount: number;
  };
  message: string;
}

class CouponService {
  private baseUrl = '/coupons';

  async getAll(params?: { page?: number; limit?: number; status?: string }) {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateCouponData) {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateCouponData) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async validate(data: ValidateCouponData): Promise<ValidateCouponResponse> {
    const response = await apiClient.post(`${this.baseUrl}/validate`, data);
    return response.data;
  }

  async incrementUsage(couponId: string) {
    const response = await apiClient.post(`${this.baseUrl}/increment-usage`, {
      couponId,
    });
    return response.data;
  }
}

export const couponService = new CouponService();
export default couponService;
