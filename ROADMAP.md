# G-Admin Mini - Development Roadmap

**Última Actualización**: 2025-11-06 (Architecture Session Implementation Complete)
**Versión**: 3.2 Modular Architecture Edition
**Estado**: Phase 3 - Assembly & Integration (Architecture decisions implemented)

**2025-11-06 Update**: Complete architecture reorganization implemented
- **Phase 1**: Assets module moved from OPERATIONS to SUPPLY-CHAIN domain ✅
  - Reasoning: Is inventory management (durable goods), not revenue generation
  - Pattern: materials (consumables), assets (durables) → both supply-chain
  - No breaking changes - only organizational restructuring

- **Phase 2**: Supplier-orders converted to materials/procurement submodule ✅
  - Module ID: `supplier-orders` → `materials-procurement`
  - Event names: `supplier_orders.*` → `materials.procurement.po_*`
  - Route: `/admin/supply-chain/supplier-orders` → `/admin/supply-chain/materials/procurement`
  - Breaking changes: Module ID, routes, event names (v2.0.0)

- **Phase 3**: Rentals UI injection into Assets enabled ✅
  - Assets provides 3 new hooks: `assets.row.actions`, `assets.form.fields`, `assets.detail.sections`
  - Rentals consumes hooks and injects rental UI into Assets module
  - Example: "Rent Asset" button, rental fields (is_rentable, hourly_rate)
  - Pattern established for cross-module UI composition

---

## 📊 Estado Actual del Proyecto

```
✅ Arquitectura definida: Capabilities → Features → Modules
✅ 31 módulos registrados (26 principales + 5 submódulos)
✅ EventBus v2 operacional (pero events NO se emiten en Materials)
✅ Module Registry funcional
✅ 86 features distribuidas
✅ Unified Alerts System (shared/alerts/) - Materials integrado correctamente
⚠️  EventBus integration incompleta: Events declarados pero NO emitidos
⚠️  Cross-module UI injections parciales (faltan Suppliers, Products)
⚠️  Sales & Scheduling alerts NO usan sistema unificado (duplican estado)
⚠️  Testing integral: Pendiente
⚠️  Optimización: Pendiente
```

---

## 🎯 Mes 1: Módulos Críticos (Febrero 2025)

### Semana 1-2: Sales Module (P0) ⏳

#### POS Básico
- [x] Interfaz de ventas funcional
- [x] Carrito de compras
- [x] Procesamiento de pagos básico
- [ ] Integración con impresoras fiscales

#### ✅ EventBus Integration (COMPLETED 2025-02-05)
**Estado**: Core EventBus integration complete, listeners implemented

- [x] **P0-CRITICAL**: EventBus Emissions (2.5h) ✅
  - [x] Fix B2B finance module imports (30min) - `@/modules/finance-corporate/services`
  - [x] Emit `sales.order_placed` in `orderService.ts` (1h)
  - [x] Emit `sales.order_completed` in `checkoutService.ts` (30min)
  - [x] Emit `sales.payment_received` in `financeIntegration.ts` (30min)
- [x] **P0-HIGH**: EventBus Listeners (1.5h) ✅
  - [x] Listen to `materials.stock_updated` in `manifest.tsx` (45min)
  - [x] Listen to `production.order_ready` in `manifest.tsx` (45min)
- [x] **P0-HIGH**: Replace console.* with logger (30min) ✅
  - [x] 7 instances replaced in ecommerce services

**Impact**: 16 modules can now receive sales events (Fulfillment, Production, Materials, Finance, Customers, Products, Gamification)

#### ✅ Alerts System Integration (COMPLETED 2025-02-05)
**Estado**: Sales fully integrated with global alerts system (`src/shared/alerts/`)

- [x] **P1-HIGH**: Integrate Unified Alerts System (4h) ✅
  - [x] Created `salesAlertsAdapter.ts` with 9 alert types (2h)
    - orderCreationFailed, creditLimitExceeded, stockUnavailable
    - paymentFailed, checkoutValidationFailed, lowStockWarning
    - orderReadyNotification, quoteApprovalNeeded, cartExpirationWarning
  - [x] Integrated `useAlerts({ context: 'sales' })` in hooks (1.5h)
    - `useOnlineOrders.ts` - Replaced error state with alerts
    - `useCart.ts` - Replaced error state with alerts (7 operations)
  - [x] Removed local error state from hooks (30min)
    - All errors now flow through global alerts system
    - Consistent UX across Sales module

