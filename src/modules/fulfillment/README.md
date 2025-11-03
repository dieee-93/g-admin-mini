# Fulfillment Module

**Unified fulfillment orchestration system for all order delivery methods.**

## Overview

The Fulfillment module provides a centralized system for managing order fulfillment across multiple channels: onsite service, pickup, and delivery. It coordinates the entire fulfillment workflow from order ready to customer receipt.

## Sub-Modules

### 1. Fulfillment Onsite (`fulfillment/onsite`)
- Floor plan management and table assignments
- Onsite service coordination
- Table status tracking
- Reservation management

### 2. Fulfillment Pickup (Planned)
- Pickup order management
- Ready notifications
- Customer arrival tracking

### 3. Fulfillment Delivery (Planned)
- Delivery route optimization
- Driver assignment
- Real-time tracking

## Features

- **Unified Queue**: Single fulfillment queue across all channels
- **Priority Management**: Automatic prioritization based on order type and timing
- **Real-time Status**: Live updates on fulfillment status
- **Multi-location**: Support for multiple fulfillment locations

## Module Structure

```
fulfillment/
├── manifest.tsx          # Core fulfillment module manifest
├── onsite/              # Onsite fulfillment sub-module
│   ├── manifest.tsx     # Onsite sub-module manifest
│   └── components/
├── components/          # Shared fulfillment components
│   ├── FulfillmentQueue.tsx
│   └── FulfillmentQueueWidget.tsx
└── services/
    └── fulfillmentService.ts
```

## Integration

### Required Features
- `onsite_service` (for onsite sub-module)
- `pickup_takeout` (for pickup sub-module)
- `delivery_shipping` (for delivery sub-module)

### EventBus Events

**Consumed:**
- `sales.order.completed` - New orders ready for fulfillment
- `production.order.ready` - Production completed, ready to serve

**Emitted:**
- `fulfillment.onsite.order_assigned` - Order assigned to table
- `fulfillment.order.completed` - Order fulfilled and delivered

## Hook Points

- `fulfillment.queue` - Fulfillment queue display hooks
- `fulfillment.onsite.actions` - Onsite action hooks (floor plan, table management)

## Usage Example

```typescript
import { useFulfillmentQueue } from '@/modules/fulfillment';

function MyComponent() {
  const { orders, assignToTable } = useFulfillmentQueue();

  return (
    <FulfillmentQueue
      orders={orders}
      onAssign={assignToTable}
    />
  );
}
```

## Notes

- Replaces the previous separate "Floor" module
- Designed for future expansion to pickup and delivery
- Integrates with Sales and Production modules
- Real-time updates via EventBus
