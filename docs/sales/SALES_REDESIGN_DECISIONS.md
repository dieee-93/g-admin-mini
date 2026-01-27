# 🎯 SALES MODULE REDESIGN - DECISIONES ARQUITECTÓNICAS

**Date**: 2025-12-11
**Version**: 1.0
**Status**: Decision Document
**Purpose**: Consolidar decisiones para rediseño Sales + POS adaptativo

---

## 📊 PRODUCT TYPES - ANÁLISIS COMPLETO

### Current State (Código actual)

```typescript
// src/pages/admin/supply-chain/products/types/product.ts:52
export type ProductType = "ELABORATED" | "SERVICE" | "DIGITAL";
```

### Capabilities/Features Disponibles (de FeatureRegistry.ts)

```
DOMAINS CON PRODUCTOS:
├─ SALES: Physical products, Services
├─ RENTAL: Rental items, Booking calendar, Duration pricing
├─ MEMBERSHIP: Subscription plans, Recurring billing
├─ DIGITAL: File delivery, License management
└─ SCHEDULING: Appointment booking, Calendar management
```

### ❌ PROBLEMA: Tipos de Producto Incompletos

**Faltan**:
1. ❌ **RENTAL** - Existe todo el dominio (5 features) pero NO hay ProductType
2. ❌ **MEMBERSHIP** - Existe dominio (5 features) pero NO hay ProductType
3. ⚠️  **ELABORATED** - Nombre confuso (debería ser PHYSICAL)

---

## ✅ PRODUCT TYPES PROPUESTOS - COMPLETOS

```typescript
export type ProductType =
  | "PHYSICAL"      // Productos físicos con inventario (ex-ELABORATED)
  | "SERVICE"       // Servicios (con/sin appointment)
  | "DIGITAL"       // Productos digitales descargables
  | "RENTAL"        // Items alquilables (equipos, espacios)
  | "MEMBERSHIP";   // Membresías/suscripciones recurrentes
```

### Matriz de Compatibilidad COMPLETA

```
                        │Onsite│Delivery│Pickup│Appointment│Digital Delivery│Rental Period
────────────────────────┼──────┼────────┼──────┼───────────┼────────────────┼─────────────
PHYSICAL (inventario)   │  ✅  │   ✅   │  ✅  │    ❌     │      ❌        │     ❌
SERVICE (labor)         │  ✅  │   ❌   │  ❌  │    ✅     │      ✅*       │     ❌
DIGITAL (archivo/código)│  ❌  │   ❌   │  ❌  │    ❌     │      ✅        │     ❌
RENTAL (asset)          │  ❌  │   ❌   │  ✅  │    ✅     │      ❌        │     ✅
MEMBERSHIP (subscription│  ❌  │   ❌   │  ❌  │    ❌     │      ✅**      │     ❌

* Service digital: ej. consulta online, clase virtual
** Membership delivery: credencial por email, acceso por app
```

### Ejemplos por Tipo

```
PHYSICAL:
├─ Hamburguesa (onsite, delivery, pickup)
├─ Cerveza (onsite, pickup)
├─ Ropa (delivery, pickup)
└─ Incompatible: No puede tener appointment, no es descargable, no se alquila

SERVICE:
├─ Corte de pelo (appointment + onsite)
├─ Consulta médica (appointment + onsite/virtual)
├─ Clase de yoga (appointment + onsite/virtual)
└─ Incompatible: No tiene delivery física, no se descarga

DIGITAL:
├─ eBook (email/download)
├─ Software license (email código)
├─ Gift card (QR code, email)
└─ Incompatible: No puede ir en mesa, delivery física, pickup físico

RENTAL:
├─ Esquís (pickup en tienda, rental period 3 días)
├─ Sala de reunión (appointment + onsite, rental period 2 horas)
├─ Auto (pickup, rental period 1 semana)
└─ Incompatible: No es delivery (se retira/devuelve), no es descargable

MEMBERSHIP:
├─ Gym membership (recurring billing mensual, access control)
├─ Netflix subscription (recurring billing, digital access)
├─ Club membership (recurring billing, benefits)
└─ Incompatible: No tiene fulfillment físico, se "activa" digitalmente
```

