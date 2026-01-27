/**
 * Public Delivery Zones API
 * 
 * API pública para consultar zonas de delivery sin autenticación.
 * Solo expone información necesaria para clientes (sin datos sensibles).
 */

import { supabase } from '@/lib/supabase/client';
import type { PublicDeliveryZone, Coordinates, ZoneValidation } from '../types';

/**
 * Obtiene zonas públicas de delivery
 * @param locationId - ID de sucursal (opcional para multi-location)
 * @returns Array de zonas públicas
 */
export async function getPublicDeliveryZones(
  locationId?: string
): Promise<PublicDeliveryZone[]> {
  try {
    let query = supabase
      .from('delivery_zones')
      .select('id, name, boundaries, delivery_fee, estimated_time_minutes, min_order_amount, color')
      .eq('is_active', true)
      .order('priority', { ascending: false, nullsFirst: false })
      .order('name');

    // Filtro multi-location: zonas de sucursal + zonas globales
    if (locationId) {
      query = query.or(`location_id.eq.${locationId},location_id.is.null`);
    } else {
      // Sin locationId, solo zonas globales
      query = query.is('location_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[publicZonesApi] Error fetching zones:', error);
      return [];
    }

    return (data || []) as PublicDeliveryZone[];
  } catch (error) {
    console.error('[publicZonesApi] Failed to fetch zones:', error);
    return [];
  }
}

/**
 * Verifica si una dirección tiene cobertura de delivery
 * @param coordinates - Coordenadas {lat, lng}
 * @param locationId - ID de sucursal (opcional)
 * @returns Resultado de validación
 */
export async function checkDeliveryAvailability(
  coordinates: Coordinates,
  locationId?: string
): Promise<ZoneValidation> {
  try {
    const zones = await getPublicDeliveryZones(locationId);

    // Validar coordenadas contra cada zona (ray-casting)
    for (const zone of zones) {
      if (isPointInPolygon(coordinates, zone.boundaries)) {
        return {
          valid: true,
          zone_id: zone.id,
          zone_name: zone.name,
          delivery_fee: zone.delivery_fee,
          estimated_time_minutes: zone.estimated_time_minutes,
          min_order_amount: zone.min_order_amount
        };
      }
    }

    // No está en ninguna zona
    return {
      valid: false,
      error_message: 'Esta dirección está fuera de nuestra zona de cobertura'
    };
  } catch (error) {
    console.error('[publicZonesApi] Failed to check availability:', error);
    return {
      valid: false,
      error_message: 'Error al verificar la cobertura. Por favor, intenta nuevamente.'
    };
  }
}

/**
 * Algoritmo ray-casting para verificar si un punto está dentro de un polígono
 * @param point - Punto a verificar
 * @param polygon - Array de coordenadas del polígono
 * @returns true si el punto está dentro del polígono
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = ((yi > point.lat) !== (yj > point.lat))
      && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calcula la distancia entre dos puntos (fórmula de Haversine)
 * @param lat1 - Latitud punto 1
 * @param lng1 - Longitud punto 1
 * @param lat2 - Latitud punto 2
 * @param lng2 - Longitud punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
