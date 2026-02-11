# Payment Gateway Health Check

Supabase Edge Function that monitors Stripe and Mercado Pago API health.

## Features

- ✅ 5-minute health checks (Supabase Cron)
- ✅ Exponential backoff retry logic (1s, 2s, 4s)
- ✅ Latency monitoring (<500ms ideal, >1000ms critical)
- ✅ Error rate tracking (>1% warning, >10% critical)
- ✅ Success rate validation (<99.5% warning, <98% critical)
- ✅ Parallel execution (Stripe + Mercado Pago)

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## API Endpoints Tested

| Gateway | Endpoint | Purpose |
|---------|----------|---------|
| **Stripe** | `GET /v1/balance` | Lightweight auth test (~100ms) |
| **Mercado Pago** | `GET /v1/users/me` | User profile fetch (~150ms) |

## Status Determination

```typescript
if (latency > 1000ms) → status: 'down'
else if (latency > 500ms) → status: 'degraded'
else → status: 'operational'
```

## Testing Locally

```bash
# Serve Edge Function
npx supabase functions serve payment-health-check

# Invoke manually
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payment-health-check' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

## Deployment

```bash
# Deploy to Supabase
npx supabase functions deploy payment-health-check

# Configure cron (every 5 minutes)
# See: supabase/migrations/20260217000001_payment_health_cron.sql
```

## Integration Flow

```
Cron (5 min) → Edge Function → DB Update → Alert Rules → UI
```

1. Supabase Cron triggers function every 5 minutes
2. Function pings Stripe + Mercado Pago APIs
3. Updates `payment_gateway_health` table
4. Universal Alert Rules evaluate conditions
5. Alerts pushed to UI via Realtime
