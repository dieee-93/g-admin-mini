/**
 * Zone Map Editor - Polygon drawing for delivery zones
 *
 * Uses Leaflet + Leaflet Draw for interactive polygon creation
 * Optimized for rendering inside modals and tabs using vanilla Leaflet
 * 
 * @see https://leafletjs.com/reference.html - Leaflet API
 * @see https://github.com/Leaflet/Leaflet.draw - Leaflet Draw plugin
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Box, Stack, Text, Alert } from '@/shared/ui';
import type { Coordinates, DeliveryZone } from '../types';

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

/**
 * ZoneMapEditor Component
 * 
 * Best practices implemented:
 * 1. Proper cleanup with map.remove() on unmount
 * 2. IntersectionObserver to detect visibility changes
 * 3. invalidateSize() when container becomes visible
 * 4. Separate effect for loading zone data
 * 5. Prevents multiple map instances on same container
 */
export function ZoneMapEditor({
  zone,
  onPolygonChange,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM
}: ZoneMapEditorProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const isInitializedRef = useRef(false);
  
  const [hasPolygon, setHasPolygon] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  /**
   * Initialize map instance
   * Called when container becomes visible
   */
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (isInitializedRef.current) return;
    if (mapRef.current) return;

    // Create map with initial settings
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
      dragging: true,
      zoomControl: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Create feature group for editable layers
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Configure Leaflet Draw control
    console.log('L.Control.Draw available:', L.Control.Draw);
    console.log('L.Draw available:', L.Draw);
    
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false, // Restrict to simple polygons
          drawError: {
            color: '#e74c3c',
            message: '<strong>Error:</strong> Los bordes no pueden intersectarse'
          },
          shapeOptions: {
            color: zone?.color || '#3b82f6',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.2
          }
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItems // REQUIRED for editing
      }
    });
    
    console.log('Draw control created:', drawControl);
    map.addControl(drawControl);
    console.log('Draw control added to map');
    drawControlRef.current = drawControl;

    // Event: Shape created
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      
      // Clear previous polygon (only one at a time)
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      // Extract coordinates
      const latLngs = layer.getLatLngs()[0];
      const boundaries: Coordinates[] = latLngs.map((latLng: L.LatLng) => ({
        lat: latLng.lat,
        lng: latLng.lng
      }));

      setHasPolygon(true);
      onPolygonChange(boundaries);
    });

    // Event: Shape edited
    map.on(L.Draw.Event.EDITED, (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        const latLngs = layer.getLatLngs()[0];
        const boundaries: Coordinates[] = latLngs.map((latLng: L.LatLng) => ({
          lat: latLng.lat,
          lng: latLng.lng
        }));

        onPolygonChange(boundaries);
      });
    });

    // Event: Shape deleted
    map.on(L.Draw.Event.DELETED, () => {
      setHasPolygon(false);
      onPolygonChange([]);
    });

    mapRef.current = map;
    isInitializedRef.current = true;
    setIsMapReady(true);

    // Invalidate size to handle initial render in hidden containers
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, zoom, zone?.color, onPolygonChange]);

  /**
   * Main effect: Setup IntersectionObserver and initialization
   */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use IntersectionObserver to detect when container becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Container is visible, initialize map if needed
            initializeMap();
            
            // Recalculate size if map already exists
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(mapContainerRef.current);

    // Cleanup
    return () => {
      observer.disconnect();
      
      if (mapRef.current) {
        mapRef.current.off(); // Remove all event listeners
        mapRef.current.remove(); // Destroy the map instance
        mapRef.current = null;
      }
      
      drawnItemsRef.current = null;
      drawControlRef.current = null;
      isInitializedRef.current = false;
      setIsMapReady(false);
    };
  }, [initializeMap]);

  /**
   * Effect: Load existing zone polygon
   */
  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current || !isMapReady) return;
    if (!zone || !zone.boundaries || zone.boundaries.length === 0) return;

    const map = mapRef.current;
    const drawnItems = drawnItemsRef.current;

    // Clear existing layers
    drawnItems.clearLayers();

    // Create polygon from zone boundaries
    const latlngs: L.LatLngExpression[] = zone.boundaries.map((coord) => [
      coord.lat,
      coord.lng
    ]);

    const polygon = L.polygon(latlngs, {
      color: zone.color || '#3b82f6',
      weight: 3,
      opacity: 0.8,
      fillOpacity: 0.2
    });

    drawnItems.addLayer(polygon);
    setHasPolygon(true);

    // Fit map to zone boundaries
    const bounds = L.latLngBounds(latlngs as [number, number][]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [zone, isMapReady]);

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
        minHeight="400px"
        borderRadius="md"
        overflow="hidden"
        position="relative"
        border="1px solid"
        borderColor="gray.200"
      >
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 0
          }}
        />
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
