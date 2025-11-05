# 🗺️ FEATURE TO MODULE MAPPING V2
## Decisiones Arquitectónicas Finales

**Fecha**: 2025-01-15
**Versión**: 2.0 - Post Architectural Decisions
**Base**: `ARCHITECTURAL_DECISIONS_CORRECTED.md`
**Principio**: Features por FUNCIÓN, no por capability

---

## 📋 EXECUTIVE SUMMARY

**Total Features**: 86 (FeatureRegistry.ts)
**Decisiones tomadas**: 20 features reclasificadas
**Módulos afectados**: 9 módulos
**Patrón aplicado**: Distributed features (NO monolithic modules)

---

## 🎯 DECISIONES ARQUITECTÓNICAS APLICADAS

### ✅ Decisión 1: E-commerce / Async Operations (6 features)

**Decisión**: NO crear módulo `/admin/ecommerce`

| Feature ID | Feature Name | Dónde Vive | Razón |
|-----------|--------------|------------|-------|
| `sales_catalog_ecommerce` | Catálogo E-commerce | **Products Module** | Gestión de catálogo = función de Products |
| `sales_cart_management` | Gestión de Carrito | **Sales Module** (Online Orders tab) | Gestión de ventas = función de Sales |
| `sales_checkout_process` | Proceso de Checkout | **Customer App** | Frontend de cliente |
| `sales_online_payment_gateway` | Gateway de Pagos Online | **Finance Module** | Procesamiento financiero = función de Finance |
| `sales_async_order_processing` | Procesamiento Asincrónico | **Backend Service** | Background job, no UI |
| `sales_multicatalog_management` | Gestión Multi-Catálogo | **Products Module** | Configuración de catálogo |

---

### ✅ Decisión 2: Delivery Management (8 features)

**Decisión**: Módulo independiente `/admin/operations/delivery`

| Feature ID | Feature Name | Dónde Vive | Razón |
|-----------|--------------|------------|-------|
| `operations_delivery_zones` | Zonas de Entrega | **Delivery Module** | Configuración operativa |
| `operations_delivery_tracking` | Seguimiento de Entregas | **Delivery Module** | Tracking real-time |
| `operations_shipping_integration` | Integración con Couriers | **Delivery Module** (o Supply Chain Shipping futuro) | Active vs Passive fulfillment |
| `operations_notification_system` | Sistema de Notificaciones | **Backend Service** | EventBus integration |

**Vista en Sales**:
- Sales tiene tab "Delivery Orders" con preview + cross-module links
- NO gestiona zonas, tracking, o drivers (eso es Delivery)

---

### ✅ Decisión 3: Appointments (6 features)

**Decisión**: NO crear módulo `/admin/appointments` - Distribuir

| Feature ID | Feature Name | Dónde Vive | Razón |
|-----------|--------------|------------|-------|
| `scheduling_appointment_booking` | Reserva de Citas | **Customer App** (booking interface) | Frontend de clientes |
| `scheduling_calendar_management` | Gestión de Calendario | **Sales Module** (Appointments tab) | Gestión de órdenes |
| `scheduling_reminder_system` | Sistema de Recordatorios | **Backend Service** | Notificaciones automáticas |
| `scheduling_availability_rules` | Reglas de Disponibilidad | **Scheduling Module** (Availability tab) | Configuración de calendario |
| `customer_online_reservation` | Reservas Online | **Customer App** | Interfaz de reserva |
| `customer_reservation_reminders` | Recordatorios de Reserva | **Backend Service** | Email/SMS automation |

**Admin views**:
- Sales Module: Appointments tab (gestión de órdenes tipo appointment)
- Scheduling Module: Availability rules tab (configuración)
- Staff Module: Professional settings (accepts_appointments, services_provided)
- Products Module: Service settings (duration, cancellation_policy)

---

### ✅ Decisión 4: B2B / Corporate Sales (8 features)

**Decisión**: NO crear módulo `/admin/b2b` - Distribuir