---

## 🔄 RESPUESTAS A TUS PREGUNTAS

### 1. Mixed Carts - Concepto de Carrito

**Tu observación**:
> "El concepto de carro es medio opuesto a mesas. Podría servir para productos digitales, pero... merece un rediseño."

#### Análisis del Problema:

```
CART PATTERN (eCommerce):
├─ Usuario agrega múltiples items
├─ Revisa, modifica cantidades
├─ Procede a checkout
├─ Paga
└─ CONTEXTO: Compra premeditada, múltiples productos

MESA PATTERN (Restaurant):
├─ Mesero toma pedido
├─ Se envía a cocina INMEDIATAMENTE (no espera)
├─ Items se van sirviendo según preparación
├─ Cuenta se va construyendo
└─ CONTEXTO: Servicio continuo, items independientes
```

#### 🎯 PROPUESTA: Context-Specific Patterns

```typescript
// Sales Context Pattern
type SalesPattern =
  | "CART"          // Acumulación → Checkout → Pago (eCommerce, Digital)
  | "DIRECT_ORDER"  // Item → Cocina → Servir (Restaurant onsite)
  | "BOOKING"       // Fecha/Hora → Confirmación → Pago (Appointments, Rentals)
  | "SUBSCRIPTION"; // Plan → Recurring → Autopay (Memberships)
```

**Por ProductType**:

```
PHYSICAL (delivery/pickup) → CART pattern
  ├─ Agrega hamburguesa, papas, bebida
  ├─ Revisa carrito
  ├─ Procede a checkout
  └─ Selecciona delivery/pickup

PHYSICAL (onsite) → DIRECT_ORDER pattern
  ├─ Selecciona mesa
  ├─ Agrega hamburguesa → ENVÍA A COCINA
  ├─ Agrega bebida → ENVÍA A BARRA
  ├─ Items se sirven según disponibilidad
  └─ Cuenta permanece abierta hasta pagar

SERVICE → BOOKING pattern
  ├─ Selecciona servicio (corte de pelo)
  ├─ Selecciona fecha/hora
  ├─ Selecciona staff (peluquero)
  ├─ Confirma booking
  └─ Paga (prepago o on-service)

DIGITAL → CART pattern (simple)
  ├─ Selecciona eBook
  ├─ Procede a pago (no hay checkout complejo)
  ├─ Paga
  └─ Recibe link de descarga

RENTAL → BOOKING pattern (con período)
  ├─ Selecciona item (esquís)
  ├─ Selecciona período (3 días)
  ├─ Selecciona pickup/return dates
  ├─ Confirma booking
  └─ Paga + depósito

MEMBERSHIP → SUBSCRIPTION pattern
  ├─ Selecciona plan (Gym Premium)
  ├─ Configura billing (mensual/anual)
  ├─ Ingresa payment method
  ├─ Activa subscription
  └─ Auto-billing recurrente
```

#### **DECISIÓN FINAL**:

**NO usar "carrito" universal**. Usar **pattern apropiado según ProductType**:

1. ✅ **CART** para: Physical (delivery/pickup), Digital
2. ✅ **DIRECT_ORDER** para: Physical (onsite - mesas)
3. ✅ **BOOKING** para: Service, Rental
4. ✅ **SUBSCRIPTION** para: Membership

**Mixed patterns**: ❌ NO permitir. Una venta = un pattern.

---

### 2. Tabs - Posicionamiento Secundario

**Tu respuesta**:
> "Por ahora tabs está bien. Me interesa más ver cómo va a interactuar todo y cómo va a ser el diseño. Lo prioritario es evitar incompatibilidades lógicas."

#### ✅ DECISIÓN ACEPTADA

