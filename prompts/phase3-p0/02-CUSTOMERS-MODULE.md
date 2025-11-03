# 👥 CUSTOMERS MODULE - Production Ready

**Module**: Customers (CRM)
**Phase**: Phase 3 P0 - Module 2/3
**Estimated Time**: 4-5 hours
**Priority**: P0 (Foundation - other modules depend on it)

---

## 📋 OBJECTIVE

Make the **Customers module** production-ready following the 10-criteria checklist.

**Why this module second**: Foundation module - Billing, Memberships, Rentals, and Sales depend on it. Simpler than Fulfillment (standard CRUD).

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, services/, hooks/, types/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: All CRUD operations working
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: All CRUD via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole + usePermissions + service layer
10. ✅ **README**: Cross-module integration documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/customers/manifest.tsx`
- **Page**: `src/pages/admin/core/crm/customers/page.tsx`
- **Database Table**: `customers` (Supabase)

### Current Structure
```
src/pages/admin/core/crm/customers/
├── page.tsx                          # Main customers page
├── components/
│   ├── CustomerAnalytics/
│   │   ├── CustomerAnalytics.tsx     # Analytics dashboard
│   │   ├── CustomerOrdersHistory.tsx # Order history
│   │   ├── CustomerSegments.tsx      # RFM segmentation
│   │   └── index.ts
│   ├── CustomerForm/
│   │   └── CustomerForm.tsx          # Create/Edit form
│   └── CustomerList/
│       └── CustomerList.tsx          # List view with filters
├── hooks/
│   ├── existing/
│   │   ├── useCustomerNotes.ts       # Notes management
│   │   ├── useCustomerRFM.ts         # RFM analysis
│   │   └── useCustomerTags.ts        # Tag system
│   └── useCustomersPage.ts           # Main page logic
├── services/
│   └── existing/
│       └── advancedCustomerApi.ts    # Advanced CRM features
├── types/
│   ├── customer.ts                   # Customer types
│   └── index.ts                      # Type exports
└── README.md                         # ⚠️ TO CREATE
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `customers`
- ✅ minimumRole: `OPERADOR` (already set)
- ✅ autoInstall: `false`
- ✅ No dependencies (foundation module)

**Hooks**:
- **PROVIDES**:
  - `customers.profile_sections` - Customer profile extensions
  - `customers.quick_actions` - Quick actions in customer view
  - `dashboard.widgets` - CRM widgets for dashboard

- **CONSUMES**:
  - `sales.order_completed` - Track customer purchase history

**Features** (Optional):
- `customers` - Base CRM
- `customer_service_history` - Service tracking
- `customer_preference_tracking` - Preferences
- `customer_loyalty_program` - Loyalty/points
- `customer_online_reservation` - Reservations

### Database Schema

**Table**: `customers`
```sql
- id: uuid (PK)
- name: text
- email: text (unique)
- phone: text
- address: text
- notes: text
- tags: text[] (array)
- is_active: boolean
- created_at: timestamptz
- updated_at: timestamptz
- location_id: uuid (FK - multi-location)
```

**Related Tables**:
- `customer_notes` - Customer notes history
- `customer_tags` - Tag system
- `sales` - Order history (FK: customer_id)

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1️⃣ AUDIT (30 min)

**Tasks**:
- [ ] Read `src/modules/customers/manifest.tsx`
- [ ] Read `src/pages/admin/core/crm/customers/page.tsx`
- [ ] Check ESLint errors: `pnpm -s exec eslint src/pages/admin/core/crm/customers/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Review database schema (Supabase `customers` table)
- [ ] Test all CRUD operations manually
- [ ] Document current state

**Questions to Answer**:
- How many ESLint/TS errors?
- Are all CRUD operations working?
- Is service layer complete?
- Are RFM analysis, notes, tags working?
- Is permission system integrated?
- Are there unused components?

---

### 2️⃣ FIX STRUCTURE (1 hour)

**Tasks**:
- [ ] Fix ESLint errors in customer files
- [ ] Fix TypeScript errors in customer files
- [ ] Remove unused components (if any)
- [ ] Verify manifest hooks are correct
- [ ] Ensure components use `@/shared/ui` (not direct Chakra imports)
- [ ] Organize imports (group by type)
- [ ] Add permission checks with `usePermissions('customers')`

**Manifest Validation**:
```typescript
// Verify in manifest.tsx
hooks: {
  provide: [
    'customers.profile_sections',
    'customers.quick_actions',
    'dashboard.widgets',
  ],
  consume: [
    'sales.order_completed', // Track purchase history
  ],
}
```

**Permission Integration (Page)**:
```typescript
// In page.tsx
import { usePermissions } from '@/hooks/usePermissions';

