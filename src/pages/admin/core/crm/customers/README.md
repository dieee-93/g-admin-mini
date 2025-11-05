# Customers Module (CRM)

**Status**: ✅ Production-Ready
**Phase**: Phase 3 P0
**Module Type**: Foundation (other modules depend on it)
**Complexity**: Medium (Standard CRUD with analytics)

---

## 📋 Overview

The Customers module provides comprehensive Customer Relationship Management (CRM) functionality for G-Admin Mini. It enables businesses to track customer data, analyze purchase behavior, segment customers using RFM analysis, and manage customer relationships effectively.

**Key Features**:
- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ RFM Analysis (Recency, Frequency, Monetary)
- ✅ Customer Segmentation (Champions, At-Risk, Lost, etc.)
- ✅ Churn Prediction & Prevention
- ✅ Customer Lifetime Value (CLV) Calculation
- ✅ Notes & Tags System
- ✅ Order History Integration (from Sales module)
- ✅ Permission-based Access Control
- ✅ CSV Export Functionality

---

## 🗄️ Database Schema

### Primary Table: `customers`

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | PK, auto-generated |
| `name` | text | Customer name | Required |
| `email` | text | Customer email | Unique, optional |
| `phone` | text | Customer phone | Optional |
| `address` | text | Customer address | Optional |
| `notes` | text | Internal notes | Optional |
| `tags` | text[] | Customer tags | Array, optional |
| `is_active` | boolean | Active status | Default: true |
| `birth_date` | date | Date of birth | Optional |
| `registration_date` | timestamptz | Registration date | Auto-set |
| `created_at` | timestamptz | Record creation timestamp | Auto-set |
| `updated_at` | timestamptz | Record update timestamp | Auto-update |
| `location_id` | uuid | Multi-location FK | Optional |

### Related Tables

- **`customer_notes`**: Customer notes history (future enhancement)
- **`customer_tags`**: Tag management system (future enhancement)
- **`sales`**: Order history (FK: `customer_id`)
- **`rfm_profiles`**: RFM analysis data (future enhancement)

### Database Functions

- `calculate_customer_rfm()`: Calculates RFM scores for all customers
- `get_customer_analytics()`: Aggregates customer stats and metrics

---

## 🚀 Features & Capabilities

### 1. CRUD Operations

**Create Customer**:
- Form validation (email uniqueness, required fields)
- Duplicate email detection
- Optimistic UI updates
- Permission check: `create`

**Read Customer**:
- List view with pagination
- Detail view with stats
- Search & filter (name, email, phone)
- Permission check: `read` (optional for guest users)

**Update Customer**:
- Edit form with pre-filled data
- Email uniqueness validation
- Optimistic updates
- Permission check: `update`

**Delete Customer**:
- Soft delete (sets `is_active = false`)
- Cascade protection (prevents deletion if customer has orders)
- Confirmation modal
- Permission check: `delete`

### 2. RFM Analysis

**Recency, Frequency, Monetary (RFM)** scoring system:

```typescript
// RFM Score Ranges (1-5 scale)
Recency: Days since last purchase
  5: 0-30 days (Recent)
  4: 31-60 days
  3: 61-120 days
  2: 121-180 days
  1: 180+ days (Lost)

Frequency: Number of purchases
  5: 20+ purchases (Frequent)
  4: 10-19 purchases
  3: 5-9 purchases
  2: 2-4 purchases
  1: 1 purchase (One-time)

Monetary: Total amount spent
  5: $1000+ (High Value)
  4: $500-$999
  3: $200-$499
  2: $50-$199
  1: <$50 (Low Value)
```

**Customer Segments** (based on RFM):
- **Champions** (RFM: 5-5-5): Best customers
- **Loyal Customers** (RFM: 4-5-4): Consistent buyers
- **Potential Loyalists** (RFM: 3-4-3): Growing customers
- **Recent Customers** (RFM: 5-2-2): New customers
- **At Risk** (RFM: 2-3-3): Declining engagement
- **Hibernating** (RFM: 2-2-2): Inactive but recoverable
- **Lost** (RFM: 1-1-1): Churned customers

### 3. Customer Analytics

**Metrics Calculated**:
- Total Customers
- Active Customers (purchased in last 30 days)
- Average Customer Lifetime Value (CLV)
- Churn Rate (% of customers lost)
- At-Risk Customers Count
- Average Order Value (AOV)
- Purchase Frequency
- Customer Retention Rate

