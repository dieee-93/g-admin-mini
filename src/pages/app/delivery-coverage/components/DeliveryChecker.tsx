/**
 * Delivery Address Checker Component
 * 
 * Public component for customers to check if delivery is available
 * at their address
 */

import { useState } from 'react';
import { Stack, Box, Input, Button, Alert, Text, Badge } from '@/shared/ui';
import { checkDeliveryAvailability } from '@/modules/delivery/services/publicZonesApi';
import type { Coordinates } from '@/modules/delivery/types';

interface DeliveryCheckerProps {
  locationId?: string;
  onAddressValidated?: (valid: boolean, zoneInfo?: any) => void;
}

export function DeliveryChecker({ locationId, onAddressValidated }: DeliveryCheckerProps) {
  const [address, setAddress] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    zone_name?: string;
    delivery_fee?: number;
    estimated_time_minutes?: number;
    error_message?: string;
  } | null>(null);

  const handleCheckAddress = async () => {
    if (!address.trim()) {
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      // TODO: Integrate with a geocoding service (Google Maps, Mapbox, etc.)
      // For now, we'll use a mock implementation
      // In production, you would:
      // 1. Call geocoding API to get coordinates from address
      // 2. Then call checkDeliveryAvailability with those coordinates
      
      // Mock coordinates for Buenos Aires (for demo)
      const mockCoordinates: Coordinates = {
        lat: -34.603722,
        lng: -58.381592
      };

      const validation = await checkDeliveryAvailability(mockCoordinates, locationId);
      setResult(validation);

      if (onAddressValidated) {
        onAddressValidated(validation.valid, validation);
      }
    } catch (error) {
      console.error('Error checking address:', error);
      setResult({
        valid: false,
        error_message: 'Error al validar la dirección. Por favor intenta nuevamente.'
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Input Section */}
      <Box>
        <Text fontWeight="semibold" fontSize="sm" mb="xs">
          Ingresa tu dirección de entrega
        </Text>
        <Stack direction="row" gap="sm">
          <Input
            placeholder="Ej: Av. Corrientes 1234, CABA"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCheckAddress();
              }
            }}
            flex={1}
          />
          <Button
            colorPalette="blue"
            onClick={handleCheckAddress}
            loading={checking}
            disabled={!address.trim() || checking}
          >
            Verificar
          </Button>
        </Stack>
        <Text fontSize="xs" color="gray.500" mt="xs">
          Verifica si realizamos entregas en tu zona
        </Text>
      </Box>

      {/* Results Section */}
      {result && (
        <Box>
          {result.valid ? (
            <Alert.Root status="success" variant="subtle">
              <Alert.Indicator />
              <Stack gap="2" flex="1">
                <Alert.Title>✅ ¡Hacemos entregas en tu zona!</Alert.Title>
                <Alert.Description>
                  <Stack gap="sm" fontSize="sm">
                    <Stack direction="row" align="center" gap="sm" flexWrap="wrap">
                      <Badge colorPalette="blue" size="sm">
                        Zona: {result.zone_name}
                      </Badge>
                      {result.delivery_fee !== undefined && (
                        <Badge colorPalette="green" size="sm">
                          💵 Envío: ${result.delivery_fee}
                        </Badge>
                      )}
                      {result.estimated_time_minutes && (
                        <Badge colorPalette="purple" size="sm">
                          ⏱️ {result.estimated_time_minutes} min
                        </Badge>
                      )}
                    </Stack>
                  </Stack>
                </Alert.Description>
              </Stack>
            </Alert.Root>
          ) : (
            <Alert.Root status="error" variant="subtle">
              <Alert.Indicator />
              <Stack gap="1" flex="1">
                <Alert.Title>❌ No realizamos entregas en esta zona</Alert.Title>
                <Alert.Description>
                  {result.error_message || 'Tu dirección está fuera de nuestras zonas de cobertura.'}
                </Alert.Description>
              </Stack>
            </Alert.Root>
          )}
        </Box>
      )}

      {/* Instructions */}
      <Box
        bg="blue.50"
        p="md"
        borderRadius="md"
        borderWidth="1px"
        borderColor="blue.200"
      >
        <Stack gap="xs">
          <Text fontWeight="semibold" fontSize="sm" color="blue.900">
            💡 Consejos para una validación precisa
          </Text>
          <Stack gap="2xs" fontSize="xs" color="blue.800">
            <Text>• Incluye el número de calle y altura</Text>
            <Text>• Especifica el barrio o localidad</Text>
            <Text>• Agrega referencias si es necesario</Text>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
