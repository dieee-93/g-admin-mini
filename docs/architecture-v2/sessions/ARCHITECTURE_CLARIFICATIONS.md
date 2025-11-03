# ARCHITECTURE CLARIFICATIONS

**Date**: 2025-01-24
**Status**: Pre-Phase 4 Decisions
**Purpose**: Resolve critical ambiguities before creating implementation deliverables

---

## 🎯 CONTEXT

Durante la auditoría arquitectónica de `ARCHITECTURE_DESIGN_V2.md`, se identificaron **3 ambigüedades críticas** y **3 casos no claros** que requieren decisión explícita antes de Phase 4.

Este documento resuelve cada uno con **decisiones arquitectónicas finales**.

---

## 🚨 DECISIONES CRÍTICAS (MUST RESOLVE)

### DECISIÓN #1: Offline Sync - Conflict Resolution Strategy

**Problema**: ARCHITECTURE_DESIGN_V2 menciona "sync manager" y "conflict resolution" pero NO define la estrategia específica.

**Escenario crítico**:
```typescript
// Dos usuarios offline editan mismo registro:
User A (offline): materials[123].stock = 50
User B (offline): materials[123].stock = 45

// Cuando sincronizan: ¿Cuál gana?
```

#### DECISIÓN FINAL: **Tiered Conflict Resolution Strategy**

**Implementación**:
```typescript
// TIER 1: Last-Write-Wins (LWW) - Non-critical data
const LWW_ENTITIES = [
  'user_preferences',
  'dashboard_widget_order',
  'ui_settings',
  'notification_preferences'
]

// TIER 2: Operational Transformation (OT) - Counters/aggregates
const OT_ENTITIES = [
  'materials.stock', // Apply delta: stock += delta (not absolute)
  'sales.daily_total', // Accumulate changes
  'production.queue_count'
]

// TIER 3: Manual Resolution - Transactional data
const MANUAL_RESOLUTION_ENTITIES = [
  'sales_orders', // Can't auto-merge conflicting payments
  'fiscal_invoices', // Legal implications
  'finance_credit_limits', // Business critical
  'supplier_orders'
]
```

**Rationale**:
- **LWW**: Simple, rápido, no crítico si se pierde un cambio
- **OT**: Preserva ambos cambios (suma deltas en lugar de reemplazar)
- **Manual**: Usuario final decide en conflictos críticos

**Implementation Location**: `src/lib/offline/ConflictResolver.ts` (new file)

**Testing Priority**: HIGH (debe testear antes de launch)

---

### DECISIÓN #2: Mobile Module - Activation Logic

**Problema**: Mobile module provee GPS tracking para:
- `mobile_operations` capability (food trucks)
- `delivery_shipping` capability (delivery drivers)

**Ambigüedad**: ¿Es infrastructure (auto-install) o capability-specific?

#### DECISIÓN FINAL: **Infrastructure Service with OR Logic**

**Implementación**:
```typescript
// src/modules/mobile/manifest.tsx
export const mobileManifest: ModuleManifest = {
  id: 'mobile',
  version: '1.0.0',
  depends: [],
  autoInstall: true, // ← CRITICAL: Auto-install if ANY capability needs it

  // OR logic: Activa si mobile_operations OR delivery_shipping está activo
  requiredCapabilities: ['mobile_operations', 'delivery_shipping'],
  activationLogic: 'OR', // ← NEW field: OR (cualquiera) vs AND (todos)

  type: 'infrastructure', // ← NEW field: Marca como servicio compartido

  features: [
    'mobile_location_tracking', // GPS tracking
    'mobile_route_planning', // Daily routes
    'mobile_inventory_constraints' // Capacity limits
  ],

  hooks: {
    provide: [
      'mobile.gps_tracking', // Hook for real-time location
      'mobile.route_planner', // Hook for route optimization
      'mobile.maps_integration' // Hook for map display
    ],
    consume: []
  }
}
```

