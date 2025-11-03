// Nominatim Geocoding Service (OpenStreetMap - 100% FREE)
// Converts addresses to coordinates and vice versa
// Usage Policy: https://operations.osmfoundation.org/policies/nominatim/

import { logger } from '@/lib/logging';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

class NominatimGeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private requestDelay = 1000; // 1 second between requests (Nominatim usage policy)
  private lastRequestTime = 0;

  /**
   * Respect Nominatim usage policy: max 1 request per second
   */
  private async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      logger.info('NominatimGeocoding', `Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Convert address string to geographic coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      await this.respectRateLimit();

      logger.info('NominatimGeocoding', 'Geocoding address', { address });

      const params = new URLSearchParams({
        q: address,
        format: 'json',
        addressdetails: '1',
        limit: '1'
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'User-Agent': 'G-Admin-Mini-Delivery/1.0' // Required by Nominatim
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data: NominatimResponse[] = await response.json();

      if (!data || data.length === 0) {
        logger.warn('NominatimGeocoding', 'No results found for address', { address });
        return null;
      }

      const result = data[0];
      const geocodeResult: GeocodeResult = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formatted_address: result.display_name
      };

      logger.info('NominatimGeocoding', 'Geocoding successful', geocodeResult);
      return geocodeResult;
    } catch (error) {
      logger.error('NominatimGeocoding', 'Error geocoding address', { error, address });
      return null;
    }
  }

  /**
   * Convert geographic coordinates to address (reverse geocoding)
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      await this.respectRateLimit();

      logger.info('NominatimGeocoding', 'Reverse geocoding coordinates', { lat, lng });

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1'
      });

      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        headers: {
          'User-Agent': 'G-Admin-Mini-Delivery/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data: NominatimResponse = await response.json();

      if (!data || !data.display_name) {
        logger.warn('NominatimGeocoding', 'No address found for coordinates', { lat, lng });
        return null;
      }

      logger.info('NominatimGeocoding', 'Reverse geocoding successful', {
        address: data.display_name
      });
      return data.display_name;
    } catch (error) {
      logger.error('NominatimGeocoding', 'Error reverse geocoding', { error, lat, lng });
      return null;
    }
  }

  /**
   * Geocode multiple addresses in batch
   * Respects 1 request/second rate limit
   */
  async geocodeBatch(addresses: string[]): Promise<Array<GeocodeResult | null>> {
    const results: Array<GeocodeResult | null> = [];

    logger.info('NominatimGeocoding', 'Batch geocoding started', {
      count: addresses.length,
      estimatedTime: `${addresses.length} seconds`
    });

    for (const address of addresses) {
      const result = await this.geocodeAddress(address);
      results.push(result);
    }

    logger.info('NominatimGeocoding', 'Batch geocoding completed', {
      total: results.length,
      successful: results.filter(r => r !== null).length
    });

    return results;
  }

  /**
   * Search for places by name
   */
  async searchPlace(query: string): Promise<GeocodeResult[]> {
    try {
      await this.respectRateLimit();

      logger.info('NominatimGeocoding', 'Searching places', { query });

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5' // Return up to 5 results
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'User-Agent': 'G-Admin-Mini-Delivery/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data: NominatimResponse[] = await response.json();

      const results: GeocodeResult[] = data.map(item => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        formatted_address: item.display_name
      }));

      logger.info('NominatimGeocoding', 'Place search completed', {
        query,
        resultsCount: results.length
      });

      return results;
    } catch (error) {
      logger.error('NominatimGeocoding', 'Error searching places', { error, query });
      return [];
    }
  }
}

// Singleton instance
export const nominatimGeocodingService = new NominatimGeocodingService();

// Re-export as geocodingService for backward compatibility
export const geocodingService = nominatimGeocodingService;