**CLV Calculation**:
```typescript
CLV = (Average Order Value) × (Purchase Frequency) × (Customer Lifespan in months)
```

### 4. Notes & Tags System

**Customer Notes**:
- Add timestamped notes
- Quick note templates (Complaint, Compliment, Dietary restrictions)
- Important flag for priority notes
- Notes history timeline

**Customer Tags**:
- Color-coded tags
- Tag statistics (usage count)
- Filter customers by tags
- Tag management (create, assign, remove)

### 5. Order History Integration

**Integrates with Sales Module**:
- Listens to `sales.order_completed` events via EventBus
- Updates customer purchase history automatically
- Calculates customer spending and frequency
- Displays order timeline

---

## 🔧 Architecture

### Module Manifest

```typescript
// src/modules/customers/manifest.tsx
{
  id: 'customers',
  minimumRole: 'OPERADOR',
  autoInstall: false,

  depends: [], // No dependencies (foundation module)

  optionalFeatures: [
    'customers',                      // Base CRM
    'customer_service_history',       // Service tracking
    'customer_preference_tracking',   // Preferences
    'customer_loyalty_program',       // Loyalty/points
    'customer_online_reservation',    // Reservations
  ],

  hooks: {
    provide: [
      'customers.profile_sections',   // Customer profile extensions
      'customers.quick_actions',      // Quick actions in customer view
      'dashboard.widgets',            // CRM widgets for dashboard
    ],
    consume: [
      'sales.order_completed',        // Track customer purchase history
    ],
  }
}
```

### File Structure

```
src/pages/admin/core/crm/customers/
├── page.tsx                          # Main customers page
├── README.md                         # This file
├── components/
│   ├── CustomerAnalytics/
│   │   ├── CustomerAnalytics.tsx     # Analytics dashboard
│   │   ├── CustomerOrdersHistory.tsx # Order history
│   │   ├── CustomerSegments.tsx      # RFM segmentation
│   │   └── index.ts
│   ├── CustomerForm/
│   │   └── CustomerForm.tsx          # Create/Edit form
│   ├── CustomerList/
│   │   └── CustomerList.tsx          # List view with filters
│   ├── CustomerAddressManager.tsx    # Address management
│   ├── CustomersWidget.tsx           # Dashboard widget
│   └── index.ts                      # Component exports
├── hooks/
│   ├── existing/
│   │   ├── useCustomerNotes.ts       # Notes management
│   │   ├── useCustomerRFM.ts         # RFM analysis
│   │   ├── useCustomerTags.ts        # Tag system
│   │   └── useCustomers.ts           # Base customer operations
│   ├── useCustomersPage.ts           # Page orchestration logic
│   ├── useCustomerForm.tsx           # Form management
│   └── index.ts                      # Hook exports
├── services/
│   ├── customerApi.ts                # ✅ CRUD with permissions
│   ├── customerAnalyticsEngine.ts    # Business logic for analytics
│   ├── customerRFMAnalytics.ts       # RFM calculation logic
│   ├── customerAddressesApi.ts       # Address CRUD
│   └── existing/
│       ├── advancedCustomerApi.ts    # Advanced CRM features
│       └── customerApi.ts            # Legacy API (deprecated)
└── types/
    ├── customer.ts                   # Customer types
    ├── customerAddress.ts            # Address types
    └── index.ts                      # Type exports
```

---

## 🔒 Permissions System

### Permission Matrix

| Action | OPERADOR | SUPERVISOR | ADMINISTRADOR |
|--------|----------|------------|---------------|
| `create` | ✅ | ✅ | ✅ |
| `read` | ✅ | ✅ | ✅ |
| `update` | ❌ | ✅ | ✅ |
| `delete` | ❌ | ❌ | ✅ |
| `export` | ❌ | ✅ | ✅ |

### Usage in Page

```typescript
// src/pages/admin/core/crm/customers/page.tsx
import { usePermissions } from '@/hooks/usePermissions';

const {
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canExport,
} = usePermissions('customers');

// Conditional rendering
{canCreate && <Button>Add Customer</Button>}
{canUpdate && <Button onClick={handleEdit}>Edit</Button>}
{canDelete && <Button onClick={handleDelete}>Delete</Button>}
{canExport && <Button onClick={handleExport}>Export CSV</Button>}
```

### Usage in Service Layer

