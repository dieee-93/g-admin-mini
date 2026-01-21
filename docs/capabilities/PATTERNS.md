# Design Patterns and Best Practices

**Pattern library for the Capability-Features System**

**Version**: 4.0
**Last Updated**: 2025-01-20

---

## Table of Contents

1. [Strategy Pattern for Widget Modes](#strategy-pattern-for-widget-modes)
2. [Rule Engine for Feature Activation](#rule-engine-for-feature-activation)
3. [Avoiding Nested Conditions](#avoiding-nested-conditions)
4. [Reference Deduplication](#reference-deduplication)
5. [Progressive Disclosure](#progressive-disclosure)
6. [Module-Feature Separation](#module-feature-separation)
7. [Always-Active vs Conditional](#always-active-vs-conditional)

---

## Strategy Pattern for Widget Modes

### Problem

Dashboard widgets need to adapt their display based on active capabilities:
- Show different data for different business models
- Different actions available based on features
- Prevent widget "mode explosion" (if-else hell)

### Solution

Use Strategy Pattern to encapsulate widget behavior by capability combination.

### Implementation

```typescript
// Define widget strategies
interface WidgetStrategy {
  id: string;
  priority: number;
  condition: (features: FeatureId[]) => boolean;
  component: React.ComponentType;
}

// Concrete strategies
const widgetStrategies: WidgetStrategy[] = [
  {
    id: 'rental-advanced',
    priority: 10, // Higher priority = preferred
    condition: (features) =>
      features.includes('rental_item_management') &&
      features.includes('rental_booking_calendar') &&
      features.includes('inventory_stock_tracking'),
    component: RentalAdvancedWidget
  },
  {
    id: 'rental-basic',
    priority: 5,
    condition: (features) =>
      features.includes('rental_item_management'),
    component: RentalBasicWidget
  },
  {
    id: 'inventory-only',
    priority: 1,
    condition: (features) =>
      features.includes('inventory_stock_tracking'),
    component: InventoryWidget
  }
];

// Select best strategy
function selectWidgetStrategy(
  features: FeatureId[]
): WidgetStrategy | null {
  const applicable = widgetStrategies
    .filter(s => s.condition(features))
    .sort((a, b) => b.priority - a.priority); // Highest priority first

  return applicable[0] || null;
}

// Use in component
function DashboardWidget() {
  const activeFeatures = useActiveFeatures();
  const strategy = selectWidgetStrategy(activeFeatures);

  if (!strategy) return null;

  const Component = strategy.component;
  return <Component />;
}
```

### Benefits

- **Declarative**: Each strategy is self-contained
- **Extensible**: Add new strategies without modifying existing code
- **Testable**: Each strategy can be tested in isolation
- **Priority-based**: Automatically selects best match

### When to Use

- Widgets with multiple display modes
- Components that vary significantly by capability
- Avoiding long if-else chains

### Real Example: Sales Widget

```typescript
const salesWidgetStrategies: WidgetStrategy[] = [
  // B2B + E-commerce (most features)
  {
    id: 'sales-b2b-ecommerce',
    priority: 20,
    condition: (f) =>
      f.includes('finance_corporate_accounts') &&
      f.includes('sales_catalog_ecommerce'),
    component: B2BEcommerceSalesWidget
  },

  // B2B only
  {
    id: 'sales-b2b',
    priority: 15,
    condition: (f) => f.includes('finance_corporate_accounts'),
    component: B2BSalesWidget
  },

  // E-commerce only
  {
    id: 'sales-ecommerce',
    priority: 10,
    condition: (f) => f.includes('sales_catalog_ecommerce'),
    component: EcommerceSalesWidget
  },

  // Onsite POS
  {
    id: 'sales-pos',
    priority: 5,
    condition: (f) => f.includes('sales_pos_onsite'),
    component: POSSalesWidget
  },

  // Fallback: basic sales
  {
    id: 'sales-basic',
    priority: 1,
    condition: (f) => f.includes('sales_order_management'),
    component: BasicSalesWidget
  }
];
```

---

## Rule Engine for Feature Activation

### Problem

Complex logic for determining which features to activate based on capabilities:
- Multiple conditions per feature
- Shared features across capabilities
- Hard to maintain nested if-else

### Solution

Declarative rule engine where features declare their activation conditions.

### Implementation

```typescript
// Define activation rules
interface FeatureActivationRule {
  featureId: FeatureId;
  activatedBy: {
    anyOf?: BusinessCapabilityId[];      // OR logic
    allOf?: BusinessCapabilityId[];      // AND logic
    infrastructure?: InfrastructureId[]; // Infrastructure requirements
  };
}

// Declare rules
const featureActivationRules: FeatureActivationRule[] = [
  {
    featureId: 'multisite_location_management',
    activatedBy: {
      infrastructure: ['multi_location'] // Only with multi-location infra
    }
  },
  {
    featureId: 'sales_order_management',
    activatedBy: {
      anyOf: [  // Activated by ANY of these capabilities
        'physical_products',
        'professional_services',
        'digital_products'
      ]
    }
  },
  {
    featureId: 'operations_delivery_tracking',
    activatedBy: {
      allOf: [  // Requires ALL of these
        'delivery_shipping'
      ],
      infrastructure: ['single_location', 'multi_location'] // Not for mobile-only
    }
  }
];

// Rule evaluation engine
function evaluateFeatureRules(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): FeatureId[] {
  const activated: FeatureId[] = [];

  for (const rule of featureActivationRules) {
    let shouldActivate = true;

    // Check anyOf (OR)
    if (rule.activatedBy.anyOf) {
      const hasAny = rule.activatedBy.anyOf.some(cap =>
        capabilities.includes(cap)
      );
      shouldActivate = shouldActivate && hasAny;
    }

    // Check allOf (AND)
    if (rule.activatedBy.allOf) {
      const hasAll = rule.activatedBy.allOf.every(cap =>
        capabilities.includes(cap)
      );
      shouldActivate = shouldActivate && hasAll;
    }

    // Check infrastructure
    if (rule.activatedBy.infrastructure) {
      const hasInfra = rule.activatedBy.infrastructure.some(infra =>
        infrastructure.includes(infra)
      );
      shouldActivate = shouldActivate && hasInfra;
    }

    if (shouldActivate) {
      activated.push(rule.featureId);
    }
  }

  return activated;
}
```

### Benefits

- **Declarative**: Rules are data, not code
- **Readable**: Easy to understand activation logic
- **Maintainable**: Add rules without touching engine
- **Debuggable**: Can log which rules fired

### When to Use

- Complex activation logic
- Features with multiple activation paths
- When activation rules change frequently

### Current Implementation

The current system uses a simpler approach - capabilities directly list their `activatesFeatures`:

```typescript
'physical_products': {
  activatesFeatures: [
    'production_bom_management',
    'inventory_stock_tracking',
    // ... direct list
  ]
}
```

This works well because:
- Most features are activated by exactly one capability
- Shared features are handled by Set deduplication
- Simple to understand and debug

**When to upgrade to Rule Engine**:
- Features start having complex conditions (e.g., "activate if A AND B but NOT C")
- Need dynamic feature activation based on runtime state
- Business rules become more complex than static lists

---

## Avoiding Nested Conditions

### Anti-Pattern: Nested If-Else

```typescript
// ❌ BAD - Nested conditions are hard to maintain
function renderSalesView() {
  if (hasFeature('sales_pos_onsite')) {
    if (hasFeature('operations_table_management')) {
      if (hasFeature('sales_split_payment')) {
        return <RestaurantPOSWithTablesAndSplit />;
      } else {
        return <RestaurantPOSWithTables />;
      }
    } else {
      if (hasFeature('sales_split_payment')) {
        return <SimplePOSWithSplit />;
      } else {
        return <SimplePOS />;
      }
    }
  } else if (hasFeature('sales_online_order_processing')) {
    if (hasFeature('sales_cart_management')) {
      return <OnlineStoreWithCart />;
    } else {
      return <OnlineStoreSimple />;
    }
  } else {
    return <BasicSales />;
  }
}
```

**Problems**:
- Hard to read
- Hard to test all paths
- Hard to add new variants
- Exponential complexity

---

### Pattern 1: Strategy Pattern

```typescript
// ✅ GOOD - Strategy Pattern (see above)
const strategies: ViewStrategy[] = [
  {
    condition: (f) =>
      f.includes('sales_pos_onsite') &&
      f.includes('operations_table_management') &&
      f.includes('sales_split_payment'),
    component: RestaurantPOSWithTablesAndSplit,
    priority: 10
  },
  // ... more strategies
];

const strategy = selectBestStrategy(activeFeatures, strategies);
return <strategy.component />;
```

---

### Pattern 2: Composition

```typescript
// ✅ GOOD - Compose features together
function SalesView() {
  return (
    <div>
      <SalesHeader />

      {/* Each component decides its own visibility */}
      <POSPanel />
      <TableManagement />
      <SplitPaymentControls />
      <OnlineOrders />

      <SalesFooter />
    </div>
  );
}

function POSPanel() {
  const hasPOS = useFeature('sales_pos_onsite');
  if (!hasPOS) return null;
  return <POSInterface />;
}

function TableManagement() {
  const hasTables = useFeature('operations_table_management');
  if (!hasTables) return null;
  return <TableGrid />;
}
```

**Benefits**:
- Each component is independent
- Easy to test
- Easy to add/remove features
- Flat structure

---

### Pattern 3: Feature Groups

```typescript
// ✅ GOOD - Group related features
interface FeatureGroup {
  id: string;
  features: FeatureId[];
  component: React.ComponentType;
}

const salesFeatureGroups: FeatureGroup[] = [
  {
    id: 'restaurant-pos',
    features: [
      'sales_pos_onsite',
      'operations_table_management',
      'sales_split_payment'
    ],
    component: RestaurantPOS
  },
  {
    id: 'online-store',
    features: [
      'sales_catalog_ecommerce',
      'sales_cart_management',
      'sales_checkout_process'
    ],
    component: OnlineStore
  }
];

function SalesView() {
  const activeFeatures = useActiveFeatures();

  return (
    <div>
      {salesFeatureGroups.map(group => {
        const hasAllFeatures = group.features.every(f =>
          activeFeatures.includes(f)
        );

        if (!hasAllFeatures) return null;

        return <group.component key={group.id} />;
      })}
    </div>
  );
}
```

---

### Pattern 4: Guard Clauses

```typescript
// ✅ GOOD - Early returns flatten structure
function renderSalesView() {
  // Guard clauses - handle special cases first
  if (!hasAnyFeature('sales_*')) {
    return <NoSalesMessage />;
  }

  if (hasFeature('sales_pos_onsite') && hasFeature('operations_table_management')) {
    return <RestaurantPOS />;
  }

  if (hasFeature('sales_catalog_ecommerce')) {
    return <OnlineStore />;
  }

  // Default fallback
  return <BasicSales />;
}
```

---

## Reference Deduplication

### Problem

Shared requirements appear in multiple capabilities, leading to duplication:

```typescript
// Without deduplication - lots of repetition
const onsite_requirements = [
  { id: 'business_name', ... },      // Duplicate definition
  { id: 'business_address', ... },   // Duplicate definition
  { id: 'payment_method', ... },     // Duplicate definition
  { id: 'table_config', ... }        // Unique
];

const pickup_requirements = [
  { id: 'business_name', ... },      // Duplicate definition
  { id: 'business_address', ... },   // Duplicate definition
  { id: 'payment_method', ... },     // Duplicate definition
  { id: 'pickup_hours', ... }        // Unique
];
```

**Problems**:
- Duplication of definition code
- Inconsistency if one definition changes
- More memory usage
- Harder to maintain

---

### Solution: Import by Reference

```typescript
// Define shared requirements ONCE
// File: src/shared/requirements.ts
export const BUSINESS_NAME_CONFIGURED: Achievement = {
  id: 'business_name_configured',
  tier: 'mandatory',
  name: 'Configure Business Name',
  description: 'Set your business name',
  // ... rest of definition
};

export const BUSINESS_ADDRESS_CONFIGURED: Achievement = {
  id: 'business_address_configured',
  // ... definition
};

export const PAYMENT_METHOD_CONFIGURED: Achievement = {
  id: 'payment_method_configured',
  // ... definition
};

// Use by reference - same object in memory
// File: src/modules/achievements/requirements/capability-mapping.ts
import {
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  PAYMENT_METHOD_CONFIGURED
} from '@/shared/requirements';

export const CAPABILITY_REQUIREMENTS = {
  onsite_service: [
    BUSINESS_NAME_CONFIGURED,      // Reference (not copy)
    BUSINESS_ADDRESS_CONFIGURED,   // Reference
    PAYMENT_METHOD_CONFIGURED,     // Reference
    TABLE_CONFIGURATION            // Local definition
  ],

  pickup_orders: [
    BUSINESS_NAME_CONFIGURED,      // Same reference
    BUSINESS_ADDRESS_CONFIGURED,   // Same reference
    PAYMENT_METHOD_CONFIGURED,     // Same reference
    PICKUP_HOURS_CONFIGURED        // Local definition
  ]
};
```

---

### Automatic Deduplication with Set

```typescript
// Deduplication helper
function getRequirementsForCapabilities(
  capabilities: BusinessCapabilityId[]
): Achievement[] {
  // Flatten all requirements
  const allRequirements = capabilities.flatMap(
    cap => CAPABILITY_REQUIREMENTS[cap] || []
  );

  // Set deduplicates by reference equality
  // Because we imported shared requirements by reference,
  // JavaScript Set automatically deduplicates them!
  return Array.from(new Set(allRequirements));
}

// Usage
const requirements = getRequirementsForCapabilities([
  'onsite_service',  // Has BUSINESS_NAME_CONFIGURED
  'pickup_orders',   // Has BUSINESS_NAME_CONFIGURED (same reference)
  'delivery_shipping' // Has BUSINESS_NAME_CONFIGURED (same reference)
]);

// BUSINESS_NAME_CONFIGURED appears only once!
// Because all three capabilities reference the SAME object
console.log(requirements.length); // 10 (not 12 with duplicates)
```

---

### Benefits

- **Single Source of Truth**: Shared requirements defined once
- **Automatic Deduplication**: Set deduplication by reference (O(n))
- **Memory Efficient**: Same object in memory, not copies
- **Type Safe**: TypeScript ensures correct type
- **Easy Updates**: Change definition once, affects all uses

---

### Pattern Variations

#### Pattern A: Shared Constants File

```typescript
// src/shared/requirements.ts
export const SHARED_REQUIREMENTS = {
  BUSINESS_NAME: { ... },
  BUSINESS_ADDRESS: { ... },
  PAYMENT_METHOD: { ... }
} as const;

// Use with destructuring
import { SHARED_REQUIREMENTS as SR } from '@/shared/requirements';

onsite_service: [
  SR.BUSINESS_NAME,
  SR.BUSINESS_ADDRESS,
  // ...
]
```

---

#### Pattern B: Requirement Factory

```typescript
// For requirements with variations
function createMinimumCountRequirement(
  entity: string,
  count: number
): Achievement {
  return {
    id: `${entity}_min_count_${count}`,
    name: `Add ${count} ${entity}`,
    description: `You need at least ${count} ${entity}`,
    validator: (ctx) => (ctx[entity]?.length || 0) >= count,
    // ...
  };
}

// Use
const CUSTOMER_MIN_5 = createMinimumCountRequirement('customers', 5);
const PRODUCT_MIN_10 = createMinimumCountRequirement('products', 10);
```

---

#### Pattern C: Requirement Composition

```typescript
// Combine requirements into groups
const BASIC_SETUP = [
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  PAYMENT_METHOD_CONFIGURED
];

const INVENTORY_SETUP = [
  ...BASIC_SETUP,
  FIRST_MATERIAL_ADDED,
  FIRST_SUPPLIER_ADDED
];

// Use groups
export const CAPABILITY_REQUIREMENTS = {
  physical_products: [
    ...INVENTORY_SETUP,  // Spread group
    PRODUCTION_WORKFLOW_CONFIGURED
  ]
};
```

---

## Progressive Disclosure

### Principle

Show features progressively as users need them, not all at once.

Based on Nielsen Norman Group's "Progressive Disclosure" pattern.

### Implementation Levels

#### Level 1: Capability-Based Disclosure

```typescript
// Only show features relevant to selected capabilities
function Dashboard() {
  const { hasFeature } = useCapabilities();

  return (
    <div>
      {/* Always show core features */}
      <OverviewWidget />

      {/* Show based on capabilities */}
      {hasFeature('production_bom_management') && (
        <ProductionQueueWidget />
      )}

      {hasFeature('operations_table_management') && (
        <TableStatusWidget />
      )}

      {hasFeature('rental_booking_calendar') && (
        <RentalCalendarWidget />
      )}
    </div>
  );
}
```

---

#### Level 2: Achievement-Based Disclosure

```typescript
// Show advanced features after completing basics
function SalesSettings() {
  const { hasFeature } = useCapabilities();
  const { hasCompletedAchievement } = useAchievements();

  const basicSetupComplete = hasCompletedAchievement('payment_method_configured');

  return (
    <div>
      {/* Basic settings - always show */}
      <PaymentMethodConfig />

      {/* Advanced settings - only after basic setup */}
      {basicSetupComplete && hasFeature('sales_split_payment') && (
        <SplitPaymentConfig />
      )}

      {basicSetupComplete && hasFeature('sales_tip_management') && (
        <TipConfiguration />
      )}
    </div>
  );
}
```

---

#### Level 3: Usage-Based Disclosure

```typescript
// Show features based on user behavior
function AdvancedFeatures() {
  const salesCount = useSalesCount();
  const customerCount = useCustomerCount();

  // Show advanced features after reaching thresholds
  const showAdvancedPricing = salesCount > 100;
  const showLoyaltyProgram = customerCount > 50;

  return (
    <div>
      {showAdvancedPricing && (
        <TieredPricingConfig />
      )}

      {showLoyaltyProgram && (
        <LoyaltyProgramSetup />
      )}
    </div>
  );
}
```

---

### Navigation Disclosure

```typescript
// Sidebar shows modules progressively
function Sidebar() {
  const visibleModules = useCapabilities().visibleModules;

  // Always show core modules
  const coreModules = ['dashboard', 'settings'];

  // Show business modules based on capabilities
  const businessModules = visibleModules.filter(m =>
    !coreModules.includes(m)
  );

  return (
    <nav>
      {/* Core - always visible */}
      <NavSection title="Core">
        {coreModules.map(m => <NavItem key={m} module={m} />)}
      </NavSection>

      {/* Business - capability-based */}
      {businessModules.length > 0 && (
        <NavSection title="Business">
          {businessModules.map(m => <NavItem key={m} module={m} />)}
        </NavSection>
      )}
    </nav>
  );
}
```

---

### Benefits

- **Reduced Cognitive Load**: Users see only relevant features
- **Guided Learning**: Features appear when users need them
- **Cleaner UI**: Less clutter
- **Better UX**: Progressive complexity increase

---

## Module-Feature Separation

### Principle

Modules (navigation/pages) are separate from Features (system capabilities).

**Why separate**:
- Features are granular (88+)
- Modules are coarse-grained (20+)
- Many features don't need dedicated modules
- Features can be shared across modules

---

### Pattern: Features Activate Modules

```typescript
// Features are atomic capabilities
const features = [
  'sales_order_management',
  'sales_payment_processing',
  'inventory_stock_tracking'
];

// MODULE_FEATURE_MAP determines which modules show
const MODULE_FEATURE_MAP = {
  'sales': {
    optionalFeatures: [
      'sales_order_management',
      'sales_payment_processing',
      // ... any sales feature activates sales module
    ]
  },
  'materials': {
    optionalFeatures: [
      'inventory_stock_tracking',
      'inventory_alert_system',
      // ... any inventory feature activates materials module
    ]
  }
};

// Modules are computed from features
const visibleModules = getModulesForActiveFeatures(features);
// ['sales', 'materials']
```

---

### Anti-Pattern: Tightly Coupled

```typescript
// ❌ BAD - Module and feature are same thing
type FeatureId = 'sales' | 'inventory' | 'production';

// Problems:
// 1. Can't have multiple sales features
// 2. Can't share features across modules
// 3. Can't have features without modules
// 4. Inflexible for complex business models
```

---

### Pattern: Loose Coupling

```typescript
// ✅ GOOD - Separate concerns
type FeatureId =
  | 'sales_order_management'
  | 'sales_payment_processing'
  | 'sales_pos_onsite'
  // ... 88+ granular features

type ModuleId =
  | 'sales'
  | 'materials'
  | 'delivery'
  // ... 20+ coarse-grained modules

// Flexible mapping
const MODULE_FEATURE_MAP: Record<ModuleId, {
  requiredFeatures?: FeatureId[];
  optionalFeatures?: FeatureId[];
}>;
```

---

### Benefits

- **Flexibility**: Features can activate multiple modules
- **Granularity**: Fine-grained feature control
- **Reusability**: Features shared across modules
- **Independence**: Change features without changing modules

---

## Always-Active vs Conditional

### Always-Active Features

```typescript
// DEPRECATED in v5.0 (2026-01-19)
// Previously: Features with category: 'always_active'
// Now: CORE modules loaded via CORE_MODULES array

// src/lib/modules/constants.ts
export const CORE_MODULES = [
  'dashboard',   // Everyone needs overview
  'settings',    // Everyone needs config
  'debug',       // Development tools
  'customers',   // Everyone has customers
  'sales',       // Everyone sells something
  'gamification' // Motivates all users
] as const;
```

**Migration to v5.0**:
- ~~Features with `category: 'always_active'`~~ → CORE_MODULES array
- CORE modules have NO `activatedBy` in manifest
- Bootstrap always loads CORE modules (no feature check needed)

---

### Conditional Features

```typescript
{
  id: 'sales_pos_onsite',
  category: 'conditional'
}

{
  id: 'rental_booking_calendar',
  category: 'conditional'
}

{
  id: 'multisite_location_management',
  category: 'conditional'
}
```

**Use when**:
- Business-model specific
- Requires specific capability
- Optional enhancement
- 99% of features

**Examples**:
- POS (only for onsite service)
- Rentals (only for rental business)
- Multisite (only for multiple locations)

---

### Decision Tree (v5.0)

```
Is this a CORE system module (6 total)?
├─ Yes → Add to CORE_MODULES array in constants.ts
│  └─ Examples: dashboard, customers, sales, settings, debug, gamification
│  └─ NO activatedBy needed in manifest
│
└─ No → It's an OPTIONAL module
   ├─ Create feature in FeatureRegistry (category: 'conditional')
   ├─ Add to OPTIONAL_MODULES mapping in constants.ts
   │  └─ Example: 'materials': 'inventory_stock_tracking'
   └─ Add activatedBy to manifest
      └─ Example: activatedBy: 'inventory_stock_tracking'
```

---

### Migration to v5.0 Simplified Architecture

```typescript
// BEFORE v5.0 - Complex with autoInstall/enhancedBy
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  autoInstall: false,           // ❌ REMOVED
  activatedBy: 'my_feature',
  enhancedBy: ['extra_feature'] // ❌ REMOVED
};

// AFTER v5.0 - Clean and simple
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  depends: [],
  activatedBy: 'my_feature',
  // ✅ That's it!
};

// Add to OPTIONAL_MODULES in constants.ts
export const OPTIONAL_MODULES = {
  'my-module': 'my_feature'
} as const;

// Migration code in store
if (version < 5) {
  // Remove from activeFeatures if user doesn't have capability
  const hasCapability = state.profile?.selectedCapabilities.includes('relevant_capability');

  if (!hasCapability) {
    return {
      ...state,
      features: {
        ...state.features,
        activeFeatures: state.features.activeFeatures.filter(
          f => f !== 'my_feature'
        )
      }
    };
  }
}
```

---

## Summary

| Pattern | Use Case | Benefit |
|---------|----------|---------|
| **Strategy** | Multiple widget modes | Declarative, extensible |
| **Rule Engine** | Complex feature activation | Maintainable, readable |
| **Avoid Nesting** | Complex conditionals | Flat, testable |
| **Reference Dedup** | Shared requirements | DRY, consistent |
| **Progressive Disclosure** | User experience | Reduced cognitive load |
| **Module-Feature Separation** | System architecture | Flexible, granular |
| **Always-Active** | Core features | Minimal viable system |
| **Conditional** | Business-specific | Targeted functionality |

---

## Next Steps

- **For implementation**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **For API details**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **For troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
