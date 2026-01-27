# 🔗 CROSS-MODULE DEPENDENCIES - Análisis Completo

**Date**: 2025-12-11
**Version**: 1.0
**Purpose**: Identificar TODAS las dependencias entre módulos para evitar duplicación

---

## 🎯 PROBLEMA IDENTIFICADO

Al diseñar POS adaptativo, notamos que:
- ✅ SERVICE usa SCHEDULING (appointments)
- ❓ **RENTAL también usa SCHEDULING** (calendar availability, booking periods)
- ❓ ¿Qué más estamos olvidando?

**Necesitamos**: Mapa completo de dependencias para reutilizar inteligentemente.

---

## 📊 DEPENDENCIAS POR PRODUCTTYPE

### 1. PHYSICAL Products

```
PHYSICAL depende de:
├─ INVENTORY (materials)
│  ├─ Stock availability
│  ├─ Stock deduction on sale
│  └─ Reorder alerts
│
├─ PRODUCTION (elaborated products)
│  ├─ Recipe/BOM
│  ├─ Production queue (Kitchen Display)
│  └─ Production cost calculation
│
├─ ONSITE (fulfillment)
│  ├─ Table management
│  ├─ Floor plan
│  └─ Service tracking
│
├─ DELIVERY (fulfillment)
│  ├─ Address validation
│  ├─ Zone coverage
│  ├─ Delivery time estimation
│  └─ Driver assignment
│
├─ PICKUP (fulfillment)
│  ├─ Pickup scheduling
│  ├─ Ready notifications
│  └─ Pickup locations
│
└─ SCHEDULING (optional - scheduled orders)
   ├─ Pre-orders con fecha futura
   ├─ Recurring orders (subscription boxes)
   └─ Click & Collect con horario específico
```

**Componentes compartidos**:
```typescript
// PHYSICAL Onsite
<TableSelectorLite>          // from Onsite
<ProductSearch>              // from Products (filters by stock)
<DirectOrderList>            // shows production queue status
<PaymentProcessor>

// PHYSICAL Delivery
<AddressFormLite>            // from Delivery
<DeliveryZoneValidator>      // from Delivery
<DeliveryTimePicker>         // from Delivery (uses Scheduling base?)
<ProductSearch>              // from Products
<CartSummary>
<PaymentProcessor>

// PHYSICAL Pickup (with scheduling)
<PickupLocationSelector>     // from Pickup
<PickupTimeSlotPicker>       // ⚠️  Uses Scheduling calendar base?
<ProductSearch>
<CartSummary>
<PaymentProcessor>
```

---

### 2. SERVICE (Appointments)

```
SERVICE depende de:
├─ SCHEDULING ✅ (HEAVY dependency)
│  ├─ Calendar availability
│  ├─ Time slot management
│  ├─ Booking conflicts resolution
│  ├─ Recurring appointments
│  ├─ Reminders & notifications
│  └─ Cancellation/rescheduling
│
├─ STAFF ✅
│  ├─ Staff assignment
│  ├─ Staff availability
│  ├─ Staff skills/certifications
│  └─ Staff schedule
│
├─ CUSTOMER
│  ├─ Customer preferences
│  ├─ Service history
│  └─ Loyalty points
│
└─ INVENTORY (optional - services that consume materials)
   ├─ Example: Spa service uses products
   ├─ Example: Car wash uses chemicals
   └─ Deduct materials on service completion
```

**Componentes compartidos**:
```typescript
<ServiceSearch>              // from Products (filter: SERVICE)
<DateTimePickerLite>         // from Scheduling ✅
<StaffSelectorLite>          // from Staff ✅
<CustomerSelector>           // shared
<ServiceDurationPicker>      // from Scheduling
<RecurringOptions>           // from Scheduling (if recurring service)
<PaymentProcessor>           // mode: prepay or on-service
```

---

### 3. DIGITAL Products

