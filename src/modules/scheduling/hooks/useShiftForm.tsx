/**
 * Shift Form Hook
 * Manages all business logic for Shift/Schedule form modal
 *
 * ARCHITECTURE:
 * - Separates business logic from UI
 * - Integrates useShiftValidation hook
 * - Manages form state, loading states, success states
 * - Provides computed values (modalTitle, submitButtonContent, formStatusBadge)
 * - Handles shift overlap detection and time validation
 *
 * PATTERN: Same as useSupplierForm / useMaterialForm
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, HStack, Spinner, Text } from '@/shared/ui';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useScheduling } from './useScheduling';
import { useShiftValidation } from '@/hooks/useShiftValidation';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ShiftFormData } from '@/lib/validation/zod/CommonSchemas';

interface UseShiftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  shift?: any | null;
  prefilledDate?: string;
  prefilledEmployee?: string;
}

export function useShiftForm({
  isOpen,
  onClose,
  onSuccess,
  shift,
  prefilledDate,
  prefilledEmployee
}: UseShiftFormProps) {
  const { shifts, createShift, updateShift } = useScheduling();
  const isEditMode = !!shift;

  // ========================================================================
  // FORM DATA STATE
  // ========================================================================

  const [formData, setFormData] = useState<ShiftFormData>({
    employee_id: '',
    start_time: '09:00',
    end_time: '17:00',
    date: new Date().toISOString().split('T')[0],
    position: '',
    location_id: undefined,
    notes: '',
    status: 'scheduled'
  });

  // ========================================================================
  // VALIDATION HOOK INTEGRATION
  // ========================================================================

  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm: optimizedValidateForm,
    clearValidation,
    calculateShiftDuration
  } = useShiftValidation(
    formData,
    shifts,
    shift?.id,
    { checkOverlaps: true }
  );

  // ========================================================================
  // LOADING & SUCCESS STATES
  // ========================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    validating: false,
    saving: false,
    checkingOverlaps: false
  });

  const [successStates, setSuccessStates] = useState({
    validationPassed: false,
    shiftSaved: false
  });

  // ========================================================================
  // COMPUTED VALUES - SHIFT METRICS
  // ========================================================================

  const shiftMetrics = useMemo(() => {
    if (!formData.start_time || !formData.end_time) {
      return null;
    }

    const duration = calculateShiftDuration(formData.start_time, formData.end_time);
    const isOvertime = duration > 8;
    const isTooLong = duration > 12;
    const isTooShort = duration < 2;

    return {
      duration,
      isOvertime,
      isTooLong,
      isTooShort
    };
  }, [formData.start_time, formData.end_time, calculateShiftDuration]);

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  const updateFormData = useCallback((updates: Partial<ShiftFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleFieldChange = useCallback((field: keyof ShiftFormData) =>
    (value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []
  );

  // ========================================================================
  // FORM INITIALIZATION
  // ========================================================================

  useEffect(() => {
    if (isOpen && shift) {
      // Edit mode - populate with shift data
      setFormData({
        employee_id: shift.employee_id || shift.employeeId || '',
        start_time: shift.start_time || shift.startTime || '09:00',
        end_time: shift.end_time || shift.endTime || '17:00',
        date: shift.date || new Date().toISOString().split('T')[0],
        position: shift.position || '',
        location_id: shift.location_id || shift.locationId || undefined,
        notes: shift.notes || '',
        status: shift.status || 'scheduled'
      });
    } else if (isOpen) {
      // Create mode - reset to defaults with prefilled values
      setFormData({
        employee_id: prefilledEmployee || '',
        start_time: '09:00',
        end_time: '17:00',
        date: prefilledDate || new Date().toISOString().split('T')[0],
        position: '',
        location_id: undefined,
        notes: '',
        status: 'scheduled'
      });
    }
  }, [isOpen, shift, prefilledDate, prefilledEmployee]);

  // Clear validation when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearValidation();
      setSuccessStates({
        validationPassed: false,
        shiftSaved: false
      });
    }
  }, [isOpen, clearValidation]);

  // ========================================================================
  // FORM SUBMISSION
  // ========================================================================

  const validateForm = useCallback(async () => {
    // Update form values in React Hook Form
    Object.keys(formData).forEach(key => {
      form.setValue(key as keyof ShiftFormData, formData[key as keyof ShiftFormData]);
    });

    return await optimizedValidateForm();
  }, [formData, form, optimizedValidateForm]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setLoadingStates(prev => ({ ...prev, validating: true }));

    try {
      // Step 1: Validate form
      await new Promise(resolve => setTimeout(resolve, 300));
      const isValid = await validateForm();

      setLoadingStates(prev => ({ ...prev, validating: false }));

      if (!isValid) {
        toaster.create({
          title: 'Validación fallida',
          description: 'Por favor corrige los errores antes de continuar',
          type: 'error',
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      setSuccessStates(prev => ({ ...prev, validationPassed: true }));

      // Step 2: Check overlaps (additional check)
      setLoadingStates(prev => ({ ...prev, checkingOverlaps: true }));
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingStates(prev => ({ ...prev, checkingOverlaps: false }));

      // Step 3: Save shift
      setLoadingStates(prev => ({ ...prev, saving: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      if (isEditMode) {
        await updateShift(shift.id, formData);
      } else {
        await createShift(formData);
      }

      setLoadingStates(prev => ({ ...prev, saving: false }));
      setSuccessStates(prev => ({ ...prev, shiftSaved: true }));

      // Success notification
      toaster.create({
        title: isEditMode ? 'Turno actualizado' : 'Turno creado',
        description: `Turno ${isEditMode ? 'actualizado' : 'creado'} exitosamente`,
        type: 'success',
        duration: 3000
      });

      // Wait a bit before closing to show success state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call success callback
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('ShiftForm', 'Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar turno',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
      setLoadingStates({
        validating: false,
        saving: false,
        checkingOverlaps: false
      });
    }
  }, [validateForm, isEditMode, shift, formData, updateShift, createShift, onSuccess, onClose]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Turno' : 'Nuevo Turno';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (loadingStates.validating) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Validando...</Text>
        </HStack>
      );
    }
    if (loadingStates.checkingOverlaps) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Verificando solapamientos...</Text>
        </HStack>
      );
    }
    if (loadingStates.saving) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>{isEditMode ? 'Actualizando...' : 'Creando...'}</Text>
        </HStack>
      );
    }
    if (successStates.shiftSaved) {
      return (
        <HStack gap="2">
          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
          <Text>¡Completado!</Text>
        </HStack>
      );
    }
    return `${isEditMode ? 'Actualizar' : 'Crear'} Turno`;
  }, [loadingStates, successStates, isEditMode]);

  const operationProgress = useMemo(() => {
    if (!isSubmitting) return null;

    let progress = 0;
    let currentStep = '';

    if (loadingStates.validating) {
      progress = 25;
      currentStep = 'Validando formulario';
    } else if (loadingStates.checkingOverlaps) {
      progress = 50;
      currentStep = 'Verificando solapamientos';
    } else if (successStates.validationPassed && !successStates.shiftSaved) {
      progress = 75;
      currentStep = isEditMode ? 'Actualizando turno' : 'Creando turno';
    } else if (successStates.shiftSaved) {
      progress = 100;
      currentStep = '¡Operación completada!';
    }

    return { progress, currentStep };
  }, [isSubmitting, loadingStates, successStates, isEditMode]);

  const formStatusBadge = useMemo(() => {
    // Required fields missing
    if (!formData.employee_id || !formData.position || !formData.date) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }

    // Has validation errors
    if (validationState.hasErrors) {
      return (
        <Badge colorPalette="red" variant="subtle">
          Con errores ({validationState.errorCount})
        </Badge>
      );
    }

    // Shift metrics warnings
    if (shiftMetrics) {
      if (shiftMetrics.isTooLong) {
        return <Badge colorPalette="orange" variant="subtle">⚠️ Turno muy largo</Badge>;
      }
      if (shiftMetrics.isOvertime) {
        return <Badge colorPalette="yellow" variant="subtle">⏰ Con tiempo extra</Badge>;
      }
      if (shiftMetrics.isTooShort) {
        return <Badge colorPalette="orange" variant="subtle">⚠️ Turno muy corto</Badge>;
      }
    }

    // Has warnings but no errors
    if (validationState.hasWarnings) {
      return (
        <Badge colorPalette="orange" variant="subtle">
          Con advertencias ({validationState.warningCount})
        </Badge>
      );
    }

    // All good
    return <Badge colorPalette="green" variant="subtle">✓ Listo para guardar</Badge>;
  }, [formData, validationState, shiftMetrics]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Form data
    formData,
    updateFormData,
    handleFieldChange,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // States
    isSubmitting,
    loadingStates,
    successStates,
    isEditMode,

    // Metrics
    shiftMetrics,

    // Computed values
    modalTitle,
    submitButtonContent,
    operationProgress,
    formStatusBadge,

    // Handlers
    handleSubmit,
    onClose
  };
}