const {
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canExport
} = usePermissions('customers');

// Conditional rendering
{canCreate && <Button>Add Customer</Button>}
{canUpdate && <Button onClick={handleEdit}>Edit</Button>}
{canDelete && <Button onClick={handleDelete}>Delete</Button>}
{canExport && <Button>Export CSV</Button>}
```

**Permission Integration (Service Layer)**:
```typescript
// Create: src/pages/admin/core/crm/customers/services/customerApi.ts
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

export const getCustomers = async (user?: AuthUser | null) => {
  if (user) {
    requireModuleAccess(user, 'customers');
  }

  return supabase.from('customers').select('*');
};

export const createCustomer = async (data: Customer, user: AuthUser) => {
  requirePermission(user, 'customers', 'create');

  return supabase.from('customers').insert(data);
};

export const updateCustomer = async (id: string, data: Customer, user: AuthUser) => {
  requirePermission(user, 'customers', 'update');

  return supabase.from('customers').update(data).eq('id', id);
};

export const deleteCustomer = async (id: string, user: AuthUser) => {
  requirePermission(user, 'customers', 'delete');

  return supabase.from('customers').delete().eq('id', id);
};
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)

**Tasks**:
- [ ] Create/verify `customerApi.ts` service layer
- [ ] Test CREATE customer operation
- [ ] Test READ customer operation (list + detail)
- [ ] Test UPDATE customer operation
- [ ] Test DELETE customer operation
- [ ] Verify RFM analysis works (`useCustomerRFM.ts`)
- [ ] Verify notes system works (`useCustomerNotes.ts`)
- [ ] Verify tags system works (`useCustomerTags.ts`)
- [ ] Test search/filter functionality
- [ ] Verify order history integration (consumes `sales.order_completed`)

**CRUD Operations Checklist**:
- [ ] **Create**: Form validation, duplicate email check, Supabase insert
- [ ] **Read**: List view, detail view, filters, search
- [ ] **Update**: Edit form, optimistic updates, Supabase update
- [ ] **Delete**: Confirmation modal, cascade considerations, Supabase delete

**Advanced Features Checklist**:
- [ ] **RFM Analysis**: Recency, Frequency, Monetary scoring
- [ ] **Notes**: Add/view/delete customer notes
- [ ] **Tags**: Add/remove tags, filter by tags
- [ ] **Order History**: Shows all orders from customer (from Sales module)
- [ ] **Segments**: Customer segments based on RFM

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/core/crm/customers/README.md`
- [ ] Document all provided hooks
- [ ] Document all consumed hooks
- [ ] Document database schema
- [ ] Document permission requirements
- [ ] Test integration with Sales module (order history)
- [ ] Test EventBus integration (listen to `sales.order_completed`)
- [ ] Register dashboard widget (customer metrics)

**EventBus Integration**:
```typescript
// In manifest.tsx setup()
const { eventBus } = await import('@/lib/events');

// Listen to sales events to update customer metrics
eventBus.subscribe('sales.order_completed', (event) => {
  const { customerId, orderId, totalAmount } = event.payload;

  logger.info('Customers', 'Order completed for customer', {
    customerId,
    orderId,
    totalAmount
  });

  // Update customer RFM metrics
  // This happens automatically via database triggers
}, { moduleId: 'customers' });
```

**Dashboard Widget Registration**:
```typescript
// In manifest.tsx setup()
registry.addAction(
  'dashboard.widgets',
  () => <CustomersWidget />,
  'customers',
  40 // priority
);
```

**README Template**:
```markdown
# Customers Module (CRM)

Customer Relationship Management functionality.

## Database Tables
- `customers` - Main customer data
- `customer_notes` - Notes history
- `customer_tags` - Tag system

## Features
- Customer CRUD operations
- RFM Analysis (Recency, Frequency, Monetary)
- Notes system
- Tags system
- Order history (integrates with Sales)
- Customer segments

