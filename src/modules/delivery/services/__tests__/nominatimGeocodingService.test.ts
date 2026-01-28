import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nominatimGeocodingService } from '../nominatimGeocodingService';

describe('NominatimGeocodingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for valid address', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{
          lat: '-34.6037',
          lon: '-58.3816',
          display_name: 'Buenos Aires, Argentina'
        }]
      });

      const result = await nominatimGeocodingService.geocodeAddress(
        'Av. 9 de Julio, Buenos Aires'
      );

      expect(result).toEqual({
        latitude: -34.6037,
        longitude: -58.3816,
        formatted_address: 'Buenos Aires, Argentina'
      });
    });

    it('should return null for invalid address', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      });

      const result = await nominatimGeocodingService.geocodeAddress('xyz123invalid');

      expect(result).toBeNull();
    });

    it('should respect rate limiting (1 request/sec)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{
          lat: '-34.6037',
          lon: '-58.3816',
          display_name: 'Test'
        }]
      });

      const start = Date.now();

      await nominatimGeocodingService.geocodeAddress('Address 1');
      await nominatimGeocodingService.geocodeAddress('Address 2');

      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(1000); // At least 1 second delay
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await nominatimGeocodingService.geocodeAddress('Test');

      expect(result).toBeNull();
    });
  });

  describe('reverseGeocode', () => {
    it('should return address for valid coordinates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: 'Av. 9 de Julio, Buenos Aires, Argentina'
        })
      });

      const result = await nominatimGeocodingService.reverseGeocode(-34.6037, -58.3816);

      expect(result).toBe('Av. 9 de Julio, Buenos Aires, Argentina');
    });

    it('should return null for invalid coordinates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const result = await nominatimGeocodingService.reverseGeocode(999, 999);

      expect(result).toBeNull();
    });
  });

  describe('geocodeBatch', () => {
    it('should geocode multiple addresses with rate limiting', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{
          lat: '-34.6037',
          lon: '-58.3816',
          display_name: 'Test'
        }]
      });

      const addresses = ['Addr1', 'Addr2', 'Addr3'];
      const start = Date.now();

      const results = await nominatimGeocodingService.geocodeBatch(addresses);

      const elapsed = Date.now() - start;

      expect(results).toHaveLength(3);
      expect(elapsed).toBeGreaterThanOrEqual(2000); // At least 2 seconds (3 addresses - 1)
    });
  });
});
