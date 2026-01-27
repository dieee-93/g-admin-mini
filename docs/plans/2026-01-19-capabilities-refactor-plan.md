# Capabilities Architecture Refactor - Implementation Plan

**Fecha:** 2026-01-19
**Estado:** Ready for Implementation
**Versión:** 1.0.0
**Documento Relacionado:** `2026-01-19-capabilities-architecture-simplification.md`

---

## 🎯 Objetivo

Implementar la arquitectura simplificada paso a paso, eliminando over-engineering y aplicando patrones validados de la industria.

**Estimación:** ~4-6 horas de trabajo
**Riesgo:** Bajo (cambios son simplificaciones, no refactors complejos)

---

## 📋 Checklist General

- [ ] **Fase 1:** Actualizar types y crear estructuras base (30 min)
- [ ] **Fase 2:** Simplificar featureActivationService (30 min)
- [ ] **Fase 3:** Actualizar bootstrap logic (45 min)
- [ ] **Fase 4:** Actualizar manifests CORE (30 min)
- [ ] **Fase 5:** Actualizar manifests OPTIONAL (1h 30min)
- [ ] **Fase 6:** Eliminar código deprecated (30 min)
- [ ] **Fase 7:** Testing y validación (1h)

---

## 🔨 Fase 1: Actualizar Types y Crear Estructuras Base

### 1.1 Actualizar ModuleManifest Type

**Archivo:** `src/lib/modules/types.ts`

```typescript
// ❌ ELIMINAR propiedades
export interface ModuleManifest {
  id: string;
  name: string;
  version: string;

  // ❌ ELIMINAR estas propiedades:
  // autoInstall?: boolean;        // ← ELIMINAR
  // enhancedBy?: FeatureId[];     // ← ELIMINAR

  // ✅ MANTENER estas propiedades:
  depends: ModuleId[];
  activatedBy?: FeatureId;  // Solo para OPTIONAL modules
  minimumRole?: UserRole;
  permissionModule?: ModuleName;
  hooks?: {
    provide?: string[];
    consume?: string[];
  };
  setup?: (registry: ModuleRegistry) => Promise<void>;
  routes?: ModuleRoute[];
  exports?: Record<string, any>;
}
```

**Cambios:**
- ❌ Eliminar `autoInstall?: boolean`
- ❌ Eliminar `enhancedBy?: FeatureId[]`
- ✅ Mantener `activatedBy?: FeatureId` (solo para OPTIONAL modules)

---

### 1.2 Crear CORE_MODULES Array

**Archivo:** `src/lib/modules/constants.ts` (NUEVO)

```typescript
/**
 * CORE_MODULES
 *
 * Módulos que SIEMPRE están cargados (base del sistema).
 * NO necesitan activatedBy - se cargan automáticamente.
 *
 * @version 1.0.0
 */
export const CORE_MODULES: readonly ModuleId[] = [
  // UI Framework
  'dashboard',
  'settings',
  'debug',

  // Business Core
  'customers',  // Todo negocio tiene clientes
  'sales',      // Todo negocio vende

  // UI Enhancement
  'gamification', // Achievements layer
] as const;

export type CoreModuleId = typeof CORE_MODULES[number];
```

**Testing:**
```typescript
// Verificar que compila
import { CORE_MODULES } from '@/lib/modules/constants';
console.log(CORE_MODULES); // ['dashboard', 'settings', 'debug', 'customers', 'sales', 'gamification']
```

---

### 1.3 Crear OPTIONAL_MODULES Mapping

**Archivo:** `src/lib/modules/constants.ts`

```typescript
/**
 * OPTIONAL_MODULES
 *
 * Mapeo de módulo → feature requerida.
 * Se cargan SOLO si su feature está activa.
 *
 * @version 1.0.0
 */
export const OPTIONAL_MODULES: Readonly<Record<ModuleId, FeatureId>> = {
  // Inventory & Supply Chain
  'materials': 'inventory_stock_tracking',
  'products': 'products_recipe_management',
  'suppliers': 'inventory_supplier_management',

  // Production
  'production': 'production_display_system',
  'production-kitchen': 'production_display_system',

  // Fulfillment
  'fulfillment': 'operations_table_management',
  'fulfillment-onsite': 'operations_table_management',
  'fulfillment-delivery': 'operations_delivery_zones',
  'fulfillment-pickup': 'operations_pickup_scheduling',

  // Staff & Scheduling
  'staff': 'staff_employee_management',
  'scheduling': 'scheduling_appointment_booking',
  'shift-control': 'staff_shift_management',

  // Finance
  'finance-billing': 'finance_recurring_invoicing',
  'finance-fiscal': 'finance_tax_compliance',
  'finance-integrations': 'finance_payment_gateway',
  'finance-corporate': 'finance_corporate_accounts',
  'cash': 'finance_cash_flow_management',
  'cash-management': 'finance_cash_session_management',

  // Advanced Business
  'memberships': 'operations_membership_management',
  'rentals': 'operations_rental_management',
  'assets': 'operations_asset_management',

  // Analytics & Intelligence
  'intelligence': 'analytics_intelligence_dashboard',
  'reporting': 'analytics_custom_reports',
  'executive': 'analytics_executive_dashboard',
  'products-analytics': 'analytics_product_insights',

  // Other
  'achievements': 'gamification_achievements',
  'mobile': 'mobile_app_access',
} as const;
```

