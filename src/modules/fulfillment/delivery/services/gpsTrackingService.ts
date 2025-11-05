// GPS Tracking service for real-time driver location tracking
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

class GPSTrackingService {
  private watchId: number | null = null;
  private isTracking = false;
  private updateInterval = 5000; // Update every 5 seconds

  /**
   * Start tracking driver location
   * @param driverId - ID of the driver to track
   * @param onUpdate - Callback when location updates
   */
  async startTracking(driverId: string, onUpdate?: (location: GPSLocation) => void) {
    if (this.isTracking) {
      logger.warn('GPSTracking', 'Already tracking location');
      return;
    }

    if (!navigator.geolocation) {
      logger.error('GPSTracking', 'Geolocation not supported in this browser');
      throw new Error('Geolocation not supported');
    }

    logger.info('GPSTracking', 'Starting GPS tracking', { driverId });

    this.isTracking = true;
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        logger.info('GPSTracking', 'Location update', location);

        // Update database
        await this.updateDriverLocation(driverId, location);

        // Notify callback
        if (onUpdate) {
          onUpdate(location);
        }
      },
      (error) => {
        logger.error('GPSTracking', 'Error getting position', {
          code: error.code,
          message: error.message
        });

        // Handle specific errors
        switch (error.code) {
          case error.PERMISSION_DENIED:
            logger.error('GPSTracking', 'User denied geolocation permission');
            break;
          case error.POSITION_UNAVAILABLE:
            logger.error('GPSTracking', 'Location information unavailable');
            break;
          case error.TIMEOUT:
            logger.error('GPSTracking', 'Location request timed out');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Stop tracking driver location
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      logger.info('GPSTracking', 'Stopped GPS tracking');
    }
  }

  /**
   * Update driver location in database
   */
  private async updateDriverLocation(driverId: string, location: GPSLocation) {
    try {
      const { error } = await supabase
        .from('driver_locations')
        .insert({
          driver_id: driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          timestamp: new Date().toISOString()
        });

      if (error) {
        logger.error('GPSTracking', 'Error updating location in database', { error });
        throw error;
      }

      logger.debug('GPSTracking', 'Location updated successfully in database');
    } catch (err) {
      logger.error('GPSTracking', 'Failed to update location', { error: err });
    }
  }

  /**
   * Get current tracking status
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get latest location for a driver
   */
  async getLatestLocation(driverId: string): Promise<GPSLocation | null> {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
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
        heading: data.heading || undefined
      };
    } catch (err) {
      logger.error('GPSTracking', 'Error fetching latest location', { error: err });
      return null;
    }
  }

  /**
   * Request one-time location update
   */
  async getCurrentPosition(): Promise<GPSLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }
}

// Singleton instance
export const gpsTrackingService = new GPSTrackingService();