**Pattern**: ✅ FIRST module to use global alerts system correctly
**Reference**: Sales is now the Gold Standard for alerts integration

#### B2B Sales Integration
**Estado**: Database ✅, Backend ✅, QuoteBuilder ✅, Tiered Pricing pendiente

- [x] Backend services implementados ✅
  - [x] `quotesService.ts` - Quote generation logic
  - [x] `tieredPricingService.ts` - Volume pricing
  - [x] `approvalWorkflowService.ts` - Multi-level approvals
  - [x] `financeIntegration.ts` - Credit validation bridge
- [x] **Database setup** ✅ (COMPLETED 2025-02-05)
  - [x] Tables exist: `b2b_quotes`, `b2b_quote_items`, `pricing_tiers`, `approval_workflows`
  - [x] RLS policies implemented
  - [x] Supabase integration working
- [x] **QuoteBuilder UI** ✅ (COMPLETED 2025-02-05)
  - [x] QuoteBuilder.tsx - Full form with line items table
  - [x] Dynamic add/remove items
  - [x] Real-time calculations (subtotal, tax, total)
  - [x] Integration with quotesService
  - [x] Decimal.js precision handling
- [ ] **P1-MEDIUM**: Remaining UI (3h)
  - [ ] TieredPricingManager.tsx - UI for pricing rules
  - [ ] Quote versioning UI
  - [ ] Approval workflow UI
- [ ] Credit limit validation (Frontend)
  - [ ] Real-time credit checks via Finance API
  - [ ] Alert system para límites excedidos (usa unified alerts)
- [ ] E-commerce Integration
  - [ ] Online catalog (uses Products module)
  - [ ] Shopping cart management
  - [ ] Async order processing
  - [ ] Payment gateway integration

**Estimado Actualizado**: 1 semana (4h alerts + 3h tiered pricing + tests)
**✅ B2B Database Foundation COMPLETO** (2025-02-05): QuoteBuilder funcional, database integrado

---

### Semana 3-4: Materials Module (P0) ✅ PARCIAL

**Estado Real** (Verificado 2025-02-05): EventBus emissions ✅ COMPLETAS, Listeners parciales

#### ✅ Stock Lab Precision System (Implementado)
- [x] Basic inventory tracking (CRUD completo)
- [x] Smart alerts engine (`smartAlertsEngine.ts`)
  - [x] Multi-threshold alerts (critical, low, reorder)
  - [x] ABC analysis integration
  - [x] Alert customization por material
- [x] Unified alerts integration via `SmartAlertsAdapter` ✅ **REFERENCIA**
- [x] ML algorithms library (`lib/ml/`)
  - [x] Anomaly detection (Z-Score, IQR, MAD)
  - [x] Time series analysis
  - [x] Demand forecasting algorithms

#### ✅ EventBus Emissions - COMPLETO (Verificado 2025-02-05)
**Estado REAL**: Todos los eventos SE EMITEN correctamente

```typescript
// ✅ VERIFIED: Todos los eventos se emiten
✅ materials.stock_updated - inventoryApi.ts:190
✅ materials.low_stock_alert - smartAlertsEngine.ts:544
✅ materials.material_created - inventoryApi.ts:83
✅ materials.material_updated - inventoryApi.ts:290
✅ materials.material_deleted - inventoryApi.ts:388
```

**Emissions**: ✅ 5/5 COMPLETAS
**Listeners**: ⚠️ 2/4 implementados

**Tasks CORREGIDAS:**
- [x] **Emissions**: COMPLETO ✅ (ROADMAP estaba desactualizado)
- [x] **Sales listeners**: ✅ COMPLETO (useSales.ts:43)
- [x] **Supplier Orders listeners**: ✅ COMPLETO (useSupplierOrders.ts:55)
- [ ] **P1-MEDIUM**: Add listeners faltantes (2h)
  - [ ] **Production** (`src/modules/production/manifest.tsx`):
    - [ ] Listen `materials.stock_updated` → Update recipe availability
    - [ ] Listen `materials.material_deleted` → Mark recipes as incomplete
  - [ ] **Products** (`src/modules/products/manifest.tsx`):
    - [ ] Listen `materials.stock_updated` → Update product cost calculations

