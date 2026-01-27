# 🎯 Shift Lifecycle - Matriz por Capability

**Fecha**: 2025-01-26
**Propósito**: Definir qué sucede al abrir/cerrar turno según capabilities activas
**Enfoque**: Event-Driven Architecture

---

## 📋 ÍNDICE

1. [Introducción](#introducci%C3%B3n)
2. [Capabilities del Sistema](#capabilities-del-sistema)
3. [Matriz: Capability x Módulos x Eventos](#matriz-capability-x-m%C3%B3dulos-x-eventos)
4. [Flujos Detallados por Capability](#flujos-detallados-por-capability)
5. [Combinaciones Comunes](#combinaciones-comunes)
6. [Arquitectura Event-Driven](#arquitectura-event-driven)
7. [Implementación](#implementaci%C3%B3n)

---

## 🎯 INTRODUCCIÓN

### Premisa Fundamental

**El concepto de "turno" NO es universal**. Cada tipo de negocio tiene necesidades diferentes:

| Tipo de Negocio | ¿Tiene turnos físicos? | ¿Cash session? | ¿Check-in staff? | ¿Control de inventario? |
|----------------|----------------------|----------------|------------------|------------------------|
| Restaurante | ✅ Sí (Mañana/Tarde/Noche) | ✅ Sí | ✅ Sí | ✅ Sí (stock diario) |
| Salón de Belleza | ✅ Sí (Jornada completa) | ⚠️ Opcional | ✅ Sí | ❌ No |
| Rental de Equipos | ✅ Sí | ⚠️ Opcional | ✅ Sí | ✅ Sí (equipos disponibles) |
| Membresías/Gym | ✅ Sí | ❌ No | ✅ Sí | ❌ No |
| E-commerce Puro | ❌ No (24/7) | ❌ No | ❌ No | ✅ Sí (stock warehouse) |
| Food Truck | ✅ Sí (por evento) | ✅ Sí | ✅ Sí | ✅ Sí (inventario móvil) |

### Estrategia de Diseño

**Shift-Control como orquestador adaptativo**:
1. Detecta capabilities activas
2. Suscribe a eventos relevantes según capability
3. Mantiene estado coherente
4. Emite eventos de coordinación

---

## 🧩 CAPABILITIES DEL SISTEMA

### Core Business Models (Lo que ofreces)

```typescript
type CoreCapability =
  | 'physical_products'      // Productos físicos
  | 'professional_services'  // Servicios profesionales
  | 'asset_rental'          // Alquiler de activos
  | 'membership_subscriptions' // Membresías
  | 'digital_products'      // Productos digitales
```

### Fulfillment Methods (Cómo entregas)

```typescript
type FulfillmentCapability =
  | 'onsite_service'   // En el local
  | 'pickup_orders'    // Retiro
  | 'delivery_shipping' // Envío
```

### Special Operations (Potenciadores)

```typescript
type SpecialCapability =
  | 'async_operations'   // Fuera de horario
  | 'corporate_sales'    // B2B
  | 'mobile_operations'  // Móvil
```

---

## 📊 MATRIZ: CAPABILITY X MÓDULOS X EVENTOS

### Leyenda

- ✅ **Obligatorio**: El módulo DEBE participar en el shift lifecycle
- ⚠️ **Condicional**: Participa si cierta condición se cumple
- 🔵 **Opcional**: Mejora funcionalidad pero no es crítico
- ❌ **No aplica**: No tiene relación con shift lifecycle

---

### 1️⃣ **physical_products** (Productos Físicos)

**Ejemplos**: Restaurante, Retail, Panadería, Farmacia

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Cash** | ✅ Obligatorio | `cash.session.opened`<br>`cash.session.closed`<br>`cash.discrepancy.detected` | `shift.opened`<br>`shift.closing` |
| **Staff** | ✅ Obligatorio | `staff.employee.checked_in`<br>`staff.employee.checked_out` | `shift.opened`<br>`shift.closed` |
| **Materials** | ✅ Obligatorio | `materials.stock.snapshot_taken`<br>`materials.low_stock.alert` | `shift.opened`<br>`shift.closed` |
| **Sales** | ✅ Obligatorio | `sales.first_sale`<br>`sales.payment.completed` | `shift.opened` |
| **Production** | ⚠️ Condicional | `production.batch.started` | `shift.opened` |
| **Scheduling** | 🔵 Opcional | `scheduling.shift.started` | - |

**Al Abrir Turno**:
1. ✅ Abrir Cash Session (fondo inicial)
2. ✅ Check-in de staff programado
3. ✅ Tomar snapshot de inventario inicial
4. ⚠️ Verificar stock crítico (alertas si bajo)
5. ⚠️ Iniciar producción si aplica

**Al Cerrar Turno**:
1. ✅ Cerrar Cash Session (arqueo ciego)
2. ✅ Check-out de staff
3. ✅ Tomar snapshot de inventario final
4. ✅ Generar reporte de diferencias (mermas)
5. ✅ Reconciliar ventas vs cash
6. ⚠️ Verificar órdenes pendientes

---

### 2️⃣ **professional_services** (Servicios Profesionales)

**Ejemplos**: Salón de belleza, Consultorio médico, Asesoría legal

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Staff** | ✅ Obligatorio | `staff.professional.checked_in`<br>`staff.professional.checked_out` | `shift.opened`<br>`shift.closed` |
| **Scheduling** | ✅ Obligatorio | `scheduling.appointment.completed`<br>`scheduling.appointment.no_show` | `shift.opened` |
| **Cash** | ⚠️ Condicional | `cash.session.opened`<br>`cash.session.closed` | `shift.opened`<br>`shift.closed` |
| **Sales** | 🔵 Opcional | `sales.service.completed` | - |
| **Materials** | ❌ No aplica | - | - |

**Al Abrir Turno**:
1. ✅ Check-in de profesionales
2. ✅ Cargar agenda del día (appointments)
3. ⚠️ Abrir Cash Session (si cobran efectivo)
4. 🔵 Verificar disponibilidad de salas/cabinas

**Al Cerrar Turno**:
1. ✅ Check-out de profesionales
2. ✅ Generar reporte de appointments (completados/no-show)
3. ✅ Cerrar Cash Session (si aplica)
4. 🔵 Calcular comisiones de profesionales

---

### 3️⃣ **asset_rental** (Alquiler de Activos)

**Ejemplos**: Rental de equipos, Alquiler de autos, Renta de espacios

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Assets** | ✅ Obligatorio | `assets.checkout`<br>`assets.checkin`<br>`assets.damaged.reported` | `shift.opened`<br>`shift.closed` |
| **Staff** | ✅ Obligatorio | `staff.employee.checked_in`<br>`staff.employee.checked_out` | `shift.opened`<br>`shift.closed` |
| **Cash** | ⚠️ Condicional | `cash.deposit.received`<br>`cash.session.closed` | `shift.opened`<br>`shift.closed` |
| **Scheduling** | ✅ Obligatorio | `scheduling.rental.started`<br>`scheduling.rental.ended` | - |
| **Sales** | 🔵 Opcional | `sales.rental.payment` | - |

**Al Abrir Turno**:
1. ✅ Verificar inventario de activos disponibles
2. ✅ Check-in de staff
3. ✅ Revisar reservas del día
4. ✅ Inspeccionar equipos retornados ayer (pendientes)
5. ⚠️ Abrir Cash Session (si manejan depósitos en efectivo)

**Al Cerrar Turno**:
1. ✅ Procesar devoluciones del día
2. ✅ Inspeccionar equipos retornados (condición)
3. ✅ Actualizar disponibilidad para mañana
4. ✅ Generar reporte de activos en renta
5. ✅ Cerrar Cash Session (depósitos/cobros)
6. ⚠️ Alertar sobre rentals vencidos

**Referencias**:
- [Rental Inventory Management Best Practices](https://rentman.io/blog/inventory-control)
- [Equipment Checkout Systems](https://rentmy.co/blog/organizing-your-company-equipment-checkout-system/)

---

### 4️⃣ **membership_subscriptions** (Membresías)

**Ejemplos**: Gym, Co-working, Club social, Streaming

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Memberships** | ✅ Obligatorio | `membership.access.granted`<br>`membership.access.denied` | `shift.opened` |
| **Staff** | ✅ Obligatorio | `staff.employee.checked_in` | `shift.opened`<br>`shift.closed` |
| **Cash** | ❌ No aplica | - | - |
| **Scheduling** | 🔵 Opcional | `scheduling.class.started` | - |

**Al Abrir Turno**:
1. ✅ Check-in de staff (recepción)
2. ✅ Sincronizar membresías activas (billing recurrente)
3. 🔵 Cargar clases/actividades programadas
4. ⚠️ Verificar capacidad de instalaciones

**Al Cerrar Turno**:
1. ✅ Check-out de staff
2. ✅ Generar reporte de accesos del día
3. 🔵 Generar reporte de asistencia a clases
4. ❌ NO hay arqueo de caja (billing automático)

**Referencias**:
- [Subscription Billing Operations](https://staxpayments.com/blog/recurring-billing-for-subscription-based-businesses/)
- [Subscription Management](https://recurly.com/)

---

### 5️⃣ **digital_products** (Productos Digitales)

**Ejemplos**: Cursos online, E-books, Software

| Módulo | Participación | Eventos |
|--------|--------------|---------|
| **Staff** | ❌ No aplica | - |
| **Cash** | ❌ No aplica | - |
| **Scheduling** | ❌ No aplica | - |
| **Sales** | 🔵 Opcional | `sales.download.completed` |

**Al Abrir/Cerrar Turno**:
- ❌ **NO HAY CONCEPTO DE TURNO** (opera 24/7 automático)
- Sistema siempre disponible
- Ventas procesadas automáticamente
- No requiere staff físico

---

### 6️⃣ **onsite_service** (Servicio en Local)

**Aplica A**: Restaurantes, Cafeterías, Bares

**ADICIONAL a las capabilities core** (se combina con `physical_products` o `professional_services`)

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Tables** | ✅ Obligatorio | `tables.opened`<br>`tables.closed`<br>`tables.merged` | `shift.opened`<br>`shift.closed` |
| **Staff** | ✅ Obligatorio | `staff.server.assigned_section` | `shift.opened` |

**Al Abrir Turno**:
1. ✅ Liberar todas las mesas (estado: disponible)
2. ✅ Asignar secciones a meseros
3. ✅ Verificar setup de mesas (cubiertos, etc.)

**Al Cerrar Turno**:
1. ✅ Verificar que NO haya mesas abiertas
2. ⚠️ Alertar si hay mesas sin cerrar
3. ✅ Generar reporte de ocupación

---

### 7️⃣ **delivery_shipping** (Envío a Domicilio)

**Aplica A**: Restaurantes con delivery, E-commerce con logística

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Fulfillment** | ✅ Obligatorio | `delivery.queued`<br>`delivery.dispatched`<br>`delivery.completed` | `shift.opened`<br>`shift.closed` |
| **Mobile** | ⚠️ Condicional | `mobile.driver.checked_in`<br>`mobile.route.completed` | `shift.opened` |
| **Staff** | ✅ Obligatorio | `staff.driver.checked_in` | `shift.opened`<br>`shift.closed` |

**Al Abrir Turno**:
1. ✅ Check-in de drivers
2. ✅ Asignar vehículos/equipos
3. ⚠️ Planificar rutas del día (si mobile_operations activo)
4. ✅ Cargar pedidos pendientes de ayer

**Al Cerrar Turno**:
1. ✅ Verificar deliveries completados vs pendientes
2. ⚠️ Alertar sobre deliveries no completados
3. ✅ Check-out de drivers
4. ✅ Reconciliar cash de deliveries (COD)

---

### 8️⃣ **mobile_operations** (Operaciones Móviles)

**Ejemplos**: Food truck, Servicios a domicilio

| Módulo | Participación | Eventos Emitidos | Eventos Consumidos |
|--------|--------------|------------------|-------------------|
| **Mobile** | ✅ Obligatorio | `mobile.location.updated`<br>`mobile.route.started`<br>`mobile.route.completed` | `shift.opened`<br>`shift.closed` |
| **Materials** | ✅ Obligatorio | `materials.mobile_stock.loaded`<br>`materials.mobile_stock.depleted` | `shift.opened` |
| **Staff** | ✅ Obligatorio | `staff.crew.checked_in` | `shift.opened` |
| **Cash** | ✅ Obligatorio | `cash.session.opened` | `shift.opened`<br>`shift.closed` |

**Al Abrir Turno**:
1. ✅ Cargar inventario al vehículo (desde warehouse)
2. ✅ Check-in de crew
3. ✅ Abrir Cash Session
4. ✅ Definir ubicación del día / ruta planificada
5. ✅ Verificar equipos móviles (GPS, POS móvil)

**Al Cerrar Turno**:
1. ✅ Cerrar Cash Session
2. ✅ Descargar inventario sobrante
3. ✅ Calcular mermas/ventas del día
4. ✅ Check-out de crew
5. ✅ Generar reporte de ubicaciones visitadas

---

## 🔄 COMBINACIONES COMUNES

### Combo 1: **Restaurante Completo**

```typescript
capabilities: [
  'physical_products',
  'onsite_service',
  'pickup_orders',
  'delivery_shipping'
]
```

**Módulos Involucrados**: Cash, Staff, Materials, Sales, Tables, Fulfillment

**Al Abrir Turno**:
```
1. Abrir Cash Session ($5,000 inicial)
   └─ EventBus.emit('cash.session.opened')

2. Check-in de Staff
   ├─ Meseros (onsite)
   ├─ Cajeros (pickup)
   └─ Drivers (delivery)
   └─ EventBus.emit('staff.employee.checked_in') x N

3. Snapshot de Inventario
   └─ EventBus.emit('materials.stock.snapshot_taken')

4. Liberar Mesas
   └─ EventBus.emit('tables.shift_started')

5. Cargar Cola de Deliveries
   └─ EventBus.emit('fulfillment.shift_started')

6. ShiftControl escucha TODOS estos eventos
   └─ Actualiza shiftStore con estado consolidado
```

**Al Cerrar Turno**:
```
1. Verificar Mesas Cerradas
   ├─ Query: ¿Hay mesas abiertas?
   └─ Si SÍ → Alertar, bloquear cierre

2. Verificar Deliveries Completados
   ├─ Query: ¿Hay deliveries en ruta?
   └─ Si SÍ → Alertar, sugerir esperar

3. Check-out de Staff
   └─ EventBus.emit('staff.employee.checked_out') x N

4. Arqueo de Caja
   ├─ Contar efectivo
   ├─ Cerrar Cash Session
   └─ EventBus.emit('cash.session.closed', { variance })

5. Snapshot Final de Inventario
   ├─ Comparar con snapshot inicial
   └─ EventBus.emit('materials.stock.snapshot_taken')
   └─ EventBus.emit('materials.merma.detected', { diff })

6. ShiftControl emite evento final
   └─ EventBus.emit('shift.closed', { summary })
```

---

### Combo 2: **Salón de Belleza**

```typescript
capabilities: [
  'professional_services',
  'onsite_service'
]
```

**Módulos Involucrados**: Staff, Scheduling, Cash (opcional)

**Al Abrir Turno**:
```
1. Check-in de Profesionales
   └─ EventBus.emit('staff.professional.checked_in', { skills })

2. Cargar Agenda del Día
   └─ EventBus.emit('scheduling.day_loaded', { appointments })

3. Verificar Salas/Cabinas Disponibles
   └─ Query: Assets disponibles

4. Abrir Cash Session (si aplica)
   └─ EventBus.emit('cash.session.opened')
```

**Al Cerrar Turno**:
```
1. Check-out de Profesionales
   └─ EventBus.emit('staff.professional.checked_out')

2. Generar Reporte de Appointments
   ├─ Completados: 18
   ├─ No-shows: 2
   ├─ Cancelados: 1
   └─ EventBus.emit('scheduling.day_summary', { stats })

3. Cerrar Cash Session (si aplica)
   └─ EventBus.emit('cash.session.closed')

4. Calcular Comisiones
   └─ EventBus.emit('staff.commissions.calculated', { totals })
```

---

### Combo 3: **Food Truck**

```typescript
capabilities: [
  'physical_products',
  'mobile_operations',
  'pickup_orders'
]

infrastructure: 'mobile_business'
```

**Módulos Involucrados**: Mobile, Cash, Staff, Materials

**Al Abrir Turno**:
```
1. Cargar Inventario al Truck
   ├─ Desde warehouse → truck
   └─ EventBus.emit('materials.mobile_stock.loaded', { items })

2. Check-in de Crew
   └─ EventBus.emit('staff.crew.checked_in', { members })

3. Abrir Cash Session
   └─ EventBus.emit('cash.session.opened', { float: 500 })

4. Definir Ubicación del Día
   └─ EventBus.emit('mobile.location.set', { coords, name })

5. Iniciar Ruta (si múltiples paradas)
   └─ EventBus.emit('mobile.route.started', { stops })
```

**Al Cerrar Turno**:
```
1. Cerrar Cash Session
   └─ EventBus.emit('cash.session.closed')

2. Descargar Inventario Sobrante
   ├─ Truck → warehouse
   └─ EventBus.emit('materials.mobile_stock.unloaded', { remaining })

3. Calcular Mermas
   ├─ Inicial - Vendido - Final = Merma
   └─ EventBus.emit('materials.merma.detected', { amount })

4. Check-out de Crew
   └─ EventBus.emit('staff.crew.checked_out')

5. Completar Ruta
   └─ EventBus.emit('mobile.route.completed', { locations, revenue })
```

---

## 🏗️ ARQUITECTURA EVENT-DRIVEN

### Patrón: Capability-Aware Event Subscriptions

```typescript
// src/modules/shift-control/manifest.tsx

setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');
  const { hasCapability } = useCapabilityStore.getState();

  // ============================================
  // CORE: Siempre suscribir (todas las capabilities)
  // ============================================

  // Staff (casi siempre aplica, excepto digital_products)
  if (!hasCapability('digital_products') || hasCapability('professional_services')) {
    eventBus.subscribe('staff.employee.checked_in', handleStaffCheckIn);
    eventBus.subscribe('staff.employee.checked_out', handleStaffCheckOut);
  }

  // ============================================
  // CONDITIONAL: Según capability activa
  // ============================================

  // Cash Session (solo si physical_products)
  if (hasCapability('physical_products')) {
    eventBus.subscribe('cash.session.opened', handleCashOpened);
    eventBus.subscribe('cash.session.closed', handleCashClosed);
    eventBus.subscribe('cash.discrepancy.detected', handleDiscrepancy);
  }

  // Materials/Inventory (physical_products O asset_rental)
  if (hasCapability('physical_products') || hasCapability('asset_rental')) {
    eventBus.subscribe('materials.stock.snapshot_taken', handleStockSnapshot);
    eventBus.subscribe('materials.low_stock.alert', handleLowStock);
  }

  // Tables (onsite_service + physical_products = restaurant)
  if (hasCapability('onsite_service') && hasCapability('physical_products')) {
    eventBus.subscribe('tables.opened', handleTableOpened);
    eventBus.subscribe('tables.closed', handleTableClosed);
  }

  // Appointments (professional_services)
  if (hasCapability('professional_services')) {
    eventBus.subscribe('scheduling.appointment.completed', handleAppointment);
    eventBus.subscribe('scheduling.appointment.no_show', handleNoShow);
  }

  // Asset Rental
  if (hasCapability('asset_rental')) {
    eventBus.subscribe('assets.checkout', handleAssetCheckout);
    eventBus.subscribe('assets.checkin', handleAssetCheckin);
    eventBus.subscribe('assets.damaged.reported', handleAssetDamage);
  }

  // Mobile Operations
  if (hasCapability('mobile_operations')) {
    eventBus.subscribe('mobile.location.updated', handleLocationUpdate);
    eventBus.subscribe('mobile.route.completed', handleRouteCompleted);
    eventBus.subscribe('materials.mobile_stock.loaded', handleMobileStockLoad);
  }

  // Delivery
  if (hasCapability('delivery_shipping')) {
    eventBus.subscribe('delivery.dispatched', handleDeliveryDispatched);
    eventBus.subscribe('delivery.completed', handleDeliveryCompleted);
  }
}
```

---

## 📐 EVENTOS A DEFINIR/AGREGAR

### Eventos que YA EXISTEN ✅

- `cash.session.opened`
- `cash.session.closed`
- `cash.discrepancy.detected`

### Eventos que FALTAN AGREGAR ❌

#### Staff Module
```typescript
❌ 'staff.employee.checked_in'
❌ 'staff.employee.checked_out'
❌ 'staff.professional.checked_in'
❌ 'staff.crew.checked_in'
```

#### Materials Module
```typescript
❌ 'materials.stock.snapshot_taken'
❌ 'materials.low_stock.alert'
❌ 'materials.merma.detected'
❌ 'materials.mobile_stock.loaded'
❌ 'materials.mobile_stock.unloaded'
```

#### Scheduling Module
```typescript
❌ 'scheduling.appointment.completed'
❌ 'scheduling.appointment.no_show'
❌ 'scheduling.shift.started'
❌ 'scheduling.shift.ended'
❌ 'scheduling.day_loaded'
```

#### Tables Module
```typescript
❌ 'tables.opened'
❌ 'tables.closed'
❌ 'tables.shift_started'
```

#### Assets Module
```typescript
❌ 'assets.checkout'
❌ 'assets.checkin'
❌ 'assets.damaged.reported'
```

#### Mobile Module
```typescript
❌ 'mobile.location.updated'
❌ 'mobile.route.started'
❌ 'mobile.route.completed'
```

#### Delivery Module
```typescript
❌ 'delivery.dispatched'
❌ 'delivery.completed'
```

---

## 🎯 SHIFT-CONTROL: EVENTOS QUE EMITE

```typescript
// Eventos que Shift-Control emitirá para coordinar

'shift.opening'      // Notificar que el turno está por abrirse
'shift.opened'       // Turno abierto exitosamente
'shift.closing'      // Notificar que se va a cerrar (validaciones)
'shift.closed'       // Turno cerrado exitosamente
'shift.validation.failed' // Cierre bloqueado por validación
'shift.handover.started'  // Cambio de turno (si aplica)
'shift.handover.completed' // Handover completado
```

---

## 📋 VALIDACIONES AL CERRAR TURNO

### Validaciones por Capability

```typescript
interface ShiftCloseValidation {
  capability: BusinessCapabilityId;
  validations: Array<{
    check: string;
    blocking: boolean; // Si falla, bloquea cierre
    module: string;
  }>;
}

const closeValidations: ShiftCloseValidation[] = [
  {
    capability: 'physical_products',
    validations: [
      {
        check: 'No hay mesas abiertas',
        blocking: true,
        module: 'tables'
      },
      {
        check: 'Inventario contado',
        blocking: true,
        module: 'materials'
      },
      {
        check: 'Cash session cerrada',
        blocking: true,
        module: 'cash'
      }
    ]
  },
  {
    capability: 'delivery_shipping',
    validations: [
      {
        check: 'No hay deliveries en ruta',
        blocking: false, // Warning, no bloqueante
        module: 'fulfillment'
      }
    ]
  },
  {
    capability: 'asset_rental',
    validations: [
      {
        check: 'Devoluciones procesadas',
        blocking: true,
        module: 'assets'
      },
      {
        check: 'Inspecciones completadas',
        blocking: false,
        module: 'assets'
      }
    ]
  }
];
```

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar y aprobar** este documento
2. **Priorizar capabilities** a implementar primero
3. **Agregar eventos faltantes** en módulos existentes
4. **Implementar ShiftControl Module** con suscripciones adaptativas
5. **Testing** por capability

---

## 📚 REFERENCIAS

### Investigación Teórica
- [Microsoft Dynamics: Shift Management](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)
- [Restaurant Shift Handover Procedures](https://tableo.com/operations/restaurant-shift-handover/)
- [Cash Handling Best Practices](https://ramp.com/blog/cash-handling-policy-template)
- [Rental Equipment Inventory Control](https://rentman.io/blog/inventory-control)
- [Subscription Billing Operations](https://staxpayments.com/blog/recurring-billing-for-subscription-based-businesses/)

### Arquitectura del Proyecto
- `src/lib/events/EventBus.ts`
- `docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md`
- `src/config/types/atomic-capabilities.ts`

---

**Documento creado por**: Claude Code
**Estado**: 🟡 Pendiente revisión y aprobación
**Última actualización**: 2025-01-26
