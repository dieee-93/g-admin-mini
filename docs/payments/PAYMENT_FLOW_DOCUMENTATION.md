# 💳 Payment Flow Documentation - G-Admin Mini

**Last Updated:** 2025-12-29
**Status:** ✅ Implementation Complete (Semana 3-4)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Payment Flow (End-to-End)](#payment-flow-end-to-end)
4. [Mercado Pago Integration](#mercado-pago-integration)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

G-Admin Mini implements a complete payment ecosystem supporting multiple payment methods and gateways, with primary focus on the Argentine market (Mercado Pago, MODO, QR Interoperable).

### Key Features

- ✅ **Multiple Payment Methods:** Cash, Cards, QR, Bank Transfers, Digital Wallets
- ✅ **Gateway Management:** Configure and test payment gateways (MercadoPago, MODO, Stripe)
- ✅ **State Machine:** 11-state payment lifecycle (INITIATED → AUTHORIZED → SETTLED)
- ✅ **Idempotency:** Prevents duplicate payments
- ✅ **Refunds:** Linked transactions with parent_payment_id
- ✅ **Webhooks:** Async payment notifications
- ✅ **Test/Production Modes:** Safe testing with real API

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │  Admin Panel │  │   Customer   │  │   POS      ││
│  │  /admin/*    │  │   /app/*     │  │  /sales    ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│  API LAYER (Vercel Serverless Functions)           │
│  ┌──────────────────────┐  ┌────────────────────┐  │
│  │ /api/mercadopago/    │  │  /api/webhooks/    │  │
│  │ create-preference    │  │  mercadopago       │  │
│  └──────────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│  DATABASE (Supabase PostgreSQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ sale_payments│  │payment_methods│ │payment_    ││
│  │              │  │_config        │ │gateways    ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │  Mercado Pago│  │     MODO     │  │  Stripe    ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## Payment Flow (End-to-End)

### Customer Checkout Flow (E-Commerce)

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Customer adds products to cart             │
│  Location: /app/catalog                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Browse   │ -> │ Add to   │ -> │ View     │      │
│  │ Products │    │ Cart     │    │ Cart     │      │
│  └──────────┘    └──────────┘    └──────────┘      │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  STEP 2: Proceed to checkout                        │
│  Location: /app/checkout                            │
│  - Customer fills shipping/billing info             │
│  - Selects payment method (MercadoPago, Cash, etc.) │
│  - Reviews order summary                            │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  STEP 3: Create payment preference                  │
│  Hook: useMercadoPagoCheckout()                     │
│  API: POST /api/mercadopago/create-preference       │
│                                                      │
│  Request:                                            │
│  {                                                   │
│    items: [...cart items],                          │
│    back_urls: {                                      │
│      success: "/app/checkout/success",              │
│      failure: "/app/checkout/failure"               │
│    },                                                │
│    notification_url: "/api/webhooks/mercadopago",   │
│    external_reference: "sale_id_123"                │
│  }                                                   │
│                                                      │
│  Response:                                           │
│  {                                                   │
│    id: "pref_123",                                   │
│    init_point: "https://www.mercadopago.com/..."    │
│  }                                                   │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  STEP 4: Redirect to Mercado Pago                   │
│  Customer is redirected to:                         │
│  https://www.mercadopago.com.ar/checkout/...        │
│                                                      │
│  Customer enters payment details:                   │
│  - Credit/Debit card                                │
│  - Or selects digital wallet                        │
│  - Or generates QR code                             │
│  - Confirms payment                                 │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  STEP 5A: Payment approved → Success page           │
│  Location: /app/checkout/success                    │
│  URL params:                                         │
│  ?collection_id=123&status=approved&                │
│   external_reference=sale_id_123                    │
│                                                      │
│  - Shows success message                            │
│  - Displays payment ID and order ID                 │
│  - Links to "My Orders"                             │
└─────────────────────────────────────────────────────┘
          OR
┌─────────────────────────────────────────────────────┐
│  STEP 5B: Payment failed → Failure page             │
│  Location: /app/checkout/failure                    │
│  URL params:                                         │
│  ?status=rejected                                    │
│                                                      │
│  - Shows error message                              │
│  - Suggests retry or contact support                │
│  - Links back to checkout                           │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  STEP 6: Webhook notification (async)               │
│  Endpoint: POST /api/webhooks/mercadopago           │
│  Triggered by: Mercado Pago servers                 │
│                                                      │
│  Webhook payload:                                    │
│  {                                                   │
│    type: "payment",                                  │
│    action: "payment.updated",                       │
│    data: { id: "payment_123" }                      │
│  }                                                   │
│                                                      │
│  Handler:                                            │
│  1. Verify webhook signature                        │
│  2. Fetch payment details from Mercado Pago         │
│  3. Update sale_payments table:                     │
│     - status = mapPaymentStatus(mp_status)          │
│     - metadata = {...payment_details}               │
│  4. Triggers update sale.total_paid (automatic)     │
└─────────────────────────────────────────────────────┘
```

### Payment Status State Machine

```
INITIATED (payment created)
    ↓
AUTHORIZED (funds held, not yet captured)
    ↓
SUBMITTED_FOR_SETTLEMENT
    ↓
SETTLING (in progress)
    ↓
SETTLED (complete, final state)

Alternative flows:
- INITIATED → FAILED (payment rejected)
- AUTHORIZED → VOIDED (cancelled before settlement)
- SETTLED → REFUND_PENDING → REFUNDED
- SETTLED → CHARGEBACK_PENDING → CHARGEDBACK
```

---

## Mercado Pago Integration

### Configuration

**Location:** `/admin/finance-integrations?tab=gateways`

**Required Credentials:**
- Public Key (TEST-xxx or APP_USR-xxx)
- Access Token (TEST-xxx or APP_USR-xxx)
- Test Mode Toggle (true/false)
- Webhook URL (optional)
- Webhook Secret (optional)

**How to get credentials:**
1. Go to https://www.mercadopago.com.ar/developers
2. Create application
3. Get credentials from "Credenciales" section
4. Use TEST credentials for development
5. Use PRODUCTION credentials for live

### Test Connection

The system can test Mercado Pago connection by calling:

```typescript
GET https://api.mercadopago.com/v1/users/me
Headers: { Authorization: Bearer ${access_token} }
```

If successful, returns user info. If failed, credentials are invalid.

### Supported Payment Methods

Mercado Pago in Argentina supports:
- 💳 Credit Cards (Visa, Mastercard, Amex, Cabal, Naranja, etc.)
- 💳 Debit Cards
- 💰 Mercado Pago Wallet
- 📱 QR Code (dynamic)
- 💵 Cash (Rapipago, Pago Fácil)
- 📅 Installments (cuotas sin tarjeta)

### Test Cards

**Approved:** 5031 7557 3453 0604 (any CVV, future date)
**Rejected:** 5031 4332 1540 6351
**Pending:** 5031 4418 6393 3674

More test cards: https://www.mercadopago.com.ar/developers/en/docs/checkout-api/integration-test/test-cards

---

## Database Schema

### payment_gateways

```sql
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY,
  type TEXT, -- 'card', 'digital_wallet', 'qr_payment', etc.
  name TEXT NOT NULL,
  provider TEXT, -- 'mercadopago', 'modo', 'stripe'
  is_active BOOLEAN,
  is_online BOOLEAN,
  supports_refunds BOOLEAN,
  supports_recurring BOOLEAN,
  supports_webhooks BOOLEAN,
  config JSONB, -- { test_mode, public_key, access_token, ... }
  webhook_url TEXT,
  webhook_secret TEXT,
  business_profile_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### payment_methods_config

```sql
CREATE TABLE payment_methods_config (
  id UUID PRIMARY KEY,
  gateway_id UUID REFERENCES payment_gateways(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- 'cash', 'credit_card', etc.
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requires_gateway BOOLEAN,
  is_active BOOLEAN,
  sort_order INTEGER,
  config JSONB,
  business_profile_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### sale_payments

```sql
CREATE TABLE sale_payments (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  parent_payment_id UUID REFERENCES sale_payments(id), -- For refunds
  payment_method_id UUID REFERENCES payment_methods_config(id),
  transaction_type payment_transaction_type, -- PAYMENT, REFUND, CHARGEBACK
  amount DECIMAL(12,2),
  tip_amount DECIMAL(12,2),
  status payment_status, -- State machine
  status_history JSONB,
  provider TEXT, -- 'mercadopago', 'cash', etc.
  external_transaction_id TEXT, -- Mercado Pago payment ID
  authorization_code TEXT,
  idempotency_key UUID UNIQUE,
  metadata JSONB,
  cash_session_id UUID,
  shift_id UUID,
  currency TEXT DEFAULT 'ARS',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## API Endpoints

### POST /api/mercadopago/create-preference

Creates a payment preference for Mercado Pago checkout.

**Request:**
```json
{
  "items": [
    {
      "title": "Product Name",
      "quantity": 1,
      "unit_price": 1000
    }
  ],
  "back_urls": {
    "success": "https://yourapp.com/checkout/success",
    "failure": "https://yourapp.com/checkout/failure",
    "pending": "https://yourapp.com/checkout/success"
  },
  "notification_url": "https://yourapp.com/api/webhooks/mercadopago",
  "external_reference": "sale_123",
  "payer": {
    "name": "John",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "id": "preference_id",
  "init_point": "https://www.mercadopago.com/checkout/...",
  "sandbox_init_point": "https://sandbox.mercadopago.com/checkout/...",
  "date_created": "2025-12-29T10:00:00.000Z"
}
```

### POST /api/webhooks/mercadopago

Receives payment notifications from Mercado Pago.

**Webhook Payload:**
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```

**Handler Actions:**
1. Verify signature (optional but recommended)
2. Fetch payment details: `GET https://api.mercadopago.com/v1/payments/{id}`
3. Update sale_payments table with new status
4. Return 200 OK to acknowledge

**IMPORTANT:** Mercado Pago will retry failed webhooks, so always return 200 even if processing fails internally.

---

## Frontend Components

### Admin Panel

**Finance Integrations Page**
- Location: `/admin/finance-integrations`
- Tabs:
  - Dashboard: Overview of payment ecosystem
  - Payment Methods: Configure available methods (cash, cards, etc.)
  - Gateways: Configure payment gateways (MercadoPago, MODO, etc.)

**MercadoPagoConfigForm**
- Component for configuring Mercado Pago credentials
- Features:
  - Test/Production mode toggle
  - Public Key & Access Token fields
  - Prefix validation (TEST- vs APP_USR-)
  - Test Connection button
  - Webhook configuration

### Customer Portal

**Checkout Pages**
- `/app/checkout` - Main checkout form
- `/app/checkout/success` - Payment success page
- `/app/checkout/failure` - Payment failure/cancellation page

### Hooks

**useMercadoPagoCheckout**
```typescript
import { useMercadoPagoCheckout } from '@/modules/finance-integrations/hooks/useMercadoPagoCheckout';

const { processCheckout, isProcessing } = useMercadoPagoCheckout();

// Process checkout
await processCheckout({
  items: [...],
  payer: { email: 'customer@example.com' },
  external_reference: 'sale_123'
});
```

---

## Testing

### Local Development

1. **Configure Test Credentials:**
   - Go to `/admin/finance-integrations?tab=gateways`
   - Edit MercadoPago gateway
   - Toggle "Modo de Prueba" = ON
   - Enter TEST credentials from MercadoPago Developers
   - Click "Probar Conexión"

2. **Test Checkout Flow:**
   - Go to `/app/catalog`
   - Add products to cart
   - Go to `/app/checkout`
   - Fill customer info
   - Select MercadoPago payment method
   - Click "Procesar Pago"
   - You'll be redirected to Mercado Pago sandbox
   - Use test card: 5031 7557 3453 0604
   - Complete payment
   - You'll be redirected back to success/failure page

3. **Verify Webhook:**
   - Check webhook endpoint: `POST /api/webhooks/mercadopago`
   - Mercado Pago will send notification
   - Check database: `SELECT * FROM sale_payments WHERE metadata->>'external_id' = 'payment_id';`
   - Status should update automatically

### Production Checklist

- [ ] Switch to PRODUCTION credentials
- [ ] Toggle "Modo de Prueba" = OFF
- [ ] Test connection with production credentials
- [ ] Configure webhook URL in Mercado Pago dashboard
- [ ] Test with real payment (small amount)
- [ ] Verify webhook receives notifications
- [ ] Check database updates correctly
- [ ] Test refund flow
- [ ] Monitor error logs

---

## Troubleshooting

### Payment not updating after webhook

**Possible causes:**
1. Webhook signature verification failing
2. external_reference not matching sale_id
3. Supabase RLS policies blocking update

**Solution:**
- Check webhook logs: `console.log` in `/api/webhooks/mercadopago.ts`
- Verify external_reference matches sale_id
- Check RLS policies allow service role updates

### Test connection fails

**Possible causes:**
1. Invalid credentials
2. Wrong mode (TEST credentials with Production mode ON)
3. Credentials expired

**Solution:**
- Verify credentials are correct
- Check test_mode matches credential prefix
- Regenerate credentials in Mercado Pago dashboard

### Redirect not working

**Possible causes:**
1. back_urls not configured
2. CORS issues
3. Wrong environment (localhost vs production)

**Solution:**
- Verify back_urls are absolute URLs
- Check CORS configuration in Vercel
- Use ngrok for local testing with webhooks

---

## Next Steps

1. **Add MODO integration** (similar to Mercado Pago)
2. **Implement QR Interoperable** (Transfers 3.0)
3. **Add Stripe** (international payments)
4. **POS Terminal integration** (POSNET API)
5. **Subscription/Recurring payments**

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-12-29
**Authors:** G-Admin Mini Team