#### 🔄 Cross-Module UI Injection (Parcial)

**Lo que funciona:**
- [x] Materials exports API: `getStockLevel()`, `validateStockAvailability()` ✅
- [x] Hook providers: `materials.row.actions`, `materials.procurement.actions` ✅
- [x] Sales injects: "Create Sale" button en Materials grid ✅
- [x] Production injects: "Use in Production" en Materials grid ✅

**Lo que falta:**
- [ ] **P1-MEDIUM**: Missing UI injections (3h)
  - [ ] **Suppliers module** → Materials:
    ```typescript
    // En suppliers/manifest.tsx
    registry.addAction('materials.row.actions', () => ({
      id: 'view-supplier',
      label: 'View Supplier',
      icon: 'Building',
      priority: 7,
      onClick: (materialId) => navigate(`/suppliers/${supplierId}`)
    }));
    ```
  - [ ] **Products module** → Materials:
    ```typescript
    // En products/manifest.tsx
    registry.addAction('materials.row.actions', () => ({
      id: 'view-recipes',
      label: 'View Recipes',
      icon: 'BookOpen',
      priority: 6,
      onClick: (materialId) => showRecipesModal(materialId)
    }));
    ```
  - [ ] **Supplier Orders** → Materials:
    ```typescript
    // En supplier-orders/manifest.tsx
    registry.addAction('materials.procurement.actions', () => ({
      id: 'create-po',
      label: 'Create Purchase Order',
      icon: 'ShoppingCart',
      onClick: (materialId) => openPOModal(materialId)
    }));
    ```

#### ✅ Multi-location Support (Implementado)
- [x] Location-aware inventory (`location_id` field)
- [x] Transfer management API (`transfersService.ts`)
- [ ] Consolidated reporting UI

#### 🔧 Technical Improvements (P1-LOW)
- [ ] Integrate `lib/ml/forecasting.ts` into Materials (3h)
  - [ ] File: `src/pages/admin/supply-chain/materials/services/abcAnalysisEngine.ts`
  - [ ] Replace mock data en `estimateAnnualConsumption()` (línea 168-189)
  - [ ] Use `forecastDemand()` for real predictions
  - [ ] Add seasonal analysis to ABC classification

**Estimado Actualizado**: 1-2 sesiones (5-6 horas)
- ~~Session 1: EventBus emissions~~ ✅ YA COMPLETO
- ~~Session 2: Sales/Supplier Orders listeners~~ ✅ YA COMPLETO
- Session 1: Production/Products listeners (2h)
- Session 2: UI injections (3h)

**✅ Materials EventBus NO es bloqueador** - Emissions completas, solo faltan listeners opcionales

---

### Semana 5: Customers Module Validation (P0) ✅ COMPLETO

**Estado**: Session 1 & 2 COMPLETO - Production Ready ✅ (2025-11-06)

**Why P0**: Foundation module - Billing, Memberships, Rentals, Sales dependen de él

#### ✅ Lo que ya funciona
- [x] UI completa con CRUD operacional
- [x] RFM analytics (`useCustomerRFM.ts`) ✅
- [x] Customer segmentation ✅
- [x] Service layer completo (`customerApi.ts`, `advancedCustomerApi.ts`)
- [x] Manifest con hooks definidos ✅
- [x] **EventBus Integration** ✅ COMPLETO (2025-11-06)
  - [x] Listener IMPLEMENTED: `sales.order_completed` → RFM updates (manifest.tsx línea 74-119)
  - [x] Queues RFM update via `customer_rfm_update_queue` table
  - [x] Triggers immediate RFM recalculation via `calculate_customer_rfm_profiles` RPC
  - [x] Error handling and logging implemented
- [x] **Alerts Integration** ✅ (2025-11-05)
  - [x] customersAlertsAdapter.ts created (8 alert types)
  - [x] useCustomerRFM.ts integrated (2 hooks)
  - [x] useCustomersPage.ts integrated
  - [x] useCustomerNotes.ts integrated (2 hooks)
  - [x] **Total: 5 hooks migrated to useAlerts**
