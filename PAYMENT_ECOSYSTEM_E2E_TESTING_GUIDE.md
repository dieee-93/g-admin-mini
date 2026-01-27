# 🧪 Payment Ecosystem - E2E Testing Guide

**Date:** 2025-12-29
**Purpose:** Complete End-to-End testing of the payment ecosystem
**Prerequisites:** Server running, database configured

---

## 📋 TESTING CHECKLIST

### Before Starting:
- [ ] Server running (`pnpm run dev`)
- [ ] Database migrations applied
- [ ] Payment methods configured (6 methods)
- [ ] Payment gateways configured (5 gateways)

---

## 🎯 TEST SUITE 1: MERCADO PAGO CHECKOUT (E2E)

### Prerequisites:

**Option A: If you DON'T have MP credentials yet:**

1. **Get Mercado Pago TEST credentials:**
   - Go to: https://www.mercadopago.com.ar/developers
   - Create account or login
   - Go to: "Tus integraciones" → "Credenciales"
   - Copy **TEST** credentials (NOT production):
     - `TEST-xxx-xxx` (Public Key)
     - `TEST-xxx-xxx` (Access Token)

2. **Configure in Admin Panel:**
   ```
   URL: http://localhost:5173/admin/finance-integrations?tab=gateways

   Steps:
   1. Find "Digital Wallets (MercadoPago)" gateway
   2. Click Edit
   3. Paste Public Key and Access Token
   4. Click "Test Connection" → Should show ✅
   5. Save
   ```

**Option B: If you already have credentials:**
- Skip to testing steps below

---

### Test Steps:

#### 1. Create Test Order in Checkout

```bash
# Navigate to checkout
URL: http://localhost:5173/app/checkout
```

**Steps:**
1. Add items to cart (any products)
2. Go to checkout
3. Fill customer info:
   - Email: test@example.com
   - Name: Test User
   - Phone: +54 9 11 1234-5678
4. Select "Mercado Pago" as payment method
5. Click "Continue to Mercado Pago"

**Expected:**
- ✅ Redirect to Mercado Pago checkout
- ✅ URL contains `init_point`
- ✅ MP checkout page loads
- ✅ Shows order details (items, total)

---

#### 2. Complete Payment with Test Card

**Test Card (Argentina - Always Approved):**
```
Card Number: 5031 7557 3453 0604
CVV: 123
Expiry: 11/25
Cardholder: APRO
DNI: 12345678
```

**Steps:**
1. Enter test card details in MP checkout
2. Click "Pay"
3. Wait for confirmation

**Expected:**
- ✅ Payment approved
- ✅ Redirect to success page
- ✅ URL: `http://localhost:5173/app/checkout/success?status=approved&...`
- ✅ Success page shows:
  - "¡Pago Aprobado!" title
  - Payment ID
  - Order ID
  - Status badge (green)

---

#### 3. Verify Webhook Received

**Check Server Logs:**
```bash
# In terminal where server is running, look for:
[MercadoPago Webhook] Received: { type: 'payment', action: 'payment.updated', payment_id: '...' }
[MercadoPago Webhook] Payment details: { id: '...', status: 'approved', ... }
[MercadoPago Webhook] Payment updated: { payment_id: '...', new_status: 'AUTHORIZED' }
```

**Expected:**
- ✅ Webhook received within 30 seconds
- ✅ Payment status: `approved`
- ✅ Mapped to internal status: `AUTHORIZED`

---

#### 4. Verify Database

