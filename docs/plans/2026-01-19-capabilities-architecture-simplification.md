# Capabilities Architecture Simplification

**Fecha:** 2026-01-19
**Estado:** Design Validated
**Versión:** 1.0.0

---

## 🎯 Objetivo

Simplificar la arquitectura de capabilities-features-modules eliminando over-engineering (propiedades `autoInstall`, `enhancedBy`, lógica circular) y aplicando patrones validados de la industria.

### Problema Actual

El sistema tiene **5 migraciones** con código over-engineered generado por IA:
- ❌ `autoInstall: true` en 15+ módulos
- ❌ `activatedBy: 'dashboard'` (circular - dashboard activa dashboard)
- ❌ `enhancedBy: [...]` arrays sin uso claro
- ❌ `customers` sin `activatedBy` (edge case)
- ❌ Confusión entre "features" y "module IDs"

### Solución Validada (Investigación)

Basado en:
- **React Feature Flags Best Practices (2024)**: Feature flags simples con `useFeature()`
- **Plugin Architecture Pattern**: Core modules (always loaded) + Optional modules (conditional)
- **Industry Standard**: Separación clara entre BASE system y CONDITIONAL extensions

**Fuentes:**
- [React Feature Flags Best Practices](https://www.dhiwise.com/post/implementing-react-feature-flags-best-practices)
- [Plugin Architecture Pattern](https://medium.com/omarelgabrys-blog/plug-in-architecture-dec207291800)

---

## 📊 Arquitectura Simplificada (2 Niveles)

### Nivel 1: CORE Modules (Always Loaded)

Módulos que SIEMPRE existen (base del sistema):

```typescript
const CORE_MODULES = [
  // UI Framework (infraestructura)
  'dashboard',
  'settings',
  'debug',

  // Business Core (todo negocio los necesita)
  'customers',  // Todo negocio tiene clientes
  'sales',      // Todo negocio vende algo
  'gamification', // Achievements system (UI enhancement)
];
```

**Estos módulos:**
- ✅ NO necesitan `autoInstall: true`
- ✅ NO necesitan `activatedBy: 'feature'`
- ✅ Se cargan por estar en array `CORE_MODULES`
- ✅ Modifican UI internamente con feature flags

---

### Nivel 2: OPTIONAL Modules (Conditional)

Módulos que se activan según capabilities del usuario:

```typescript
const OPTIONAL_MODULES = {
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
};
```

**Estos módulos:**
- ✅ Se activan SI su `requiredFeature` está activa
- ✅ NO usan `autoInstall`
- ✅ Tienen `activatedBy: FeatureId`

---

## 🗺️ Mapeo CAPABILITY → FEATURES

### Estructura Declarativa Simple

```typescript
const CAPABILITY_FEATURES: Record<BusinessCapabilityId, FeatureId[]> = {
  // ============================================
  // CORE BUSINESS MODELS
  // ============================================

  'physical_products': [
    // Production
    'production_bom_management',
    'production_display_system',
    'production_order_queue',

    // Inventory
    'inventory_stock_tracking',
    'inventory_alert_system',
    'inventory_supplier_management',

    // Products
    'products_recipe_management',
    'products_catalog_menu',

    // Sales (necesario para vender)
    'sales_order_management',
    'sales_payment_processing'
  ],

  'professional_services': [
    // Scheduling
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
    'scheduling_reminder_system',

    // Customer
    'customer_service_history',
    'customer_preference_tracking',

    // Sales
    'sales_order_management',
    'sales_payment_processing',
    'sales_package_management',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_performance_tracking'
  ],

  // ============================================
  // FULFILLMENT METHODS
  // ============================================

  'onsite_service': [
    // Sales
    'sales_pos_onsite',
    'sales_dine_in_orders',
    'sales_split_payment',

    // Operations
    'operations_table_management',
    'operations_floor_plan_config',
    'operations_waitlist_management',

    // Inventory
    'inventory_stock_tracking',

    // Staff
    'staff_employee_management',
    'staff_shift_management'
  ],

  'pickup_orders': [
    'sales_pickup_orders',
    'operations_pickup_scheduling',
    'operations_notification_system',
    'inventory_stock_tracking',
    'staff_employee_management'
  ],

  'delivery_shipping': [
    'sales_delivery_orders',
    'operations_delivery_zones',
    'operations_delivery_tracking',
    'operations_notification_system',
    'inventory_stock_tracking',
    'staff_employee_management'
  ],

  // ============================================
  // SPECIAL OPERATIONS
  // ============================================

  'async_operations': [
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_cart_management',
    'analytics_ecommerce_metrics',
    'customer_online_accounts'
  ],

  'corporate_sales': [
    'finance_corporate_accounts',
    'finance_credit_management',
    'sales_contract_management',
    'sales_tiered_pricing',
    'sales_quote_generation',
    'staff_employee_management'
  ],

  'membership_programs': [
    'operations_membership_management',
    'customer_loyalty_program',
    'finance_recurring_invoicing',
    'analytics_member_retention'
  ],

  'rental_operations': [
    'operations_rental_management',
    'operations_asset_tracking',
    'scheduling_appointment_booking',
    'inventory_stock_tracking'
  ],

  'event_management': [
    'operations_event_registration',
    'scheduling_appointment_booking',
    'sales_package_management',
    'staff_employee_management'
  ],

  'subscription_service': [
    'finance_recurring_invoicing',
    'customer_online_accounts',
    'analytics_churn_prediction',
    'operations_deferred_fulfillment'
  ]
};
```

---

## 🔄 Lógica de Activación (Simplificada)

### Código Actual (Complejo - 968 líneas)

```typescript
// ❌ featureActivationService.ts (old)
export function activateFeatures(capabilities, infrastructure) {
  const { activeFeatures: conditionalFeatures } = FeatureActivationEngine.activateFeatures(...);

  // Auto-inyección de CORE_FEATURES
  const activeFeatures = Array.from(new Set([
    ...CORE_FEATURES,  // ← Hardcoded array
    ...conditionalFeatures
  ]));

  return { activeFeatures };
}
```

---

### Código Nuevo (Simple - ~50 líneas)

```typescript
// ✅ featureActivationService.ts (new)
export function activateFeatures(
  userCapabilities: BusinessCapabilityId[]
): FeatureId[] {

  // Mapeo simple: capabilities → features
  const activeFeatures = userCapabilities.flatMap(
    capability => CAPABILITY_FEATURES[capability] || []
  );

  // Deduplicar (Set elimina repetidos)
  return Array.from(new Set(activeFeatures));
}

// Ejemplo:
// Input: ['physical_products', 'onsite_service']
// Output: ['production_bom_management', 'inventory_stock_tracking',
//          'sales_order_management', 'operations_table_management', ...]
```

---

### Bootstrap de Módulos (Simplificado)

```typescript
// ✅ bootstrap.ts (new)
export function loadModules(activeFeatures: FeatureId[]): ModuleId[] {
  const modulesToLoad = new Set<ModuleId>();

  // 1. CORE modules SIEMPRE cargados
  CORE_MODULES.forEach(id => modulesToLoad.add(id));

  // 2. OPTIONAL modules SI feature activa
  Object.entries(OPTIONAL_MODULES).forEach(([moduleId, requiredFeature]) => {
    if (activeFeatures.includes(requiredFeature)) {
      modulesToLoad.add(moduleId);
    }
  });

  return Array.from(modulesToLoad);
}
```

---

## 🎨 UI Condicional con Feature Flags

### Ejemplo: Customer Form (CORE module)

```typescript
// ✅ src/pages/admin/core/crm/customers/components/CustomerForm.tsx
function CustomerForm() {
  const activeFeatures = useActiveFeatures();

  return (
    <form>
      {/* Campos CORE (siempre visibles) */}
      <NameField />
      <EmailField />
      <PhoneField />

      {/* Campos CONDICIONALES (según features) */}
      {activeFeatures.includes('operations_delivery_zones') && (
        <DeliveryAddressSection />
      )}

      {activeFeatures.includes('customer_loyalty_program') && (
        <LoyaltyPointsField />
      )}

      {activeFeatures.includes('finance_corporate_accounts') && (
        <TaxIdField />
      )}
    </form>
  );
}
```

### Ejemplo: Sales Page (CORE module)

```typescript
// ✅ src/pages/admin/operations/sales/page.tsx
function SalesPage() {
  const activeFeatures = useActiveFeatures();

  return (
    <Box>
      {/* POS siempre visible (core sales) */}
      <POSInterface />

      {/* Tabs condicionales según features */}
      <Tabs>
        <TabList>
          <Tab>POS</Tab>

          {activeFeatures.includes('operations_table_management') && (
            <Tab>Mesas</Tab>
          )}

          {activeFeatures.includes('operations_delivery_zones') && (
            <Tab>Delivery</Tab>
          )}

          {activeFeatures.includes('operations_pickup_scheduling') && (
            <Tab>Retiro</Tab>
          )}
        </TabList>
      </Tabs>
    </Box>
  );
}
```

---

## 📋 Clasificación de 35 Módulos

### CORE Modules (6 total)

| Module ID | Razón | Propiedades |
|-----------|-------|-------------|
| `dashboard` | UI framework base | En CORE_MODULES array |
| `settings` | Configuración del sistema | En CORE_MODULES array |
| `debug` | Developer tools | En CORE_MODULES array |
| `customers` | Todo negocio tiene clientes | En CORE_MODULES array |
| `sales` | Todo negocio vende | En CORE_MODULES array |
| `gamification` | Achievements UI layer | En CORE_MODULES array |

**Manifest simplificado:**
```typescript
{
  id: 'dashboard',
  name: 'Dashboard',
  // ❌ NO autoInstall
  // ❌ NO activatedBy
  // ❌ NO enhancedBy
}
```

---

### OPTIONAL Modules (29 total)

| Module ID | Required Feature | Capability que lo activa |
|-----------|------------------|--------------------------|
| `materials` | `inventory_stock_tracking` | `physical_products` |
| `products` | `products_recipe_management` | `physical_products` |
| `suppliers` | `inventory_supplier_management` | `physical_products` |
| `production` | `production_display_system` | `physical_products` |
| `production-kitchen` | `production_display_system` | `physical_products` |
| `fulfillment` | `operations_table_management` | `onsite_service` |
| `fulfillment-onsite` | `operations_table_management` | `onsite_service` |
| `fulfillment-delivery` | `operations_delivery_zones` | `delivery_shipping` |
| `fulfillment-pickup` | `operations_pickup_scheduling` | `pickup_orders` |
| `staff` | `staff_employee_management` | `professional_services`, `onsite_service` |
| `scheduling` | `scheduling_appointment_booking` | `professional_services` |
| `shift-control` | `staff_shift_management` | `professional_services` |
| `finance-billing` | `finance_recurring_invoicing` | `membership_programs` |
| `finance-fiscal` | `finance_tax_compliance` | Auto-activado (jurisdicción) |
| `finance-integrations` | `finance_payment_gateway` | `async_operations` |
| `finance-corporate` | `finance_corporate_accounts` | `corporate_sales` |
| `cash` | `finance_cash_flow_management` | Auto-activado |
| `cash-management` | `finance_cash_session_management` | Auto-activado |
| `memberships` | `operations_membership_management` | `membership_programs` |
| `rentals` | `operations_rental_management` | `rental_operations` |
| `assets` | `operations_asset_management` | `rental_operations` |
| `intelligence` | `analytics_intelligence_dashboard` | Premium feature |
| `reporting` | `analytics_custom_reports` | Premium feature |
| `executive` | `analytics_executive_dashboard` | Premium feature |
| `products-analytics` | `analytics_product_insights` | `physical_products` |
| `achievements` | `gamification_achievements` | Auto-activado (parte de gamification) |
| `mobile` | `mobile_app_access` | Infrastructure feature |

**Manifest simplificado:**
```typescript
{
  id: 'materials',
  name: 'Materials & Inventory',
  activatedBy: 'inventory_stock_tracking',
  // ❌ NO autoInstall
  // ❌ NO enhancedBy
}
```

---

## 🗑️ Propiedades a Eliminar

### 1. `autoInstall: true/false`

**Razón:** Confuso - Si es CORE va en array, si es OPTIONAL usa `activatedBy`

**Reemplazar con:**
- CORE modules → En `CORE_MODULES` array
- OPTIONAL modules → `activatedBy: FeatureId`

**Archivos a modificar:**
```
src/modules/dashboard/manifest.tsx
src/modules/settings/manifest.tsx
src/modules/gamification/manifest.tsx
src/modules/shift-control/manifest.tsx
src/modules/achievements/manifest.tsx
... (15 archivos con autoInstall: true)
```

---

### 2. `enhancedBy: FeatureId[]`

**Razón:** Feature flags internos hacen esto más simple

**Reemplazar con:**
- UI components usan `useActiveFeatures()` directamente
- No necesita declaración en manifest

**Ejemplo:**
```typescript
// ❌ Antes (manifest)
enhancedBy: ['customer_loyalty_program', 'customer_service_history']

// ✅ Después (component)
const activeFeatures = useActiveFeatures();
{activeFeatures.includes('customer_loyalty_program') && <LoyaltySection />}
```

---

### 3. `activatedBy: 'dashboard'` (circular)

**Razón:** dashboard es CORE, no necesita feature para activarse

**Reemplazar con:**
- Mover a `CORE_MODULES` array
- Eliminar `activatedBy`

---

## ✅ Beneficios de la Simplificación

| Antes | Después |
|-------|---------|
| 968 líneas en featureActivationService.ts | ~50 líneas |
| `autoInstall: true` en 15 módulos | ❌ Eliminado |
| `enhancedBy` en 20+ módulos | ❌ Eliminado |
| Lógica circular (`dashboard` → `dashboard`) | ✅ Resuelto |
| CORE_FEATURES hardcoded array | ❌ Eliminado |
| Edge cases (customers sin activatedBy) | ✅ Resuelto |
| Confusión feature ID vs module ID | ✅ Separado claramente |

---

## 📝 Próximos Pasos

Ver: `2026-01-19-capabilities-refactor-plan.md`

1. Actualizar `ModuleManifest` type (eliminar propiedades)
2. Crear `CORE_MODULES` array
3. Crear `OPTIONAL_MODULES` mapping
4. Simplificar `featureActivationService.ts`
5. Actualizar 35 manifests
6. Eliminar `CORE_FEATURES` de FeatureRegistry
7. Testing completo

---

## 🔌 Compatibilidad con HookPoints (VERIFICADO)

### ¿Cómo funciona el sistema de HookPoints?

El sistema usa el patrón de **WordPress Hooks** para extensibilidad:

```typescript
// 1. Módulo REGISTRA componente en su setup()
// src/modules/materials/manifest.tsx
setup: async (registry) => {
  const { InventoryWidget } = await import('./widgets');

  registry.addAction(
    'dashboard.widgets',              // ← Hook point name
    () => <InventoryWidget />,        // ← Component to inject
    'materials',                      // ← Source module
    97                                // ← Priority (order)
  );
}

// 2. Otro módulo RENDERIZA todos los componentes registrados
// src/pages/admin/core/dashboard/page.tsx
<HookPoint
  name="dashboard.widgets"          // ← Renders ALL registered components
  direction="column"
  gap="4"
/>
```

### ✅ La Simplificación NO rompe HookPoints

**¿Por qué es compatible?**

1. **Los módulos siguen teniendo `setup()` function** donde registran hooks
2. **Lo único que cambia es CUÁNDO se carga el módulo:**
   - ❌ ANTES: `autoInstall: true` O `activatedBy` feature activa
   - ✅ DESPUÉS: En `CORE_MODULES` array O `activatedBy` feature activa
3. **Una vez cargado, el módulo ejecuta `setup()` normalmente**
4. **HookPoints renderizan los componentes registrados igual que antes**

### Ejemplo: materials module

```typescript
// ❌ ANTES (over-engineered)
{
  id: 'materials',
  autoInstall: false,                    // ← Innecesario
  activatedBy: 'inventory_stock_tracking',
  enhancedBy: ['inventory_alert_system'], // ← Innecesario

  setup: async (registry) => {
    // Registra widgets en HookPoints
    registry.addAction('dashboard.widgets', () => <InventoryWidget />);
    registry.addAction('shift-control.indicators', () => <StockAlertIndicator />);
  }
}

// ✅ DESPUÉS (simplificado)
{
  id: 'materials',
  activatedBy: 'inventory_stock_tracking', // ← Solo esto

  setup: async (registry) => {
    // ✅ setup() SIGUE IGUAL - HookPoints siguen funcionando
    registry.addAction('dashboard.widgets', () => <InventoryWidget />);

    // ✅ Renderización condicional de features se hace DENTRO del component
    const { StockAlertIndicator } = await import('./widgets');
    registry.addAction('shift-control.indicators', () => <StockAlertIndicator />);
  }
}
```

### Feature Flags DENTRO de HookPoint Components

Si un widget necesita mostrar secciones condicionales según features:

```typescript
// src/modules/materials/widgets/InventoryWidget.tsx
function InventoryWidget() {
  const activeFeatures = useActiveFeatures();

  return (
    <Card>
      <CardHeader>Inventory</CardHeader>
      <CardBody>
        {/* Siempre visible */}
        <StockLevels />

        {/* Condicional según feature */}
        {activeFeatures.includes('inventory_alert_system') && (
          <LowStockAlerts />
        )}

        {activeFeatures.includes('inventory_supplier_management') && (
          <PendingOrdersSection />
        )}
      </CardBody>
    </Card>
  );
}
```

### Conclusión

✅ **HookPoints y la arquitectura simplificada son 100% compatibles**
✅ **No se requiere cambio alguno en el sistema de HookPoints**
✅ **Solo cambia CUÁNDO se cargan los módulos, NO CÓMO funcionan**

---

**Fuentes de Investigación:**
- [React Feature Flags Best Practices](https://www.dhiwise.com/post/implementing-react-feature-flags-best-practices)
- [Feature Flags Guide - Medium](https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3)
- [Plugin Architecture Pattern](https://medium.com/omarelgabrys-blog/plug-in-architecture-dec207291800)
- [ArjanCodes - Plugin Best Practices](https://arjancodes.com/blog/best-practices-for-decoupling-software-using-plugins/)
