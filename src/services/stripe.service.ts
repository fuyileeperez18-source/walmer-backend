import Stripe from 'stripe';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export const stripeService = {
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>) {
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
};
