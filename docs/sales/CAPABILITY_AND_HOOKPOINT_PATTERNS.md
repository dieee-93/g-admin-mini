# 🔍 CAPABILITY & HOOKPOINT PATTERNS - Investigation Results

**Date**: 2025-12-12
**Status**: ✅ Investigation Complete - Ready for Implementation
**Purpose**: Document real patterns found in codebase for capability checking and HookPoint registration

---

## 🎯 EXECUTIVE SUMMARY

### Key Findings:

1. **Capabilities activate/deactivate MODULES** - not individual hooks
2. **HookPoints filter by PERMISSIONS** - not capabilities
3. **Module manifests specify `requiredFeatures`** - if feature OFF, module doesn't load
4. **Hooks auto-register during module setup** - no manual capability checks needed

### Architecture Flow:
```
User selects capabilities
    ↓
FeatureActivationEngine activates features
    ↓
Modules with matching requiredFeatures load
    ↓
Module setup() registers hooks
    ↓
HookPoint renders hooks (filtered by user permissions)
```

---

## 📚 CAPABILITY SYSTEM PATTERNS

### 1. **Store & Hook**

**Location**: `src/store/capabilityStore.ts` + `src/lib/capabilities/index.ts`

**Primary Hook**:
```typescript
import { useCapabilities } from '@/lib/capabilities';

const {
  hasFeature,          // Check single feature
  hasAllFeatures,      // Check multiple features
  activeFeatures,      // Array of active FeatureId[]
  profile              // User profile with selectedCapabilities
} = useCapabilities();
```

**Check if feature is active**:
```typescript
import { useCapabilities } from '@/lib/capabilities';

function MyComponent() {
  const { hasFeature } = useCapabilities();

  if (!hasFeature('sales_pos_service')) {
    return null; // Don't render if feature not active
  }

  return <div>Service POS</div>;
}
```

**Alternative - Direct selector** (better performance):
```typescript
import { useFeature } from '@/lib/capabilities';

function MyComponent() {
  const hasServicePOS = useFeature('sales_pos_service');

  if (!hasServicePOS) return null;

  return <div>Service POS</div>;
}
```

---

### 2. **Module Access Check**

**Check if module is active**:
```typescript
import { useModuleAccess } from '@/lib/capabilities';

function MyComponent() {
  const hasAccess = useModuleAccess('scheduling');

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <SchedulingUI />;
}
```

**How it works**:
- `useModuleAccess()` calls `getActiveModules()` from store
- `getActiveModules()` uses `getModulesForActiveFeatures(activeFeatures)`
- Returns array of module IDs that should be visible

---

### 3. **Feature Types**

**Type**: `FeatureId` from `@/config/FeatureRegistry`

**Examples**:
```typescript
// Sales features
'sales_order_management'
'sales_payment_processing'
'sales_pos_onsite'
'sales_pos_service'  // ← SERVICE POS
'sales_pos_rental'   // ← RENTAL POS (need to verify if exists)

// Operations features
'operations_table_management'
'operations_table_assignment'

// Scheduling features
'scheduling_appointments'
'scheduling_staff_shifts'
```

---

## 🎣 HOOKPOINT SYSTEM PATTERNS

### 1. **HookPoint Component**

**Location**: `src/lib/modules/HookPoint.tsx`

**Basic Usage**:
```typescript
import { HookPoint } from '@/lib/modules';

<HookPoint
  name="sales.pos.context_selector"
  data={{
    cart: cart,
    onContextSelect: handleContextSelect,
    initialContext: saleContext
  }}
  fallback={<Text>No context available</Text>}
  direction="row"
  gap="2"
  debug={false}
/>
```

**Props**:
```typescript
interface HookPointProps<T> {
  name: string;                    // Hook point ID
  data?: T;                        // Data passed to hooks
  fallback?: React.ReactElement;   // Shown if no hooks
  direction?: 'row' | 'column';    // Layout direction
  gap?: string | number;           // Spacing between hooks
  className?: string;              // CSS class
  debug?: boolean;                 // Enable debug logs
}
```

---

### 2. **Hook Registration in Module Manifest**

**Location**: Module `manifest.tsx` file (e.g., `src/modules/fulfillment/onsite/manifest.tsx`)

