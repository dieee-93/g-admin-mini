# G-ADMIN MINI - CURRENT ARCHITECTURE

**Last Updated**: 2026-01-10  
**Status**: ✅ **ACTIVE** - Source of Truth  
**Version**: 1.0 (Based on Automated Code Analysis)  
**Supersedes**: `system-architecture-master-plan/`, `docs/architecture-v2/`

---

## 📋 EXECUTIVE SUMMARY

G-Admin Mini is a **multi-business model ERP system** built with modern React/TypeScript architecture. The system supports **12 different business models** through a **capability-based feature activation system**.

### System Health: 88/100 ✅ EXCELLENT

| Metric | Value | Status |
|--------|-------|---------|
| **Feature Implementation** | 94% (103/110) | ✅ Production-ready |
| **Code Architecture** | Modern patterns | ✅ Best practices |
| **Module Count** | 29 modules | ✅ Well-organized |
| **Technical Debt** | Low-Medium | 🟡 Manageable |
| **Test Coverage** | Active | ✅ In progress |

---

## 🎯 SYSTEM OVERVIEW

### What is G-Admin Mini?

A modular ERP system that adapts to different business types by activating/deactivating features based on user-selected capabilities.

**Supported Business Models** (12):
1. **Quick Service Restaurant** - Fast food, food trucks
2. **Table Service Restaurant** - Dine-in restaurants, cafes
3. **Retail Store** - Physical retail, boutiques
4. **Rental Business** - Equipment rental, party rentals
5. **Service Business** - Professional services (salons, consultancies)
6. **Event Venue** - Venues, banquet halls
7. **B2B Distributor** - Wholesale, distribution
8. **Membership Club** - Gyms, co-working spaces
9. **Production Facility** - Manufacturing, bakeries
10. **Digital Products** - Software, courses, downloads
11. **Multi-Location Chain** - Franchises, chains
12. **E-commerce Store** - Online sales

### Architecture Principles

1. **Capability-Driven**: User selects business model → System activates relevant features
2. **Module-Based**: 29 independent modules with clear boundaries
3. **Event-Driven**: Cross-module communication via EventBus
4. **Offline-First**: Full offline support with conflict resolution
5. **Type-Safe**: Strict TypeScript throughout
6. **Data Separation**: TanStack Query for server data, Zustand for UI state

---

## 🏗️ ARCHITECTURE LAYERS

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
│  React Components • Chakra UI v3 • Forms • Validation            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                          │
│  29 Modules • EventBus • HookPoints • Module Registry            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         BUSINESS LAYER                            │
│  Capabilities (12) • Features (110) • Business Rules              │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                               │
│  TanStack Query • Supabase • Offline Storage • Sync              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 MODULE ARCHITECTURE

### 29 Active Modules

#### Core Modules (Always Active)
1. **dashboard** - Main dashboard and widgets
2. **settings** - System configuration
3. **debug** - Development tools

#### Business Domain Modules
4. **sales** - Order management, POS, B2B quotes
5. **products** - Product catalog, variants, pricing
6. **materials** - Inventory, stock tracking
7. **suppliers** - Supplier management
8. **customers** - Customer database, CRM
9. **production** - Manufacturing, recipes, BOM
10. **recipe** - Recipe management for food/manufacturing

#### Operations Modules
11. **fulfillment** - Order fulfillment (3 submodules: delivery, onsite, pickup)
12. **scheduling** - Shift scheduling, calendar
13. **staff** - Employee management, attendance
14. **shift-control** - Real-time shift monitoring

#### Finance Modules
15. **finance-billing** - Invoicing, billing
16. **finance-corporate** - Corporate accounting
17. **finance-fiscal** - Tax management
18. **finance-integrations** - Payment gateways (MercadoPago, MODO)
19. **cash** - Cash drawer, petty cash
20. **cash-management** - Cash flow management

#### Analytics & Intelligence
21. **reporting** - Reports and analytics
22. **intelligence** - Business intelligence, insights
23. **executive** - Executive dashboard, KPIs

#### Specialized Modules
24. **memberships** - Membership plans, subscriptions
25. **rentals** - Rental management
26. **assets** - Asset tracking, depreciation
27. **gamification** - Achievements, badges
28. **mobile** - Mobile-specific features
29. **achievements** - Achievement system