---

### 1.4 Crear CAPABILITY_FEATURES Mapping

**Archivo:** `src/config/CapabilityFeaturesMapping.ts` (NUEVO)

```typescript
import type { BusinessCapabilityId, FeatureId } from './types';

/**
 * CAPABILITY_FEATURES
 *
 * Mapeo declarativo: Capability → Features activadas
 * Simple flat map - sin lógica condicional compleja.
 *
 * @version 1.0.0
 */
export const CAPABILITY_FEATURES: Readonly<Record<BusinessCapabilityId, readonly FeatureId[]>> = {
  // ============================================
  // CORE BUSINESS MODELS
  // ============================================

  'physical_products': [
    // Production
    'production_bom_management',
    'production_display_system',
    'production_order_queue',
    'production_capacity_planning',

    // Inventory
    'inventory_stock_tracking',
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
    'inventory_low_stock_auto_reorder',
    'inventory_sku_management',
    'inventory_barcode_scanning',
    'inventory_multi_unit_tracking',

    // Products
    'products_recipe_management',
    'products_catalog_menu',
    'products_cost_intelligence',
    'products_availability_calculation',

    // Sales
    'sales_order_management',
    'sales_payment_processing'
  ],

  'professional_services': [
    // Scheduling
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
    'scheduling_reminder_system',
    'scheduling_availability_rules',

    // Production (service "recipes")
    'production_bom_management',
    'production_order_queue',

    // Customer
    'customer_service_history',
    'customer_preference_tracking',

    // Sales
    'sales_order_management',
    'sales_payment_processing',
    'sales_package_management',

    // Products
    'products_package_management',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking',
    'staff_labor_cost_tracking'
  ],

  // ============================================
  // FULFILLMENT METHODS
  // ============================================

  'onsite_service': [
    // Sales
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pos_onsite',
    'sales_dine_in_orders',
    'sales_split_payment',
    'sales_tip_management',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',

    // Operations
    'operations_table_management',
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    'operations_bill_splitting',

    // Inventory
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  'pickup_orders': [
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pickup_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',

    'operations_pickup_scheduling',
    'operations_notification_system',
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking'
  ],

  'delivery_shipping': [
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_delivery_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',

    'operations_delivery_zones',
    'operations_delivery_tracking',
    'operations_notification_system',
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  // ============================================
  // SPECIAL OPERATIONS
  // ============================================

  'async_operations': [
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',
    'sales_checkout_process',
    'sales_coupon_management',

    // Products
    'products_catalog_ecommerce',
    'products_availability_calculation',

    'analytics_ecommerce_metrics',
    'analytics_conversion_tracking',
    'operations_deferred_fulfillment',
    'inventory_available_to_promise',
    'customer_online_accounts'
  ],

  'corporate_sales': [
    'finance_corporate_accounts',
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms',
    'sales_contract_management',
    'sales_tiered_pricing',
    'sales_approval_workflows',
    'sales_quote_to_order',
    'sales_bulk_pricing',
    'sales_quote_generation',

    // Products
    'products_catalog_ecommerce',
    'products_cost_intelligence',

    'inventory_available_to_promise',
    'inventory_demand_forecasting',
    'operations_vendor_performance',

    // Staff
    'staff_employee_management'
  ],

  'membership_programs': [
    'operations_membership_management',
    'customer_loyalty_program',
    'customer_preference_tracking',
    'finance_recurring_invoicing',
    'analytics_member_retention',
    'sales_membership_tiers'
  ],

  'rental_operations': [
    'operations_rental_management',
    'operations_asset_tracking',
    'operations_availability_calendar',
    'scheduling_appointment_booking',
    'inventory_stock_tracking',
    'sales_order_management',
    'sales_payment_processing'
  ],

  'event_management': [
    'operations_event_registration',
    'operations_capacity_management',
    'scheduling_appointment_booking',
    'sales_package_management',
    'sales_ticket_management',
    'staff_employee_management',
    'staff_shift_management'
  ],

  'subscription_service': [
    'finance_recurring_invoicing',
    'finance_payment_terms',
    'customer_online_accounts',
    'analytics_churn_prediction',
    'operations_deferred_fulfillment',
    'sales_subscription_management'
  ]
} as const;
```

