/**
 * Rental Form Hook
 * Implements Material Form Pattern for rental management
 *
 * Architecture: Business logic separated from UI
 * - Manages form state and loading states
 * - Integrates with useRentalValidation
 * - Handles rental cost calculations
 * - Computes derived values (modalTitle, badges, progress)
 *
 * Pattern: Same as useAssetForm, useFiscalDocumentForm
 * Created: 2025-01-31
 */

import { useState, useMemo, useCallback } from 'react';
import { useRentalValidation } from '@/hooks/useRentalValidation';
import { notify } from '@/lib/notifications';
import type { RentalFormData } from '@/lib/validation/zod/CommonSchemas';

interface Rental {
  id?: string;
  customer_id: string;
  item_name: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  deposit_amount?: number;
  status: 'reserved' | 'active' | 'completed' | 'cancelled';
  notes: string;
}

interface UseRentalFormProps {
  rental?: Rental | null;
  onSubmit: (data: RentalFormData) => Promise<void>;
  onSuccess?: () => void;
}

interface RentalMetrics {
  totalDays: number;
  totalCost: number;
  depositPercentage: number;
  costPerDay: number;
  isLongTerm: boolean;
  remainingDays: number;
}

export function useRentalForm({
  rental,
  onSubmit,
  onSuccess
}: UseRentalFormProps) {

  const isEditMode = !!rental;

  // Loading states
  const [isValidating, setIsValidating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Success states
  const [validationPassed, setValidationPassed] = useState(false);
  const [calculationsComplete, setCalculationsComplete] = useState(false);
  const [rentalSaved, setRentalSaved] = useState(false);

  // Initialize validation hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    calculateTotalCost
  } = useRentalValidation({
    customer_id: rental?.customer_id || '',
    item_name: rental?.item_name || '',
    start_date: rental?.start_date || new Date().toISOString().split('T')[0],
    end_date: rental?.end_date || '',
    daily_rate: rental?.daily_rate || 0,
    deposit_amount: rental?.deposit_amount,
    status: rental?.status || 'reserved',
    notes: rental?.notes || ''
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Calculate rental metrics in real-time
  const rentalMetrics = useMemo((): RentalMetrics => {
    const startDate = watchedValues.start_date ? new Date(watchedValues.start_date) : new Date();
    const endDate = watchedValues.end_date ? new Date(watchedValues.end_date) : new Date();
    const dailyRate = watchedValues.daily_rate || 0;
    const depositAmount = watchedValues.deposit_amount || 0;

    // Calculate total days
    const totalDays = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate total cost
    const totalCost = totalDays * dailyRate;

    // Calculate deposit percentage
    const depositPercentage = totalCost > 0 ? (depositAmount / totalCost) * 100 : 0;

    // Calculate remaining days from today
    const today = new Date();
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Check if long-term rental (> 30 days)
    const isLongTerm = totalDays > 30;

    return {
      totalDays,
      totalCost: Number(totalCost.toFixed(2)),
      depositPercentage: Number(depositPercentage.toFixed(2)),
      costPerDay: dailyRate,
      isLongTerm,
      remainingDays
    };
  }, [watchedValues]);

  // Auto-calculate total cost when dates or daily rate change
  const handleCalculateTotalCost = useCallback(() => {
    setIsCalculating(true);

    try {
      const { totalCost, totalDays } = rentalMetrics;

      setCalculationsComplete(true);

      notify.success({
        title: 'Costo calculado',
        description: `${totalDays} día(s) × $${rentalMetrics.costPerDay} = $${totalCost}`
      });
    } catch (error) {
      notify.error({
        title: 'Error en cálculo',
        description: 'No se pudo calcular el costo total'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [rentalMetrics]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: keyof RentalFormData, value: any) => {
    setValue(field, value);

    // Auto-recalculate if dates or rate changes
    if (field === 'start_date' || field === 'end_date' || field === 'daily_rate') {
      setTimeout(() => handleCalculateTotalCost(), 100);
    }
  }, [setValue, handleCalculateTotalCost]);

  // Handle form submission
  const handleSubmit = useCallback(async (formData: RentalFormData) => {
    try {
      // Stage 1: Validate
      setIsValidating(true);
      setValidationPassed(false);
      setCalculationsComplete(false);
      setRentalSaved(false);

      const isValid = await validateForm();

      if (!isValid) {
        notify.error({
          title: 'Validación fallida',
          description: 'Por favor corrige los errores antes de continuar'
        });
        setIsValidating(false);
        return;
      }

      // Additional validation: end date must be after start date
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        notify.error({
          title: 'Fechas inválidas',
          description: 'La fecha de finalización debe ser posterior a la de inicio'
        });
        setIsValidating(false);
        return;
      }

      setValidationPassed(true);
      setIsValidating(false);

      // Stage 2: Calculate costs
      setIsCalculating(true);

      const totalCost = calculateTotalCost(formData.start_date, formData.end_date, formData.daily_rate);

      // Warn if deposit is too low
      if (formData.deposit_amount && formData.deposit_amount < totalCost * 0.2) {
        notify.warning({
          title: 'Depósito bajo',
          description: `Se recomienda un depósito de al menos el 20% ($${(totalCost * 0.2).toFixed(2)})`
        });
      }

      setCalculationsComplete(true);
      setIsCalculating(false);

      // Stage 3: Save
      setIsSaving(true);

      // Process data (trim strings, ensure numbers)
      const processedData: RentalFormData = {
        ...formData,
        customer_id: formData.customer_id.trim(),
        item_name: formData.item_name.trim(),
        notes: formData.notes.trim(),
        daily_rate: Number(formData.daily_rate),
        deposit_amount: formData.deposit_amount ? Number(formData.deposit_amount) : undefined
      };

      await onSubmit(processedData);

      setRentalSaved(true);
      setIsSaving(false);

      notify.success({
        title: isEditMode ? 'Renta actualizada' : 'Renta creada',
        description: `${formData.item_name} - $${totalCost.toFixed(2)}`
      });

      onSuccess?.();

    } catch (error) {
      setIsSaving(false);
      notify.error({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      });
    }
  }, [isEditMode, validateForm, calculateTotalCost, onSubmit, onSuccess]);

  // Computed values for UI
  const modalTitle = useMemo(() => {
    if (isEditMode) {
      return `Editar Renta: ${rental?.item_name || ''}`;
    }
    return 'Nueva Renta';
  }, [isEditMode, rental]);

  const submitButtonContent = useMemo(() => {
    if (isSaving) return 'Guardando renta...';
    if (isCalculating) return 'Calculando costos...';
    if (isValidating) return 'Validando...';
    return isEditMode ? 'Actualizar Renta' : 'Crear Renta';
  }, [isValidating, isCalculating, isSaving, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) {
      return {
        text: `${validationState.errorCount} error(es)`,
        color: 'error' as const
      };
    }

    if (validationState.hasWarnings) {
      return {
        text: `${validationState.warningCount} advertencia(s)`,
        color: 'warning' as const
      };
    }

    if (watchedValues.status === 'cancelled') {
      return {
        text: 'Renta cancelada',
        color: 'error' as const
      };
    }

    if (watchedValues.status === 'completed') {
      return {
        text: 'Renta completada',
        color: 'success' as const
      };
    }

    if (rentalMetrics.isLongTerm) {
      return {
        text: 'Renta de largo plazo',
        color: 'info' as const
      };
    }

    return {
      text: 'Listo',
      color: 'success' as const
    };
  }, [validationState, watchedValues.status, rentalMetrics]);

  const operationProgress = useMemo(() => {
    if (rentalSaved) return 100;
    if (isSaving) return 80;
    if (calculationsComplete) return 60;
    if (validationPassed) return 40;
    if (isCalculating) return 30;
    if (isValidating) return 20;
    return 0;
  }, [isValidating, isCalculating, validationPassed, calculationsComplete, isSaving, rentalSaved]);

  const rentalStatusBadge = useMemo(() => {
    const status = watchedValues.status;

    if (status === 'reserved') return { text: 'Reservada', color: 'info' as const };
    if (status === 'active') return { text: 'Activa', color: 'success' as const };
    if (status === 'completed') return { text: 'Completada', color: 'gray' as const };
    if (status === 'cancelled') return { text: 'Cancelada', color: 'error' as const };
    return { text: 'Desconocido', color: 'gray' as const };
  }, [watchedValues.status]);

  return {
    // Form control
    form,
    isEditMode,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // Loading states
    isValidating,
    isCalculating,
    isSaving,
    isSubmitting: isValidating || isCalculating || isSaving,

    // Success states
    validationPassed,
    calculationsComplete,
    rentalSaved,

    // Rental metrics
    rentalMetrics,

    // Computed UI values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    rentalStatusBadge,

    // Handlers
    handleFieldChange,
    handleSubmit,
    handleCalculateTotalCost,

    // Helpers
    calculateTotalCost
  };
}

export default useRentalForm;