```
DIGITAL depende de:
├─ PRODUCTS
│  ├─ Digital catalog
│  └─ Pricing
│
├─ DIGITAL MODULE (file delivery)
│  ├─ File storage/CDN
│  ├─ Download links generation
│  ├─ License key generation
│  ├─ Access expiration
│  └─ Version control
│
├─ CUSTOMER
│  ├─ Digital library (purchased items)
│  ├─ Download history
│  └─ License management
│
└─ SCHEDULING (optional - scheduled access)
   ├─ Example: Course access starts on date X
   ├─ Example: Subscription renewal dates
   └─ Time-limited access
```

**Componentes compartidos**:
```typescript
<ProductSearch>              // from Products (filter: DIGITAL)
<EmailDeliveryForm>          // from Digital module
<LicenseTypeSelector>        // from Digital module
<AccessDurationPicker>       // from Digital module (uses Scheduling?)
<CartSummary>
<PaymentProcessor>           // mode: immediate
```

---

### 4. RENTAL Items ⚠️ **MAJOR SCHEDULING DEPENDENCY**

```
RENTAL depende de:
├─ SCHEDULING ✅✅✅ (CRITICAL dependency)
│  ├─ Calendar availability (igual que SERVICE)
│  ├─ Booking periods (from/to dates)
│  ├─ Conflict detection (item ya alquilado)
│  ├─ Recurring rentals (weekly equipment rental)
│  ├─ Pickup/return time slots
│  └─ Maintenance windows (item unavailable)
│
├─ INVENTORY/ASSETS ✅
│  ├─ Item availability (similar to stock)
│  ├─ Item condition tracking
│  ├─ Maintenance schedule
│  └─ Depreciation
│
├─ PICKUP (fulfillment) ✅
│  ├─ Pickup location
│  ├─ Pickup time slot
│  └─ Return location/time
│
├─ CUSTOMER
│  ├─ Rental history
│  ├─ Late fees tracking
│  └─ Deposit refunds
│
└─ FINANCE
   ├─ Deposit management
   ├─ Damage charges
   └─ Late fees calculation
```

**Componentes compartidos**:
```typescript
<RentalItemSearch>           // from Products (filter: RENTAL)
<RentalCalendar>             // ⚠️  REUSES Scheduling calendar!
<PeriodPicker>               // ⚠️  Extension of DateTimePicker
<ItemAvailabilityChecker>    // from Rental (uses Scheduling conflicts)
<PickupReturnScheduler>      // from Pickup + Scheduling hybrid
<DepositCalculator>          // from Rental module
<CustomerSelector>           // shared
<PaymentProcessor>           // mode: deposit
```

**⚠️ KEY INSIGHT**:
```typescript
// Rental calendar IS Scheduling calendar with different entity!

// SERVICE appointment:
{
  resource: Staff (peluquero),
  from: 2025-12-15 10:00,
  to: 2025-12-15 10:30,
  customer: María
}

// RENTAL booking:
{
  resource: RentalItem (esquís),
  from: 2025-12-15 09:00,
  to: 2025-12-18 18:00,
  customer: Pedro
}

// ✅ SAME BOOKING LOGIC, different resource type!
```

---

### 5. MEMBERSHIP (Subscriptions)

```
MEMBERSHIP depende de:
├─ CUSTOMER ✅
│  ├─ Membership status
│  ├─ Benefits access
│  └─ Usage tracking
│
├─ FINANCE ✅
│  ├─ Recurring billing
│  ├─ Payment method storage
│  ├─ Invoice generation
│  └─ Failed payment handling
│
├─ SCHEDULING (optional but common) ✅
│  ├─ Example: Gym membership → book classes
│  ├─ Example: Coworking → book meeting rooms
│  └─ Member appointment priority
│
├─ ACCESS CONTROL
│  ├─ Entry gates (gym check-in)
│  ├─ Digital access (online content)
│  └─ Benefits redemption
│
└─ ANALYTICS
   ├─ Usage patterns
   ├─ Churn prediction
   └─ Upsell opportunities
```

**Componentes compartidos**:
```typescript
<PlanSelector>               // from Membership module
<BillingFrequencyPicker>     // from Membership module
<PaymentMethodSetup>         // from Finance (recurring)
<CustomerSelector>           // shared
<MemberBenefitsPreview>      // from Membership module
<AccessScheduler>            // ⚠️  If membership includes bookable services
<PaymentProcessor>           // mode: subscription
```

