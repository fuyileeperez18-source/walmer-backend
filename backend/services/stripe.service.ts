import Stripe from 'stripe';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

// Simulated mode flag
const SIMULATED_MODE = !env.STRIPE_SECRET_KEY;

// In-memory storage for simulated payments
const simulatedPayments = new Map<string, {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, string>;
  created_at: number;
}>();

// Helper to generate fake IDs
const generateFakeId = (prefix: string) => `${prefix}_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const stripeService = {
  async createPaymentIntent(amount: number, currency: string = 'cop', metadata?: Record<string, string>) {
    // SIMULATED MODE - for testing without real Stripe
    if (SIMULATED_MODE) {
      console.log('🧪 [SIMULATED PAYMENT] Creating payment intent for:', amount, currency);

      const paymentId = generateFakeId('pi');
      const clientSecret = generateFakeId('secret');

      simulatedPayments.set(paymentId, {
        id: paymentId,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method',
        client_secret: clientSecret,
        metadata,
        created_at: Date.now(),
      });

      return {
        id: paymentId,
        client_secret: clientSecret,
        amount,
        currency,
        status: 'requires_payment_method',
      };
    }

    // REAL MODE - using actual Stripe
    if (!stripe) {
      throw new AppError('Stripe is not configured', 500);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  },

  async confirmPayment(paymentIntentId: string) {
    // SIMULATED MODE
    if (SIMULATED_MODE) {
      console.log('🧪 [SIMULATED PAYMENT] Confirming payment:', paymentIntentId);

      const payment = simulatedPayments.get(paymentIntentId);

      if (!payment) {
        throw new AppError('Payment intent not found', 404);
      }

      // Simulate successful payment
      payment.status = 'succeeded';
      simulatedPayments.set(paymentIntentId, payment);

      console.log('✅ [SIMULATED PAYMENT] Payment succeeded:', {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
      });

      return {
        id: payment.id,
        status: 'succeeded',
        amount: payment.amount / 100,
      };
    }

    // REAL MODE
    if (!stripe) {
      throw new AppError('Stripe is not configured', 500);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    };
  },

  async createRefund(paymentIntentId: string, amount?: number) {
    // SIMULATED MODE
    if (SIMULATED_MODE) {
      console.log('🧪 [SIMULATED REFUND] Creating refund for:', paymentIntentId, amount);

      const payment = simulatedPayments.get(paymentIntentId);

      if (!payment) {
        throw new AppError('Payment intent not found', 404);
      }

      const refundId = generateFakeId('re');
      const refundAmount = amount ? Math.round(amount * 100) : payment.amount;

      console.log('✅ [SIMULATED REFUND] Refund created:', {
        id: refundId,
        amount: refundAmount / 100,
      });

      return {
        id: refundId,
        status: 'succeeded',
        amount: refundAmount / 100,
      };
    }

    // REAL MODE
    if (!stripe) {
      throw new AppError('Stripe is not configured', 500);
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      id: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  },

  constructWebhookEvent(payload: Buffer, signature: string) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError('Stripe webhook is not configured', 500);
    }

    return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  },

  // Helper to check if running in simulated mode
  isSimulatedMode() {
    return SIMULATED_MODE;
  },
};
