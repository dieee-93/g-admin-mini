/**
 * Zone Form Modal - Create/Edit delivery zone
 * 
 * Modal dialog for creating and editing delivery zones with map drawing capabilities.
 * Uses Chakra UI v3 Dialog pattern with tabs for form details and map editing.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, Stack, Text, Alert, Tabs, Box, Switch, Flex, Textarea, Input, NativeSelect, Button } from '@/shared/ui';
import { ZoneMapEditor } from './ZoneMapEditor';
import type { DeliveryZone, Coordinates, CreateDeliveryZoneData, UpdateDeliveryZoneData } from '../types';
import { useLocation } from '@/contexts/LocationContext';

interface ZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: DeliveryZone | null;
  onSave: (data: CreateDeliveryZoneData | UpdateDeliveryZoneData) => Promise<void>;
}

export function ZoneFormModal({ isOpen, onClose, zone, onSave }: ZoneFormModalProps) {
  // Multi-location support - consume global context
  const { selectedLocation, isMultiLocationMode, locations } = useLocation();

  // Form state - location initialized from global context
  const [locationId, setLocationId] = useState<string | null>(selectedLocation?.id || null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isActive, setIsActive] = useState(true);
  const [boundaries, setBoundaries] = useState<Coordinates[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load zone data when editing
  useEffect(() => {
    if (zone) {
      setLocationId(zone.location_id || null);
      setName(zone.name);
      setDescription(zone.description || '');
      setDeliveryFee(zone.delivery_fee.toString());
      setEstimatedTime(zone.estimated_time_minutes.toString());
      setMinOrderAmount(zone.min_order_amount?.toString() || '');
      setColor(zone.color || '#3b82f6');
      setIsActive(zone.is_active);
      setBoundaries(zone.boundaries || []);
    } else {
      // Reset for new zone - use global location
      resetForm();
    }
  }, [zone, isOpen]);

  // Initialize location from global context for new zones
  useEffect(() => {
    if (!zone && isOpen) {
      // New zone: use globally selected location by default
      setLocationId(selectedLocation?.id || null);
    }
  }, [zone, selectedLocation, isOpen]);

  const resetForm = useCallback(() => {
    // Reset to global location instead of null
    setLocationId(selectedLocation?.id || null);
    setName('');
    setDescription('');
    setDeliveryFee('');
    setEstimatedTime('');
    setMinOrderAmount('');
    setColor('#3b82f6');
    setIsActive(true);
    setBoundaries([]);
  }, [selectedLocation]);

  const handlePolygonChange = useCallback((newBoundaries: Coordinates[]) => {
    setBoundaries(newBoundaries);
  }, []);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la zona');
      return;
    }

    if (!deliveryFee || parseFloat(deliveryFee) < 0) {
      alert('Por favor ingresa una tarifa de delivery válida');
      return;
    }

    if (!estimatedTime || parseInt(estimatedTime) < 0) {
      alert('Por favor ingresa un tiempo estimado válido');
      return;
    }

    if (boundaries.length < 3) {
      alert('Por favor dibuja el área de la zona en el mapa (mínimo 3 puntos)');
      return;
    }

    setIsSaving(true);

    try {
      const zoneData: CreateDeliveryZoneData | UpdateDeliveryZoneData = zone
        ? {
            id: zone.id,
            location_id: locationId,
            name: name.trim(),
            description: description.trim() || undefined,
            boundaries,
            color,
            delivery_fee: parseFloat(deliveryFee),
            min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            estimated_time_minutes: parseInt(estimatedTime)
          }
        : {
            location_id: locationId,
            name: name.trim(),
            description: description.trim() || undefined,
            boundaries,
            color,
            delivery_fee: parseFloat(deliveryFee),
            min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            estimated_time_minutes: parseInt(estimatedTime)
          };

      await onSave(zoneData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving zone', error);
      alert('Error al guardar la zona. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!details.open) {
      onClose();
    }
  }, [onClose]);

  const dialogSize = useMemo(() => ({ base: 'full', md: 'xl' } as const), []);
  const modalTitle = zone ? `Editar Zona: ${zone.name}` : 'Nueva Zona de Delivery';

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      size={dialogSize}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: '100%', md: '900px' }}
          maxH={{ base: '100vh', md: '90vh' }}
          w="full"
          overflowY="auto"
          borderRadius={{ base: '0', md: 'lg' }}
          m={{ base: '0', md: '4' }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body p={{ base: '4', md: '6' }}>
            <Tabs.Root defaultValue="details">
              <Tabs.List>
                <Tabs.Trigger value="details">Detalles</Tabs.Trigger>
                <Tabs.Trigger value="map">Área del Mapa</Tabs.Trigger>
              </Tabs.List>

              {/* Tab 1: Details */}
              <Tabs.Content value="details">
                <Stack gap="md" paddingTop="md">
                  {/* Name */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Nombre <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input
                      placeholder="Ej: Centro, Palermo, Recoleta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Stack>

                  {/* Description */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Descripción
                    </Text>
                    <Textarea
                      placeholder="Descripción opcional de la zona..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </Stack>

                  {/* Location Selector - only show if multi-location enabled */}
                  {isMultiLocationMode && (
                    <Stack gap="xs">
                      <Text fontWeight="medium" fontSize="sm">
                        Sucursal
                      </Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={locationId || 'global'}
                          onChange={(e) => setLocationId(e.target.value === 'global' ? null : e.target.value)}
                        >
                          <option value="global">🌍 Todas las sucursales (Global)</option>
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                              📍 {loc.name} (PDV: {loc.punto_venta_afip})
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                      <Text fontSize="xs" color="gray.500">
                        Las zonas globales se aplican a todas las sucursales
                      </Text>

                      {/* Warning when location diverges from global selection */}
                      {locationId !== selectedLocation?.id && locationId !== null && (
                        <Alert status="info">
                          <Stack gap="xs">
                            <Text fontWeight="medium" fontSize="sm">
                              📍 Ubicación diferente seleccionada
                            </Text>
                            <Text fontSize="xs">
                              Esta zona se {zone ? 'actualizará' : 'creará'} para una ubicación diferente
                              a la seleccionada globalmente ({selectedLocation?.name || 'Ninguna'})
                            </Text>
                          </Stack>
                        </Alert>
                      )}
                    </Stack>
                  )}

                  {/* Delivery Fee */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Tarifa de Delivery ($) <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input
                      type="number"
                      placeholder="Ej: 500"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </Stack>

                  {/* Estimated Time */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Tiempo Estimado (minutos) <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input
                      type="number"
                      placeholder="Ej: 30"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      min="0"
                      required
                    />
                  </Stack>

                  {/* Min Order Amount */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Monto Mínimo de Orden ($)
                    </Text>
                    <Input
                      type="number"
                      placeholder="Ej: 1000 (opcional)"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <Text fontSize="xs" color="gray.500">
                      Dejar vacío si no hay monto mínimo
                    </Text>
                  </Stack>

                  {/* Color Picker */}
                  <Stack gap="xs">
                    <Text fontWeight="medium" fontSize="sm">
                      Color para el Mapa
                    </Text>
                    <Stack direction="row" gap="sm" align="center">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        width="80px"
                      />
                      <Text fontSize="sm" color="gray.600">
                        {color}
                      </Text>
                    </Stack>
                  </Stack>

                  {/* Is Active Switch */}
                  <Switch checked={isActive} onChange={(checked) => setIsActive(checked)}>
                    Zona Activa
                  </Switch>

                  {/* Boundaries info */}
                  {boundaries.length > 0 && (
                    <Alert status="success">
                      Área del mapa definida con {boundaries.length} puntos
                    </Alert>
                  )}
                  {boundaries.length === 0 && (
                    <Alert status="warning">
                      <Stack gap="xs">
                        <Text fontWeight="medium">Área del mapa no definida</Text>
                        <Text fontSize="sm">
                          Ve a la pestaña "Área del Mapa" para dibujar los límites de la zona
                        </Text>
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              </Tabs.Content>

              {/* Tab 2: Map */}
              <Tabs.Content value="map">
                <Box paddingTop="md" height="600px" width="100%">
                  <ZoneMapEditor
                    zone={zone || undefined}
                    onPolygonChange={handlePolygonChange}
                  />
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Body>

          <Dialog.Footer>
            <Flex
              gap="3"
              justify={{ base: 'stretch', md: 'flex-end' }}
              direction={{ base: 'column-reverse', md: 'row' }}
              w="full"
            >
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                h="44px"
                fontSize="md"
                px="6"
                w={{ base: 'full', md: 'auto' }}
              >
                Cancelar
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleSave}
                disabled={isSaving}
                h="44px"
                fontSize="md"
                px="6"
                w={{ base: 'full', md: 'auto' }}
              >
                {isSaving ? 'Guardando...' : zone ? 'Actualizar Zona' : 'Crear Zona'}
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
