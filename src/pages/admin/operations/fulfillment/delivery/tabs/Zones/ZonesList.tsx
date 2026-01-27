import { Stack, Box, Text, Badge, CardWrapper } from '@/shared/ui';
import { CheckCircleIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { DeliveryZone } from '@/modules/fulfillment/delivery/types';
import { useLocation } from '@/contexts/LocationContext';

interface ZonesListProps {
  zones: DeliveryZone[];
  onEdit: (zone: DeliveryZone) => void;
  loading: boolean;
}

export function ZonesList({ zones, onEdit, loading }: ZonesListProps) {
  const { isMultiLocationMode, locations } = useLocation();
  if (loading) {
    return (
      <Box width="100%">
        <Text>Cargando zonas...</Text>
      </Box>
    );
  }

  const activeZones = zones.filter((z) => z.is_active);
  const avgFee =
    zones.length > 0 ? zones.reduce((sum, z) => sum + z.delivery_fee, 0) / zones.length : 0;

  return (
    <Box width="100%" height="100%" overflowY="auto">
      <Stack gap="md">
        <Text fontWeight="bold" fontSize="lg">
          Zonas de Delivery
        </Text>

        {/* Zones List */}
        <Stack gap="sm">
          {zones.map((zone) => (
            <CardWrapper
              key={zone.id}
              onClick={() => onEdit(zone)}
              cursor="pointer"
              _hover={{ borderColor: 'blue.300', shadow: 'sm' }}
              transition="all 0.2s"
            >
              <Stack direction="row" align="center" gap="sm">
                {/* Color Badge */}
                <Box
                  width="12px"
                  height="40px"
                  borderRadius="sm"
                  bg={zone.color || '#3b82f6'}
                />

                {/* Zone Info */}
                <Stack flex={1} gap="xs">
                  <Stack direction="row" align="center" justify="space-between">
                    <Text fontWeight="bold">{zone.name}</Text>
                    {zone.is_active ? (
                      <CheckCircleIcon
                        style={{ width: '20px', height: '20px', color: '#10b981' }}
                      />
                    ) : (
                      <XCircleIcon style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    )}
                  </Stack>
                  <Stack direction="row" gap="md" fontSize="sm" color="gray.600">
                    <Text>💵 ${zone.delivery_fee}</Text>
                    <Text>⏱️ {zone.estimated_time_minutes} min</Text>
                  </Stack>
                  
                  {/* Location Badge - only show if multi-location enabled */}
                  {isMultiLocationMode && (
                    <Box mt="xs">
                      {zone.location_id ? (
                        <Badge colorPalette="blue" size="sm">
                          📍 {locations.find(l => l.id === zone.location_id)?.name || 'Sucursal'}
                        </Badge>
                      ) : (
                        <Badge colorPalette="purple" size="sm">🌍 Global</Badge>
                      )}
                    </Box>
                  )}
                </Stack>
              </Stack>
            </CardWrapper>
          ))}
        </Stack>

        {/* Stats */}
        <CardWrapper bg="gray.50">
          <Stack gap="sm" fontSize="sm">
            <Text fontWeight="bold">Estadísticas</Text>
            <Stack gap="xs">
              <Text>
                <MapPinIcon
                  style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }}
                />
                <strong>{activeZones.length}</strong> zonas activas de {zones.length}
              </Text>
              <Text>
                💵 Tarifa promedio: <strong>${avgFee.toFixed(2)}</strong>
              </Text>
            </Stack>
          </Stack>
        </CardWrapper>
      </Stack>
    </Box>
  );
}