---

## 🔄 MÓDULOS COMPARTIDOS - Análisis Detallado

### SCHEDULING Module - El Más Reutilizado

```
SCHEDULING es usado por:
├─ SERVICE ✅✅✅ (appointments)
├─ RENTAL ✅✅✅ (booking periods)
├─ MEMBERSHIP ✅ (member bookings)
├─ PHYSICAL ✅ (scheduled orders, pickup times)
├─ ONSITE ✅ (table reservations)
└─ STAFF ✅ (shift scheduling)

Componentes SCHEDULING:
├─ CalendarView (FULL) → Para Scheduling page
├─ DateTimePicker (BASE) → Reutilizable
│  ├─ DateTimePickerLite → Para POS (SERVICE)
│  ├─ PeriodPicker → Para RENTAL (extends BASE)
│  └─ TimeSlotPicker → Para PICKUP (extends BASE)
│
├─ AvailabilityEngine (LOGIC)
│  ├─ Check conflicts
│  ├─ Calculate available slots
│  └─ Handle different resource types
│
└─ BookingService (API)
   ├─ createBooking(resource, from, to, customer)
   ├─ Resource types: Staff, RentalItem, Table, Room
   └─ Validation & conflict detection
```

**⚠️ CRITICAL DESIGN DECISION**:

```typescript
// SCHEDULING debe ser GENÉRICO, no solo para appointments

// CURRENT (probablemente):
interface Appointment {
  staff_id: string;        // ❌ Hardcoded to staff
  scheduled_time: Date;
  customer_id: string;
}

// SHOULD BE:
interface Booking {
  resource_type: 'STAFF' | 'RENTAL_ITEM' | 'TABLE' | 'ROOM';
  resource_id: string;     // ✅ Generic resource
  from: DateTime;
  to: DateTime;
  customer_id: string;
  booking_type: 'APPOINTMENT' | 'RENTAL' | 'RESERVATION';
}

// ✅ Un sistema de booking, múltiples casos de uso
```

---

### INVENTORY Module - Usado por Múltiples

```
INVENTORY lógica compartida:
├─ PHYSICAL products ✅ (stock tracking)
├─ RENTAL items ✅ (availability tracking - similar a stock)
├─ SERVICE ✅ (services que consumen materials)
└─ PRODUCTION ✅ (materials para recipes)

Shared concepts:
├─ Availability calculation
├─ Reservation/hold mechanism
├─ Deduction on completion
└─ Restock alerts
```

**Abstraction needed**:
```typescript
// Base interface para "things with availability"
interface AvailableResource {
  id: string;
  type: 'MATERIAL' | 'RENTAL_ITEM' | 'STAFF' | 'TABLE';
  available_quantity?: number;  // For countable items
  is_available?: boolean;       // For unique items
  availability_schedule?: Schedule; // For time-based
}

// Shared availability service
class AvailabilityService {
  async checkAvailability(
    resourceId: string,
    quantity: number,
    period?: { from: Date; to: Date }
  ): Promise<boolean> {
    // Works for inventory AND rentals
  }

  async reserve(
    resourceId: string,
    quantity: number,
    period?: { from: Date; to: Date }
  ): Promise<Reservation> {
    // Creates temporary hold
  }
}
```

---

### CUSTOMER Module - Universal

```
CUSTOMER usado por TODOS:
├─ PHYSICAL sales → customer info
├─ SERVICE appointments → customer preferences, history
├─ DIGITAL purchases → digital library
├─ RENTAL bookings → rental history, deposits
└─ MEMBERSHIP subscriptions → membership status

Shared components:
├─ CustomerSelector (autocomplete, quick-add)
├─ CustomerProfile (view/edit)
├─ CustomerHistory (purchase/booking history)
└─ CustomerPreferences (allergies, notes, etc.)
```

---

### PAYMENT/FINANCE Module - Universal

