// MapMarker component for rendering delivery markers on Leaflet
import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DeliveryOrder } from '../../types/deliveryTypes';

interface MapMarkerProps {
  delivery: DeliveryOrder;
  isSelected: boolean;
  onClick: () => void;
}

// Get marker icon color based on delivery status
function getMarkerColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#EF4444',        // red - Not assigned yet
    assigned: '#3B82F6',       // blue - Assigned to driver
    picked_up: '#8B5CF6',      // violet - Driver picked up
    in_transit: '#F97316',     // orange - On the way
    delivered: '#10B981',      // green - Completed
    cancelled: '#6B7280'       // gray
  };
  return colors[status] || '#EF4444';
}

// Get status label in Spanish
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    assigned: 'Asignado',
    picked_up: 'Retirado',
    in_transit: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
}

// Create custom Leaflet icon with color
function createMarkerIcon(status: string, isSelected: boolean): L.DivIcon {
  const color = getMarkerColor(status);
  const size = isSelected ? 32 : 25;
  const pulse = isSelected ? 'animation: pulse 1.5s infinite;' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${pulse}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

export function MapMarker({ delivery, isSelected, onClick }: MapMarkerProps) {
  const map = useMap();

  // Open popup when selected
  useEffect(() => {
    if (isSelected) {
      // Small delay to ensure marker is rendered
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const marker = layer as L.Marker;
            const latLng = marker.getLatLng();
            if (
              latLng.lat === delivery.delivery_coordinates.lat &&
              latLng.lng === delivery.delivery_coordinates.lng
            ) {
              marker.openPopup();
            }
          }
        });
      }, 100);
    }
  }, [isSelected, map, delivery.delivery_coordinates.lat, delivery.delivery_coordinates.lng]);

  const position: [number, number] = [
    delivery.delivery_coordinates.lat,
    delivery.delivery_coordinates.lng
  ];

  const icon = createMarkerIcon(delivery.status, isSelected);

  return (
    <Marker
      position={position}
      icon={icon}
      title={`Delivery #${delivery.order_number}`}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup maxWidth={300} minWidth={200}>
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            Orden #{delivery.order_number}
          </h3>
          <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Cliente:</strong> {delivery.customer_name || 'N/A'}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Dirección:</strong> {delivery.delivery_address || 'N/A'}
            </div>
            {delivery.driver_name && (
              <div style={{ marginBottom: '4px' }}>
                <strong>Driver:</strong> {delivery.driver_name}
              </div>
            )}
            <div style={{ marginBottom: '4px' }}>
              <strong>Estado:</strong>{' '}
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: `${getMarkerColor(delivery.status)}20`,
                color: getMarkerColor(delivery.status),
                fontWeight: '600',
                fontSize: '11px'
              }}>
                {getStatusLabel(delivery.status)}
              </span>
            </div>
            {delivery.delivery_instructions && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                📝 {delivery.delivery_instructions}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