**Query:**
```sql
-- Check sale_payments for MP payment
SELECT
  id,
  sale_id,
  amount,
  payment_type,
  status,
  metadata->>'external_id' as mercadopago_id,
  metadata->>'mercadopago_payment'->'status' as mp_status,
  created_at
FROM sale_payments
WHERE metadata->>'external_id' IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- ✅ New record created
- ✅ `status = 'AUTHORIZED'` or `'SETTLED'`
- ✅ `payment_type = 'CARD'` or similar
- ✅ `metadata` contains full MP payment details
- ✅ `external_id` matches MP payment ID

---

### Test Result: Mercado Pago E2E
- [ ] ✅ PASSED - All steps completed
- [ ] ❌ FAILED - (note error here)

---

## 🎯 TEST SUITE 2: POS WITH CASH

### Prerequisites:
- [ ] Cash session open (if not, open one in POS)

---

### Test Steps:

#### 1. Open Cash Session (if needed)

```bash
URL: http://localhost:5173/admin/operations/sales
```

**Steps:**
1. If no cash session open, click "Open Cash Session"
2. Enter opening balance: 1000.00
3. Confirm

**Expected:**
- ✅ Cash session opened
- ✅ Status: "Open"
- ✅ Opening balance: $1000.00

---

#### 2. Create Sale with Cash Payment

**Steps:**
1. Click "New Sale"
2. Add products (e.g., Product A $50, Product B $30)
3. Total: $80.00
4. Click "Proceed to Payment"
5. Select payment method: "Cash (Efectivo)"
6. Enter amount: $100.00 (with change)
7. Click "Complete Payment"

**Expected:**
- ✅ Payment processed
- ✅ Change calculated: $20.00
- ✅ Sale completed
- ✅ Receipt generated

---

#### 3. Verify Event Emitted

**Check Console (Browser DevTools):**
```javascript
// Look for event:
{
  event: 'sales.payment.completed',
  data: {
    sale_id: 'xxx',
    amount: 80.00,
    payment_method: 'cash',
    payment_type: 'CASH',
    idempotency_key: 'xxx',
    metadata: {
      db_payment_method_id: 'xxx',
      requires_gateway: false
    }
  }
}
```

**Expected:**
- ✅ Event emitted with correct data
- ✅ `payment_type: 'CASH'`
- ✅ `requires_gateway: false`

---

#### 4. Verify Database Updates

**Query 1: Check sale_payments**
```sql
SELECT
  id,
  sale_id,
  amount,
  payment_type,
  status,
  cash_session_id,
  shift_id,
  created_at
FROM sale_payments
WHERE payment_type = 'CASH'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- ✅ New record created
- ✅ `status = 'SETTLED'` (auto-settled by trigger)
- ✅ `amount = 80.00`
- ✅ `cash_session_id` populated
- ✅ `shift_id` populated (if shift is active)

---

**Query 2: Check cash_sessions updated**
```sql
SELECT
  id,
  opening_balance,
  cash_sales,
  card_sales,
  total_sales,
  status
FROM cash_sessions
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- ✅ `cash_sales` increased by $80.00
- ✅ `total_sales` increased by $80.00
- ✅ Trigger `trigger_sync_cash_session` fired

---

**Query 3: Check operational_shifts updated (if shift active)**
```sql
SELECT
  id,
  sales_total,
  cash_collected,
  status
FROM operational_shifts
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- ✅ `sales_total` increased by $80.00
- ✅ `cash_collected` increased by $80.00
- ✅ Trigger `trigger_sync_shift_totals` fired

---

### Test Result: POS Cash Payment
- [ ] ✅ PASSED - All steps completed
- [ ] ❌ FAILED - (note error here)

---

## 🎯 TEST SUITE 3: POS WITH CARD

### Test Steps:

#### 1. Create Sale with Card Payment

**Steps:**
1. In POS, click "New Sale"
2. Add products (Total: $120.00)
3. Click "Proceed to Payment"
4. Select payment method: "Credit Card (Tarjeta de Crédito)"
5. Enter amount: $120.00
6. Click "Complete Payment"

**Expected:**
- ✅ Payment processed
- ✅ No change (exact amount)
- ✅ Sale completed

---

#### 2. Verify Database

**Query:**
```sql
SELECT
  id,
  sale_id,
  amount,
  payment_type,
  status,
  cash_session_id,
  metadata->>'db_payment_method_id' as method_id,
  created_at
FROM sale_payments
WHERE payment_type = 'CARD'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- ✅ New record created
- ✅ `status = 'INITIATED'` (NOT auto-settled, requires authorization)
- ✅ `amount = 120.00`
- ✅ `cash_session_id = NULL` (card payment goes to bank, not cash drawer)
- ✅ `payment_type = 'CARD'`

---

### Test Result: POS Card Payment
- [ ] ✅ PASSED - All steps completed
- [ ] ❌ FAILED - (note error here)

---

## 🎯 TEST SUITE 4: SPLIT BILLS

### Test Steps:

#### 1. Create Sale with Split Payment

**Scenario:** Sale of $100 paid with $50 cash + $50 card

**Steps:**
1. In POS, create new sale
2. Add products (Total: $100.00)
3. Click "Proceed to Payment"
4. **First Payment:**
   - Select "Cash"
   - Enter amount: $50.00
   - Click "Add Payment" (partial payment)
5. **Second Payment:**
   - Select "Credit Card"
   - Enter amount: $50.00
   - Click "Complete Payment"

**Expected:**
- ✅ Both payments processed
- ✅ Sale total = $100.00
- ✅ Payment 1: $50.00 cash
- ✅ Payment 2: $50.00 card

---

#### 2. Verify Database

**Query:**
```sql
SELECT
  sale_id,
  amount,
  payment_type,
  status,
  created_at
