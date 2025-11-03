/**
 * Zone Map Editor - Polygon drawing for delivery zones
 *
 * Uses Leaflet + Leaflet Draw for interactive polygon creation
 * Phase 1 - Task 10: Map integration
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Box, Stack, Text, Alert } from '@/shared/ui';
import { logger } from '@/lib/logging';
import type { Coordinates, DeliveryZone } from '../types';

// Leaflet Draw event types
interface LeafletDrawEvent {
  layerType: string;
  layer: L.Layer & {
    getLatLngs: () => L.LatLng[][];
  };
}

interface LeafletLayersEvent {
  layers: L.LayerGroup & {
    eachLayer: (callback: (layer: L.Layer) => void) => void;
  };
}

interface ZoneMapEditorProps {
  /**
   * Existing zone to edit (optional)
   */
  zone?: DeliveryZone;

  /**
   * Callback when polygon is created/edited
   */
  onPolygonChange: (boundaries: Coordinates[]) => void;

  /**
   * Map center (default: Buenos Aires)
   */
  center?: [number, number];

  /**
   * Initial zoom level
   */
  zoom?: number;
}

// Default map settings
const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]; // Buenos Aires
const DEFAULT_ZOOM = 12;

// Map controller to handle zone loading
function MapController({ zone }: { zone?: DeliveryZone }) {
  const map = useMap();

  useEffect(() => {
    if (!zone || !zone.boundaries || zone.boundaries.length === 0) return;

    // Convert zone boundaries to Leaflet LatLngBounds
    const bounds = L.latLngBounds(
      zone.boundaries.map(coord => [coord.lat, coord.lng] as [number, number])
    );

    // Fit map to zone boundaries
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [zone, map]);

  return null;
}

export function ZoneMapEditor({
  zone,
  onPolygonChange,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM
}: ZoneMapEditorProps) {
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [hasPolygon, setHasPolygon] = useState(false);

  /**
   * Load existing zone polygon on mount
   */
  useEffect(() => {
    if (!zone || !zone.boundaries || zone.boundaries.length === 0) return;
    if (!featureGroupRef.current) return;

    // Clear existing layers
    featureGroupRef.current.clearLayers();

    // Create polygon from zone boundaries
    const polygon = L.polygon(
      zone.boundaries.map(coord => [coord.lat, coord.lng] as [number, number]),
      {
        color: zone.color || '#3b82f6',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.2
      }
    );

    // Add to feature group
    featureGroupRef.current.addLayer(polygon);
    setHasPolygon(true);

    logger.debug('ZoneMapEditor', 'Loaded existing zone polygon', {
      zoneId: zone.id,
      pointsCount: zone.boundaries.length
    });
  }, [zone]);

  /**
   * Handle polygon created
   */
  const handleCreated = (e: LeafletDrawEvent) => {
    logger.debug('ZoneMapEditor', 'Polygon created', { layerType: e.layerType });

    const layer = e.layer;
    const latLngs = layer.getLatLngs()[0]; // Get outer ring

    // Convert to Coordinates array
    const boundaries: Coordinates[] = latLngs.map((latLng: L.LatLng) => ({
      lat: latLng.lat,
      lng: latLng.lng
    }));

    logger.info('ZoneMapEditor', 'Polygon boundaries extracted', {
      pointsCount: boundaries.length
    });

    setHasPolygon(true);
    onPolygonChange(boundaries);
  };

  /**
   * Handle polygon edited
   */
  const handleEdited = (e: LeafletLayersEvent) => {
    logger.debug('ZoneMapEditor', 'Polygon edited');

    const layers = e.layers;
    layers.eachLayer((layer: L.Layer & { getLatLngs: () => L.LatLng[][] }) => {
      const latLngs = layer.getLatLngs()[0]; // Get outer ring

      // Convert to Coordinates array
      const boundaries: Coordinates[] = latLngs.map((latLng: L.LatLng) => ({
        lat: latLng.lat,
        lng: latLng.lng
      }));

      logger.info('ZoneMapEditor', 'Polygon edited', {
        pointsCount: boundaries.length
      });

      onPolygonChange(boundaries);
    });
  };

  /**
   * Handle polygon deleted
   */
  const handleDeleted = () => {
    logger.debug('ZoneMapEditor', 'Polygon deleted');
    setHasPolygon(false);
    onPolygonChange([]);
  };

  return (
    <Stack gap="sm" height="100%">
      {/* Instructions */}
      <Alert status="info" title="Cómo dibujar una zona">
        <Stack gap="xs">
          <Text fontSize="sm">
            1. Haz click en el ícono de polígono (cuadrado) en la barra de herramientas
          </Text>
          <Text fontSize="sm">
            2. Haz click en el mapa para crear los vértices de la zona
          </Text>
          <Text fontSize="sm">
            3. Haz click en el primer punto para cerrar el polígono
          </Text>
          <Text fontSize="sm">
            4. Usa las herramientas de edición para modificar o eliminar
          </Text>
        </Stack>
      </Alert>

      {/* Map */}
      <Box
        flex={1}
        borderRadius="md"
        overflow="hidden"
        position="relative"
        border="1px solid"
        borderColor="gray.200"
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Map controller for zone loading */}
          <MapController zone={zone} />

          {/* Drawing controls */}
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
              draw={{
                // Enable polygon drawing
                polygon: {
                  allowIntersection: false,
                  shapeOptions: {
                    color: zone?.color || '#3b82f6',
                    weight: 3,
                    opacity: 0.8,
                    fillOpacity: 0.2
                  }
                },
                // Disable other shapes
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false
              }}
              edit={{
                // Enable editing
                edit: true,
                remove: true
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </Box>

      {/* Status indicator */}
      {hasPolygon && (
        <Alert status="success" title="Zona definida">
          La zona ha sido dibujada correctamente. Puedes editarla o eliminarla usando las herramientas del mapa.
        </Alert>
      )}
    </Stack>
  );
}
