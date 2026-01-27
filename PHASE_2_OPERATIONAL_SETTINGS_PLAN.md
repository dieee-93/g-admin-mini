# PHASE 2: OPERATIONAL SETTINGS - Implementation Plan

**Status**: 🚧 In Progress  
**Start Date**: December 22, 2025  
**Estimated Duration**: 2 sprints (3-4 weeks)  
**Context**: After completing Critical Gaps (Notifications + Hardcoded Enums), now implementing operational settings

---

## 📋 Phase 2 Scope

### Modules to Implement

1. **Staff Policies Page** (`/admin/settings/staff/policies`) - 12 settings
2. **Inventory Alerts Page** (`/admin/settings/inventory/alerts`) - 8 settings  
3. **Fulfillment Policies Pages** (`/admin/settings/fulfillment/*`) - 12 settings
4. **Product Catalog Settings** (`/admin/settings/products/catalog`) - 8 settings

**Total**: 40 operational settings across 4 modules

---

## 🎯 Implementation Strategy

### Architecture Pattern (Proven from Phase 1)

Following the successful pattern from Notification Settings and System Enums:

```
1. Database Migration (Supabase SQL)
   - Create settings table with RLS policies
   - Insert default values
   - Add proper constraints

2. API Service Layer
   - CRUD functions in src/services/[module]Api.ts
   - Error handling with logger
   - Type safety with TypeScript

3. TanStack Query Hooks
   - Query hooks for fetching (with staleTime)
   - Mutation hooks with optimistic updates
   - Proper query key management
   - Cache invalidation strategies

4. UI Components
   - Settings page with tabs/categories
   - Form modals using Dialog from @/shared/ui
   - Stats badges and metrics
   - Loading and error states

5. Settings Manifest Registration
   - Register specialized cards in src/modules/settings/manifest.tsx
   - Proper routing integration

6. Automated Tests
   - Comprehensive test suites with Vitest
   - 100% coverage before moving forward
```

---

## 📦 Module 1: Staff Policies

### Route
`/admin/settings/staff/policies`

### Database Table: `staff_policies`

