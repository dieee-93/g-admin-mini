/**
 * Fiscal Document Form Hook
 * Implements Material Form Pattern for fiscal documents (invoices, credit notes, etc.)
 *
 * Architecture: Business logic separated from UI
 * - Manages form state and loading states
 * - Integrates with useFiscalDocumentValidation
 * - Handles tax calculations and fiscal metrics
 * - Computes derived values (modalTitle, badges, progress)
 *
 * Pattern: Same as useSupplierForm, useShiftForm
 * Created: 2025-01-31
 */

import { useState, useMemo, useCallback } from 'react';
import { useFiscalDocumentValidation } from '@/hooks/useFiscalDocumentValidation';
import { notify } from '@/lib/notifications';
import type { FiscalDocumentFormData } from '@/lib/validation/zod/CommonSchemas';

interface FiscalDocument {
  id?: string;
  document_type: 'factura_a' | 'factura_b' | 'factura_c' | 'nota_credito' | 'nota_debito';
  point_of_sale: number;
  document_number: number;
  issue_date: string;
  customer_name: string;
  customer_cuit: string;
  customer_address: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  cae: string;
  cae_expiration: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    iva_rate: number;
    subtotal: number;
  }>;
}

interface UseFiscalDocumentFormProps {
  document?: FiscalDocument | null;
  existingDocuments: FiscalDocument[];
  onSubmit: (data: FiscalDocumentFormData) => Promise<void>;
  onSuccess?: () => void;
}

interface FiscalMetrics {
  itemsSubtotal: number;
  calculatedIVA: number;
  calculatedTotal: number;
  totalsMatch: boolean;
  itemCount: number;
  averageIVARate: number;
  complianceScore: number;
  readyForAFIP: boolean;
}