---

## 🔨 Fase 2: Simplificar featureActivationService

### 2.1 Reescribir featureActivationService.ts

**Archivo:** `src/lib/capabilities/featureActivationService.ts`

**Antes (968 líneas):**
```typescript
// ❌ Complejo - auto-inyección de CORE_FEATURES, lógica condicional
export function activateFeatures(capabilities, infrastructure) {
  const { activeFeatures: conditionalFeatures } = FeatureActivationEngine.activateFeatures(...);

  const activeFeatures = Array.from(new Set([
    ...CORE_FEATURES,  // ← Auto-inyección hardcoded
    ...conditionalFeatures
  ]));

  return { activeFeatures };
}
```

**Después (~30 líneas):**
```typescript
/**
 * Feature Activation Service - SIMPLIFIED VERSION
 *
 * Mapeo simple: user capabilities → active features
 * NO auto-inyección de CORE_FEATURES (CORE modules no usan features)
 *
 * @version 2.0.0 - Simplified
 */
import { CAPABILITY_FEATURES } from '@/config/CapabilityFeaturesMapping';
import type { BusinessCapabilityId, FeatureId } from '@/config/types';
import { logger } from '@/lib/logging';

/**
 * Activa features basándose en capabilities seleccionadas
 *
 * @param userCapabilities - Capabilities que el usuario seleccionó en setup
 * @returns Array de features activas (deduplicadas)
 */
export function activateFeatures(
  userCapabilities: BusinessCapabilityId[]
): FeatureId[] {

  logger.info('FeatureActivation', 'Activating features from capabilities', {
    capabilities: userCapabilities
  });

  // Mapeo simple: capability → features[]
  const activeFeatures = userCapabilities.flatMap(
    capability => CAPABILITY_FEATURES[capability] || []
  );

  // Deduplicar (Set elimina repetidos)
  const uniqueFeatures = Array.from(new Set(activeFeatures));

  logger.info('FeatureActivation', `Activated ${uniqueFeatures.length} features`, {
    total: uniqueFeatures.length,
    features: uniqueFeatures
  });

  return uniqueFeatures;
}

/**
 * Alias para compatibilidad (si se usa en otros lados)
 * @deprecated Use activateFeatures() directly
 */
export const FeatureActivationEngine = {
  activateFeatures: (capabilities: BusinessCapabilityId[]) => {
    return {
      activeFeatures: activateFeatures(capabilities)
    };
  }
};
```

**Testing:**
```typescript
// Test 1: Single capability
const features1 = activateFeatures(['physical_products']);
console.log(features1); // ['production_bom_management', 'inventory_stock_tracking', ...]

// Test 2: Multiple capabilities con overlap
const features2 = activateFeatures(['physical_products', 'onsite_service']);
// Debe deduplicar 'inventory_stock_tracking' (aparece en ambos)

// Test 3: Empty capabilities
const features3 = activateFeatures([]);
console.log(features3); // []
```

---

### 2.2 Eliminar CORE_FEATURES de FeatureRegistry

**Archivo:** `src/config/FeatureRegistry.ts`

```typescript
// ❌ ELIMINAR completamente
export const CORE_FEATURES: readonly FeatureId[] = [
  'dashboard',
  'settings',
  'debug',
  'gamification',
  'customers',
  'sales_order_management'
] as const;
```

**Razón:** CORE modules no usan features system - se cargan por estar en `CORE_MODULES` array.

---

## 🔨 Fase 3: Actualizar Bootstrap Logic

### 3.1 Simplificar bootstrap.ts

**Archivo:** `src/lib/modules/bootstrap.ts`

**Cambios en `loadModules()` function:**