- [x] **Real Data Integration** ✅ (2025-11-06)
  - [x] useCustomersPage fetches real sales data from database
  - [x] useCustomersPage fetches real RFM profiles from `customer_rfm_profiles` table
  - [x] Removed all mock data - analytics now show real metrics

#### ✅ Session 1 Completed Tasks (3h - 2025-11-06)
- [x] **P0-CRITICAL: EventBus RFM Auto-Update Handler** (1.5h) ✅
  - [x] Implemented handler in `src/modules/customers/manifest.tsx:74-119`
  - [x] Uses `customer_rfm_update_queue` for batch processing
  - [x] Calls `calculate_customer_rfm_profiles` RPC for immediate recalculation
  - [x] Full error handling with logger integration
- [x] **P0-CRITICAL: Memberships Profile Section Injection** (1h) ✅
  - [x] Created `CustomerMembershipSection.tsx` component
  - [x] Registered injection in `src/modules/memberships/manifest.tsx:66-80`
  - [x] Fetches real membership data from database
  - [x] Shows membership status, tier, and period
- [x] **P0-CRITICAL: Fix Mock Data in Analytics** (30min) ✅
  - [x] Replaced mock sales data with real Supabase query
  - [x] Replaced mock RFM profiles with real `customer_rfm_profiles` fetch
  - [x] Fixed TypeScript `any` error → `Record<string, unknown>`

#### ✅ Session 2 Completed Tasks (3h - 2025-11-06)
- [x] **P1-HIGH: Finance-Billing Profile Section Injection** (1h) ✅
  - [x] Created `CustomerBillingSection.tsx` component
  - [x] Shows billing summary, recent invoices, payment methods
  - [x] Registered injection in `src/modules/finance-billing/manifest.tsx:66-80`
  - [x] Added `customers.profile_sections` to finance-billing hooks.consume
- [x] **P1-HIGH: Security Gaps in Address API** (1.5h) ✅
  - [x] Added `requirePermission()` function with RBAC
  - [x] Added `isValidUUID()` validation to prevent SQL injection
  - [x] Added `auditAddressAccess()` for GDPR compliance
  - [x] Added `maskSensitiveData()` for log protection
  - [x] Added coordinate validation (lat/lng ranges)
  - [x] Updated `getCustomerAddresses()`, `createCustomerAddress()`, `deleteCustomerAddress()` with security
- [x] **P1-HIGH: Service Layer Cleanup** (30min) ✅
  - [x] Deleted unused `existing/customerApi.ts` (no consumers found)
  - [x] Kept `existing/advancedCustomerApi.ts` (used by 3 hooks: RFM, notes, tags)
  - [x] Verified no breaking changes with Grep search
- [x] **P1-HIGH: Comprehensive README.md** (30min) ✅
  - [x] Created 800+ line README following Materials pattern
  - [x] Documented architecture, EventBus integration, alerts system
  - [x] Documented RFM analysis, segmentation, CLV calculations
  - [x] Documented security implementation with code examples
  - [x] Documented complete database schema with all tables
  - [x] Added production readiness checklist

#### 🔍 Validation Tasks Status
- [x] **EventBus Integration Audit** ✅ COMPLETO (2025-11-06)
  - [x] Listener fully implemented (not just TODO)
  - [x] RFM updates working on sales.order_completed
  - [x] EventBus properly registered in manifest setup
- [x] **Alerts System Integration** ✅ COMPLETO (2025-11-05)
  - [x] customersAlertsAdapter.ts created with 8 alert types
  - [x] All hooks migrated from useState<Error> to useAlerts
  - [x] Pattern matches Sales Gold Standard
- [x] **Cross-Module Hooks Validation** ✅ COMPLETO (2025-11-06)
  - [x] `customers.profile_sections` - Memberships injection ✅
  - [x] `customers.profile_sections` - Billing injection ✅ (Session 2)
  - [ ] `customers.quick_actions` - Sales injection (P2 - futuras versiones)
  - [ ] `customers.quick_actions` - Rentals injection (P2 - futuras versiones)
  - [x] `dashboard.widgets` - Customer CRM widget ✅
