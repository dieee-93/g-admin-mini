# G-ADMIN MINI - ARCHITECTURE MIGRATION PLAN

**Version**: 2.0.0
**Date**: 2025-01-24
**Status**: 📋 PLANNING
**Based On**: ARCHITECTURE_DESIGN_V2.md

---

## 📋 EXECUTIVE SUMMARY

### Migration Overview

**Current Architecture**: 27 modules (As-Is)
**Target Architecture**: 24 modules (To-Be) - 22 core + 2 optional
**Net Reduction**: -3 modules (11% simpler)

**Key Changes**:
- ❌ **DELETE**: Floor module → Merged into Fulfillment/onsite
- ♻️ **RENAME**: Kitchen → Production (multi-industry support)
- 🆕 **CREATE**: Fulfillment, Mobile, Finance modules (+3 new)
- 🔄 **UPDATE**: Sales (add /ecommerce, /b2b subfolders)
- 🔄 **UPDATE**: 8 capabilities → Rename 1 (requires_preparation → production_workflow)
- 🔄 **UPDATE**: 84 features (current) → 81 features (target) → Delete 3, Rename 2, Move 5

### Risk Assessment

**Overall Risk**: 🟡 MEDIUM-HIGH

| Change Type | Risk Level | Mitigation |
|-------------|-----------|------------|
| Floor deletion | 🔴 HIGH | Phased migration, redirect routes, comprehensive testing |
| Kitchen rename | 🟡 MEDIUM | Find/replace, route redirects, update imports |
| New modules | 🟢 LOW | Clean slate, no legacy conflicts |
| Feature renames | 🟡 MEDIUM | Update registries, test capability activation |

### Timeline Estimate

**Total Estimate**: 39-52 days (phased rollout)

| Phase | Duration | Risk | Blockers |
|-------|----------|------|----------|
| **Phase 0.5**: Architecture Migration | 10-14 days | 🔴 HIGH | Breaking changes |
| **Phase 1**: Fulfillment Capabilities | 15-20 days | 🟡 MEDIUM | Phase 0.5 complete |
| **Phase 2**: Mobile Operations | 8-10 days | 🟡 MEDIUM | Phase 1 complete |
| **Phase 3**: B2B Sales | 10-12 days | 🟢 LOW | Phase 0.5 complete |
| **Phase 4**: Service Modes | 5-7 days | 🟢 LOW | Phase 1 complete |

---

## 🎯 PHASE 0.5: ARCHITECTURE MIGRATION (CRITICAL)

**Purpose**: Stabilize core architecture before adding new features
**Duration**: 10-14 days
**Risk**: 🔴 HIGH (breaking changes)

This phase MUST be completed before all other phases.

---

### Step 1: Registry Updates (Day 1)

**Files to Update:**

#### 1.1 Update BusinessModelRegistry.ts

**Changes:**
```typescript
// RENAME CAPABILITY
{
  id: 'requires_preparation', // OLD
  id: 'production_workflow',  // NEW
  name: 'Production Workflow', // NEW
  description: 'Businesses that require production/assembly/preparation workflows',
  activatesFeatures: [
    'production_bom_management',     // RENAMED from production_recipe_management
    'production_display_system',     // RENAMED from production_kitchen_display
    'production_order_queue',
    'production_capacity_planning'
  ]
}

// DELETE CAPABILITY (walkin_service was eliminated - it's an operational mode)
// Walk-in coverage:
// - onsite_service (for products - immediate service at service points)
// - appointment_based (for services - immediate booking option)
```

**Verification:**
```bash
# Check no references to old capability
grep -r "requires_preparation" src/
grep -r "walkin_service" src/

# Should return 0 results for both
```

#### 1.2 Update FeatureRegistry.ts

**Feature Renames:**
```typescript
// BEFORE
production_recipe_management: {
  id: 'production_recipe_management',
  name: 'Recipe Management',
  // ...
}

production_kitchen_display: {
  id: 'production_kitchen_display',
  name: 'Kitchen Display System',
  // ...
}

// AFTER
production_bom_management: {
  id: 'production_bom_management',
  name: 'BOM Management', // BOM = Bill of Materials (universal)
  description: 'Manage production workflows (recipes, assemblies, service protocols)',
  // ...
}

production_display_system: {
  id: 'production_display_system',
  name: 'Production Display System', // PDS (generic)
  description: 'Display system for production queue (KDS, job board, etc.)',
  // ...
}
```

**Features to DELETE:**
```typescript
// DELETE these features (now base architecture, not features)
delete FEATURES.mobile_pos_offline;
delete FEATURES.mobile_sync_management;

// DELETE this feature (duplicate of scheduling_reminder_system)
delete FEATURES.customer_reservation_reminders;
```

**MODULE_FEATURE_MAP Updates:**
```typescript
// UPDATE module mapping
'production': [
  'production_bom_management',      // RENAMED
  'production_display_system',      // RENAMED
  'production_order_queue',
  'production_capacity_planning'
],

'mobile': [
  'mobile_location_tracking',       // GPS tracking
  'mobile_route_planning',          // Route planning
  'mobile_inventory_constraints'    // Capacity limits
  // REMOVED: mobile_pos_offline, mobile_sync_management
],

'fulfillment': [                    // NEW MODULE
  // Onsite features (moved from Floor)
  'operations_table_management',
  'operations_table_assignment',
  'operations_floor_plan_config',
  'operations_waitlist_management',
  // Pickup features
  'operations_pickup_scheduling',
  'sales_pickup_orders',
  // Delivery features
  'operations_delivery_zones',
  'operations_delivery_tracking',
  'sales_delivery_orders',
  // Shared fulfillment features
  'sales_order_management',
  'sales_payment_processing',
  'sales_fulfillment_queue',
  'sales_notification_system'
],

'finance': [                        // NEW MODULE
  'finance_corporate_accounts',
  'finance_credit_management',
  'finance_invoice_scheduling',
  'finance_payment_terms'
]
```

#### 1.2.3 Create New Features (for new modules)