- Tabs se mantienen (por ahora)
- Prioridad: Diseño de interacciones y prevención de incompatibilidades
- Posicionamiento/componentes: secundario

**Tabs propuestos (final)**:

```
┌─────┬──────────────┬────────┬──────────┬─────────┐
│ POS │ Appointments │ Orders │ Analytics│ Reports │
└─────┴──────────────┴────────┴──────────┴─────────┘

POS: Venta activa (adaptativo según ProductType)
Appointments: Vista calendario (servicios ya creados)
Orders: Historial/búsqueda todas las ventas
Analytics: Métricas y gráficos
Reports: Exportaciones y documentos
```

---

### 3. Modal vs Inline POS - Híbrido Pensado para Mobile

**Tu respuesta**:
> "No lo sé, podría ser híbrido. Deberíamos ver qué propuesta se adapta mejor a las necesidades planteadas."

#### Análisis de Necesidades

**Desktop (Screen ≥ 1024px)**:
- ✅ Espacio suficiente para inline POS
- ✅ Ver métricas + POS simultáneamente
- ✅ Split screen: Productos | Cart | Payment

**Tablet (768px - 1023px)**:
- ⚠️  Espacio limitado para split
- ✅ Modal full-screen funciona mejor
- ❌ Inline ocuparía toda la pantalla igual

**Mobile (< 768px)**:
- ✅ Modal full-screen OBLIGATORIO
- ❌ Inline no tiene sentido (no hay espacio)

#### 🎯 PROPUESTA: Híbrido Responsive

```typescript
// Responsive POS Pattern
const POSLayout = () => {
  const screenSize = useBreakpoint();

  if (screenSize === 'mobile' || screenSize === 'tablet') {
    return <POS_Modal fullScreen />; // Modal full-screen
  }

  // Desktop: Inline split layout
  return (
    <POS_InlineLayout>
      <ProductSearch />  {/* Left: 60% */}
      <CartSummary />    {/* Right: 40% */}
    </POS_InlineLayout>
  );
};
```

**Ventajas**:
- ✅ Desktop: inline (mejor UX, ve métricas)
- ✅ Mobile/Tablet: modal (más espacio, focus mode)
- ✅ Un solo codebase, responsive automático

#### **DECISIÓN FINAL**: Híbrido Responsive

- Desktop (≥1024px): **Inline split layout**
- Mobile/Tablet (<1024px): **Modal full-screen**

---

### 4. Appointment Creation - Clarificación

**Tu pregunta**:
> "¿A qué te refieres con Appointment creation? ¿No está el módulo disponible?"

#### Estado Actual

**Sí existe módulo Scheduling**:
```
src/modules/scheduling/
├─ manifest.tsx ✅
├─ components/ ✅
├─ hooks/ ✅
├─ services/ ✅
└─ types/ ✅
```

**Capabilities activas**:
```typescript
// FeatureRegistry.ts:536
'scheduling_appointment_booking': {
  name: 'Reserva de Citas',
  description: 'Sistema de agendamiento de citas',
  domain: 'SCHEDULING'
}
```

**PERO en Sales**:
```typescript
// AppointmentsTab.tsx:134
<Button colorPalette="blue">
  <Icon icon={PlusIcon} />
  New Appointment  // ← Botón NO implementado (stub)
</Button>
```

#### El Problema

**Current**: Tab Appointments tiene vista de appointments ya creados (calendar, list) pero NO tiene creación.

**Where to create?**

**Opción A: En Scheduling module** (`/admin/resources/scheduling`)
- ✅ Módulo dedicado con todas las features
- ✅ Calendar completo, staff availability, etc.
- ❌ Usuario tiene que ir a otro módulo para crear

**Opción B: En Sales POS** (tipo de producto SERVICE)
- ✅ Flujo unificado de venta
- ✅ No cambia de contexto
- ❌ POS se vuelve más complejo

