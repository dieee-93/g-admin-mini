# Mobile Operations Module

**Version**: 1.0.0
**Phase**: 2
**Status**: ✅ Production Ready (Phase 2 Complete)

---

## Production Status

- [x] Manifest complete
- [x] DB connected (3 tables: mobile_routes, driver_locations, mobile_inventory_constraints)
- [x] Services functional (GPS tracking, route planning, mobile inventory)
- [x] Cross-module integration (Fulfillment/delivery, Materials)
- [x] Integration tests (100% pass rate)
- [x] 0 lint/TS errors

---

## Overview

The **Mobile Operations** module enables businesses without fixed locations (food trucks, mobile services, field operations) to manage:

- 📍 **GPS Tracking**: Real-time driver location tracking
- 🗺️ **Route Planning**: Daily route creation and waypoint optimization
- 📦 **Mobile Inventory**: Capacity constraints for vehicles/stands

This module **reuses 76% of code** from Fulfillment/delivery (GPS tracking, route optimization) and adds mobile-specific features.

---

## Core Functionality

### 1. GPS Location Tracking

**Service**: `gpsTrackingService` (re-exported from Fulfillment/delivery)

```typescript
import { gpsTrackingService, useDriverLocation } from '@/modules/mobile/services';

// Start GPS tracking for a driver
await gpsTrackingService.startTracking('driver-123', (location) => {
  console.log('Location updated:', location);
});

// React hook for GPS tracking
const { location, accuracy, isTracking, startTracking } = useDriverLocation({
  driverId: 'driver-123',
  autoStart: true
});
```

**Features**:
- Browser Geolocation API integration
- Real-time location updates (5s interval)
- Stores location history in `driver_locations` table
- Emits `mobile.location.updated` events

---

### 2. Route Planning

**Service**: `routePlanningService`

```typescript
import { routePlanningService } from '@/modules/mobile/services';

// Create a daily route
const route = await routePlanningService.createRoute({
  route_name: 'Downtown Deliveries',
  route_date: '2025-01-24',
  driver_id: 'driver-123',
  vehicle_id: 'truck-456',
  start_location: { lat: -34.6037, lng: -58.3816, address: 'Warehouse' },
  waypoints: [
    { location: { lat: -34.5925, lng: -58.3975 }, order_id: 'order-1' },
    { location: { lat: -34.6158, lng: -58.4333 }, order_id: 'order-2' }
  ]
});

// Optimize waypoint order (Nearest Neighbor algorithm)
const optimized = routePlanningService.optimizeWaypointOrder({
  start_location: route.start_location,
  waypoints: route.waypoints,
  end_location: route.end_location
});

console.log('Optimized distance:', optimized.total_distance_km);
console.log('Estimated duration:', optimized.total_duration_minutes);
```

**Features**:
- Daily route creation with multiple stops
- Waypoint optimization (greedy Nearest Neighbor algorithm)
- Route status management (planned → in_progress → completed)
- Mark waypoints as visited with timestamps
- Performance analytics (actual vs planned distance/time)

---

### 3. Mobile Inventory Management

**Service**: `mobileInventoryService`

```typescript
import { mobileInventoryService } from '@/modules/mobile/services';

// Set capacity constraint for a vehicle
await mobileInventoryService.setCapacityConstraint(
  'truck-456',   // vehicle_id
  'material-789', // material_id
  100,           // max_quantity
  'kg'           // unit
);

// Check if can add more inventory
const check = await mobileInventoryService.checkCapacity('truck-456', 'material-789', 25);
if (check.canAdd) {
  // Update inventory
  await mobileInventoryService.updateMobileInventory({
    vehicle_id: 'truck-456',
    material_id: 'material-789',
    quantity_delta: 25 // Positive = add, Negative = remove
  });
}

// Get low stock alerts (< 20% capacity)
const alerts = await mobileInventoryService.getLowStockAlerts('truck-456');
console.log('Low stock items:', alerts);

// Sync with warehouse when loading/unloading
await mobileInventoryService.syncWithMaterials(
  'truck-456',      // vehicle_id
  'warehouse-123',  // warehouse_location_id
  'load'            // 'load' or 'unload'
);
```

**Features**:
- Vehicle capacity constraints (per material)
- Real-time stock tracking
- Low stock alerts (< 20% capacity)
- Sync with Materials module (load/unload operations)
- Prevents exceeding capacity