```
PAYMENT usado por TODOS pero con variantes:
├─ PHYSICAL → immediate payment
├─ SERVICE → prepay or pay-on-service
├─ DIGITAL → immediate payment
├─ RENTAL → payment + deposit
└─ MEMBERSHIP → subscription setup (recurring)

Shared PaymentProcessor con modes:
{
  immediate: Full payment now,
  prepay: Advance payment (balance later),
  deposit: Payment + refundable deposit,
  subscription: Setup recurring billing
}
```

---

## 🏗️ DEPENDENCIAS BIDIRECCIONALES

### Ejemplo: ONSITE ↔ SCHEDULING

```
ONSITE usa SCHEDULING:
├─ Table reservations (book table ahead)
├─ Party waitlist with ETA
└─ Scheduled pickup (takeaway orders)

SCHEDULING usa ONSITE:
├─ If appointment includes table (spa with massage table)
├─ Resource = Table (meeting room rental)
└─ Display location (appointment at Table #3)

Shared component:
<TableReservationCalendar>
  Uses: Scheduling calendar engine
  Resource: Table entity
  Display: Floor plan integration
```

---

### Ejemplo: RENTAL ↔ PICKUP

```
RENTAL usa PICKUP:
├─ Pickup location selection
├─ Pickup time slot
├─ Return location/time
└─ Pickup notifications

PICKUP usa RENTAL (implicitly):
├─ Pickup of rental item = rental start
├─ Return of rental item = rental end
└─ Validate item condition on return

Shared flow:
1. RENTAL creates booking with period
2. PICKUP schedules pickup time (within rental start window)
3. PICKUP schedules return time (within rental end window)
4. Customer receives notifications from PICKUP module
```

---

## 📋 TABLA DE DEPENDENCIAS COMPLETA

```
Module        │Sched│Staff│Inv│Prod│Onsite│Deliv│Pick│Cust│Pay│Digital│Rent│Member│
──────────────┼─────┼─────┼───┼────┼──────┼─────┼────┼────┼───┼───────┼────┼──────┤
PHYSICAL      │  ⚪  │     │ ✅│ ✅ │  ✅  │ ✅  │ ✅ │ ✅ │✅ │       │    │      │
SERVICE       │ ✅✅│ ✅✅│ ⚪│    │  ⚪  │     │    │ ✅ │✅ │       │    │      │
DIGITAL       │  ⚪  │     │   │    │      │     │    │ ✅ │✅ │  ✅   │    │      │
RENTAL        │✅✅✅│     │ ✅│    │      │     │ ✅ │ ✅ │✅ │       │    │      │
MEMBERSHIP    │  ✅ │     │   │    │      │     │    │ ✅ │✅ │   ⚪  │    │      │
──────────────┼─────┼─────┼───┼────┼──────┼─────┼────┼────┼───┼───────┼────┼──────┤
SALES (POS)   │ ✅✅│ ✅ │ ✅│ ✅ │  ✅  │ ✅  │ ✅ │ ✅ │✅ │  ✅   │ ✅ │  ✅  │

Legend:
✅✅✅ = Critical dependency (core functionality)
✅✅  = Heavy dependency (major features)
✅   = Normal dependency (uses features)
⚪   = Optional dependency (edge cases)
```

---

## 🧩 COMPONENTES COMPARTIDOS - REVISADO

### Nivel 1: Universal (Todos usan)

```typescript
1. CustomerSelector       // ALL ProductTypes
2. PaymentProcessor       // ALL ProductTypes (different modes)
3. ProductSearch          // ALL ProductTypes (different filters)
```

### Nivel 2: Scheduling-Based (SERVICE, RENTAL, MEMBERSHIP)

```typescript
// BASE COMPONENT (from Scheduling)
<CalendarEngine>
  ├─ Props: resourceType, resourceId
  ├─ Logic: Availability checking, conflict detection
  └─ Used by all time-based bookings

// VARIANTS:
<DateTimePickerLite>         // SERVICE: Single datetime
<PeriodPicker>               // RENTAL: From/to dates + times
<RecurringPicker>            // SERVICE/RENTAL: Recurring bookings
<TimeSlotPicker>             // PICKUP: Discrete time slots
<TableReservationPicker>     // ONSITE: Table + datetime
```

