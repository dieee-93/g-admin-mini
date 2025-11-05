# 🔑 RENTALS MODULE - Production Ready

**Module**: Rentals (Asset/Equipment Rental)
**Phase**: Phase 3 P4 - Module 3/5
**Estimated Time**: 4-5 hours
**Priority**: P4 (Advanced - depends on customers + scheduling)

---

## 📋 OBJECTIVE

Make the **Rentals module** production-ready following the 10-criteria checklist.

**Why this module in P4**: Asset rental and reservation management. Requires customer data and scheduling calendar integration.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ⚠️ **Scaffolding ordered**: Page exists, need services/, types/ structure
3. ⚠️ **Zero errors**: 4 ESLint errors in manifest (unused vars + any type)
4. ⚠️ **UI complete**: Page skeleton exists, needs full CRUD
5. ❌ **Cross-module mapped**: No README exists
6. ⚠️ **Zero duplication**: Need to audit for repeated logic
7. ❌ **DB connected**: No service layer exists
8. ✅ **Features mapped**: Optional features defined
9. ⚠️ **Permissions designed**: minimumRole set (SUPERVISOR), need full integration
10. ❌ **README**: Needs creation

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/rentals/manifest.tsx` ⚠️ (101 lines, 4 errors)
- **Page**: `src/pages/admin/operations/rentals/page.tsx` ⚠️ (skeleton exists)
- **README**: ❌ TO CREATE
- **Database Tables**: `rentals`, `rental_items`, `rental_reservations` (need to verify)

### Current Structure
```
src/modules/rentals/
├── manifest.tsx                              # ⚠️ Has 4 ESLint errors
└── components/
    └── RentalsWidget.tsx                     # ✅ Dashboard widget

src/pages/admin/operations/rentals/
├── page.tsx                                  # ⚠️ Skeleton with tabs
├── components/
│   ├── RentalFormEnhanced.tsx                # ⚠️ Form exists
│   ├── RentalAnalyticsEnhanced.tsx           # ⚠️ Analytics exists
│   └── RentalFormModal.tsx                   # ⚠️ Modal exists
└── hooks/
    ├── useRentalForm.tsx                     # ⚠️ Form hook exists
    └── index.ts                              # ✅ Barrel export

MISSING:
├── services/                                 # ❌ Need to create
│   ├── rentalApi.ts                          # ❌ CRUD operations
│   └── index.ts                              # ❌ Barrel export
├── types/                                    # ❌ Need to create
│   ├── rental.ts                             # ❌ Type definitions
│   └── index.ts                              # ❌ Barrel export
└── README.md                                 # ❌ TO CREATE
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `rentals`
- ✅ minimumRole: `SUPERVISOR`
- ✅ autoInstall: `true`
- ✅ depends: `['customers', 'scheduling']`

**ESLint Errors** (4 total):
```typescript
// Line 75: unused 'startTime' parameter
// Line 75: unused 'endTime' parameter
// Line 79: unused 'slot' parameter
// Line 79: 'any' type used
```

**Required Features**: None (optional module)

**Optional Features**:
- `scheduling_appointment_booking` - Time slot reservations
- `scheduling_calendar_management` - Calendar integration

**Hooks**:
- **PROVIDES**:
  - `rentals.availability` - Rental item availability checks
  - `rentals.reservation_created` - Reservation events
  - `dashboard.widgets` - Rental metrics widget

- **CONSUMES**:
  - `scheduling.slot_booked` - Reserve rental time slots
  - `billing.payment_received` - Confirm rental on payment

**Exports**:
- `checkAvailability(assetId, startTime, endTime)` - Check rental availability
- `createReservation(assetId, customerId, slot)` - Create reservation

### Database Schema (TO VERIFY/CREATE)

**Tables** (need to verify in Supabase):

1. **rental_items** (inventory of rentable assets)
```sql
CREATE TABLE rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- equipment, space, vehicle
  description TEXT,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  weekly_rate DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  max_rental_duration_days INTEGER,
  quantity_available INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  images JSONB, -- Array of image URLs
  specifications JSONB, -- Equipment specs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rental_items_type ON rental_items(item_type);
CREATE INDEX idx_rental_items_active ON rental_items(is_active);
```