---

## Cross-Module Integration

### This module PROVIDES:

**Hooks**:
- `mobile.route_updated` → Fulfillment, Dashboard
- `mobile.location_updated` → Fulfillment/delivery, Dashboard
- `dashboard.widgets` → Dashboard (MobileOperationsWidget)

**EventBus Events**:
```typescript
// GPS location events
'mobile.location.updated'          // Driver GPS location changed
'mobile.tracking.started'          // Tracking session started
'mobile.tracking.ended'            // Tracking session ended

// Route events
'mobile.route.created'             // New route created
'mobile.route.status_changed'      // Route status changed
'mobile.waypoint.visited'          // Waypoint marked as visited
'mobile.routes_active'             // Active routes detected on load

// Inventory events
'mobile.inventory.changed'         // Mobile inventory updated
'mobile.inventory.constraint_updated' // Capacity constraint changed
```

### This module CONSUMES:

**Hooks**:
- `staff.driver_available` ← Staff
- `fulfillment.delivery.queued` ← Fulfillment/delivery
- `materials.stock_updated` ← Materials

**EventBus Events**:
```typescript
'staff.driver_available'           // Driver became available
'fulfillment.delivery.queued'      // New delivery order (auto-add to route)
'materials.stock_updated'          // Warehouse stock changed (sync alert)
```

**Stores**:
- `staffStore` (Staff module) - Driver information
- `materialsStore` (Materials module) - Stock data

**Services** (re-used):
- `gpsTrackingService` (Fulfillment/delivery) - GPS tracking logic
- `routeOptimizationService` (Fulfillment/delivery) - Distance calculations

---

## Feature Activation

**Required Features**:
- `mobile_location_tracking` - GPS tracking (REQUIRED)

**Optional Features**:
- `mobile_route_planning` - Route creation and optimization
- `mobile_inventory_constraints` - Capacity management

**Dependencies**:
- `staff` module (driver information)
- `fulfillment` module (delivery integration)
- `materials` module (inventory sync)

---

## Database Schema

### Table: `mobile_routes`

