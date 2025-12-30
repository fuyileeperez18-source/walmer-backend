# Split Payment Configuration Guide

## Overview

This guide explains how to configure and use Mercado Pago's Split Payment feature in the MELO SPORTT platform. Split Payment allows you to automatically divide transaction amounts between the marketplace (platform) and sellers.

## What is Split Payment?

Split Payment is a Mercado Pago feature designed for marketplace platforms that enables:

- **Automatic Payment Division**: Splits transactions between the platform and sellers
- **Commission Management**: Automatically deducts marketplace fees
- **Multi-Seller Support**: Handle payments for multiple vendors
- **Transparent Accounting**: Track all splits and commissions in real-time

## Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```bash
# Mercado Pago Basic Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key

# Split Payment Configuration
MERCADOPAGO_MARKETPLACE_ID=your_marketplace_identifier
MERCADOPAGO_MARKETPLACE_FEE_PERCENTAGE=10
```

### 2. Marketplace Registration

Before using Split Payment, you must:

1. Register your marketplace with Mercado Pago
2. Obtain OAuth access tokens for each seller
3. Get the `collector_id` for each seller from their Mercado Pago account

## Usage

### Basic Split Payment Example

```typescript
import { mercadopagoService } from './services/mercadopago.service';

// Calculate marketplace fee (10% of total)
const totalAmount = 100000; // COP 100,000
const commissionRate = 10; // 10%
const marketplaceFee = mercadopagoService.calculateMarketplaceFee(totalAmount, commissionRate);

// Create preference with split payment
const preference = await mercadopagoService.createPreference({
  items: [{
    title: 'Product Name',
    quantity: 1,
    unit_price: totalAmount,
    currency_id: 'COP'
  }],
  // Split Payment Configuration
  marketplace: process.env.MERCADOPAGO_MARKETPLACE_ID,
  application_fee: marketplaceFee, // Platform commission
  collector_id: 'seller_mercadopago_account_id', // Seller's MP account
  back_urls: {
    success: 'https://your-site.com/success',
    failure: 'https://your-site.com/failure',
    pending: 'https://your-site.com/pending'
  }
});

// Redirect user to: preference.init_point
```

### Advanced Configuration

For more complex scenarios:

```typescript
const preference = await mercadopagoService.createPreference({
  items: [{
    title: 'Product Bundle',
    quantity: 2,
    unit_price: 50000,
    currency_id: 'COP'
  }],
  // Marketplace configuration
  marketplace: process.env.MERCADOPAGO_MARKETPLACE_ID,
  marketplace_fee: 10000, // Fixed fee: COP 10,000
  application_fee: marketplaceFee, // Percentage-based fee
  collector_id: 'seller_account_id',
  // Additional metadata
  metadata: {
    seller_name: 'Vendor Name',
    category: 'Sports Equipment',
    platform_order_id: 'ORD-12345'
  },
  external_reference: 'ORDER-12345',
  notification_url: 'https://your-backend.com/api/webhooks/mercadopago'
});
```

## How Fees Work

Mercado Pago deducts fees in this order:

1. **Mercado Pago Fee**: ~3.49% + COP 900 (Colombia)
2. **Marketplace Fee**: Your platform commission (application_fee)
3. **Seller Receives**: Remaining amount

### Example Calculation

- **Transaction**: COP 100,000
- **Mercado Pago Fee**: COP 4,390 (3.49% + 900)
- **Marketplace Fee**: COP 10,000 (10%)
- **Seller Receives**: COP 85,610

## Testing

### Simulated Mode

Without configuring `MERCADOPAGO_ACCESS_TOKEN`, the service runs in simulated mode:

```typescript
// Automatically uses simulated mode if no access token
const preference = await mercadopagoService.createPreference({
  items: [{ title: 'Test', quantity: 1, unit_price: 50000 }],
  marketplace: 'test_marketplace',
  application_fee: 5000
});

// Returns fake checkout URL for testing
console.log(preference.init_point);
```

### Test Accounts

Use Mercado Pago test accounts for development:
- Create test users in your Mercado Pago Developer Dashboard
- Use test credentials for both marketplace and sellers
- Process test transactions with test credit cards

## Security Best Practices

1. **Never expose access tokens** in frontend code
2. **Validate seller IDs** before creating preferences
3. **Use webhooks** to confirm payment status
4. **Store commission rates** in your database, not hardcoded
5. **Log all transactions** for audit purposes

## Webhook Integration

Handle payment confirmations:

```typescript
app.post('/api/webhooks/mercadopago', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const payment = await mercadopagoService.getPayment(data.id);

    // Check payment status
    if (payment.status === 'approved') {
      // Update order status
      // Transfer funds to seller
      // Record commission
    }
  }

  res.status(200).send('OK');
});
```

## API Reference

### `calculateMarketplaceFee(totalAmount, commissionRate)`

Calculates the marketplace commission.

**Parameters:**
- `totalAmount` (number): Total transaction amount in cents
- `commissionRate` (number): Commission percentage (e.g., 10 for 10%)

**Returns:** Commission amount in cents

### `createPreference(data)`

Creates a payment preference with optional split payment configuration.

**Split Payment Parameters:**
- `marketplace` (string): Your marketplace identifier
- `marketplace_fee` (number): Fixed fee amount in cents
- `application_fee` (number): Variable commission amount in cents
- `collector_id` (string): Seller's Mercado Pago account ID

## Support Resources

- [Mercado Pago Split Payment Docs](https://www.mercadopago.com.co/developers/en/docs/split-payments/landing)
- [Marketplace Integration Guide](https://www.mercadopago.com.co/developers/es/docs/checkout-api/how-tos/integrate-marketplace)
- [OAuth Authentication](https://www.mercadopago.com.co/developers/en/docs/security/oauth/introduction)

## Troubleshooting

### Common Issues

**Error: "Invalid collector_id"**
- Verify the seller has a valid Mercado Pago account
- Ensure you're using the correct account ID
- Check that OAuth permissions are properly granted

**Error: "Marketplace not authorized"**
- Register your marketplace in the Mercado Pago Developer Dashboard
- Verify your `MERCADOPAGO_MARKETPLACE_ID` is correct

**Fees not splitting correctly**
- Check fee calculations with `calculateMarketplaceFee`
- Verify commission rates in your database
- Review Mercado Pago's fee structure for your country

---

## Next Steps

1. Register your marketplace with Mercado Pago
2. Configure environment variables
3. Test with sandbox credentials
4. Implement webhook handlers
5. Deploy to production with real credentials
