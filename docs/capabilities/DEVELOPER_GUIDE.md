# Developer Guide

**Practical development guide for the Capability-Features System**

**Version**: 4.0 + v3.0 Dynamic Module Mapping
**Last Updated**: 2025-12-21

> ⚡ **NEW v3.0**: `MODULE_FEATURE_MAP` is now auto-generated from manifests!
> When adding modules, just define the manifest - no need to edit FeatureRegistry.
> See [Adding a New Module](#adding-a-new-module) for updated workflow.

---

## Table of Contents

1. [Adding a New Business Capability](#adding-a-new-business-capability)
2. [Adding a New Feature](#adding-a-new-feature)
3. [Adding a New Module](#adding-a-new-module)
4. [Working with the Store](#working-with-the-store)
5. [Testing Patterns](#testing-patterns)
6. [Common Development Workflows](#common-development-workflows)

---

## Adding a New Business Capability

### Step-by-Step Process

#### 1. Define in Types

**File**: `src/config/types.ts` (if it exists, otherwise BusinessModelRegistry.ts)

```typescript
// Add to union type
export type BusinessCapabilityId =
  | 'physical_products'
  | 'professional_services'
  // ... existing capabilities
  | 'my_new_capability';  // ← ADD THIS
```

---

#### 2. Add to BusinessModelRegistry

**File**: `src/config/BusinessModelRegistry.ts`

```typescript
const CAPABILITIES: Record<BusinessCapabilityId, BusinessCapability> = {
  // ... existing capabilities

  'my_new_capability': {
    id: 'my_new_capability',
    name: 'My New Capability',
    description: 'Description of what this capability enables',
    icon: '🎯', // Choose relevant emoji
    type: 'special_operation', // or 'business_model', 'fulfillment'

    activatesFeatures: [
      // List ALL features this capability should activate
      'feature_1',
      'feature_2',
      'feature_3'
    ],

    blockingRequirements: [
      // Optional: Requirements that MUST be completed before using
      'requirement_id_1',
      'requirement_id_2'
    ]
  }
};
```

**Decision Guide**:
- `type: 'business_model'` - Core business offering (what you sell/provide)
- `type: 'fulfillment'` - How you deliver (onsite, pickup, delivery)
- `type: 'special_operation'` - Special operational mode (B2B, mobile, async)

---

#### 3. Define activatesFeatures

**Strategy**: Think from the user's perspective - "If a user enables this capability, what system features should work?"

```typescript
// Example: Equipment rental capability
'equipment_rental': {
  activatesFeatures: [
    // RENTAL domain
    'rental_item_management',          // Manage rental items
    'rental_booking_calendar',         // Book rental periods
    'rental_availability_tracking',    // Track what's available
    'rental_pricing_by_duration',      // Hourly/daily/weekly pricing
    'rental_late_fees',                // Charge late return fees

    // CUSTOMER domain (needed for rental customers)
    'customer_service_history',
    'customer_preference_tracking',

    // SCHEDULING domain (for pickup/return scheduling)
    'scheduling_appointment_booking',
    'scheduling_calendar_management',

    // INVENTORY domain (track rental items like inventory)
    'inventory_stock_tracking',
    'inventory_alert_system',

    // SALES domain (rentals are a type of sale)
    'sales_order_management',
    'sales_payment_processing'
  ]
}
```

---

#### 4. Define blockingRequirements

**When to use**: Requirements that MUST be completed before the capability works.

```typescript
// Example: Delivery capability requires zones and fees
'delivery_shipping': {
  blockingRequirements: [
    'delivery_zones_required',    // Must define delivery areas
    'delivery_fees_required',     // Must set delivery pricing
    'delivery_hours_required'     // Must set delivery schedule
  ]
}
```

**Common blocking requirements**:
- `business_address_required` - Physical location needed
- `business_license_required` - Legal requirement
- `payment_methods_required` - Payment processing needed
- `website_url_required` - Online presence needed

---

#### 5. Add to capability-mapping (if needed)

**File**: `src/modules/achievements/requirements/capability-mapping.ts`

**Only if** your capability has specific requirements to complete:

```typescript
import { BUSINESS_NAME_CONFIGURED } from '@/shared/requirements';

// Define capability-specific requirements
const RENTAL_DEPOSIT_CONFIGURED: Achievement = {
  id: 'rental_deposit_configured',
  tier: 'mandatory',
  capability: 'my_new_capability',
  name: 'Configure Security Deposit',
  description: 'Set security deposit amount and policy',
  icon: '💰',
  category: 'setup',
  validator: (ctx) => ctx.profile?.rentalDepositAmount !== undefined,
  redirectUrl: '/admin/settings/rentals',
  estimatedMinutes: 5,
};

// Map capability to requirements
export const CAPABILITY_REQUIREMENTS: Record<BusinessCapabilityId, Achievement[]> = {
  // ... existing mappings

  my_new_capability: [
    BUSINESS_NAME_CONFIGURED,     // Shared requirement
    RENTAL_DEPOSIT_CONFIGURED,    // Specific requirement
  ],
};
```

---

#### 6. Update Tests

**File**: Create `src/config/__tests__/BusinessModelRegistry.test.ts` or update existing

```typescript
import { getCapability, getActivatedFeatures } from '@/config/BusinessModelRegistry';

describe('my_new_capability', () => {
  test('should be defined', () => {
    const capability = getCapability('my_new_capability');
    expect(capability).toBeDefined();
    expect(capability?.name).toBe('My New Capability');
  });

  test('should activate expected features', () => {
    const features = getActivatedFeatures(['my_new_capability'], []);

    expect(features).toContain('feature_1');
    expect(features).toContain('feature_2');
    expect(features).toContain('feature_3');
  });

  test('should have blocking requirements', () => {
    const capability = getCapability('my_new_capability');
    expect(capability?.blockingRequirements).toEqual([
      'requirement_id_1',
      'requirement_id_2'
    ]);
  });
});
```

---

#### 7. Migration Considerations

If modifying an existing capability:

```typescript
// OLD (before)
'old_capability_id': {
  activatesFeatures: ['feature_a', 'feature_b']
}

// NEW (after)
'new_capability_id': {
  activatesFeatures: ['feature_a', 'feature_b', 'feature_c']
}
```

**Migration steps**:
1. Add new capability to registry
2. Update `capabilityStore.ts` version number
3. Add migration function to handle old → new
4. Create SQL migration for database
5. Test upgrade path with real data

---

### Complete Example: Adding "Wholesale Distribution"

```typescript
// 1. Type definition (in types.ts or BusinessModelRegistry.ts)
export type BusinessCapabilityId =
  | 'physical_products'
  // ... existing
  | 'wholesale_distribution';

// 2. Registry definition
const CAPABILITIES: Record<BusinessCapabilityId, BusinessCapability> = {
  // ... existing capabilities

  'wholesale_distribution': {
    id: 'wholesale_distribution',
    name: 'Distribución Mayorista',
    description: 'Venta mayorista a revendedores y negocios',
    icon: '📦',
    type: 'business_model',

    activatesFeatures: [
      // SALES - B2B focused
      'sales_order_management',
      'sales_payment_processing',
      'sales_bulk_pricing',           // Volume discounts
      'sales_quote_generation',       // RFQ/quotes
      'sales_contract_management',    // Long-term contracts
      'sales_approval_workflows',     // Order approvals

      // INVENTORY - Wholesale quantities
      'inventory_stock_tracking',
      'inventory_alert_system',
      'inventory_supplier_management',
      'inventory_purchase_orders',
      'inventory_demand_forecasting', // Predict restock needs
      'inventory_available_to_promise', // Commit future stock

      // FINANCE - B2B billing
      'finance_corporate_accounts',   // Business customers
      'finance_credit_management',    // Net-30, Net-60 terms
      'finance_invoice_scheduling',   // Recurring invoices
      'finance_payment_terms',        // Custom payment terms

      // PRODUCTS - Wholesale catalog
      'products_catalog_ecommerce',   // B2B portal
      'products_cost_intelligence',   // Margin analysis

      // OPERATIONS
      'operations_vendor_performance', // Supplier KPIs
      'operations_shipping_integration', // Integration with carriers

      // STAFF
      'staff_employee_management',
      'staff_performance_tracking'    // Sales rep tracking
    ],

    blockingRequirements: [
      'business_license_required',
      'minimum_order_quantity_configured'
    ]
  }
};

// 3. Requirements mapping
const MINIMUM_ORDER_CONFIGURED: Achievement = {
  id: 'minimum_order_quantity_configured',
  tier: 'mandatory',
  capability: 'wholesale_distribution',
  name: 'Configure Minimum Orders',
  description: 'Set minimum order quantities (MOQ) for wholesale',
  icon: '📊',
  category: 'setup',
  validator: (ctx) => ctx.profile?.wholesaleConfig?.moq !== undefined,
  redirectUrl: '/admin/settings/wholesale',
  estimatedMinutes: 10,
};

export const CAPABILITY_REQUIREMENTS: Record<BusinessCapabilityId, Achievement[]> = {
  // ... existing

  wholesale_distribution: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_LICENSE_CONFIGURED,
    CUSTOMER_MIN_COUNT,           // Need business customers
    PRODUCT_MIN_CATALOG,          // Need products to sell
    PAYMENT_METHOD_CONFIGURED,
    MINIMUM_ORDER_CONFIGURED,
  ],
};

// 4. Test
describe('wholesale_distribution', () => {
  test('activates B2B features', () => {
    const features = getActivatedFeatures(['wholesale_distribution'], []);

    expect(features).toContain('sales_bulk_pricing');
    expect(features).toContain('finance_corporate_accounts');
    expect(features).toContain('finance_credit_management');
  });

  test('has required achievements', () => {
    const requirements = getRequirementsForCapability('wholesale_distribution');

    expect(requirements).toHaveLength(6);
    expect(requirements.some(r => r.id === 'minimum_order_quantity_configured')).toBe(true);
  });
});
```

---

## Adding a New Feature

### Step-by-Step Process

#### 1. Define in FeatureRegistry

**File**: `src/config/FeatureRegistry.ts`

```typescript
const FEATURE_REGISTRY: Record<FeatureId, Feature> = {
  // ... existing features

  'my_new_feature': {
    id: 'my_new_feature',
    name: 'My New Feature',
    description: 'Clear description of what this feature enables',
    domain: 'SALES', // Choose appropriate domain
    category: 'conditional' // All features are conditional (v5.0+)
  }
};
```

**Domain Selection Guide**:
- `SALES` - Selling, orders, payments, pricing
- `INVENTORY` - Stock, materials, suppliers
- `PRODUCTION` - Manufacturing, recipes, BOMs
- `PRODUCTS` - Product catalog, recipes, pricing
- `OPERATIONS` - Fulfillment, delivery, tables, scheduling
- `SCHEDULING` - Appointments, calendar, availability
- `CUSTOMER` - Customer management, loyalty, preferences
- `FINANCE` - B2B billing, credit, invoices
- `STAFF` - Employees, shifts, time tracking
- `MOBILE` - Mobile operations, location, routes
- `MULTISITE` - Multiple locations, transfers
- `ANALYTICS` - Reports, KPIs, insights
- `RENTAL` - Equipment/space rental
- `MEMBERSHIP` - Subscriptions, memberships
- `DIGITAL` - Digital product delivery
- `CORE` - Always-active system features

---

#### 2. Choose Category

```typescript
// conditional - Activated by capabilities (ALL features in v5.0+)
category: 'conditional'

// Note: 'always_active' removed in v5.0 (2026-01-19)
// CORE modules (dashboard, settings, etc.) now loaded via CORE_MODULES array
```

**Migration Note (v5.0)**:
- Previously "always_active" features → Now handled by `CORE_MODULES` array
- All business features → Use `category: 'conditional'`
- See `src/lib/modules/constants.ts` for CORE modules definition

---

#### 3. Add to capability's activatesFeatures

**File**: `src/config/BusinessModelRegistry.ts`

```typescript
'relevant_capability': {
  activatesFeatures: [
    // ... existing features
    'my_new_feature',  // ← ADD HERE
  ]
}
```

**Example**:
```typescript
// Adding inventory serialization to physical_products
'physical_products': {
  activatesFeatures: [
    // ... existing
    'inventory_serial_number_tracking',  // ← NEW FEATURE
  ]
}
```

---

#### 4. Add to MODULE_FEATURE_MAP (if creates/affects modules)

**File**: `src/config/FeatureRegistry.ts`

**Only if** this feature should affect module visibility:

```typescript
export const MODULE_FEATURE_MAP: Record<string, {
  alwaysActive?: boolean;
  requiredFeatures?: FeatureId[];
  optionalFeatures?: FeatureId[];
}> = {
  // ... existing modules

  'my_module': {
    optionalFeatures: [
      // ... existing
      'my_new_feature',  // ← ADD HERE
    ]
  }
};
```

---

#### 5. Update Tests

```typescript
import { getFeature, getFeaturesByDomain } from '@/config/FeatureRegistry';

describe('my_new_feature', () => {
  test('should be defined', () => {
    const feature = getFeature('my_new_feature');
    expect(feature).toBeDefined();
    expect(feature?.domain).toBe('SALES');
    expect(feature?.category).toBe('conditional');
  });

  test('should be in correct domain', () => {
    const domainFeatures = getFeaturesByDomain('SALES');
    const ids = domainFeatures.map(f => f.id);
    expect(ids).toContain('my_new_feature');
  });
});
```

---

### Complete Example: Adding "Batch Production Scheduling"

```typescript
// 1. Add to FeatureRegistry
const FEATURE_REGISTRY: Record<FeatureId, Feature> = {
  // ... existing

  'production_batch_scheduling': {
    id: 'production_batch_scheduling',
    name: 'Batch Production Scheduling',
    description: 'Schedule production in batches to optimize efficiency',
    domain: 'PRODUCTION',
    category: 'conditional'
  }
};

// 2. Add to physical_products capability
'physical_products': {
  activatesFeatures: [
    'production_bom_management',
    'production_display_system',
    'production_order_queue',
    'production_capacity_planning',
    'production_batch_scheduling',  // ← NEW
    // ... rest
  ]
}

// 3. Add to production module mapping
'production': {
  requiredFeatures: [
    'production_bom_management',
    'production_display_system',
    'production_order_queue'
  ],
  optionalFeatures: [
    'production_capacity_planning',
    'production_batch_scheduling'   // ← NEW (optional enhancement)
  ]
}

// 4. Use in component
import { useFeature } from '@/store/capabilityStore';

function ProductionPage() {
  const hasBatchScheduling = useFeature('production_batch_scheduling');

  return (
    <div>
      <h1>Production</h1>

      {hasBatchScheduling && (
        <BatchSchedulingPanel />
      )}
    </div>
  );
}
```

---

## Adding a New Module

### Step-by-Step Process

#### 1. Create Module Structure

```
src/pages/admin/my-module/
├── README.md                 # Module documentation
├── page.tsx                  # Main page component
├── components/               # Module-specific components
│   ├── MyModuleList.tsx
│   ├── MyModuleForm.tsx
│   └── index.ts
├── hooks/                    # Module-specific hooks
│   ├── useMyModule.ts
│   ├── useMyModulePage.ts
│   └── index.ts
├── services/                 # API/service layer
│   ├── myModuleApi.ts
│   └── index.ts
└── types/                    # Type definitions
    └── index.ts
```

---

#### 2. Define Manifest

**File**: `src/pages/admin/my-module/manifest.tsx` (or in page.tsx)

```typescript
import type { ModuleManifest } from '@/lib/modules/types';

export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  name: 'My Module',
  description: 'Module description',
  version: '1.0.0',
  route: '/admin/my-module',

  // Optional: Icon for navigation
  icon: '🎯',

  // Optional: Navigation group
  group: 'operations', // or 'supply-chain', 'finance', etc.

  // Optional: Order in navigation
  order: 100,
};
```

---

#### 3. Define Features in Manifest (v3.0 Dynamic)

> ⚡ **NEW v3.0**: Define features in manifest - system auto-generates mapping!

**File**: `src/modules/my-module/manifest.tsx`

**Choose the right pattern**:

```typescript
// Pattern A: Module requires ALL features (AND logic)
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  requiredFeatures: [
    'feature_1',  // ALL must be active
    'feature_2',
    'feature_3'
  ],
  // ...
};

// Pattern B: Module needs ANY feature (OR logic)
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  optionalFeatures: [
    'feature_1',  // At least ONE must be active
    'feature_2',
    'feature_3'
  ],
  // ...
};

// Pattern C: Core features + Optional enhancements
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  requiredFeatures: [
    'feature_core'  // Must have this
  ],
  optionalFeatures: [
    'feature_enhance_1',  // These add functionality
    'feature_enhance_2'
  ],
  // ...
};

// Pattern D: CORE module (v5.0+)
// CORE modules defined in src/lib/modules/constants.ts
export const dashboardManifest: ModuleManifest = {
  id: 'dashboard',
  depends: [],
  // NO activatedBy (CORE modules always loaded)
  // ...
};

// To make a module CORE: Add to CORE_MODULES array in constants.ts
// CORE_MODULES = ['dashboard', 'settings', 'debug', 'customers', 'sales', 'gamification']
```

**⚠️ REMOVED in v5.0 (2026-01-19)**:
- ~~`autoInstall` property~~ → Use `CORE_MODULES` array in constants.ts
- ~~`enhancedBy` property~~ → Not used (over-engineering)
- ~~`MODULE_FEATURE_MAP` manual editing~~ → Use OPTIONAL_MODULES mapping

---

#### 4. Choose requiredFeatures vs optionalFeatures

**Use `requiredFeatures` when**:
- Module ONLY makes sense if ALL features are active
- Features are tightly coupled to module functionality
- Example: `delivery` module requires BOTH `operations_delivery_zones` AND `operations_delivery_tracking`

**Use `optionalFeatures` when**:
- Module can work with ANY of the features
- Features are independent variations of the same concept
- Example: `sales` module works with `sales_pos_onsite` OR `sales_online_order_processing` OR any sales feature

---

#### 5. Test Visibility

```typescript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

describe('my-module visibility', () => {
  test('should be visible with required features', () => {
    const modules = getModulesForActiveFeatures([
      'feature_1',
      'feature_2',
      'feature_3'
    ]);

    expect(modules).toContain('my-module');
  });

  test('should NOT be visible without required features', () => {
    const modules = getModulesForActiveFeatures([
      'feature_1'  // Missing feature_2 and feature_3
    ]);

    expect(modules).not.toContain('my-module');
  });

  test('should be visible with any optional feature', () => {
    const modules = getModulesForActiveFeatures([
      'feature_1'  // Only one optional feature needed
    ]);

    expect(modules).toContain('my-module');
  });
});
```

---

#### 6. Update Navigation

**File**: `src/config/routeMap.ts` or navigation config

```typescript
import { myModuleManifest } from '@/pages/admin/my-module';

export const routeMap = {
  // ... existing routes

  'my-module': {
    path: '/admin/my-module',
    component: lazy(() => import('@/pages/admin/my-module/page')),
    manifest: myModuleManifest,

    // Navigation will automatically filter based on MODULE_FEATURE_MAP
  }
};
```

---

### Complete Example: Adding "Quality Control" Module

```typescript
// 1. Module structure
src/pages/admin/quality-control/
├── README.md
├── page.tsx
├── components/
│   ├── InspectionForm.tsx
│   ├── QualityMetrics.tsx
│   └── index.ts
├── hooks/
│   ├── useQualityChecks.ts
│   └── index.ts
└── services/
    └── qualityApi.ts

// 2. Define manifest (in page.tsx)
export const qualityControlManifest: ModuleManifest = {
  id: 'quality-control',
  name: 'Control de Calidad',
  description: 'Inspecciones y control de calidad',
  version: '1.0.0',
  route: '/admin/quality-control',
  icon: '✓',
  group: 'operations',
  order: 150,
};

// 3. Add features to FeatureRegistry
const FEATURE_REGISTRY: Record<FeatureId, Feature> = {
  // ... existing

  'production_quality_checks': {
    id: 'production_quality_checks',
    name: 'Quality Inspections',
    description: 'Inspect products during production',
    domain: 'PRODUCTION',
    category: 'conditional'
  },

  'inventory_quality_tracking': {
    id: 'inventory_quality_tracking',
    name: 'Material Quality Tracking',
    description: 'Track material quality over time',
    domain: 'INVENTORY',
    category: 'conditional'
  }
};

// 4. Add to capabilities
'physical_products': {
  activatesFeatures: [
    // ... existing
    'production_quality_checks',
    'inventory_quality_tracking',
  ]
}

// 5. Configure MODULE_FEATURE_MAP
export const MODULE_FEATURE_MAP = {
  // ... existing

  'quality-control': {
    optionalFeatures: [
      'production_quality_checks',    // Quality in production
      'inventory_quality_tracking',   // Quality in inventory
    ],
    description: 'Quality control - active with any quality feature'
  }
};

// 6. Create page component
export default function QualityControlPage() {
  const hasProductionQuality = useFeature('production_quality_checks');
  const hasInventoryQuality = useFeature('inventory_quality_tracking');

  return (
    <ContentLayout title="Control de Calidad">
      {hasProductionQuality && (
        <ProductionQualityPanel />
      )}

      {hasInventoryQuality && (
        <InventoryQualityPanel />
      )}

      <QualityMetricsDashboard />
    </ContentLayout>
  );
}

// 7. Test visibility
describe('quality-control module', () => {
  test('visible with production quality feature', () => {
    const modules = getModulesForActiveFeatures(['production_quality_checks']);
    expect(modules).toContain('quality-control');
  });

  test('visible with inventory quality feature', () => {
    const modules = getModulesForActiveFeatures(['inventory_quality_tracking']);
    expect(modules).toContain('quality-control');
  });

  test('visible with both features', () => {
    const modules = getModulesForActiveFeatures([
      'production_quality_checks',
      'inventory_quality_tracking'
    ]);
    expect(modules).toContain('quality-control');
  });

  test('NOT visible without quality features', () => {
    const modules = getModulesForActiveFeatures(['sales_order_management']);
    expect(modules).not.toContain('quality-control');
  });
});
```

---

## Working with the Store

### Using useCapabilities() Hook

```typescript
import { useCapabilities } from '@/store/capabilityStore';

function MyComponent() {
  const {
    // State
    profile,
    activeFeatures,
    blockedFeatures,
    pendingMilestones,
    visibleModules,
    isLoading,

    // Actions
    toggleCapability,
    setCapabilities,
    updateProfile,

    // Getters
    hasFeature,
    hasAllFeatures,
    isFeatureBlocked,
  } = useCapabilities();

  // Use state
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{profile?.businessName}</h1>

      {hasFeature('sales_pos_onsite') && (
        <POSButton />
      )}
    </div>
  );
}
```

---

### Checking for Features

```typescript
import { useFeature } from '@/store/capabilityStore';

// Single feature check (optimized)
function POSPanel() {
  const hasPOS = useFeature('sales_pos_onsite');

  if (!hasPOS) return null;

  return <POSInterface />;
}
```

```typescript
import { useCapabilities } from '@/store/capabilityStore';

// Multiple feature checks
function AdvancedSalesPanel() {
  const { hasAllFeatures, hasFeature } = useCapabilities();

  // Require ALL features
  const hasFullB2B = hasAllFeatures([
    'sales_contract_management',
    'sales_quote_generation',
    'finance_corporate_accounts'
  ]);

  // Check individual features
  const hasBulkPricing = hasFeature('sales_bulk_pricing');

  return (
    <div>
      {hasFullB2B ? (
        <B2BFullSuite />
      ) : (
        <B2BBasicSuite />
      )}

      {hasBulkPricing && (
        <BulkPricingEditor />
      )}
    </div>
  );
}
```

---

### Checking for Modules

```typescript
import { useModuleAccess } from '@/store/capabilityStore';

function Navigation() {
  const hasSales = useModuleAccess('sales');
  const hasRentals = useModuleAccess('rentals');
  const hasDelivery = useModuleAccess('delivery');

  return (
    <nav>
      <NavItem to="/admin/dashboard" />  {/* Always visible */}

      {hasSales && (
        <NavItem to="/admin/sales" />
      )}

      {hasRentals && (
        <NavItem to="/admin/rentals" />
      )}

      {hasDelivery && (
        <NavItem to="/admin/delivery" />
      )}
    </nav>
  );
}
```

---

### Performance-Optimized Selectors

```typescript
import { useActiveFeatures, usePendingMilestones } from '@/store/capabilityStore';

// Only re-renders when activeFeatures changes
function FeatureCounter() {
  const activeFeatures = useActiveFeatures();

  return <div>Active: {activeFeatures.length}</div>;
}

// Only re-renders when pendingMilestones changes
function AchievementsBadge() {
  const pending = usePendingMilestones();

  if (pending.length === 0) return null;

  return <Badge count={pending.length} />;
}
```

---

### Avoiding Re-renders

**Problem**: Using full `useCapabilities()` causes unnecessary re-renders

```typescript
// ❌ BAD - Re-renders on ANY store change
function FeaturePanel() {
  const { activeFeatures, profile, isLoading } = useCapabilities();

  return <div>{activeFeatures.length} features</div>;
  // Re-renders when profile changes, even though we don't use it!
}
```

**Solution**: Use specific selectors

```typescript
// ✅ GOOD - Only re-renders when activeFeatures changes
function FeaturePanel() {
  const activeFeatures = useActiveFeatures();

  return <div>{activeFeatures.length} features</div>;
}
```

---

### Best Practices

#### 1. Use Specific Hooks When Possible

```typescript
// ✅ BEST - Most performant
const activeFeatures = useActiveFeatures();

// ✅ GOOD - Optimized for single feature
const hasPOS = useFeature('sales_pos_onsite');

// ⚠️ OK - Use only when you need multiple things
const { hasFeature, profile } = useCapabilities();

// ❌ AVOID - Too broad, causes unnecessary re-renders
const everything = useCapabilities();
```

---

#### 2. Memoize Computed Values

```typescript
import { useMemo } from 'react';
import { useActiveFeatures } from '@/store/capabilityStore';

function FeatureStats() {
  const activeFeatures = useActiveFeatures();

  // Memoize expensive computation
  const stats = useMemo(() => {
    const byDomain: Record<string, number> = {};

    activeFeatures.forEach(featureId => {
      const feature = getFeature(featureId);
      if (feature) {
        byDomain[feature.domain] = (byDomain[feature.domain] || 0) + 1;
      }
    });

    return byDomain;
  }, [activeFeatures]); // Only recompute when activeFeatures changes

  return <StatChart data={stats} />;
}
```

---

#### 3. Conditional Rendering Patterns

```typescript
// Pattern A: Early return (best for full component)
function POSPanel() {
  const hasPOS = useFeature('sales_pos_onsite');

  if (!hasPOS) return null;

  return <POSInterface />;
}

// Pattern B: Conditional section (best for part of component)
function SalesPage() {
  const hasPOS = useFeature('sales_pos_onsite');
  const hasOnline = useFeature('sales_online_order_processing');

  return (
    <div>
      <SalesHeader />

      {hasPOS && <POSSection />}
      {hasOnline && <OnlineOrdersSection />}

      <SalesFooter />
    </div>
  );
}

// Pattern C: Switch between variants
function CheckoutFlow() {
  const { hasFeature } = useCapabilities();

  if (hasFeature('sales_checkout_process')) {
    return <ModernCheckout />;
  }

  if (hasFeature('sales_payment_processing')) {
    return <BasicPayment />;
  }

  return <SimpleCheckout />;
}
```

---

## Testing Patterns

### Testing Capability Activation

```typescript
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';

describe('FeatureActivationEngine', () => {
  test('activates features for physical_products', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products'],
      ['single_location']
    );

    expect(result.activeFeatures).toContain('production_bom_management');
    expect(result.activeFeatures).toContain('inventory_stock_tracking');
    expect(result.activeFeatures).toContain('products_recipe_management');
  });

  test('combines features from multiple capabilities', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products', 'onsite_service'],
      ['single_location']
    );

    // From physical_products
    expect(result.activeFeatures).toContain('production_bom_management');

    // From onsite_service
    expect(result.activeFeatures).toContain('operations_table_management');

    // No duplicates
    const uniqueFeatures = new Set(result.activeFeatures);
    expect(uniqueFeatures.size).toBe(result.activeFeatures.length);
  });
});
```

---

### Testing Feature Auto-Activation

```typescript
import { getActivatedFeatures } from '@/config/BusinessModelRegistry';

describe('Feature activation rules', () => {
  test('restaurant gets full stack', () => {
    const features = getActivatedFeatures(
      ['physical_products', 'onsite_service', 'delivery_shipping'],
      ['single_location']
    );

    // Production
    expect(features).toContain('production_bom_management');

    // Inventory
    expect(features).toContain('inventory_stock_tracking');

    // Operations
    expect(features).toContain('operations_table_management');
    expect(features).toContain('operations_delivery_tracking');

    // Sales
    expect(features).toContain('sales_pos_onsite');
    expect(features).toContain('sales_delivery_orders');
  });
});
```

---

### Testing Module Visibility

```typescript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

describe('Module visibility', () => {
  test('sales module visible with any sales feature', () => {
    const modules = getModulesForActiveFeatures(['sales_order_management']);
    expect(modules).toContain('sales');
  });

  test('delivery module requires ALL delivery features', () => {
    // Only one delivery feature - should NOT show
    let modules = getModulesForActiveFeatures(['operations_delivery_zones']);
    expect(modules).not.toContain('delivery');

    // Both delivery features - should show
    modules = getModulesForActiveFeatures([
      'operations_delivery_zones',
      'operations_delivery_tracking'
    ]);
    expect(modules).toContain('delivery');
  });

  test('always-active modules always visible', () => {
    const modules = getModulesForActiveFeatures([]);

    expect(modules).toContain('dashboard');
    expect(modules).toContain('settings');
    expect(modules).toContain('gamification');
  });
});
```

---

### Testing Requirements

```typescript
import { getRequirementsForCapabilities } from '@/modules/achievements/requirements/capability-mapping';

describe('Capability requirements', () => {
  test('deduplicates shared requirements', () => {
    const requirements = getRequirementsForCapabilities([
      'onsite_service',
      'pickup_orders',
      'delivery_shipping'
    ]);

    // All three have BUSINESS_NAME_CONFIGURED
    // Should appear only once
    const businessNameReqs = requirements.filter(
      r => r.id === 'business_name_configured'
    );
    expect(businessNameReqs).toHaveLength(1);
  });

  test('includes capability-specific requirements', () => {
    const requirements = getRequirementsForCapability('delivery_shipping');

    expect(requirements.some(r => r.id === 'delivery_zone_configured')).toBe(true);
    expect(requirements.some(r => r.id === 'delivery_hours_configured')).toBe(true);
  });
});
```

---

### Mock Patterns

```typescript
import { renderHook } from '@testing-library/react';
import { useCapabilities } from '@/store/capabilityStore';

// Mock the store
jest.mock('@/store/capabilityStore', () => ({
  useCapabilities: jest.fn()
}));

describe('Component with capabilities', () => {
  beforeEach(() => {
    (useCapabilities as jest.Mock).mockReturnValue({
      activeFeatures: ['sales_order_management', 'inventory_stock_tracking'],
      hasFeature: (id: string) => ['sales_order_management', 'inventory_stock_tracking'].includes(id),
      profile: {
        businessName: 'Test Business',
        selectedCapabilities: ['physical_products']
      }
    });
  });

  test('renders correctly with features', () => {
    // Your component test
  });
});
```

---

### Example Test Suite

```typescript
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import { getRequirementsForCapabilities } from '@/modules/achievements/requirements/capability-mapping';

describe('Complete capability flow: Coffee Shop', () => {
  const capabilities = ['physical_products', 'onsite_service', 'pickup_orders'];
  const infrastructure = ['single_location'];

  test('activates correct features', () => {
    const { activeFeatures } = FeatureActivationEngine.activateFeatures(
      capabilities,
      infrastructure
    );

    // Production features
    expect(activeFeatures).toContain('production_bom_management');
    expect(activeFeatures).toContain('production_display_system');

    // Inventory features
    expect(activeFeatures).toContain('inventory_stock_tracking');
    expect(activeFeatures).toContain('inventory_supplier_management');

    // Operations features
    expect(activeFeatures).toContain('operations_table_management');
    expect(activeFeatures).toContain('operations_pickup_scheduling');

    // Sales features
    expect(activeFeatures).toContain('sales_pos_onsite');
    expect(activeFeatures).toContain('sales_pickup_orders');
  });

  test('shows correct modules', () => {
    const { activeFeatures } = FeatureActivationEngine.activateFeatures(
      capabilities,
      infrastructure
    );

    const modules = getModulesForActiveFeatures(activeFeatures);

    expect(modules).toContain('sales');
    expect(modules).toContain('products');
    expect(modules).toContain('materials');
    expect(modules).toContain('operations');
    expect(modules).toContain('suppliers');
    expect(modules).toContain('staff');

    expect(modules).not.toContain('rentals');
    expect(modules).not.toContain('memberships');
  });

  test('has correct requirements', () => {
    const requirements = getRequirementsForCapabilities(capabilities);

    // Shared requirements (deduplicated)
    expect(requirements.some(r => r.id === 'business_name_configured')).toBe(true);
    expect(requirements.some(r => r.id === 'business_address_configured')).toBe(true);
    expect(requirements.some(r => r.id === 'payment_method_configured')).toBe(true);

    // Specific requirements
    expect(requirements.some(r => r.id === 'table_configuration')).toBe(true);
    expect(requirements.some(r => r.id === 'pickup_hours_configured')).toBe(true);
    expect(requirements.some(r => r.id === 'onsite_hours_configured')).toBe(true);
  });
});
```

---

## Common Development Workflows

### Workflow 1: User Selects New Capability

```typescript
// User clicks "Enable Delivery" in settings

// 1. Store updates
toggleCapability('delivery_shipping');

// 2. Features auto-activate
// - sales_delivery_orders
// - operations_delivery_zones
// - operations_delivery_tracking

// 3. Modules auto-show
// - delivery module appears in navigation

// 4. Requirements appear
// - "Configure delivery zones" prompt
// - "Set delivery fees" prompt

// 5. User completes requirements

// 6. Full access granted
```

---

### Workflow 2: New Feature Breaks Existing Code

```typescript
// Problem: Renamed feature breaks module visibility

// Before
'old_feature_name': { ... }

// After
'new_feature_name': { ... }

// Fix steps:
// 1. Keep old feature temporarily
'old_feature_name': {
  ...
  // Mark as deprecated in description
}

// 2. Add new feature
'new_feature_name': { ... }

// 3. Update MODULE_FEATURE_MAP to include both
'my-module': {
  optionalFeatures: [
    'old_feature_name',  // Backward compatibility
    'new_feature_name'   // New name
  ]
}

// 4. Add migration
// In capabilityStore version migration:
if (version < 5) {
  const oldFeatures = state.features.activeFeatures;
  const newFeatures = oldFeatures.map(f =>
    f === 'old_feature_name' ? 'new_feature_name' : f
  );
  return { ...state, features: { ...state.features, activeFeatures: newFeatures } };
}

// 5. Deprecate old feature in next release
```

---

### Workflow 3: Debug "Module Not Showing"

```typescript
// Problem: Module not appearing in navigation

// Step 1: Check if features are active
const activeFeatures = useActiveFeatures();
console.log('Active features:', activeFeatures);

// Step 2: Check MODULE_FEATURE_MAP
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';
const config = MODULE_FEATURE_MAP['my-module'];
console.log('Module config:', config);

// Step 3: Check if requirements are met
const hasRequired = config.requiredFeatures?.every(f => activeFeatures.includes(f));
const hasAnyOptional = config.optionalFeatures?.some(f => activeFeatures.includes(f));
console.log('Has required:', hasRequired);
console.log('Has optional:', hasAnyOptional);

// Step 4: Verify module appears in computed modules
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
const modules = getModulesForActiveFeatures(activeFeatures);
console.log('Visible modules:', modules);
console.log('Contains my-module?', modules.includes('my-module'));

// Common issues:
// - Feature ID typo in MODULE_FEATURE_MAP
// - Using requiredFeatures when should use optionalFeatures
// - Feature not activated by any capability
// - Module ID mismatch between config and navigation
```

---

## Next Steps

- **For patterns**: See [PATTERNS.md](./PATTERNS.md)
- **For API reference**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **For troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **For migrations**: See [MIGRATIONS.md](./MIGRATIONS.md)
