/**
 * Zones Tab
 *
 * Manages delivery zones with map-based polygon editor
 * Uses ZoneEditorEnhanced from delivery module
 *
 * Phase 1 - Part 3: Delivery Sub-Module (Task 13)
 */

import { useState } from 'react';
import { Stack, Text, Alert, Button, Box } from '@/shared/ui';
import { PlusIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { ZoneEditorEnhanced } from '@/modules/fulfillment/delivery/components';
import type { DeliveryZone } from '@/modules/fulfillment/delivery/types';

interface ZonesTabProps {
  zones: DeliveryZone[];
  loading: boolean;
  onRefresh: () => void;
  canCreate: boolean;
}

export default function ZonesTab({
  zones,
  loading,
  onRefresh,
  canCreate
}: ZonesTabProps) {
  logger.debug('ZonesTab', 'Rendering', { zonesCount: zones.length });

  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Text>Cargando zonas de delivery...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Zonas de Delivery ({zones.length})
        </Text>
        {canCreate && (
          <Button
            variant="solid"
            colorPalette="blue"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Zona
          </Button>
        )}
      </Stack>

      {/* Info alert */}
      <Alert status="info" title="Gestión de Zonas">
        Las zonas de delivery permiten controlar tarifas, tiempos estimados y
        validar direcciones automáticamente. Dibuja polígonos en el mapa para
        definir cada zona.
      </Alert>

      {/* Zone List or Editor */}
      {isCreating || editingZone ? (
        <Box>
          <ZoneEditorEnhanced
            zone={editingZone || undefined}
            onSave={async () => {
              setIsCreating(false);
              setEditingZone(null);
              await onRefresh();
            }}
            onCancel={() => {
              setIsCreating(false);
              setEditingZone(null);
            }}
          />
        </Box>
      ) : (
        <ZonesList
          zones={zones}
          onEdit={(zone) => setEditingZone(zone)}
          onRefresh={onRefresh}
        />
      )}
    </Stack>
  );
}

/**
 * Zones List Component
 */
interface ZonesListProps {
  zones: DeliveryZone[];
  onEdit: (zone: DeliveryZone) => void;
  onRefresh: () => void;
}

function ZonesList({ zones, onEdit }: ZonesListProps) {
  if (zones.length === 0) {
    return (
      <Alert status="warning" title="No hay zonas configuradas">
        Crea tu primera zona de delivery para comenzar a gestionar entregas.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {zones.map((zone) => (
        <Box
          key={zone.id}
          p="md"
          borderWidth="1px"
          borderRadius="md"
          cursor="pointer"
          onClick={() => onEdit(zone)}
          _hover={{ bg: 'gray.50' }}
        >
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="xs">
              <Text fontWeight="semibold">{zone.name}</Text>
              {zone.description && (
                <Text fontSize="sm" color="gray.600">
                  {zone.description}
                </Text>
              )}
              <Text fontSize="sm" color="gray.500">
                Tarifa: ${zone.delivery_fee} | Tiempo estimado: {zone.estimated_time_minutes} min
              </Text>
            </Stack>
            <Box
              w="4"
              h="4"
              borderRadius="full"
              bg={zone.color}
            />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
