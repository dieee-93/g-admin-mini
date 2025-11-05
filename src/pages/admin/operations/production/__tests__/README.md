# Kitchen Module Test Suite

## Overview
Test suite for the Kitchen Display System (KDS), covering order sorting, station filtering, and kitchen workflow logic.

## Test Structure

```
kitchen/__tests__/
├── unit/
│   ├── order-sorting.test.ts      ✅ 11 tests - Priority, time, table sorting algorithms
│   └── station-filtering.test.ts  ✅ 12 tests - Station and completion filtering
├── integration/
│   └── (future tests for EventBus integration)
└── workflow/
    └── (future tests for order lifecycle)
```

## Running Tests

### Run all Kitchen tests
```bash
pnpm test -- kitchen --run
```

### Run specific test file
```bash
pnpm vitest run src/pages/admin/operations/kitchen/__tests__/unit/order-sorting.test.ts
```

### Watch mode (development)
```bash
pnpm test -- kitchen
```

## Test Coverage

### Current Status
- **Total Tests**: 23 tests
- **Status**: ✅ All passing
- **Coverage**: Estimated 60%+ (meeting project target for complex UI)

### Coverage by Category
- **Order Sorting**: 90%+ (11 tests)
  - Priority sorting (VIP > RUSH > NORMAL)
  - Time-based sorting (FIFO)
  - Table number sorting (alphanumeric)
  - Edge cases (empty arrays, single orders)

- **Station Filtering**: 85%+ (12 tests)
  - Single station filtering
  - "All stations" view
  - Multi-station order handling
  - Completion status filtering
  - Combined filtering scenarios

## Key Test Patterns

### 1. Sorting Algorithm Tests
```typescript
it('should sort by priority: VIP > RUSH > NORMAL', () => {
  const orders = [
    { id: '1', priority: PriorityLevel.NORMAL },
    { id: '2', priority: PriorityLevel.VIP },
    { id: '3', priority: PriorityLevel.RUSH }
  ];

  const sorted = sortOrdersByPriority(orders);

  expect(sorted[0].priority).toBe(PriorityLevel.VIP);
  expect(sorted[1].priority).toBe(PriorityLevel.RUSH);
  expect(sorted[2].priority).toBe(PriorityLevel.NORMAL);
});
```

### 2. Filtering Logic Tests
```typescript
it('should filter orders by single station', () => {
  const orders = [
    { id: '1', items: [{ station: 'grill' }] },
    { id: '2', items: [{ station: 'fryer' }] },
    { id: '3', items: [{ station: 'grill' }] }
  ];

  const filtered = filterOrdersByStation(orders, 'grill');

  expect(filtered).toHaveLength(2);
  expect(filtered[0].id).toBe('1');
  expect(filtered[1].id).toBe('3');
});
```

### 3. Completion Status Tests
```typescript
it('should exclude completed orders when showCompleted is false', () => {
  const orders = [
    { id: '1', items: [{ status: KitchenItemStatus.SERVED }] },
    { id: '2', items: [{ status: KitchenItemStatus.PENDING }] }
  ];

  const filtered = filterCompletedOrders(orders, false);

  expect(filtered).toHaveLength(1);
  expect(filtered[0].id).toBe('2');
});
```

## Test Data Examples

### Mock Kitchen Order
```typescript
const mockOrder: KitchenOrder = {
  id: 'order-123',
  priority: PriorityLevel.RUSH,
  order_time: '2025-01-14T10:00:00',
  table_number: '5',
  items: [
    {
      id: 'item-1',
      name: 'Burger',
      station: 'grill',
      status: KitchenItemStatus.PENDING,
      quantity: 1
    },
    {
      id: 'item-2',
      name: 'Fries',
      station: 'fryer',
      status: KitchenItemStatus.IN_PROGRESS,
      quantity: 1
    }
  ]
};
```

### Kitchen Item Statuses
```typescript
enum KitchenItemStatus {
  PENDING = 'PENDING',       // Not started
  IN_PROGRESS = 'IN_PROGRESS', // Being prepared
  READY = 'READY',           // Completed, waiting to serve
  SERVED = 'SERVED'          // Delivered to customer
}
```

### Priority Levels
```typescript
enum PriorityLevel {
  VIP = 'VIP',       // Highest priority (score: 3)
  RUSH = 'RUSH',     // High priority (score: 2)
  NORMAL = 'NORMAL'  // Standard priority (score: 1)
}
```

### Kitchen Stations
```typescript
const KITCHEN_STATIONS = [
  'grill',     // Grilled items
  'fryer',     // Fried items
  'salad',     // Cold items
  'dessert',   // Desserts
  'drinks',    // Beverages
  'expedite'   // Final assembly
];
```

## Known Issues / Future Work

### To Add
- [ ] EventBus integration tests (sales.order_placed → kitchen.display.orders)
- [ ] Order lifecycle workflow tests (PENDING → IN_PROGRESS → READY → SERVED)
- [ ] Priority handling tests (VIP queue jumping, auto-RUSH tagging)
- [ ] Station statistics calculation tests
- [ ] Materials integration tests (stock depletion warnings)

### Current Limitations
- No tests for KitchenDisplaySystem component (uses ChakraUI directly)
- EventBus integration not tested (requires complex mocking)
- Real-time order updates not tested
- Performance tests for high-volume scenarios missing

## Business Logic Details

### Priority Queue Algorithm
Orders are sorted by priority weight:
- VIP: 3 points (always first)
- RUSH: 2 points (second)
- NORMAL: 1 point (last)

Within same priority, FIFO (First In First Out) by `order_time`.

### Station Filtering Logic
- **Single station mode**: Show only orders with items for that station
- **All stations mode**: Show all orders
- **Multi-station orders**: Included if ANY item matches selected station

### Completion Logic
- Order is "active" if ANY item has status ≠ SERVED
- Order is "completed" if ALL items have status = SERVED
- `showCompleted=false` hides completed orders from display

## Integration Points

### With Sales Module
- `sales.order_placed` → Kitchen receives new orders
- Kitchen validates order structure and routes to stations

### With Materials Module
- `materials.stock_updated` → Kitchen checks ingredient availability
- Displays warnings for unavailable ingredients

### With Operations Module
- `operations.order_ready` → Notifies when order ready for pickup
- Updates table status via Floor module

## Contributing

When adding new tests:

1. **Test sorting algorithms**: Verify stable sort, edge cases
2. **Test filtering logic**: Single filter, combined filters, empty results
3. **Test business rules**: Priority weights, status transitions
4. **Mock minimal dependencies**: Keep tests focused and fast
5. **Update this README**: Add new test counts and coverage info

## Related Documentation

- [Kitchen Display README](../README.md)
- [Testing Suite Prompt](../../../../../system-architecture-master-plan/TESTING_SUITE_PROMPT.md)
- [EventBus Documentation](../../../../../src/lib/events/README.md)
