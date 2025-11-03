/**
 * Shift Form - Create/Edit shift
 * ARCHITECTURE: Material Form Pattern
 * - Business logic in useShiftForm hook
 * - UI component is presentational only
 * - Integrates useShiftValidation for validation
 * - Shows validation summary, field errors/warnings
 * - Progress indicator during submission
 */

import React from 'react';
import {
  Stack,
  FormSection,
  Box,
  InputField,
  TextareaField,
  Alert,
  Flex,
  Text,
  Progress,
  Select
} from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useShiftForm } from '../hooks/useShiftForm';
import type { Shift } from '../types/schedulingTypes';

interface ShiftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  shift?: Shift | null;
  prefilledDate?: string;
  prefilledEmployee?: string;
}

export function ShiftForm({
  isOpen,
  onClose,
  onSuccess,
  shift,
  prefilledDate,
  prefilledEmployee
}: ShiftFormProps) {
  const {
    formData,
    handleFieldChange,
    fieldErrors,
    fieldWarnings,
    validationState,
    shiftMetrics,
    formStatusBadge,
    operationProgress
  } = useShiftForm({
    isOpen,
    onClose,
    onSuccess,
    shift,
    prefilledDate,
    prefilledEmployee
  });

  return (
    <Stack gap={{ base: '4', md: '6' }} w="full">
      {/* Validation Summary */}
      {validationState.hasErrors && (
        <Alert.Root status="error" variant="subtle">
          <Alert.Indicator>
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
          </Alert.Indicator>
          <Alert.Title>Errores de validación</Alert.Title>
          <Alert.Description>
            Por favor corrige {validationState.errorCount} error(es) antes de continuar
          </Alert.Description>
        </Alert.Root>
      )}

      {validationState.hasWarnings && !validationState.hasErrors && (
        <Alert.Root status="warning" variant="subtle">
          <Alert.Indicator>
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
          </Alert.Indicator>
          <Alert.Title>Advertencias</Alert.Title>
          <Alert.Description>
            Hay {validationState.warningCount} advertencia(s). Puedes continuar pero revisa los campos marcados.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Form Status Badge */}
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          Información del Turno
        </Text>
        {formStatusBadge}
      </Flex>

      {/* Shift Metrics */}
      {shiftMetrics && (
        <Box
          p="4"
          bg="blue.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Flex gap="4" wrap="wrap">
            <Box>
              <Text fontSize="sm" color="text.muted">Duración</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {shiftMetrics.duration}h
              </Text>
            </Box>
            {shiftMetrics.isOvertime && (
              <Box>
                <Text fontSize="sm" color="orange.600">⏰ Tiempo extra</Text>
                <Text fontSize="sm" color="orange.700">
                  {(shiftMetrics.duration - 8).toFixed(1)}h adicionales
                </Text>
              </Box>
            )}
          </Flex>
        </Box>
      )}

      {/* Employee & Date */}
      <FormSection title="Información Básica">
        <Box>
          <InputField
            label="ID del Empleado *"
            value={formData.employee_id}
            onChange={(e) => handleFieldChange('employee_id')(e.target.value)}
            placeholder="Selecciona un empleado"
            style={{
              borderColor: fieldErrors.employee_id ? 'var(--colors-error)' :
                           fieldWarnings.employee_id ? 'var(--colors-warning)' :
                           undefined
            }}
          />
          {fieldErrors.employee_id && (
            <Text color="error" fontSize="sm" mt="1">
              ❌ {fieldErrors.employee_id}
            </Text>
          )}
        </Box>

        <Box>
          <InputField
            label="Fecha *"
            type="date"
            value={formData.date}
            onChange={(e) => handleFieldChange('date')(e.target.value)}
            style={{
              borderColor: fieldErrors.date ? 'var(--colors-error)' : undefined
            }}
          />
          {fieldErrors.date && (
            <Text color="error" fontSize="sm" mt="1">
              ❌ {fieldErrors.date}
            </Text>
          )}
        </Box>

        <Box>
          <InputField
            label="Posición *"
            value={formData.position}
            onChange={(e) => handleFieldChange('position')(e.target.value)}
            placeholder="Ej: Mesero, Cocinero, Cajero"
            style={{
              borderColor: fieldErrors.position ? 'var(--colors-error)' : undefined
            }}
          />
          {fieldErrors.position && (
            <Text color="error" fontSize="sm" mt="1">
              ❌ {fieldErrors.position}
            </Text>
          )}
        </Box>
      </FormSection>

      {/* Time */}
      <FormSection title="Horario">
        <Box>
          <InputField
            label="Hora de Inicio *"
            type="time"
            value={formData.start_time}
            onChange={(e) => handleFieldChange('start_time')(e.target.value)}
            style={{
              borderColor: fieldErrors.start_time ? 'var(--colors-error)' :
                           fieldWarnings.start_time ? 'var(--colors-warning)' :
                           undefined
            }}
          />
          {fieldErrors.start_time && (
            <Text color="error" fontSize="sm" mt="1">
              ❌ {fieldErrors.start_time}
            </Text>
          )}
          {!fieldErrors.start_time && fieldWarnings.start_time && (
            <Text color="warning" fontSize="sm" mt="1">
              ⚠️ {fieldWarnings.start_time}
            </Text>
          )}
        </Box>

        <Box>
          <InputField
            label="Hora de Fin *"
            type="time"
            value={formData.end_time}
            onChange={(e) => handleFieldChange('end_time')(e.target.value)}
            style={{
              borderColor: fieldErrors.end_time ? 'var(--colors-error)' :
                           fieldWarnings.end_time ? 'var(--colors-warning)' :
                           undefined
            }}
          />
          {fieldErrors.end_time && (
            <Text color="error" fontSize="sm" mt="1">
              ❌ {fieldErrors.end_time}
            </Text>
          )}
          {!fieldErrors.end_time && fieldWarnings.end_time && (
            <Text color="warning" fontSize="sm" mt="1">
              ⚠️ {fieldWarnings.end_time}
            </Text>
          )}
        </Box>
      </FormSection>

      {/* Status & Location */}
      <FormSection title="Detalles Adicionales">
        <Box>
          <label>
            <Text fontSize="sm" fontWeight="medium" mb="1">Estado</Text>
            <Select.Root
              value={formData.status || 'scheduled'}
              onValueChange={(details) => {
                const selectedValue = details.value?.[0] || details.value;
                handleFieldChange('status')(selectedValue as string);
              }}
              size="sm"
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Selecciona estado" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item item="scheduled">
                  <Select.ItemText>Programado</Select.ItemText>
                </Select.Item>
                <Select.Item item="confirmed">
                  <Select.ItemText>Confirmado</Select.ItemText>
                </Select.Item>
                <Select.Item item="missed">
                  <Select.ItemText>Perdido</Select.ItemText>
                </Select.Item>
                <Select.Item item="covered">
                  <Select.ItemText>Cubierto</Select.ItemText>
                </Select.Item>
                <Select.Item item="cancelled">
                  <Select.ItemText>Cancelado</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </label>
          {fieldWarnings.status && (
            <Text color="warning" fontSize="sm" mt="1">
              ⚠️ {fieldWarnings.status}
            </Text>
          )}
        </Box>

        <Box>
          <InputField
            label="ID de Ubicación"
            value={formData.location_id || ''}
            onChange={(e) => handleFieldChange('location_id')(e.target.value || undefined)}
            placeholder="Opcional"
          />
        </Box>
      </FormSection>

      {/* Notes */}
      <FormSection title="Notas">
        <TextareaField
          label="Observaciones"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes')(e.target.value)}
          placeholder="Notas adicionales sobre el turno..."
          rows={3}
        />
      </FormSection>

      {/* Operation Progress */}
      {operationProgress && (
        <Box w="full" mt="4">
          <Stack gap="2">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="text.muted">
                {operationProgress.currentStep}
              </Text>
              <Text fontSize="sm" color="text.muted">
                {operationProgress.progress}%
              </Text>
            </Flex>
            <Progress.Root value={operationProgress.progress} size="sm" colorPalette="blue">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