**Features to ADD** (Finance module - 4 NEW features):
```typescript
'finance_corporate_accounts': {
  id: 'finance_corporate_accounts',
  name: 'Cuentas Corporativas',
  description: 'Gestión de cuentas empresariales B2B',
  domain: 'FINANCE',
  category: 'conditional'
},

'finance_credit_management': {
  id: 'finance_credit_management',
  name: 'Gestión de Crédito',
  description: 'Líneas de crédito y términos de pago',
  domain: 'FINANCE',
  category: 'conditional'
},

'finance_invoice_scheduling': {
  id: 'finance_invoice_scheduling',
  name: 'Programación de Facturas',
  description: 'Facturación programada y recurrente',
  domain: 'FINANCE',
  category: 'conditional'
},

'finance_payment_terms': {
  id: 'finance_payment_terms',
  name: 'Términos de Pago',
  description: 'Configuración de términos NET 30/60/90',
  domain: 'FINANCE',
  category: 'conditional'
}
```

**Note**: Mobile and Fulfillment features already exist in FeatureRegistry.ts. Only Finance features need to be created.

**Verification:**
```bash
pnpm -s exec tsc --noEmit  # Type check
pnpm -s exec eslint src/config/  # Lint check
```

---

### Step 2: Delete Floor Module (Day 2-3)

**CRITICAL**: This is a BREAKING CHANGE. Route `/admin/operations/floor` will stop working.

#### 2.1 Create Fulfillment Module Structure

```bash
# Create new module directory
mkdir -p src/modules/fulfillment/{core,onsite,pickup,delivery}
mkdir -p src/pages/admin/operations/fulfillment/{core,onsite,pickup,delivery}
```

#### 2.2 Move Floor Content → Fulfillment/onsite

**Files to MOVE:**
```bash
# Move module manifest
mv src/modules/floor/manifest.tsx src/modules/fulfillment/onsite/manifest.tsx

# Move page components
mv src/pages/admin/operations/floor/* src/pages/admin/operations/fulfillment/onsite/

# Move shared components to fulfillment/core (if any shared logic)
# Review floor components for reusability across onsite/pickup/delivery
```

**Files to UPDATE (imports):**
```typescript
// OLD IMPORTS (search and replace)
import { ... } from '@/modules/floor'
import { ... } from '@/pages/admin/operations/floor'

// NEW IMPORTS
import { ... } from '@/modules/fulfillment/onsite'
import { ... } from '@/pages/admin/operations/fulfillment/onsite'
```

**Find all references:**
```bash
grep -r "from '@/modules/floor'" src/
grep -r "from '@/pages/admin/operations/floor'" src/
```

#### 2.3 Create Fulfillment Core Module Manifest

**File**: `src/modules/fulfillment/manifest.tsx`

```typescript
import type { ModuleManifest } from '@/lib/modules/types';

export const fulfillmentManifest: ModuleManifest = {
  id: 'fulfillment',
  version: '1.0.0',
  depends: ['sales', 'staff', 'materials'],
  autoInstall: false,
  requiredFeatures: ['sales_order_management'], // At least one fulfillment feature

  hooks: {
    provide: [
      'fulfillment.order_ready',
      'fulfillment.toolbar.actions',
      'dashboard.widgets'
    ],
    consume: [
      'sales.order_placed',
      'production.order_ready',
      'materials.stock_updated'
    ]
  },

  setup: async (registry) => {
    // Register hooks when module loads
    const { FulfillmentQueueWidget } = await import('./components/FulfillmentQueueWidget');
    registry.addAction('dashboard.widgets', () => <FulfillmentQueueWidget />, 'fulfillment');

    // Listen to order events
    eventBus.subscribe('sales.order_placed', handleNewOrder, { moduleId: 'fulfillment' });
  },

  exports: {
    components: {
      FulfillmentQueue: () => import('./components/FulfillmentQueue'),
    },
    services: {
      fulfillmentService: () => import('./services/fulfillmentService'),
    }
  }
};
```

#### 2.4 Delete Floor Module

```bash
# ONLY after content moved and tested
rm -rf src/modules/floor
rm -rf src/pages/admin/operations/floor
```

#### 2.5 Add Route Redirects

**File**: `src/config/routes.ts`

```typescript
// Add redirect for old Floor routes
const LEGACY_REDIRECTS = {
  '/admin/operations/floor': '/admin/operations/fulfillment/onsite',
  '/admin/operations/floor/tables': '/admin/operations/fulfillment/onsite',
  '/admin/operations/floor/waitlist': '/admin/operations/fulfillment/onsite',
} as const;

// In router setup
export const router = createBrowserRouter([
  // ... other routes

  // Legacy redirects
  ...Object.entries(LEGACY_REDIRECTS).map(([from, to]) => ({
    path: from,
    element: <Navigate to={to} replace />,
  })),
]);
```

**Verification:**
```bash
# Check no remaining references to floor module
grep -r "modules/floor" src/
grep -r "operations/floor" src/

# Should return 0 results
```

---

### Step 2.5: Merge Ecommerce → Sales/ecommerce (Day 3)

**MEDIUM RISK**: Module merge, affects online store functionality.

#### 2.5.1 Create Sales/ecommerce Subfolder

```bash
# Create ecommerce subfolder in Sales module
mkdir -p src/modules/sales/ecommerce
mkdir -p src/pages/admin/operations/sales/ecommerce
```

#### 2.5.2 Move Ecommerce Content → Sales/ecommerce

**Files to MOVE:**
```bash
# Move module components/services/hooks
mv src/modules/ecommerce/components/* src/modules/sales/ecommerce/components/
mv src/modules/ecommerce/services/* src/modules/sales/ecommerce/services/
mv src/modules/ecommerce/hooks/* src/modules/sales/ecommerce/hooks/

# Move page components
mv src/pages/admin/ecommerce/* src/pages/admin/operations/sales/ecommerce/
```

**Files to UPDATE (imports):**
```typescript
// OLD IMPORTS (search and replace)
import { ... } from '@/modules/ecommerce'
import { ... } from '@/pages/admin/ecommerce'

// NEW IMPORTS
import { ... } from '@/modules/sales/ecommerce'
import { ... } from '@/pages/admin/operations/sales/ecommerce'
```

**Find all references:**
```bash
grep -r "from '@/modules/ecommerce'" src/
grep -r "from '@/pages/admin/ecommerce'" src/
```

