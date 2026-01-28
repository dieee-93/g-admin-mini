/**
 * FULFILLMENT DELIVERY SERVICES
 *
 * Consolidated delivery services from standalone module migration.
 * All delivery-related services are centralized here.
 *
 * @version 2.0.0 - Consolidated from standalone delivery module
 */

// Core delivery service (unified from deliveryService + deliveryApi)
export { deliveryService } from './deliveryService';
export { deliveryApi } from './deliveryApi';

// Route optimization
export { routeOptimizationService } from './routeOptimizationService';

// GPS tracking
export { gpsTrackingService } from './gpsTrackingService';

// Geocoding
export { nominatimGeocodingService } from './nominatimGeocodingService';

// EventBus integration
export {
  emitDriverAssigned,
  emitDeliveryStatusUpdated,
  emitDeliveryCompleted
} from './deliveryEvents';