### Module Structure (Standard Pattern)

```
src/modules/{module-name}/
├── manifest.tsx          # Module registration
├── components/           # UI components
│   ├── {Feature}Form.tsx
│   ├── {Feature}List.tsx
│   └── sections/        # Form sections
├── store/               # Zustand stores (UI state only)
│   └── {module}Store.ts
├── services/            # Business logic
├── handlers/            # Event handlers
├── hooks/              # Custom hooks
└── types/              # TypeScript types
```

---

## 🎨 FEATURE SYSTEM

### 110 Features Across 18 Domains

#### Implementation Status: 94% ✅

```
✅ IMPLEMENTED:  103 features (94%)
⚠️  PARTIAL:       7 features (6%)
❌ MISSING:        0 features (0%)
```

#### Feature Distribution by Domain

| Domain | Features | Implemented | Status |
|--------|----------|------------|--------|
| **SALES** | 25 | 22 (88%) | ⚠️ 3 partial |
| **INVENTORY** | 12 | 10 (83%) | ⚠️ 2 partial |
| **OPERATIONS** | 12 | 12 (100%) | ✅ Complete |
| **PRODUCTS** | 8 | 6 (75%) | ⚠️ 2 partial |
| **STAFF** | 6 | 6 (100%) | ✅ Complete |
| **MULTISITE** | 5 | 5 (100%) | ✅ Complete |
| **RENTAL** | 5 | 5 (100%) | ✅ Complete |
| **MEMBERSHIP** | 5 | 5 (100%) | ✅ Complete |
| **PRODUCTION** | 4 | 4 (100%) | ✅ Complete |
| **SCHEDULING** | 4 | 4 (100%) | ✅ Complete |
| **CUSTOMER** | 4 | 4 (100%) | ✅ Complete |
| **FINANCE** | 4 | 4 (100%) | ✅ Complete |
| **ANALYTICS** | 4 | 4 (100%) | ✅ Complete |
| **DIGITAL** | 4 | 4 (100%) | ✅ Complete |
| **MOBILE** | 3 | 3 (100%) | ✅ Complete |
| **CORE** | 3 | 3 (100%) | ✅ Complete |
| **ENGAGEMENT** | 1 | 1 (100%) | ✅ Complete |
| **DEV** | 1 | 1 (100%) | ✅ Complete |

### Key Feature Categories

**Sales Domain (25 features)**:
- `sales_order_management` - Order processing
- `sales_payment_processing` - Payment handling
- `sales_catalog_menu` - Menu/catalog display
- `sales_b2b_quotes` - B2B quote generation
- `sales_discount_management` - Discounts and promotions
- ...and 20 more

**Inventory Domain (12 features)**:
- `inventory_stock_tracking` - Real-time stock levels
- `inventory_low_stock_alerts` - Automated alerts
- `inventory_batch_tracking` - Batch/lot management
- `inventory_multi_location` - Multi-warehouse support
- ...and 8 more

**Operations Domain (12 features)**:
- `operations_pos_interface` - Point of sale
- `operations_order_queue` - Order queue management
- `operations_kitchen_display` - KDS for production
- `operations_table_management` - Table/floor management
- ...and 8 more

*For complete feature list, see: `src/config/FeatureRegistry.ts`*

---

## 🔧 TECHNICAL STACK

### Frontend

```typescript
{
  "framework": "React 18 + TypeScript",
  "ui": "Chakra UI v3",
  "routing": "TanStack Router",
  "state": {
    "serverData": "TanStack Query", // ← Server data ONLY
    "uiState": "Zustand"             // ← UI state ONLY
  },
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "build": "Vite"
}
```

### Backend

```typescript
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "realtime": "Supabase Realtime",
  "storage": "Supabase Storage",
  "offline": "Custom Offline-First System"
}
```

### Key Libraries

- **DecimalUtils** - Financial precision math (723 usages)
- **EventBus** - Cross-module communication
- **ModuleRegistry** - Module management
- **ConflictResolution** - Offline sync conflict handling

---

## 🎯 DATA ARCHITECTURE

### Critical Pattern: Data Layer Separation

**✅ CORRECT PATTERN (Current Implementation)**:

