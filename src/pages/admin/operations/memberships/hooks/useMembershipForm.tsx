/**
 * Membership Form Hook
 * Implements Material Form Pattern for membership management
 *
 * Architecture: Business logic separated from UI
 * - Manages form state and loading states
 * - Integrates with useMembershipValidation
 * - Handles membership duration and cost calculations
 * - Computes derived values (modalTitle, badges, progress)
 *
 * Pattern: Same as useRentalForm, useAssetForm
 * Created: 2025-02-01
 */

import { useState, useMemo, useCallback } from 'react';
import { useMembershipValidation } from '@/hooks/useMembershipValidation';
import { notify } from '@/lib/notifications';
import type { MembershipFormData } from '@/lib/validation/zod/CommonSchemas';

interface Membership {
  id?: string;
  customer_id: string;
  membership_type: 'basic' | 'premium' | 'vip';
  start_date: string;
  end_date?: string;
  monthly_fee: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'debit';
  auto_renew: boolean;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  benefits?: string[];
}

interface UseMembershipFormProps {
  membership?: Membership | null;
  onSubmit: (data: MembershipFormData) => Promise<void>;
  onSuccess?: () => void;
}

interface MembershipMetrics {
  durationMonths: number;
  totalCost: number;
  costPerMonth: number;
  remainingMonths: number;
  isExpiringSoon: boolean;
  isLifetime: boolean;
}