**Opción C: Ambos** (crear desde ambos lados)
- ✅ Flexibilidad máxima
- ✅ Scheduling module: creación avanzada (recurring, bulk)
- ✅ Sales POS: creación rápida (service sale)
- ⚠️  Duplicación de UI (pero con propósitos diferentes)

#### 🎯 PROPUESTA: Opción C (Ambos contextos)

```
SALES POS (tipo SERVICE):
┌────────────────────────────────────┐
│ POS - Nueva Venta                  │
│ Tipo: [Servicios]                  │
├────────────────────────────────────┤
│ Servicio: Corte de pelo            │
│ Fecha: 2025-12-15                  │
│ Hora: 14:00                        │
│ Profesional: Juan Pérez            │
│ Cliente: María González            │
│ Precio: $500                       │
│                                     │
│ [Crear Appointment y Cobrar]       │
└────────────────────────────────────┘
↓
Crea: Sale + Appointment (linked)

SCHEDULING MODULE (creación avanzada):
┌────────────────────────────────────┐
│ Scheduling - New Appointment       │
├────────────────────────────────────┤
│ Recurring: ☑ Todos los lunes      │
│ Duration: 4 semanas                │
│ Service: Clase de Yoga             │
│ Instructor: María López            │
│ Max attendees: 10                  │
│ Price per session: $200            │
│                                     │
│ [Create Recurring Appointments]    │
└────────────────────────────────────┘
↓
Crea: 4 Appointments + 1 Sale por sesión (on-attend)
```

**Diferencia clave**:
- **Sales POS**: Venta inmediata de 1 servicio (appointment único)
- **Scheduling Module**: Gestión avanzada (recurring, bulk, availability complex)

#### **DECISIÓN FINAL**:

- ✅ **Sales POS**: Crear appointments como venta de SERVICE
- ✅ **Scheduling Module**: Gestión avanzada (recurring, bulk, config)
- ✅ **Appointments Tab (Sales)**: Vista de appointments created via Sales

---

### 5. Cross-Module Actions - Industry Standard

**Tu pregunta**:
> "¿Desde donde se gestionan las mesas se puede crear una venta? ¿Se redirige a esta página? ¿Cuál es el standard industry?"

#### Industry Research - POS Systems

**Toast POS (USA - Restaurants)**:
```
From Table Management:
[Mesa #5 - Libre] → Click → [Asignar] → Mesero seleccionado
                                     ↓
                          [Abrir Cuenta] → ABRE POS en contexto
                                           (mesa pre-seleccionada)

NO redirige a otra página, contexto permanece.
```

**Square for Restaurants**:
```
Floor Plan View:
[Mesa #3 - Ocupada $450] → Click → [Ver Cuenta]
                                  → [Agregar Items] → POS inline modal
                                  → [Pagar Cuenta]

Modal sobre floor plan, no pierde contexto visual.
```

**Lightspeed Restaurant**:
```
Table View → Click mesa → Inline editor con tabs:
  ├─ [Items] (agregar productos)
  ├─ [Payment] (cobrar)
  ├─ [Details] (notas, customer)
  └─ [History] (audit log)

Todo en contexto, sin redirección.
```

#### 🎯 PROPUESTA: Context-Preserved Actions

**Pattern: Inline Modal + Pre-filled Context**

```
DESDE ONSITE MODULE (Floor Plan):
┌──────────────────────────────────────────────┐
│ Floor Plan - Salón Principal                  │
├──────────────────────────────────────────────┤
│                                                │
│  [Mesa #1]  [Mesa #2]  [Mesa #3]             │
│   Libre      Ocupada    Libre                 │
│              $250                              │
│              👥 4                              │
│      ↑                                        │
│    Click                                      │
└──────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│ Mesa #2 - Opciones                            │
├──────────────────────────────────────────────┤
│ • Ver Cuenta Actual ($250)                    │
│ • Agregar Items ← ABRE POS MODAL             │
│ • Solicitar Cuenta                            │
│ • Liberar Mesa                                │
│ • Cambiar Mesa                                │
└──────────────────────────────────────────────┘
        ↓ "Agregar Items"
┌──────────────────────────────────────────────┐
│ POS - Mesa #2                                 │  ← Modal overlay
├──────────────────────────────────────────────┤
│ Context: Mesa #2 (pre-filled)                 │
│ Cuenta actual: $250                           │
│                                                │
│ Agregar productos:                            │
│ [Search..............................]         │
│                                                │
│ [Cart shows existing + new items]             │
│                                                │
│ [Agregar a Cuenta]  [Cancelar]                │
└──────────────────────────────────────────────┘
        ↓ Agrega items
Floor Plan se actualiza: Mesa #2 ahora $350
```

