import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service.js';
import { stripeService } from '../services/stripe.service.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import type { AuthRequest, OrderStatus } from '../types/index.js';

const router = Router();

const addressSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  label: z.string().optional(),
  street: z.string().optional(),
});

const orderItemSchema = z.object({
  product_id: z.string(),
  variant_id: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const createOrderSchema = z.object({
  user_id: z.string().optional(),
  order_number: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  payment_method: z.string().default('card'),
  payment_id: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  subtotal: z.number().positive(),
  discount: z.number().min(0).default(0),
  shipping_cost: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  notes: z.string().optional(),
  coupon_code: z.string().optional(),
});

// Get user's orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getByUser(req.user!.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Create order
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.create({
      user_id: data.user_id || req.user!.id,
      order_number: data.order_number,
      subtotal: data.subtotal,
      discount: data.discount,
      shipping_cost: data.shipping_cost,
      tax: data.tax,
      total: data.total,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      payment_method: data.payment_method,
      payment_id: data.payment_id,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
      shipping_address: data.shipping_address as any,
      billing_address: data.billing_address as any,
      notes: data.notes,
      coupon_code: data.coupon_code,
      items: data.items as any,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Create payment intent for order
router.post('/payment-intent', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, orderId } = z.object({
      amount: z.number().positive(),
      orderId: z.string().optional(),
    }).parse(req.body);

    const paymentIntent = await stripeService.createPaymentIntent(amount, 'cop', {
      user_id: req.user!.id,
      order_id: orderId || '',
    });

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    next(error);
  }
});

// Confirm payment
router.post('/confirm-payment', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, orderId } = z.object({
      paymentIntentId: z.string(),
      orderId: z.string().optional(),
    }).parse(req.body);

    const payment = await stripeService.confirmPayment(paymentIntentId);

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getById(req.params.id);

    // Check if user owns the order or is admin
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all orders (Admin)
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    const result = await orderService.getAll(filters);
    res.json({ success: true, data: result.data, count: result.count });
  } catch (error) {
    next(error);
  }
});

// Update order status (Admin)
router.patch('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    }).parse(req.body);

    const order = await orderService.updateStatus(req.params.id, status as OrderStatus);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Update order tracking (Admin)
router.patch('/:id/tracking', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingNumber, trackingUrl } = z.object({
      trackingNumber: z.string().min(1),
      trackingUrl: z.string().url().optional(),
    }).parse(req.body);

    const order = await orderService.updateTracking(req.params.id, trackingNumber, trackingUrl);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Refund order (Admin)
router.post('/:id/refund', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = z.object({
      amount: z.number().positive().optional(),
    }).parse(req.body);

    const order = await orderService.getById(req.params.id);

    if (!order.payment_id) {
      res.status(400).json({ success: false, error: 'No payment to refund' });
      return;
    }

    const refund = await stripeService.createRefund(order.payment_id, amount);
    await orderService.updatePaymentStatus(req.params.id, amount ? 'partially_refunded' : 'refunded');
    await orderService.updateStatus(req.params.id, 'refunded');

    res.json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
});

export default router;
