/**
 * Customer Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useCustomerValidation } from '@/hooks/useCustomerValidation';
import type { CustomerFormData } from '@/lib/validation/zod/CommonSchemas';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  customer_type: 'individual' | 'business';
  tags?: string[];
  notes?: string;
  is_active: boolean;
}

interface UseCustomerFormOptions {
  customer?: Customer;
  existingCustomers?: Customer[];
  onSuccess?: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

interface CustomerMetrics {
  hasCompleteProfile: boolean;
  profileCompleteness: number; // 0-100%
  hasContactInfo: boolean;
  hasTaxInfo: boolean;
  customerRisk: 'low' | 'medium' | 'high';
}

export function useCustomerForm({
  customer,
  existingCustomers = [],
  onSuccess,
  onSubmit
}: UseCustomerFormOptions) {

  // ===== MODO =====
  const isEditMode = !!customer;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [customerCreated, setCustomerCreated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useCustomerValidation(
    {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      tax_id: customer?.tax_id || '',
      customer_type: customer?.customer_type || 'individual',
      tags: customer?.tags || [],
      notes: customer?.notes || '',
      is_active: customer?.is_active ?? true
    },
    existingCustomers,
    customer?.id
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== CUSTOMER METRICS =====
  const customerMetrics: CustomerMetrics = useMemo(() => {
    const { name, email, phone, address, tax_id, customer_type } = formData;

    // Calculate profile completeness
    let completeness = 0;
    if (name) completeness += 25;
    if (email) completeness += 15;
    if (phone) completeness += 15;
    if (address) completeness += 15;
    if (tax_id) completeness += 15;
    if (customer_type) completeness += 15;

    const hasCompleteProfile = completeness >= 80;
    const hasContactInfo = !!(email || phone);
    const hasTaxInfo = !!tax_id;

    // Calculate customer risk
    const customerRisk: 'low' | 'medium' | 'high' =
      !hasContactInfo ? 'high' :
      !hasTaxInfo && customer_type === 'business' ? 'medium' :
      'low';

    return {
      hasCompleteProfile,
      profileCompleteness: completeness,
      hasContactInfo,
      hasTaxInfo,
      customerRisk
    };
  }, [formData]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Cliente' : 'Nuevo Cliente';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (customerCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Cliente' : 'Crear Cliente';
  }, [isValidating, isSaving, customerCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.name) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.name]);

  const operationProgress = useMemo(() => {
    if (customerCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, customerCreated]);

  const completenessBadge = useMemo(() => {
    const { profileCompleteness } = customerMetrics;

    if (profileCompleteness >= 80) {
      return { text: 'Perfil Completo', color: 'green' as const };
    }
    if (profileCompleteness >= 50) {
      return { text: 'Perfil Parcial', color: 'yellow' as const };
    }
    return { text: 'Perfil Básico', color: 'gray' as const };
  }, [customerMetrics]);

  const riskBadge = useMemo(() => {
    const { customerRisk } = customerMetrics;

    if (customerRisk === 'low') {
      return { text: 'Bajo Riesgo', color: 'green' as const };
    }
    if (customerRisk === 'medium') {
      return { text: 'Riesgo Medio', color: 'yellow' as const };
    }
    return { text: 'Alto Riesgo', color: 'red' as const };
  }, [customerMetrics]);

  // ===== SUBMIT HANDLER =====
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setCustomerCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setCustomerCreated(false);
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

    // Customer metrics
    customerMetrics,

    // Loading states
    isValidating,
    isSaving,

    // Success states
    validationPassed,
    customerCreated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    completenessBadge,
    riskBadge,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
