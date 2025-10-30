# 🏗️ PLAN MAESTRO DE ARQUITECTURA DEL SISTEMA
## G-Admin Mini - Reorganización Integral 2025

**Fecha**: 2025-01-14
**Versión**: 1.0 - Análisis Integral
**Estado**: 🎯 Plan Estratégico Definitivo
**Autor**: Análisis arquitectónico completo

---

## 📋 TABLA DE CONTENIDOS

1. [Diagnóstico del Problema Real](#diagnóstico-del-problema-real)
2. [Análisis de Capabilities vs Módulos](#análisis-de-capabilities-vs-módulos)
3. [Módulos Faltantes Identificados](#módulos-faltantes-identificados)
4. [Arquitectura de Productos/Servicios](#arquitectura-de-productosservicios)
5. [Arquitectura de Fulfillment](#arquitectura-de-fulfillment)
6. [Criterios de Organización](#criterios-de-organización)
7. [Propuesta de Estructura Final](#propuesta-de-estructura-final)
8. [Plan de Implementación](#plan-de-implementación)

---

## 🔴 DIAGNÓSTICO DEL PROBLEMA REAL

### El Problema NO es de Nomenclatura

Has identificado correctamente que **los documentos anteriores se enfocaban en nombres y apariencia**, cuando el verdadero problema es **arquitectónico y estructural**:

#### Problemas Reales Identificados:

1. **Capabilities sin Módulos**
   - 86 features definidas en `FeatureRegistry.ts`
   - Solo ~24 módulos existentes
   - **GAP**: Muchas features no tienen UI/módulo que las soporte

2. **Dualidad/Multiplicidad Sin Resolver**
   - Productos: físicos, digitales, eventos, servicios, retail, gastronómicos
   - Fulfillment: onsite, pickup, delivery, async, appointment-based
   - **No existe arquitectura que maneje estas combinaciones**

3. **Conflictos de Nombres Son Síntoma, No Causa**
   - "Inventory" vs "Materials" → Refleja indecisión sobre alcance del módulo
   - "Products" → No refleja que maneja 6 tipos diferentes de productos
   - **El problema es que no están separados arquitectónicamente**

4. **Crecimiento Sin Planificación**
   - Módulos creados "de apurado" (Memberships, Rentals, Assets)
   - Sin features claras en FeatureRegistry
   - Sin integración con capabilities del setup wizard

5. **Duplicación Funcional**
   - `/admin/reporting` + `/admin/tools/reporting` + `/admin/settings/reporting`
   - Intelligence + Reporting + Executive → Todos analytics, sin separación clara
   - **Refleja falta de arquitectura de analytics unificada**

---

## 📊 ANÁLISIS DE CAPABILITIES VS MÓDULOS

### Capabilities del Sistema (BusinessModelRegistry)

El sistema tiene **10 capabilities principales** + **4 infrastructure types**:

#### Capabilities de Fulfillment (Cómo se entregan productos/servicios):
1. ✅ **onsite_service** → Servicio en local (mesas, cabinas)
2. ✅ **pickup_orders** → Retiro en local
3. ⚠️ **delivery_shipping** → Delivery/shipping (PARCIAL - falta módulo dedicado)
4. ⚠️ **async_operations** → E-commerce 24/7 (PARCIAL - falta módulo dedicado)

#### Capabilities de Production:
5. ⚠️ **requires_preparation** → Producción/manufactura (FALTA UI completa)

#### Capabilities de Service Mode:
6. ⚠️ **appointment_based** → Servicios con cita (PARCIAL - scheduling existe pero no módulo appointments)
7. ✅ **walkin_service** → Servicios walk-in

#### Capabilities de Special Operations:
8. ❌ **corporate_sales** → B2B (FALTA módulo completo)
9. ❌ **mobile_operations** → Food truck, operaciones móviles (FALTA módulo completo)

#### Infrastructure:
10. ✅ **single_location** → Local único
11. ❌ **multi_location** → Múltiples locales (FALTA módulo completo)
12. ❌ **mobile_business** → Negocio móvil (FALTA módulo)
13. ⚠️ **online_only** → Solo online (PARCIAL)

---

## 🚨 MÓDULOS FALTANTES IDENTIFICADOS

### Análisis de GAPs por Capability

| Capability | Features Activadas | Módulos Actuales | Módulos Faltantes |
|------------|-------------------|------------------|-------------------|
| **onsite_service** | 16 features | ✅ Sales, Operations Hub, Staff, Scheduling | Ninguno |
| **pickup_orders** | 11 features | ✅ Sales, Operations Hub | ❌ **Pickup Management** (scheduling, notifications) |
| **delivery_shipping** | 15 features | ⚠️ Operations Hub (parcial) | ❌ **Delivery Management** (zonas, tracking, couriers) |
| **async_operations** | 11 features | ⚠️ Sales (no tiene e-commerce) | ❌ **E-commerce** (cart, checkout, async) |
| **requires_preparation** | 15 features | ⚠️ Products (solo recipes) | ❌ **Production** (UI para KDS, queue, capacity) |
| **appointment_based** | 9 features | ⚠️ Scheduling (shifts, no appointments) | ❌ **Appointments** (booking, calendar, reminders) |
| **walkin_service** | 3 features | ✅ Staff | Ninguno (simple) |
| **corporate_sales** | 14 features | ❌ Ninguno | ❌ **B2B Sales** (quotes, contracts, approvals, corporate accounts) |
| **mobile_operations** | 5 features | ❌ Ninguno | ❌ **Mobile POS** (offline, location tracking, routes) |
| **multi_location** | 5 features | ❌ Ninguno | ❌ **Multi-Location** (transfers, comparative, per-site config) |

### Módulos Nuevos Requeridos (Prioridad)

#### 🔴 **ALTA PRIORIDAD** (Bloquean capabilities principales):

1. **E-commerce Module** (`/admin/ecommerce`)
   - **Capability**: `async_operations`
   - **Features**: cart, checkout, async processing, online payments, catalog management
   - **Decisión**: ¿Módulo independiente o mega-tab en Sales?
   - **Recomendación**: **Módulo independiente** - Suficientemente diferente de POS

2. **Delivery Management** (`/admin/delivery`)
   - **Capability**: `delivery_shipping`
   - **Features**: zonas, tracking, courier integrations, routes
   - **Decisión**: ¿Módulo independiente, tab en Sales, o tab en Operations?
   - **Recomendación**: **Módulo independiente** - Complejidad logística alta

3. **Production Module** (UI) (`/admin/production`)
   - **Capability**: `requires_preparation`
   - **Features**: Kitchen Display System (KDS), order queue, capacity planning
   - **Decisión**: ¿UI independiente, tab en Products, o tab en Operations?
   - **Recomendación**: **Tab en Operations Hub** - Está ligado a operaciones diarias

4. **B2B Sales Module** (`/admin/b2b` o `/admin/corporate-sales`)
   - **Capability**: `corporate_sales`
   - **Features**: quotes, contracts, approvals, corporate accounts, bulk pricing
   - **Decisión**: ¿Módulo independiente o mega-tab en Sales?
   - **Recomendación**: **Módulo independiente** - Workflow muy diferente a retail/restaurante

#### 🟡 **MEDIA PRIORIDAD** (Mejoran experiencia):

5. **Appointments Module** (`/admin/appointments`)
   - **Capability**: `appointment_based`
   - **Features**: booking, calendar, reminders, service history
   - **Decisión**: ¿Separar de Scheduling o consolidar?
   - **Recomendación**: **Tab en Scheduling** - Comparte calendario y lógica

6. **Multi-Location Module** (`/admin/locations` o `/admin/sites`)
   - **Capability**: `multi_location`
   - **Features**: location mgmt, transfers, comparative analytics, per-site config
   - **Decisión**: ¿Módulo independiente o infrastructure config?
   - **Recomendación**: **Módulo independiente** - Core para cadenas/franquicias

#### 🟢 **BAJA PRIORIDAD** (Edge cases):

7. **Mobile POS Module** (`/admin/mobile-pos`)
   - **Capability**: `mobile_operations`
   - **Features**: offline POS, location tracking, route planning, mobile sync
   - **Decisión**: ¿Módulo independiente o mega-tab en Sales?
   - **Recomendación**: **Future** - Edge case (food trucks)

---

## 🎨 ARQUITECTURA DE PRODUCTOS/SERVICIOS

### El Problema de "Products"

Has identificado correctamente que **"Products" es un nombre demasiado genérico** para un módulo que debe manejar:

- Productos gastronómicos (con recetas, BOM)
- Productos retail (SKU, variantes, sin recetas)
- Servicios (horas, profesionales)
- Eventos (fechas, capacidad)
- Productos digitales (descargables, licencias)
- Capacitaciones (cursos, certificaciones)

### Propuesta de Arquitectura Multi-Tipo

#### Opción A: Módulo Único con Tipos (❌ NO RECOMENDADO)

```
Products (módulo único)
├── Tab: Gastronómicos (con recipes)
├── Tab: Retail (SKU, variantes)
├── Tab: Servicios
├── Tab: Eventos
├── Tab: Digitales
└── Tab: Capacitaciones
```

**Problemas**:
- Sobrecarga cognitiva (6 tabs)
- Lógica muy diferente en mismo módulo
- Difícil mantener

#### Opción B: Módulos Separados por Dominio (⚠️ DEMASIADA SEPARACIÓN)

```
Menu (gastronómicos)
Catalog (retail)
Services (servicios profesionales)
Events (eventos)
Digital Products (productos digitales)
Training (capacitaciones)
```

**Problemas**:
- Demasiados módulos (6 nuevos)
- Fragmentación excesiva
- Usuario confundido

#### Opción C: Módulo Catalog + Business Model Context ✅ **RECOMENDADO**

```
Catalog (módulo único, UI dinámica)
├── Tipos de producto detectados automáticamente por capabilities activas
├── UI adapta campos según tipo:
│   - Gastronómico → muestra recipe, BOM, cost calculator
│   - Retail → muestra SKU, variants, barcode
│   - Servicio → muestra duration, professionals
│   - Evento → muestra dates, capacity, tickets
│   - Digital → muestra download, license
│   - Training → muestra curriculum, certification
└── Filtros inteligentes por tipo activo
```

**Ventajas**:
- ✅ Un solo módulo en navegación ("Catalog")
- ✅ UI dinámica según context
- ✅ Escalable (agregar tipos sin cambiar arquitectura)
- ✅ Menos confusión para usuario

**Implementación**:
```typescript
// Pseudo-código
const CatalogPage = () => {
  const activeProductTypes = useCapabilityStore(state =>
    state.getActiveProductTypes() // ['gastronomic', 'retail', 'services']
  );

  return (
    <ContentLayout>
      {/* Tabs solo para tipos activos */}
      {activeProductTypes.includes('gastronomic') && (
        <Tab>Menu Items</Tab>
      )}
      {activeProductTypes.includes('retail') && (
        <Tab>Retail Products</Tab>
      )}
      {/* ... etc */}
    </ContentLayout>
  );
};
```

---

## 🚚 ARQUITECTURA DE FULFILLMENT

### El Problema de Delivery y Múltiples Canales

Similar a Products, el sistema debe manejar múltiples formas de cumplimiento:

1. **Onsite** - Consumo en local (mesas)
2. **Pickup** - Retiro en local (cliente va)
3. **Delivery** - Envío a domicilio (courier/delivery)
4. **Shipping** - Correo/transportista (productos físicos)
5. **Digital** - Descarga/email (productos digitales)
6. **Appointment** - Por cita (servicios profesionales)

### Propuesta de Arquitectura

#### Opción A: Un Módulo por Canal (❌ NO RECOMENDADO)

```
Onsite Orders
Pickup Orders
Delivery Orders
Shipping Orders
Digital Downloads
Appointments
```

**Problemas**:
- 6 módulos nuevos
- Duplicación de lógica (todos son "orders")
- Confusión de usuario

#### Opción B: Sales Mega-Módulo (⚠️ SOBRECARGA)

```
Sales (todo en uno)
├── POS (onsite)
├── Pickup
├── Delivery
├── Shipping
├── E-commerce
└── Appointments
```

**Problemas**:
- Demasiadas tabs (6+)
- Sales POS vs E-commerce son muy diferentes

#### Opción C: Separación Lógica por Workflow ✅ **RECOMENDADO**

```
MÓDULOS INDEPENDIENTES (workflows muy diferentes):
1. Sales (POS) → Onsite, pickup walk-in
2. E-commerce → Async orders, cart, checkout
3. Delivery → Zonas, tracking, routes
4. Appointments → Booking, calendar, services

SHARED LOGIC:
- Order Management (shared entre todos)
- Payment Processing (shared entre todos)
- Customer Data (shared entre todos)
```

**Ventajas**:
- ✅ Workflows claramente separados
- ✅ Cada módulo enfocado en una tarea
- ✅ Lógica compartida en servicios

---

## 📐 CRITERIOS DE ORGANIZACIÓN

### ¿Módulo vs Tab vs Feature?

Basándome en tu feedback y el análisis de complejidad, propongo estos criterios:

#### ES UN **MÓDULO INDEPENDIENTE** si cumple:

1. ✅ **Workflow distintivo** - Lógica de negocio significativamente diferente
   - Ejemplo: Sales POS ≠ E-commerce (uno es síncrono, otro asíncrono)
   - Ejemplo: Inventory ≠ Production (uno almacena, otro transforma)

2. ✅ **Entidad principal propia** - Tiene tabla(s) principal(es) en DB
   - Ejemplo: `customers`, `products`, `staff`, `orders`

3. ✅ **UI compleja (>1000 LOC)** - Justifica módulo separado
   - Ejemplo: Sales tiene POS completo, cart, checkout, etc.

4. ✅ **Usuario lo busca por nombre** - Es un "destino" en navegación
   - Ejemplo: Usuario piensa "voy a Sales" o "voy a Inventory"

5. ✅ **Puede funcionar independiente** (excepto core dependencies)
   - Ejemplo: Customers puede funcionar sin Sales activo
   - Ejemplo: Delivery NO puede funcionar sin Sales (es dependiente)

#### ES UN **TAB/SUB-MÓDULO** si cumple:

1. ✅ **Comparte contexto** con módulo padre
   - Ejemplo: Appointments comparte calendario con Scheduling
   - Ejemplo: KDS comparte operaciones con Operations Hub

2. ✅ **UI mediana (300-1000 LOC)** - Suficiente para pantalla propia
   - Ejemplo: Settings > Integrations

3. ✅ **Workflow relacionado** pero no idéntico al padre
   - Ejemplo: Purchase Orders relacionado a Suppliers (mismo dominio supply chain)

4. ✅ **Usuario lo busca dentro de contexto**
   - Ejemplo: "Voy a Operations > Kitchen Display"

#### ES UNA **FEATURE** si cumple:

1. ✅ **UI pequeña (<300 LOC)** - Campos adicionales o botón
   - Ejemplo: "Tip Management" → Un campo en Sales POS

2. ✅ **Toggle on/off** por capability
   - Ejemplo: "Barcode Scanning" → Activado solo si tienes scanners

3. ✅ **No justifica navegación separada**
   - Ejemplo: "Split Payment" → Funcionalidad en payment screen

---

## 🗂️ APLICANDO CRITERIOS A CASOS ESPECÍFICOS

### Caso 1: Inventory vs Materials vs Assets

**Problema identificado correctamente**:
- "Inventory" puede significar materiales primos O máquinas O utensilios
- Necesitas manejar AMBOS en el sistema

**Solución Propuesta**:

```
MÓDULOS SEPARADOS:

1. Inventory (id: 'inventory') → Materiales/insumos consumibles
   - Seguimiento de stock
   - Compras a proveedores
   - Vencimientos, lotes
   - FIFO/FEFO
   - Usado para PRODUCCIÓN

2. Assets (id: 'assets') → Equipos, máquinas, utensilios (NO consumibles)
   - Registro de activos
   - Mantenimiento programado
   - Depreciación
   - Asignación a locaciones
   - Usado para OPERACIÓN

RAZÓN:
- Workflows completamente diferentes
- Inventory se "consume", Assets se "mantienen"
- Diferentes tablas DB (materials vs assets)
- Usuario los busca separadamente ("Necesito ver inventario" vs "Necesito ver equipos")
```

**Renombramiento**:
- `materials` → `inventory` ✅
- `assets` → Mantener ✅ (es correcto)

### Caso 2: Supplier Orders vs Purchase Orders

**Tu preocupación**: ¿Conflicto con otros tipos de "orders"?

**Análisis**:
- "Order" en el sistema:
  - **Sales Orders** (ventas a clientes)
  - **Purchase Orders** (compras a proveedores)
  - **Production Orders** (órdenes de producción internas)
  - **Transfer Orders** (transferencias entre locaciones - multi-site)

**Solución**:
- "Purchase Orders" es el nombre estándar correcto ✅
- NO hay conflicto porque contexto es claro:
  - Sales Orders → En módulo Sales
  - Purchase Orders → En módulo Supply Chain (junto a Suppliers)
  - Production Orders → En módulo Production
  - Transfer Orders → En módulo Multi-Location

**Renombramiento**:
- `supplier-orders` → `purchase-orders` ✅

### Caso 3: Operations Hub → Floor Management

**Tu feedback**: "Me parece buena idea cambiarlo a **Operations Hub**"

**Análisis**:
- "Operations Hub" es MÁS GENÉRICO que "Floor Management"
- Hub implica centro de múltiples operaciones
- Floor Management es específico a restaurantes con piso/mesas

**Propuesta según capabilities**:

```
Operations (id: 'operations', nombre dinámico)
├── Cuando tiene 'onsite_service' → "Floor & Tables"
├── Cuando tiene 'pickup_orders' → "Pickup Management"
├── Cuando tiene 'delivery_shipping' → "Delivery Operations"
├── Cuando tiene 'requires_preparation' → "Kitchen Display"
└── General → "Operations Hub"
```

**Decisión**:
- Mantener `operations-hub` como ID ✅
- Nombre display dinámico según capabilities activas
- Tabs internos según features

### Caso 4: Memberships, Rentals - ¿Módulos o Features?

**Tu preocupación**: Creados "de apurado", sin features claras

**Análisis**:

#### Memberships:
- **Capability relacionada**: `customer_loyalty_program` (existe en FeatureRegistry)
- **Pero**: Loyalty ≠ Memberships
  - Loyalty = puntos, rewards por compras
  - Memberships = planes pagos recurrentes (gym, club, suscripciones)

**Decisión**:
```
¿Es módulo independiente?
✅ Workflow distintivo - Suscripciones recurrentes, billing automático
✅ Entidad propia - tabla `memberships`, `membership_plans`
✅ UI compleja - Plans, tiers, billing cycles, member portal
✅ Usuario lo busca por nombre - "Voy a Memberships"

VEREDICTO: ✅ MÓDULO INDEPENDIENTE
ACCIÓN: Agregar features al FeatureRegistry:
  - 'membership_plan_management'
  - 'membership_recurring_billing'
  - 'membership_tier_benefits'
  - 'membership_cancellation_management'
```

#### Rentals:
- **Capability relacionada**: No existe actualmente
- **Casos de uso**: Alquiler de equipos, espacios, productos

**Decisión**:
```
¿Es módulo independiente?
✅ Workflow distintivo - Reservas por tiempo, devoluciones, penalidades
✅ Entidad propia - tabla `rentals`, `rental_items`, `rental_bookings`
✅ UI compleja - Calendar, availability, pricing by duration
✅ Usuario lo busca por nombre - "Voy a Rentals"

VEREDICTO: ✅ MÓDULO INDEPENDIENTE
ACCIÓN: Agregar features al FeatureRegistry:
  - 'rental_item_management'
  - 'rental_booking_calendar'
  - 'rental_availability_tracking'
  - 'rental_pricing_by_duration'
  - 'rental_late_fees'
```

**Ubicación en navegación**:
- Ambos son **servicios adicionales** (no core business)
- Dominio: `operations` (operaciones comerciales extendidas)

---

## 🎯 PROPUESTA DE ESTRUCTURA FINAL

### Dominios Propuestos (6 dominios)

Basándome en el análisis completo:

```
🏠 CORE (4 módulos)
   - Dashboard
   - Settings
   - Debug
   - Reporting & Intelligence (consolidado)

🛍️ SALES & COMMERCE (4 módulos)
   - Sales (POS)
   - E-commerce (NUEVO)
   - B2B Sales (NUEVO)
   - Customers (CRM)

📦 SUPPLY CHAIN (6 módulos)
   - Inventory (renombrado de materials)
   - Products/Catalog (UI dinámica por tipo de producto)
   - Suppliers
   - Purchase Orders (renombrado de supplier-orders)
   - Production (UI - NUEVO)
   - Multi-Location (NUEVO - solo si capability activa)

🏪 OPERATIONS (5 módulos)
   - Operations Hub (tabs dinámicos: Floor, Pickup, Kitchen)
   - Delivery (NUEVO - zonas, tracking)
   - Appointments (NUEVO - o tab en Scheduling)
   - Memberships
   - Rentals

💰 FINANCE (3 módulos)
   - Billing
   - Fiscal (AFIP)
   - Payment Integrations

👥 RESOURCES (3 módulos)
   - Staff
   - Scheduling
   - Assets (equipos, NO consumibles)

🎮 SPECIAL (2 módulos)
   - Gamification
   - Mobile POS (NUEVO - solo si capability activa)
```

### Total de Módulos

- **Actuales**: 24 módulos
- **Nuevos requeridos**: 7 módulos (E-commerce, B2B, Delivery, Production UI, Appointments, Multi-Location, Mobile POS)
- **Consolidaciones**: -4 (Intelligence + Reporting + Executive → Reporting & Intelligence)
- **TOTAL FINAL**: **27 módulos**

---

## 📋 LISTA COMPLETA DE MÓDULOS (27)

### CORE (4)
1. ✅ Dashboard
2. ✅ Settings
3. ✅ Debug
4. 🔄 **Analytics & Insights** (consolidar: Reporting + Intelligence + Executive)

### SALES & COMMERCE (4)
5. ✅ Sales (POS)
6. 🆕 **E-commerce**
7. 🆕 **B2B Sales**
8. ✅ Customers

### SUPPLY CHAIN (6)
9. 🔄 **Inventory** (renombrar: materials → inventory)
10. 🔄 **Catalog** (renombrar: products → catalog, UI dinámica)
11. ✅ Suppliers
12. 🔄 **Purchase Orders** (renombrar: supplier-orders → purchase-orders)
13. 🆕 **Production** (UI nueva para KDS, queue, capacity)
14. 🆕 **Multi-Location** (solo si capability activa)

### OPERATIONS (5)
15. ✅ Operations Hub (tabs dinámicos)
16. 🆕 **Delivery** (zonas, tracking, couriers)
17. 🆕 **Appointments** (o tab en Scheduling)
18. 🔄 **Memberships** (agregar features al registry)
19. 🔄 **Rentals** (agregar features al registry)

### FINANCE (3)
20. ✅ Billing
21. ✅ Fiscal
22. ✅ Payment Integrations

### RESOURCES (3)
23. ✅ Staff
24. ✅ Scheduling
25. ✅ Assets

### SPECIAL (2)
26. ✅ Gamification
27. 🆕 **Mobile POS** (solo si capability activa)

**Leyenda**:
- ✅ Existe y está bien
- 🔄 Existe pero necesita cambios (renombrar, agregar features)
- 🆕 Nuevo, debe crearse

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: Auditoría y Documentación (1-2 días)

**Objetivo**: Mapeo completo de componentes existentes

#### Tareas:
1. ✅ Analizar capabilities vs módulos (COMPLETADO)
2. 🔄 Crear inventario de componentes por módulo existente
   - Leer cada `page.tsx` y listar componentes internos
   - Identificar si usan tabs, subrutas, o página única
   - Mapear features implementadas vs features en registry
3. 📝 Documentar decisiones arquitectónicas (este documento)

**Entregable**: `COMPONENT_INVENTORY_BY_MODULE.md`

---

### FASE 2: Normalización de Módulos Existentes (2-3 días)

**Objetivo**: Estandarizar estructura actual antes de agregar nuevos

#### Tareas:

1. **Renombramientos** (sin cambiar funcionalidad):
   - `materials` → `inventory`
   - `supplier-orders` → `purchase-orders`
   - `products` → `catalog` (preparar para UI dinámica)
   - `operations-hub` → Mantener, pero mejorar tabs dinámicos

2. **Consolidación de Analytics**:
   - Fusionar `reporting` + `intelligence` + `executive` → `analytics`
   - Crear estructura de tabs:
     - Reports (custom report builder)
     - Market (competitive intelligence)
     - Executive (KPIs consolidados)

3. **Agregar Features Faltantes al FeatureRegistry**:
   - Memberships: 4 features nuevas
   - Rentals: 5 features nuevas
   - Assets: 4 features nuevas

4. **Eliminar Rutas Duplicadas**:
   - Eliminar `/admin/tools/reporting` (consolidar en `/admin/analytics`)
   - Eliminar `/admin/settings/reporting` (mover a `/admin/analytics`)
   - Verificar NO hay otras duplicaciones

---

### FASE 3: Definir Arquitecturas Complejas (3-4 días)

**Objetivo**: Diseñar soluciones para Products y Fulfillment

#### Tarea 3A: Arquitectura de Catalog (Products Multi-Tipo)

**Investigación**:
1. Revisar código actual de `products/page.tsx`
2. Identificar qué tipos de producto ya soporta
3. Listar componentes específicos por tipo (RecipeBuilder, SKUManager, etc.)

**Diseño**:
1. Crear `ProductTypeRegistry.ts` similar a FeatureRegistry
   ```typescript
   const PRODUCT_TYPES = {
     'gastronomic': {
       id: 'gastronomic',
       name: 'Gastronómicos',
       requiredCapabilities: ['requires_preparation'],
       components: {
         form: GastronomicProductForm,
         fields: RecipeFields,
         calculator: RecipeCostCalculator
       }
     },
     'retail': { /* ... */ },
     'service': { /* ... */ },
     'event': { /* ... */ },
     'digital': { /* ... */ },
     'training': { /* ... */ }
   };
   ```

2. Crear `CatalogPage` con tabs dinámicos
   ```tsx
   const CatalogPage = () => {
     const activeTypes = useProductTypes();
     return (
       <ContentLayout>
         <Tabs>
           {activeTypes.map(type => (
             <Tab key={type.id}>{type.name}</Tab>
           ))}
         </Tabs>
       </ContentLayout>
     );
   };
   ```

**Entregable**: `CATALOG_ARCHITECTURE_DESIGN.md`

#### Tarea 3B: Arquitectura de Fulfillment

**Investigación**:
1. Revisar features de delivery, pickup, async en FeatureRegistry
2. Analizar cómo Sales actual maneja fulfillment
3. Identificar lógica compartida vs específica

**Diseño**:
1. Crear módulos faltantes (E-commerce, Delivery, Appointments)
2. Definir servicios compartidos:
   ```typescript
   // services/orders/OrderService.ts
   class OrderService {
     createOrder(type: 'onsite' | 'pickup' | 'delivery' | 'ecommerce' | 'appointment') {
       // Lógica compartida
     }
   }
   ```

3. Definir cómo cada módulo extiende la base
   ```
   Sales (POS) → OrderService + OnsiteLogic
   E-commerce → OrderService + CartLogic + AsyncProcessing
   Delivery → OrderService + RouteLogic + TrackingLogic
   Appointments → OrderService + CalendarLogic + BookingLogic
   ```

**Entregable**: `FULFILLMENT_ARCHITECTURE_DESIGN.md`

---

### FASE 4: Crear Módulos Nuevos (Alta Prioridad) (5-7 días)

**Objetivo**: Implementar módulos críticos para capabilities

#### Módulos a Crear (orden de prioridad):

1. **E-commerce** (2 días)
   - `/admin/ecommerce/page.tsx`
   - Componentes: Cart, Checkout, AsyncOrders, OnlinePayments
   - Features: cart, checkout, async_processing, online_payment_gateway

2. **Delivery** (1.5 días)
   - `/admin/delivery/page.tsx`
   - Componentes: DeliveryZones, OrderTracking, CourierIntegrations
   - Features: delivery_zones, delivery_tracking, shipping_integration

3. **B2B Sales** (2 días)
   - `/admin/b2b/page.tsx`
   - Componentes: QuoteBuilder, Contracts, Approvals, CorporateAccounts
   - Features: quote_generation, contract_management, approval_workflows

4. **Production (UI)** (1.5 días)
   - Crear UI en `/admin/production/page.tsx` (actualmente solo lógica)
   - Componentes: KitchenDisplay, OrderQueue, CapacityPlanner
   - Features: kitchen_display, order_queue, capacity_planning

---

### FASE 5: Crear Módulos Nuevos (Media Prioridad) (3-4 días)

5. **Appointments** (1.5 días)
   - Decisión: ¿Tab en Scheduling o módulo independiente?
   - Si módulo: `/admin/appointments/page.tsx`
   - Componentes: BookingCalendar, ServiceHistory, Reminders

6. **Multi-Location** (2 días)
   - `/admin/locations/page.tsx`
   - Componentes: LocationManager, TransferOrders, ComparativeAnalytics

---

### FASE 6: Reorganización de Navegación (2 días)

**Objetivo**: Aplicar nueva estructura de dominios y orden

#### Tareas:

1. **Actualizar NavigationContext.tsx**:
   - Reorganizar en 6 dominios
   - Ordenar módulos por frecuencia de uso dentro de cada dominio
   - Agregar módulos nuevos

2. **Actualizar MODULE_FEATURE_MAP**:
   - Agregar mappings para módulos nuevos
   - Verificar todos los módulos tienen features

3. **Actualizar ModuleRegistry Manifests**:
   - Crear manifests para módulos nuevos
   - Actualizar dependencies

4. **Testing de Navegación**:
   - Verificar todos los módulos accesibles
   - Verificar capabilities activan/desactivan módulos correctamente
   - Verificar orden correcto

---

### FASE 7: Testing y Documentación (2-3 días)

**Objetivo**: Validar sistema completo y documentar

#### Tareas:

1. **Testing Funcional**:
   - Probar cada capability del setup wizard
   - Verificar módulos correctos se activan
   - Verificar flujos end-to-end por modelo de negocio

2. **Actualizar Documentación**:
   - `MODULE_INVENTORY_2025.md` → Nueva versión con 27 módulos
   - `CLAUDE.md` → Actualizar arquitectura
   - `NAVIGATION_SYSTEM_GUIDE.md` → Nueva guía

3. **Crear Guías de Usuario**:
   - Por modelo de negocio (Restaurante, Retail, Servicios, etc.)
   - Screenshots de navegación
   - Flujos de trabajo recomendados

---

## 📊 TIMELINE ESTIMADO

| Fase | Duración | Acumulado |
|------|----------|-----------|
| FASE 1: Auditoría | 1-2 días | 2 días |
| FASE 2: Normalización | 2-3 días | 5 días |
| FASE 3: Diseño Arquitecturas | 3-4 días | 9 días |
| FASE 4: Módulos Alta Prioridad | 5-7 días | 16 días |
| FASE 5: Módulos Media Prioridad | 3-4 días | 20 días |
| FASE 6: Reorganización Nav | 2 días | 22 días |
| FASE 7: Testing y Docs | 2-3 días | **25 días** |

**TOTAL ESTIMADO**: **3-4 semanas** (trabajo full-time)

---

## ❓ PREGUNTAS PENDIENTES DE DECISIÓN

### Decisiones Arquitectónicas Críticas:

#### Q1: Catalog (Products) - ¿UI Dinámica o Módulos Separados?
- **Opción A**: Un módulo "Catalog" con tabs dinámicos según tipos activos ⭐
- **Opción B**: Módulos separados (Menu, Retail, Services, etc.)
- **Tu decisión**: ___________________________

#### Q2: E-commerce - ¿Módulo Independiente o Tab en Sales?
- **Opción A**: Módulo independiente `/admin/ecommerce` ⭐
- **Opción B**: Tab en Sales > E-commerce
- **Tu decisión**: ___________________________

#### Q3: Delivery - ¿Módulo Independiente o Tab?
- **Opción A**: Módulo independiente `/admin/delivery` ⭐
- **Opción B**: Tab en Operations Hub
- **Opción C**: Tab en Sales
- **Tu decisión**: ___________________________

#### Q4: Appointments - ¿Módulo Independiente o Tab en Scheduling?
- **Opción A**: Tab en Scheduling (comparte calendario) ⭐
- **Opción B**: Módulo independiente `/admin/appointments`
- **Tu decisión**: ___________________________

#### Q5: Production - ¿Dónde va la UI?
- **Opción A**: Tab en Operations Hub (KDS es operación diaria) ⭐
- **Opción B**: Módulo independiente `/admin/production`
- **Opción C**: Tab en Products/Catalog
- **Tu decisión**: ___________________________

#### Q6: B2B Sales - ¿Módulo Independiente o Tab en Sales?
- **Opción A**: Módulo independiente `/admin/b2b` ⭐
- **Opción B**: Tab en Sales > B2B
- **Tu decisión**: ___________________________

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar este documento** y validar que refleja correctamente el problema
2. **Responder las 6 preguntas de decisión** (Q1-Q6)
3. **Aprobar o ajustar** la propuesta de 27 módulos finales
4. **Comenzar FASE 1**: Inventario de componentes por módulo existente

---

**Documento creado**: 2025-01-14
**Próxima revisión**: Después de decisiones Q1-Q6
**Mantenido por**: G-Admin Team