2. **rental_reservations** (booking records)
```sql
CREATE TABLE rental_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES rental_items(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, active, completed, cancelled
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  rental_rate DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid, refunded
  pickup_datetime TIMESTAMPTZ,
  return_datetime TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_datetime > start_datetime)
);

CREATE INDEX idx_rental_reservations_item ON rental_reservations(item_id);
CREATE INDEX idx_rental_reservations_customer ON rental_reservations(customer_id);
CREATE INDEX idx_rental_reservations_status ON rental_reservations(status);
CREATE INDEX idx_rental_reservations_dates ON rental_reservations(start_datetime, end_datetime);

-- RLS Policies
ALTER TABLE rental_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations"
  ON rental_reservations FOR SELECT
  USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Staff can manage all reservations"
  ON rental_reservations FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

3. **rental_availability** (time slot tracking)
```sql
CREATE TABLE rental_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES rental_items(id),
  date DATE NOT NULL,
  available_quantity INTEGER NOT NULL,
  blocked_slots JSONB, -- Array of time ranges
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, date)
);

CREATE INDEX idx_rental_availability_item_date ON rental_availability(item_id, date);
```

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1️⃣ AUDIT (30 min)

**Tasks**:
- [ ] Fix 4 ESLint errors in `manifest.tsx`
- [ ] Check TypeScript errors
- [ ] Verify database tables exist
- [ ] Test page tabs functionality
- [ ] Check form components
- [ ] Document current state

**Fix ESLint Errors**:
```typescript
// In manifest.tsx exports section
exports: {
  checkAvailability: async (assetId: string, _startTime: Date, _endTime: Date) => { // Add underscore prefix
    logger.debug('App', 'Checking rental availability', { assetId });
    return { available: false };
  },
  createReservation: async (
    assetId: string,
    customerId: string,
    slot: { startTime: Date; endTime: Date; duration: number } // Replace any with proper type
  ) => {
    logger.debug('App', 'Creating rental reservation', { assetId, customerId });
    return { success: true };
  },
}
```

---

### 2️⃣ FIX STRUCTURE (1 hour)

**Service Layer** (`services/rentalApi.ts`):
```typescript
import { supabase } from '@/lib/supabase/client';
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

export const getRentalItems = async (user?: AuthUser | null) => {
  if (user) requireModuleAccess(user, 'rentals');

  const { data, error } = await supabase
    .from('rental_items')
    .select('*')
    .eq('is_active', true)
    .order('item_name');

  if (error) throw error;
  return data;
};

export const checkAvailability = async (
  itemId: string,
  startTime: Date,
  endTime: Date
) => {
  const { data, error } = await supabase
    .from('rental_reservations')
    .select('id')
    .eq('item_id', itemId)
    .eq('status', 'confirmed')
    .or(`start_datetime.lte.${endTime.toISOString()},end_datetime.gte.${startTime.toISOString()}`);

  if (error) throw error;

  return {
    available: data.length === 0,
    conflictingReservations: data.length
  };
};

