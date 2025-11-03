import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '@/shared/ui';
import type { DeliveryOrder, DeliveryZone } from '../../types/deliveryTypes';
import { MapMarker } from './MapMarker';
import { DriverMarker } from './DriverMarker';

interface MapViewProps {
  deliveries: DeliveryOrder[];
  zones: DeliveryZone[];
  selectedDelivery: DeliveryOrder | null;
  onSelectDelivery: (delivery: DeliveryOrder) => void;
}

// Default center: Buenos Aires (Leaflet uses [lat, lng])
const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];
const DEFAULT_ZOOM = 12;

// Component to handle map effects (bounds fitting, selection)
function MapController({ deliveries, selectedDelivery }: { deliveries: DeliveryOrder[]; selectedDelivery: DeliveryOrder | null }) {
  const map = useMap();
  const hasInitializedBounds = useRef(false);

  // Auto-fit bounds to show all deliveries on initial load
  useEffect(() => {
    if (hasInitializedBounds.current || deliveries.length === 0) return;

    const validDeliveries = deliveries.filter(
      d => d.delivery_coordinates?.lat && d.delivery_coordinates?.lng
    );

    if (validDeliveries.length === 0) return;

    const bounds = L.latLngBounds(
      validDeliveries.map(d => [d.delivery_coordinates.lat, d.delivery_coordinates.lng] as [number, number])
    );

    map.fitBounds(bounds, { padding: [50, 50] });

    // Prevent zooming in too much for single marker
    setTimeout(() => {
      if (map.getZoom() > 16) {
        map.setZoom(16);
      }
    }, 100);

    hasInitializedBounds.current = true;
  }, [map, deliveries]);

  // Pan to selected delivery
  useEffect(() => {
    if (!selectedDelivery) return;

    if (selectedDelivery.delivery_coordinates?.lat && selectedDelivery.delivery_coordinates?.lng) {
      map.setView(
        [selectedDelivery.delivery_coordinates.lat, selectedDelivery.delivery_coordinates.lng],
        15,
        { animate: true }
      );
    }
  }, [map, selectedDelivery]);

  return null;
}

export function MapView({ deliveries, zones, selectedDelivery, onSelectDelivery }: MapViewProps) {
  return (
    <Box
      flex={1}
      height="100%"
      borderRadius="md"
      overflow="hidden"
      position="relative"
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map controller for effects */}
        <MapController deliveries={deliveries} selectedDelivery={selectedDelivery} />

        {/* Render delivery markers */}
        {deliveries.map(delivery => (
          delivery.delivery_coordinates?.lat && delivery.delivery_coordinates?.lng && (
            <MapMarker
              key={delivery.id}
              delivery={delivery}
              isSelected={selectedDelivery?.id === delivery.id}
              onClick={() => onSelectDelivery(delivery)}
            />
          )
        ))}

        {/* Render driver markers */}
        {deliveries
          .filter(d => d.driver_id && d.status === 'in_transit')
          .map(delivery => (
            <DriverMarker
              key={`driver-${delivery.driver_id}`}
              driverId={delivery.driver_id!}
              driverName={delivery.driver_name || 'Driver'}
            />
          ))
        }

        {/* TODO: Render zone polygons */}
        {/* TODO: Render route polylines */}
      </MapContainer>
    </Box>
  );
}
