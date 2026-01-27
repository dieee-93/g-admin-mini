/**
 * Servicio de Geocoding para Argentina
 *
 * Estrategia de geocodificación en cascada:
 * 1. Georef AR (API oficial del gobierno argentino) - Mayor precisión en Argentina
 * 2. USIG (Gobierno de Buenos Aires) - Mayor precisión en CABA
 * 3. Nominatim (OpenStreetMap) - Fallback global
 *
 * Compatible con Leaflet.js usando coordenadas estándar [lat, lng]
 *
 * @see https://apis.datos.gob.ar/georef/
 * @see https://usig.buenosaires.gob.ar/
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging/Logger';

// ============================================
// TYPES
// ============================================

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  confidence: 'high' | 'medium' | 'low';
  provider: 'georef' | 'usig' | 'nominatim';
}

export interface AddressInput {
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface AddressSuggestion {
  id: string;
  nomenclatura: string; // Dirección formateada completa
  calle: string;
  altura: number | null;
  ciudad: string;
  provincia: string;
  latitude: number;
  longitude: number;
  departamento?: string;
  localidad?: string;
  distance?: number; // Distancia en km desde ubicación del usuario
}

interface GeorefResponse {
  direcciones: Array<{
    nomenclatura: string;
    ubicacion: {
      lat: number;
      lon: number;
    };
  }>;
}

interface USIGResponse {
  direccion?: string;
  coordenadas?: {
    x: string; // longitude
    y: string; // latitude
    srid: number;
  };
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

// ============================================
// GEOCODING SERVICE
// ============================================

export class GeocodingService {
  private static readonly GEOREF_API = 'https://apis.datos.gob.ar/georef/api';
  private static readonly USIG_API = 'https://servicios.usig.buenosaires.gob.ar/normalizar';
  private static readonly NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

  // Rate limiting para Nominatim (1 req/segundo)
  private static lastNominatimCall = 0;
  private static readonly NOMINATIM_DELAY = 1000;

  // Caché local para búsquedas
  private static readonly CACHE_KEY = 'georef-address-cache';
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hora
  private static readonly CACHE_MAX_ENTRIES = 100;

  /**
   * Geocodifica una dirección usando proveedores en cascada
   * Intenta Georef → USIG (si es CABA) → Nominatim
   */
  static async geocodeAddress(address: AddressInput): Promise<GeocodingResult> {
    logger.info('Geocoding address', { address });

    // 1. Intentar con Georef AR (mejor para Argentina)
    try {
      const georefResult = await this.geocodeWithGeoref(address);
      if (georefResult) {
        logger.info('Geocoding successful with Georef', { result: georefResult });
        return georefResult;
      }
    } catch (error) {
      logger.warn('Georef geocoding failed', { error });
    }

    // 2. Intentar con USIG (mejor para CABA)
    if (this.isBuenosAires(address)) {
      try {
        const usigResult = await this.geocodeWithUSIG(address);
        if (usigResult) {
          logger.info('Geocoding successful with USIG', { result: usigResult });
          return usigResult;
        }
      } catch (error) {
        logger.warn('USIG geocoding failed', { error });
      }
    }

    // 3. Fallback a Nominatim (global pero menos preciso)
    logger.info('Falling back to Nominatim');
    return this.geocodeWithNominatim(address);
  }

  /**
   * Busca direcciones con autocomplete usando Georef AR
   * Retorna hasta 10 sugerencias con información completa
   *
   * @param query - Texto de búsqueda (ej: "Alfredo Palacios 2817")
   * @param provincia - Filtro opcional por provincia
   * @param max - Número máximo de resultados (default: 10)
   */
  static async searchAddresses(
    query: string,
    provincia?: string,
    max: number = 10
  ): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      logger.info('Query too short', { query, length: query.trim().length });
      return [];
    }

    // Buscar en caché primero
    const cached = this.getFromCache(query, provincia);
    if (cached) {
      console.log('💾 [Cache] Hit! Returning cached results for:', query);
      return cached;
    }

    // Si no está en caché, hacer request
    const results = await this.searchAddressesWithRetry(query, provincia, max, 2);

    // Guardar en caché si hubo resultados
    if (results.length > 0) {
      this.saveToCache(query, provincia, results);
    }

    return results;
  }

  /**
   * Obtiene resultados del caché local
   * @private
   */
  private static getFromCache(query: string, provincia?: string): AddressSuggestion[] | null {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      if (!cacheData) return null;

      const cache = JSON.parse(cacheData) as Record<string, {
        results: AddressSuggestion[];
        timestamp: number;
        provincia?: string;
      }>;

      const cacheKey = this.getCacheKey(query, provincia);
      const entry = cache[cacheKey];

      if (!entry) return null;

      // Verificar si expiró
      const now = Date.now();
      if (now - entry.timestamp > this.CACHE_TTL) {
        console.log('⏰ [Cache] Expired entry for:', query);
        delete cache[cacheKey];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return entry.results;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Guarda resultados en el caché local
   * @private
   */
  private static saveToCache(query: string, provincia: string | undefined, results: AddressSuggestion[]): void {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      const cache = cacheData ? JSON.parse(cacheData) : {};

      const cacheKey = this.getCacheKey(query, provincia);

      // Agregar nueva entrada
      cache[cacheKey] = {
        results,
        timestamp: Date.now(),
        provincia
      };

      // Limpiar entradas viejas si excede el límite
      const entries = Object.entries(cache);
      if (entries.length > this.CACHE_MAX_ENTRIES) {
        // Ordenar por timestamp y eliminar las más viejas
        const sorted = entries.sort(([, a]: any, [, b]: any) => b.timestamp - a.timestamp);
        const cleaned = Object.fromEntries(sorted.slice(0, this.CACHE_MAX_ENTRIES));
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cleaned));
        console.log('🧹 [Cache] Cleaned old entries, kept:', this.CACHE_MAX_ENTRIES);
      } else {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      }

      console.log('💾 [Cache] Saved results for:', query, `(${results.length} items)`);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Si falla localStorage (ej: QuotaExceededError), limpiar todo
      try {
        localStorage.removeItem(this.CACHE_KEY);
      } catch (e) {
        // Ignorar
      }
    }
  }

  /**
   * Genera clave de caché normalizada
   * @private
   */
  private static getCacheKey(query: string, provincia?: string): string {
    const normalized = query.trim().toLowerCase();
    return provincia ? `${normalized}|${provincia.toLowerCase()}` : normalized;
  }

  /**
   * Busca direcciones con retry automático
   * @private
   */
  private static async searchAddressesWithRetry(
    query: string,
    provincia?: string,
    max: number = 10,
    maxRetries: number = 2,
    currentAttempt: number = 1
  ): Promise<AddressSuggestion[]> {
    try {
      let url = `${this.GEOREF_API}/direcciones?direccion=${encodeURIComponent(query)}&max=${max}`;

      if (provincia) {
        url += `&provincia=${encodeURIComponent(provincia)}`;
      }

      console.log(`🔍 [Georef] Fetching addresses (attempt ${currentAttempt}/${maxRetries + 1}):`, url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout (aumentado por CORS preflight)

      const startTime = performance.now();

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'default'
      });

      clearTimeout(timeoutId);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      console.log('📡 [Georef] Response status:', response.status, response.statusText, `(${duration}ms)`);

      // Retry en errores temporales
      if (response.status === 408 || response.status === 429 || response.status === 503) {
        if (currentAttempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, currentAttempt - 1), 4000); // Exponential backoff: 1s, 2s, 4s
          console.warn(`⏳ [Georef] Retrying in ${delay}ms (status: ${response.status})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.searchAddressesWithRetry(query, provincia, max, maxRetries, currentAttempt + 1);
        } else {
          throw new Error(`Georef API timeout after ${maxRetries + 1} attempts`);
        }
      }

      if (!response.ok) {
        throw new Error(`Georef API error: ${response.status}`);
      }

      const data: any = await response.json();

      console.log('📦 [Georef] Response data:', data);
      console.log('📊 [Georef] Total results:', data.total);
      console.log('📋 [Georef] Direcciones count:', data.direcciones?.length || 0);

      if (!data.direcciones || data.direcciones.length === 0) {
        console.warn('⚠️ [Georef] No addresses found for query:', query);
        return [];
      }

      const suggestions = data.direcciones.map((dir: any, index: number) => {
        const altura = dir.altura?.valor || null;
        const calle = dir.calle?.nombre || '';
        const ciudad = dir.localidad_censal?.nombre || dir.departamento?.nombre || '';
        const provincia = dir.provincia?.nombre || 'Argentina';
        const departamento = dir.departamento?.nombre;
        const localidad = dir.localidad_censal?.nombre;

        return {
          id: `${dir.calle?.id || index}-${altura || 'sn'}`,
          nomenclatura: dir.nomenclatura,
          calle,
          altura,
          ciudad,
          provincia,
          latitude: dir.ubicacion.lat,
          longitude: dir.ubicacion.lon,
          departamento,
          localidad
        } as AddressSuggestion;
      });

      console.log('✅ [Georef] Parsed suggestions:', suggestions.length, suggestions);

      return suggestions;
    } catch (error) {
      // Manejar timeout del AbortController
      if (error instanceof Error && error.name === 'AbortError') {
        if (currentAttempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, currentAttempt - 1), 4000);
          console.warn(`⏳ [Georef] Request timeout, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.searchAddressesWithRetry(query, provincia, max, maxRetries, currentAttempt + 1);
        } else {
          console.error('❌ [Georef] Request timeout after all retries');
          logger.error('Georef timeout after retries', { query, attempts: currentAttempt });
          return [];
        }
      }

      console.error('❌ [Georef] Error searching addresses:', error);
      logger.error('Error searching addresses with Georef', { error, query });
      return [];
    }
  }

  /**
   * Georef AR - API oficial del gobierno argentino
   * Mejor precisión para direcciones de Argentina
   */
  private static async geocodeWithGeoref(address: AddressInput): Promise<GeocodingResult | null> {
    const fullAddress = this.formatAddressForGeoref(address);
    const url = `${this.GEOREF_API}/direcciones?direccion=${encodeURIComponent(fullAddress)}&max=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Georef API error: ${response.status}`);
    }

    const data: GeorefResponse = await response.json();

    if (data.direcciones && data.direcciones.length > 0) {
      const result = data.direcciones[0];
      return {
        latitude: result.ubicacion.lat,
        longitude: result.ubicacion.lon,
        formatted_address: result.nomenclatura,
        confidence: 'high',
        provider: 'georef'
      };
    }

    return null;
  }

  /**
   * USIG - API del Gobierno de Buenos Aires
   * Mayor precisión para direcciones en CABA
   *
   * IMPORTANTE: USIG devuelve coordenadas en formato { x: lng, y: lat }
   */
  private static async geocodeWithUSIG(address: AddressInput): Promise<GeocodingResult | null> {
    const direccion = address.address_line_1;
    const url = `${this.USIG_API}/?direccion=${encodeURIComponent(direccion)}&geocodificar=true&srid=4326`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USIG API error: ${response.status}`);
    }

    const data: USIGResponse = await response.json();

    if (data.coordenadas) {
      return {
        // ⚠️ IMPORTANTE: USIG usa x=lng, y=lat (invertido respecto a Leaflet)
        latitude: parseFloat(data.coordenadas.y),
        longitude: parseFloat(data.coordenadas.x),
        formatted_address: data.direccion || address.address_line_1,
        confidence: 'high',
        provider: 'usig'
      };
    }

    return null;
  }

  /**
   * Nominatim - Fallback usando OpenStreetMap
   * Cobertura global pero menor precisión en Argentina
   *
   * Rate limit: 1 request/segundo
   */
  private static async geocodeWithNominatim(address: AddressInput): Promise<GeocodingResult> {
    // Respetar rate limit
    const now = Date.now();
    const timeSinceLastCall = now - this.lastNominatimCall;
    if (timeSinceLastCall < this.NOMINATIM_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.NOMINATIM_DELAY - timeSinceLastCall));
    }
    this.lastNominatimCall = Date.now();

    const fullAddress = `${address.address_line_1}, ${address.city || 'Buenos Aires'}, Argentina`;
    const url = `${this.NOMINATIM_API}?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'G-Admin-Mini/1.0 (contact@example.com)' // Nominatim requiere User-Agent
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimResponse[] = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formatted_address: data[0].display_name,
        confidence: 'medium',
        provider: 'nominatim'
      };
    }

    throw new Error('No se pudo geocodificar la dirección con ningún proveedor');
  }

  /**
   * Geocodifica y actualiza customer_addresses en la base de datos
   * Se ejecuta en background después de guardar la dirección
   */
  static async geocodeAndUpdate(addressId: string, address: AddressInput): Promise<void> {
    try {
      const result = await this.geocodeAddress(address);

      const { error } = await supabase
        .from('customer_addresses')
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
          formatted_address: result.formatted_address,
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);

      if (error) {
        logger.error('Failed to update geocoded address', { error, addressId });
        throw error;
      }

      logger.info('Address geocoded and updated successfully', { addressId, provider: result.provider });
    } catch (error) {
      logger.error('Geocoding and update failed', { error, addressId });
      // No lanzar error - la dirección se guardó sin coordenadas
      // El usuario puede reintentarlo manualmente
    }
  }

  /**
   * Batch geocoding para múltiples direcciones
   * Útil para migración de datos o importación masiva
   */
  static async batchGeocode(addresses: Array<{ id: string; data: AddressInput }>): Promise<void> {
    logger.info('Starting batch geocoding', { count: addresses.length });

    for (const { id, data } of addresses) {
      try {
        await this.geocodeAndUpdate(id, data);
        // Delay para respetar rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        logger.error('Batch geocoding failed for address', { id, error });
        // Continuar con las siguientes direcciones
      }
    }

    logger.info('Batch geocoding completed');
  }

  // ============================================
  // HELPERS
  // ============================================

  private static formatAddressForGeoref(address: AddressInput): string {
    const parts = [address.address_line_1];
    if (address.city && address.city !== 'Buenos Aires') {
      parts.push(address.city);
    }
    if (address.state) {
      parts.push(address.state);
    }
    return parts.join(', ');
  }

  private static isBuenosAires(address: AddressInput): boolean {
    const state = address.state?.toUpperCase();
    const city = address.city?.toLowerCase();

    return (
      state === 'CABA' ||
      state === 'CAPITAL FEDERAL' ||
      city?.includes('buenos aires')
    );
  }

  /**
   * Valida si unas coordenadas están dentro de Argentina (aproximado)
   */
  static isValidArgentinaCoordinates(lat: number, lng: number): boolean {
    // Bounding box aproximado de Argentina
    return (
      lat >= -55 && lat <= -21.78 &&  // Latitud
      lng >= -73.59 && lng <= -53.65   // Longitud
    );
  }

  /**
   * Calcula distancia entre dos puntos (en km) usando fórmula Haversine
   * Útil para delivery zones y route optimization
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Ordena sugerencias por proximidad a una ubicación
   */
  static sortByProximity(
    suggestions: AddressSuggestion[],
    userLat: number,
    userLng: number
  ): Array<AddressSuggestion & { distance: number }> {
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        distance: this.calculateDistance(
          userLat,
          userLng,
          suggestion.latitude,
          suggestion.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Formatea distancia para mostrar en UI
   */
  static formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    } else if (km < 10) {
      return `${km.toFixed(1)}km`;
    } else {
      return `${Math.round(km)}km`;
    }
  }
}