```typescript
// ❌ ANTES (complejo - múltiples condiciones)
function loadModules(activeFeatures: FeatureId[]) {
  return allModules.filter(module => {
    // Check autoInstall
    if (module.autoInstall === true) return true;

    // Check required
    if (module.required === true) return true;

    // Check activatedBy
    if (module.activatedBy && activeFeatures.includes(module.activatedBy)) {
      return true;
    }

    // Check depends + autoLoad (glue pattern)
    if (module.autoLoad && module.depends.every(...)) {
      return true;
    }

    return false;
  });
}

// ✅ DESPUÉS (simple - 2 categorías claras)
import { CORE_MODULES, OPTIONAL_MODULES } from './constants';

function loadModules(activeFeatures: FeatureId[]): ModuleId[] {
  const modulesToLoad = new Set<ModuleId>();

  // 1. CORE modules - SIEMPRE cargados
  CORE_MODULES.forEach(id => modulesToLoad.add(id));

  logger.info('Bootstrap', `Loaded ${CORE_MODULES.length} CORE modules`, {
    modules: Array.from(CORE_MODULES)
  });

  // 2. OPTIONAL modules - SI feature activa
  let optionalCount = 0;
  Object.entries(OPTIONAL_MODULES).forEach(([moduleId, requiredFeature]) => {
    if (activeFeatures.includes(requiredFeature)) {
      modulesToLoad.add(moduleId);
      optionalCount++;
    }
  });

  logger.info('Bootstrap', `Loaded ${optionalCount} OPTIONAL modules`, {
    total: optionalCount,
    activeFeatures: activeFeatures.length
  });

  return Array.from(modulesToLoad);
}
```

**Testing:**
```typescript
// Test 1: Solo CORE modules (sin features)
const modules1 = loadModules([]);
console.log(modules1); // ['dashboard', 'settings', 'debug', 'customers', 'sales', 'gamification']

// Test 2: CORE + algunos OPTIONAL
const modules2 = loadModules(['inventory_stock_tracking', 'operations_table_management']);
// ['dashboard', 'settings', 'debug', 'customers', 'sales', 'gamification', 'materials', 'fulfillment']

// Test 3: Todas las features activas
const modules3 = loadModules(Object.values(CAPABILITY_FEATURES).flat());
// Debe cargar CORE + todos los OPTIONAL (35 módulos)
```

---

## 🔨 Fase 4: Actualizar Manifests CORE

### 4.1 Módulos a Actualizar

- `src/modules/dashboard/manifest.tsx`
- `src/modules/settings/manifest.tsx`
- `src/modules/debug/manifest.tsx`
- `src/modules/customers/manifest.tsx`
- `src/modules/sales/manifest.tsx`
- `src/modules/gamification/manifest.tsx`

### 4.2 Cambios en cada manifest

```typescript
// ❌ ANTES (dashboard/manifest.tsx)
export const dashboardManifest: ModuleManifest = {
  id: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',

  depends: [],
  activatedBy: 'dashboard',  // ← ELIMINAR (circular)
  autoInstall: true,         // ← ELIMINAR
  enhancedBy: ['dashboard'], // ← ELIMINAR

  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: ['dashboard.widgets'],
    consume: []
  },

  setup: async (registry) => {
    // ... setup logic (NO CAMBIAR)
  }
};

// ✅ DESPUÉS (limpio)
export const dashboardManifest: ModuleManifest = {
  id: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',

  depends: [],
  // ❌ NO activatedBy (es CORE)
  // ❌ NO autoInstall
  // ❌ NO enhancedBy

  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: ['dashboard.widgets'],
    consume: []
  },

  setup: async (registry) => {
    // ... setup logic (NO CAMBIAR)
  }
};
```

**Aplicar el mismo patrón a los otros 5 módulos CORE.**

---

## 🔨 Fase 5: Actualizar Manifests OPTIONAL

### 5.1 Módulos a Actualizar (29 total)

Ver lista completa en `2026-01-19-capabilities-architecture-simplification.md` sección "OPTIONAL Modules".

### 5.2 Cambios en cada manifest