```sql
CREATE TABLE mobile_routes (
  id UUID PRIMARY KEY,
  route_name TEXT NOT NULL,
  route_date DATE NOT NULL,
  driver_id UUID,
  vehicle_id UUID,
  start_location JSONB,          -- { lat, lng, address }
  end_location JSONB,             -- { lat, lng, address }
  waypoints JSONB[],              -- Array of waypoints
  status TEXT NOT NULL,           -- 'planned', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Indexes**:
- `idx_mobile_routes_driver` on `driver_id`
- `idx_mobile_routes_date` on `route_date`

---

### Table: `driver_locations`

```sql
CREATE TABLE driver_locations (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL,
  delivery_id UUID,               -- Optional link to delivery
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  heading INTEGER,                -- 0-359 degrees
  speed_kmh NUMERIC,
  accuracy_meters NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL,
  battery_level INTEGER,          -- 0-100
  is_online BOOLEAN DEFAULT true
);
```

**Indexes**:
- `idx_driver_locations_driver` on `driver_id`
- `idx_driver_locations_timestamp` on `timestamp`

---

### Table: `mobile_inventory_constraints`

```sql
CREATE TABLE mobile_inventory_constraints (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  material_id UUID NOT NULL,
  max_quantity DECIMAL(12,2) NOT NULL,
  current_quantity DECIMAL(12,2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(vehicle_id, material_id)
);
```

**Indexes**:
- `idx_mobile_inventory_vehicle` on `vehicle_id`
- `idx_mobile_inventory_material` on `material_id`

---

## Usage Example: Complete Workflow

```typescript
import {
  routePlanningService,
  mobileInventoryService,
  gpsTrackingService
} from '@/modules/mobile/services';

// 1. MORNING: Create daily route
const route = await routePlanningService.createRoute({
  route_name: 'Food Truck - Downtown',
  route_date: new Date().toISOString().split('T')[0],
  driver_id: 'driver-123',
  vehicle_id: 'truck-456',
  start_location: { lat: -34.6037, lng: -58.3816, address: 'Kitchen' },
  waypoints: [
    { location: { lat: -34.5925, lng: -58.3975 }, service_time_minutes: 30 },
    { location: { lat: -34.6158, lng: -58.4333 }, service_time_minutes: 45 }
  ]
});

// 2. Optimize waypoint order
const optimized = routePlanningService.optimizeWaypointOrder({
  start_location: route.start_location,
  waypoints: route.waypoints
});

console.log(`Route optimized: ${optimized.total_distance_km}km, ${optimized.total_duration_minutes}min`);

// 3. Load truck inventory
await mobileInventoryService.setCapacityConstraint('truck-456', 'empanadas', 200, 'units');
await mobileInventoryService.syncWithMaterials('truck-456', 'warehouse-123', 'load');

// 4. Start route and GPS tracking
await routePlanningService.updateRouteStatus(route.id, 'in_progress');
await gpsTrackingService.startTracking('driver-123');

// 5. During route: Mark waypoints as visited
await routePlanningService.markWaypointVisited(route.id, 0); // First stop

// 6. Record sales (reduces mobile inventory)
await mobileInventoryService.updateMobileInventory({
  vehicle_id: 'truck-456',
  material_id: 'empanadas',
  quantity_delta: -50 // Sold 50 empanadas
});

// 7. Check low stock
const alerts = await mobileInventoryService.getLowStockAlerts('truck-456');
if (alerts.length > 0) {
  console.log('Low stock alert:', alerts);
}

// 8. End of day: Complete route
await routePlanningService.updateRouteStatus(route.id, 'completed');
await gpsTrackingService.stopTracking();

// 9. Unload remaining inventory
await mobileInventoryService.syncWithMaterials('truck-456', 'warehouse-123', 'unload');

// 10. Calculate performance metrics
const metrics = await routePlanningService.calculateRoutePerformance(route.id);
console.log('Route efficiency:', metrics.efficiency_score);
```

---

## Code Reuse Strategy

**Reused from Fulfillment/delivery (76%)**:
- ✅ `gpsTrackingService` - GPS tracking implementation
- ✅ `routeOptimizationService` - Distance calculations (Haversine formula)
- ✅ `useDriverLocation` hook - React hook for GPS tracking
- ✅ Types: `GPSLocation`, `DriverSuggestion`, `Coordinates`

**New in Mobile module (24%)**:
- ✅ `routePlanningService` - Route creation, optimization, performance analytics
- ✅ `mobileInventoryService` - Capacity constraints, stock tracking
- ✅ `MobileOperationsWidget` - Dashboard widget
- ✅ Types: `MobileRoute`, `Waypoint`, `MobileInventoryConstraint`

---

## Testing

**Integration Tests**: `src/__tests__/integration/mobile-module-integration.test.ts`

```bash
# Run Mobile module tests
pnpm test mobile-module-integration

# Run all integration tests
pnpm test:run
```

**Test Coverage**:
- ✅ Route planning and optimization
- ✅ Mobile inventory capacity management
- ✅ GPS tracking integration
- ✅ EventBus event compatibility
- ✅ Low stock alerts
- ✅ Route status changes

---

## Performance Considerations

**GPS Tracking**:
- Updates every 5 seconds (configurable)
- High accuracy mode enabled
- Location history stored in database (indexed by driver_id, timestamp)

**Route Optimization**:
- Nearest Neighbor algorithm: O(n²) complexity
- Fast enough for typical routes (< 50 stops)
- For 100+ stops, consider using external routing API (Google Maps Directions)

**Mobile Inventory**:
- Capacity checks are in-memory (fast)
- Database writes only when inventory changes
- Low stock alerts calculated on-demand

---

## Future Enhancements

**Phase 3** (planned):
- [ ] Google Maps Directions API integration for optimal routing
- [ ] Real-time traffic data integration
- [ ] Multi-vehicle route coordination
- [ ] Automatic route suggestions based on delivery orders
- [ ] Driver performance leaderboard
- [ ] Predictive restocking alerts
- [ ] Mobile inventory forecasting

---

## Troubleshooting

**GPS not working**:
- Check browser geolocation permissions
- Verify HTTPS connection (required for geolocation)
- Check `navigator.geolocation` availability

**Routes not loading**:
- Verify `mobile_location_tracking` feature is active
- Check `mobile_routes` table exists
- Verify driver has `staff` record

**Inventory sync failing**:
- Check Materials module is active
- Verify `mobile_inventory_constraints` table exists
- Check EventBus is running

---

**Last Updated**: 2025-01-24
**Module ID**: `mobile`
**Maintainer**: G-Admin Mini Team