#### 2.5.3 Update Sales Module Manifest

**File**: `src/modules/sales/manifest.tsx`

```typescript
// Add ecommerce hooks to Sales module manifest
hooks: {
  provide: [
    'sales.order_placed',
    'sales.tabs',  // NEW - ecommerce will inject here
    // ... existing hooks
  ]
},

// Register ecommerce sub-module in setup
setup: async (registry) => {
  // ... existing setup

  // Register ecommerce tab if online_store capability active
  if (hasCapability('online_store')) {
    const { OnlineOrdersTab } = await import('./ecommerce/components/OnlineOrdersTab');
    registry.addAction('sales.tabs', () => <OnlineOrdersTab />, 'sales');
  }
}
```

#### 2.5.4 Delete Ecommerce Module

```bash
# ONLY after content moved and tested
rm -rf src/modules/ecommerce
rm -rf src/pages/admin/ecommerce
```

#### 2.5.5 Add Route Redirects

**File**: `src/config/routes.ts`

```typescript
const LEGACY_REDIRECTS = {
  // ... existing redirects
  '/admin/ecommerce': '/admin/operations/sales/ecommerce',
  '/admin/ecommerce/catalog': '/admin/operations/sales/ecommerce/catalog',
  '/admin/ecommerce/orders': '/admin/operations/sales/ecommerce/orders',
} as const;
```

**Verification:**
```bash
# Check no remaining references to ecommerce module
grep -r "modules/ecommerce" src/
grep -r "pages/admin/ecommerce" src/

# Should return 0 results
```

---

### Step 3: Rename Kitchen → Production (Day 4-5)

**MEDIUM RISK**: Route changes, but less complex than Floor deletion.

#### 3.1 Rename Module Directory

```bash
# Rename module
mv src/modules/kitchen src/modules/production

# Rename page directory
mv src/pages/admin/operations/kitchen src/pages/admin/operations/production
```

#### 3.2 Update Module Manifest

**File**: `src/modules/production/manifest.tsx`

```typescript
export const productionManifest: ModuleManifest = {
  id: 'production',  // RENAMED from 'kitchen'
  version: '2.0.0',  // Version bump
  depends: ['sales', 'materials'],
  autoInstall: true,  // Link module
  requiredFeatures: [
    'production_bom_management',      // RENAMED feature
    'production_display_system',      // RENAMED feature
  ],

  // ... rest of manifest
};
```

#### 3.3 Update All Imports

**Find all references:**
```bash
grep -r "from '@/modules/kitchen'" src/
grep -r "from '@/pages/admin/operations/kitchen'" src/
grep -r "'kitchen'" src/  # Hook names, event names
```

**Replace:**
```typescript
// OLD
import { ... } from '@/modules/kitchen'
import { ... } from '@/pages/admin/operations/kitchen'

// NEW
import { ... } from '@/modules/production'
import { ... } from '@/pages/admin/operations/production'
```

**Hook names:**
```typescript
// OLD
'kitchen.order_ready'
'kitchen.display.orders'
'kitchen.ingredient_check'

// NEW - DECISION: Option B (breaking change, consistent naming)
'production.order_ready'
'production.display.orders'
'production.ingredient_check'
```

**✅ ARCHITECTURAL DECISION**: Use Option B (rename hooks)

**Rationale**:
1. ✅ Consistent naming: Module = production, hooks = production.*
2. ✅ Clean break: Better for multi-industry support (generic terminology)
3. ✅ Now is the time: Phase 0.5 already has breaking changes, consolidate them
4. ⚠️ Breaking change impact: Documented in Section "Breaking Changes Summary"

**Migration Required**:
```bash
# Find all hook consumers
grep -r "kitchen\.order_ready" src/
grep -r "kitchen\.display" src/
grep -r "kitchen\.ingredient" src/

# Update to new hook names
# Files to update: Any module consuming kitchen.* hooks
```

#### 3.4 Update UI Labels (Configurable)

**File**: `src/pages/admin/core/settings/components/BusinessProfile/BusinessProfileSection.tsx`

```typescript
// Add terminology configuration
const PRODUCTION_TERMINOLOGY = {
  gastronomy: {
    bom_label: 'Recipe',
    display_label: 'Kitchen Display',
    operator_label: 'Cook',
    module_name: 'Kitchen'
  },
  manufacturing: {
    bom_label: 'BOM',
    display_label: 'Production Display',
    operator_label: 'Operator',
    module_name: 'Production'
  },
  workshop: {
    bom_label: 'Work Order',
    display_label: 'Job Board',
    operator_label: 'Technician',
    module_name: 'Workshop'
  },
  salon: {
    bom_label: 'Service Protocol',
    display_label: 'Treatment Display',
    operator_label: 'Stylist',
    module_name: 'Salon'
  }
} as const;

// Use in Business Profile settings
const terminology = PRODUCTION_TERMINOLOGY[businessProfile.industry];
```

**Implementation Details (Complete Spec)**:

**1. Storage** (Database):
```sql
-- Add to business_profiles table
ALTER TABLE business_profiles
ADD COLUMN terminology_config JSONB DEFAULT '{"industry": "gastronomy"}'::jsonb;

-- Example stored value:
-- {"industry": "gastronomy", "custom_labels": {...}}
```

**2. Retrieval** (Zustand Store):
```typescript
// src/stores/businessProfileStore.ts
export const useBusinessProfileStore = create((set, get) => ({
  // ... existing fields
  terminologyConfig: { industry: 'gastronomy' },

  loadTerminologyConfig: async () => {
    const { data } = await supabase
      .from('business_profiles')
      .select('terminology_config')
      .single();
    set({ terminologyConfig: data.terminology_config });
  },

  getProductionTerminology: () => {
    const { terminologyConfig } = get();
    return PRODUCTION_TERMINOLOGY[terminologyConfig.industry];
  }
}));
```

**3. Application** (Component Usage):
```typescript
// In Production module components
const ProductionPage = () => {
  const { getProductionTerminology } = useBusinessProfileStore();
  const labels = getProductionTerminology();

  return (
    <Box>
      <Heading>{labels.module_name}</Heading>  {/* "Kitchen" or "Production" */}
      <Button>{labels.bom_label} Manager</Button>  {/* "Recipe" or "BOM" */}
      <Text>{labels.display_label}</Text>  {/* "Kitchen Display" or "Production Display" */}
    </Box>
  );
};
```