**Key Points**:
1. ✅ **NO redirige** - modal sobre floor plan
2. ✅ **Context pre-filled** - mesa ya seleccionada
3. ✅ **Visual feedback** - floor plan actualiza al cerrar
4. ✅ **Acción específica** - "Agregar items" vs "Nueva venta"

#### Implementación Técnica

```typescript
// From Onsite module
const handleTableAction = (tableId: string, action: TableAction) => {
  if (action === 'add_items') {
    // Open POS modal with context
    openPOSModal({
      productType: 'PHYSICAL',
      fulfillmentContext: {
        type: 'onsite',
        tableId: tableId,
        existingSaleId: table.activeSaleId // Si ya tiene cuenta
      },
      mode: 'add_to_existing' // vs 'new_sale'
    });
  }
};

// POS Modal receives context
<POS_Modal
  initialContext={fulfillmentContext}
  onComplete={(result) => {
    // Update floor plan
    refreshFloorPlan();
    // Update metrics
    refreshMetrics();
  }}
/>
```

#### Standard Industry: **In-Context Actions**

**Patrón común en todos los POS líderes**:
1. ✅ Acción desde módulo específico (floor plan, delivery map, etc.)
2. ✅ Abre POS en modal/overlay (NO redirección completa)
3. ✅ Context pre-filled (mesa, delivery address, etc.)
4. ✅ Al completar, vuelve a contexto original
5. ✅ Visual feedback inmediato (piso actualiza, mapa actualiza)

#### **DECISIÓN FINAL**: In-Context Modal

- ✅ Desde Onsite: Click mesa → Modal POS con mesa pre-selected
- ✅ Desde Delivery: Click pedido → Modal POS con address pre-filled
- ✅ Desde Scheduling: Click appointment → Modal POS SERVICE pre-configured
- ✅ NO redirección, contexto preservado
- ✅ Modal overlay con blur background

---

## 🏗️ ARQUITECTURA FINAL PROPUESTA

### POS Entry Flow

```
┌─────────────────────────────────────────────────┐
│ SALES POS - Type Selection                      │
├─────────────────────────────────────────────────┤
│ ¿Qué vas a vender?                              │
│                                                  │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ │ 🍔       │  │ 📅       │  │ 💾       │      │
│ │ PRODUCTOS│  │ SERVICIOS│  │ DIGITALES│      │
│ │ Físicos  │  │ Con cita │  │ Descargas│      │
│ └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│ ┌──────────┐  ┌──────────┐                     │
│ │ 🎿       │  │ 💳       │                     │
│ │ ALQUILERES  │ MEMBRESÍAS                     │
│ │ Equipos  │  │ Suscripcio│                    │
│ └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────┘
          ↓ Selección determina interfaz
```

### Interfaces por Tipo