### Nivel 3: Fulfillment-Specific (PHYSICAL variants)

```typescript
<TableSelectorLite>          // ONSITE
<AddressFormLite>            // DELIVERY
<PickupLocationSelector>     // PICKUP
<DeliveryTimePicker>         // DELIVERY (extends TimeSlotPicker?)
```

### Nivel 4: Type-Specific (Unique)

```typescript
<StaffSelectorLite>          // SERVICE only
<DepositCalculator>          // RENTAL only
<PlanSelector>               // MEMBERSHIP only
<EmailDeliveryForm>          // DIGITAL only
<LicenseTypeSelector>        // DIGITAL only
```

---

## ✅ DECISIONES ARQUITECTÓNICAS

### 1. Scheduling Module = Booking Engine (Generic)

```typescript
// RENAME o EXPAND scope:
// src/modules/scheduling → src/modules/booking

export const bookingModule = {
  name: 'Booking Engine',
  description: 'Generic resource booking with calendar',

  supports: [
    'Staff appointments',
    'Rental item bookings',
    'Table reservations',
    'Room bookings',
    'Equipment scheduling'
  ],

  components: {
    CalendarEngine: 'Generic calendar with conflict detection',
    BookingService: 'CRUD + validation for any resource type',
    AvailabilityChecker: 'Check if resource available in period'
  }
};
```

### 2. Inventory Module = Availability Engine (Generic)

```typescript
// EXPAND scope to include rental items:
export const inventoryModule = {
  name: 'Availability Engine',
  description: 'Track availability of countable/unique resources',

  supports: [
    'Material stock (countable)',
    'Rental items (unique, time-based)',
    'Tables (unique, session-based)',
    'Staff (unique, time-based)'
  ],

  sharedLogic: {
    checkAvailability: 'Works for stock AND time-based',
    reserve: 'Temporary hold mechanism',
    deduct: 'On completion/sale'
  }
};
```

### 3. POS usa Lite Versions + Shared Hooks

```typescript
// Pattern confirmed:
CAPABILITY_MODULE/
├─ components/
│  ├─ Full/ (for module's own page)
│  └─ Lite/ (exported for POS/other modules)
├─ hooks/
│  └─ Shared hooks (exported)
├─ services/
│  └─ API services (exported)
└─ manifest.tsx (exports lite + hooks)
```

---

## 🔄 CROSS-MODULE FLOWS - Examples

### Example 1: RENTAL using SCHEDULING + PICKUP

```
RENTAL FLOW:
1. User selects rental item
   └─ RentalItemSearch (from Products, filter: RENTAL)

2. User selects period
   └─ PeriodPicker (from Scheduling, extends DateTimePicker)
   └─ Uses: BookingService.checkAvailability(item, from, to)

3. User selects pickup time/location
   └─ PickupScheduler (from Pickup module)
   └─ Validates: pickup time within rental period start

4. User selects return time/location
   └─ ReturnScheduler (from Pickup module)
   └─ Validates: return time within rental period end

5. System calculates total
   └─ DepositCalculator (from Rental module)
   └─ RentalPricingEngine (from Rental module)

6. Payment
   └─ PaymentProcessor (shared, mode: deposit)

7. Booking created
   └─ BookingService.create() - creates booking
   └─ RentalService.create() - creates rental record
   └─ PickupService.schedule() - schedules pickup
   └─ EventBus.emit('rental.created')
```

### Example 2: SERVICE using SCHEDULING + STAFF

```
SERVICE FLOW:
1. User selects service
   └─ ProductSearch (shared, filter: SERVICE)

2. User selects date/time
   └─ DateTimePickerLite (from Scheduling)
   └─ Uses: BookingService.getAvailableSlots(service)

3. User selects staff
   └─ StaffSelectorLite (from Staff)
   └─ Filters: Only staff available at selected datetime
   └─ Uses: useStaffAvailability(datetime, serviceId)

4. Payment
   └─ PaymentProcessor (shared, mode: prepay)

5. Appointment created
   └─ BookingService.create() - creates booking
   └─ AppointmentService.create() - creates appointment
   └─ NotificationService.scheduleReminder()
   └─ EventBus.emit('appointment.created')
```

