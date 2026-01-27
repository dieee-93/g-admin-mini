# 📅 SCHEDULING AUDIT + POS PLAN FINAL

**Date**: 2025-12-11
**Purpose**: Auditoría rápida de Scheduling + Plan final POS por ProductType

---

## ✅ SCHEDULING MODULE - ESTADO ACTUAL

### 🎯 DESCUBRIMIENTO CLAVE: **YA ES GENÉRICO!**

```typescript
// src/shared/calendar/types/DateTimeTypes.ts

export type BookingType =
  | 'appointment'    // ✅ SERVICE
  | 'class'          // ✅ SERVICE (group)
  | 'space'          // ✅ ONSITE (rooms)
  | 'rental'         // ✅✅✅ RENTAL - YA CONTEMPLADO!
  | 'shift'          // ✅ Staff shifts
  | 'event'          // ✅ Events/parties
  | 'maintenance'    // ✅ Downtime
  | 'blocked';       // ✅ Unavailable

export type ResourceType =
  | 'staff'          // ✅ Employees (SERVICE)
  | 'room'           // ✅ Spaces (RENTAL, ONSITE)
  | 'equipment'      // ✅ Tools (RENTAL)
  | 'vehicle'        // ✅ Cars (RENTAL)
  | 'table'          // ✅ Restaurant (ONSITE)
  | 'asset';         // ✅ Generic

// UNIVERSAL BOOKING:
interface Booking {
  id: string;
  type: BookingType;        // ← Genérico!
  status: BookingStatus;
  timeSlot: TimeSlot;
  resourceIds: string[];    // ← Múltiples recursos!
  customerId?: string;
  businessModel: string;    // ← Flexible!
  cost?: number;
}
```

**Conclusión**: **Sistema de booking unificado** - Funciona para SERVICE, RENTAL, ONSITE, etc.

---

## 📦 COMPONENTES SCHEDULING - Inventario

### Existen (from manifest):
```
✅ WeeklySchedule - Vista semanal
✅ Calendar components - Sistema calendario
✅ Appointments components - Appointments management
✅ TimeOff - Time-off requests
✅ Analytics - Labor costs, coverage
✅ Scheduling hooks - useScheduling()
```

### Faltan para POS (necesarios):
```
❌ DateTimePickerLite - Quick datetime selector (POS SERVICE)
❌ PeriodPicker - From/to dates (POS RENTAL)
❌ TimeSlotPicker - Discrete slots (POS PICKUP)
❌ BookingService - CRUD genérico (backend)
```

---

## 🎨 POS PLAN - Por ProductType (FINAL)

### 🍔 PHYSICAL - Onsite

```
COMPONENTES:
├─ TableSelectorLite         (from Onsite)
├─ ProductSearch             (shared)
├─ DirectOrderList           (specific - NO cart)
└─ PaymentProcessor          (shared, mode: immediate)

FLUJO:
1. Seleccionar mesa          → TableSelectorLite
2. Buscar productos          → ProductSearch (filter: PHYSICAL)
3. Agregar items             → DirectOrderList.add()
4. [Enviar a Cocina] (cada item individual)
5. Al final: [Cerrar Cuenta y Cobrar]

PATTERN: DIRECT_ORDER
- Items se envían INMEDIATAMENTE a cocina
- NO es cart (no checkout, no review)
- Cuenta se construye en tiempo real

SCHEDULING: ❌ No usa (relación indirecta vía production)
```

### 🍔 PHYSICAL - Delivery