```typescript
// SERVER DATA → TanStack Query
export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const { data } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

// UI STATE → Zustand
export const useMaterialsStore = create<MaterialsUIState>((set) => ({
  // ⚠️ CRITICAL: NO server data here!
  activeTab: 'inventory',
  viewMode: 'grid',
  filters: {},
  modals: { materialForm: { isOpen: false } },
  
  // UI actions only
  setActiveTab: (tab) => set({ activeTab: tab }),
  openModal: () => set({ modals: { materialForm: { isOpen: true } } }),
}));
```

**❌ ANTI-PATTERN (Never Do This)**:

```typescript
// ❌ Server data in Zustand (WRONG!)
export const useMaterialsStore = create((set) => ({
  materials: [],        // ← Server data (WRONG!)
  suppliers: [],        // ← Server data (WRONG!)
  loading: false,
  fetchMaterials: async () => { /* ... */ },
}));

// ❌ useState for server data (WRONG!)
const [suppliers, setSuppliers] = useState([]);
useEffect(() => {
  api.fetch().then(setSuppliers);
}, []);
```

### Data Flow Pattern

```
User Action → Component
     ↓
TanStack Query Mutation → Supabase
     ↓
Query Invalidation → Automatic Refetch
     ↓
Component Re-renders with Fresh Data
```

---

## 🔌 CROSS-MODULE COMMUNICATION

### 3 Communication Patterns

#### 1. **EventBus** - Async, Fire-and-Forget

**Use when**: One module needs to notify others of an event

```typescript
// Emitter (Sales module)
moduleEventBus.emit('sale.completed', { 
  saleId, 
  total, 
  items 
});

// Subscriber (Materials module)
moduleEventBus.subscribe('sale.completed', async (data) => {
  // Deduct stock automatically
  await updateStock(data.items);
});
```

**Event Naming Convention**: `{module}.{entity}.{action}`

**Examples**:
- `sale.completed` - Sale finalized
- `material.stock_low` - Low stock alert
- `production.order.created` - Production order started
- `staff.shift.started` - Employee clocked in

#### 2. **HookPoints** - UI Extension Points

**Use when**: Multiple modules want to add UI to the same location

```typescript
// Provider (Dashboard module)
registry.addAction('dashboard.widgets', () => (
  <MyCustomWidget />
), 'myModule', 100); // priority

// Consumer (Dashboard page)
<HookPoint 
  name="dashboard.widgets" 
  data={{ period: 'week' }}
/>
```

**Common HookPoints**:
- `dashboard.widgets` - Dashboard widgets
- `calendar.events` - Calendar event overlays
- `scheduling.toolbar.actions` - Scheduling toolbar buttons
- `materials.row.actions` - Material row action buttons

#### 3. **Module Exports** - Direct API Calls

**Use when**: Module A needs to call Module B's function directly

```typescript
// Provider (Staff module manifest)
exports: {
  getStaffAvailability: async (date: string) => {
    return staffService.getAvailability(date);
  }
}

// Consumer (Scheduling module)
const staffExports = registry.getExports<StaffAPI>('staff');
const availability = await staffExports.getStaffAvailability('2025-10-15');
```

---

## 🔒 PRECISION & FINANCIAL MATH

### Critical Rule: NEVER Use Native JS Math

**Problem**: JavaScript has floating-point precision errors

```javascript
0.1 + 0.2 = 0.30000000000000004  // ❌
123.45 * 100 = 12344.999999999998 // ❌
```

### ✅ CORRECT: Use DecimalUtils

**Current Adoption**: 723 usages across codebase ✅

```typescript
import { DecimalUtils } from '@/lib/precision';

// ✅ Multiplication
const total = DecimalUtils.multiply(
  price.toString(), 
  quantity.toString(), 
  'financial'  // 2 decimal precision
).toNumber();

// ✅ Apply percentage (tax, discount)
const tax = DecimalUtils.applyPercentage(
  subtotal.toString(), 
  21,  // 21% IVA
  'tax'  // 6 decimal precision
).toNumber();

// ✅ Profit margin
const margin = DecimalUtils.calculateProfitMargin(
  revenue, 
  cost
).toNumber();

// ✅ Reduce pattern (order total)
const orderTotal = items.reduce((sumDec, item) => {
  const itemTotalDec = DecimalUtils.multiply(
    item.price.toString(),
    item.quantity.toString(),
    'financial'
  );
  return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
}, DecimalUtils.fromValue(0, 'financial')).toNumber();
```