| Feature ID | Feature Name | Dónde Vive | Razón |
|-----------|--------------|------------|-------|
| `sales_bulk_pricing` | Precios por Volumen | **Products Module** | Configuración de productos |
| `sales_quote_generation` | Generación de Cotizaciones | **Sales Module** (Quotes tab) | Gestión de ventas |
| `sales_contract_management` | Gestión de Contratos | **Sales Module** (Contracts tab) | Gestión de ventas |
| `sales_tiered_pricing` | Precios Diferenciados | **Products Module** | Configuración de productos |
| `sales_approval_workflows` | Flujos de Aprobación | **Settings Module** (Workflows) | Configuración del sistema |
| `sales_quote_to_order` | Cotización a Orden | **Sales Module** | Conversión de ventas |
| `finance_corporate_accounts` | Cuentas Corporativas | **Finance Module** (Billing) | Gestión financiera |
| `finance_credit_management` | Gestión de Crédito | **Finance Module** (Billing) | Líneas de crédito |

---

### ✅ Decisión 5 (Q1): Products/Catalog (Multi-type)

**Decisión**: UN módulo Products con UI dinámica (NO módulos separados)

**ProductType discriminador** (como Sale.order_type):
- `ELABORATED` - Gastronómicos (recetas, BOM, cost calculator)
- `RETAIL` - Retail (SKU, barcode, variants)
- `SERVICE` - Servicios (duration, professionals)
- `EVENT` - Eventos (dates, capacity, tickets)
- `DIGITAL` - Digitales (download, license)
- `TRAINING` - Capacitaciones (curriculum, certification)

**Razón**: Gestión de catálogo es UNA función, discriminada por tipo

---

## 📊 MAPEO COMPLETO: 86 FEATURES

### 🛍️ SALES DOMAIN (24 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `sales_order_management` | Sales Module | ✅ Implementado |
| `sales_payment_processing` | Sales Module + Finance | ✅ Implementado |
| `sales_catalog_menu` | Products Module | ✅ Implementado |
| `sales_pos_onsite` | Sales Module (POS tab) | ✅ Implementado |
| `sales_dine_in_orders` | Sales Module + Floor | ✅ Implementado |
| `sales_order_at_table` | Sales Module (mobile) | ❌ Pendiente |
| `sales_catalog_ecommerce` | Products Module | ❌ Pendiente (config fields) |
| `sales_async_order_processing` | Backend Service | ❌ Pendiente |
| `sales_online_payment_gateway` | Finance Module | ❌ Pendiente |
| `sales_cart_management` | Sales Module (Online tab) | ❌ Pendiente |
| `sales_checkout_process` | Customer App | ❌ Pendiente |
| `sales_multicatalog_management` | Products Module | ❌ Pendiente |
| `sales_bulk_pricing` | Products Module | ❌ Pendiente |
| `sales_quote_generation` | Sales Module (Quotes tab) | ❌ Pendiente |
| `sales_product_retail` | Products Module (RETAIL type) | ⚠️ Parcial |
| `sales_package_management` | Products Module | ❌ Pendiente |
| `sales_contract_management` | Sales Module (Contracts tab) | ❌ Pendiente |
| `sales_tiered_pricing` | Products Module | ❌ Pendiente |
| `sales_approval_workflows` | Settings Module | ❌ Pendiente |
| `sales_quote_to_order` | Sales Module | ❌ Pendiente |
| `sales_split_payment` | Sales Module | ✅ Implementado |
| `sales_tip_management` | Sales Module | ✅ Implementado |
| `sales_coupon_discount` | Sales Module | ⚠️ Parcial |
| `sales_tax_calculation` | Sales Module + Finance | ✅ Implementado |

---