- [x] **Documentation** ✅ COMPLETO (2025-11-06)
  - [x] Comprehensive README.md created (800+ lines)
  - [x] Cross-module integration documented with code examples
  - [x] Database schema documented (all 8 tables)
  - [x] RFM analytics explanation with segmentation table
  - [x] Security implementation documented
- [x] **Service Layer Security** ✅ COMPLETO (2025-11-06)
  - [x] Address API secured with RBAC permissions
  - [x] Input validation (UUID, coordinates)
  - [x] Audit logging for GDPR compliance
  - [x] Data masking in logs

**Deliverable**: ✅ Production-Ready Module with Score 14/15

**Time Invested**: 6 hours total (3h Session 1 + 3h Session 2)
**Progress**: ✅ 95% complete (all P0 & P1 done, only P2 quick_actions pending)
**Production Score**: **14/15** (from initial 12/15)

---

### 🔧 Semana 2.5: Alerts System Consolidation ✅ COMPLETADO (2025-11-05)

**Problema Identificado**: Sales y Scheduling duplicaban state management de alertas

#### Scheduling Module Refactoring ✅ COMPLETADO
- [x] Refactor Scheduling Alerts ✅ (2025-11-05)
  - [x] File: `src/pages/admin/resources/scheduling/hooks/useSchedulingAlerts.ts` ✅
  - [x] Eliminado `useState<string | null>` error state ✅
  - [x] Integrado `useAlerts({ context: 'scheduling' })` ✅
  - [x] Creado `schedulingAlertsAdapter.ts` (8 alert types) ✅
  - [x] Mantenido `SchedulingAlertsAdapter` (business intelligence) ✅

**Pattern Aplicado**: Sales/Customers Gold Standard (adapter pattern)

**Archivos**:
- `schedulingAlertsAdapter.ts` - 8 alert types (global system)
- `SchedulingAlertsAdapter.ts` - Business intelligence (mantener)
- `useSchedulingAlerts.ts` - Integrado con useAlerts

**Estimado**: 8 horas total → **Completado en 1.5h** (81% más rápido)

---

## 🔗 Mes 2: Integraciones Cross-Module (Marzo 2025)

**PREREQUISITO**: Materials EventBus emissions DEBEN estar completos

### Semana 1: Sales ↔ Finance (P0)

#### Credit Management Integration
**Estado**: Backend completo, falta EventBus + UI
- [x] Finance services operacionales (`creditManagementService.ts`) ✅
- [x] Integration layer (`financeIntegration.ts`) ✅
- [ ] EventBus workflow (3h)
  - [ ] Sales emite: `sales.b2b.credit_check_requested`
  - [ ] Finance escucha y responde: `finance.credit_check_completed`
  - [ ] Sales recibe y actualiza UI
- [ ] UI Integration (2h)
  - [ ] Show credit status en QuoteBuilder
  - [ ] Automatic hold UI para orders que exceden límite
  - [ ] Past due warnings en customer lookup
- [ ] Integration tests (2h)

#### Payment Terms Application
- [ ] Apply customer payment terms to invoices
- [ ] Due date calculations
- [ ] Payment reminders system

#### A/R Aging Integration
**Nota**: Finance `arAgingService.ts` usa placeholder logic (all invoices "current")
- [ ] Fix A/R aging calculation (requiere invoice table)
- [ ] Customer creditworthiness en Sales UI
- [ ] Credit hold logic

**Estimado**: 1.5 semanas (A/R aging requiere Fiscal invoice table)
**Tests**: Integration tests obligatorios

---

### Semana 2: Delivery ↔ Sales (P1) ✅ COMPLETADO (2025-02-05)

**Estado**: ✅ Consolidación completa + EventBus integration + Supabase integration

#### Order to Delivery Handoff ✅
- [x] EventBus workflow:
  - [x] Sales emite: `sales.completed` y `sales.order.placed` ✅
  - [x] Delivery escucha y crea order automáticamente ✅
  - [x] Handler `handleNewDeliveryOrder()` implementado ✅
  - [x] Usa `deliveryApi.createDeliveryFromSale()` ✅
