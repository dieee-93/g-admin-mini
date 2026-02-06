/**
 * EquipmentSelector Component
 *
 * Modal selector for production equipment with hours input
 * Pattern: Adapted from MaterialSelector
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  Button,
  Stack,
  InputField,
  Typography,
  Box,
  Input,
  Badge,
  Spinner,
} from '@/shared/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAvailableEquipment } from '@/modules/production-equipment/hooks';
import type { ProductionEquipment } from '@/modules/production-equipment/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export interface ProductionEquipmentUsage {
  id: string
  equipment_id: string
  equipment_name: string
  equipment_type: string
  hours_used: number
  hourly_cost_rate: number
  total_cost: number
  notes?: string
  recorded_at?: string
}

export interface EquipmentSelectorProps {
  onSelect: (equipmentUsage: ProductionEquipmentUsage) => void;
  onClose: () => void;
  selectedEquipmentIds?: string[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EquipmentSelector({
  onSelect,
  onClose,
  selectedEquipmentIds = [],
}: EquipmentSelectorProps) {
  const { data: equipment, isLoading } = useAvailableEquipment();

  const [query, setQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<ProductionEquipment | null>(null);
  const [hoursUsed, setHoursUsed] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Filter equipment by search query
  const filteredEquipment = useMemo(() => {
    if (!equipment) return [];

    const searchQuery = query.toLowerCase().trim();

    return equipment
      .filter(eq => {
        // Exclude already selected
        if (selectedEquipmentIds.includes(eq.id)) return false;

        // Filter by search
        if (searchQuery) {
          return (
            eq.name.toLowerCase().includes(searchQuery) ||
            eq.code.toLowerCase().includes(searchQuery) ||
            eq.equipment_type.toLowerCase().includes(searchQuery)
          );
        }

        return true;
      })
      .slice(0, 10);
  }, [equipment, query, selectedEquipmentIds]);

  // Calculate cost preview
  const calculatedCost = useMemo(() => {
    if (!selectedEquipment || hoursUsed <= 0) return 0;
    return (selectedEquipment.hourly_cost_rate || 0) * hoursUsed;
  }, [selectedEquipment, hoursUsed]);

  const handleEquipmentClick = useCallback((eq: ProductionEquipment) => {
    setSelectedEquipment(eq);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedEquipment || hoursUsed <= 0) return;

    const equipmentUsage: ProductionEquipmentUsage = {
      id: uuidv4(),
      equipment_id: selectedEquipment.id,
      equipment_name: selectedEquipment.name,
      equipment_type: selectedEquipment.equipment_type,
      hours_used: hoursUsed,
      hourly_cost_rate: selectedEquipment.hourly_cost_rate || 0,
      total_cost: calculatedCost,
      notes,
      recorded_at: new Date().toISOString(),
    };

    onSelect(equipmentUsage);
  }, [selectedEquipment, hoursUsed, calculatedCost, notes, onSelect]);

  const canSubmit = selectedEquipment && hoursUsed > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Agregar Equipamiento</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Stack gap="5">
            {/* Search Equipment */}
            <Stack gap="3">
              <Typography fontSize="sm" fontWeight="600">
                1. Seleccionar Equipamiento
              </Typography>

              <Box position="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, código o tipo..."
                  size="sm"
                  pr="10"
                />
                <Box
                  position="absolute"
                  right="3"
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                >
                  <MagnifyingGlassIcon style={{ width: 16, height: 16, opacity: 0.5 }} />
                </Box>
              </Box>

              {/* Equipment List */}
              <Box
                maxH="250px"
                overflowY="auto"
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="md"
              >
                {isLoading ? (
                  <Stack align="center" justify="center" p="6">
                    <Spinner size="md" />
                  </Stack>
                ) : filteredEquipment.length === 0 ? (
                  <Box p="4" textAlign="center">
                    <Typography color="fg.muted" fontSize="sm">
                      {query ? 'No se encontró equipamiento' : 'No hay equipamiento disponible'}
                    </Typography>
                  </Box>
                ) : (
                  <Stack gap="0">
                    {filteredEquipment.map((eq) => (
                      <Box
                        key={eq.id}
                        p="3"
                        borderBottomWidth="1px"
                        borderBottomColor="border.subtle"
                        cursor="pointer"
                        bg={selectedEquipment?.id === eq.id ? 'colorPalette.subtle' : 'transparent'}
                        _hover={{ bg: 'bg.muted' }}
                        onClick={() => handleEquipmentClick(eq)}
                        colorPalette={selectedEquipment?.id === eq.id ? 'purple' : undefined}
                      >
                        <Stack gap="1">
                          <Stack direction="row" align="center" justify="space-between">
                            <Typography fontSize="sm" fontWeight="600">
                              {eq.name}
                            </Typography>
                            <Badge colorPalette="purple" variant="subtle" size="sm">
                              {eq.equipment_type}
                            </Badge>
                          </Stack>
                          <Stack direction="row" align="center" justify="space-between">
                            <Typography fontSize="xs" color="fg.muted">
                              {eq.code}
                            </Typography>
                            <Typography fontSize="xs" fontWeight="600" color="purple.500">
                              ${(eq.hourly_cost_rate || 0).toFixed(2)}/h
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>

            {/* Hours Input */}
            {selectedEquipment && (
              <Stack gap="3">
                <Typography fontSize="sm" fontWeight="600">
                  2. Horas de Uso
                </Typography>

                <InputField
                  label="Horas requeridas"
                  type="number"
                  step="0.01"
                  min="0"
                  value={hoursUsed || ''}
                  onChange={(e) => setHoursUsed(parseFloat(e.target.value) || 0)}
                  helperText="Tiempo estimado de uso del equipamiento"
                />

                <InputField
                  label="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Horneado a 250°C"
                />

                {/* Cost Preview */}
                {hoursUsed > 0 && (
                  <Box
                    p="4"
                    bg="colorPalette.subtle"
                    colorPalette="purple"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="colorPalette.emphasized"
                  >
                    <Stack gap="2">
                      <Typography fontSize="xs" fontWeight="700" textTransform="uppercase" color="colorPalette.fg">
                        Costo Calculado
                      </Typography>

                      <Stack direction="row" justify="space-between" align="center">
                        <Typography fontSize="sm">
                          {hoursUsed}h × ${(selectedEquipment.hourly_cost_rate || 0).toFixed(2)}/h
                        </Typography>
                        <Typography fontSize="lg" fontWeight="800" color="colorPalette.fg">
                          ${calculatedCost.toFixed(2)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorPalette="purple"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Agregar Equipamiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EquipmentSelector;
