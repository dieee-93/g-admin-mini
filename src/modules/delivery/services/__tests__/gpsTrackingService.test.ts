import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gpsTrackingService } from '../gpsTrackingService';
import { supabase } from '@/lib/supabase/client';

// Mock geolocation API
const mockGeolocation = {
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
  getCurrentPosition: vi.fn()
};

describe('GPSTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.navigator as any).geolocation = mockGeolocation;
  });

  afterEach(() => {
    gpsTrackingService.stopTracking();
  });

  describe('startTracking', () => {
    it('should start watching position', async () => {
      const driverId = 'driver-123';
      const callback = vi.fn();

      await gpsTrackingService.startTracking(driverId, callback);

      expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    });

    it('should update driver location in Supabase', async () => {
      const driverId = 'driver-123';
      const mockPosition = {
        coords: {
          latitude: -34.6037,
          longitude: -58.3816,
          accuracy: 15.5,
          speed: 25.0,
          heading: 180
        }
      };

      // Mock watchPosition to call success callback
      mockGeolocation.watchPosition.mockImplementation((success) => {
        success(mockPosition);
        return 1;
      });

      // Mock Supabase insert with proper chain
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
      vi.spyOn(supabase, 'from').mockImplementation(fromMock);

      await gpsTrackingService.startTracking(driverId);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify from was called with correct table
      expect(fromMock).toHaveBeenCalledWith('driver_locations');

      // Verify insert was called with correct data
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          driver_id: driverId,
          latitude: -34.6037,
          longitude: -58.3816,
          accuracy: 15.5,
          speed: 25.0,
          heading: 180
        })
      );
    });

    it('should call onUpdate callback with location', async () => {
      const driverId = 'driver-123';
      const callback = vi.fn();
      const mockPosition = {
        coords: {
          latitude: -34.6037,
          longitude: -58.3816,
          accuracy: 10
        }
      };

      mockGeolocation.watchPosition.mockImplementation((success) => {
        success(mockPosition);
        return 1;
      });

      await gpsTrackingService.startTracking(driverId, callback);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalledWith({
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 10
      });
    });

    it('should throw error if geolocation not supported', async () => {
      (global.navigator as any).geolocation = undefined;

      await expect(
        gpsTrackingService.startTracking('driver-123')
      ).rejects.toThrow('Geolocation not supported');
    });
  });

  describe('stopTracking', () => {
    it('should clear watch when stopped', async () => {
      mockGeolocation.watchPosition.mockReturnValue(123);

      await gpsTrackingService.startTracking('driver-123');
      gpsTrackingService.stopTracking();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
    });
  });

  describe('getCurrentPosition', () => {
    it('should return current position', async () => {
      const mockPosition = {
        coords: {
          latitude: -34.6037,
          longitude: -58.3816,
          accuracy: 10,
          speed: 15,
          heading: 90
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await gpsTrackingService.getCurrentPosition();

      expect(result).toEqual({
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 10,
        speed: 15,
        heading: 90
      });
    });

    it('should reject on error', async () => {
      const error = { code: 1, message: 'Permission denied' };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      await expect(gpsTrackingService.getCurrentPosition()).rejects.toBeDefined();
    });
  });
});