### Example 3: MEMBERSHIP with included SERVICES

```
MEMBERSHIP FLOW:
1. User selects plan
   └─ PlanSelector (from Membership)

2. System shows included benefits
   └─ MemberBenefitsPreview
   └─ "Includes: 10 yoga classes/month"

3. User activates membership
   └─ PaymentProcessor (mode: subscription)
   └─ MembershipService.activate()

4. Later: Member books included service
   └─ Goes to Scheduling or Sales POS
   └─ Selects SERVICE (yoga class)
   └─ System detects active membership
   └─ Applies member pricing (free or discounted)
   └─ Deducts from monthly quota (9 classes remaining)

Integration:
├─ MEMBERSHIP provides: Active status, benefits, quota
├─ SCHEDULING provides: Calendar, booking
├─ SERVICE provides: Class availability
└─ All coordinated via CustomerService.getMembershipStatus()
```

---

## 🎯 COMPONENTES FALTANTES IDENTIFICADOS

```
1. GENERIC CALENDAR ENGINE ⚠️
   Current: Probably appointment-specific
   Needed: Generic resource booking
   Location: src/modules/scheduling (expand scope)

2. PERIOD PICKER ⚠️
   Current: Probably doesn't exist
   Needed: For RENTAL from/to dates
   Location: src/modules/scheduling/components/PeriodPicker.tsx
   Extends: DateTimePicker base

3. AVAILABILITY CHECKER (Generic) ⚠️
   Current: Probably inventory-specific
   Needed: Works for stock AND time-based
   Location: src/shared/services/AvailabilityService.ts

4. PICKUP SCHEDULER ⚠️
   Current: May not exist or is delivery-specific
   Needed: For RENTAL pickup/return times
   Location: src/modules/fulfillment/pickup/components/

5. DEPOSIT CALCULATOR ⚠️
   Current: Probably doesn't exist
   Needed: For RENTAL deposits
   Location: src/modules/rentals/components/DepositCalculator.tsx
```

---

## 📊 PRÓXIMOS PASOS SUGERIDOS

### 1. Auditar Scheduling Module

```bash
# Verificar si es genérico o appointment-specific
- ¿Tabla 'bookings' o 'appointments'?
- ¿Soporta diferentes resource types?
- ¿Calendar engine reutilizable?
```

### 2. Crear Componentes Faltantes

```
Priority 1 (Critical):
├─ PeriodPicker (for RENTAL)
├─ Generic BookingService (if not exists)
└─ DepositCalculator (for RENTAL)

Priority 2 (Important):
├─ PickupScheduler (for RENTAL + PICKUP)
├─ Generic AvailabilityChecker
└─ TableReservationPicker (for ONSITE)
```

### 3. Refactor si Necesario

```
IF Scheduling is appointment-only:
  THEN:
    ├─ Rename appointments → bookings
    ├─ Add resource_type field
    ├─ Generalize calendar engine
    └─ Update all references

ELSE:
  ✅ Already generic, just document
```

---

## ✅ CONCLUSIÓN

**Dependencias NO consideradas inicialmente**:

1. ✅ **RENTAL → SCHEDULING** (CRITICAL - same as SERVICE)
2. ✅ **RENTAL → PICKUP** (pickup/return scheduling)
3. ✅ **RENTAL → INVENTORY** (availability tracking)
4. ✅ **MEMBERSHIP → SCHEDULING** (member bookings)
5. ✅ **PHYSICAL → SCHEDULING** (scheduled orders, pickup slots)
6. ✅ **ONSITE → SCHEDULING** (table reservations)

**Key Insight**:
**SCHEDULING no es solo para appointments - es un BOOKING ENGINE genérico usado por múltiples ProductTypes.**

---

**Next Actions**:
1. ¿Auditamos Scheduling module para ver si ya es genérico?
2. ¿Diseñamos PeriodPicker para RENTAL?
3. ¿Identificamos otros componentes faltantes?
