/**
 * TRACKING LIBRARY - EXPORTS
 *
 * Centralized exports for all tracking-related services.
 * Use this for real-time location tracking across modules.
 *
 * USAGE:
 * ```typescript
 * import { gpsTrackingService } from '@/lib/tracking';
 * ```
 *
 * @module tracking
 */

// GPS Tracking Service
export { gpsTrackingService, default as gpsTrackingServiceDefault } from './gpsTrackingService';

// Types
export type { GPSLocation, TrackingOptions } from './gpsTrackingService';