```
COMPONENTES:
├─ AddressFormLite           (from Delivery)
├─ DeliveryZoneValidator     (from Delivery)
├─ ProductSearch             (shared)
├─ CartSummary               (shared, variant: cart)
├─ DeliveryTimePicker        (from Delivery)
│  └─ PUEDE usar TimeSlotPicker base si delivery programado
└─ PaymentProcessor          (shared, mode: immediate)

FLUJO:
1. Dirección entrega         → AddressFormLite
2. Buscar productos          → ProductSearch
3. Agregar a cart            → CartSummary.add()
4. Revisar cart              → CartSummary (quantities, remove)
5. Tiempo entrega            → DeliveryTimePicker
   - ASAP (default)
   - Programado (usa TimeSlotPicker)
6. Pagar                     → PaymentProcessor

PATTERN: CART
- Acumulación → Review → Checkout → Pago

SCHEDULING: ⚪ Opcional (delivery programado)
```

### 🍔 PHYSICAL - Pickup

```
COMPONENTES:
├─ PickupLocationSelector    (from Pickup)
├─ ProductSearch             (shared)
├─ CartSummary               (shared)
├─ TimeSlotPicker            (from Scheduling ← NEW)
└─ PaymentProcessor          (shared, mode: immediate)

FLUJO:
1. Buscar productos          → ProductSearch
2. Agregar a cart            → CartSummary
3. Ubicación retiro          → PickupLocationSelector
4. Horario retiro            → TimeSlotPicker
   - Slots: 12:00, 12:30, 13:00, etc.
5. Pagar                     → PaymentProcessor

PATTERN: CART + Scheduled pickup

SCHEDULING: ✅ Usa (TimeSlotPicker)
```

### 📅 SERVICE - Appointment

```
COMPONENTES:
├─ ProductSearch             (shared, filter: SERVICE)
├─ DateTimePickerLite        (from Scheduling ← NEW)
├─ StaffSelectorLite         (from Staff)
├─ CustomerSelector          (shared)
└─ PaymentProcessor          (shared, mode: prepay)

FLUJO:
1. Seleccionar servicio      → ProductSearch
2. Fecha/Hora                → DateTimePickerLite
   - Muestra slots disponibles
   - Valida conflicts vía BookingService
3. Profesional               → StaffSelectorLite
   - Filtrado por availability en datetime
4. Cliente                   → CustomerSelector
5. Pagar (prepago opcional)  → PaymentProcessor

PATTERN: BOOKING (appointment)

SCHEDULING: ✅✅✅ Core dependency
- BookingService.checkAvailability(staff, datetime)
- BookingService.create(type: 'appointment')
```

### 💾 DIGITAL

```
COMPONENTES:
├─ ProductSearch             (shared, filter: DIGITAL)
├─ EmailDeliveryForm         (specific, simple)
├─ CartSummary               (shared, variant: cart)
└─ PaymentProcessor          (shared, mode: immediate)

FLUJO:
1. Seleccionar producto      → ProductSearch
2. Email entrega             → EmailDeliveryForm
3. Revisar (opcional)        → CartSummary simple
4. Pagar                     → PaymentProcessor
5. Post-payment: Email con link/código

PATTERN: CART simple

SCHEDULING: ❌ No usa
```

### 🎿 RENTAL - Equipment

```
COMPONENTES:
├─ ProductSearch             (shared, filter: RENTAL)
├─ PeriodPicker              (from Scheduling ← NEW)
│  └─ Extends DateTimePicker, muestra from/to
├─ PickupReturnScheduler     (from Pickup)
├─ DepositCalculator         (from Rental)
├─ CustomerSelector          (shared)
└─ PaymentProcessor          (shared, mode: deposit)

FLUJO:
1. Seleccionar item          → ProductSearch
2. Período                   → PeriodPicker
   - From: [15/12/2025 09:00]
   - To: [18/12/2025 18:00]
   - Valida availability vía BookingService
   - Shows conflicts en calendar
3. Pickup/Return             → PickupReturnScheduler
   - Pickup time (within rental start)
   - Return time (within rental end)
4. Cliente                   → CustomerSelector
5. Depósito                  → DepositCalculator
   - Auto-calcula según item value
6. Pagar                     → PaymentProcessor
   - Rental fee + Deposit

PATTERN: BOOKING (rental)

SCHEDULING: ✅✅✅ Core dependency
- BookingService.checkAvailability(equipment, from, to)
- BookingService.create(type: 'rental')
```

