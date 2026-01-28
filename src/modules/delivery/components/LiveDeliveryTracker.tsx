/**
 * Live Delivery Tracker - Real-time GPS tracking visualization
 *
 * Phase 1 - Task 12: GPS tracking integration
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Stack, Text, Badge, Button, Alert } from '@/shared/ui';
import { PlayIcon, StopIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useDriverLocation } from '../hooks/useDriverLocation';
import type { DeliveryOrder } from '../types';

interface LiveDeliveryTrackerProps {
  /**
   * Delivery to track
   */
  delivery: DeliveryOrder;

  /**
   * Auto-start tracking
   */
  autoStart?: boolean;

  /**
   * Height of the map
   */
  height?: string;
}

// Custom marker icons
const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM3.375 12.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zM3.375 18h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Map controller to auto-fit bounds
function MapController({ driverLocation, destinationLocation }: {
  driverLocation: [number, number] | null;
  destinationLocation: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (!driverLocation) return;

    // Create bounds including driver and destination
    const bounds = L.latLngBounds([driverLocation, destinationLocation]);

    // Fit map to bounds
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15
    });
  }, [driverLocation, destinationLocation, map]);

  return null;
}

export function LiveDeliveryTracker({
  delivery,
  autoStart = false,
  height = '500px'
}: LiveDeliveryTrackerProps) {
  const {
    location,
    accuracy,
    isTracking,
    error,
    startTracking,
    stopTracking
  } = useDriverLocation({
    driverId: delivery.driver_id!,
    deliveryId: delivery.id,
    autoStart
  });

  const destinationCoords: [number, number] = [
    delivery.delivery_coordinates.lat,
    delivery.delivery_coordinates.lng
  ];

  const driverCoords: [number, number] | null = location
    ? [location.lat, location.lng]
    : null;

  // Calculate route polyline
  const routePoints: [number, number][] = driverCoords
    ? [driverCoords, destinationCoords]
    : [];

  // Calculate distance (simple straight line)
  const calculateDistance = (): number | null => {
    if (!driverCoords) return null;

    const R = 6371; // Earth radius in km
    const dLat = (destinationCoords[0] - driverCoords[0]) * Math.PI / 180;
    const dLon = (destinationCoords[1] - driverCoords[1]) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(driverCoords[0] * Math.PI / 180) *
      Math.cos(destinationCoords[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance();

  return (
    <Stack gap="md" height="100%">
      {/* Controls */}
      <Stack direction="row" gap="sm" align="center" flexWrap="wrap">
        {/* Tracking button */}
        {!isTracking ? (
          <Button
            size="sm"
            variant="solid"
            colorPalette="green"
            onClick={startTracking}
          >
            <PlayIcon style={{ width: '16px', height: '16px' }} />
            Iniciar Tracking GPS
          </Button>
        ) : (
          <Button
            size="sm"
            variant="solid"
            colorPalette="red"
            onClick={stopTracking}
          >
            <StopIcon style={{ width: '16px', height: '16px' }} />
            Detener Tracking
          </Button>
        )}

        {/* Status badges */}
        {isTracking && (
          <Badge colorPalette="green" variant="solid">
            🟢 GPS Activo
          </Badge>
        )}

        {accuracy !== null && (
          <Badge colorPalette="blue" variant="subtle">
            📡 Precisión: {accuracy.toFixed(0)}m
          </Badge>
        )}

        {distance !== null && (
          <Badge colorPalette="purple" variant="subtle">
            📍 Distancia: {distance.toFixed(2)} km
          </Badge>
        )}
      </Stack>

      {/* Error */}
      {error && (
        <Alert status="error" title="Error de GPS">
          {error}
        </Alert>
      )}

      {/* Driver info */}
      <Stack direction="row" gap="sm" align="center" fontSize="sm" color="gray.600">
        <TruckIcon style={{ width: '16px', height: '16px' }} />
        <Text fontWeight="medium">{delivery.driver_name || 'Repartidor'}</Text>
        <Text>→</Text>
        <MapPinIcon style={{ width: '16px', height: '16px' }} />
        <Text>{delivery.delivery_address}</Text>
      </Stack>

      {/* Map */}
      <Box
        flex={1}
        height={height}
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
      >
        <MapContainer
          center={driverCoords || destinationCoords}
          zoom={13}
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

          {/* Map controller for auto-fitting */}
          {driverCoords && (
            <MapController
              driverLocation={driverCoords}
              destinationLocation={destinationCoords}
            />
          )}

          {/* Driver marker */}
          {driverCoords && (
            <Marker position={driverCoords} icon={driverIcon}>
              {/* Popup could be added here */}
            </Marker>
          )}

          {/* Destination marker */}
          <Marker position={destinationCoords} icon={destinationIcon}>
            {/* Popup could be added here */}
          </Marker>

          {/* Route polyline */}
          {routePoints.length === 2 && (
            <Polyline
              positions={routePoints}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </Box>

      {/* Info */}
      {!isTracking && (
        <Alert status="info">
          <Stack gap="xs">
            <Text fontWeight="medium">Tracking GPS no activo</Text>
            <Text fontSize="sm">
              Haz clic en "Iniciar Tracking GPS" para comenzar a rastrear la ubicación del repartidor en tiempo real.
            </Text>
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}
