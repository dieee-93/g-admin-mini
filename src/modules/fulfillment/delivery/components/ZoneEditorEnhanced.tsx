/**
 * Zone Editor Enhanced - Complete zone configuration with map drawing
 *
 * Phase 1 - Task 10: Leaflet Draw integration
 */

import { useState, useEffect } from 'react';
import { Stack, Button, CardWrapper, Text, Box, Alert, Tabs } from '@/shared/ui';
import { Checkbox, Textarea, Input } from '@chakra-ui/react';
import { ZoneMapEditor } from './ZoneMapEditor';
import type { DeliveryZone, Coordinates, CreateDeliveryZoneData, UpdateDeliveryZoneData } from '../types';
import { logger } from '@/lib/logging';

interface ZoneEditorEnhancedProps {
  zone: DeliveryZone | null;
  onSave: (data: CreateDeliveryZoneData | UpdateDeliveryZoneData) => Promise<void>;
  onCancel: () => void;
}

export function ZoneEditorEnhanced({ zone, onSave, onCancel }: ZoneEditorEnhancedProps) {
  // Form state
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
      logger.debug('ZoneEditor', 'Loading zone for editing', { zoneId: zone.id });
      setName(zone.name);
      setDescription(zone.description || '');
      setDeliveryFee(zone.delivery_fee.toString());
      setEstimatedTime(zone.estimated_time_minutes.toString());
      setMinOrderAmount(zone.min_order_amount?.toString() || '');
      setColor(zone.color || '#3b82f6');
      setIsActive(zone.is_active);
      setBoundaries(zone.boundaries || []);
    } else {
      // Reset for new zone
      logger.debug('ZoneEditor', 'Resetting form for new zone');
      resetForm();
    }
  }, [zone]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDeliveryFee('');
    setEstimatedTime('');
    setMinOrderAmount('');
    setColor('#3b82f6');
    setIsActive(true);
    setBoundaries([]);
  };

  const handlePolygonChange = (newBoundaries: Coordinates[]) => {
    logger.debug('ZoneEditor', 'Polygon changed', {
      pointsCount: newBoundaries.length
    });
    setBoundaries(newBoundaries);
  };

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

    logger.info('ZoneEditor', 'Saving zone', {
      name,
      isEdit: !!zone,
      boundariesCount: boundaries.length
    });

    setIsSaving(true);

    try {
      const zoneData: CreateDeliveryZoneData | UpdateDeliveryZoneData = zone
        ? {
            id: zone.id,
            name: name.trim(),
            description: description.trim() || undefined,
            boundaries,
            color,
            delivery_fee: parseFloat(deliveryFee),
            min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            estimated_time_minutes: parseInt(estimatedTime)
          }
        : {
            name: name.trim(),
            description: description.trim() || undefined,
            boundaries,
            color,
            delivery_fee: parseFloat(deliveryFee),
            min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            estimated_time_minutes: parseInt(estimatedTime)
          };

      // Zone data prepared (id included if editing)
      await onSave(zoneData);

      logger.info('ZoneEditor', 'Zone saved successfully');
      resetForm();
    } catch (error) {
      logger.error('ZoneEditor', 'Error saving zone', error);
      alert('Error al guardar la zona. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show empty state if no zone selected and form is empty
  if (!zone && name === '' && boundaries.length === 0) {
    return (
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Stack gap="md" align="center" textAlign="center">
          <Text color="gray.500" fontSize="lg" fontWeight="medium">
            Selecciona una zona existente para editar
          </Text>
          <Text color="gray.400" fontSize="sm">
            o crea una nueva completando el formulario
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box flex={1} overflowY="auto" height="100%">
      <CardWrapper>
        <Stack gap="md" height="100%">
          <Text fontWeight="bold" fontSize="lg">
            {zone ? `Editar Zona: ${zone.name}` : 'Nueva Zona de Delivery'}
          </Text>

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

                {/* Is Active Checkbox */}
                <Checkbox isChecked={isActive} onChange={(e) => setIsActive(e.target.checked)}>
                  Zona Activa
                </Checkbox>

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
              <Box paddingTop="md" height="600px">
                <ZoneMapEditor
                  zone={zone}
                  onPolygonChange={handlePolygonChange}
                />
              </Box>
            </Tabs.Content>
          </Tabs.Root>

          {/* Actions */}
          <Stack direction="row" gap="sm" paddingTop="md">
            <Button
              variant="solid"
              colorPalette="blue"
              onClick={handleSave}
              flex={1}
              disabled={isSaving}
              loading={isSaving}
            >
              {zone ? 'Actualizar Zona' : 'Crear Zona'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              flex={1}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </CardWrapper>
    </Box>
  );
}