- [x] Mocks eliminados: TopDriversTable usa datos reales ✅
- [x] Supabase integration: employees + delivery_assignments ✅
- [x] Métricas reales calculadas desde DB ✅
- [x] Zone validation (ya existe en `deliveryService.ts`) ✅

#### Route Optimization
- [x] TSP algorithm implemented (`routeOptimizationService.ts`) ✅
- [ ] Real-time traffic integration (opcional)
- [ ] Driver location tracking (GPS service disponible en `lib/tracking/`)

#### Real-time Tracking
- [x] GPS tracking service (`gpsTrackingService.ts`) ✅
- [ ] Customer notifications
- [ ] ETA calculations

**Tiempo Real**: 3 horas (2025-02-05)
**Commit**: `7185be2` - feat: complete delivery module
**Tests**: Pending - integration tests needed

---

### Semana 3: Materials ↔ Suppliers ↔ Production (P1)

**PREREQUISITO CRÍTICO**: Materials EventBus emissions implementados

#### Procurement Automation
- [ ] Stock alerts trigger supplier orders (3h)
  - [ ] Materials emite: `materials.low_stock_alert` ✅ (debe implementarse)
  - [ ] Supplier Orders escucha y valida
  - [ ] Auto-generate PO si auto-reorder enabled
  - [ ] Use Materials Public API: `getStockLevel()`
- [ ] EventBus: `suppliers.order.create` notification
- [ ] Supplier selection logic (ya existe en `supplierAnalysisEngine.ts`)

#### Production Integration
- [ ] Material consumption tracking (2h)
  - [ ] Production emite: `production.item_consumed`
  - [ ] Materials escucha y actualiza stock (listener ya existe en page.tsx:109)
  - [ ] Use Materials Public API: `updateStock(materialId, -quantity, 'production')`
- [ ] Automatic stock deduction
- [ ] Production planning based on inventory

**Estimado**: 1 semana
**Tests**: Integration tests **OBLIGATORIOS**

---

### Semana 4: Customers ↔ Memberships ↔ Billing (P2)

#### Membership Lifecycle
- [ ] Automatic billing for memberships
- [ ] Renewal reminders
- [ ] Member benefits application en Sales

#### CRM Integration
- [ ] Customer lifetime value calculations
- [ ] Segmentation based on memberships
- [ ] Targeted marketing

**Estimado**: 1 semana
**Tests**: Integration tests

---

## 🧪 Mes 3: Testing, Optimización y Producción (Abril 2025)

### Semana 1: Integration Test Suite

#### Test Coverage Goals
- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: All critical workflows
- [ ] E2E tests: User journeys principales

#### Critical Workflows to Test
1. [ ] **B2B Order → Credit Check → Approval → Fulfillment**
   - Test EventBus: `sales.b2b.credit_check_requested` → `finance.credit_check_completed`
2. [ ] **Stock Alert → Supplier Order → Receipt → Stock Update**
   - Test EventBus: `materials.low_stock_alert` → `supplier_orders.order.created` → `materials.stock_updated`
3. [ ] **Sale → Production → Material Consumption → Delivery**
   - Test EventBus: `sales.order.completed` → `production.item_consumed` → `delivery.order.assigned`
4. [ ] **Customer Registration → Membership → Recurring Billing**

**Estimado**: 1 semana
**Herramientas**: Vitest, Playwright

---

### Semana 2: Performance Optimization

#### Performance Audits
- [ ] Chrome DevTools performance traces
- [ ] Bundle size analysis
- [ ] Database query optimization
- [ ] EventBus performance profiling

#### Optimizations
- [ ] Code splitting improvements
- [ ] Lazy loading optimizations
- [ ] Image optimization
- [ ] API response caching

**Estimado**: 1 semana
**Tools**: Chrome DevTools MCP, Lighthouse

---

### Semana 3: Security Audit

#### Security Checklist
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication/Authorization audit
- [ ] Permission system validation
- [ ] Secrets management review

#### Compliance
- [ ] OWASP Top 10 compliance
- [ ] Data privacy (GDPR considerations)
- [ ] Financial data protection

**Estimado**: 1 semana
**Tools**: Security MCP, OWASP ZAP

---

### Semana 4: Production Deployment

#### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Deployment scripts tested