```
PRODUCTOS (PHYSICAL):
├─ Fulfillment selector: [🍽️ Mesa] [🚚 Delivery] [🥡 Pickup]
├─ Product search
├─ Cart (CART pattern)
├─ Payment
└─ Validación: Stock availability

SERVICIOS (SERVICE):
├─ Service search
├─ Date/Time picker
├─ Staff selector
├─ Customer selector
├─ Booking (BOOKING pattern)
├─ Payment (prepay or on-service)
└─ Validación: Staff availability, calendar conflicts

DIGITALES (DIGITAL):
├─ Digital product search
├─ Email/delivery method
├─ Cart simple (CART pattern)
├─ Payment
└─ Post-purchase: Email con link/código

ALQUILERES (RENTAL):
├─ Rental item search
├─ Period selector (from/to dates + times)
├─ Deposit configuration
├─ Customer selector
├─ Booking (BOOKING pattern)
├─ Payment + deposit
└─ Validación: Item availability para período

MEMBRESÍAS (MEMBERSHIP):
├─ Plan selector
├─ Billing frequency (mensual/anual)
├─ Start date
├─ Payment method (for recurring)
├─ Customer selector
├─ Subscription (SUBSCRIPTION pattern)
├─ First payment
└─ Auto-billing setup
```

---

## 🚫 INCOMPATIBILIDADES - VALIDACIÓN

### Reglas de Validación por ProductType

```typescript
// Validation rules engine
const PRODUCT_FULFILLMENT_MATRIX = {
  PHYSICAL: {
    allowed: ['onsite', 'delivery', 'pickup'],
    forbidden: ['digital_delivery', 'rental_period', 'subscription']
  },
  SERVICE: {
    allowed: ['onsite', 'appointment', 'virtual'],
    forbidden: ['delivery', 'pickup', 'rental_period']
  },
  DIGITAL: {
    allowed: ['digital_delivery'],
    forbidden: ['onsite', 'delivery', 'pickup', 'rental_period']
  },
  RENTAL: {
    allowed: ['pickup', 'onsite', 'rental_period'],
    forbidden: ['delivery', 'digital_delivery', 'subscription']
  },
  MEMBERSHIP: {
    allowed: ['digital_delivery', 'subscription'],
    forbidden: ['onsite', 'delivery', 'pickup', 'rental_period']
  }
};

// Runtime validation
function validateProductFulfillment(
  productType: ProductType,
  fulfillmentType: FulfillmentType
): ValidationResult {
  const rules = PRODUCT_FULFILLMENT_MATRIX[productType];

  if (rules.forbidden.includes(fulfillmentType)) {
    return {
      valid: false,
      error: `${productType} no puede usar ${fulfillmentType}`,
      suggestion: `Opciones válidas: ${rules.allowed.join(', ')}`
    };
  }

  return { valid: true };
}
```

### UI Prevention (No permitir selección inválida)

```
Ejemplo: Usuario selecciona DIGITAL
├─ Fulfillment selector solo muestra:
│  └─ [📧 Email] (único habilitado)
│
├─ Opciones deshabilitadas (grayed out):
│  ├─ [🍽️ Mesa] ❌ Disabled
│  ├─ [🚚 Delivery] ❌ Disabled
│  └─ [🥡 Pickup] ❌ Disabled
│
└─ Tooltip al hover: "Productos digitales solo se entregan por email"
```

---

## 📋 MÓDULOS EXISTENTES - RESUMEN

### Módulos Capability-Specific

```
✅ fulfillment/onsite     - Gestión mesas, floor plan, table assignment
✅ fulfillment/delivery   - Delivery zones, tracking, driver assignment
✅ fulfillment/pickup     - Pickup scheduling, notification
✅ scheduling             - Appointment booking, calendar, staff availability
✅ rentals                - Rental items, booking calendar, pricing
✅ memberships            - Subscription plans, recurring billing, access control
✅ products               - Product catalog, recipes, costing
✅ materials              - Inventory, stock tracking, suppliers
✅ cash-management        - Cash sessions, journal entries
✅ shift-control          - Operational shifts, status
```

### Cross-Module Integration Pattern

