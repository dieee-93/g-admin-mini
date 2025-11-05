import { Stack, Box, Text, Badge, CardWrapper } from '@/shared/ui';
import { CheckCircleIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { DeliveryZone } from '@/modules/fulfillment/delivery/types';

interface ZonesListProps {
  zones: DeliveryZone[];
  selectedZone: DeliveryZone | null;
  onSelectZone: (zone: DeliveryZone) => void;
  loading: boolean;
}

export function ZonesList({ zones, selectedZone, onSelectZone, loading }: ZonesListProps) {
  if (loading) {
    return (
      <Box width="40%" minWidth="300px">
        <Text>Cargando zonas...</Text>
      </Box>
    );
  }

  const activeZones = zones.filter((z) => z.is_active);
  const avgFee =
    zones.length > 0 ? zones.reduce((sum, z) => sum + z.delivery_fee, 0) / zones.length : 0;

  return (
    <Box width="40%" minWidth="300px" height="100%" overflowY="auto">
      <Stack gap="md">
        <Text fontWeight="bold" fontSize="lg">
          Zonas de Delivery
        </Text>

        {/* Zones List */}
        <Stack gap="sm">
          {zones.map((zone) => (
            <CardWrapper
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              cursor="pointer"
              borderWidth="2px"
              borderColor={selectedZone?.id === zone.id ? 'blue.500' : 'transparent'}
              bg={selectedZone?.id === zone.id ? 'blue.50' : 'white'}
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