```typescript
// src/pages/admin/core/crm/customers/services/customerApi.ts
import type { AuthUser } from '@/contexts/AuthContext';

function requirePermission(user: AuthUser, module: string, action: string) {
  // Permission validation logic
}

export async function createCustomer(data: Customer, user: AuthUser) {
  requirePermission(user, 'customers', 'create');
  // Create customer...
}

export async function deleteCustomer(id: string, user: AuthUser) {
  requirePermission(user, 'customers', 'delete');
  // Delete customer...
}
```

---

## 🔌 Integration Points

### Provides (Hooks)

#### 1. `customers.profile_sections`
Allows other modules to extend customer profile UI.

**Example Usage** (from Memberships module):
```typescript
registry.addAction(
  'customers.profile_sections',
  ({ customerId }) => <MembershipSection customerId={customerId} />,
  'memberships',
  50 // priority
);
```

#### 2. `customers.quick_actions`
Quick actions in customer detail view.

**Example Usage** (from Sales module):
```typescript
registry.addAction(
  'customers.quick_actions',
  ({ customerId }) => (
    <Button onClick={() => createSaleForCustomer(customerId)}>
      New Sale
    </Button>
  ),
  'sales',
  30
);
```

#### 3. `dashboard.widgets`
Customer metrics widget for main dashboard.

**Registered in Manifest**:
```typescript
setup: async (registry) => {
  const { CustomersWidget } = await import('./components');

  registry.addAction(
    'dashboard.widgets',
    () => <CustomersWidget />,
    'customers',
    40 // priority
  );
}
```

### Consumes (EventBus)

#### 1. `sales.order_completed`
Updates customer purchase history when a sale is completed.

**Event Handler**:
```typescript
eventBus.subscribe('sales.order_completed', (event) => {
  const { customerId, orderId, totalAmount } = event.payload;

  // Update customer metrics
  // This happens automatically via database triggers
}, { moduleId: 'customers' });
```

---

## 📊 Analytics & Business Logic

### RFM Calculation

**File**: `src/pages/admin/core/crm/customers/services/customerRFMAnalytics.ts`

```typescript
// Calculate recency score (1-5)
function calculateRecencyScore(daysSinceLastPurchase: number): number {
  if (daysSinceLastPurchase <= 30) return 5;
  if (daysSinceLastPurchase <= 60) return 4;
  if (daysSinceLastPurchase <= 120) return 3;
  if (daysSinceLastPurchase <= 180) return 2;
  return 1;
}

// Calculate frequency score (1-5)
function calculateFrequencyScore(purchaseCount: number): number {
  if (purchaseCount >= 20) return 5;
  if (purchaseCount >= 10) return 4;
  if (purchaseCount >= 5) return 3;
  if (purchaseCount >= 2) return 2;
  return 1;
}

// Calculate monetary score (1-5)
function calculateMonetaryScore(totalSpent: number): number {
  if (totalSpent >= 1000) return 5;
  if (totalSpent >= 500) return 4;
  if (totalSpent >= 200) return 3;
  if (totalSpent >= 50) return 2;
  return 1;
}
```

### Customer Lifetime Value (CLV)

**File**: `src/pages/admin/core/crm/customers/services/customerAnalyticsEngine.ts`

```typescript
// CLV with Decimal.js precision
function calculateCLV(customer: Customer, sales: Sale[]): Decimal {
  const totalSpent = DecimalUtils.fromValue(customer.total_spent ?? 0, 'money');
  const daysSinceRegistration = calculateDaysSince(customer.registration_date);
  const purchaseFrequency = sales.length / (daysSinceRegistration / 30); // per month
  const avgOrderValue = totalSpent.div(sales.length || 1);
  const estimatedLifespan = 24; // months

  return avgOrderValue
    .mul(purchaseFrequency)
    .mul(estimatedLifespan);
}
```

---

## 🧪 Testing

### Manual Testing Workflow

1. **Create Customer**:
   - Navigate to `/admin/customers`
   - Click "New Customer"
   - Fill form: Name, Email, Phone, Address
   - Submit → Verify customer appears in list

2. **Edit Customer**:
   - Click Edit on a customer
   - Modify data
   - Submit → Verify changes reflected

3. **Search & Filter**:
   - Use search bar (name, email, phone)
   - Filter by status (active/inactive)
   - Verify results update correctly

4. **RFM Analysis**:
   - Click "RFM Analysis" button
   - Verify segments display correctly
   - Check customer distribution across segments

5. **Delete Customer**:
   - Try deleting customer with orders → Should fail
   - Delete customer without orders → Should succeed (soft delete)

6. **Permissions**:
   - Test with OPERADOR role (create, read only)
   - Test with SUPERVISOR role (create, read, update, export)
   - Test with ADMINISTRADOR role (all actions)