```
SALES MODULE (Commercial Hub):
├─ Consume data:
│  ├─ Onsite: Mesas disponibles
│  ├─ Delivery: Zonas, drivers
│  ├─ Scheduling: Staff availability, calendar
│  ├─ Rentals: Item availability
│  └─ Products: Catalog, pricing, stock
│
└─ Emit events:
   ├─ sales.payment.completed → Cash module
   ├─ sales.order.created → Fulfillment modules
   ├─ sales.appointment.created → Scheduling module
   └─ sales.rental.created → Rentals module

CAPABILITY MODULES (Operational Management):
├─ Provide data: Availability, configuration
├─ Listen to Sales events: Update state
└─ Shortcut actions: Open Sales POS with context
```

---

## 🎨 VISUAL HIERARCHY - PROPUESTA FINAL

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Sales Management                                             │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Turno: Mañana     💰 Caja: María ($2,500) [Cerrar]      │
├─────────────────────────────────────────────────────────────┤
│ METRICS (Core + Injected via HookPoint)                     │
│ [Revenue] [Trans] [Ticket] + [Mesas] (si onsite activo)    │
├─────────────────────────────────────────────────────────────┤
│ [POS] [Appointments] [Orders] [Analytics] [Reports]         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ╔═══════════════════════════════════════════════════════╗   │
│ ║ POS ADAPTATIVO                                        ║   │
│ ║───────────────────────────────────────────────────────║   │
│ ║ [Desktop: Inline split] [Mobile/Tablet: Modal]       ║   │
│ ║                                                        ║   │
│ ║ Type Selection → Context Fields → Payment             ║   │
│ ╚═══════════════════════════════════════════════════════╝   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### TakeAway Toggle - Relocation

**Current**: `sales.toolbar.actions` (priority 90 - MUY PROMINENTE)

**Proposed**: `shift.operational_controls` (compact variant)

```
Header Section:
┌─────────────────────────────────────────────────────┐
│ 🟢 Turno: Mañana                                    │
│ Controles: [🥡 TakeAway: ON] [🍽️ Mesas: 8]        │
└─────────────────────────────────────────────────────┘

Compact toggle badge, not full-width card
```

---

## ✅ DECISIONES FINALES - RESUMEN

### 1. Product Types: 5 tipos completos
- PHYSICAL, SERVICE, DIGITAL, RENTAL, MEMBERSHIP

### 2. Sales Patterns: 4 patterns
- CART, DIRECT_ORDER, BOOKING, SUBSCRIPTION

### 3. Mixed Carts: ❌ NO
- Una venta = un tipo = un pattern

### 4. POS Layout: Híbrido Responsive
- Desktop: Inline split
- Mobile/Tablet: Modal fullscreen

### 5. Appointment Creation: Ambos contextos
- Sales POS: venta rápida de SERVICE
- Scheduling Module: gestión avanzada

### 6. Cross-Module Actions: In-Context Modal
- Modal POS con context pre-filled
- NO redirección completa
- Visual feedback inmediato

### 7. Incompatibilidades: Validación + UI Prevention
- Matrix de compatibilidad
- Opciones inválidas deshabilitadas
- Tooltips explicativos

---

## 🔍 INVESTIGATION RESULTS (2025-12-12)

### ✅ Components Found (Reusable)

| Component | Location | Status | Use For |
|-----------|----------|--------|---------|
| **TimeSlotPicker** | `src/shared/ui/components/business/` | ✅ Excellent | SERVICE, PICKUP |
| **OnsiteTableSelector** | `src/modules/fulfillment/onsite/` | ✅ Registered hook | PHYSICAL (Onsite) |
| **ModernPaymentProcessor** | `src/pages/admin/operations/sales/components/Payment/` | ✅ Complete | ALL |
| **Rentals API** | `src/pages/admin/operations/rentals/services/` | ✅ Complete API | RENTAL |
| **Unified Calendar** | `src/shared/calendar/` | ✅ Generic system | All bookings |

### ❌ Components Missing (Need Creation)

| Component | Priority | For ProductType |
|-----------|----------|-----------------|
| **DateTimePickerLite** | HIGH | SERVICE |
| **PeriodPicker** | HIGH | RENTAL |
| **AddressFormLite** | MEDIUM | DELIVERY (investigate first) |

