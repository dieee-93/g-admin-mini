# Rentals Module

Asset rental and reservation management system for equipment, spaces, vehicles, and tools.

## 📋 Overview

The Rentals module provides comprehensive functionality for managing rental items and reservations with:
- Multi-type asset catalog (equipment, spaces, vehicles, tools)
- Real-time availability checking
- Flexible pricing (hourly, daily, weekly, monthly)
- Condition tracking (checkout/return)
- Payment integration
- Calendar/scheduling integration

## 🗄️ Database Tables

### `rental_items` (Rentable Assets Catalog)

Stores the inventory of items available for rent.

**Key Columns**:
- `item_name`, `item_type` - Asset identification
- `hourly_rate`, `daily_rate`, `weekly_rate`, `monthly_rate` - Flexible pricing
- `deposit_amount` - Security deposit
- `quantity_available` - Units available for rent
- `condition` - Asset condition tracking
- `specifications` - JSONB for custom specs

**Indexes**: `item_type`, `is_active`, `condition`

### `rental_reservations` (Booking Records)

Tracks all rental reservations and active rentals.

**Key Columns**:
- `item_id` → `rental_items` (what is rented)
- `customer_id` → `customers` (who is renting)
- `status` - `pending`, `confirmed`, `active`, `completed`, `cancelled`
- `start_datetime`, `end_datetime` - Rental period
- `actual_pickup_datetime`, `actual_return_datetime` - Actual times
- `rental_rate`, `rate_type` - Pricing details
- `payment_status` - `unpaid`, `partial`, `paid`, `refunded`, `overdue`
- `checkout_condition`, `return_condition` - Condition tracking
- `damage_report`, `damage_fees` - Damage handling

**Indexes**: `item_id`, `customer_id`, `status`, `dates`, `payment_status`

**RLS Policies**:
- Users can view their own reservations
- Staff (SUPERVISOR+) can manage all reservations

## 🎯 Features

### Core Functionality

1. **Rental Item Management**
   - Create/edit rental items
   - Multi-type support (equipment, space, vehicle, tools)
   - Flexible pricing models
   - Quantity and availability tracking
   - Condition monitoring

2. **Reservation System**
   - Real-time availability checking
   - Conflict detection
   - Automatic date validation
   - Customer assignment
   - Status workflow management

3. **Rental Lifecycle**
   - Pending → Confirmed → Active → Completed
   - Pickup tracking
   - Return tracking
   - Condition inspection
   - Damage reporting

4. **Payment Integration**
   - Deposit collection
   - Payment status tracking
   - Late fee calculation
   - Damage fee handling
   - Multiple payment methods

### Advanced Features

5. **Analytics & Metrics**
   - Active rentals count
   - Utilization rates
   - Revenue tracking
   - Popular items
   - Maintenance scheduling

6. **Cross-Module Integration**
   - **Customers**: Linked to customer records
   - **Scheduling**: Time slot reservations
   - **Billing**: Payment processing
   - **EventBus**: Real-time event propagation

## 🔌 API Reference

### Service Layer (`services/rentalApi.ts`)

#### Rental Items

```typescript
// Get all active rental items
getRentalItems(): Promise<RentalItem[]>

// Get items by type
getRentalItemsByType(type: 'equipment' | 'space' | 'vehicle' | 'tools'): Promise<RentalItem[]>

// Get single item
getRentalItem(id: string): Promise<RentalItem | null>

// Create rental item
createRentalItem(input: CreateRentalItemInput): Promise<RentalItem>

// Update rental item
updateRentalItem(id: string, updates: Partial<CreateRentalItemInput>): Promise<RentalItem>

// Deactivate (soft delete)
deactivateRentalItem(id: string): Promise<void>
```

#### Reservations

```typescript
// Get reservations (with filters)
getReservations(filters?: {
  status?: string;
  customer_id?: string;
  item_id?: string;
}): Promise<RentalReservation[]>

// Get single reservation
getReservation(id: string): Promise<RentalReservation | null>

// Check availability
checkAvailability(
  itemId: string,
  startDatetime: string,
  endDatetime: string
): Promise<AvailabilityCheck>

// Create reservation
createReservation(input: CreateReservationInput): Promise<RentalReservation>

// Update reservation
updateReservation(id: string, updates: UpdateReservationInput): Promise<RentalReservation>

// Lifecycle actions
confirmReservation(id: string): Promise<RentalReservation>
startRental(id: string, checkoutCondition): Promise<RentalReservation>
completeRental(id: string, returnCondition, damageReport?, damageFees?): Promise<RentalReservation>
cancelReservation(id: string): Promise<RentalReservation>
```

#### Metrics

```typescript
// Get system metrics
getRentalMetrics(): Promise<RentalMetrics>

// Get active count
getActiveRentalsCount(): Promise<number>

// Get upcoming reservations
getUpcomingReservations(limit?: number): Promise<RentalReservation[]>
```

## 🔌 Module Integration

### Hooks Provided

The Rentals module exposes these hooks for other modules:

```typescript
// Check rental availability
registry.getModuleExport('rentals', 'checkAvailability')(
  itemId: string,
  startDatetime: string,
  endDatetime: string
)

// Create reservation
registry.getModuleExport('rentals', 'createReservation')(
  itemId: string,
  customerId: string,
  startDatetime: string,
  endDatetime: string,
  rentalRate: number
)
```

### EventBus Events

**Emits**:
- `rentals.reservation_created` - New reservation created/confirmed
- `rentals.availability` - Availability check results