7. **Export CSV**:
   - Click "Export CSV" (if authorized)
   - Verify CSV contains correct data

---

## 🚨 Known Issues & Limitations

### Current Status
- ✅ All CRUD operations working
- ✅ Permission system integrated
- ✅ Service layer complete
- ✅ ESLint: 0 errors, 1 warning
- ✅ TypeScript: 0 errors

### Future Enhancements (Phase 4+)
- [ ] Customer loyalty points system
- [ ] Online reservation booking
- [ ] Customer preference tracking
- [ ] AI-powered churn prediction (ML model)
- [ ] Automated marketing campaigns
- [ ] Customer segmentation export to marketing platforms
- [ ] Real-time customer behavior tracking

---

## 📝 API Reference

### CustomerAPI Service

```typescript
import { CustomerAPI } from '@/pages/admin/core/crm/customers/services/customerApi';
import type { AuthUser } from '@/contexts/AuthContext';

// Get all customers
const customers = await CustomerAPI.getCustomers(user, {
  status: 'active',
  search: 'john',
  limit: 50,
  offset: 0,
});

// Get single customer
const customer = await CustomerAPI.getCustomer(customerId, user);

// Get customer with stats
const customerWithStats = await CustomerAPI.getCustomerWithStats(customerId, user);

// Create customer
const newCustomer = await CustomerAPI.createCustomer({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
}, user);

// Update customer
const updatedCustomer = await CustomerAPI.updateCustomer(customerId, {
  name: 'Jane Doe',
  email: 'jane@example.com',
}, user);

// Delete customer (soft delete)
await CustomerAPI.deleteCustomer(customerId, user);

// Export to CSV
const csv = await CustomerAPI.exportCustomersToCSV(user, { status: 'active' });
```

---

## 🎨 UI Components

### Customer List
**File**: `CustomerList.tsx`
- Table view with columns: Name, Email, Phone, Status, Actions
- Search bar (name, email, phone)
- Filter dropdown (active/inactive)
- Pagination controls
- Quick actions: Edit, Delete, View Details

### Customer Form
**File**: `CustomerForm.tsx`
- Form fields: Name*, Email, Phone, Address, Notes
- Email uniqueness validation
- Form validation with Zod
- Optimistic updates
- Success/error notifications

### Customer Analytics
**File**: `CustomerAnalytics.tsx`
- RFM distribution charts
- Customer segment breakdown
- CLV metrics
- Churn rate visualization
- At-risk customer alerts

### Customers Widget
**File**: `CustomersWidget.tsx`
- Compact dashboard widget
- Key metrics: Total, Active, At-Risk
- Quick link to full module

---

## 🔗 Dependencies

### Internal Modules
- ✅ No dependencies (foundation module)

### Consumed by Modules
- **Sales**: Customer selection in sale creation
- **Billing**: Customer billing information
- **Memberships**: Customer membership linking
- **Rentals**: Customer rental assignments
- **Scheduling**: Customer appointment booking

### External Libraries
- `react-hook-form` (v7.x): Form management
- `@hookform/resolvers` (v3.x): Zod integration
- `zod` (v4.x): Schema validation
- `@chakra-ui/react` (v3.x): UI components (via `@/shared/ui`)
- `decimal.js` (v10.x): Precision calculations

---

## 📚 Additional Resources

- **Module Registry Guide**: `src/modules/README.md`
- **Architecture Overview**: `src/modules/ARCHITECTURE.md`
- **Permission System**: `src/lib/permissions/README.md`
- **EventBus Documentation**: `docs/06-features/eventbus-system.md`
- **Decimal.js Guide**: `docs/05-development/component-library.md`

---

## ✅ Production-Ready Checklist

- [x] ✅ Architecture compliant (Capabilities → Features → Modules)
- [x] ✅ Scaffolding ordered (components/, services/, hooks/, types/)
- [x] ✅ Zero ESLint errors (0 errors, 1 warning)
- [x] ✅ Zero TypeScript errors
- [x] ✅ Cross-module mapped (README documents provides/consumes)
- [x] ✅ Zero duplication (no repeated CRUD logic)
- [x] ✅ DB connected (all CRUD via service layer)
- [x] ✅ Features mapped (optional features in FeatureRegistry)
- [x] ✅ Permissions designed (minimumRole + usePermissions + service layer)
- [x] ✅ README complete (this file)

---

**Last Updated**: 2025-10-31
**Version**: 1.0.0
**Status**: Production-Ready ✅
