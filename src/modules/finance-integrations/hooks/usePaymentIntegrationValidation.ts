/**
 * Payment Integration Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type PaymentIntegrationFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UsePaymentIntegrationValidationResult {
  form: UseFormReturn<PaymentIntegrationFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof PaymentIntegrationFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;
}

export function usePaymentIntegrationValidation(
  initialData: Partial<PaymentIntegrationFormData> = {},
  options: ValidationOptions = {}
): UsePaymentIntegrationValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<PaymentIntegrationFormData>({
    resolver: zodResolver(EntitySchemas.paymentIntegration),
    defaultValues: {
      provider: 'mercadopago',
      api_key: '',
      api_secret: '',
      webhook_url: '',
      is_production: false, // Changed from test_mode (inverted logic)
      enabled: false, // Changed from is_active to match schema
      supported_methods: ['card'], // Required field with at least one method
      configuration: {},
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;
    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof PaymentIntegrationFormData];
      if (error) errors[key] = error.message as string;
    });
    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    if (!formData.is_production && formData.enabled) {
      warnings.is_production = 'Integración activa en modo de prueba';
    }

    if (!formData.webhook_url || formData.webhook_url.trim() === '') {
      warnings.webhook_url = 'Se recomienda configurar un webhook URL para notificaciones';
    }

    if (formData.api_key && formData.api_key.length < 20) {
      warnings.api_key = 'La API key parece muy corta, verifica que sea correcta';
    }

    if (formData.api_secret && formData.api_secret.length < 20) {
      warnings.api_secret = 'El API secret parece muy corto, verifica que sea correcto';
    }

    return warnings;
  }, []);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  const validateField = useCallback((field: keyof PaymentIntegrationFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    return await form.trigger();
  }, [form]);

  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation
  };
}