export const createReservation = async (
  reservation: {
    item_id: string;
    customer_id: string;
    start_datetime: string;
    end_datetime: string;
    rental_rate: number;
    deposit_paid: number;
  },
  user: AuthUser
) => {
  requirePermission(user, 'rentals', 'create');

  // Check availability first
  const { available } = await checkAvailability(
    reservation.item_id,
    new Date(reservation.start_datetime),
    new Date(reservation.end_datetime)
  );

  if (!available) {
    throw new Error('Item not available for selected time period');
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .insert({
      ...reservation,
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: reservation.rental_rate + reservation.deposit_paid
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateReservationStatus = async (
  id: string,
  status: string,
  user: AuthUser
) => {
  requirePermission(user, 'rentals', 'update');

  const { data, error } = await supabase
    .from('rental_reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRentalMetrics = async () => {
  const { data, error } = await supabase
    .rpc('get_rental_metrics');

  if (error) throw error;
  return data;
};
```

**Types** (`types/rental.ts`):
```typescript
export interface RentalItem {
  id: string;
  item_name: string;
  item_type: 'equipment' | 'space' | 'vehicle';
  description?: string;
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount?: number;
  max_rental_duration_days?: number;
  quantity_available: number;
  is_active: boolean;
  images?: string[];
  specifications?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RentalReservation {
  id: string;
  item_id: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  start_datetime: string;
  end_datetime: string;
  rental_rate: number;
  deposit_paid: number;
  total_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  pickup_datetime?: string;
  return_datetime?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  item?: RentalItem;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)

**Tasks**:
- [ ] Create database tables (if missing)
- [ ] Create RLS policies
- [ ] Test rental item CRUD
- [ ] Test reservation CRUD
- [ ] Test availability checking
- [ ] Test calendar integration
- [ ] Test billing integration
- [ ] Test analytics

**Database Migration**:
```sql
-- Create rental metrics function
CREATE OR REPLACE FUNCTION get_rental_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_rentals', (SELECT COUNT(*) FROM rental_reservations WHERE status = 'active'),
    'pending_reservations', (SELECT COUNT(*) FROM rental_reservations WHERE status = 'pending'),
    'total_items', (SELECT COUNT(*) FROM rental_items WHERE is_active = true),
    'utilization_rate', (
      SELECT ROUND(
        (COUNT(DISTINCT r.item_id)::numeric / NULLIF(COUNT(DISTINCT i.id), 0)) * 100,
        2
      )
      FROM rental_items i
      LEFT JOIN rental_reservations r ON r.item_id = i.id AND r.status = 'active'
      WHERE i.is_active = true
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**EventBus Integration** (in manifest.tsx):
```typescript
// Listen to scheduling.slot_booked
eventBus.subscribe('scheduling.slot_booked', async (event) => {
  const { slotId, resourceId, customerId } = event.payload;

  // Check if resource is rental item
  const { data: item } = await supabase
    .from('rental_items')
    .select('id')
    .eq('id', resourceId)
    .single();

  if (item) {
    logger.info('Rentals', 'Creating reservation from scheduling slot', { slotId });
    // Create rental reservation
  }
}, { moduleId: 'rentals' });

// Listen to billing.payment_received
eventBus.subscribe('billing.payment_received', async (event) => {
  const { orderId, amount } = event.payload;

  // Update reservation payment status
  const { data: reservation } = await supabase
    .from('rental_reservations')
    .select('id')
    .eq('id', orderId)
    .single();

  if (reservation) {
    await supabase
      .from('rental_reservations')
      .update({
        payment_status: 'paid',
        status: 'confirmed'
      })
      .eq('id', reservation.id);

    eventBus.emit('rentals.reservation_created', {
      reservationId: reservation.id,
      confirmed: true
    });
  }
}, { moduleId: 'rentals' });
```

**README Template**:
```markdown
# Rentals Module

Asset rental and reservation management system.

## Database Tables
- `rental_items` (rentable inventory)
- `rental_reservations` (booking records)
- `rental_availability` (time slot tracking)

## Features
- Rental item catalog (equipment, spaces, vehicles)
- Availability calendar
- Reservation management
- Payment tracking
- Utilization analytics

## Provides
- `rentals.availability` - Availability checks
- `rentals.reservation_created` - Reservation events
- `dashboard.widgets` - Rental metrics

## Consumes
- `scheduling.slot_booked` - Time slot reservations
- `billing.payment_received` - Payment confirmation

## Permissions
- minimumRole: `SUPERVISOR`
- create: Create reservations
- read: View rental catalog
- update: Modify reservations
- delete: Cancel reservations
```

---

### 5️⃣ VALIDATION (30 min)

**Manual Testing Workflow**:
1. [ ] Create rental item (Conference Room)
2. [ ] Check availability for time period
3. [ ] Create reservation
4. [ ] Verify availability blocked
5. [ ] Process payment (mock)
6. [ ] Confirm reservation
7. [ ] Mark rental as active (pickup)
8. [ ] Mark rental as completed (return)
9. [ ] View analytics
10. [ ] Test with different roles

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui`
- Use `usePermissions('rentals')`
- Check availability before creating reservation
- Block time slots when reservation confirmed
- Track deposit separately from rental rate
- Handle timezone correctly for reservations

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Allow double-booking
- Skip deposit collection
- Delete reservations (soft delete)
- Hardcode rental rates

---

## 📊 SUCCESS CRITERIA

- [ ] 0 ESLint errors (fix 4 in manifest)
- [ ] 0 TypeScript errors
- [ ] All CRUD operations working
- [ ] Availability checking functional
- [ ] Calendar integration working
- [ ] README created
- [ ] Manual testing passed

---

## ⏱️ TIME TRACKING

- [ ] Audit: 30 min
- [ ] Fix Structure: 1 hour
- [ ] Database & Functionality: 1.5 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 30 min

**Total**: 4.5 hours

---

**Status**: 🔴 NOT STARTED (fix manifest errors first)
**Dependencies**: Customers ✅, Scheduling (partial)
**Next**: Assets (after Rentals complete)
