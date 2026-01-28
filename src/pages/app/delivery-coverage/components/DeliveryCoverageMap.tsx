/**
 * Delivery Coverage Map Component
 * 
 * Public component for customers to view delivery zones
 * Uses Leaflet to display coverage areas on a map
 */

import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Text, Badge, Spinner } from '@/shared/ui';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryZone } from '@/modules/delivery/types';

interface DeliveryCoverageMapProps {
  zones: DeliveryZone[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showLegend?: boolean;
}

export function DeliveryCoverageMap({
  zones,
  center = [-34.603722, -58.381592], // Buenos Aires default
  zoom = 12,
  height = '500px',
  showLegend = true
}: DeliveryCoverageMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
      dragging: true,
      zoomControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  // Draw zones on map
  useEffect(() => {
    if (!mapRef.current || !isMapReady || zones.length === 0) return;

    const map = mapRef.current;
    const polygons: L.Polygon[] = [];

    zones.forEach((zone) => {
      if (!zone.boundaries || zone.boundaries.length < 3) return;

      // Convert boundaries to Leaflet LatLng format
      const latlngs: L.LatLngExpression[] = zone.boundaries.map((coord) => [
        coord.lat,
        coord.lng
      ]);

      // Create polygon
      const polygon = L.polygon(latlngs, {
        color: zone.color || '#3b82f6',
        fillColor: zone.color || '#3b82f6',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map);

      // Add popup with zone info
      const popupContent = `
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${zone.name}</div>
          ${zone.description ? `<div style="color: #666; font-size: 12px; margin-bottom: 8px;">${zone.description}</div>` : ''}
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
            <div>💵 Costo de envío: <strong>$${zone.delivery_fee}</strong></div>
            <div>⏱️ Tiempo estimado: <strong>${zone.estimated_time_minutes} min</strong></div>
            ${zone.min_order_amount ? `<div>📦 Pedido mínimo: <strong>$${zone.min_order_amount}</strong></div>` : ''}
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent);
      polygons.push(polygon);
    });

    // Fit map to show all zones
    if (polygons.length > 0) {
      const group = L.featureGroup(polygons);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    // Cleanup polygons on unmount or zones change
    return () => {
      polygons.forEach(p => p.remove());
    };
  }, [zones, isMapReady]);

  return (
    <Stack gap="md">
      {/* Map Container */}
      <Box position="relative" width="100%" height={height} borderRadius="md" overflow="hidden">
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 0
          }}
        />
        
        {!isMapReady && (
          <Stack
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            align="center"
            justify="center"
            bg="gray.100"
          >
            <Spinner size="xl" colorPalette="blue" />
            <Text color="gray.600">Cargando mapa...</Text>
          </Stack>
        )}
      </Box>

      {/* Legend */}
      {showLegend && zones.length > 0 && (
        <Box
          bg="white"
          p="md"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Text fontWeight="semibold" fontSize="sm" mb="sm">
            Zonas de Cobertura
          </Text>
          <Stack gap="xs">
            {zones.map((zone) => (
              <Stack key={zone.id} direction="row" align="center" gap="sm">
                <Box
                  width="20px"
                  height="20px"
                  borderRadius="sm"
                  bg={zone.color || '#3b82f6'}
                  flexShrink={0}
                />
                <Stack gap="2xs" flex={1}>
                  <Text fontSize="sm" fontWeight="medium">{zone.name}</Text>
                  <Stack direction="row" gap="md" fontSize="xs" color="gray.600">
                    <Text>💵 ${zone.delivery_fee}</Text>
                    <Text>⏱️ {zone.estimated_time_minutes} min</Text>
                  </Stack>
                </Stack>
                {zone.is_active ? (
                  <Badge colorPalette="green" size="sm">Activo</Badge>
                ) : (
                  <Badge colorPalette="gray" size="sm">Inactivo</Badge>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