```typescript
// ❌ ANTES (materials/manifest.tsx)
export const materialsManifest: ModuleManifest = {
  id: 'materials',
  name: 'Materials & Inventory',
  version: '1.0.0',

  depends: [],
  autoInstall: false,                    // ← ELIMINAR
  activatedBy: 'inventory_stock_tracking', // ✅ MANTENER

  enhancedBy: [                          // ← ELIMINAR
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
  ],

  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: ['dashboard.widgets', 'shift-control.indicators'],
    consume: ['sales.order_placed', 'sales.completed']
  },

  setup: async (registry) => {
    // Registrar widgets
    const { InventoryWidget } = await import('./widgets');
    registry.addAction('dashboard.widgets', () => <InventoryWidget />);

    // ✅ Feature flags se manejan DENTRO del component
    const { StockAlertIndicator } = await import('./widgets');
    registry.addAction('shift-control.indicators', () => <StockAlertIndicator />);

    // ... event subscriptions
  }
};

// ✅ DESPUÉS (limpio)
export const materialsManifest: ModuleManifest = {
  id: 'materials',
  name: 'Materials & Inventory',
  version: '1.0.0',

  depends: [],
  activatedBy: 'inventory_stock_tracking', // ✅ Solo esto

  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: ['dashboard.widgets', 'shift-control.indicators'],
    consume: ['sales.order_placed', 'sales.completed']
  },

  setup: async (registry) => {
    // ✅ setup() NO CAMBIA - sigue registrando hooks igual
    const { InventoryWidget } = await import('./widgets');
    registry.addAction('dashboard.widgets', () => <InventoryWidget />);

    const { StockAlertIndicator } = await import('./widgets');
    registry.addAction('shift-control.indicators', () => <StockAlertIndicator />);

    // ... event subscriptions (NO CAMBIAR)
  }
};
```

**Aplicar el mismo patrón a los 29 módulos OPTIONAL restantes.**

### 5.3 Script para Actualizar en Batch

```bash
# Script auxiliar para eliminar autoInstall y enhancedBy
# Ejecutar desde raíz del proyecto

find src/modules -name "manifest.tsx" -type f -exec sed -i '/autoInstall:/d' {} \;
find src/modules -name "manifest.tsx" -type f -exec sed -i '/enhancedBy:/,/\]/d' {} \;

# Revisar cambios manualmente después
git diff src/modules/*/manifest.tsx
```

---

## 🔨 Fase 6: Eliminar Código Deprecated

### 6.1 Eliminar FeatureActivationEngine (si ya no se usa)

**Buscar usos:**
```bash
grep -r "FeatureActivationEngine" src/
```

Si solo se usa en `featureActivationService.ts`, ya está cubierto.

---

### 6.2 Eliminar category 'always_active' de Features

**Archivo:** `src/config/FeatureRegistry.ts`

```typescript
// ❌ ELIMINAR features con category: 'always_active'
// Estos no son features, son módulos CORE

// Revisar y eliminar:
'dashboard': {
  id: 'dashboard',
  category: 'always_active',  // ← ELIMINAR feature completa
  domain: 'CORE'
}

'settings': {
  id: 'settings',
  category: 'always_active',  // ← ELIMINAR feature completa
  domain: 'CORE'
}

// etc.
```

---

## 🔨 Fase 7: Testing y Validación

### 7.1 Compilación TypeScript

```bash
tsc --noEmit
```

Debe compilar sin errores.

---

### 7.2 Testing Funcional

**Test 1: Setup Wizard**
1. Ir a `/setup`
2. Seleccionar capabilities: `physical_products` + `onsite_service`
3. Completar wizard
4. Verificar que se activan las features correctas:

```typescript
// En DevTools console
const { useCapabilityStore } = await import('@/store/capabilityStore');
const activeFeatures = useCapabilityStore.getState().activeFeatures;
console.log(activeFeatures);

// Debe incluir:
// - inventory_stock_tracking (de physical_products)
// - operations_table_management (de onsite_service)
// - sales_order_management (de ambos - deduplicado)
```

**Test 2: Module Loading**
```typescript
// En DevTools console
const { ModuleRegistry } = await import('@/lib/modules/ModuleRegistry');
const registry = ModuleRegistry.getInstance();
const loadedModules = Array.from(registry['modules'].keys());
console.log(loadedModules);

// Debe incluir:
// CORE: ['dashboard', 'settings', 'debug', 'customers', 'sales', 'gamification']
// OPTIONAL: ['materials', 'products', 'fulfillment', 'fulfillment-onsite', 'staff', ...]
```

**Test 3: HookPoints Rendering**
1. Ir a `/admin/dashboard`
2. Verificar que aparecen widgets de módulos activos
3. Ir a `/admin/resources/staff`
4. Verificar que UI se adapta según features activas

**Test 4: Feature Flags en UI**
1. Ir a `/admin/crm/customers`
2. Abrir form de customer
3. Verificar que campos condicionales aparecen según features:
   - Si `operations_delivery_zones` activa → Campos de dirección de envío
   - Si `customer_loyalty_program` activa → Campos de loyalty points

---