export function useFiscalDocumentForm({
  document,
  existingDocuments,
  onSubmit,
  onSuccess
}: UseFiscalDocumentFormProps) {

  const isEditMode = !!document;

  // Loading states
  const [isValidating, setIsValidating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Success states
  const [validationPassed, setValidationPassed] = useState(false);
  const [calculationsComplete, setCalculationsComplete] = useState(false);
  const [documentSaved, setDocumentSaved] = useState(false);

  // Initialize validation hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    validateCUITFormat,
    validateCAEExpiration,
    calculateIVA,
    validateTotals
  } = useFiscalDocumentValidation(
    {
      document_type: document?.document_type || 'factura_b',
      point_of_sale: document?.point_of_sale || 1,
      document_number: document?.document_number || 1,
      issue_date: document?.issue_date || new Date().toISOString().split('T')[0],
      customer_name: document?.customer_name || '',
      customer_cuit: document?.customer_cuit || '',
      customer_address: document?.customer_address || '',
      subtotal: document?.subtotal || 0,
      iva_amount: document?.iva_amount || 0,
      total: document?.total || 0,
      cae: document?.cae || '',
      cae_expiration: document?.cae_expiration || '',
      items: document?.items || []
    },
    existingDocuments,
    document?.id
  );

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Calculate fiscal metrics in real-time
  const fiscalMetrics = useMemo((): FiscalMetrics => {
    const items = watchedValues.items || [];
    const subtotal = watchedValues.subtotal || 0;
    const iva_amount = watchedValues.iva_amount || 0;
    const total = watchedValues.total || 0;

    // Calculate items subtotal
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    // Calculate IVA from items
    const calculatedIVA = calculateIVA(subtotal, items);

    // Calculate total
    const calculatedTotal = subtotal + iva_amount;

    // Check if totals match
    const totalsMatch =
      Math.abs(itemsSubtotal - subtotal) <= 0.01 &&
      Math.abs(calculatedIVA - iva_amount) <= 0.01 &&
      Math.abs(calculatedTotal - total) <= 0.01;

    // Calculate average IVA rate
    const totalItemsValue = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const averageIVARate = totalItemsValue > 0
      ? items.reduce((sum, item) => sum + ((item.iva_rate || 0) * (item.subtotal || 0)), 0) / totalItemsValue
      : 21;

    // Calculate compliance score
    let complianceScore = 0;
    if (watchedValues.customer_cuit && validateCUITFormat(watchedValues.customer_cuit)) complianceScore += 25;
    if (watchedValues.customer_name) complianceScore += 15;
    if (watchedValues.customer_address) complianceScore += 10;
    if (items.length > 0) complianceScore += 20;
    if (totalsMatch) complianceScore += 20;
    if (watchedValues.cae) complianceScore += 10;

    // Ready for AFIP if all critical fields are present
    const readyForAFIP =
      complianceScore >= 80 &&
      totalsMatch &&
      validateCUITFormat(watchedValues.customer_cuit);

    return {
      itemsSubtotal,
      calculatedIVA,
      calculatedTotal,
      totalsMatch,
      itemCount: items.length,
      averageIVARate,
      complianceScore,
      readyForAFIP
    };
  }, [watchedValues, calculateIVA, validateCUITFormat]);

  // Auto-calculate IVA when subtotal or items change
  const handleCalculateTax = useCallback(() => {
    setIsCalculating(true);

    try {
      const items = watchedValues.items || [];
      const subtotal = watchedValues.subtotal || 0;

      const calculatedIVA = calculateIVA(subtotal, items);
      const calculatedTotal = subtotal + calculatedIVA;

      setValue('iva_amount', calculatedIVA);
      setValue('total', calculatedTotal);

      setCalculationsComplete(true);

      notify.success({
        title: 'Cálculos actualizados',
        description: `IVA: $${calculatedIVA.toFixed(2)} | Total: $${calculatedTotal.toFixed(2)}`
      });
    } catch (error: unknown) {
      notify.error({
        title: 'Error en cálculos',
        description: 'No se pudieron actualizar los totales automáticamente'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [watchedValues, calculateIVA, setValue]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: keyof FiscalDocumentFormData, value: any) => {
    setValue(field, value);

    // Auto-recalculate if subtotal or items change
    if (field === 'subtotal' || field === 'items') {
      setTimeout(() => handleCalculateTax(), 100);
    }
  }, [setValue, handleCalculateTax]);

  // Handle form submission
  const handleSubmit = useCallback(async (formData: FiscalDocumentFormData) => {
    try {
      // Stage 1: Validate
      setIsValidating(true);
      setValidationPassed(false);
      setCalculationsComplete(false);
      setDocumentSaved(false);

      const isValid = await validateForm();

      if (!isValid) {
        notify.error({
          title: 'Validación fallida',
          description: 'Por favor corrige los errores antes de continuar'
        });
        setIsValidating(false);
        return;
      }

      setValidationPassed(true);
      setIsValidating(false);

      // Stage 2: Verify calculations
      setIsCalculating(true);

      const totalsError = validateTotals(formData);
      if (totalsError) {
        notify.error({
          title: 'Error en totales',
          description: totalsError
        });
        setIsCalculating(false);
        return;
      }

      setCalculationsComplete(true);
      setIsCalculating(false);

      // Stage 3: Save
      setIsSaving(true);

      // Process data (trim strings, ensure numbers)
      const processedData: FiscalDocumentFormData = {
        ...formData,
        customer_name: formData.customer_name.trim(),
        customer_cuit: formData.customer_cuit.trim(),
        customer_address: formData.customer_address.trim(),
        cae: formData.cae.trim(),
        subtotal: Number(formData.subtotal),
        iva_amount: Number(formData.iva_amount),
        total: Number(formData.total),
        items: formData.items.map(item => ({
          ...item,
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          iva_rate: Number(item.iva_rate),
          subtotal: Number(item.subtotal)
        }))
      };

      await onSubmit(processedData);

      setDocumentSaved(true);
      setIsSaving(false);

      notify.success({
        title: isEditMode ? 'Comprobante actualizado' : 'Comprobante creado',
        description: `${formData.document_type.toUpperCase()} ${formData.point_of_sale}-${formData.document_number}`
      });

      onSuccess?.();

    } catch (error: unknown) {
      setIsSaving(false);
      notify.error({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      });
    }
  }, [isEditMode, validateForm, validateTotals, onSubmit, onSuccess]);

  // Computed values for UI
  const modalTitle = useMemo(() => {
    if (isEditMode) {
      return `Editar ${document?.document_type?.toUpperCase() || 'Comprobante'}`;
    }
    return 'Nuevo Comprobante Fiscal';
  }, [isEditMode, document]);

  const submitButtonContent = useMemo(() => {
    if (isSaving) return 'Guardando comprobante...';
    if (isCalculating) return 'Calculando totales...';
    if (isValidating) return 'Validando...';
    return isEditMode ? 'Actualizar Comprobante' : 'Crear Comprobante';
  }, [isValidating, isCalculating, isSaving, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) {
      return {
        text: `${validationState.errorCount} error(es)`,
        color: 'error' as const
      };
    }

    if (!fiscalMetrics.totalsMatch) {
      return {
        text: 'Totales incorrectos',
        color: 'warning' as const
      };
    }

    if (validationState.hasWarnings) {
      return {
        text: `${validationState.warningCount} advertencia(s)`,
        color: 'warning' as const
      };
    }

    if (fiscalMetrics.readyForAFIP) {
      return {
        text: 'Listo para AFIP',
        color: 'success' as const
      };
    }

    return {
      text: 'Incompleto',
      color: 'info' as const
    };
  }, [validationState, fiscalMetrics]);

  const operationProgress = useMemo(() => {
    if (documentSaved) return 100;
    if (isSaving) return 80;
    if (calculationsComplete) return 60;
    if (validationPassed) return 40;
    if (isCalculating) return 30;
    if (isValidating) return 20;
    return 0;
  }, [isValidating, isCalculating, validationPassed, calculationsComplete, isSaving, documentSaved]);

  const complianceBadge = useMemo(() => {
    const score = fiscalMetrics.complianceScore;

    if (score >= 90) return { text: `${score}% - Excelente`, color: 'success' as const };
    if (score >= 75) return { text: `${score}% - Bueno`, color: 'info' as const };
    if (score >= 50) return { text: `${score}% - Regular`, color: 'warning' as const };
    return { text: `${score}% - Insuficiente`, color: 'error' as const };
  }, [fiscalMetrics.complianceScore]);

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
    documentSaved,

    // Fiscal metrics
    fiscalMetrics,

    // Computed UI values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    complianceBadge,

    // Handlers
    handleFieldChange,
    handleSubmit,
    handleCalculateTax,

    // Helpers
    validateCUITFormat,
    validateCAEExpiration
  };
}

export default useFiscalDocumentForm;