**4. When Applied** (Lifecycle):
- On app load: `loadTerminologyConfig()` called in App.tsx
- On settings change: Save to database → reload store
- In components: Real-time via Zustand reactivity

#### 3.5 Add Route Redirects

**File**: `src/config/routes.ts`

```typescript
const LEGACY_REDIRECTS = {
  // ... existing redirects
  '/admin/operations/kitchen': '/admin/operations/production',
} as const;
```

**Verification:**
```bash
# Check no remaining references to kitchen module
grep -r "modules/kitchen" src/
grep -r "operations/kitchen" src/

# Should return 0 results
```

---

### Step 4: Update Module Registry (Day 6)

**File**: `src/modules/index.ts`

#### 4.1 Register New Modules

```typescript
import { fulfillmentManifest } from './fulfillment/manifest';
import { mobileManifest } from './mobile/manifest';
import { financeManifest } from './finance/manifest';

export const moduleManifests = [
  // ... existing modules

  // NEW MODULES
  fulfillmentManifest,  // NEW
  mobileManifest,       // NEW
  financeManifest,      // NEW

  // RENAMED MODULE
  productionManifest,   // Was kitchenManifest

  // DELETED MODULES:
  // - floorManifest (removed - merged into Fulfillment/onsite)
  // - ecommerceManifest (removed - merged into Sales/ecommerce)
];
```

#### 4.2 Update Module Count

```typescript
// Update comments
/**
 * G-Admin Mini Module Registry
 *
 * Total Modules: 24 (reduced from 27)
 *  - 22 core modules (always available)
 *  - 2 optional modules (Rentals, Assets)
 *
 * Changes:
 *  - 3 NEW: Fulfillment, Mobile, Finance
 *  - 2 DELETED: Floor (merged into Fulfillment/onsite), Ecommerce (merged into Sales/ecommerce)
 *  - 1 RENAMED: Kitchen → Production
 *  - Net reduction: -3 modules (11% simpler)
 */
```

**Verification:**
```bash
pnpm -s exec tsc --noEmit  # Type check
pnpm dev  # Start dev server, check module loading
```

---

### Step 5: Update Navigation (Day 7)

**File**: `src/contexts/NavigationContext.tsx`

#### 5.1 Update Route Definitions

```typescript
const ROUTES = {
  // ... existing routes

  // UPDATED ROUTES
  fulfillment: '/admin/operations/fulfillment',      // NEW (replaces floor)
  fulfillmentOnsite: '/admin/operations/fulfillment/onsite',
  fulfillmentPickup: '/admin/operations/fulfillment/pickup',
  fulfillmentDelivery: '/admin/operations/fulfillment/delivery',

  production: '/admin/operations/production',        // RENAMED from kitchen

  mobile: '/admin/operations/mobile',                // NEW
  finance: '/admin/finance',                         // NEW

  // DELETED: floor routes
} as const;
```

#### 5.2 Update Navigation Menu Items

```typescript
// Update navigation categories
const OPERATIONS_NAV = [
  {
    label: 'Sales',
    route: ROUTES.sales,
    icon: ShoppingCart,
    requiredFeatures: ['sales_order_management']
  },
  {
    label: 'Fulfillment',  // NEW (replaces Floor)
    route: ROUTES.fulfillment,
    icon: Package,
    requiredFeatures: ['sales_order_management'], // At least one fulfillment feature
    children: [
      {
        label: 'Onsite Service',
        route: ROUTES.fulfillmentOnsite,
        requiredFeatures: ['operations_table_management']
      },
      {
        label: 'Pickup Orders',
        route: ROUTES.fulfillmentPickup,
        requiredFeatures: ['sales_pickup_orders']
      },
      {
        label: 'Delivery',
        route: ROUTES.fulfillmentDelivery,
        requiredFeatures: ['sales_delivery_orders']
      }
    ]
  },
  {
    label: 'Production',  // RENAMED from Kitchen
    route: ROUTES.production,
    icon: Factory,
    requiredFeatures: ['production_bom_management']
  },
  {
    label: 'Mobile Operations',  // NEW
    route: ROUTES.mobile,
    icon: Truck,
    requiredFeatures: ['mobile_location_tracking']
  },
  // DELETED: Floor menu item
];

const FINANCE_NAV = [
  // ... existing items
  {
    label: 'Corporate Accounts',  // NEW
    route: ROUTES.finance,
    icon: Building,
    requiredFeatures: ['finance_corporate_accounts']
  },
];
```

**Verification:**
```bash
pnpm dev
# Navigate to /admin/operations
# Check Fulfillment, Production, Mobile items appear
# Check Floor item removed
```

---

### Step 6: Database Migration (Day 8)

**IMPORTANT**: These changes are NON-BREAKING (additive only).

#### 6.1 Create Migration File

**File**: `database/migrations/20250124_architecture_v2_migration.sql`