FROM sale_payments
WHERE sale_id = 'YOUR_SALE_ID'
ORDER BY created_at;
```

**Expected:**
- ✅ **2 records** with same `sale_id`
- ✅ Record 1: `amount = 50.00`, `payment_type = 'CASH'`, `status = 'SETTLED'`
- ✅ Record 2: `amount = 50.00`, `payment_type = 'CARD'`, `status = 'INITIATED'`
- ✅ Total: $50 + $50 = $100 ✅

---

**Verify Totals:**
```sql
SELECT
  sale_id,
  SUM(amount) as total_paid,
  COUNT(*) as num_payments
FROM sale_payments
WHERE sale_id = 'YOUR_SALE_ID'
GROUP BY sale_id;
```

**Expected:**
- ✅ `total_paid = 100.00`
- ✅ `num_payments = 2`

---

### Test Result: Split Bills
- [ ] ✅ PASSED - All steps completed
- [ ] ❌ FAILED - (note error here)

---

## 🎯 TEST SUITE 5: QR INTEROPERABLE

### Test Steps:

#### 1. Generate QR via API

```bash
curl -X POST http://localhost:5173/api/qr/generate-interoperable \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.00,
    "currency": "ARS",
    "order_id": "test_qr_001",
    "pos_id": "POS-TEST",
    "expiry_minutes": 15
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "qr_image": "data:image/png;base64,iVBORw0KG...",
    "qr_string": "{\"version\":\"1.0.0\",...}",
    "payload": {
      "version": "1.0.0",
      "payee_fa": "...",
      "amount": "250.00",
      "currency": "ARS",
      "order_id": "test_qr_001",
      "expiry": "2025-12-29T...",
      "sign": "..."
    },
    "expires_at": "2025-12-29T...",
    "type": "dynamic"
  }
}
```

**Expected:**
- ✅ HTTP 200
- ✅ `success: true`
- ✅ `qr_image` is base64 data URL
- ✅ `qr_string` is valid JSON
- ✅ `expires_at` is 15 minutes in future
- ✅ `type: "dynamic"` (amount > 0)

---

#### 2. View QR Image

**Steps:**
1. Copy the `qr_image` value (starts with `data:image/png;base64,`)
2. Open new browser tab
3. Paste in address bar
4. Press Enter

**Expected:**
- ✅ QR code image displays
- ✅ Image is clear and scannable
- ✅ No errors

---

#### 3. Scan QR with QR Reader

**Steps:**
1. Use phone camera or QR reader app
2. Scan the QR code displayed
3. View the decoded data

**Expected:**
- ✅ Scans successfully
- ✅ Shows JSON data:
  ```json
  {
    "version": "1.0.0",
    "payee_fa": "...",
    "payee_name": "Demo Business",
    "amount": "250.00",
    "currency": "ARS",
    "order_id": "test_qr_001",
    "expiry": "...",
    "sign": "..."
  }
  ```

---

#### 4. Test QR Component in POS

```bash
# Navigate to POS
URL: http://localhost:5173/admin/operations/sales
```

**Steps:**
1. Create new sale ($250.00)
2. Select "QR Interoperable (BCRA)"
3. Component should render

**Expected:**
- ✅ QRInteroperableDisplay component loads
- ✅ QR code displays
- ✅ Payment details shown (amount, order ID)
- ✅ Countdown timer works (15:00 → 14:59 → ...)
- ✅ Timer badge changes color (green → yellow → red)
- ✅ "Regenerar QR" button appears after 10 min
- ✅ "Cancelar" button works

---

### Test Result: QR Interoperable
- [ ] ✅ PASSED - All steps completed
- [ ] ❌ FAILED - (note error here)

---

## 🎯 TEST SUITE 6: EDGE CASES

### Test 1: Empty Cart with Mercado Pago

**Steps:**
1. Go to checkout with empty cart
2. Try to select Mercado Pago

**Expected:**
- ✅ Error: "Cart is empty"
- ✅ Cannot proceed to payment
- ✅ No API call made

---

### Test 2: Disabled Payment Method

**Steps:**
1. In Admin Panel, disable "Cash" method
2. Try to create POS sale with Cash

**Expected:**
- ✅ Cash method not shown in payment options
- ✅ Warning: "Some payment methods are disabled"

---

### Test 3: No Cash Session + Cash Payment

**Steps:**
1. Close all cash sessions
2. Create POS sale
3. Pay with Cash

**Expected:**
- ✅ Payment still processes
- ✅ `cash_session_id = NULL` in sale_payments
- ✅ Warning: "No cash session open"
- ✅ Sale completes successfully

---

### Test 4: Duplicate Idempotency Key

**Steps:**
1. Create sale with cash payment
2. Note the idempotency_key
3. Try to create another payment with same key

**Expected:**
- ✅ Second payment rejected
- ✅ Error: "Duplicate payment detected"
- ✅ Trigger `enforce_payment_status_transitions` prevents duplicate

---

### Test 5: Expired QR Code

**Steps:**
1. Generate QR with 1 minute expiry
2. Wait 2 minutes
3. Try to use QR

**Expected:**
- ✅ QR shows "Expired"
- ✅ Timer shows 00:00
- ✅ "Regenerar QR" button enabled
- ✅ Validation fails: "QR code has expired"

---

### Test 6: Invalid Signature

**Steps:**
1. Generate QR
2. Manually edit the JSON string (change amount)
3. Try to validate

**Expected:**
- ✅ Validation fails
- ✅ Error: "Invalid digital signature"
- ✅ `validateQR()` returns `valid: false`

---

### Test Result: Edge Cases
- [ ] ✅ PASSED - All tests completed
- [ ] ❌ FAILED - (note errors)

---

## 🎯 TEST SUITE 7: TRIGGERS & DATABASE INTEGRITY

### Test 1: Auto-Settle Cash Trigger

**Query:**
```sql
-- Create a cash payment manually
INSERT INTO sale_payments (
  sale_id,
  journal_entry_id,
  amount,
  payment_type,
  status,
  transaction_type
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  100.00,
  'CASH',
  'INITIATED', -- Should auto-change to SETTLED
  'PAYMENT'
);