### Precision Domains

| Domain | Decimals | Use Cases |
|--------|----------|-----------|
| `financial` | 2 | Sales, pricing, invoices, quotes |
| `recipe` | 3 | Production costs, recipes, overhead |
| `inventory` | 4 | Stock levels, unit conversions |
| `tax` | 6 | Tax calculations (IVA, Ingresos Brutos) |

**Reference**: `CONTRIBUTING.md` (complete DecimalUtils guide)

---

## 🌐 OFFLINE-FIRST ARCHITECTURE

### Offline Infrastructure: ✅ COMPLETE

**Components**:
1. **LocalStorage** - Local data persistence
2. **OfflineMonitor** - Network status tracking
3. **OfflineSync** - Background sync when online
4. **ConflictResolution** - Intelligent conflict handling
5. **ServiceWorker** - Cache management

**Location**: `src/lib/offline/`

### Conflict Resolution Strategies

```typescript
// Tiered conflict resolution
{
  'LWW': ['ui_settings'],           // Last-Write-Wins
  'OT': ['stock_counter'],           // Operational Transform
  'MANUAL': ['invoices', 'sales']    // Manual resolution required
}
```

### Sync Flow

```
User makes change offline
     ↓
Store in LocalStorage
     ↓
Network comes back online
     ↓
OfflineSync detects pending changes
     ↓
Attempt sync to Supabase
     ↓
Conflict detected?
  NO  → Sync successful ✅
  YES → ConflictResolution triggered
        ↓
        Auto-resolve OR notify user
```

---

## 🎨 UI ARCHITECTURE

### Component Pattern

```typescript
// ✅ CORRECT: Use shared UI
import { Box, Button, Stack, Text } from '@/shared/ui';

// ❌ WRONG: Direct Chakra import
import { Box } from '@chakra-ui/react'; // ← Anti-pattern
```

**Current Status**: 
- ⚠️ 302 files still using direct Chakra imports (needs refactor)
- ✅ Pattern established in `@/shared/ui`

### Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.number().positive(),
});

function ProductForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
  });
  
  const mutation = useCreateProduct();
  
  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 📊 ROUTING STRUCTURE

### Route Organization

```
/
├── / (auth)
│   ├── /login
│   ├── /register
│   └── /reset-password
│
└── /admin (protected)
    ├── /dashboard
    │
    ├── /operations
    │   ├── /sales
    │   ├── /production
    │   └── /fulfillment
    │
    ├── /supply-chain
    │   ├── /products
    │   ├── /materials
    │   └── /suppliers
    │
    ├── /resources
    │   ├── /staff
    │   ├── /scheduling
    │   └── /assets
    │
    ├── /finance
    │   ├── /billing
    │   ├── /corporate
    │   ├── /fiscal
    │   └── /integrations
    │
    ├── /analytics
    │   ├── /reporting
    │   ├── /intelligence
    │   └── /executive
    │
    ├── /customer
    │   ├── /customers
    │   └── /memberships
    │
    └── /core
        └── /settings
```

---

## 🔐 PERMISSIONS & RBAC

### Permission System

**Roles** (5 levels):
1. **OWNER** - Full system access
2. **ADMIN** - Administrative access
3. **MANAGER** - Department management
4. **STAFF** - Limited operational access
5. **VIEWER** - Read-only access

### Permission Check Pattern

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MaterialsPage() {
  const {
    canCreate,
    canEdit,
    canDelete,
    canView,
  } = usePermissions('materials');
  
  if (!canView) return <AccessDenied />;
  
  return (
    <>
      {canCreate && <CreateButton />}
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </>
  );
}
```

---

## 🚀 BUILD & DEPLOYMENT

### Build Configuration

```bash
# Development
npm run dev           # Vite dev server (port 5173)

# Production
npm run build         # TypeScript check + Vite build
npm run preview       # Preview production build

# Quality
npm run lint          # ESLint
npm run type-check    # TypeScript compiler check
```

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_ENVIRONMENT=development|staging|production
```

---

## 📚 CODE ORGANIZATION