```sql
-- =====================================================
-- G-Admin Mini - Architecture V2 Migration
-- Date: 2025-01-24
-- Breaking Changes: YES (feature renames)
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Update Feature Flags
-- =====================================================

-- Rename features in business_capabilities table (if using feature flags table)
UPDATE business_capabilities
SET feature_id = 'production_bom_management'
WHERE feature_id = 'production_recipe_management';

UPDATE business_capabilities
SET feature_id = 'production_display_system'
WHERE feature_id = 'production_kitchen_display';

-- Delete obsolete features
DELETE FROM business_capabilities
WHERE feature_id IN (
  'mobile_pos_offline',
  'mobile_sync_management',
  'customer_reservation_reminders'
);

-- =====================================================
-- STEP 2: Rename Capability
-- =====================================================

UPDATE business_capabilities
SET capability_id = 'production_workflow'
WHERE capability_id = 'requires_preparation';

-- =====================================================
-- STEP 3: Create Tables for New Modules (if needed)
-- =====================================================

-- Fulfillment tracking table
CREATE TABLE IF NOT EXISTS fulfillment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('onsite', 'pickup', 'delivery')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'ready', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES users(id),
  priority INTEGER DEFAULT 0,
  estimated_ready_time TIMESTAMPTZ,
  actual_ready_time TIMESTAMPTZ,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile operations tracking
CREATE TABLE IF NOT EXISTS mobile_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  route_date DATE NOT NULL,
  driver_id UUID REFERENCES users(id),
  vehicle_id UUID,
  start_location JSONB,  -- { lat, lng, address }
  end_location JSONB,
  waypoints JSONB[],     -- Array of { lat, lng, address, order_id, status }
  status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate accounts (Finance module)
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  credit_limit DECIMAL(12, 2) DEFAULT 0.00,
  current_balance DECIMAL(12, 2) DEFAULT 0.00,
  payment_terms INTEGER DEFAULT 30,  -- NET 30, NET 60, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 4: Add RLS Policies
-- =====================================================

ALTER TABLE fulfillment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see fulfillment queue for their location
CREATE POLICY fulfillment_queue_location_policy ON fulfillment_queue
  FOR SELECT
  USING (
    location_id = (SELECT location_id FROM users WHERE id = auth.uid())
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- =====================================================
-- STEP 5: Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_order ON fulfillment_queue(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_status ON fulfillment_queue(status);
CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_location ON fulfillment_queue(location_id);

CREATE INDEX IF NOT EXISTS idx_mobile_routes_driver ON mobile_routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_mobile_routes_date ON mobile_routes(route_date);

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_customer ON corporate_accounts(customer_id);

COMMIT;

-- =====================================================
-- Rollback Instructions (if needed)
-- =====================================================

/*
BEGIN;

-- Rollback feature renames
UPDATE business_capabilities
SET feature_id = 'production_recipe_management'
WHERE feature_id = 'production_bom_management';

UPDATE business_capabilities
SET feature_id = 'production_kitchen_display'
WHERE feature_id = 'production_display_system';

-- Rollback capability rename
UPDATE business_capabilities
SET capability_id = 'requires_preparation'
WHERE capability_id = 'production_workflow';

-- Drop new tables (if no data)
DROP TABLE IF EXISTS fulfillment_queue;
DROP TABLE IF EXISTS mobile_routes;
DROP TABLE IF EXISTS corporate_accounts;

COMMIT;
*/
```

#### 6.2 Run Migration

```bash
# Connect to Supabase
psql -h <SUPABASE_HOST> -U postgres -d <DATABASE_NAME>

# Run migration
\i database/migrations/20250124_architecture_v2_migration.sql

# Verify
SELECT * FROM business_capabilities WHERE capability_id = 'production_workflow';
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'fulfillment%';
```

**Verification:**
```sql
-- Check feature renames
SELECT feature_id, COUNT(*) FROM business_capabilities
WHERE feature_id LIKE 'production_%'
GROUP BY feature_id;

-- Should see:
-- production_bom_management
-- production_display_system
-- production_order_queue
-- production_capacity_planning

-- Check new tables exist
\dt fulfillment_queue
\dt mobile_routes
\dt corporate_accounts
```

---

### Step 7: Update Tests (Day 9)

**Files to Update:**

#### 7.1 Update Unit Tests

```bash
# Find all test files referencing old modules
grep -r "modules/floor" src/__tests__/
grep -r "modules/kitchen" src/__tests__/
grep -r "requires_preparation" src/__tests__/
```

**Update test imports:**
```typescript
// OLD
import { ... } from '@/modules/floor';
import { ... } from '@/modules/kitchen';

// NEW
import { ... } from '@/modules/fulfillment/onsite';
import { ... } from '@/modules/production';
```

#### 7.2 Update E2E Tests

**Files**: `src/__tests__/e2e/*.test.tsx`

```typescript
// Update route tests
describe('Floor module', () => {
  // DELETE this test suite OR rename to Fulfillment
});

describe('Fulfillment module', () => {
  it('should render onsite fulfillment page', () => {
    render(<App />);
    navigate('/admin/operations/fulfillment/onsite');
    expect(screen.getByText('Onsite Fulfillment')).toBeInTheDocument();
  });

  it('should redirect old floor route', () => {
    navigate('/admin/operations/floor');
    expect(window.location.pathname).toBe('/admin/operations/fulfillment/onsite');
  });
});

describe('Production module', () => {
  it('should render production page', () => {
    render(<App />);
    navigate('/admin/operations/production');
    expect(screen.getByText('Production')).toBeInTheDocument();
  });
});
```

**Verification:**
```bash
pnpm test:run  # Run all tests
pnpm test:coverage  # Check coverage maintained
```

---

### Step 8: Update Documentation (Day 10)

**Files to Update:**

#### 8.1 Update CLAUDE.md

```markdown
## Module Registry System

**Module Structure**:
\`\`\`
src/modules/
├── [module-name]/
│   └── manifest.tsx
└── index.ts
\`\`\`

**Total Modules**: 22 (reduced from 27)

**Key Modules**:
- \`fulfillment\` (NEW) - Unified order fulfillment (onsite, pickup, delivery)
- \`production\` (RENAMED from kitchen) - Production workflows
- \`mobile\` (NEW) - Location services (GPS, routes)
- \`finance\` (NEW) - B2B accounts, credit management

**Deleted Modules**:
- \`floor\` - Merged into fulfillment/onsite
```

#### 8.2 Create Module READMEs

**New files to create:**

1. `src/modules/fulfillment/README.md`
2. `src/modules/production/README.md` (update existing kitchen README)
3. `src/modules/mobile/README.md`
4. `src/modules/finance/README.md`

**Template** (see Section 3.2 of PRODUCTION_PLAN.md):
```markdown
# Fulfillment Module

## Production Status
- [x] Manifest complete
- [ ] DB connected
- [ ] UI functional
- [ ] Cross-module mapped
- [ ] 0 lint/TS errors

## Core Functionality
- Unified order fulfillment (onsite, pickup, delivery)
- 76% shared logic across fulfillment types
- Replaces Floor module

## Cross-Module Integration

### This module PROVIDES:
- Hook \`fulfillment.order_ready\` → Sales, Kitchen
- Widget \`dashboard.fulfillment-queue\` → Dashboard

### This module CONSUMES:
- Hook \`sales.order_placed\` ← Sales
- Hook \`production.order_ready\` ← Production
- Store \`materialsStore\` ← Materials

## Feature Activation
- Required: \`sales_order_management\`
- Optional: \`operations_table_management\`, \`sales_pickup_orders\`, \`sales_delivery_orders\`
```