```sql
CREATE TABLE public.staff_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Departments & Positions
  departments JSONB NOT NULL DEFAULT '[]',  -- Array of department objects
  positions JSONB NOT NULL DEFAULT '[]',    -- Array of position/role objects
  default_hourly_rates JSONB DEFAULT '{}', -- Map: position -> rate
  
  -- Work Rules
  overtime_rules JSONB DEFAULT '{}',       -- Overtime calculation config
  break_duration_policy INTEGER DEFAULT 30, -- Minutes
  unpaid_break_rules JSONB DEFAULT '{}',
  
  -- HR Policies
  performance_review_period INTEGER DEFAULT 90, -- Days
  training_requirements JSONB DEFAULT '[]',
  certification_tracking BOOLEAN DEFAULT false,
  attendance_policy JSONB DEFAULT '{}',
  late_arrival_tolerance INTEGER DEFAULT 15,   -- Minutes
  time_clock_rounding INTEGER DEFAULT 15,      -- Minutes (0, 5, 15)
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Default Values

```json
{
  "departments": [
    {"id": "kitchen", "name": "Cocina", "color": "#FF6B6B"},
    {"id": "bar", "name": "Bar", "color": "#4ECDC4"},
    {"id": "service", "name": "Servicio", "color": "#95E1D3"}
  ],
  "positions": [
    {"id": "chef", "name": "Chef", "department": "kitchen", "level": "senior"},
    {"id": "line_cook", "name": "Cocinero", "department": "kitchen", "level": "mid"},
    {"id": "bartender", "name": "Bartender", "department": "bar", "level": "mid"},
    {"id": "waiter", "name": "Mesero", "department": "service", "level": "junior"}
  ],
  "default_hourly_rates": {
    "chef": 250,
    "line_cook": 150,
    "bartender": 180,
    "waiter": 120
  },
  "overtime_rules": {
    "enabled": true,
    "threshold_hours": 40,
    "multiplier": 1.5,
    "calculation_period": "weekly"
  },
  "attendance_policy": {
    "max_late_arrivals_per_month": 3,
    "max_unexcused_absences_per_month": 2,
    "disciplinary_action_threshold": 5
  }
}
```

### TypeScript Types

```typescript
export interface Department {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Position {
  id: string;
  name: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  description?: string;
}

export interface OvertimeRules {
  enabled: boolean;
  threshold_hours: number;
  multiplier: number;
  calculation_period: 'daily' | 'weekly' | 'biweekly';
}

export interface AttendancePolicy {
  max_late_arrivals_per_month: number;
  max_unexcused_absences_per_month: number;
  disciplinary_action_threshold: number;
}

export interface StaffPolicy {
  id: string;
  departments: Department[];
  positions: Position[];
  default_hourly_rates: Record<string, number>;
  overtime_rules: OvertimeRules;
  break_duration_policy: number;
  unpaid_break_rules: Record<string, any>;
  performance_review_period: number;
  training_requirements: string[];
  certification_tracking: boolean;
  attendance_policy: AttendancePolicy;
  late_arrival_tolerance: number;
  time_clock_rounding: number;
  is_system: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### UI Structure

```
StaffPoliciesPage
├── PageHeader (title: "Políticas de Personal")
├── Section: Departamentos y Puestos
│   ├── DepartmentsList (grid of cards)
│   └── PositionsList (table)
├── Section: Políticas de Trabajo
│   ├── OvertimeRulesForm
│   ├── BreakPolicyForm
│   └── TimeClockRulesForm
└── Section: Políticas de RR.HH.
    ├── PerformanceReviewForm
    ├── TrainingRequirementsForm
    └── AttendancePolicyForm
```

---

## 📦 Module 2: Inventory Alerts

### Route
`/admin/settings/inventory/alerts`

### Database Table: `inventory_alert_settings`

```sql
CREATE TABLE public.inventory_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Threshold Configuration
  low_stock_threshold INTEGER DEFAULT 10,      -- Units
  critical_stock_threshold INTEGER DEFAULT 5,  -- Units
  abc_analysis_thresholds JSONB DEFAULT '{}', -- A: 80%, B: 15%, C: 5%
  
  -- Alert Settings
  alert_recipients JSONB DEFAULT '[]',        -- Array of user IDs/emails
  alert_frequency VARCHAR(50) DEFAULT 'immediate', -- immediate, hourly, daily
  alert_channels JSONB DEFAULT '{}',          -- {email: true, sms: false, push: true, in_app: true}
  
  -- Auto-Reorder Settings
  auto_reorder_enabled BOOLEAN DEFAULT false,
  reorder_quantity_rules JSONB DEFAULT '{}', -- {method: 'fixed', value: 20}
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Default Values

```json
{
  "low_stock_threshold": 10,
  "critical_stock_threshold": 5,
  "abc_analysis_thresholds": {
    "a_threshold": 80,
    "b_threshold": 15,
    "c_threshold": 5
  },
  "alert_recipients": [],
  "alert_frequency": "immediate",
  "alert_channels": {
    "email": true,
    "sms": false,
    "push": true,
    "in_app": true
  },
  "auto_reorder_enabled": false,
  "reorder_quantity_rules": {
    "method": "economic_order_quantity",
    "min_order": 10,
    "max_order": 100,
    "safety_stock_days": 7
  }
}
```

### TypeScript Types

```typescript
export interface ABCAnalysisThresholds {
  a_threshold: number; // Percentage for A items
  b_threshold: number; // Percentage for B items
  c_threshold: number; // Percentage for C items
}

export interface AlertChannels {
  email: boolean;
  sms: boolean;
  push: boolean;
  in_app: boolean;
}

export interface ReorderQuantityRules {
  method: 'fixed' | 'economic_order_quantity' | 'days_of_supply';
  min_order?: number;
  max_order?: number;
  safety_stock_days?: number;
  fixed_quantity?: number;
}

export interface InventoryAlertSettings {
  id: string;
  low_stock_threshold: number;
  critical_stock_threshold: number;
  abc_analysis_thresholds: ABCAnalysisThresholds;
  alert_recipients: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  alert_channels: AlertChannels;
  auto_reorder_enabled: boolean;
  reorder_quantity_rules: ReorderQuantityRules;
  is_system: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

---

## 📦 Module 3: Fulfillment Policies

### Routes (3 sub-pages)
- `/admin/settings/fulfillment/onsite` (4 settings)
- `/admin/settings/fulfillment/delivery` (5 settings)
- `/admin/settings/fulfillment/pickup` (3 settings)

### Database Table: `fulfillment_policies`

```sql
CREATE TABLE public.fulfillment_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Policy Type
  fulfillment_type VARCHAR(50) NOT NULL, -- 'onsite', 'delivery', 'pickup'
  
  -- Onsite Policies
  default_table_assignment_rules JSONB DEFAULT '{}',
  party_size_limits JSONB DEFAULT '{}',
  seating_duration_limits JSONB DEFAULT '{}',
  waitlist_policy JSONB DEFAULT '{}',
  
  -- Delivery Policies
  minimum_order_value DECIMAL(10,2) DEFAULT 0,
  max_delivery_distance INTEGER DEFAULT 10, -- Kilometers
  delivery_fee_rules JSONB DEFAULT '[]',   -- Array of zone rules
  estimated_time_calculation JSONB DEFAULT '{}',
  driver_assignment_rules JSONB DEFAULT '{}',
  
  -- Pickup Policies
  pickup_lead_time INTEGER DEFAULT 30,     -- Minutes
  pickup_locations JSONB DEFAULT '[]',     -- Array of location objects
  ready_notification_settings JSONB DEFAULT '{}',
  
  -- Metadata
  is_enabled BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_fulfillment_type UNIQUE(fulfillment_type)
);
```

### TypeScript Types

```typescript
export type FulfillmentType = 'onsite' | 'delivery' | 'pickup';

export interface PartySizeLimits {
  min_party_size: number;
  max_party_size: number;
  require_reservation_above: number;
}

export interface DeliveryFeeRule {
  zone_id: string;
  zone_name: string;
  base_fee: number;
  fee_per_km?: number;
  min_distance?: number;
  max_distance?: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
}

export interface FulfillmentPolicy {
  id: string;
  fulfillment_type: FulfillmentType;
  
  // Onsite
  default_table_assignment_rules?: Record<string, any>;
  party_size_limits?: PartySizeLimits;
  seating_duration_limits?: Record<string, any>;
  waitlist_policy?: Record<string, any>;
  
  // Delivery
  minimum_order_value?: number;
  max_delivery_distance?: number;
  delivery_fee_rules?: DeliveryFeeRule[];
  estimated_time_calculation?: Record<string, any>;
  driver_assignment_rules?: Record<string, any>;
  
  // Pickup
  pickup_lead_time?: number;
  pickup_locations?: PickupLocation[];
  ready_notification_settings?: Record<string, any>;
  
  is_enabled: boolean;
  is_system: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

---

## 📦 Module 4: Product Catalog Settings

### Route
`/admin/settings/products/catalog`

### Database Table: `product_catalog_settings`

```sql
CREATE TABLE public.product_catalog_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Categories & Types
  product_categories JSONB DEFAULT '[]',   -- Array of category objects
  menu_categories JSONB DEFAULT '[]',      -- Array of menu category objects
  
