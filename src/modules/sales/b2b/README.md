# Sales B2B Subfolder

**Version**: 1.0.0
**Status**: ✅ **Phase 3 Part 2 Complete**
**Parent Module**: Sales
**Subfolder**: `src/modules/sales/b2b/`

---

## 📋 Overview

The B2B subfolder within the Sales module provides business-to-business sales functionality including quote management, contract administration, tiered pricing, and approval workflows. It integrates tightly with the Finance module for credit management and payment terms.

## 🎯 Core Functionality

### Quote Management
- Create and manage B2B quotes
- Multi-line item quotes with product catalog integration
- Automatic tiered pricing calculation
- Quote approval workflows
- Convert quotes to orders
- Email quotes to customers

### Tiered Pricing
- Volume-based pricing (quantity breakpoints)
- Value-based pricing (order total breakpoints)
- Annual volume pricing
- Product-specific or customer-specific tiers
- Automatic discount calculation

### Approval Workflows
- Multi-level approval routing (Manager → Director → VP → CEO)
- Amount-based approval thresholds
- Discount-based approval requirements
- Approval status tracking
- Email notifications

### Finance Integration
- Credit validation before quote approval
- NET payment terms (30/60/90 days)
- Automatic invoice creation on order conversion
- AR tracking for B2B orders

## 🏗️ Architecture

### Subfolder Structure

```
src/modules/sales/b2b/
├── components/              # UI components
│   ├── QuoteBuilder.tsx
│   ├── TieredPricingManager.tsx
│   └── index.ts
├── services/                # Business logic
│   ├── quotesService.ts
│   ├── tieredPricingService.ts
│   ├── approvalWorkflowService.ts
│   ├── financeIntegration.ts
│   └── index.ts
├── hooks/                   # React hooks (TODO)
│   └── index.ts
├── types/                   # TypeScript types
│   └── index.ts
└── README.md                # This file
```

### Page Location

```
src/pages/admin/operations/sales/b2b/
└── page.tsx                # B2B sales page (3 tabs)
```

## 🔌 Integration Points

### Finance Module Integration

**Credit Validation**:
```typescript
import { validateCreditForQuote } from '@/modules/sales/b2b/services/financeIntegration';

// Before creating quote
const { isValid, message } = await validateCreditForQuote(customerId, quoteTotal);
if (!isValid) {
  alert(message);
  return;
}
```

**Invoice Creation**:
```typescript
import { createInvoiceForOrder } from '@/modules/sales/b2b/services/financeIntegration';

// After converting quote to order
await createInvoiceForOrder(order);
// → Updates Finance module's corporate_accounts.current_balance
```

**Payment Tracking**:
```typescript
import { recordOrderPayment } from '@/modules/sales/b2b/services/financeIntegration';

// When payment received
await recordOrderPayment(orderId, accountId, paymentAmount, paymentId);
// → Decreases Finance module's corporate_accounts.current_balance
```

### Fiscal Module Integration

**Tax Calculation** (TODO):
- Quote tax calculation using Fiscal module's tax service
- Multi-jurisdiction tax support
- Tax compliance for B2B invoices

## 📊 Database Schema (TODO)

**Required Tables** (not yet implemented):

| Table | Purpose |
|-------|---------|
| `b2b_quotes` | Quote header and totals |
| `b2b_quote_items` | Quote line items |
| `b2b_contracts` | Long-term customer contracts |
| `tiered_pricings` | Pricing tier configurations |
| `pricing_tiers` | Individual tier definitions |
| `approval_workflows` | Workflow instances |
| `approval_steps` | Individual approval actions |

**Migration Status**: ⚠️ **Database tables pending creation**

## 🚀 Usage

### Creating a Quote

```typescript
import { createQuote } from '@/modules/sales/b2b/services';

const quote = await createQuote({
  customer_id: 'customer-123',
  valid_until: '2025-02-28',
  items: [
    {
      product_id: 'prod-1',
      product_name: 'Product A',
      quantity: 100,
      unit_price: '10.00',
      tiered_price: '9.00', // After 10% volume discount
      discount_percentage: 10,
      line_total: '900.00',
    },
  ],
  notes: 'Volume discount applied for 100+ units',
  terms_and_conditions: 'NET 30 payment terms',
}, userId);
```