---

### Step 9: Smoke Testing (Day 11-12)

**Critical Workflows to Test:**

#### 9.1 Module Loading

```bash
# Start dev server
pnpm dev

# Open browser DevTools → Console
# Check for errors related to:
# - Module registration
# - Hook registration
# - Feature activation
```

**Expected output:**
```
[ModuleRegistry] Loading 22 modules...
[ModuleRegistry] Loaded: fulfillment (NEW)
[ModuleRegistry] Loaded: production (RENAMED from kitchen)
[ModuleRegistry] Loaded: mobile (NEW)
[ModuleRegistry] Loaded: finance (NEW)
[ModuleRegistry] SKIPPED: floor (deleted)
```

#### 9.2 Navigation Testing

**Test routes:**
```
✅ /admin/operations/fulfillment/onsite → Loads
✅ /admin/operations/fulfillment/pickup → Loads (if feature active)
✅ /admin/operations/fulfillment/delivery → Loads (if feature active)
✅ /admin/operations/production → Loads
✅ /admin/operations/mobile → Loads (if feature active)
✅ /admin/finance → Loads (if feature active)

🔄 /admin/operations/floor → Redirects to /fulfillment/onsite
🔄 /admin/operations/kitchen → Redirects to /production
```

#### 9.3 Feature Activation Testing

**Test capability → feature → module activation:**

```typescript
// In browser console or test file
import { hasFeature } from '@/lib/capabilities';
import { getActiveModules } from '@/lib/modules/ModuleRegistry';

// Check production_workflow capability
const hasProductionWorkflow = hasFeature('production_bom_management');
console.log('Has production capability:', hasProductionWorkflow);

// Check modules loaded
const activeModules = getActiveModules();
console.log('Active modules:', activeModules.map(m => m.id));

// Should include 'production' if production_workflow active
// Should include 'fulfillment' if any fulfillment feature active
```

#### 9.4 Cross-Module Integration Testing

**Test hook system:**

```typescript
// In Fulfillment page, check Sales hooks work
// Expected: Sales.order_placed event → Fulfillment queue updates
// Expected: Production.order_ready event → Fulfillment notifies customer
```

**Manual test:**
1. Create sale in Sales module
2. Verify order appears in Fulfillment queue
3. If production_workflow active, verify order sent to Production
4. Mark production ready, verify Fulfillment notified
5. Complete fulfillment, verify Materials stock updated

---

### Step 10: Rollback Plan (Day 13-14)

**IF** critical issues found during testing:

#### 10.1 Emergency Rollback (Git)

```bash
# Rollback to before Phase 0.5
git log --oneline  # Find commit before migration
git revert <commit-hash>  # Revert migration commit

# OR reset to before migration (DESTRUCTIVE)
git reset --hard <commit-hash>
```

#### 10.2 Database Rollback

```sql
-- Run rollback section from migration file
-- (See Step 6.1 - Rollback Instructions)
```

#### 10.3 Gradual Fix Approach (Preferred)

Instead of full rollback, fix issues iteratively:

**Common Issues & Fixes:**

| Issue | Fix |
|-------|-----|
| Floor routes 404 | Check redirect config in routes.ts |
| Module not loading | Check manifest registration in modules/index.ts |
| Feature not activating | Check FeatureRegistry mapping |
| Import errors | Check all import paths updated |
| Hook not working | Check hook registration in manifest setup() |

**Debugging Tools:**
```bash
# Find broken imports
pnpm -s exec tsc --noEmit | grep "Cannot find module"

# Find remaining references to deleted modules
grep -r "modules/floor" src/
grep -r "modules/kitchen" src/
```

---

## ✅ PHASE 0.5 COMPLETION CHECKLIST

**Before proceeding to Phase 1-4:**

### Registry Updates
- [x] BusinessModelRegistry.ts updated (capability renamed)
- [x] FeatureRegistry.ts updated (features renamed/deleted)
- [x] MODULE_FEATURE_MAP updated (22 modules)

### Module Changes
- [x] Floor module deleted (merged into Fulfillment/onsite)
- [x] Ecommerce module deleted (merged into Sales/ecommerce)
- [x] Fulfillment module created (manifest + skeleton)
- [x] Kitchen renamed to Production
- [x] Mobile module created (skeleton)
- [x] Finance module created (skeleton)

### Code Updates
- [x] All imports updated (floor → fulfillment/onsite)
- [x] All imports updated (kitchen → production)
- [x] Route redirects added (floor → fulfillment, kitchen → production)
- [ ] Navigation updated (menu items, badges)

### Database
- [ ] Migration executed successfully
- [ ] New tables created (fulfillment_queue, mobile_routes, corporate_accounts)
- [ ] Feature flags updated
- [ ] RLS policies applied

### Testing
- [ ] Unit tests updated
- [ ] E2E tests updated
- [ ] Smoke testing passed
- [ ] No 404 errors on legacy routes
- [ ] Module loading verified

### Documentation
- [ ] CLAUDE.md updated
- [ ] Module READMEs created (Fulfillment, Production, Mobile, Finance)
- [ ] Migration notes documented

### Quality Checks
- [x] 0 TypeScript errors: `pnpm -s exec tsc --noEmit`
- [x] 0 ESLint errors in changed files: `pnpm -s exec eslint src/`
- [ ] Dev server starts: `pnpm dev`
- [ ] Production build works: `pnpm build`

---

## ✅ PRODUCTION_PLAN PHASE 1 COMPLETION (2025-01-25)

**Status**: ✅ COMPLETE - All 3 Pilot Modules Production-Ready

### Pilot Modules - Production-Ready Checklist (8/10 each)

#### 1. Materials Module
- [x] 0 ESLint errors (2 fixed)
- [x] 0 TypeScript errors
- [x] README complete with cross-module integration
- [x] 5 hooks provided, 4 hooks consumed
- [x] Foundation module pattern
- **Score**: 8/10 (80%) - READY ✅

