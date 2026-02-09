/**
 * EquipmentSection - Equipment selection and cost calculation
 *
 * Allows user to add equipment with hours used.
 * Equipment hourly_cost_rate includes all direct costs.
 */

import { Box, Stack, Typography, Button } from '@/shared/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { memo, useCallback } from 'react';
import type { ProductionEquipmentUsage } from '@/shared/components/EquipmentSelector';

interface EquipmentSectionProps {
  equipment: ProductionEquipmentUsage[];
  onChange: (equipment: ProductionEquipmentUsage[]) => void;
  onRequestEquipmentSelector?: () => void;
}

export const EquipmentSection = memo(function EquipmentSection({
  equipment,
  onChange,
  onRequestEquipmentSelector
}: EquipmentSectionProps) {

  const handleRemove = useCallback((id: string) => {
    onChange(equipment.filter(eq => eq.id !== id));
  }, [equipment, onChange]);

  const totalCost = equipment.reduce((sum, eq) => sum + eq.total_cost, 0);

  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      borderLeftWidth="4px"
      borderLeftColor="purple.500"
    >
      <Stack gap="4">
        {/* Header */}
        <Stack direction="row" align="center" justify="space-between">
          <Typography fontSize="sm" fontWeight="700">
            3️⃣ EQUIPAMIENTO
          </Typography>
          <Button
            size="sm"
            colorPalette="purple"
            onClick={onRequestEquipmentSelector}
            disabled={!onRequestEquipmentSelector}
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            Agregar Equipo
          </Button>
        </Stack>

        {/* Info about hourly rate */}
        <Box p="2" bg="purple.50" borderRadius="md" borderWidth="1px" borderColor="purple.200">
          <Typography fontSize="xs" color="purple.700">
            ℹ️ El hourly rate incluye: electricidad del equipo, gas, depreciación y mantenimiento
          </Typography>
        </Box>

        {/* Equipment List */}
        {equipment.length === 0 ? (
          <Box p="4" bg="bg.subtle" borderRadius="md" textAlign="center">
            <Typography color="fg.muted" fontSize="sm">
              No hay equipamiento configurado
            </Typography>
          </Box>
        ) : (
          <Stack gap="2">
            {equipment.map((eq) => (
              <Box
                key={eq.id}
                p="3"
                bg="bg.subtle"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.default"
              >
                <Stack direction="row" align="center" justify="space-between">
                  <Stack gap="1">
                    <Typography fontSize="sm" fontWeight="600">
                      {eq.equipment_name}
                    </Typography>
                    <Typography fontSize="xs" color="fg.muted">
                      {eq.hours_used}h × ${eq.hourly_cost_rate.toFixed(2)}/h = $
                      {eq.total_cost.toFixed(2)}
                    </Typography>
                    {eq.notes && (
                      <Typography fontSize="xs" color="fg.muted" fontStyle="italic">
                        {eq.notes}
                      </Typography>
                    )}
                  </Stack>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleRemove(eq.id)}
                  >
                    <TrashIcon style={{ width: 14, height: 14 }} />
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
});