### Import Aliases

```typescript
import { ... } from '@/shared/ui';           // Shared UI components
import { ... } from '@/modules/{name}';      // Module exports
import { ... } from '@/hooks';               // Custom hooks
import { ... } from '@/lib/{utility}';       // Utilities
import { ... } from '@/config';              // Configuration
import { ... } from '@/types';               // Global types
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `ProductForm.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useSuppliers.ts`)
- **Services**: `camelCase.ts` (e.g., `productService.ts`)
- **Types**: `camelCase.ts` or `types.ts`
- **Stores**: `{name}Store.ts` (e.g., `materialsStore.ts`)

---

## 🐛 KNOWN ISSUES & TECHNICAL DEBT

### Active Issues (As of 2026-01-10)

#### 1. Direct Chakra Imports (HIGH Priority)
- **Affected**: 302 files
- **Impact**: Build coupling, harder UI library migration
- **Fix effort**: 20-30 hours
- **Status**: Refactor needed

#### 2. Module Tight Coupling (MEDIUM Priority)
- **Affected**: 22 files
- **Impact**: Module isolation issues
- **Fix effort**: 10-15 hours
- **Status**: Review needed

#### 3. Partial Features (LOW Priority)
- **Affected**: 7 features (SALES: 3, INVENTORY: 2, PRODUCTS: 2)
- **Impact**: Features not fully implemented
- **Fix effort**: 15-20 hours
- **Status**: Complete implementations

---

## 📖 DOCUMENTATION REFERENCES

### Core Documentation
- **`CONTRIBUTING.md`** - Development guidelines, DecimalUtils guide
- **`CLAUDE.md`** - AI assistant instructions, development rules
- **`README.md`** - Project overview, setup instructions

### Module Documentation
- **`src/modules/README.md`** - Module Registry pattern
- **`docs/cross-module/`** - Cross-module data architecture
- **`docs/permissions/`** - RBAC system documentation
- **`docs/alert/`** - Alert system documentation
- **`docs/cash/`** - Cash management documentation

### Analysis Reports
- **`scripts/architecture-analysis/reports/ANALYSIS_REPORT.md`** - Latest code analysis
- **`scripts/architecture-analysis/reports/import-analysis.json`** - Import anti-patterns
- **`scripts/architecture-analysis/reports/feature-validation.json`** - Feature mapping

---

## 🔄 CHANGELOG

### 2026-01-10 - v1.0 (This Document)
- ✅ Created from automated code analysis
- ✅ Reflects actual system state (94% implementation)
- ✅ Supersedes outdated architectural plans
- ✅ Based on 1,663 file analysis + 110 feature validation

### 2025-01 - Outdated Plans (Archived)
- ❌ `system-architecture-master-plan/` - Claimed 45% implementation
- ❌ `docs/architecture-v2/` - Claimed 81-86 features
- **Status**: Archived, do not reference

---

## 🎯 CONTRIBUTING

### For New Developers

1. **Read First**:
   - This document (architecture overview)
   - `CONTRIBUTING.md` (coding standards, DecimalUtils)
   - `src/modules/README.md` (module patterns)

2. **Setup Local Environment**:
   ```bash
   git clone <repo>
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

3. **Before Committing**:
   - ✅ Run `npm run lint`
   - ✅ Run `npm run type-check`
   - ✅ Test your changes locally
   - ✅ Use DecimalUtils for financial calculations
   - ✅ Use `@/shared/ui` for components (not direct Chakra)

### Architecture Validation

Run automated analysis periodically:

```bash
# Check for import anti-patterns
npx tsx scripts/architecture-analysis/analyze-imports.ts

# Validate feature implementations
npx tsx scripts/architecture-analysis/validate-features.ts
```

---

## 📞 SUPPORT & QUESTIONS

**Architecture Questions**: Review this document + `CONTRIBUTING.md`  
**Module Patterns**: See `src/modules/README.md`  
**Cross-Module Communication**: See `docs/cross-module/`  
**Financial Precision**: See `CONTRIBUTING.md` DecimalUtils section

---

**Document Status**: ✅ ACTIVE  
**Next Review**: Monthly or after major changes  
**Maintained By**: Development Team  
**Last Analysis**: 2026-01-10 (Automated)
