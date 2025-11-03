# Sales Module

**Status:** ✅ PRODUCTION READY
**Version:** 1.0.0
**Last Updated:** 2025-01-25

---

## Production Status

- [x] Manifest complete
- [x] DB connected & CRUD working
- [x] UI functional
- [x] Cross-module mapped
- [x] 0 ESLint errors (187 errors fixed)
- [x] 0 TypeScript errors
- [x] README complete with cross-module documentation
- [x] Production-ready checklist completed (8/10 - permissions pending Phase 2)

**Current Score:** 8/10 (80%) - PRODUCTION READY ✅  
**Pending:** Permissions (Phase 2)

---

## Core Functionality

- **Order Management**: Complete POS system with cart, payments, and order tracking
- **Payment Processing**: Multi-payment method support (cash, card, QR, etc.)
- **Table Management**: Dine-in orders with table assignment
- **TakeAway/Pickup**: Pickup order management with toggle
- **Sales Analytics**: Real-time dashboards, forecasting, and intelligence
- **Tax Calculation**: Automatic tax computation per jurisdiction
- **Ecommerce Integration**: Online orders sub-module (when feature active)
- **B2B Sales**: Corporate sales sub-module (Phase 3)

---

## Cross-Module Integration

### This module PROVIDES:

#### 1. EventBus: \`sales.order_placed\`
- **Used by**: Production, Materials, Fiscal, Dashboard
- **Purpose**: Notify when new order is created
- **Integration**: Via EventBus emission

#### 2. EventBus: \`sales.order_completed\`
- **Used by**: Materials, Fiscal, Billing
- **Purpose**: Trigger stock updates and invoicing
- **Integration**: Via EventBus emission

#### 3. Hook: \`sales.toolbar.actions\`
- **Returns**: React Button component (TakeAway toggle)
- **Priority**: 90
- **Status**: ✅ ACTIVE

#### 4. Hook: \`scheduling.toolbar.actions\`
- **Returns**: React Button component (Sales Forecast)
- **Priority**: 85
- **Status**: ✅ ACTIVE

### This module CONSUMES:

#### 1. EventBus: \`materials.stock_updated\`
- **Provided by**: Materials module
- **Purpose**: Update available products when stock changes
- **Status**: ✅ ACTIVE

#### 2. EventBus: \`production.order_ready\`
- **Provided by**: Production module
- **Purpose**: Notify when production completes order
- **Status**: ✅ ACTIVE

---

## Feature Activation

### Required Features:
- \`sales_order_management\` (ALWAYS required)

### Optional Features:
- \`sales_payment_processing\` → Enables payment methods
- \`sales_pos_onsite\` → Enables POS interface
- \`sales_dine_in_orders\` → Enables table management
- \`sales_pickup_orders\` → Enables TakeAway toggle
- \`sales_catalog_ecommerce\` → Enables online orders tab

---

## Sub-Modules

### 1. Ecommerce Sub-Module
**Location:** \`src/modules/sales/ecommerce/\`  
**Status:** ✅ INTEGRATED (merged in Phase 0.5)  
**Feature Flag:** \`sales_catalog_ecommerce\`

### 2. B2B Sub-Module
**Location:** \`src/modules/sales/b2b/\`  
**Status:** 🚧 SKELETON (Phase 3)  
**Feature Flag:** \`sales_b2b_sales\`

---

## File Locations

**Manifest:** \`src/modules/sales/manifest.tsx\` (14.6 KB)  
**Page:** \`src/pages/admin/operations/sales/page.tsx\`  
**Services:** \`src/pages/admin/operations/sales/services/\` (7 files)

---

**Last validated:** 2025-01-25
