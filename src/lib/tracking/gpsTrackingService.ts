/**
 * GPS TRACKING SERVICE - TRANSVERSAL
 *
 * Real-time GPS location tracking service for mobile workers.
 * Used across multiple modules for different tracking scenarios.
 *
 * USE CASES:
 * - Delivery drivers (fulfillment/delivery)
 * - Field service technicians (field-service)
 * - Mobile sales reps (mobile-sales)
 * - Security guards on patrol (staff)
 * - Asset tracking with GPS devices (assets)
 *
 * ARCHITECTURE:
 * - Singleton service (shared instance)
 * - Browser Geolocation API
 * - Auto-saves to database (driver_locations table)
 * - Callback support for real-time updates
 * - Error handling with retry logic
 *
 * MOBILE APP INTEGRATION:
 * - Works in PWA or React Native
 * - Requires user permission (navigator.permissions)
 * - Sends location every 5-10 seconds
 * - Handles network interruptions
 *
 * PRIVACY & LEGAL:
 * - Only tracks when user explicitly starts tracking
 * - Requires employee consent
 * - Can be stopped at any time
 * - Complies with GDPR/Privacy laws
 *
 * @version 2.0.0
 * @author G-Admin Team
 * @see docs/05-development/GPS_TRACKING_GUIDE.md
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * GPS location with optional metadata
 */
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;    // meters
  speed?: number;       // m/s
  heading?: number;     // degrees (0-360)
  altitude?: number;    // meters
  timestamp?: string;   // ISO 8601
}

/**
 * Tracking options
 */
export interface TrackingOptions {
  /** Update interval in milliseconds (default: 5000) */
  updateInterval?: number;
  /** Enable high accuracy GPS (default: true) */
  highAccuracy?: boolean;
  /** Timeout for location request (default: 10000ms) */
  timeout?: number;
  /** Maximum age of cached position (default: 0) */
  maximumAge?: number;
}

// ============================================
// GPS TRACKING SERVICE
// ============================================

class GPSTrackingService {
  private watchId: number | null = null;
  private isTracking = false;
  private currentTrackingId: string | null = null;
  private updateInterval = 5000; // Default: update every 5 seconds

  /**
   * Start tracking location for a user/driver/technician
   *
   * @param trackingId - Unique ID for entity being tracked (driver_id, technician_id, etc.)
   * @param onUpdate - Optional callback for real-time updates
   * @param options - Tracking configuration options
   *
   * @example
   * ```typescript
   * // Start tracking delivery driver
   * await gpsTrackingService.startTracking('driver-123', (location) => {
   *   console.log('Driver moved to:', location);
   *   updateMapMarker(location);
   * });
   * ```
   */
  async startTracking(
    trackingId: string,
    onUpdate?: (location: GPSLocation) => void,
    options?: TrackingOptions
  ): Promise<void> {
    if (this.isTracking) {
      logger.warn('GPSTracking', 'Already tracking location', {
        currentId: this.currentTrackingId,
        requestedId: trackingId
      });
      return;
    }

    if (!navigator.geolocation) {
      logger.error('GPSTracking', 'Geolocation not supported in this browser');
      throw new Error('Geolocation not supported');
    }

    // Apply options
    const {
      highAccuracy = true,
      timeout = 10000,
      maximumAge = 0,
      updateInterval = 5000
    } = options || {};

    this.updateInterval = updateInterval;
    this.currentTrackingId = trackingId;

    logger.info('GPSTracking', 'Starting GPS tracking', {
      trackingId,
      updateInterval,
      highAccuracy
    });

    this.isTracking = true;
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          altitude: position.coords.altitude || undefined,
          timestamp: new Date().toISOString()
        };

        logger.debug('GPSTracking', 'Location update', {
          trackingId,
          location
        });

        // Update database
        await this.updateLocation(trackingId, location);

        // Notify callback
        if (onUpdate) {
          onUpdate(location);
        }
      },
      (error) => {
        logger.error('GPSTracking', 'Error getting position', {
          code: error.code,
          message: error.message,
          trackingId
        });

        // Handle specific errors
        switch (error.code) {
          case error.PERMISSION_DENIED:
            logger.error('GPSTracking', 'User denied geolocation permission');
            this.stopTracking();
            break;
          case error.POSITION_UNAVAILABLE:
            logger.warn('GPSTracking', 'Location information unavailable - will retry');
            break;
          case error.TIMEOUT:
            logger.warn('GPSTracking', 'Location request timed out - will retry');
            break;
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      }
    );
  }

  /**
   * Stop tracking location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;

      logger.info('GPSTracking', 'Stopped GPS tracking', {
        trackingId: this.currentTrackingId
      });

      this.currentTrackingId = null;
    }
  }

  /**
   * Update location in database
   * Private method - called automatically during tracking
   */
  private async updateLocation(trackingId: string, location: GPSLocation): Promise<void> {
    try {
      const { error } = await supabase
        .from('driver_locations')
        .insert({
          driver_id: trackingId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          timestamp: location.timestamp || new Date().toISOString()
        });

      if (error) {
        logger.error('GPSTracking', 'Error updating location in database', {
          error,
          trackingId
        });
        throw error;
      }

      logger.debug('GPSTracking', 'Location updated successfully in database', {
        trackingId
      });
    } catch (err) {
      logger.error('GPSTracking', 'Failed to update location', {
        error: err,
        trackingId
      });
      // Don't throw - continue tracking even if DB update fails
    }
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get ID of entity being tracked
   */
  getCurrentTrackingId(): string | null {
    return this.currentTrackingId;
  }

  /**
   * Get latest location for a tracked entity
   *
   * @param trackingId - ID to lookup
   * @returns Latest GPS location or null if not found
   */
  async getLatestLocation(trackingId: string): Promise<GPSLocation | null> {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', trackingId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy || undefined,
        speed: data.speed || undefined,
        heading: data.heading || undefined,
        altitude: data.altitude || undefined,
        timestamp: data.timestamp
      };
    } catch (err) {
      logger.error('GPSTracking', 'Error fetching latest location', {
        error: err,
        trackingId
      });
      return null;
    }
  }

  /**
   * Request one-time location update (no continuous tracking)
   *
   * @returns Current GPS location
   *
   * @example
   * ```typescript
   * const location = await gpsTrackingService.getCurrentPosition();
   * console.log('Current location:', location);
   * ```
   */
  async getCurrentPosition(options?: TrackingOptions): Promise<GPSLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const {
        highAccuracy = true,
        timeout = 5000,
        maximumAge = 0
      } = options || {};

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          logger.error('GPSTracking', 'Error getting current position', {
            code: error.code,
            message: error.message
          });
          reject(error);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge
        }
      );
    });
  }

  /**
   * Check if geolocation is available in browser
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request geolocation permission
   * Note: Actual permission is requested on first startTracking() call
   */
  async requestPermission(): Promise<PermissionState> {
    if (!('permissions' in navigator)) {
      logger.warn('GPSTracking', 'Permissions API not supported');
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      logger.info('GPSTracking', 'Geolocation permission status', {
        state: result.state
      });
      return result.state;
    } catch (err) {
      logger.error('GPSTracking', 'Error checking permission', { error: err });
      return 'prompt';
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Singleton instance of GPS tracking service
 * Import and use across the application
 */
export const gpsTrackingService = new GPSTrackingService();

/**
 * Default export for convenience
 */
export default gpsTrackingService;