### 7.3 Testing de Regresión

**Casos de prueba:**

| Scenario | Capabilities | Expected Modules | Expected Features |
|----------|--------------|------------------|-------------------|
| Kioskero simple | `physical_products`, `pickup_orders` | CORE + materials, products, fulfillment-pickup | inventory_stock_tracking, sales_pickup_orders |
| Restaurant completo | `physical_products`, `onsite_service`, `delivery_shipping` | CORE + materials, products, production, kitchen, fulfillment-* | All production, inventory, operations |
| Servicios profesionales | `professional_services` | CORE + scheduling, staff, shift-control | scheduling_*, staff_*, customer_service_history |
| Solo ventas online | `async_operations` | CORE solamente | sales_catalog_ecommerce, customer_online_accounts |

---

### 7.4 Performance Validation

**Antes:**
- Bundle size: ?
- Module load time: ?
- Memory usage: ?

**Después:**
- Bundle size: (should be similar or smaller)
- Module load time: (should be faster - less conditional logic)
- Memory usage: (should be similar)

```bash
# Build production bundle
npm run build

# Analyze bundle
npx vite-bundle-visualizer
```

---

## ✅ Checklist Final

- [ ] `tsc --noEmit` pasa sin errores
- [ ] Setup wizard funciona correctamente
- [ ] Módulos CORE se cargan siempre
- [ ] Módulos OPTIONAL se cargan según features
- [ ] HookPoints renderizan componentes correctamente
- [ ] Feature flags en UI funcionan
- [ ] Tests de regresión pasan
- [ ] Performance es igual o mejor
- [ ] Documentación actualizada
- [ ] Git commit con mensaje descriptivo

---

## 📝 Commit Message Template

```
refactor(capabilities): simplify architecture - remove over-engineering

BREAKING CHANGE: Removed autoInstall and enhancedBy from ModuleManifest

Changes:
- Eliminate autoInstall property (replaced with CORE_MODULES array)
- Eliminate enhancedBy property (replaced with feature flags in components)
- Simplify featureActivationService (968 → 30 lines)
- Create CAPABILITY_FEATURES declarative mapping
- Update 35 module manifests to use simplified structure
- Remove CORE_FEATURES hardcoded array
- Improve bootstrap logic clarity

Benefits:
- Simpler codebase (less over-engineering)
- Clearer separation: CORE vs OPTIONAL modules
- Easier to understand and maintain
- Based on industry-validated patterns

Refs: docs/plans/2026-01-19-capabilities-architecture-simplification.md
```

---

## 🚀 Rollout Strategy

### Opción A: Big Bang (Recomendado)

**Razón:** Cambios son simplificaciones (no features nuevas) - bajo riesgo

1. Hacer todos los cambios en una sesión (4-6h)
2. Testing completo
3. Single commit
4. Deploy

---

### Opción B: Incremental (Si hay miedo)

**Fase 1:** Crear nuevas estructuras (CORE_MODULES, OPTIONAL_MODULES, CAPABILITY_FEATURES)
- Commit: "feat(capabilities): add simplified data structures"

**Fase 2:** Actualizar bootstrap logic para usar nuevas estructuras
- Commit: "refactor(bootstrap): use CORE_MODULES and OPTIONAL_MODULES"

**Fase 3:** Actualizar manifests (batch de 10 módulos a la vez)
- Commit 1: "refactor(manifests): simplify CORE modules"
- Commit 2: "refactor(manifests): simplify inventory modules"
- Commit 3: "refactor(manifests): simplify fulfillment modules"
- Commit 4: "refactor(manifests): simplify finance modules"

**Fase 4:** Eliminar código deprecated
- Commit: "refactor(capabilities): remove deprecated code"

---

## 📚 Documentación a Actualizar

- [ ] `README.md` - Actualizar sección de arquitectura
- [ ] `docs/capabilities/DEVELOPER_GUIDE.md` - Actualizar ejemplos
- [ ] `src/modules/README.md` - Actualizar patrones de módulos
- [ ] `CONTRIBUTING.md` - Actualizar guías de nuevos módulos

---

**Fuentes de Investigación:**
- [React Feature Flags Best Practices](https://www.dhiwise.com/post/implementing-react-feature-flags-best-practices)
- [Plugin Architecture Pattern](https://medium.com/omarelgabrys-blog/plug-in-architecture-dec207291800)
- [ArjanCodes - Plugin Best Practices](https://arjancodes.com/blog/best-practices-for-decoupling-software-using-plugins/)
