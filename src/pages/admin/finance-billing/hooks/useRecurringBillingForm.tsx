/**
 * Recurring Billing Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useRecurringBillingValidation } from '@/hooks/useRecurringBillingValidation';
import type { RecurringBillingFormData } from '@/lib/validation/zod/CommonSchemas';

export interface RecurringBilling {
  id: string;
  customer_id: string;
  service_description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'debit';
  auto_charge: boolean;
  status: 'active' | 'paused' | 'cancelled';
  next_billing_date: string;
}

interface UseRecurringBillingFormOptions {
  recurringBilling?: RecurringBilling;
  onSuccess?: () => void;
  onSubmit: (data: RecurringBillingFormData) => Promise<void>;
}

interface BillingMetrics {
  monthlyAmount: number;
  annualRevenue: number;
  lifetimeValue: number;
  nextBillingDate: Date | null;
  revenueHealth: 'high' | 'medium' | 'low';
  retentionRisk: 'high' | 'medium' | 'low';
  totalCycles: number | null;
  daysUntilNext: number | null;
}

export function useRecurringBillingForm({
  recurringBilling,
  onSuccess,
  onSubmit
}: UseRecurringBillingFormOptions) {

  // ===== MODO =====
  const isEditMode = !!recurringBilling;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [billingCreated, setBillingCreated] = useState(false);
  const [metricsCalculated, setMetricsCalculated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    calculateNextBillingDate
  } = useRecurringBillingValidation(
    {
      customer_id: recurringBilling?.customer_id || '',
      service_description: recurringBilling?.service_description || '',
      amount: recurringBilling?.amount || 0,
      frequency: recurringBilling?.frequency || 'monthly',
      start_date: recurringBilling?.start_date || new Date().toISOString().split('T')[0],
      end_date: recurringBilling?.end_date,
      payment_method: recurringBilling?.payment_method || 'card',
      auto_charge: recurringBilling?.auto_charge ?? false,
      status: recurringBilling?.status || 'active',
      next_billing_date: recurringBilling?.next_billing_date || new Date().toISOString().split('T')[0]
    }
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== BILLING METRICS CALCULATION =====
  const billingMetrics: BillingMetrics = useMemo(() => {

    const { amount, frequency, start_date, end_date } = formData;

    // Calculate monthly amount based on frequency
    const monthlyAmount = (() => {
      switch (frequency) {
        case 'daily': return (amount || 0) * 30;
        case 'weekly': return (amount || 0) * 4;
        case 'monthly': return amount || 0;
        case 'quarterly': return (amount || 0) / 3;
        case 'yearly': return (amount || 0) / 12;
        default: return 0;
      }
    })();

    const annualRevenue = monthlyAmount * 12;

    // Calculate lifetime value
    const lifetimeValue = (() => {
      if (end_date && start_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);
        const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return monthlyAmount * Math.max(0, months);
      }
      return annualRevenue * 2; // Estimate 2 years if indefinite
    })();

    // Calculate next billing date
    const nextBillingDate = start_date ? new Date(calculateNextBillingDate(start_date, frequency)) : null;

    // Calculate days until next billing
    const daysUntilNext = nextBillingDate
      ? Math.ceil((nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate total cycles
    const totalCycles = (() => {
      if (!end_date || !start_date) return null;

      const start = new Date(start_date);
      const end = new Date(end_date);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      switch (frequency) {
        case 'daily': return totalDays;
        case 'weekly': return Math.ceil(totalDays / 7);
        case 'monthly': return Math.ceil(totalDays / 30);
        case 'quarterly': return Math.ceil(totalDays / 90);
        case 'yearly': return Math.ceil(totalDays / 365);
        default: return null;
      }
    })();

    // Calculate revenue health
    const revenueHealth: 'high' | 'medium' | 'low' =
      monthlyAmount > 10000 ? 'high' :
      monthlyAmount > 5000 ? 'medium' :
      'low';

    // Calculate retention risk
    const retentionRisk: 'high' | 'medium' | 'low' =
      frequency === 'yearly' ? 'low' :
      frequency === 'monthly' ? 'medium' :
      'high';

    // Mark metrics as calculated
    if (!metricsCalculated) {
      setTimeout(() => setMetricsCalculated(true), 100);
    }

    return {
      monthlyAmount,
      annualRevenue,
      lifetimeValue,
      nextBillingDate,
      revenueHealth,
      retentionRisk,
      totalCycles,
      daysUntilNext
    };
  }, [formData.amount, formData.frequency, formData.start_date, formData.end_date, calculateNextBillingDate, metricsCalculated]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Facturación Recurrente' : 'Nueva Facturación Recurrente';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (billingCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Facturación' : 'Crear Facturación';
  }, [isValidating, isSaving, billingCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.service_description || !formData.customer_id) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.service_description, formData.customer_id]);

  const operationProgress = useMemo(() => {
    if (billingCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, billingCreated]);

  const billingHealthBadge = useMemo(() => {
    const { revenueHealth, retentionRisk } = billingMetrics;

    if (revenueHealth === 'high' && retentionRisk === 'low') {
      return { text: 'Excelente', color: 'green' as const };
    }
    if (revenueHealth === 'medium' || retentionRisk === 'medium') {
      return { text: 'Buena', color: 'blue' as const };
    }
    if (revenueHealth === 'low' || retentionRisk === 'high') {
      return { text: 'Mejorable', color: 'orange' as const };
    }
    return { text: 'Revisar', color: 'yellow' as const };
  }, [billingMetrics]);

  // ===== AUTO-CALCULATE HELPERS =====
  const autoCalculateNextBilling = useCallback(() => {
    const { start_date, frequency } = formData;
    if (!start_date) return;

    const nextDate = calculateNextBillingDate(start_date, frequency);
    form.setValue('next_billing_date', nextDate, { shouldValidate: true });
  }, [formData, calculateNextBillingDate, form]);

  // ===== SUBMIT HANDLER =====
  const handleFormSubmit = useCallback(
    handleSubmit(async (data) => {
      try {
        // Step 1: Validate
        setIsValidating(true);
        const isValid = await validateForm();
        setIsValidating(false);

        if (!isValid) {
          setValidationPassed(false);
          return;
        }

        setValidationPassed(true);

        // Step 2: Save
        setIsSaving(true);
        await onSubmit(data);
        setIsSaving(false);

        // Step 3: Success
        setBillingCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setBillingCreated(false);
          setMetricsCalculated(false);
          onSuccess?.();
        }, 1500);

      } catch (error) {
        setIsValidating(false);
        setIsSaving(false);
        setValidationPassed(false);
        throw error;
      }
    }),
    [handleSubmit, validateForm, onSubmit, onSuccess]
  );

  // ===== RETURN API =====
  return {
    // Form
    form,
    formData,
    isEditMode,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // Billing metrics
    billingMetrics,

    // Loading states
    isValidating,
    isSaving,

    // Success states
    validationPassed,
    billingCreated,
    metricsCalculated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    billingHealthBadge,

    // Helpers
    autoCalculateNextBilling,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