export function useMembershipForm({
  membership,
  onSubmit,
  onSuccess
}: UseMembershipFormProps) {

  const isEditMode = !!membership;

  // Loading states
  const [isValidating, setIsValidating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Success states
  const [validationPassed, setValidationPassed] = useState(false);
  const [calculationsComplete, setCalculationsComplete] = useState(false);
  const [membershipSaved, setMembershipSaved] = useState(false);

  // Initialize validation hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useMembershipValidation({
    customer_id: membership?.customer_id || '',
    membership_type: membership?.membership_type || 'basic',
    start_date: membership?.start_date || new Date().toISOString().split('T')[0],
    end_date: membership?.end_date,
    monthly_fee: membership?.monthly_fee || 0,
    payment_method: membership?.payment_method || 'card',
    auto_renew: membership?.auto_renew ?? false,
    status: membership?.status || 'active',
    benefits: membership?.benefits
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Calculate membership metrics in real-time
  const membershipMetrics = useMemo((): MembershipMetrics => {
    const startDate = watchedValues.start_date ? new Date(watchedValues.start_date) : new Date();
    const endDate = watchedValues.end_date ? new Date(watchedValues.end_date) : null;
    const monthlyFee = watchedValues.monthly_fee || 0;

    // Calculate duration in months
    const durationMonths = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 0;

    // Calculate total cost
    const totalCost = durationMonths > 0 ? durationMonths * monthlyFee : 0;

    // Calculate remaining months from today
    const today = new Date();
    const remainingMonths = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 0;

    // Check if expiring soon (< 1 month)
    const isExpiringSoon = endDate ? remainingMonths > 0 && remainingMonths <= 1 : false;

    // Check if lifetime (no end date)
    const isLifetime = !endDate;

    return {
      durationMonths,
      totalCost: Number(totalCost.toFixed(2)),
      costPerMonth: monthlyFee,
      remainingMonths,
      isExpiringSoon,
      isLifetime
    };
  }, [watchedValues]);

  // Auto-calculate total cost when dates or monthly fee change
  const handleCalculateTotalCost = useCallback(() => {
    setIsCalculating(true);

    try {
      const { totalCost, durationMonths } = membershipMetrics;

      setCalculationsComplete(true);

      if (membershipMetrics.isLifetime) {
        notify.info({
          title: 'Membresía sin fin',
          description: 'Esta es una membresía de por vida (sin fecha de finalización)'
        });
      } else {
        notify.success({
          title: 'Costo calculado',
          description: `${durationMonths} mes(es) × $${membershipMetrics.costPerMonth} = $${totalCost}`
        });
      }
    } catch {
      notify.error({
        title: 'Error en cálculo',
        description: 'No se pudo calcular el costo total'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [membershipMetrics]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: keyof MembershipFormData, value: unknown) => {
    setValue(field, value);

    // Auto-recalculate if dates or fee changes
    if (field === 'start_date' || field === 'end_date' || field === 'monthly_fee') {
      setTimeout(() => handleCalculateTotalCost(), 100);
    }
  }, [setValue, handleCalculateTotalCost]);

  // Handle form submission
  const handleSubmit = useCallback(async (formData: MembershipFormData) => {
    try {
      // Stage 1: Validate
      setIsValidating(true);
      setValidationPassed(false);
      setCalculationsComplete(false);
      setMembershipSaved(false);

      const isValid = await validateForm();

      if (!isValid) {
        notify.error({
          title: 'Validación fallida',
          description: 'Por favor corrige los errores antes de continuar'
        });
        setIsValidating(false);
        return;
      }

      // Additional validation: end date must be after start date (if provided)
      if (formData.end_date) {
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
      }

      setValidationPassed(true);
      setIsValidating(false);

      // Stage 2: Calculate costs
      setIsCalculating(true);

      // Warn if expiring soon
      if (membershipMetrics.isExpiringSoon) {
        notify.warning({
          title: 'Membresía por vencer',
          description: `Esta membresía vence en ${membershipMetrics.remainingMonths} mes(es)`
        });
      }

      setCalculationsComplete(true);
      setIsCalculating(false);

      // Stage 3: Save
      setIsSaving(true);

      // Process data (trim strings, ensure numbers)
      const processedData: MembershipFormData = {
        ...formData,
        customer_id: formData.customer_id.trim(),
        monthly_fee: Number(formData.monthly_fee)
      };

      await onSubmit(processedData);

      setMembershipSaved(true);
      setIsSaving(false);

      notify.success({
        title: isEditMode ? 'Membresía actualizada' : 'Membresía creada',
        description: `${formData.membership_type.toUpperCase()} - $${formData.monthly_fee}/mes`
      });

      onSuccess?.();

    } catch (error) {
      setIsSaving(false);
      notify.error({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      });
    }
  }, [isEditMode, validateForm, membershipMetrics, onSubmit, onSuccess]);

  // Computed values for UI
  const modalTitle = useMemo(() => {
    if (isEditMode) {
      return `Editar Membresía: ${membership?.membership_type?.toUpperCase() || ''}`;
    }
    return 'Nueva Membresía';
  }, [isEditMode, membership]);

  const submitButtonContent = useMemo(() => {
    if (isSaving) return 'Guardando membresía...';
    if (isCalculating) return 'Calculando costos...';
    if (isValidating) return 'Validando...';
    return isEditMode ? 'Actualizar Membresía' : 'Crear Membresía';
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

    if (watchedValues.status === 'cancelled' || watchedValues.status === 'expired') {
      return {
        text: 'Membresía inactiva',
        color: 'error' as const
      };
    }

    if (watchedValues.status === 'suspended') {
      return {
        text: 'Membresía suspendida',
        color: 'warning' as const
      };
    }

    if (membershipMetrics.isExpiringSoon) {
      return {
        text: 'Por vencer',
        color: 'warning' as const
      };
    }

    if (membershipMetrics.isLifetime) {
      return {
        text: 'Membresía de por vida',
        color: 'info' as const
      };
    }

    return {
      text: 'Listo',
      color: 'success' as const
    };
  }, [validationState, watchedValues.status, membershipMetrics]);

  const operationProgress = useMemo(() => {
    if (membershipSaved) return 100;
    if (isSaving) return 80;
    if (calculationsComplete) return 60;
    if (validationPassed) return 40;
    if (isCalculating) return 30;
    if (isValidating) return 20;
    return 0;
  }, [isValidating, isCalculating, validationPassed, calculationsComplete, isSaving, membershipSaved]);

  const membershipTypeBadge = useMemo(() => {
    const type = watchedValues.membership_type;

    if (type === 'vip') return { text: 'VIP', color: 'purple' as const };
    if (type === 'premium') return { text: 'Premium', color: 'blue' as const };
    if (type === 'basic') return { text: 'Básica', color: 'gray' as const };
    return { text: 'Desconocido', color: 'gray' as const };
  }, [watchedValues.membership_type]);

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
    membershipSaved,

    // Membership metrics
    membershipMetrics,

    // Computed UI values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    membershipTypeBadge,

    // Handlers
    handleFieldChange,
    handleSubmit,
    handleCalculateTotalCost
  };
}

export default useMembershipForm;
