# Achievements System - Implementation Guide

**Status**: Phase 2.4 Complete - Event Payload Optimization  
**Last Updated**: December 19, 2025

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Event Payload Specification](#event-payload-specification)
- [Integration Guide](#integration-guide)
- [Testing](#testing)
- [Migration Checklist](#migration-checklist)
- [References](#references)

---

## Overview

The Achievements System tracks user milestones and validates feature requirements before activation. It uses an event-driven architecture with optimized payloads based on the LinkedIn/Kafka "Self-Contained Events" pattern.

### Key Features

- **Real-time Achievement Detection**: Instant toast notifications when milestones are reached
- **Intelligent Bulk Import Handling**: Detects ALL milestones reached between `previousCount` and `totalCount`
- **Requirement Validation**: Prevents feature activation until prerequisites are met
- **Event-Driven Architecture**: Decoupled via EventBus with TanStack Query cache invalidation

### Milestones Tracked

| Category | Milestones |
|----------|-----------|
| Products | 1, 5, 10, 20, 50, 100, 500 |
| Sales | 1, 10, 50, 100, 500, 1000 |
| Staff | 1, 5, 10, 25, 50 |

---

## Architecture

### Directory Structure

```
src/modules/achievements/
├── types/
│   ├── events.ts              # Event payload interfaces (NEW)
│   └── index.ts               # Achievement types
├── requirements/              # Static requirement definitions
│   ├── productRequirements.ts
│   ├── salesRequirements.ts
│   └── index.ts
├── services/
│   └── progressCalculator.ts  # Pure functions for progress
├── manifest.tsx               # Module manifest with EventBus listeners
├── components/                # UI components
└── __tests__/
    └── achievement-detection.test.ts  # Milestone detection tests
```

### Data Flow

```
┌─────────────────┐
│  User Action    │  (Create product, complete sale, add staff)
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Service Layer  │  (productApi, checkoutService, staffApi)
└────────┬────────┘
         │ 1. Query previousCount from DB
         │ 2. Perform operation
         │ 3. Calculate totalCount
         │ 4. Emit event with both counts
         v
┌─────────────────┐
│   EventBus      │  (Emit 'products.created', 'sales.order_completed', etc.)
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Achievement    │  (Filter milestones: previousCount < m <= totalCount)
│   Listeners     │
└────────┬────────┘
         │
         ├──> Toast Notification (notify.success)
         │
         └──> Cache Invalidation (queryClient.invalidateQueries)
```

---

## Event Payload Specification

### Base Interface

All achievement events extend `BaseAchievementEventPayload`:

```typescript
export interface BaseAchievementEventPayload {
  timestamp: number;
  userId?: string;
  triggeredBy: 'manual' | 'import' | 'api' | 'system';
}
```

### Product Created Event

**Event Name**: `'products.created'`

```typescript
export interface ProductCreatedEventPayload extends BaseAchievementEventPayload {
  product: {
    id: string;
    name: string;
    category?: string;
  };
  totalCount: number;        // Total products after creation
  previousCount: number;     // Total products before creation
}
```

**Example Emission** (from `src/pages/admin/supply-chain/products/services/productApi.ts:107`):

```typescript
// 1. Get current count BEFORE creating product
const { count: previousCount } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true });

// 2. Create product
const { data: newProduct, error } = await supabase
  .from('products')
  .insert([productData])
  .select()
  .single();

// 3. Calculate new total
const totalCount = (previousCount || 0) + 1;

// 4. Emit event with optimized payload
await eventBus.emit('products.created', {
  product: {
    id: newProduct.id,
    name: newProduct.name,
    category: newProduct.category
  },
  totalCount,
  previousCount: previousCount || 0,
  timestamp: Date.now(),
  triggeredBy: 'manual',
  userId: undefined
});
```

### Sale Completed Event

**Event Name**: `'sales.order_completed'`

```typescript
export interface SaleCompletedEventPayload extends BaseAchievementEventPayload {
  orderId: string;
  orderTotal: number;
  items: Array<{ productId: string; quantity: number }>;
  totalSales: number;        // Total sales after completion
  previousTotalSales: number; // Total sales before completion
}
```

**Example Emission** (from `src/modules/sales/ecommerce/services/checkoutService.ts:51`):

```typescript
// 1. Get current sales count
const { count: previousTotalSales } = await supabase
  .from('sales')
  .select('*', { count: 'exact', head: true });

// 2. Create order
const order = await orderService.createOrderFromCart({
  customerId,
  deliveryAddressId,
  paymentMethod,
});

// 3. Get sale items
const { data: saleItems } = await supabase
  .from('sale_items')
  .select('product_id, quantity')
  .eq('sale_id', order.id);

// 4. Calculate new total
const totalSales = (previousTotalSales || 0) + 1;

// 5. Emit event
await eventBus.emit('sales.order_completed', {
  orderId: order.id,
  orderTotal: order.total,
  items: (saleItems || []).map((item: any) => ({
    productId: item.product_id,
    quantity: item.quantity
  })),
  totalSales,
  previousTotalSales: previousTotalSales || 0,
  timestamp: Date.now(),
  triggeredBy: 'manual',
  userId: customerId
});
```

### Staff Member Added Event

**Event Name**: `'staff.member_added'`

```typescript
export interface StaffMemberAddedEventPayload extends BaseAchievementEventPayload {
  staffId: string;
  staffName: string;
  role: string;
  totalStaff: number;         // Total staff after addition
  previousTotalStaff: number; // Total staff before addition
}
```

**Example Emission** (from `src/pages/admin/resources/staff/services/staffApi.ts:300`):

```typescript
// 1. Get current staff count (active only)
const { count: previousTotalStaff } = await supabase
  .from('employees')
  .select('*', { count: 'exact', head: true })
  .eq('employment_status', 'active');

// 2. Create employee
const { data, error } = await supabase
  .from('employees')
  .insert([insertData])
  .select()
  .single();

// 3. Calculate new total
const totalStaff = (previousTotalStaff || 0) + 1;

// 4. Emit event
await eventBus.emit('staff.member_added', {
  staffId: data.id,
  staffName: `${data.first_name} ${data.last_name}`,
  role: data.position,
  totalStaff,
  previousTotalStaff: previousTotalStaff || 0,
  timestamp: Date.now(),
  triggeredBy: 'manual',
  userId: createdBy
});
```

---

## Integration Guide

### Step 1: Import Event Types

```typescript
import type { 
  ProductCreatedEventPayload,
  SaleCompletedEventPayload,
  StaffMemberAddedEventPayload
} from '@/modules/achievements/types/events';
import { PRODUCT_MILESTONES, SALES_MILESTONES, STAFF_MILESTONES } from '@/modules/achievements/types/events';
```

### Step 2: Query Current Count Before Operation

**CRITICAL**: Always query count BEFORE performing the operation:

```typescript
const { count: previousCount } = await supabase
  .from('your_table')
  .select('*', { count: 'exact', head: true });
```

### Step 3: Perform Operation

```typescript
const { data, error } = await supabase
  .from('your_table')
  .insert([yourData])
  .select()
  .single();
```

### Step 4: Calculate New Total

```typescript
const totalCount = (previousCount || 0) + 1;
```

### Step 5: Emit Event with Optimized Payload

```typescript
await eventBus.emit('your.event_name', {
  // Entity data
  entity: { id: data.id, name: data.name },
  
  // Counts (REQUIRED for milestone detection)
  totalCount,
  previousCount: previousCount || 0,
  
  // Metadata
  timestamp: Date.now(),
  triggeredBy: 'manual',
  userId: currentUserId
});
```

### Step 6: Listen to Event (in Achievement Module)

In `src/modules/achievements/manifest.tsx`:

```typescript
{
  event: 'your.event_name',
  handler: async (payload: YourEventPayload) => {
    // Filter milestones reached
    const newMilestones = YOUR_MILESTONES.filter(
      m => payload.previousCount < m && payload.totalCount >= m
    );

    // Notify for each new milestone
    for (const milestone of newMilestones) {
      notify.success({
        title: `¡Logro desbloqueado! 🎉`,
        description: `Has alcanzado ${milestone} items`,
        duration: 5000
      });
    }

    // Invalidate caches
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
  }
}
```

---

## Milestone Detection Logic

### The `previousCount` Pattern

**Why it's essential:**

1. **Prevents Duplicates**: Only notifies when milestone is JUST reached
2. **Handles Bulk Imports**: Shows ALL milestones crossed (e.g., 3 → 12 shows 5 AND 10)
3. **Mathematically Precise**: Uses range filter `previousCount < m <= totalCount`

### Examples

#### Normal Creation (4 → 5 products)
```typescript
previousCount = 4
totalCount = 5

newMilestones = PRODUCT_MILESTONES.filter(m => 4 < m && 5 >= m)
// Result: [5]
// Action: Show "¡5 productos!" notification
```

#### Bulk Import (3 → 12 products)
```typescript
previousCount = 3
totalCount = 12

newMilestones = PRODUCT_MILESTONES.filter(m => 3 < m && 12 >= m)
// Result: [5, 10]
// Action: Show TWO notifications (5 and 10)
```

#### Skip Milestone (9 → 11 products)
```typescript
previousCount = 9
totalCount = 11

newMilestones = PRODUCT_MILESTONES.filter(m => 9 < m && 11 >= m)
// Result: [10]
// Action: Show "¡10 productos!" notification
```

#### No Milestone (2 → 3 products)
```typescript
previousCount = 2
totalCount = 3

newMilestones = PRODUCT_MILESTONES.filter(m => 2 < m && 3 >= m)
// Result: []
// Action: No notification
```

---

## Testing

### Unit Tests

Run milestone detection tests:

```bash
npm test src/modules/achievements/__tests__/achievement-detection.test.ts
```

**Test Coverage:**

- ✅ First product milestone detection
- ✅ Standard milestone detection (5, 10, 20, etc.)
- ✅ No notification on non-milestones
- ✅ Multiple milestones on bulk import
- ✅ Edge cases (null payloads, negative counts)
- ✅ Performance tests

### Manual Testing

1. **Create 1st Product**: Should show "¡Logro desbloqueado! 🎉"
2. **Create 5th Product**: Should show "¡5 productos creados! 🎯"
3. **Create 10th Product**: Should show "¡10 productos! 🔥"
4. **Bulk Import**: Create 7 products at once (3 → 10) → Should show TWO toasts (5 and 10)

### Debug Logging

Enable console logs to see event flow:

```typescript
console.log('Event payload:', {
  totalCount,
  previousCount,
  newMilestones
});
```

---

## Migration Checklist

### For New Event Emitters

- [ ] Import event types from `@/modules/achievements/types/events`
- [ ] Query `previousCount` BEFORE operation
- [ ] Perform operation (create, update, etc.)
- [ ] Calculate `totalCount = previousCount + 1`
- [ ] Emit event with BOTH `totalCount` and `previousCount`
- [ ] Add try/catch to prevent operation failure on event error
- [ ] Add listener in `src/modules/achievements/manifest.tsx`
- [ ] Test milestone detection manually
- [ ] Write unit tests

### For Existing Event Emitters

- [ ] Add supabase count query BEFORE existing operation
- [ ] Update event payload to include `totalCount` and `previousCount`
- [ ] Replace old payload fields with new standardized fields
- [ ] Update event listeners to use new payload structure
- [ ] Test backward compatibility
- [ ] Update documentation

---

## Performance Considerations

### Count Queries

**Current Approach** (Single operation):
```typescript
const { count } = await supabase
  .from('table')
  .select('*', { count: 'exact', head: true });
// ~50-100ms overhead
```

**Alternative** (If count is already available in store):
```typescript
const previousCount = yourStore.getState().totalCount;
// 0ms overhead
```

**Recommendation**: Use Zustand store for counts if frequently accessed, otherwise query directly.

### Event Emission

**Non-blocking emission** (recommended for non-critical events):
```typescript
eventBus.emit('event', payload).catch(err => {
  logger.error('Event emission failed', err);
});
```

**Blocking emission** (for critical events):
```typescript
await eventBus.emit('event', payload);
```

---

## References

### Documentation Files

- `ACHIEVEMENTS_ARCHITECTURE_ANALYSIS_AND_PLAN.md` - Original analysis and architectural decisions
- `ACHIEVEMENTS_PHASE2_COMPLETE_FINAL.md` - Phase 2 completion summary
- `ACHIEVEMENTS_IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `ALERTSACHIEVEMENTSSECTION_CONNECTION_GUIDE.md` - Dashboard integration guide
- `GAMIFICATION_ROADMAP.md` - Future gamification features
- `REQUIREMENTS_REFERENCE.md` - Requirement definitions reference

### External Resources

- [LinkedIn Kafka Event Design](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) - "Self-Contained Events" pattern
- [GitHub Achievements](https://github.blog/2022-06-09-introducing-achievements-recognizing-the-many-stages-of-a-developers-coding-journey/) - Inspiration for milestone design
- [Stack Overflow Badges](https://stackoverflow.com/help/badges) - Achievement progression inspiration

### Key Files

| File | Location | Purpose |
|------|----------|---------|
| Event Types | `src/modules/achievements/types/events.ts` | Event payload interfaces |
| Listeners | `src/modules/achievements/manifest.tsx` | EventBus subscription logic |
| Product Emitter | `src/pages/admin/supply-chain/products/services/productApi.ts:107` | Products event emission |
| Sales Emitter | `src/modules/sales/ecommerce/services/checkoutService.ts:51` | Sales event emission |
| Staff Emitter | `src/pages/admin/resources/staff/services/staffApi.ts:300` | Staff event emission |
| Tests | `src/modules/achievements/__tests__/achievement-detection.test.ts` | Unit tests |

---

## Troubleshooting

### No Notifications Showing

1. **Check EventBus subscription**: Verify listener is registered in `manifest.tsx`
2. **Check payload**: Log `previousCount` and `totalCount` in event handler
3. **Check milestone constants**: Ensure your count matches a milestone value
4. **Check notification service**: Verify `notify.success()` is working

### Duplicate Notifications

1. **Check if `previousCount` is correct**: Should be count BEFORE operation
2. **Check event emission**: Ensure event is only emitted once per operation
3. **Check listener**: Ensure no duplicate subscriptions

### Wrong Milestone Count

1. **Verify DB query**: Count should match actual database records
2. **Check filters**: Ensure queries filter correctly (e.g., `employment_status = 'active'`)
3. **Check timing**: Query count BEFORE operation, not after

---

## Contact & Support

For questions or issues:

1. Check existing documentation in `docs/achievements/`
2. Review test files for examples
3. Check EventBus logs in browser console
4. Create issue with reproduction steps

---

**Last Updated**: December 19, 2025  
**Version**: Phase 2.4 (Event Payload Optimization Complete)  
**Contributors**: Architecture Team, Achievement Module Team