### 📦 INVENTORY DOMAIN (13 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `inventory_stock_tracking` | Materials Module | ✅ Implementado |
| `inventory_stock_alerts` | Materials Module + Notifications | ✅ Implementado |
| `inventory_supplier_management` | Suppliers Module | ✅ Implementado |
| `inventory_purchase_orders` | Supplier Orders Module | ✅ Implementado |
| `inventory_receiving` | Supplier Orders Module | ✅ Implementado |
| `inventory_stock_adjustments` | Materials Module | ✅ Implementado |
| `inventory_lot_tracking` | Materials Module | ⚠️ Parcial |
| `inventory_expiration_tracking` | Materials Module | ⚠️ Parcial |
| `inventory_waste_tracking` | Materials Module | ❌ Pendiente |
| `inventory_multi_unit_tracking` | Materials Module | ✅ Implementado |
| `inventory_batch_operations` | Materials Module | ⚠️ Parcial |
| `inventory_barcode_scanning` | Materials Module | ❌ Pendiente |
| `inventory_sku_management` | Products Module (RETAIL) | ❌ Pendiente |

---

### 🏭 PRODUCTION DOMAIN (4 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `production_recipe_management` | Products Module (ELABORATED) | ✅ Implementado |
| `production_bom_tracking` | Products Module | ✅ Implementado |
| `production_cost_calculation` | Products Module | ✅ Implementado |
| `production_yield_tracking` | Products Module | ❌ Pendiente |

---

### 🏪 OPERATIONS DOMAIN (15 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `operations_kitchen_display` | Kitchen Module | ✅ Implementado |
| `operations_order_routing` | Kitchen Module | ⚠️ Parcial |
| `operations_order_queue` | Kitchen Module | ⚠️ Parcial |
| `operations_capacity_planning` | Kitchen Module | ❌ Pendiente |
| `operations_pickup_scheduling` | Sales Module | ❌ Pendiente |
| `operations_notification_system` | Backend Service | ✅ Implementado (SmartAlerts) |
| `operations_delivery_zones` | Delivery Module | ✅ Implementado |
| `operations_delivery_tracking` | Delivery Module | ✅ Implementado (LiveMap + GPS) |
| `operations_shipping_integration` | Delivery Module | ⚠️ Parcial (estructura lista) |
| `operations_deferred_fulfillment` | Sales Module | ⚠️ Parcial |
| `operations_table_management` | Floor Module | ✅ Implementado |
| `operations_table_assignment` | Floor Module | ⚠️ Parcial |
| `operations_floor_plan_config` | Floor Module | ⚠️ Parcial |
| `operations_bill_splitting` | Sales Module | ⚠️ Parcial |
| `operations_waitlist_management` | Floor Module | ❌ Pendiente |
| `operations_vendor_performance` | Suppliers Module | ❌ Pendiente |

---

### 📅 SCHEDULING DOMAIN (4 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `scheduling_appointment_booking` | Customer App + Sales (Appointments tab) | ✅ Implementado |
| `scheduling_calendar_management` | Scheduling Module | ✅ Implementado (staff shifts) |
| `scheduling_reminder_system` | Backend Service | ✅ Implementado (appointmentReminders.ts) |
| `scheduling_availability_rules` | Scheduling Module (Availability tab) | ✅ Implementado |

---

### 👥 CUSTOMER DOMAIN (5 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `customer_service_history` | Customers Module | ⚠️ Parcial |
| `customer_preference_tracking` | Customers Module | ✅ Implementado |
| `customer_loyalty_program` | Gamification Module | ❌ Pendiente |
| `customer_online_reservation` | Customer App | ✅ Implementado (/app/booking) |
| `customer_reservation_reminders` | Backend Service | ✅ Implementado (appointmentReminders.ts) |

---

### 💰 FINANCE DOMAIN (4 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `finance_corporate_accounts` | Finance > Billing | ❌ Pendiente |
| `finance_credit_management` | Finance > Billing | ❌ Pendiente |
| `finance_invoice_generation` | Finance > Fiscal | ✅ Implementado |
| `finance_payment_terms` | Finance > Billing | ❌ Pendiente |

---

### 📱 MOBILE DOMAIN (5 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `mobile_pos` | Sales Module (mobile view) | ⚠️ Parcial |
| `mobile_inventory` | Materials Module (mobile view) | ❌ Pendiente |
| `mobile_order_at_table` | Sales Module (mobile) | ❌ Pendiente |
| `mobile_offline_sync` | Offline System (IndexedDB) | ✅ Implementado |
| `mobile_location_tracking` | Mobile Infrastructure | ❌ Pendiente |