### 💳 MEMBERSHIP

```
COMPONENTES:
├─ PlanSelector              (from Membership)
├─ BillingFrequencyPicker    (from Membership)
├─ CustomerSelector          (shared)
└─ PaymentProcessor          (shared, mode: subscription)

FLUJO:
1. Seleccionar plan          → PlanSelector
2. Frecuencia billing        → BillingFrequencyPicker
   - Mensual, Trimestral, Anual
3. Cliente                   → CustomerSelector
4. Setup recurring payment   → PaymentProcessor
5. First payment             → Immediate
6. Auto-billing activado

PATTERN: SUBSCRIPTION

SCHEDULING: ⚪ Optional
- Si membership incluye bookable services
- Member reserva clase → usa DateTimePickerLite
- Aplica member pricing
```

---

## 🧩 COMPONENTES FALTANTES - Prioridad

### CRITICAL (para POS funcional):

```typescript
1. DateTimePickerLite
   Location: src/modules/scheduling/components/DateTimePickerLite.tsx
   Uses: BookingService.getAvailableSlots()
   For: SERVICE POS

2. PeriodPicker
   Location: src/modules/scheduling/components/PeriodPicker.tsx
   Extends: DateTimePicker (from/to dates)
   Uses: BookingService.checkAvailability()
   For: RENTAL POS

3. BookingService (verify if exists, if not create)
   Location: src/modules/scheduling/services/BookingService.ts
   Methods:
   - checkAvailability(resourceType, resourceId, from, to)
   - getAvailableSlots(resourceType, resourceId, date)
   - create(booking: Booking)
   For: All booking types
```

### IMPORTANT (mejoras):

```typescript
4. TimeSlotPicker
   For: PICKUP scheduled, DELIVERY scheduled

5. PickupReturnScheduler
   For: RENTAL pickup/return times

6. DepositCalculator
   For: RENTAL deposits
```

---

## 🔄 RELACIÓN PHYSICAL - SCHEDULING

Como mencionaste:

### Relación INDIRECTA (no en POS form):

```
PHYSICAL + SCHEDULING relaciones:

1. Items elaborados → Production Scheduling
   - Recipe requiere preparación
   - Production module usa Scheduling
   - POS NO muestra esto (backend maneja)

2. TakeAway agendado → Pickup Scheduling
   - Cliente: "Para las 15:00"
   - POS SÍ muestra: TimeSlotPicker
   - RENTAL usa patrón similar

3. Pre-orders → Scheduled delivery
   - Cliente: "Para el sábado"
   - POS SÍ muestra: DatePicker + TimeSlot
   - DELIVERY programado usa esto
```

**En POS Form PHYSICAL**:
- ❌ NO muestra production schedule (interno)
- ✅ SÍ muestra pickup/delivery scheduling (customer-facing)

---

## 📊 TABLA SCHEDULING DEPENDENCY - Actualizada

```
ProductType   │En POS Form│Component            │BookingType Used│
──────────────┼───────────┼─────────────────────┼────────────────┤
PHYSICAL      │           │                     │                │
├─ Onsite     │ ❌        │ -                   │ -              │
├─ Delivery   │ ⚪        │ TimeSlotPicker*     │ -              │
└─ Pickup     │ ✅        │ TimeSlotPicker      │ -              │
──────────────┼───────────┼─────────────────────┼────────────────┤
SERVICE       │ ✅✅✅    │ DateTimePickerLite  │ 'appointment'  │
──────────────┼───────────┼─────────────────────┼────────────────┤
DIGITAL       │ ❌        │ -                   │ -              │
──────────────┼───────────┼─────────────────────┼────────────────┤
RENTAL        │ ✅✅✅    │ PeriodPicker        │ 'rental'       │
──────────────┼───────────┼─────────────────────┼────────────────┤
MEMBERSHIP    │ ⚪        │ DateTimePickerLite**│ 'class'/'appointment'**│

* Solo si delivery programado (opcional)
** Solo si member quiere reservar servicio incluido (post-purchase)
```