**Casos de uso**:
```
┌─────────────────────────────────────────────────┐
│ CASO 1: Restaurant con delivery (NO food truck)│
│ - delivery_shipping: ✅ Active                  │
│ - mobile_operations: ❌ Inactive                │
│ → Mobile module: ✅ AUTO-INSTALLS               │
│ → GPS available for delivery tracking          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CASO 2: Food truck (NO delivery)               │
│ - mobile_operations: ✅ Active                  │
│ - delivery_shipping: ❌ Inactive                │
│ → Mobile module: ✅ AUTO-INSTALLS               │
│ → GPS available for truck location             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CASO 3: Salon (NO delivery, NO mobile)         │
│ - mobile_operations: ❌ Inactive                │
│ - delivery_shipping: ❌ Inactive                │
│ → Mobile module: ❌ NOT LOADED                  │
│ → No GPS code in bundle                        │
└─────────────────────────────────────────────────┘
```

**Rationale**:
- Mobile es **infrastructure** (reusable service)
- Se activa automáticamente cuando CUALQUIER capability lo necesita
- Evita duplicación de GPS logic en Fulfillment y Mobile modules

**Implementation Impact**:
- Agregar `activationLogic: 'OR' | 'AND'` field a ModuleManifest type
- Actualizar `getActiveModules()` en ModuleRegistry para soportar OR logic

---

### DECISIÓN #3: Module Count - Reconciliación Final

**Problema**: ARCHITECTURE_DESIGN_V2 dice "27 → 22 modules" pero la cuenta no cierra.

#### ANÁLISIS DETALLADO:

**AS-IS (Current - 27 modules)**:
```
TIER 0: Gamification (1)
TIER 1: Dashboard, Settings, Customers, Debug (4)
TIER 2: Sales, Floor, Kitchen, Ecommerce (4) ← Floor y Ecommerce a eliminar
TIER 3: Materials, Suppliers, Supplier-Orders, Products, Production (5)
TIER 4: Staff, Scheduling (2)
TIER 5: Fiscal, Billing, Finance-Integrations (3)
TIER 6: Reporting, Intelligence (2)
TIER 7: Memberships, Rentals, Assets (3)
TIER 8: Delivery (1) ← Delivery a eliminar
────────────────────────────────────────────────
TOTAL: 27 modules
```

**TO-BE (Proposed - 22 modules)**:
```
TIER 0: Gamification (1)
TIER 1: Dashboard, Settings, Customers, Debug (4)
TIER 2: Sales, Fulfillment (NEW), Production (rename Kitchen), Mobile (NEW) (4)
TIER 3: Materials, Suppliers, Supplier-Orders, Products (4)
TIER 4: Staff, Scheduling (2)
TIER 5: Fiscal, Billing, Finance-Integrations, Finance (NEW - B2B) (4)
TIER 6: Reporting, Intelligence (2)
TIER 7: Memberships, Rentals, Assets (3)
────────────────────────────────────────────────
TOTAL: 24 modules
```

#### DECISIÓN FINAL: **27 → 24 modules (-3 modules, -11% reduction)**

**Cambios exactos**:
```diff
+ ADDED (3 modules):
  + Fulfillment (NEW - consolidates onsite/pickup/delivery)
  + Mobile (NEW - GPS tracking infrastructure)
  + Finance (NEW - B2B accounts/credit)

- DELETED (4 modules):
  - Floor (merged → Fulfillment/onsite)
  - Delivery (merged → Fulfillment/delivery)
  - Ecommerce (merged → Sales/ecommerce subfolder)
  - Production (old) (renamed → Production with new scope)

♻ RENAMED (1 module):
  ♻ Kitchen → Production (multi-industry terminology)

NET CHANGE: +3 -4 +1 rename = 27 → 24 modules
```

**Corrección necesaria**: Actualizar todos los documentos:
- ARCHITECTURE_DESIGN_V2.md line 21: "27 → 22" → **"27 → 24"**
- ARCHITECTURE_DESIGN_V2.md line 21: "19% reduction" → **"11% reduction"**