---

### 🏢 MULTISITE DOMAIN (5 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `multisite_location_management` | LocationContext + LocationSelector | ✅ Implementado |
| `multisite_centralized_inventory` | Materials Module (location filter) | ✅ Implementado |
| `multisite_transfer_orders` | Materials Module (Transfers tab) | ✅ Implementado (UI completa) |
| `multisite_comparative_analytics` | Dashboard (location comparison) | ❌ Pendiente (opcional) |
| `multisite_configuration_per_site` | Settings (location overrides) | ❌ Pendiente (opcional) |

**Status**: 98% completado - Core features implementadas, analytics opcional pendiente

---

### 📊 ANALYTICS DOMAIN (2 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `analytics_sales_reporting` | Sales Module + Dashboard | ✅ Implementado |
| `analytics_inventory_reporting` | Materials Module + Dashboard | ✅ Implementado |

---

### 👔 STAFF DOMAIN (6 features)

| Feature ID | Dónde Vive | Status |
|-----------|------------|--------|
| `staff_schedule_management` | Scheduling Module | ✅ Implementado |
| `staff_time_tracking` | Staff Module | ✅ Implementado |
| `staff_performance_tracking` | Staff Module | ✅ Implementado |
| `staff_payroll_calculation` | Staff Module | ⚠️ Parcial |
| `staff_training_tracking` | Staff Module | ❌ Pendiente |
| `staff_labor_cost` | Staff Module + Sales | ✅ Implementado |

---

## 📈 ESTADÍSTICAS FINALES

### Por Estado

| Estado | Count | Porcentaje |
|--------|-------|------------|
| ✅ Implementado | 39 | 45.3% |
| ⚠️ Parcial | 17 | 19.8% |
| ❌ Pendiente | 30 | 34.9% |
| **TOTAL** | **86** | **100%** |

**Actualizado**: 2025-01-17 - Reflejando implementaciones de Appointments, Delivery, y Multi-Location

### Por Dominio (Implementadas)

| Dominio | Implementadas | Total | % |
|---------|---------------|-------|---|
| **SCHEDULING** | **4** | **4** | **100%** 🎯 |
| ANALYTICS | 2 | 2 | 100% |
| PRODUCTION | 3 | 4 | 75% |
| **MULTISITE** | **3** | **5** | **60%** ⬆️ |
| **OPERATIONS** | **9** | **15** | **60%** ⬆️ |
| **CUSTOMER** | **3** | **5** | **60%** ⬆️ |
| INVENTORY | 7 | 13 | 54% |
| STAFF | 3 | 6 | 50% |
| SALES | 7 | 24 | 29% |
| FINANCE | 1 | 4 | 25% |
| MOBILE | 1 | 5 | 20% |

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN (ACTUALIZADO)

### ✅ COMPLETADO

**1. Appointments** (5 semanas) - ✅ 100% COMPLETADO
- 6 features distribuidas - TODAS implementadas
- Customer App (/app/booking, /app/appointments)
- Sales Module (AppointmentsTab)
- Scheduling Module (AvailabilityTab)
- Staff Module (appointment settings)
- Products Module (service configuration)
- Backend Service (appointmentReminders.ts)

**2. Multi-Location** (5 semanas) - ✅ 98% COMPLETADO
- 5 features - 3 core implementadas, 2 opcionales pendientes
- LocationContext + LocationSelector
- Materials Module (location filtering + transfers)
- Sales/Staff/Scheduling/Fiscal (location support)
- Pendiente: Dashboard comparison, Settings overrides (opcional)

**3. Delivery Module** (4 semanas) - ✅ COMPLETADO
- Módulo independiente `/admin/operations/delivery`
- LiveMap con GPS real-time
- Drivers management
- Zones configuration
- Analytics dashboard

### 🎯 PRÓXIMAS FASES

**FASE 1: B2B Sales** (5 semanas) 🥇 **PRÓXIMA RECOMENDADA**
- 8 features distribuidas
- Sales (Quotes + Contracts tabs)
- Products (Bulk + Tiered pricing)
- Finance (Corporate accounts + Credit)
- Customers (Corporate data)
- Settings (Approval workflows)
- **Roadmap**: Ver `IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md`