---

## ✅ RESUMEN EJECUTIVO

### 1. Scheduling Module:
- ✅ **YA ES GENÉRICO** (Unified Calendar System)
- ✅ Soporta: appointment, rental, class, space, shift, etc.
- ❌ **Faltan componentes Lite para POS** (DateTimePickerLite, PeriodPicker)

### 2. POS Dependencies Finales:
```
PHYSICAL:  Minimal (solo pickup/delivery programado)
SERVICE:   HEAVY (DateTimePickerLite + BookingService)
DIGITAL:   None
RENTAL:    HEAVY (PeriodPicker + BookingService)
MEMBERSHIP: Optional (post-purchase bookings)
```

### 3. Componentes a Crear:
```
Priority 1: DateTimePickerLite, PeriodPicker, BookingService
Priority 2: TimeSlotPicker, DepositCalculator
```

---

---

## ✅ DECISIONES FINALES (Updated 2025-12-12)

### 1. DateTimePickerLite - COMPONENTE A CREAR

**Decision**: Combinar date picker + TimeSlotPicker (shared) existente

**Architecture**:
```tsx
// src/shared/ui/components/business/DateTimePickerLite.tsx
export function DateTimePickerLite({ serviceId, onSelect }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>();
  const { slots, loading } = useAvailableSlots(serviceId, selectedDate);

  return (
    <Stack>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {selectedDate && (
        <TimeSlotPicker // ✅ Component already exists!
          timeSlots={slots}
          config={{ compactMode: true }} // Perfect for POS
          onSlotSelect={(slotId) => onSelect({ date: selectedDate, slotId })}
        />
      )}
    </Stack>
  );
}
```

**Status**: ✅ Strategy defined - implementation ready

---

### 2. PeriodPicker - COMPONENTE A CREAR

**Decision**: Create reusable component with availability checking

**Architecture**:
```tsx
// src/shared/ui/components/business/PeriodPicker.tsx
export function PeriodPicker({ itemId, onPeriodSelect }: Props) {
  const [start, setStart] = useState<{ date: string; time: string }>();
  const [end, setEnd] = useState<{ date: string; time: string }>();
  const { available, conflicts } = useRentalAvailability(itemId, start, end);

  return (
    <Stack>
      <DateTimeInput label="Inicio" value={start} onChange={setStart} />
      <DateTimeInput label="Fin" value={end} onChange={setEnd} />

      <AvailabilityIndicator
        available={available}
        conflicts={conflicts}
      />

      <Button
        disabled={!available}
        onClick={() => onPeriodSelect({ start, end, available })}
      >
        Confirmar Período
      </Button>
    </Stack>
  );
}
```

**Status**: ✅ Strategy defined - implementation ready

---

### 3. BookingService - VERIFICAR SI EXISTE

**Investigation Result**: ✅ Rentals API already has availability checking

**Existing APIs**:
```typescript
// src/pages/admin/operations/rentals/services/rentalApi.ts
✅ checkAvailability(itemId, startDatetime, endDatetime)
✅ createReservation(input)
```

**Decision**: NO need to create generic BookingService - use module-specific APIs:
- SERVICE appointments → Use Scheduling module APIs
- RENTAL → Use existing Rentals API (checkAvailability, createReservation)

**Status**: ✅ Confirmed - APIs exist

---

### 4. Capability-Aware Architecture

**Decision**: Use HookPoints for dynamic ProductType flows

**HookPoints to create**:
1. `sales.pos.product_type_selector` - ProductType tabs/buttons
2. `sales.pos.product_flow` - ProductType-specific UI flow
3. `sales.metrics` - Capability-specific metrics

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