**Rationale para discrepancia original**:
- Inicialmente no se contó Delivery module en la lista de deletions
- Ecommerce module consolidation no estaba documentada explícitamente

---

## 📋 CLARIFICACIONES ADICIONALES (Ambiguedades Menores)

### CLARIFICACIÓN #4: Staff/walkin vs Scheduling/appointments

**Problema**: ¿Dónde va "walk-in appointments" (cliente sin cita que pide slot inmediato)?

#### DECISIÓN FINAL: **Walk-in PERMANECE en Staff module**

**Rationale**:
```
Staff/walkin → First-come-first-served queue (NO appointment system)
  - Use case: Restaurant waitlist (no reservations)
  - Use case: Salon walk-in queue (overflow cuando stylist termina early)
  - Característica: NO pre-booking, solo "queue number"

Scheduling/appointments → Pre-booked time slots
  - Use case: Restaurant reservations (fecha/hora específica)
  - Use case: Salon appointments (scheduled services)
  - Característica: Calendar booking, reminder system

HYBRID SCENARIO (ambos activos):
  - Walk-in queue alimenta Scheduling cuando hay no-show
  - Scheduling puede mostrar "walk-in available slots" en tiempo real
  - Comunicación vía EventBus: staff.walkin_added → scheduling.check_available_slots
```

**Decisión de diseño**:
- Walk-in = Anti-scheduling (negocio sin citas)
- Appointment = Pro-scheduling (negocio con citas)
- Pueden coexistir: restaurant con reservas Y walk-in queue

**Implementation**: NO CHANGES needed, diseño actual es correcto

---

### CLARIFICACIÓN #5: Recipe Intelligence - Production vs Intelligence

**Problema**: Features de recipe analytics/costing, ¿dónde van?

#### DECISIÓN FINAL: **Split by Concern**

**Distribución de features**:
```typescript
// PRODUCTION MODULE (Operational concerns)
Production/
├── /workflows
│   └── production_bom_management (CRUD de BOMs/recipes)
├── /queue
│   └── production_display_system (PDS/KDS queue)
└── /costing
    ├── production_bom_costing (cuánto CUESTA hacer el BOM)
    └── production_yield_analysis (rendimiento real vs teórico)

// INTELLIGENCE MODULE (Strategic concerns)
Intelligence/
├── /menu-engineering
│   ├── intelligence_recipe_profitability (cuánto COBRAR)
│   ├── intelligence_menu_optimization (qué items promover)
│   └── intelligence_competitor_pricing (análisis de mercado)
└── /market-intelligence
    └── intelligence_demand_forecasting (predicción de demanda)
```

**Rationale**:
- **Production costing** = "¿Cuánto me cuesta producir?" (operational)
- **Intelligence pricing** = "¿Cuánto debería cobrar?" (strategic)
- Production se enfoca en EFICIENCIA de producción
- Intelligence se enfoca en RENTABILIDAD de negocio

**Features MOVED**:
```diff
FROM Intelligence TO Production:
+ production_bom_costing (cost calculation)
+ production_yield_analysis (production efficiency)

STAYS in Intelligence:
✓ intelligence_recipe_profitability (pricing strategy)
✓ intelligence_menu_optimization (menu engineering)
✓ intelligence_competitor_pricing (market analysis)
```

---

### CLARIFICACIÓN #6: Ecommerce Module Consolidation

**Problema**: Ecommerce module aparece en PRODUCTION_PLAN pero NO en ARCHITECTURE_DESIGN_V2.

#### DECISIÓN FINAL: **Ecommerce → Sales/ecommerce subfolder**

**Rationale**:
```
Ecommerce NO es un módulo separado, es un CANAL DE VENTA dentro de Sales.

Sales module structure:
Sales/
├── /pos (Point of Sale - in-person)
├── /ecommerce (E-commerce - online store) ← Ecommerce module content moves here
├── /b2b (B2B - corporate sales)
└── /core (Shared logic: order management, payments, catalog)
```