-- Check if status changed
SELECT status FROM sale_payments ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- ✅ `status = 'SETTLED'` (changed from INITIATED)
- ✅ Trigger `trigger_auto_settle_cash` fired
- ✅ `settled_at` timestamp populated

---

### Test 2: State Machine Validation

**Query:**
```sql
-- Try invalid status transition
INSERT INTO sale_payments (
  sale_id,
  journal_entry_id,
  amount,
  payment_type,
  status,
  transaction_type
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  100.00,
  'CARD',
  'SETTLED', -- Invalid: should start at INITIATED
  'PAYMENT'
);
```

**Expected:**
- ✅ INSERT rejected
- ✅ Error: "Invalid status transition"
- ✅ Trigger `enforce_payment_status_transitions` blocked it

---

### Test Result: Triggers & DB Integrity
- [ ] ✅ PASSED - All tests completed
- [ ] ❌ FAILED - (note errors)

---

## 📊 FINAL TEST SUMMARY

### Overall Results:

| Test Suite | Status | Notes |
|------------|--------|-------|
| 1. Mercado Pago E2E | ⏳ | |
| 2. POS Cash Payment | ⏳ | |
| 3. POS Card Payment | ⏳ | |
| 4. Split Bills | ⏳ | |
| 5. QR Interoperable | ⏳ | |
| 6. Edge Cases | ⏳ | |
| 7. Triggers & DB | ⏳ | |

**Legend:**
- ✅ PASSED
- ❌ FAILED
- ⏳ PENDING

---

## 🐛 ISSUES FOUND

### Critical:
- [ ] None

### Medium:
- [ ] None

### Low:
- [ ] None

---

## ✅ SIGN-OFF

**Tested by:** _______________
**Date:** _______________
**Environment:** Development / Staging / Production
**Overall Status:** PASSED / FAILED / PARTIAL

**Notes:**

---

**End of Testing Guide**
**Version:** 1.0.0
**Created:** 2025-12-29
**Next Review:** After production deployment