## Provides
- `customers.profile_sections` - Extend customer profiles
- `customers.quick_actions` - Quick actions in customer view
- `dashboard.widgets` - Customer metrics widget

## Consumes
- `sales.order_completed` - Track customer purchase history

## Permissions
- minimumRole: `OPERADOR`
- create: Create new customers
- read: View customer list and details
- update: Edit customer information
- delete: Delete customers
- export: Export customer data

## Service Layer
\`src/pages/admin/core/crm/customers/services/customerApi.ts\`

All API calls include permission validation:
\`\`\`typescript
import { requirePermission } from '@/lib/permissions';

export const createCustomer = async (data: Customer, user: AuthUser) => {
  requirePermission(user, 'customers', 'create');
  return supabase.from('customers').insert(data);
};
\`\`\`
```

---

### 5️⃣ VALIDATION (30 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant (Capabilities → Features → Modules)
- [ ] ✅ Scaffolding ordered (components/, services/, hooks/, types/)
- [ ] ✅ Zero ESLint errors in customers module
- [ ] ✅ Zero TypeScript errors in customers module
- [ ] ✅ Cross-module mapped (README created)
- [ ] ✅ Zero duplication (no repeated CRUD logic)
- [ ] ✅ DB connected (all CRUD via service layer)
- [ ] ✅ Features mapped (optional features in FeatureRegistry)
- [ ] ✅ Permissions designed (minimumRole + usePermissions + service layer)
- [ ] ✅ README complete

**Manual Testing Workflow**:
1. [ ] Create new customer
2. [ ] View customer list
3. [ ] Search/filter customers
4. [ ] Edit customer
5. [ ] Add customer note
6. [ ] Add customer tag
7. [ ] View customer order history (from Sales)
8. [ ] View RFM analysis
9. [ ] Delete customer
10. [ ] Test with different roles (OPERADOR, SUPERVISOR, ADMINISTRADOR)

**Final Validation**:
```bash
pnpm -s exec eslint src/pages/admin/core/crm/customers/
pnpm -s exec eslint src/modules/customers/
pnpm -s exec tsc --noEmit
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui` (Stack, Button, Text, etc.)
- Use `usePermissions('customers')` for UI access control
- Use `requirePermission()` in service layer
- Document all database tables in README
- Handle duplicate email validation
- Keep RFM analysis in separate hook (`useCustomerRFM.ts`)
- Use EventBus to listen to `sales.order_completed`

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Hardcode customer data (use Supabase)
- Skip permission checks in service layer
- Create duplicate CRUD logic
- Forget to validate email uniqueness
- Skip README documentation
- Delete customers with active orders (cascade consideration)

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These** (Pilot Modules):
- `src/pages/admin/supply-chain/materials/` - CRUD pattern, service layer
- `src/pages/admin/operations/sales/` - Integration with customers
- `src/hooks/usePermissions.ts` - Permission hook usage

**Service Layer Pattern**:
- `src/pages/admin/supply-chain/materials/services/inventoryApi.ts` - Permission integration example
- `src/lib/permissions/servicePermissions.ts` - Permission validation functions

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors in customers files
- [ ] 0 TypeScript errors in customers files
- [ ] All 10 production-ready criteria met
- [ ] README.md created with full documentation
- [ ] Permissions integrated (page + service layer)
- [ ] All CRUD operations working
- [ ] RFM analysis working
- [ ] Notes/tags systems working
- [ ] Order history integration working
- [ ] Manual testing passed (10 workflows)

### Integration Verified:
- [ ] Sales module shows customer data in orders
- [ ] Customer order history appears correctly
- [ ] Dashboard shows customer metrics widget
- [ ] EventBus receives `sales.order_completed` events

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/pages/admin/core/crm/customers/
pnpm -s exec eslint src/modules/customers/
pnpm -s exec tsc --noEmit

# Development
pnpm dev  # If not already running

# Database (if needed)
# Check customers table schema in Supabase dashboard
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 30 min
- [ ] Fix Structure: 1 hour
- [ ] Database & Functionality: 1.5 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 30 min

**Total**: 4.5 hours

---

**Status**: 🟢 READY TO START (after Dashboard complete)
**Next Module**: Fulfillment (after Customers complete)