#### 2. Sales Module
- [x] 0 ESLint errors (187 fixed)
- [x] 0 TypeScript errors
- [x] README created with cross-module documentation
- [x] 8 hooks provided, 2 hooks consumed
- [x] Sub-modules documented (Ecommerce, B2B)
- **Score**: 8/10 (80%) - READY ✅

#### 3. Production Module (formerly Kitchen)
- [x] 0 ESLint errors (13 fixed)
- [x] 0 TypeScript errors
- [x] README updated (Kitchen → Production migration)
- [x] 2 hooks provided, 2 hooks consumed
- [x] Link module pattern (depends on Materials)
- [x] Sub-module documented (Kitchen Display)
- [x] KitchenOrder type defined
- **Score**: 8/10 (80%) - READY ✅

### Phase 1 Metrics
- **Total errors fixed**: 202 (ESLint)
- **READMEs created/updated**: 3
- **New types defined**: 1 (KitchenOrder interface)
- **Hooks documented**: 15 provided + 8 consumed
- **Time spent**: ~1 hour
- **Completion date**: 2025-01-25

### Pending for Phase 2
- [ ] Permissions system implementation (criterion 9/10)
- [ ] Role-based access control (criterion 10/10)

---

## 🚀 PHASES 1-4: IMPLEMENTATION (AFTER PHASE 0.5)

**IMPORTANT**: These phases can ONLY start after Phase 0.5 is COMPLETE.

---

### Phase 1: Fulfillment Capabilities (15-20 days)

**Goal**: Complete Fulfillment module with onsite, pickup, delivery submodules

**Tasks:**
1. Implement Fulfillment/core (shared 76% logic)
   - Order queue management
   - Payment processing integration
   - Notification system
   - Status tracking

2. Implement Fulfillment/onsite (from Floor module)
   - Table management
   - Floor plan configuration
   - Waitlist management
   - Dine-in order flow

3. Implement Fulfillment/pickup
   - Pickup time slot management
   - Curbside pickup
   - QR code pickup confirmation
   - Customer notification

4. Implement Fulfillment/delivery
   - Delivery zone configuration
   - GPS tracking integration (uses Mobile module)
   - Driver assignment
   - Delivery status tracking

5. Integration testing
   - Sales → Fulfillment flow
   - Production → Fulfillment flow
   - Materials → Fulfillment (stock validation)

**Dependencies**: Phase 0.5 complete
**Risk**: 🟡 MEDIUM (complex cross-module integration)

---

### Phase 2: Mobile Operations (8-10 days)

**Goal**: Complete Mobile module for no-fixed-location businesses

**Tasks:**
1. Implement location services
   - GPS tracking integration (Google Maps API)
   - Real-time location updates
   - Map visualization

2. Implement route planning
   - Daily route creation
   - Waypoint optimization
   - Performance analytics

3. Implement mobile inventory
   - Capacity constraints (truck/booth limits)
   - Mobile stock tracking
   - Sync with Materials module

4. Integration with Delivery
   - Share GPS tracking with Fulfillment/delivery
   - Driver route optimization

**Dependencies**: Phase 0.5 complete, Materials module functional
**Risk**: 🟡 MEDIUM (external API integration)

---

### Phase 3: B2B Sales (10-12 days)

**Goal**: Complete Finance module + Sales B2B subfolder

**Tasks:**
1. Implement Finance module
   - Corporate accounts CRUD
   - Credit limit management
   - AR aging report
   - Payment term configuration

2. Implement Sales/b2b subfolder
   - Quote generation
   - Contract management
   - Tiered pricing
   - Approval workflows

3. Integration with Sales
   - B2B orders → Finance invoicing
   - Credit limit validation
   - NET payment terms

4. Integration with Fiscal
   - B2B invoices → Tax calculation
   - Fiscal compliance for B2B

**Dependencies**: Phase 0.5 complete, Sales + Fiscal modules functional
**Risk**: 🟢 LOW (independent domain)

---

### Phase 4: Service Modes (5-7 days)

**Goal**: Enhance Scheduling module for appointment_based capability

**Tasks:**
1. Implement appointment booking
   - Calendar management
   - Provider availability
   - Online booking portal

2. Implement reminder system
   - SMS/email reminders
   - Automated scheduling

3. Implement service packages
   - Package definition (e.g., "10 massage sessions")
   - Package redemption tracking

4. Walk-in immediate booking
   - Queue management for walk-in customers
   - Immediate appointment creation

**Dependencies**: Phase 0.5 complete, Staff module functional
**Risk**: 🟢 LOW (isolated domain)

---

## 📋 BREAKING CHANGES SUMMARY

**CRITICAL**: Communicate to users/developers

### User-Facing Changes

1. **Floor module deleted**
   - **Old URL**: `/admin/operations/floor`
   - **New URL**: `/admin/operations/fulfillment/onsite`
   - **Impact**: Bookmarks broken, must update
   - **Mitigation**: Automatic redirect for 6 months

2. **Kitchen renamed to Production**
   - **Old URL**: `/admin/operations/kitchen`
   - **New URL**: `/admin/operations/production`
   - **Impact**: Menu item renamed, bookmarks broken
   - **Mitigation**: Automatic redirect for 6 months

3. **New modules available** (if capabilities active):
   - Fulfillment (onsite/pickup/delivery)
   - Mobile Operations
   - Corporate Accounts (Finance)

### Developer-Facing Changes

1. **Import path changes**
   ```typescript
   // BEFORE
   import { ... } from '@/modules/floor';
   import { ... } from '@/modules/kitchen';

   // AFTER
   import { ... } from '@/modules/fulfillment/onsite';
   import { ... } from '@/modules/production';
   ```

2. **Feature ID changes**
   ```typescript
   // BEFORE
   hasFeature('production_recipe_management')
   hasFeature('production_kitchen_display')

   // AFTER
   hasFeature('production_bom_management')
   hasFeature('production_display_system')
   ```

3. **Capability ID changes**
   ```typescript
   // BEFORE
   hasCapability('requires_preparation')

   // AFTER
   hasCapability('production_workflow')
   ```