**Listens to**:
- `billing.payment_received` - Confirms reservations on payment
  - When payment with `metadata.type = 'rental'` is received
  - Automatically updates reservation to `confirmed` and `paid`
  - Emits `rentals.reservation_created` event

- `scheduling.slot_booked` - Creates reservations from scheduling
  - Automatically checks if booked resource is a rental item
  - Validates availability and calculates rate based on duration
  - Creates reservation with appropriate rate type (hourly/daily/weekly/monthly)
  - Links reservation to scheduling slot
  - Emits `rentals.reservation_created` event

## 🎨 UI Components

Located in `src/pages/admin/operations/rentals/`:

- **page.tsx** - Main rentals page with tabs
- **components/RentalFormEnhanced.tsx** - Create/edit rentals
- **components/RentalAnalyticsEnhanced.tsx** - Analytics dashboard
- **components/RentalFormModal.tsx** - Modal form
- **hooks/useRentalForm.tsx** - Form logic hook

## 🔒 Permissions

**Minimum Role**: `SUPERVISOR`

**Actions**:
- `read` - View rental items and reservations
- `create` - Create new reservations
- `update` - Modify reservations, process returns
- `delete` - Cancel reservations

## 📊 Database Functions

### `get_rental_metrics()`

Returns real-time system metrics:
```sql
SELECT get_rental_metrics();
```

Returns:
```json
{
  "active_rentals": 12,
  "pending_reservations": 5,
  "total_items": 45,
  "utilization_rate": 26.67
}
```

### `check_rental_availability(item_id, start_datetime, end_datetime)`

Checks if an item is available for a specific period:
```sql
SELECT check_rental_availability(
  'uuid-here',
  '2025-02-01 10:00:00+00',
  '2025-02-03 18:00:00+00'
);
```

Returns:
```json
{
  "available": true,
  "available_quantity": 2,
  "total_quantity": 3,
  "daily_rate": 120.00,
  "deposit_amount": 300.00
}
```

## 🚀 Usage Example

```typescript
import {
  getRentalItems,
  createReservation,
  checkAvailability,
  startRental,
  completeRental
} from '@/pages/admin/operations/rentals/services';

// 1. Get available items
const items = await getRentalItems();

// 2. Check availability
const availability = await checkAvailability(
  itemId,
  '2025-02-01T10:00:00Z',
  '2025-02-03T18:00:00Z'
);

// 3. Create reservation
if (availability.available) {
  const reservation = await createReservation({
    item_id: itemId,
    customer_id: customerId,
    start_datetime: '2025-02-01T10:00:00Z',
    end_datetime: '2025-02-03T18:00:00Z',
    rental_rate: 240.00,
    deposit_paid: 100.00
  });

  // 4. Start rental (pickup)
  await startRental(reservation.id, 'good');

  // 5. Complete rental (return)
  await completeRental(reservation.id, 'good');
}
```

### Scheduling Integration Example

```typescript
import { eventBus } from '@/lib/events';

// Book a rental item through scheduling system
eventBus.emit('scheduling.slot_booked', {
  resourceId: 'rental-item-uuid',  // Must match rental_items.id
  slotId: 'slot-uuid',
  customerId: 'customer-uuid',
  startTime: '2025-02-01T10:00:00Z',
  endTime: '2025-02-03T18:00:00Z',
  metadata: {
    depositPaid: 100.00  // Optional deposit amount
  }
});

// Rentals module will automatically:
// 1. Verify the resource is a rental item
// 2. Check availability
// 3. Calculate appropriate rate (hourly/daily/weekly/monthly)
// 4. Create the reservation
// 5. Emit rentals.reservation_created event
```

### Payment Integration Example

```typescript
import { eventBus } from '@/lib/events';

// Process payment for a rental reservation
eventBus.emit('billing.payment_received', {
  orderId: 'payment-uuid',
  amount: 450.00,
  metadata: {
    type: 'rental',
    reservationId: 'reservation-uuid'
  }
});

// Rentals module will automatically:
// 1. Update reservation status to 'confirmed'
// 2. Update payment_status to 'paid'
// 3. Emit rentals.reservation_created event with confirmed: true
```

## 🔧 Configuration

**Dependencies**: `customers`, `scheduling` (optional)

**Optional Features**:
- `scheduling_appointment_booking` - Enable time slot reservations
- `scheduling_calendar_management` - Calendar view integration

## 📝 Notes

- All monetary values use `DECIMAL(10,2)` for precision
- Dates use `TIMESTAMPTZ` for timezone support
- RLS policies ensure data security
- Soft deletes via `is_active` flag
- Conflict detection prevents double-booking
- Automatic total calculation on reservation creation

## 🐛 Troubleshooting

**Reservation fails with "Item not available"**:
- Check `quantity_available` in `rental_items`
- Verify no conflicting confirmed/active reservations
- Check item `is_active` status

**Payment not confirming reservation**:
- Ensure payment event includes `metadata.type = 'rental'`
- Verify `metadata.reservationId` is correct
- Check EventBus subscription is active

**Availability check returns wrong data**:
- Verify date format is ISO 8601 with timezone
- Check database function `check_rental_availability`
- Ensure item ID is valid UUID

## 📚 Related Modules

- **Customers** - Customer management (required)
- **Scheduling** - Time slot management (optional)
- **Billing** - Payment processing
- **Dashboard** - Rental metrics widget

---

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: 2025-01-31