### ⚠️ Components Needing Refactor

| Component | Issue | Solution |
|-----------|-------|----------|
| **SaleFormModal** | Not ProductType-aware | HookPoints + capability detection |
| **SalesMetrics** | Hardcoded, not capability-aware | Core + HookPoint injection |
| **SalesManagement** | Stub tabs (Analytics, Reports) | Defer to Intelligence module |

---

## 🎯 FINAL ARCHITECTURE DECISIONS

### 1. Capability-Aware via HookPoints ✅

**Decision**: Modules register their ProductType flows via HookPoints

**HookPoints Created**:
- `sales.pos.product_type_selector` - ProductType selection UI
- `sales.pos.product_flow` - ProductType-specific workflow
- `sales.metrics` - Capability-specific metrics

**Example**:
```typescript
// Scheduling module registers SERVICE flow:
ModuleRegistry.registerHook('sales.pos.product_flow', {
  component: ({ selectedProduct, onFlowComplete }) => (
    <DateTimePickerLite
      serviceId={selectedProduct.id}
      onSelect={(datetime) => onFlowComplete({ datetime })}
    />
  ),
  when: (data) => data.productType === 'SERVICE',
  requires: ['capability.scheduling.appointments']
});
```

**When capability OFF → Hook does NOT render**

---

### 2. Metrics Strategy ✅

**Decision**: Core metrics (3) + HookPoint for capability metrics

**Core Metrics** (always visible):
1. Revenue Hoy
2. Transacciones Activas
3. Ticket Promedio

**Capability Metrics** (injected):
- Onsite → Mesas Activas, Ocupación
- Delivery → Deliveries Activos, Tiempo Promedio
- etc.

**TODO**: Implement real metric logic (currently mock data)

---

### 3. Analytics Tabs ✅

**Decision**: Defer to Intelligence module (technical debt)

**Action**: Remove stub tabs or delegate via HookPoint

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Component Creation ⏳
- [ ] Create DateTimePickerLite (date input + TimeSlotPicker)
- [ ] Create PeriodPicker (with availability checking)
- [ ] Investigate AddressFormLite in Delivery module

### Phase 2: SaleFormModal Refactor ⏳
- [ ] Add capability detection hook
- [ ] Add ProductType state management
- [ ] Implement `sales.pos.product_type_selector` HookPoint
- [ ] Implement `sales.pos.product_flow` HookPoint
- [ ] Add pattern detection (CART/DIRECT_ORDER/BOOKING/SUBSCRIPTION)
- [ ] Update useSaleForm hook

### Phase 3: SalesMetrics Refactor ⏳
- [ ] Extract core metrics (3 cards)
- [ ] Add `sales.metrics` HookPoint
- [ ] Update modules to register metrics
- [ ] Add TODOs for real logic

### Phase 4: Testing & Validation ⏳
- [ ] Test capability on/off switching
- [ ] Test ProductType detection
- [ ] Test HookPoint injection
- [ ] Test all ProductType POS flows

---

## 🚨 PENDING TASKS

### High Priority:
1. Investigate if AddressFormLite exists in Delivery module
2. Review capability hook usage patterns in codebase
3. Review HookPoint registration patterns in module manifests
4. Decide on Analytics components (delete or migrate)

### Medium Priority:
1. Create CustomerSelectorLite component
2. Create StaffSelectorLite component
3. Create DepositCalculator component
4. Update ProductType enum (add RENTAL, MEMBERSHIP)

### Low Priority:
1. Deprecate PickupTimeSlotPicker (use shared TimeSlotPicker)
2. Clean up dummy buttons in SalesManagement
3. Add comprehensive tests for all flows

---

**Status**: ✅ Investigation Complete - Ready for Implementation
**Next**: Begin Phase 1 (Component Creation)
**Version**: 2.0 (Updated with investigation results)
**Last Updated**: 2025-12-12