4. **Hook name changes** (if using Option B in Step 3.3)
   ```typescript
   // BEFORE
   eventBus.emit('kitchen.order_ready')

   // AFTER
   eventBus.emit('production.order_ready')
   ```

5. **Database table changes**
   - New tables: `fulfillment_queue`, `mobile_routes`, `corporate_accounts`
   - Feature flags updated in `business_capabilities` table

---

## 🧪 TESTING STRATEGY

### Unit Tests

**Per module:**
- [ ] Registry updates (BusinessModelRegistry, FeatureRegistry)
- [ ] Module manifests (valid hooks, dependencies)
- [ ] Service layer (CRUD operations)
- [ ] Component rendering (feature flags)

### Integration Tests

**Cross-module workflows:**
- [ ] Sales → Fulfillment (order placement)
- [ ] Sales → Production (if production_workflow active)
- [ ] Production → Fulfillment (order ready notification)
- [ ] Materials → Sales (stock validation)
- [ ] Finance → Fiscal (B2B invoicing)

### E2E Tests

**Complete user journeys:**
- [ ] Onsite order flow (Sales → Fulfillment/onsite → Production → Complete)
- [ ] Pickup order flow (Sales → Fulfillment/pickup → Notification → Pickup)
- [ ] Delivery order flow (Sales → Fulfillment/delivery → Mobile → Delivery)
- [ ] B2B order flow (Sales/b2b → Finance → Fiscal → Payment)
- [ ] Appointment booking (Scheduling → Staff → Confirmation)

### Manual Testing

**UI/UX validation:**
- [ ] Navigation menu shows correct modules
- [ ] Capability activation hides/shows modules correctly
- [ ] Feature flags work as expected
- [ ] No 404 errors on any route
- [ ] Redirects work for legacy routes
- [ ] Cross-module buttons/links work
- [ ] Dashboard widgets load from all modules

---

## 📊 SUCCESS METRICS

**How we know Phase 0.5 succeeded:**

### Technical Metrics
- ✅ 22 modules registered (not 27)
- ✅ 0 references to `modules/floor` in codebase
- ✅ 0 references to `modules/kitchen` in codebase
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors in changed files
- ✅ Production build succeeds

### Functional Metrics
- ✅ All 22 modules load without errors
- ✅ Feature activation works correctly
- ✅ Legacy routes redirect properly
- ✅ Navigation menu reflects new structure
- ✅ Cross-module hooks working

### User Metrics (Post-Launch)
- ✅ 0 user reports of broken functionality
- ✅ 0 user reports of 404 errors
- ✅ Users can find Fulfillment features easily

---

## 🚨 ROLLBACK CRITERIA

**When to rollback:**

1. **CRITICAL** - Data loss risk detected
2. **CRITICAL** - Security vulnerability introduced
3. **HIGH** - Core workflows broken (Sales, Materials, Production)
4. **HIGH** - Database migration fails with no recovery
5. **MEDIUM** - >50% of modules failing to load
6. **MEDIUM** - Performance degradation >50%

**When NOT to rollback:**
- Minor UI glitches (fix forward)
- Non-critical features broken (fix forward)
- ESLint warnings (fix forward)
- Documentation incomplete (fix forward)

---

## 📅 TIMELINE (GANTT CHART)

```
Week 1-2: Phase 0.5 (Architecture Migration)
├─ Day 1:    Registry updates
├─ Day 2-3:  Floor deletion + Fulfillment creation
├─ Day 4-5:  Kitchen → Production rename
├─ Day 6:    Module registry update
├─ Day 7:    Navigation update
├─ Day 8:    Database migration
├─ Day 9:    Test updates
├─ Day 10:   Documentation
├─ Day 11-12: Smoke testing
└─ Day 13-14: Buffer + rollback plan validation

Week 3-5: Phase 1 (Fulfillment)
├─ Week 3:   Fulfillment/core + onsite
├─ Week 4:   Fulfillment/pickup + delivery
└─ Week 5:   Integration testing

Week 6-7: Phase 2 (Mobile)
├─ Week 6:   Location + route planning
└─ Week 7:   Integration with delivery

Week 8-9: Phase 3 (B2B Sales)
├─ Week 8:   Finance module
└─ Week 9:   Sales/b2b + integration

Week 10: Phase 4 (Service Modes)
└─ Week 10:  Scheduling enhancements

Week 11: Final Testing & Launch
└─ Week 11:  Polish, E2E tests, deployment
```

**Total**: ~11 weeks (55 business days)
**Best Case**: ~8 weeks (40 days with fast execution)
**Worst Case**: ~14 weeks (70 days with issues)

---

## 📚 REFERENCE DOCUMENTS

**Read before starting migration:**
1. `ARCHITECTURE_DESIGN_V2.md` - Master architecture document
2. `ARCHITECTURE_CORRECTIONS_SUMMARY.md` - Important corrections applied
3. `PRODUCTION_PLAN.md` - Production readiness plan
4. `CLAUDE.md` - Project instructions

**Read during implementation:**
1. Module README files (create as you go)
2. `src/lib/modules/ModuleRegistry.ts` - Hook system implementation
3. `src/config/FeatureRegistry.ts` - Feature definitions

---

## ❓ OPEN QUESTIONS

**Resolve before starting Phase 0.5:**

1. **Terminology Configurability**
   - ❓ Should Production terminology be configurable in UI or only in code?
   - **Recommendation**: Start with code config, add UI later (Phase 4)

2. **Hook Name Compatibility**
   - ❓ Keep legacy `kitchen.*` hook names or rename to `production.*`?
   - **Recommendation**: Rename for consistency (breaking change documented)

3. **Floor Route Redirect Duration**
   - ❓ Keep redirects for 6 months or permanently?
   - **Recommendation**: 6 months, then remove (add deprecation notice)

4. **Feature Flag Migration**
   - ❓ Auto-migrate feature flags for existing users or require manual update?
   - **Recommendation**: Auto-migrate in database (see Step 6)

---

**END OF MIGRATION PLAN**

**Status**: 📋 READY FOR EXECUTION
**Next Action**: Review Phase 0.5 steps, confirm understanding, begin Day 1 tasks
**Estimated Start Date**: TBD
**Estimated Completion**: TBD (11 weeks from start)