**Migration path**:
```diff
- DELETE: src/modules/ecommerce/ (module folder)
+ CREATE: src/modules/sales/ecommerce/ (subfolder)

Route changes:
- /admin/operations/ecommerce (old)
+ /admin/operations/sales/ecommerce (new - or keep old as alias)
```

**Justification**:
- Ecommerce comparte 90% de features con POS (order management, payments, catalog)
- Solo difiere en "UI" (web vs in-person) y "fulfillment type" (deferred vs immediate)
- Consolidar reduce duplication de order logic

**Status**: CONFIRMED consolidation (not documented in ARCHITECTURE_DESIGN_V2, will add)

---

### CLARIFICACIÓN #7: walkin_service Capability - ELIMINATED

**Problema**: `walkin_service` definida como capability separada, pero walk-in es un MODO de operación, no una capacidad de negocio.

#### ANÁLISIS DE CASOS DE USO REALES:

```typescript
// CASO 1: Restaurant con walk-in
Cliente entra → ¿Qué hace la app?
→ Mesa disponible: Floor module asigna mesa + POS
→ Mesa NO disponible: operations_waitlist_management (YA existe en onsite_service)
✅ USA: onsite_service (NO necesita walkin_service)

// CASO 2: Salón de belleza con walk-in
Cliente entra → ¿Qué hace la app?
→ Stylist disponible: Scheduling crea appointment "inmediato" (NOW + 5 min)
→ Stylist ocupado: Queue en Scheduling (espera a que termine servicio actual)
✅ USA: appointment_based (NO necesita walkin_service)

// CASO 3: Taller mecánico con walk-in
Cliente entra → Appointment on-the-spot en Scheduling
✅ USA: appointment_based (NO necesita walkin_service)

// CASO 4: Tienda de electrodomésticos con walk-in
Cliente entra → POS directo (venta inmediata)
✅ USA: onsite_service (NO necesita walkin_service)
```

#### VALIDACIÓN DE INDUSTRIA:

Investigación de sistemas modernos (2025):
> "Modern reservation systems manage online bookings, walk-ins, and waitlists in ONE PLACE" - Yelp Guest Manager

> "High-value guests who make reservations spend 25% more per person than walk-ins, on average"

**CONCLUSIÓN**: Walk-in NO es una capability separada, es un MODO DE OPERACIÓN de capabilities existentes.

#### FEATURES WALK-IN IDENTIFICADAS:

```typescript
// walkin_service activaba SOLO features genéricas:
'staff_employee_management'  // ← YA está en TODAS las capabilities
'staff_shift_management'     // ← YA está en TODAS las capabilities
'staff_time_tracking'        // ← YA está en TODAS las capabilities

// Features walk-in que SÍ existen y están bien ubicadas:
'operations_waitlist_management' → onsite_service ✅ (restaurant waitlist)
```

#### DECISIÓN FINAL: **ELIMINATE walkin_service capability**

**Rationale**:
- Walk-in NO activa ninguna feature única
- Walk-in es un modo de usar `onsite_service` o `appointment_based`
- Industria trata walk-in como feature dentro de appointment systems, no capability separada

**Implementation**:
```diff
# Código actualizado:
- src/config/BusinessModelRegistry.ts: DELETE walkin_service block ✅
- src/config/types/atomic-capabilities.ts: REMOVE from BusinessCapabilityId type ✅
- TypeScript check: PASSED ✅

# Features walk-in redistribuidas:
- operations_waitlist_management → Stays in onsite_service ✅
- NO new features needed (already covered)
```

**Impact on Capabilities**:
```diff
BEFORE: 9 capabilities
- onsite_service
- pickup_orders
- delivery_shipping
- requires_preparation
- appointment_based
- walkin_service ← DELETE
- online_store
- corporate_sales
- mobile_operations

AFTER: 8 capabilities (-1)
- onsite_service (covers product walk-in: restaurant, retail)
- pickup_orders
- delivery_shipping
- requires_preparation
- appointment_based (covers service walk-in: salon, clinic)
- online_store
- corporate_sales
- mobile_operations
```

