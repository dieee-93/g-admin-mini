/**
 * Address Map Preview
 * Mapa pequeño para visualizar las direcciones del cliente usando Leaflet
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Text, Badge } from '@/shared/ui';
import type { CustomerAddress } from '../../types/customer';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressMapPreviewProps {
  addresses: CustomerAddress[];
  selectedAddress: CustomerAddress | null;
  height?: string;
}

// Component to handle map effects (bounds fitting)
function MapController({ addresses, selectedAddress }: { addresses: CustomerAddress[]; selectedAddress: CustomerAddress | null }) {
  const map = useMap();

  // Auto-fit bounds to show all addresses
  useEffect(() => {
    if (addresses.length === 0) return;

    const validAddresses = addresses.filter(
      a => a.latitude && a.longitude
    );

    if (validAddresses.length === 0) return;

    if (validAddresses.length === 1) {
      // Single address - center on it
      const addr = validAddresses[0];
      map.setView([addr.latitude!, addr.longitude!], 15);
    } else {
      // Multiple addresses - fit bounds
      const bounds = L.latLngBounds(
        validAddresses.map(a => [a.latitude!, a.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, addresses]);

  // Pan to selected address
  useEffect(() => {
    if (!selectedAddress || !selectedAddress.latitude || !selectedAddress.longitude) return;

    map.setView(
      [selectedAddress.latitude, selectedAddress.longitude],
      15,
      { animate: true }
    );
  }, [map, selectedAddress]);

  return null;
}

// Custom marker icon for selected address
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function AddressMapPreview({ addresses, selectedAddress, height = '300px' }: AddressMapPreviewProps) {
  // Filter addresses with coordinates
  const geocodedAddresses = addresses.filter(a => a.latitude && a.longitude);

  if (geocodedAddresses.length === 0) {
    return (
      <Box
        height={height}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <Text color="gray.500">Sin direcciones geocodificadas</Text>
      </Box>
    );
  }

  // Default center: first geocoded address or Buenos Aires
  const defaultCenter: [number, number] = geocodedAddresses[0]
    ? [geocodedAddresses[0].latitude!, geocodedAddresses[0].longitude!]
    : [-34.6037, -58.3816];

  return (
    <Box
      height={height}
      borderRadius="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map controller for effects */}
        <MapController addresses={geocodedAddresses} selectedAddress={selectedAddress} />

        {/* Render address markers */}
        {geocodedAddresses.map(address => {
          const isSelected = selectedAddress?.id === address.id;

          return (
            <Marker
              key={address.id}
              position={[address.latitude!, address.longitude!]}
              icon={isSelected ? selectedIcon : new L.Icon.Default()}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Text fontWeight="semibold">{address.label}</Text>
                    {address.is_default && (
                      <Badge colorPalette="green" variant="subtle" size="sm">
                        Por defecto
                      </Badge>
                    )}
                  </div>

                  <Text fontSize="sm" color="gray.700">
                    {address.formatted_address || address.address_line_1}
                  </Text>

                  {address.address_line_2 && (
                    <Text fontSize="sm" color="gray.600">
                      {address.address_line_2}
                    </Text>
                  )}

                  {address.delivery_instructions && (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic" marginTop="2">
                      📋 {address.delivery_instructions}
                    </Text>
                  )}

                  <Text fontSize="xs" color="gray.400" marginTop="2">
                    📍 {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                  </Text>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
}