**Status**: ✅ Architecture defined - ready for implementation

---

### 5. SaleFormModal Refactor Strategy

**Current Problems**:
- ❌ Not ProductType-aware
- ❌ Not capability-aware
- ❌ Assumes CART pattern only

**Solution**:
1. Add capability detection
2. Add ProductType state
3. Implement HookPoints for flows
4. Support 4 patterns: CART, DIRECT_ORDER, BOOKING, SUBSCRIPTION

**Status**: ✅ Refactor plan documented in SALES_CLEANUP_PLAN.md

---

### 6. Metrics Strategy

**Decision**: Core (3) + HookPoint for capability metrics

**Core Metrics** (always visible):
1. Revenue Hoy
2. Transacciones Activas
3. Ticket Promedio

**Capability Metrics** (via HookPoint):
- Onsite → Mesas Activas, Ocupación
- Delivery → Deliveries Activos, Tiempo Promedio
- etc.

**Status**: ✅ Architecture defined

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Component Creation (Priority: HIGH)
- [ ] Create DateTimePickerLite (combine date input + TimeSlotPicker)
- [ ] Create PeriodPicker (with availability checking)
- [ ] Investigate if AddressFormLite exists in Delivery module

### Phase 2: SaleFormModal Refactor (Priority: HIGH)
- [ ] Add capability detection hook
- [ ] Add ProductType state management
- [ ] Implement `sales.pos.product_type_selector` HookPoint
- [ ] Implement `sales.pos.product_flow` HookPoint
- [ ] Add pattern detection (CART/DIRECT_ORDER/BOOKING/SUBSCRIPTION)
- [ ] Update useSaleForm hook for ProductType support

### Phase 3: SalesMetrics Refactor (Priority: MEDIUM)
- [ ] Extract core metrics (3 cards)
- [ ] Implement `sales.metrics` HookPoint
- [ ] Update Onsite module to register metrics
- [ ] Update Delivery module to register metrics
- [ ] Add TODO for real metric logic

### Phase 4: Module Registration (Priority: MEDIUM)
- [ ] Update Onsite module manifest with HookPoint registrations
- [ ] Update Scheduling module manifest with SERVICE flow
- [ ] Update Rentals module manifest with RENTAL flow
- [ ] Update Delivery module manifest with metrics

### Phase 5: Testing & Validation (Priority: HIGH)
- [ ] Test capability on/off switching
- [ ] Test ProductType detection
- [ ] Test HookPoint injection
- [ ] Test POS flows for each ProductType (PHYSICAL, SERVICE, RENTAL)

---

## 🚨 PENDING INVESTIGATIONS

1. **AddressFormLite**: Check if exists in `src/modules/fulfillment/delivery/components/`
2. **Capability Hook Pattern**: Review how other components check capabilities
3. **HookPoint Registration**: Review existing module manifests for patterns
4. **Analytics Components**: Decide delete or migrate to Intelligence module

---

## 🎯 USER DECISIONS CONFIRMED

### 1. Capability-Aware via HookPoints ✅
**User said**: "debe adaptarse dinamicamente al sistema de capabilities"

**Decision**: Use HookPoints to inject ProductType flows based on active capabilities

---

### 2. Metrics Stay in Sales ✅
**User said**: "las metricas... tienen que ver con ventas? Si es asi podemos dejarla en ventas justamente"

**Decision**: Keep metrics in Sales module, make them capability-aware via HookPoints, add TODOs for real logic

---

### 3. Analytics Deferred ✅
**User said**: "el modulo intelligence es otra deuda tecnica aun no esta terminado"

**Decision**: Defer Analytics tabs to Intelligence module (technical debt)

---

**Status**: ✅ Auditoría completa + Decisiones finales documentadas
**Next**: Begin implementation - Phase 1 (Component Creation)
**Last Updated**: 2025-12-12
