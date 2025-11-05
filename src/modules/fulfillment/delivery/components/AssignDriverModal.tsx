import { useState } from 'react';
import { Stack, Text, Button, Badge, CardWrapper, Box, Modal, RadioGroup, Radio } from '@/shared/ui';
import { UserIcon, TruckIcon, StarIcon } from '@heroicons/react/24/solid';
import type { DeliveryOrder, DriverPerformance } from '../types';
import { logger } from '@/lib/logging';

interface AssignDriverModalProps {
  delivery: DeliveryOrder;
  drivers: DriverPerformance[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (deliveryId: string, driverId: string) => Promise<void>;
}

export function AssignDriverModal({
  delivery,
  drivers,
  isOpen,
  onClose,
  onAssign
}: AssignDriverModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter only available drivers
  const availableDrivers = drivers.filter((d) => d.is_available && !d.current_delivery_id);

  const handleAssign = async () => {
    if (!selectedDriverId) {
      alert('Por favor selecciona un driver');
      return;
    }

    setIsAssigning(true);
    try {
      await onAssign(delivery.id, selectedDriverId);
      onClose();
    } catch (error) {
      logger.error('AssignDriverModal', 'Error assigning driver:', error);
      alert('Error al asignar driver');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onClose} size="lg">
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Asignar Repartidor</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Stack gap="lg">
            {/* Delivery Info */}
            <CardWrapper bg="gray.50">
              <Stack gap="sm">
                <Text fontWeight="bold" fontSize="md">
                  📦 Información del Delivery
                </Text>
                <Stack gap="xs" fontSize="sm">
                  <Text>
                    <strong>Orden:</strong> #{delivery.order_number}
                  </Text>
                  <Text>
                    <strong>Cliente:</strong> {delivery.customer_name}
                  </Text>
                  <Text>
                    <strong>Dirección:</strong> {delivery.delivery_address}
                  </Text>
                  {delivery.delivery_notes && (
                    <Text>
                      <strong>Notas:</strong> {delivery.delivery_notes}
                    </Text>
                  )}
                  <Badge colorPalette="blue" width="fit-content">
                    Total: ${delivery.total_amount.toFixed(2)}
                  </Badge>
                </Stack>
              </Stack>
            </CardWrapper>

            {/* Driver Selection */}
            <Stack gap="md">
              <Text fontWeight="bold" fontSize="md">
                🚚 Seleccionar Repartidor
              </Text>

              {availableDrivers.length === 0 ? (
                <Text color="red.500">No hay drivers disponibles en este momento</Text>
              ) : (
                <RadioGroup value={selectedDriverId} onChange={setSelectedDriverId}>
                  <Stack gap="sm">
                    {availableDrivers.map((driver) => (
                      <CardWrapper
                        key={driver.driver_id}
                        cursor="pointer"
                        borderWidth="2px"
                        borderColor={
                          selectedDriverId === driver.driver_id ? 'blue.500' : 'transparent'
                        }
                        bg={selectedDriverId === driver.driver_id ? 'blue.50' : 'white'}
                        _hover={{ borderColor: 'blue.300' }}
                        onClick={() => setSelectedDriverId(driver.driver_id)}
                      >
                        <Stack direction="row" align="center" gap="md">
                          <Radio value={driver.driver_id} />

                          <Box
                            width="40px"
                            height="40px"
                            borderRadius="full"
                            bg="blue.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <UserIcon style={{ width: '20px', height: '20px', color: '#3182ce' }} />
                          </Box>

                          <Stack gap="xs" flex={1}>
                            <Text fontWeight="bold">{driver.driver_name}</Text>
                            <Stack direction="row" gap="md" fontSize="sm" color="gray.600">
                              <Stack direction="row" align="center" gap="xs">
                                <StarIcon
                                  style={{ width: '14px', height: '14px', color: '#f59e0b' }}
                                />
                                <Text>{driver.average_rating?.toFixed(1) || 'N/A'}</Text>
                              </Stack>
                              <Stack direction="row" align="center" gap="xs">
                                <TruckIcon style={{ width: '14px', height: '14px' }} />
                                <Text>{driver.completed_today || 0} hoy</Text>
                              </Stack>
                              {driver.vehicle_type && (
                                <Text>🚗 {driver.vehicle_type}</Text>
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardWrapper>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Stack>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Stack direction="row" gap="sm" width="100%">
            <Button variant="outline" onClick={onClose} flex={1} disabled={isAssigning}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              onClick={handleAssign}
              flex={1}
              disabled={!selectedDriverId || isAssigning || availableDrivers.length === 0}
              loading={isAssigning}
            >
              Asignar Repartidor
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
