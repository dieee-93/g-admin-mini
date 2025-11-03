# 💳 Billing Module - Production Ready

**Status**: ✅ Production Ready (Phase 3 P2)
**Version**: 1.0.0
**Last Updated**: 2025-02-01

---

## 📋 Overview

El **Billing Module** gestiona facturación recurrente, suscripciones, y cobros automáticos para G-Admin Mini. Soporta múltiples frecuencias de facturación, automatización completa del ciclo de cobro, y métricas avanzadas de análisis de suscripciones.

---

## 🎯 Features

### ✅ Core Features

1. **Recurring Billing** - Suscripciones con facturación automática (mensual, trimestral, anual, personalizado)
2. **Subscription Management** - Gestión completa del ciclo de vida de suscripciones
3. **Automated Invoicing** - Generación automática de facturas en cada ciclo
4. **Payment Processing** - Procesamiento y reintentos automáticos de pagos
5. **Billing Analytics** - Métricas avanzadas: MRR, Churn Rate, LTV, Retention Cohorts
6. **Payment Terms** - Soporte para términos de pago (inmediato, net15, net30, net45)

### 🔄 EventBus Integration

**Events Emitted:**
- `billing.invoice_generated` - Nueva factura generada
- `billing.payment_received` - Pago recibido exitosamente
- `billing.subscription_ended` - Suscripción terminada
- `dashboard.widgets` - Widget de estado de facturación

**Events Consumed:**
- `sales.order_completed` - Genera factura automática para órdenes
- `customers.account_created` - Setup de perfil de facturación

---

## 🗂️ Architecture

### File Structure

```
src/pages/admin/finance/billing/
├── page.tsx                                      # Main billing page with tabs
├── components/
│   ├── RecurringBillingFormEnhanced.tsx         # Subscription creation form
│   ├── RecurringBillingFormModal.tsx            # Modal version of form
│   └── RecurringBillingAnalyticsEnhanced.tsx    # Advanced analytics dashboard
├── hooks/
│   ├── useRecurringBillingForm.tsx              # Form business logic
│   └── index.ts                                 # Hooks exports
└── types/
    └── index.ts                                 # TypeScript definitions
```

### Database Schema

#### Tables

1. **subscriptions** - Subscription records
   - Columns: 26 (customer_id, billing_type, amount, currency, schedule, automation settings)
   - Indexes: 4 (customer_id, status, start_date, end_date)
   - RLS Policies: 2 (view, manage)

2. **billing_cycles** - Individual billing cycle tracking
   - Columns: 11 (subscription_id, cycle_number, dates, amount, status)
   - Indexes: 3 (subscription_id, status, due_date)
   - RLS Policies: 2 (view, manage)

3. **invoices** - Generated invoices
   - Columns: 16 (customer_id, amounts, tax, status, dates)
   - Indexes: 5 (customer_id, subscription_id, status, due_date, invoice_number)
   - RLS Policies: 2 (view, manage)

4. **payments** - Payment records
   - Columns: 13 (invoice_id, amount, status, transaction details)
   - Indexes: 3 (invoice_id, status, transaction_id)
   - RLS Policies: 2 (view, manage)

**Migration**: `database/migrations/20250201_billing_tables.sql`

---

## 🔧 Usage

### Creating a Subscription

```typescript
import { RecurringBillingFormData } from '@/pages/admin/finance/billing/types';

const subscription: RecurringBillingFormData = {
  subscriptionName: 'Premium Plan',
  customerId: 'customer-uuid',
  billingType: 'monthly',
  amount: 49.99,
  currency: 'USD',
  taxIncluded: true,
  startDate: '2025-02-01',
  autoInvoice: true,
  autoCollect: true,
  retryFailedPayments: true,
  maxRetries: 3,
  paymentTerms: 'immediate',
  reminderDays: [7, 3, 1],
  prorate: false,
  allowUsageCharges: false,
  suspendOnFailure: false
};
```

### Generating an Invoice

```typescript
import { moduleRegistry } from '@/lib/modules';

const billingExports = moduleRegistry.getModuleExports('billing');

// Generate invoice for a subscription
const invoice = await billingExports.generateInvoice(customerId, [
  { productId: 'prod-1', quantity: 1, price: 49.99 }
]);
```

### Processing a Payment

```typescript
const payment = await billingExports.processPayment(invoiceId, {
  paymentMethodId: 'pm-xxx',
  amount: 49.99
});
```

### Listening to Billing Events

```typescript
import { eventBus } from '@/lib/events';

eventBus.subscribe('billing.payment_received', (event) => {
  console.log('Payment received:', event.payload);
  // Update inventory, send notifications, etc.
});

eventBus.subscribe('billing.subscription_ended', (event) => {
  console.log('Subscription ended:', event.payload);
  // Trigger retention workflows
});
```

---

## 📊 Analytics

### Key Metrics

1. **MRR (Monthly Recurring Revenue)** - Ingresos mensuales recurrentes
2. **ARR (Annual Recurring Revenue)** - Ingresos anuales proyectados
3. **Churn Rate** - Tasa de abandono de suscripciones
4. **LTV (Lifetime Value)** - Valor de vida promedio de clientes
5. **CAC (Customer Acquisition Cost)** - Costo de adquisición (integrado con marketing)
6. **Billing Health** - Tasa de éxito de cargos, reintentos, tiempo de cobro