**Pattern**:
```typescript
import type { ModuleManifest } from '@/lib/modules/types';

export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  name: 'My Module',
  version: '1.0.0',

  // ✅ REQUIRED FEATURES - Module only loads if these features are active
  requiredFeatures: ['sales_pos_service'],

  // Optional features (nice to have but not required)
  optionalFeatures: ['sales_advanced_analytics'],

  // Dependencies on other modules
  depends: ['sales'],

  // Hooks this module provides and consumes
  hooks: {
    provide: ['my-module.custom_hook'],
    consume: ['sales.order_placed']
  },

  // Setup function - runs when module loads
  setup: async (registry) => {
    // Import component (lazy loaded)
    const { MyComponent } = await import('./components/MyComponent');

    // Register hook
    registry.addAction(
      'sales.pos.product_flow',     // HookPoint name
      (data) => (                   // Component factory function
        <MyComponent
          productId={data?.selectedProduct?.id}
          onComplete={data?.onFlowComplete}
        />
      ),
      'my-module',                  // Module ID (for debugging)
      90,                           // Priority (higher = renders first)
      {
        // Optional: Permission check
        requiredPermission: {
          module: 'operations',     // Permission module
          action: 'read'            // Permission action
        }
      }
    );
  }
};
```

---

### 3. **Real Example: Onsite Module**

**File**: `src/modules/fulfillment/onsite/manifest.tsx`

```typescript
export const fulfillmentOnsiteManifest: ModuleManifest = {
  id: 'fulfillment-onsite',

  // ✅ Module only loads if this feature is active
  requiredFeatures: ['operations_table_management'],

  setup: async (registry) => {
    // Lazy load component
    const { OnsiteTableSelector } = await import('./components/OnsiteTableSelector');

    // Register hook for POS context selector
    registry.addAction(
      'sales.pos.context_selector',  // ← Already used in SaleFormModal!
      (data) => (
        <OnsiteTableSelector
          cart={data?.cart || []}
          onContextSelect={data?.onContextSelect}
          initialContext={data?.initialContext}
        />
      ),
      'fulfillment-onsite',
      100, // High priority - table is main context
      {
        // Only show if user has operations read permission
        requiredPermission: { module: 'operations', action: 'read' }
      }
    );
  }
};
```

**How it works**:
1. If `operations_table_management` feature is OFF → Module doesn't load
2. If feature is ON → Module loads and registers hook
3. When `<HookPoint name="sales.pos.context_selector" />` renders:
   - HookPoint gets all registered hooks for that name
   - Filters hooks by user permissions
   - Renders OnsiteTableSelector if user has `operations.read` permission

---

### 4. **Hook Registration API**

**Method**: `registry.addAction(hookName, handler, moduleId, priority, options)`

**Parameters**:
```typescript
registry.addAction(
  hookName: string,               // HookPoint name (e.g., 'sales.pos.product_flow')
  handler: (data: T) => ReactNode, // Component factory receiving hook data
  moduleId: string,               // Module ID for debugging
  priority?: number,              // Optional priority (higher = first, default: 10)
  options?: {                     // Optional configuration
    requiredPermission?: {
      module: string,             // Permission module (e.g., 'operations')
      action: string              // Permission action (e.g., 'read', 'write')
    }
  }
)
```

---

### 5. **Hook Priority System**

**How priority works**:
- Higher number = Renders first
- Default priority = 10
- Hooks sorted by priority before rendering

**Example**:
```typescript
// This renders FIRST (priority 100)
registry.addAction('sales.metrics', () => <MetricA />, 'module-a', 100);

// This renders SECOND (priority 90)
registry.addAction('sales.metrics', () => <MetricB />, 'module-b', 90);

// This renders THIRD (default priority 10)
registry.addAction('sales.metrics', () => <MetricC />, 'module-c');
```

---

## 🔐 PERMISSION vs CAPABILITY

### Important Distinction:

| Concept | Purpose | Checked By | Example |
|---------|---------|------------|---------|
| **Capability/Feature** | Activates modules | Module system at load time | `requiredFeatures: ['sales_pos_service']` |
| **Permission** | Controls user access | HookPoint at render time | `requiredPermission: { module: 'operations', action: 'read' }` |

### How They Work Together:

