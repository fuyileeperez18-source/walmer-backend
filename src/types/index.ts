import { Request } from 'express';

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  track_quantity: boolean;
  continue_selling_when_out_of_stock: boolean;
  category_id: string;
  category?: Category;
  brand?: string;
  tags: string[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  options: VariantOption[];
  image_url?: string;
  is_active: boolean;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  position: number;
  is_active: boolean;
  products_count?: number;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user?: User;
  items?: OrderItem[];
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  payment_id?: string;
  shipping_address: Address;
  billing_address: Address;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  sender_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'product' | 'order' | 'quick_reply';
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id?: string;
  user?: User;
  channel: 'website' | 'whatsapp' | 'instagram';
  status: 'active' | 'resolved' | 'pending';
  assigned_to?: string;
  messages?: ChatMessage[];
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Analytics Types
export interface DashboardMetrics {
  today_revenue: number;
  today_orders: number;
  pending_orders: number;
  low_stock_products: number;
  new_customers_today: number;
  revenue_change: number;
  orders_change: number;
}