#### Deployment
- [ ] Database migrations
- [ ] Environment configuration
- [ ] Monitoring setup (Sentry, etc.)
- [ ] Backup procedures
- [ ] Rollback plan

#### Post-deployment
- [ ] Smoke tests
- [ ] Monitor errors
- [ ] User acceptance testing
- [ ] Performance monitoring

**Estimado**: 1 semana
**Critical**: Rollback plan must be ready

---

## 📋 Backlog (Post-MVP)

### Features Adicionales
- [ ] Workforce optimization (scheduling AI)
- [ ] Advanced reporting (custom dashboards)
- [ ] Mobile app (native iOS/Android)
- [ ] Multi-currency support
- [ ] Multi-language i18n
- [ ] API pública para integraciones

### Technical Debt Identified (2025-02-05)
- [ ] **Materials**: Integrate `lib/ml/forecasting.ts` (replace mock data)
- [ ] **Sales**: Complete B2B database tables
- [ ] **Finance**: Fix A/R aging placeholder logic
- [ ] **Sales + Scheduling**: Consolidate alerts to unified system
- [ ] **All modules**: Complete EventBus event emissions
- [ ] Migrate remaining Chakra v2 patterns
- [ ] Consolidate duplicate services
- [ ] Improve error messages
- [ ] Add more unit tests

---

## 🎯 Milestones (CORREGIDOS)

### Milestone 1: Core Modules Complete (End of Month 1)
**Original**: Sales, Materials, Customers fully functional
**Realidad**:
- ✅ Sales POS completo
- ⚠️ Sales B2B: Backend listo, UI faltante, DB missing
- ⚠️ Materials: UI completo, EventBus roto (eventos NO se emiten)
- ✅ Customers: Funcional

**Nuevo criterio**:
- [x] Sales POS fully functional
- [ ] Sales B2B database tables created
- [ ] Sales alerts using unified system
- [ ] Materials EventBus emissions implemented
- [ ] Materials cross-module listeners working
- [ ] Basic integrations working (EventBus validated)
- [ ] Unit tests passing

### Milestone 2: Full Integration (End of Month 2)
- All cross-module workflows operational
- Integration tests passing
- EventBus communication robust (eventos fluyen correctamente)
- Cross-module UI injections complete

### Milestone 3: Production Ready (End of Month 3)
- 80%+ test coverage
- Performance optimized
- Security validated
- Ready for deployment

---

## 📊 Métricas de Éxito

### Code Quality
- TypeScript: 0 errors ✅ (actualmente)
- ESLint: 0 warnings
- Test coverage: >80%
- Build size: <2MB (gzipped)

### Performance
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Largest Contentful Paint: <2.5s

### Business
- All 86 features activatable
- All 31 modules functional
- Cross-module workflows complete
- EventBus events flowing correctly **← NUEVO CRITERIO**
- Ready for multi-tenant deployment

---

## 🔄 Proceso de Actualización

Este roadmap se actualiza:
- **Semanalmente**: Revisar progreso, ajustar estimados
- **Después de cada sesión**: Marcar tareas completadas
- **Cuando hay blockers**: Documentar y re-priorizar
- **Después de investigaciones arquitectónicas**: Corregir estado real

**Última revisión**: 2025-02-05 (Architecture Investigation)
**Próxima revisión**: Después de Session 1 (EventBus emissions)

---

## 📝 Notas

- Las prioridades están marcadas: P0 (crítico), P1 (importante), P2 (deseable)
- Usar `/plan-session` para crear planes detallados de cada tarea
- **SIEMPRE** consultar `system-architect` antes de implementar features nuevas
- **SIEMPRE** ejecutar `gap-analyzer` después de cada integración
- Documentar decisiones importantes en SESSION_NOTES.md

### Lecciones Aprendidas (2025-02-05)
1. **No asumir implementación completa**: Materials declaraba events pero NO los emitía
2. **Validar cross-module flows**: EventBus debe testearse con listeners reales
3. **Unified Alerts System**: Materials es el patrón de referencia correcto
4. **Sales y Scheduling**: Deben refactorizarse para usar sistema unificado
5. **ML Library separation**: `lib/ml/` está bien diseñado pero Materials no lo usa aún
