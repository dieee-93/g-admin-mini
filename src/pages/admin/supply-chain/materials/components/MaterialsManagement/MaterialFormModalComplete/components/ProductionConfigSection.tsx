/**
 * ProductionConfigSection Component
 *
 * Configuración de producción: equipment, labor, overhead
 * Se usa SOLO en materiales/productos ELABORADOS
 */

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  InputField,
  Badge,
} from '@/shared/ui';
import { PlusIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import type { ProductionEquipmentUsage } from '@/shared/components/EquipmentSelector';
import { TeamSelector } from '@/shared/components/TeamSelector';
import type { TeamAssignment } from '@/shared/components/TeamSelector';
import { calculateLaborCost } from '@/modules/recipe/utils/costCalculations';
import type { ProductionConfig } from '../../../../types/materialTypes';

// ============================================================================
// TYPES
// ============================================================================

interface ProductionConfigSectionProps {
  productionConfig?: ProductionConfig;
  onChange: (configOrUpdater: ProductionConfig | ((prev?: ProductionConfig) => ProductionConfig)) => void;
  recipeId?: string;
  onRequestEquipmentSelector?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProductionConfigSection({
  productionConfig,
  onChange,
  recipeId,
  onRequestEquipmentSelector,
}: ProductionConfigSectionProps) {

  // Equipment usage list
  const equipmentUsage = useMemo(
    () => productionConfig?.equipment_usage || [],
    [productionConfig]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const equipmentCost = equipmentUsage.reduce((sum, eq) => sum + eq.total_cost, 0);

    // Use sophisticated labor calculation with loaded_factor
    const laborCost = calculateLaborCost(productionConfig?.staff_assignments || []);

    return {
      equipment: equipmentCost,
      labor: laborCost,
      direct: equipmentCost + laborCost,
    };
  }, [equipmentUsage, productionConfig?.staff_assignments]);

  // Handlers - Using functional updates to avoid stale closures
  const handleAddEquipment = useCallback(
    (equipment: ProductionEquipmentUsage) => {
      onChange(prev => {
        const prevUsage = prev?.equipment_usage || [];
        const updatedUsage = [...prevUsage, equipment];
        return {
          ...prev,
          equipment_usage: updatedUsage,
          equipment_cost: updatedUsage.reduce((sum, eq) => sum + eq.total_cost, 0),
        };
      });
    },
    [onChange]
  );

  const handleRemoveEquipment = useCallback(
    (id: string) => {
      onChange(prev => {
        const prevUsage = prev?.equipment_usage || [];
        const updatedUsage = prevUsage.filter((eq) => eq.id !== id);
        return {
          ...prev,
          equipment_usage: updatedUsage,
          equipment_cost: updatedUsage.reduce((sum, eq) => sum + eq.total_cost, 0),
        };
      });
    },
    [onChange]
  );


  const handleOverheadChange = useCallback(
    (field: 'overhead_percentage' | 'overhead_fixed', value: number) => {
      onChange(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [onChange]
  );

  const handlePackagingChange = useCallback(
    (value: number) => {
      onChange(prev => ({
        ...prev,
        packaging_cost: value,
      }));
    },
    [onChange]
  );

  return (
    <Stack gap="6" w="full">
      {/* Header */}
      <Stack direction="row" align="center" justify="space-between">
        <Typography
          fontSize="xs"
          fontWeight="800"
          color="fg.muted"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Configuración de Producción
        </Typography>

        <Badge colorPalette="purple" variant="solid" fontSize="2xs">
          COSTOS INDIRECTOS
        </Badge>
      </Stack>

      {/* Equipment Section */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
        borderLeftWidth="4px"
        borderLeftColor="colorPalette.solid"
        colorPalette="purple"
      >
        <Stack gap="4">
          <Stack direction="row" align="center" justify="space-between">
            <Typography fontSize="sm" fontWeight="700" color="fg.default">
              Equipamiento Requerido
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

          {/* Equipment List */}
          {equipmentUsage.length === 0 ? (
            <Box p="4" bg="bg.subtle" borderRadius="md" textAlign="center">
              <Typography color="fg.muted" fontSize="sm">
                No hay equipamiento configurado
              </Typography>
            </Box>
          ) : (
            <Stack gap="2">
              {equipmentUsage.map((eq) => (
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
                      onClick={() => handleRemoveEquipment(eq.id)}
                    >
                      <TrashIcon style={{ width: 14, height: 14 }} />
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {/* Equipment Total */}
          {totals.equipment > 0 && (
            <Box p="3" bg="colorPalette.subtle" colorPalette="purple" borderRadius="md">
              <Stack direction="row" align="center" justify="space-between">
                <Typography fontSize="sm" fontWeight="700">
                  Total Equipamiento
                </Typography>
                <Typography fontSize="sm" fontWeight="700" color="colorPalette.fg">
                  ${totals.equipment.toFixed(2)}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Labor Section */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
        borderLeftWidth="4px"
        borderLeftColor="colorPalette.solid"
        colorPalette="blue"
      >
        <Stack gap="4">
          <Typography fontSize="sm" fontWeight="700" color="fg.default">
            Personal Asignado
          </Typography>

          <TeamSelector
            value={productionConfig?.staff_assignments || []}
            onChange={(assignments) => {
              const totalCost = calculateLaborCost(assignments);
              onChange(prev => ({
                ...prev,
                staff_assignments: assignments,
                labor_total_cost: totalCost,
              }));
            }}
            variant="compact"
            showCost={true}
            showEmployeeSelector={true}
            showDuration={true}
            showCount={true}
            defaultDuration={60}
          />

          {totals.labor > 0 && (
            <Box p="3" bg="colorPalette.subtle" colorPalette="blue" borderRadius="md">
              <Stack direction="row" align="center" justify="space-between">
                <Typography fontSize="sm" fontWeight="700">
                  Total Mano de Obra
                </Typography>
                <Typography fontSize="sm" fontWeight="700" color="colorPalette.fg">
                  ${totals.labor.toFixed(2)}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Overhead Section */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack gap="4">
          <Typography fontSize="sm" fontWeight="700" color="fg.default">
            Costos Indirectos (Overhead)
          </Typography>

          <Stack direction="row" gap="4">
            <InputField
              label="Overhead (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={productionConfig?.overhead_percentage || ''}
              onChange={(e) =>
                handleOverheadChange('overhead_percentage', parseFloat(e.target.value) || 0)
              }
              helperText="% sobre costo de materiales"
            />

            <InputField
              label="Overhead fijo ($)"
              type="number"
              step="0.01"
              min="0"
              value={productionConfig?.overhead_fixed || ''}
              onChange={(e) =>
                handleOverheadChange('overhead_fixed', parseFloat(e.target.value) || 0)
              }
              helperText="Monto fijo adicional"
            />
          </Stack>
        </Stack>
      </Box>

      {/* Packaging Section */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack gap="4">
          <Typography fontSize="sm" fontWeight="700" color="fg.default">
            Empaquetado
          </Typography>

          <InputField
            label="Costo de empaquetado ($)"
            type="number"
            step="0.01"
            min="0"
            value={productionConfig?.packaging_cost || ''}
            onChange={(e) => handlePackagingChange(parseFloat(e.target.value) || 0)}
          />
        </Stack>
      </Box>

      {/* Cost Summary */}
      {totals.direct > 0 && (
        <Box
          p="5"
          bg="colorPalette.subtle"
          colorPalette="green"
          borderWidth="2px"
          borderColor="colorPalette.emphasized"
          borderRadius="xl"
          boxShadow="lg"
        >
          <Stack gap="3">
            <Stack direction="row" align="center" gap="2">
              <CalculatorIcon style={{ width: 20, height: 20 }} />
              <Typography fontSize="sm" fontWeight="800" textTransform="uppercase">
                Resumen de Costos Directos
              </Typography>
            </Stack>

            <Stack gap="2">
              <Stack direction="row" justify="space-between">
                <Typography fontSize="sm">Equipamiento</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  ${totals.equipment.toFixed(2)}
                </Typography>
              </Stack>

              <Stack direction="row" justify="space-between">
                <Typography fontSize="sm">Mano de Obra</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  ${totals.labor.toFixed(2)}
                </Typography>
              </Stack>

              <Box h="1px" bg="border.emphasized" />

              <Stack direction="row" justify="space-between">
                <Typography fontSize="md" fontWeight="700">
                  Total
                </Typography>
                <Typography fontSize="md" fontWeight="800" color="colorPalette.fg">
                  ${totals.direct.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export default ProductionConfigSection;
