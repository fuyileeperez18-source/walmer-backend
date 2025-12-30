import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service.js';
import { stripeService } from '../services/stripe.service.js';
import { mercadopagoService } from '../services/mercadopago.service.js';
import { wompiService } from '../services/wompi.service.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import type { AuthRequest, OrderStatus } from '../types/index.js';
import { env } from '../config/env.js';

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

// ==================== MERCADO PAGO ROUTES ====================

// Create Mercado Pago preference
router.post('/mercadopago/create-preference', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, orderId, payer } = z.object({
      items: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive(),
      })),
      orderId: z.string().optional(),
      payer: z.object({
        name: z.string().optional(),
        surname: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.object({
          area_code: z.string().optional(),
          number: z.string().optional(),
        }).optional(),
      }).optional(),
    }).parse(req.body);

    const preference = await mercadopagoService.createPreference({
      items: items.map((item, index) => ({
        id: `item_${index}`,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'COP',
      })),
      payer,
      back_urls: {
        success: `${env.FRONTEND_URL}/checkout/success`,
        failure: `${env.FRONTEND_URL}/checkout/failure`,
        pending: `${env.FRONTEND_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      metadata: {
        user_id: req.user!.id,
        order_id: orderId || '',
      },
    });

    res.json({ success: true, data: preference });
  } catch (error) {
    next(error);
  }
});

// Get Mercado Pago payment status
router.get('/mercadopago/payment/:paymentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await mercadopagoService.getPayment(req.params.paymentId);
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

// Mercado Pago Webhook (IPN - Instant Payment Notification)
router.post('/mercadopago/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, data } = req.body;

    console.log('📬 [MERCADOPAGO WEBHOOK] Received:', { type, data });

    // Mercado Pago sends different types of notifications
    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await mercadopagoService.processWebhook(paymentId, type);

      if (payment && payment.status === 'approved') {
        console.log('✅ [MERCADOPAGO WEBHOOK] Payment approved:', paymentId);
        // Update order status if needed
        // You can add logic here to update your order based on external_reference
      }
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ [MERCADOPAGO WEBHOOK] Error:', error);
    // Still respond 200 to avoid retries
    res.status(200).json({ success: false });
  }
});

// Simulate successful Mercado Pago payment (only in dev/testing)
router.post('/mercadopago/simulate-payment', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!mercadopagoService.isSimulatedMode()) {
      res.status(400).json({
        success: false,
        error: 'This endpoint is only available in simulated mode'
      });
      return;
    }

    const { preferenceId, amount } = z.object({
      preferenceId: z.string(),
      amount: z.number().positive(),
    }).parse(req.body);

    const payment = await mercadopagoService.simulatePaymentSuccess(preferenceId, amount);

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

// ==================== WOMPI ROUTES ====================

// Create Wompi transaction
router.post('/wompi/create-transaction', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, orderId, customerEmail, shippingAddress } = z.object({
      items: z.array(z.object({
        title: z.string(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive(),
      })),
      orderId: z.string().optional(),
      customerEmail: z.string().email(),
      shippingAddress: z.object({
        address_line_1: z.string().optional(),
        address_line_2: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        name: z.string().optional(),
        phone_number: z.string().optional(),
      }).optional(),
    }).parse(req.body);

    // Calculate total amount in cents
    const totalAmountInCents = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Generate reference
    const reference = orderId || `ORDER_${Date.now()}_${req.user!.id}`;

    // Create transaction
    const transaction = await wompiService.createTransaction({
      amount_in_cents: totalAmountInCents,
      currency: 'COP',
      customer_email: customerEmail,
      reference,
      redirect_url: `${env.FRONTEND_URL}/checkout/wompi/callback`,
      shipping_address: shippingAddress,
      customer_data: {
        full_name: shippingAddress?.name,
        phone_number: shippingAddress?.phone_number,
      },
    });

    // Generate integrity signature for widget
    const integritySignature = wompiService.generateIntegritySignature(
      reference,
      totalAmountInCents,
      'COP'
    );

    res.json({
      success: true,
      data: {
        ...transaction,
        public_key: env.WOMPI_PUBLIC_KEY,
        integrity_signature: integritySignature,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get Wompi transaction status
router.get('/wompi/transaction/:transactionId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await wompiService.getTransaction(req.params.transactionId);
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
});

// Wompi Webhook
router.post('/wompi/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-wompi-signature'] as string;
    const timestamp = req.headers['x-wompi-timestamp'] as string;
    const eventData = req.body;

    console.log('📬 [WOMPI WEBHOOK] Received:', eventData);

    const result = await wompiService.processWebhook(eventData, signature, timestamp);

    if (result && result.status === 'APPROVED') {
      console.log('✅ [WOMPI WEBHOOK] Transaction approved:', result.id);
      // Update order status if needed based on reference
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ [WOMPI WEBHOOK] Error:', error);
    // Still respond 200 to avoid retries
    res.status(200).json({ success: false });
  }
});

// Simulate successful Wompi payment (only in dev/testing)
router.post('/wompi/simulate-payment', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!wompiService.isSimulatedMode()) {
      res.status(400).json({
        success: false,
        error: 'This endpoint is only available in simulated mode'
      });
      return;
    }

    const { transactionId } = z.object({
      transactionId: z.string(),
    }).parse(req.body);

    const transaction = await wompiService.simulatePaymentSuccess(transactionId);

    res.json({ success: true, data: transaction });
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