  -- Pricing Configuration
  pricing_strategy VARCHAR(50) DEFAULT 'markup', -- 'markup', 'competitive', 'value_based'
  default_markup_percentage DECIMAL(5,2) DEFAULT 200.00,
  
  -- Costing Configuration
  recipe_costing_method VARCHAR(50) DEFAULT 'average', -- 'average', 'fifo', 'lifo', 'standard'
  
  -- Availability Rules
  availability_rules JSONB DEFAULT '{}',   -- Time-based, stock-based rules
  
  -- Modifiers & Options
  modifiers_configuration JSONB DEFAULT '[]',
  portion_sizes JSONB DEFAULT '[]',
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Default Values

```json
{
  "product_categories": [
    {"id": "entradas", "name": "Entradas", "sort_order": 1},
    {"id": "platos_fuertes", "name": "Platos Fuertes", "sort_order": 2},
    {"id": "postres", "name": "Postres", "sort_order": 3},
    {"id": "bebidas", "name": "Bebidas", "sort_order": 4}
  ],
  "menu_categories": [
    {"id": "desayunos", "name": "Desayunos", "available_from": "06:00", "available_to": "11:00"},
    {"id": "comidas", "name": "Comidas", "available_from": "11:00", "available_to": "17:00"},
    {"id": "cenas", "name": "Cenas", "available_from": "17:00", "available_to": "23:00"}
  ],
  "pricing_strategy": "markup",
  "default_markup_percentage": 200.00,
  "recipe_costing_method": "average",
  "availability_rules": {
    "check_stock": true,
    "allow_backorders": false,
    "auto_disable_on_zero_stock": true
  },
  "modifiers_configuration": [
    {
      "id": "size",
      "name": "Tamaño",
      "type": "single_choice",
      "options": [
        {"id": "small", "name": "Pequeño", "price_adjustment": -10},
        {"id": "medium", "name": "Mediano", "price_adjustment": 0},
        {"id": "large", "name": "Grande", "price_adjustment": 15}
      ]
    }
  ],
  "portion_sizes": [
    {"id": "individual", "name": "Individual", "servings": 1},
    {"id": "para_dos", "name": "Para 2", "servings": 2},
    {"id": "familiar", "name": "Familiar", "servings": 4}
  ]
}
```

### TypeScript Types

```typescript
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  available_from?: string; // Time "HH:mm"
  available_to?: string;   // Time "HH:mm"
  available_days?: number[]; // [0-6] Sunday=0
  sort_order?: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price_adjustment: number;
  is_default?: boolean;
}

export interface ModifierConfiguration {
  id: string;
  name: string;
  type: 'single_choice' | 'multiple_choice';
  required?: boolean;
  options: ModifierOption[];
}

export interface PortionSize {
  id: string;
  name: string;
  servings: number;
  price_multiplier?: number;
}

export interface AvailabilityRules {
  check_stock: boolean;
  allow_backorders: boolean;
  auto_disable_on_zero_stock: boolean;
  minimum_notice_minutes?: number;
}

export interface ProductCatalogSettings {
  id: string;
  product_categories: ProductCategory[];
  menu_categories: MenuCategory[];
  pricing_strategy: 'markup' | 'competitive' | 'value_based';
  default_markup_percentage: number;
  recipe_costing_method: 'average' | 'fifo' | 'lifo' | 'standard';
  availability_rules: AvailabilityRules;
  modifiers_configuration: ModifierConfiguration[];
  portion_sizes: PortionSize[];
  is_system: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🔄 Implementation Workflow (per Module)

### Step 1: Database Migration (Day 1)
1. Create SQL migration file in `database/migrations/`
2. Define table schema with proper constraints
3. Add RLS policies for security
4. Insert default values
5. Apply migration via Supabase MCP

### Step 2: API Service Layer (Day 1-2)
1. Create `src/services/[module]Api.ts`
2. Implement CRUD functions:
   - `fetch[Module]Settings()`
   - `update[Module]Settings(id, data)`
   - `create[Module]Settings(data)` (if multiple records)
   - `delete[Module]Settings(id)` (if applicable)
3. Add error handling with logger
4. Export TypeScript types

### Step 3: TanStack Query Hooks (Day 2-3)
1. Create `src/hooks/use[Module].ts`
2. Implement query keys factory
3. Implement query hooks with proper staleTime
4. Implement mutation hooks with optimistic updates
5. Add cache invalidation strategies
6. Export all hooks

### Step 4: UI Components (Day 3-5)
1. Create main page: `src/pages/admin/core/settings/pages/[module]/page.tsx`
2. Create form modals: `components/[Module]FormModal.tsx`
3. Implement sections with proper layout
4. Add loading/error states
5. Integrate hooks
6. Add stats/metrics badges

### Step 5: Settings Manifest Registration (Day 5)
1. Update `src/modules/settings/manifest.tsx`
2. Add specialized card with proper priority
3. Register route in navigation

### Step 6: Automated Tests (Day 6-7)
1. Create test file: `src/hooks/__tests__/use[Module].test.tsx`
2. Write comprehensive test suite:
   - Query tests (fetch, caching, errors)
   - Mutation tests (create, update, delete)
   - Optimistic updates validation
   - Cache invalidation verification
3. Run tests: `pnpm test use[Module].test.tsx`
4. Achieve 100% pass rate

### Step 7: Integration & QA (Day 7)
1. Manual browser testing
2. Cross-module integration checks
3. Performance validation
4. Documentation updates

---

## ✅ Success Criteria

### Per Module
- [ ] Database table created with proper RLS
- [ ] Default values inserted
- [ ] API service layer complete
- [ ] TanStack Query hooks complete
- [ ] UI page functional
- [ ] Settings card registered
- [ ] Tests passing at 100%
- [ ] Manual QA passed

### Phase 2 Complete
- [ ] All 4 modules implemented
- [ ] 40 operational settings available
- [ ] All tests passing (160+ tests expected)
- [ ] Documentation updated
- [ ] Settings hub shows all 4 cards
- [ ] Ready for Phase 3

---

## 📈 Progress Tracking

### Module Status

| Module | DB | API | Hooks | UI | Tests | Status |
|--------|----|----|-------|----|----|--------|
| Staff Policies | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| Inventory Alerts | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| Fulfillment Policies | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| Product Catalog | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |

### Overall Progress
**0%** (0/4 modules complete)

---

## 🎯 Recommended Implementation Order

1. **Start with Inventory Alerts** (simplest, similar to Notifications)
2. **Then Product Catalog** (medium complexity)
3. **Then Staff Policies** (higher complexity with nested structures)
4. **Finally Fulfillment Policies** (3 sub-pages, most complex)

---

## 📚 Reference Documents

- ✅ SETTINGS_ARCHITECTURE_MATRIX.md (specifications)
- ✅ Phase 1 implementation (Notifications + Enums) - proven patterns
- ✅ Test suites from Phase 1 (46 tests, 100% passing)
- ✅ Copilot instructions (.github/copilot-instructions.md)

---

## 🚀 Next Action

Ready to begin implementation! Recommended first step:

**Start with Module 2: Inventory Alerts**
- Simplest structure (8 settings, single table)
- Similar pattern to completed Notification Settings
- Good warm-up for more complex modules
- Expected completion: 1 week

Would you like to proceed with Inventory Alerts implementation?
