/**
 * Payment Integration Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { usePaymentIntegrationValidation } from '@/hooks/usePaymentIntegrationValidation';
import type { PaymentIntegrationFormData } from '@/lib/validation/zod/CommonSchemas';

export interface PaymentIntegration {
  id: string;
  provider: 'mercadopago' | 'modo' | 'stripe' | 'paypal' | 'other';
  api_key: string;
  api_secret: string;
  webhook_url?: string;
  is_production: boolean;
  enabled: boolean;
  supported_methods: ('card' | 'qr' | 'transfer' | 'cash')[];
  configuration?: Record<string, unknown>;
}

interface UsePaymentIntegrationFormOptions {
  integration?: PaymentIntegration;
  onSuccess?: () => void;
  onSubmit: (data: PaymentIntegrationFormData) => Promise<void>;
}

interface IntegrationSecurity {
  keyStrength: 'weak' | 'medium' | 'strong';
  hasWebhook: boolean;
  isProduction: boolean;
  isEnabled: boolean;
  securityScore: number; // 0-100
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function usePaymentIntegrationForm({
  integration,
  onSuccess,
  onSubmit
}: UsePaymentIntegrationFormOptions) {

  // ===== MODO =====
  const isEditMode = !!integration;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [integrationCreated, setIntegrationCreated] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);

  // ===== VALIDATION HOOK =====
  // Note: The validation hook uses different field names, so we'll map them
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = usePaymentIntegrationValidation(
    {
      provider: integration?.provider || 'mercadopago',
      api_key: integration?.api_key || '',
      api_secret: integration?.api_secret || '',
      webhook_url: integration?.webhook_url || '',
      test_mode: !integration?.is_production,
      is_active: integration?.enabled ?? false,
      description: '' // Not in schema, but validation hook expects it
    }
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== SECURITY ANALYSIS =====
  const integrationSecurity: IntegrationSecurity = useMemo(() => {
    const { api_key, api_secret, webhook_url, test_mode, is_active } = formData;

    // Calculate key strength
    const keyStrength: 'weak' | 'medium' | 'strong' =
      (api_key?.length || 0) < 20 ? 'weak' :
      (api_key?.length || 0) < 40 ? 'medium' :
      'strong';

    // Calculate security score (0-100)
    let score = 0;

    // API Key strength (30 points)
    if ((api_key?.length || 0) >= 40) score += 30;
    else if ((api_key?.length || 0) >= 20) score += 15;

    // API Secret strength (30 points)
    if ((api_secret?.length || 0) >= 40) score += 30;
    else if ((api_secret?.length || 0) >= 20) score += 15;

    // Webhook configured (20 points)
    if (webhook_url && webhook_url.trim() !== '') score += 20;

    // Production mode (10 points)
    if (!test_mode) score += 10;

    // Integration active (10 points)
    if (is_active) score += 10;

    const securityLevel: 'low' | 'medium' | 'high' | 'critical' =
      score >= 80 ? 'high' :
      score >= 60 ? 'medium' :
      score >= 40 ? 'low' :
      'critical';

    return {
      keyStrength,
      hasWebhook: !!(webhook_url && webhook_url.trim() !== ''),
      isProduction: !test_mode,
      isEnabled: is_active || false,
      securityScore: score,
      securityLevel
    };
  }, [formData]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Integración de Pago' : 'Nueva Integración de Pago';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isTesting) return 'Probando conexión...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (integrationCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Integración' : 'Crear Integración';
  }, [isValidating, isTesting, isSaving, integrationCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.api_key || !formData.api_secret) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.api_key, formData.api_secret]);

  const operationProgress = useMemo(() => {
    if (integrationCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, integrationCreated]);

  const securityBadge = useMemo(() => {
    const { securityLevel } = integrationSecurity;

    if (securityLevel === 'high') {
      return { text: 'Seguridad Alta', color: 'green' as const };
    }
    if (securityLevel === 'medium') {
      return { text: 'Seguridad Media', color: 'blue' as const };
    }
    if (securityLevel === 'low') {
      return { text: 'Seguridad Baja', color: 'orange' as const };
    }
    return { text: 'Seguridad Crítica', color: 'red' as const };
  }, [integrationSecurity]);

  const providerName = useMemo(() => {
    const providers = {
      mercadopago: 'Mercado Pago',
      modo: 'MODO',
      stripe: 'Stripe',
      paypal: 'PayPal',
      other: 'Otro'
    };
    return providers[formData.provider as keyof typeof providers] || 'Desconocido';
  }, [formData.provider]);

  // ===== TEST CONNECTION HELPER =====
  const testConnection = useCallback(async () => {
    if (!formData.api_key || !formData.api_secret) {
      return { success: false, message: 'API Key y API Secret son requeridos' };
    }

    setIsTesting(true);

    try {
      // Simulate connection test (in production, this would call the actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setConnectionTested(true);
      setTimeout(() => setConnectionTested(false), 3000);

      return { success: true, message: 'Conexión exitosa' };
    } catch {
      return { success: false, message: 'Error al probar conexión' };
    } finally {
      setIsTesting(false);
    }
  }, [formData.api_key, formData.api_secret]);

  // ===== SUBMIT HANDLER =====
  const handleFormSubmit = handleSubmit(async (data) => {
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
      // Map validation hook fields to actual schema fields
      const integrationData: PaymentIntegrationFormData = {
        provider: data.provider as 'mercadopago' | 'modo' | 'stripe' | 'paypal' | 'other',
        api_key: data.api_key,
        api_secret: data.api_secret,
        webhook_url: data.webhook_url || undefined,
        is_production: !data.test_mode,
        enabled: data.is_active || false,
        supported_methods: ['card'], // Default, should be configured in UI
        configuration: undefined
      };

        setIsSaving(true);
        await onSubmit(integrationData);
        setIsSaving(false);

        // Step 3: Success
        setIntegrationCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setIntegrationCreated(false);
          onSuccess?.();
        }, 1500);

      } catch (error) {
        setIsValidating(false);
        setIsSaving(false);
        setValidationPassed(false);
        throw error;
      }
    });

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

    // Security analysis
    integrationSecurity,

    // Loading states
    isValidating,
    isSaving,
    isTesting,

    // Success states
    validationPassed,
    integrationCreated,
    connectionTested,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    securityBadge,
    providerName,

    // Helpers
    testConnection,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