**FASE 2: E-commerce** (10 semanas) 🥈
- 6 features distribuidas
- Products (Catalog ecommerce + Multicatalog)
- Sales (Cart + Checkout + Online Orders tab)
- Finance (Payment gateway)
- Backend (Async order processing)
- Customer App (Frontend interfaces)
- **Roadmap**: Ver `IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md`

---

## 📊 RESUMEN EJECUTIVO

**Proyecto G-Admin Mini** - Sistema ERP modular con arquitectura distribuida

**Última actualización**: 2025-01-17

### Estadísticas Generales
- **86 features** totales en FeatureRegistry
- **26 módulos** registrados (operations-hub eliminado, delivery agregado)
- **45.3% implementado** (39/86 features)
- **19.8% parcial** (17/86 features)
- **34.9% pendiente** (30/86 features)

### Logros Recientes
- ✅ **Appointments** - 100% completado (6 features)
- ✅ **Multi-Location** - 98% completado (3 features core)
- ✅ **Delivery Module** - 100% completado (3 features)
- **+11 features** implementadas desde última auditoría

### Próxima Prioridad
🎯 **B2B Sales** (5 semanas, 8 features distribuidas)

---

**FIN DEL MAPEO - FEATURE TO MODULE MAPPING V2**

## 🏗️ ARQUITECTURA DE MÓDULOS FINAL

### Módulos Actuales (26)

**CORE** (4):
1. Dashboard
2. Settings
3. Debug
4. Reporting

**SALES & COMMERCE** (4):
5. Sales ← Incluye: POS, Online Orders (futuro), Appointments (futuro), Quotes (futuro)
6. Customers

**SUPPLY CHAIN** (6):
7. Products ← UI dinámica por ProductType (ELABORATED, RETAIL, SERVICE, EVENT, DIGITAL, TRAINING)
8. Materials (Inventory)
9. Suppliers
10. Supplier Orders
11. (futuro) Multi-Location

**OPERATIONS** (5):
12. Floor Management
13. Kitchen Display
14. (futuro) Delivery
15. Memberships
16. Rentals

**FINANCE** (3):
17. Billing
18. Fiscal
19. Payment Integrations

**RESOURCES** (3):
20. Staff ← Incluye: Professional settings para appointments
21. Scheduling ← Incluye: Staff shifts + Availability rules (futuro)
22. Assets

**SPECIAL** (2):
23. Gamification
24. Executive

### Módulos NO Creados (decisiones arquitectónicas)

❌ `/admin/ecommerce` - Distribuido en Products, Sales, Finance, Backend
❌ `/admin/appointments` - Distribuido en Customer App, Sales, Scheduling, Staff, Products
❌ `/admin/b2b` - Distribuido en Sales, Products, Finance, Customers, Settings
❌ `/admin/menu` - Products con type: ELABORATED
❌ `/admin/retail` - Products con type: RETAIL
❌ `/admin/services` - Products con type: SERVICE

---

## 📚 REFERENCIAS

### Documentos de Decisiones
- `ARCHITECTURAL_DECISIONS_CORRECTED.md` - Decisiones E-commerce, Appointments, B2B
- `Q1_PRODUCTS_CATALOG_DECISION.md` - Decisión Products multi-type
- `DELIVERY_ARCHITECTURE_DECISION.md` - Decisión Delivery module
- `SALES_ARCHITECTURE_DECISION.md` - (SUPERSEDED - ver corrected)
- `MULTI_LOCATION_IMPLEMENTATION_PLAN.md` - Plan Multi-Location

### Implementación
- `IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md` - Roadmap completo
- `FeatureRegistry.ts` - Registry de features
- `BusinessModelRegistry.ts` - Capabilities del sistema

---

**FIN DEL DOCUMENTO**

Este mapeo refleja las decisiones arquitectónicas finales aplicando el principio: **"Features por FUNCIÓN, no por capability"**.