### Calculating Tiered Pricing

```typescript
import { calculateTieredPrice } from '@/modules/sales/b2b/services';

const pricing = {
  id: 'tier-1',
  name: 'Standard Volume Discount',
  type: 'volume',
  is_active: true,
  tiers: [
    { min_quantity: 1, max_quantity: 10, discount_percentage: 0 },
    { min_quantity: 11, max_quantity: 50, discount_percentage: 5 },
    { min_quantity: 51, discount_percentage: 10 },
  ],
};

const result = calculateTieredPrice('10.00', 75, pricing);
// result.final_price = 9.00 (10% discount)
// result.discount_percentage = 10
// result.tier_applied = { min_quantity: 51, discount_percentage: 10 }
```

### Credit Validation

```typescript
import { validateCreditForOrder } from '@/modules/sales/b2b/services/financeIntegration';

// Before converting quote to order
const validation = await validateCreditForOrder(customerId, orderTotal);
if (!validation.isValid) {
  throw new Error(validation.message);
  // → "Insufficient credit. Available: $5,000, Required: $10,000"
}
```

## 📈 Features Status

### ✅ Implemented

- [x] TypeScript types (quotes, contracts, tiers, approvals)
- [x] Quote service structure
- [x] Tiered pricing calculations
- [x] Approval workflow logic
- [x] Finance integration (credit validation, invoice creation)
- [x] UI components (placeholder)
- [x] B2B page with tabs
- [x] 0 TypeScript errors

### 🔴 TODO

- [ ] Database tables creation
- [ ] Complete QuoteBuilder UI
- [ ] Contract management implementation
- [ ] Tiered pricing manager UI
- [ ] Approval workflow UI
- [ ] Quote PDF generation
- [ ] Email notifications
- [ ] Fiscal integration (tax calculation)
- [ ] Integration tests
- [ ] E2E tests

## 🧪 Testing

### Test Coverage
- [ ] Quote service unit tests
- [ ] Tiered pricing calculation tests
- [ ] Approval workflow tests
- [ ] Finance integration tests
- [ ] Quote → Order conversion tests

### Test Commands
```bash
pnpm test src/modules/sales/b2b  # Run B2B tests (when implemented)
```

## 🔐 Security

### Access Control
- Only users with `sales` or `admin` roles can access B2B features
- Finance module handles credit limit security via RLS

### Data Validation
- Quote amounts validated against credit limits
- Tiered pricing validation (no gaps, valid percentages)
- Approval level validation (user permissions)

## 📝 Future Enhancements

### Phase 4 (Future)
- [ ] Digital signature integration (DocuSign, HelloSign)
- [ ] Multi-currency support
- [ ] Quote versioning (revisions)
- [ ] Contract renewal automation
- [ ] Customer-specific catalogs
- [ ] Minimum order enforcement
- [ ] Quote analytics dashboard
- [ ] Customer self-service portal

## 🐛 Known Issues

- **Database tables not created**: All services use placeholder data
- **Fiscal integration pending**: Tax calculation not yet implemented
- **UI incomplete**: Components are placeholders

## 📚 Related Documentation

- [Finance Module README](../../finance/README.md) - Corporate accounts, credit management
- [MIGRATION_PLAN.md](../../../../docs/architecture-v2/deliverables/MIGRATION_PLAN.md) - Phase 3 details
- [CLAUDE.md](../../../../CLAUDE.md) - Project overview

## 👥 Contributors

- Claude Code AI (Phase 3 Implementation)

## 📄 License

Part of G-Admin Mini v3.1 - Enterprise Restaurant Management System

---

**Last Updated**: 2025-01-24 (Phase 3 Part 2)
**Next Steps**: Database table creation, UI implementation