```
┌─────────────────────────────────────────────────────┐
│ 1. USER SELECTS CAPABILITIES                        │
│    - User chooses: "Onsite Service"                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. FEATURES ACTIVATED                                │
│    - FeatureActivationEngine                         │
│    - Activates: operations_table_management          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. MODULES LOAD                                      │
│    - Onsite module has requiredFeatures: [...]       │
│    - Feature is active → Module loads                │
│    - Module setup() runs                             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. HOOKS REGISTERED                                  │
│    - registry.addAction('sales.pos.context_selector'│
│      ..., requiredPermission: {...})                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. HOOKPOINT RENDERS                                 │
│    - <HookPoint name="sales.pos.context_selector" />│
│    - Gets all registered hooks                       │
│    - Filters by user PERMISSIONS                     │
│    - Renders OnsiteTableSelector                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ CORRECT PATTERNS FOR SALES POS

### 1. **Module Manifest for SERVICE POS**

**File**: `src/modules/scheduling/manifest.tsx` (to be updated)

```typescript
export const schedulingManifest: ModuleManifest = {
  id: 'scheduling',

  // ✅ Add this feature requirement
  requiredFeatures: [
    'scheduling_appointments',  // Existing
    'sales_pos_service'         // ← NEW: Enable SERVICE POS flow
  ],

  setup: async (registry) => {
    // ============================================
    // NEW: Register SERVICE POS Flow
    // ============================================

    const { DateTimePickerLite } = await import(
      '@/shared/ui/components/business/DateTimePickerLite'
    );

    registry.addAction(
      'sales.pos.product_flow',
      (data) => {
        // Only render for SERVICE products
        if (data?.productType !== 'SERVICE') return null;

        return (
          <DateTimePickerLite
            serviceId={data?.selectedProduct?.id}
            onSelect={(datetime) => {
              data?.onFlowComplete?.({ datetime });
            }}
          />
        );
      },
      'scheduling',
      90,
      {
        requiredPermission: { module: 'scheduling', action: 'create' }
      }
    );

    // ============================================
    // NEW: Register SERVICE Metric
    // ============================================

    const { ServiceMetrics } = await import('./components/ServiceMetrics');

    registry.addAction(
      'sales.metrics',
      () => <ServiceMetrics />,
      'scheduling',
      80,
      {
        requiredPermission: { module: 'scheduling', action: 'read' }
      }
    );
  }
};
```

---

### 2. **SaleFormModal with HookPoint**

**File**: `src/pages/admin/operations/sales/components/SaleFormModal.tsx`

```typescript
export function SaleFormModal({ isOpen, onClose }: Props) {
  const { hasFeature } = useCapabilities();

  // Detect available ProductTypes based on active features
  const availableProductTypes = useMemo(() => {
    const types: ProductType[] = [];

    if (hasFeature('sales_pos_onsite')) types.push('PHYSICAL');
    if (hasFeature('sales_pos_service')) types.push('SERVICE');
    if (hasFeature('sales_pos_digital')) types.push('DIGITAL');
    if (hasFeature('sales_pos_rental')) types.push('RENTAL');
    if (hasFeature('sales_pos_membership')) types.push('MEMBERSHIP');

    return types;
  }, [hasFeature]);

  const [productType, setProductType] = useState<ProductType | null>(
    availableProductTypes.length === 1 ? availableProductTypes[0] : null
  );

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Content>
        <Dialog.Header>
          {/* Step 1: ProductType Selection (if multiple available) */}
          {availableProductTypes.length > 1 && !productType && (
            <HookPoint
              name="sales.pos.product_type_selector"
              data={{
                availableProductTypes,
                onProductTypeSelect: setProductType
              }}
              direction="row"
              gap="2"
            />
          )}

          {/* Context selector (table, delivery zone, etc.) */}
          <HookPoint
            name="sales.pos.context_selector"
            data={{
              cart,
              productType,
              onContextSelect: handleContextSelect
            }}
          />
        </Dialog.Header>

        <Dialog.Body>
          {/* Product search */}
          <ProductSearch
            filter={{ productType }}
            onSelect={handleProductSelect}
          />

          {/* ProductType-specific flow */}
          <HookPoint
            name="sales.pos.product_flow"
            data={{
              productType,
              selectedProduct,
              onFlowComplete: handleFlowComplete
            }}
          />

          {/* Cart or direct order list */}
          {pattern === 'CART' && <CartSummary items={cart} />}
          {pattern === 'DIRECT_ORDER' && <DirectOrderList items={orders} />}
        </Dialog.Body>

        <Dialog.Footer>
          <PaymentProcessor total={totals.total} pattern={pattern} />
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

---

### 3. **SalesMetrics with HookPoint**

**File**: `src/pages/admin/operations/sales/components/SalesMetrics.tsx`

```typescript
export function SalesMetrics({ metrics, loading }: Props) {
  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        {/* CORE METRICS - Always visible */}
        <MetricCard
          title="Revenue Hoy"
          value={`$${metrics.todayRevenue}`}
          icon={CurrencyDollarIcon}
          colorPalette="green"
        />

        <MetricCard
          title="Transacciones Activas"
          value={metrics.todayTransactions}
          icon={CreditCardIcon}
          colorPalette="blue"
        />

        <MetricCard
          title="Ticket Promedio"
          value={`$${metrics.averageOrderValue}`}
          icon={ArrowTrendingUpIcon}
          colorPalette="purple"
        />

        {/* CAPABILITY METRICS - Injected via HookPoint */}
        <HookPoint
          name="sales.metrics"
          data={{
            dateRange: metrics.dateRange,
            filters: metrics.filters
          }}
          // No fallback - just show core metrics if no hooks
        />
      </CardGrid>
    </StatsSection>
  );
}
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Update Module Manifests

- [ ] Update Scheduling manifest with `sales_pos_service` feature
- [ ] Update Rentals manifest with `sales_pos_rental` feature
- [ ] Update Onsite manifest (already done - uses `sales.pos.context_selector`)
- [ ] Update Delivery manifest with `sales_pos_delivery` feature (if not exists)

### Phase 2: Register HookPoint Handlers

- [ ] Scheduling: Register `sales.pos.product_flow` for SERVICE
- [ ] Scheduling: Register `sales.metrics` for appointments
- [ ] Rentals: Register `sales.pos.product_flow` for RENTAL
- [ ] Rentals: Register `sales.metrics` for rental stats
- [ ] Onsite: Register `sales.metrics` for table stats (already has context selector)
- [ ] Delivery: Register `sales.metrics` for delivery stats

### Phase 3: Update SaleFormModal

- [ ] Add capability detection for available ProductTypes
- [ ] Add ProductType state management
- [ ] Add `sales.pos.product_type_selector` HookPoint (if multiple types available)
- [ ] Add `sales.pos.product_flow` HookPoint
- [ ] Keep existing `sales.pos.context_selector` HookPoint (already works)

### Phase 4: Update SalesMetrics

- [ ] Keep core 3 metrics
- [ ] Add `sales.metrics` HookPoint
- [ ] Remove hardcoded capability-specific metrics

### Phase 5: Create Missing Components

- [ ] Create DateTimePickerLite (combine date + TimeSlotPicker)
- [ ] Create PeriodPicker (for RENTAL)
- [ ] Create ServiceMetrics component (for scheduling module)
- [ ] Create RentalMetrics component (for rentals module)

---

## 📝 IMPORTANT NOTES

### 1. **NO Manual Capability Checks in Hooks**

❌ **WRONG**:
```typescript
registry.addAction('sales.pos.product_flow', (data) => {
  const { hasFeature } = useCapabilities(); // ❌ Don't do this
  if (!hasFeature('sales_pos_service')) return null;
  return <DateTimePickerLite />;
});
```

✅ **CORRECT**:
```typescript
// In manifest:
requiredFeatures: ['sales_pos_service'],

// In setup:
registry.addAction('sales.pos.product_flow', (data) => {
  // Module only loaded if feature active - no need to check
  if (data?.productType !== 'SERVICE') return null; // Check ProductType instead
  return <DateTimePickerLite />;
});
```

---

### 2. **Conditional Rendering Based on Data**

```typescript
registry.addAction('sales.pos.product_flow', (data) => {
  // ✅ Check data to determine if hook should render
  if (data?.productType !== 'SERVICE') {
    return null; // Don't render for other ProductTypes
  }

  return <DateTimePickerLite {...data} />;
});
```

---

### 3. **HookPoint Automatically Filters**

- HookPoint filters hooks by **user permissions** automatically
- No need to manually check permissions in hook handler
- Just specify `requiredPermission` in `registry.addAction()` options

---

## 🎯 SUMMARY

### How Capability-Aware Architecture Works:

1. **User selects capabilities** → Features activate
2. **Modules with matching requiredFeatures** → Load and register hooks
3. **HookPoint renders** → Filters by permissions and renders all hooks
4. **Result**: UI automatically adapts to active capabilities

### No Need For:
- ❌ Manual capability checks in hook handlers
- ❌ Wrapper components checking capabilities
- ❌ Complex conditional logic

### Just Need:
- ✅ `requiredFeatures` in module manifest
- ✅ `registry.addAction()` in module setup
- ✅ `<HookPoint />` in component
- ✅ Optional data-based conditional rendering (`if (data?.productType !== 'SERVICE')`)

---

**Status**: ✅ Patterns documented - Ready for implementation
**Next**: Update module manifests and implement HookPoints
**Last Updated**: 2025-12-12
