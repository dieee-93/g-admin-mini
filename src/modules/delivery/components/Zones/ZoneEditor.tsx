import { useState, useEffect } from 'react';
import { Stack, Button, CardWrapper, Text, Alert, Box, Checkbox, Textarea, Input } from '@/shared/ui';
import type { DeliveryZone } from '../../types';

interface ZoneEditorProps {
  zone: DeliveryZone | null;
  onSave: (data: Partial<DeliveryZone>) => Promise<void>;
  onCancel: () => void;
}

export function ZoneEditor({ zone, onSave, onCancel }: ZoneEditorProps) {
  const [name, setName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setDeliveryFee(zone.delivery_fee.toString());
      setEstimatedTime(zone.estimated_time_minutes.toString());
      setMinOrderAmount(zone.min_order_amount?.toString() || '');
      setColor(zone.color || '#3b82f6');
      setIsActive(zone.is_active);
      setDescription(zone.description || '');
    } else {
      // Reset for new zone
      setName('');
      setDeliveryFee('');
      setEstimatedTime('');
      setMinOrderAmount('');
      setColor('#3b82f6');
      setIsActive(true);
      setDescription('');
    }
  }, [zone]);

  const handleSave = async () => {
    if (!name || !deliveryFee || !estimatedTime) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name,
        delivery_fee: parseFloat(deliveryFee),
        estimated_time_minutes: parseInt(estimatedTime),
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        color,
        is_active: isActive,
        description: description || undefined
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!zone && name === '') {
    return (
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500" fontSize="lg">
          Selecciona una zona o crea una nueva
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} overflowY="auto">
      <CardWrapper>
        <Stack gap="md">
          <Text fontWeight="bold" fontSize="lg">
            {zone ? 'Editar Zona' : 'Nueva Zona'}
          </Text>

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

          {/* Delivery Fee */}
          <Stack gap="xs">
            <Text fontWeight="medium" fontSize="sm">
              Tarifa de Delivery ($) <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              type="number"
              placeholder="Ej: 50"
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
              placeholder="Ej: 100 (opcional)"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              min="0"
              step="0.01"
            />
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
          <Checkbox checked={isActive} onCheckedChange={(details) => setIsActive(!!details.checked)}>
            Zona Activa
          </Checkbox>

          {/* Description */}
          <Stack gap="xs">
            <Text fontWeight="medium" fontSize="sm">
              Descripción
            </Text>
            <Textarea
              placeholder="Descripción opcional de la zona..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Stack>

          {/* Boundaries Placeholder */}
          <Alert status="info">
            <Stack gap="xs">
              <Text fontWeight="medium">Límites de la Zona</Text>
              <Text fontSize="sm">
                La funcionalidad de dibujar límites en el mapa estará disponible en Phase 4.
              </Text>
            </Stack>
          </Alert>

          {/* Actions */}
          <Stack direction="row" gap="sm">
            <Button
              variant="solid"
              onClick={handleSave}
              flex={1}
              disabled={isSaving}
              loading={isSaving}
            >
              Guardar
            </Button>
            <Button variant="outline" onClick={onCancel} flex={1} disabled={isSaving}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </CardWrapper>
    </Box>
  );
}