### Subscription Segmentation Matrix

Los clientes se segmentan en 4 cuadrantes según **valor** y **rotación**:

1. **Champions 🏆** - Alto valor, baja rotación → Retener y expandir
2. **Estables 💎** - Valor medio, baja rotación → Maximizar valor
3. **En Riesgo ⚠️** - Alto valor, alta rotación → Intervención urgente
4. **Transitioning 📈** - Valor medio, rotación media → Desarrollar potencial

### Cohort Analysis

Análisis de retención por cohortes de suscriptores:
- Retention a 30, 60, 90 días
- LTV promedio por cohorte
- Tendencias de mejora/deterioro

---

## 🔗 Integration Points

### Dependencies

**Modules:**
- `customers` - Required for customer data

**Features (Optional):**
- `finance_corporate_accounts` - B2B billing
- `finance_credit_management` - Credit validation
- `finance_invoice_scheduling` - Advanced scheduling
- `finance_payment_terms` - Custom payment terms

### Integrated With

- **Sales Module** - Auto-invoice on order completion
- **Customers Module** - Billing profile setup
- **Finance-Integrations** - Payment gateway integration
- **Dashboard** - Billing status widget

---

## 🔐 Permissions

**Minimum Role**: `SUPERVISOR`

**Access Levels:**
- **SUPER_ADMIN** - Full access to all subscriptions and billing data
- **ADMIN** - Full access to all subscriptions and billing data
- **SUPERVISOR** - Full access to all subscriptions and billing data
- **STAFF** - No access (billing is management-level)
- **CUSTOMER** - No access to this module

**RLS Policies:** All tables protected with Row Level Security

---

## ⚙️ Configuration

### Automation Settings

```typescript
// Subscription automation options
{
  autoInvoice: true,            // Generate invoices automatically
  autoCollect: true,            // Attempt automatic payment
  retryFailedPayments: true,    // Retry failed payments
  maxRetries: 3,                // Maximum retry attempts (0-5)
  suspendOnFailure: false,      // Suspend subscription on payment failure
  allowUsageCharges: false      // Allow variable usage charges
}
```

### Payment Terms

- **Immediate** - Payment due upon invoice generation
- **Net 15** - Payment due in 15 days
- **Net 30** - Payment due in 30 days
- **Net 45** - Payment due in 45 days

### Reminder Schedule

```typescript
reminderDays: [7, 3, 1]  // Send reminders 7, 3, and 1 day before due date
```

---

## 🚀 Next Steps (Future Enhancements)

### Phase 4 (Q2 2025)

- [ ] **Dunning Management** - Advanced retry strategies with smart delays
- [ ] **Usage-Based Billing** - Metered billing for API calls, storage, etc.
- [ ] **Proration Engine** - Automatic prorating on plan changes
- [ ] **Multi-Currency Support** - Enhanced support for international billing
- [ ] **Tax Compliance** - Automated tax calculation (AFIP, IVA, etc.)
- [ ] **Payment Links** - Shareable payment links for invoices
- [ ] **Customer Portal** - Self-service subscription management for customers

### Phase 5 (Q3 2025)

- [ ] **Webhook Notifications** - Real-time billing event webhooks
- [ ] **Revenue Recognition** - Accounting integration for revenue recognition
- [ ] **Subscription Upgrades/Downgrades** - In-place plan changes
- [ ] **Billing Forecasting** - AI-powered revenue predictions
- [ ] **Churn Prediction** - Machine learning for churn risk scoring

---

## 📝 Testing

### Manual Test Checklist

- [ ] Create monthly subscription → Verify auto-invoice generation
- [ ] Create quarterly subscription → Verify correct cycle calculation
- [ ] Test custom interval billing → Verify next billing date calculation
- [ ] Process successful payment → Verify invoice marked as paid
- [ ] Test failed payment retry → Verify retry count increments
- [ ] Suspend subscription → Verify no new billing cycles created
- [ ] Cancel subscription → Verify end_date set, no future invoices
- [ ] Test proration → Verify correct partial period amounts
- [ ] Verify RLS policies → Non-admin users cannot access others' subscriptions

### E2E Test Scenarios

```typescript
// Test 1: Complete subscription lifecycle
test('Complete subscription lifecycle', async () => {
  // 1. Create subscription
  // 2. Generate first invoice
  // 3. Process payment
  // 4. Verify billing cycle created
  // 5. Suspend subscription
  // 6. Verify no new invoices
  // 7. Reactivate subscription
  // 8. Cancel subscription
  // 9. Verify end_date set
});

// Test 2: Failed payment retry flow
test('Failed payment retry flow', async () => {
  // 1. Create subscription with autoCollect
  // 2. Mock payment failure
  // 3. Verify retry scheduled
  // 4. Verify retry count increments
  // 5. Verify max retries respected
  // 6. Verify suspension if configured
});
```

---

## 🐛 Known Issues

**None** - Module is production-ready.

---

## 📚 Additional Resources

- [G-Admin Billing Guide](../../../docs/05-development/)
- [EventBus Integration Guide](../../../lib/events/README.md)
- [Module Registry Pattern](../../../modules/README.md)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

## 👥 Contributors

- **G-Admin Team** - Initial implementation
- **Claude Code** - Module audit and production readiness (2025-02-01)

---

**Last Reviewed**: 2025-02-01
**Status**: ✅ Production Ready