**Walk-in Coverage by Capability**:
| Business Type | Walk-in Scenario | Capability Used | Features |
|---------------|------------------|-----------------|----------|
| Restaurant | Walk-in diners | `onsite_service` | `operations_waitlist_management` + POS |
| Retail Store | Walk-in shoppers | `onsite_service` | POS directo (no waitlist) |
| Salon/Spa | Walk-in clients | `appointment_based` | Immediate appointment booking |
| Clinic | Walk-in patients | `appointment_based` | On-the-spot appointment |
| Workshop | Walk-in service | `appointment_based` | Same-day appointment |

**Conclusion**: Walk-in es un PATTERN de interacción, no una capability. Correctamente eliminada.

---

## 📊 DECISIONES SUMMARY TABLE

| # | Decisión | Status | Impact | Implementation |
|---|----------|--------|--------|----------------|
| 1 | Conflict Resolution: Tiered (LWW/OT/Manual) | ✅ DECIDED | CRITICAL | New: ConflictResolver.ts |
| 2 | Mobile Module: Infrastructure with OR logic | ✅ DECIDED | HIGH | Update: ModuleRegistry OR support |
| 3 | Module Count: 27 → 24 (not 22) | ✅ DECIDED | MEDIUM | Update: All docs (-11% not -19%) |
| 4 | Walk-in: Delete capability (not a capability) | ✅ DECIDED + IMPLEMENTED | HIGH | Deleted: walkin_service capability ✅ |
| 5 | Recipe Intelligence: Split Production/Intelligence | ✅ DECIDED | MEDIUM | Move 2 features to Production |
| 6 | Ecommerce: Consolidate into Sales/ecommerce | ✅ DECIDED | MEDIUM | Move module to subfolder |

---

## ✅ NEXT STEPS

**Before Phase 4**:
1. ✅ Update ARCHITECTURE_DESIGN_V2.md:
   - Line 21: "27 → 22" → "27 → 24"
   - Line 21: "19% reduction" → "11% reduction"
   - Add Ecommerce consolidation to "Deleted Modules" section
   - Add Delivery consolidation to "Deleted Modules" section

2. ✅ Update module count table:
   - Sales & Fulfillment: 4 → 4 (Sales, Fulfillment, Production, Mobile)
   - Note: Ecommerce merged into Sales, Delivery merged into Fulfillment

3. ✅ Document in FEATURE_MODULE_UI_MAP (Phase 4):
   - Ecommerce features → Sales/ecommerce location
   - Delivery features → Fulfillment/delivery location
   - Mobile activation logic (OR condition)

**During Phase 4**:
4. Create ConflictResolver.ts specification in CROSS_MODULE_INTEGRATION_MAP
5. Document Mobile module OR activation in MIGRATION_PLAN.md
6. Update PRODUCTION_PLAN.md Section 2.1 with final count (24 modules)

---

## 🎯 ARCHITECTURAL PRINCIPLES VALIDATED

✅ **DRY Principle**: Ecommerce y Delivery consolidation eliminan duplicación
✅ **Separation of Concerns**: Production (operational) vs Intelligence (strategic)
✅ **Infrastructure Services**: Mobile module como servicio compartido
✅ **Data Integrity**: Conflict resolution strategy protege datos críticos
✅ **Multi-Industry Support**: Appointment-based service mode flexibility
✅ **Capability Clarity**: Walk-in correctly identified as operational mode, not capability

---

**STATUS**: ✅ ALL CRITICAL AMBIGUITIES RESOLVED

**READY FOR**: Phase 4 - Create Deliverables

**ESTIMATED IMPACT ON PHASE 4**: +15 minutes (update existing docs with corrections)

---

**END OF ARCHITECTURE_CLARIFICATIONS.MD**
