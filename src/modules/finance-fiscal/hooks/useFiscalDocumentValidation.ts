/**
 * Fiscal Document Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useMaterialValidation.ts / useEmployeeValidation.ts
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type FiscalDocumentFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseFiscalDocumentValidationResult {
  form: UseFormReturn<FiscalDocumentFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof FiscalDocumentFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;
  // Business logic validation functions
  validateCUITFormat: (cuit: string) => boolean;
  validateCAEExpiration: (date: string) => boolean;
  calculateIVA: (subtotal: number, items: FiscalDocumentFormData['items']) => number;
  validateTotals: (data: FiscalDocumentFormData) => string | null;
}

interface FiscalDocument {
  id?: string;
  document_number: number;
  customer_cuit: string;
  [key: string]: any;
}

export function useFiscalDocumentValidation(
  initialData: Partial<FiscalDocumentFormData> = {},
  existingDocuments: FiscalDocument[] = [],
  currentDocumentId?: string, // For edit mode
  options: ValidationOptions = {}
): UseFiscalDocumentValidationResult {

  const { enableRealTime = true, debounceMs = 300 } = options;

  // React Hook Form with Zod validation
  const form = useForm<FiscalDocumentFormData>({
    resolver: zodResolver(EntitySchemas.fiscalDocument),
    defaultValues: {
      document_type: 'factura_b',
      point_of_sale: 1,
      document_number: 1,
      issue_date: new Date().toISOString().split('T')[0],
      customer_name: '',
      customer_cuit: '',
      customer_address: '',
      subtotal: 0,
      iva_amount: 0,
      total: 0,
      cae: '',
      cae_expiration: '',
      items: [],
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // Business logic validators (not handled by Zod)

  /**
   * Validate CUIT format (20-12345678-9)
   */
  const validateCUITFormat = useCallback((cuit: string): boolean => {
    if (!cuit) return false;
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuit);
  }, []);

  /**
   * Validate CAE expiration date (must be future)
   */
  const validateCAEExpiration = useCallback((date: string): boolean => {
    if (!date) return false;
    const expirationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expirationDate >= today;
  }, []);

  /**
   * Calculate IVA from items
   */
  const calculateIVA = useCallback((subtotal: number, items: FiscalDocumentFormData['items']): number => {
    if (!items || items.length === 0) {
      // Default to 21% if no items
      return subtotal * 0.21;
    }

    // Calculate IVA from items
    const totalIVA = items.reduce((sum, item) => {
      const itemSubtotal = item.subtotal || 0;
      const ivaRate = item.iva_rate || 21;
      return sum + (itemSubtotal * (ivaRate / 100));
    }, 0);

    return Number(totalIVA.toFixed(2));
  }, []);

  /**
   * Validate totals match (subtotal + IVA = total)
   */
  const validateTotals = useCallback((data: FiscalDocumentFormData): string | null => {
    const { subtotal, iva_amount, total, items } = data;

    // Validate items subtotal matches document subtotal
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    if (Math.abs(itemsSubtotal - subtotal) > 0.01) {
      return `El subtotal (${subtotal}) no coincide con la suma de los ítems (${itemsSubtotal.toFixed(2)})`;
    }

    // Validate IVA calculation
    const calculatedIVA = calculateIVA(subtotal, items);

    if (Math.abs(calculatedIVA - iva_amount) > 0.01) {
      return `El IVA (${iva_amount}) no coincide con el calculado (${calculatedIVA.toFixed(2)})`;
    }

    // Validate total calculation
    const calculatedTotal = subtotal + iva_amount;

    if (Math.abs(calculatedTotal - total) > 0.01) {
      return `El total (${total}) no coincide con subtotal + IVA (${calculatedTotal.toFixed(2)})`;
    }

    return null;
  }, [calculateIVA]);

  /**
   * Check for duplicate document numbers
   */
  const checkDuplicateDocument = useCallback((
    pointOfSale: number,
    documentNumber: number,
    documentType: string
  ): string | null => {
    if (!documentNumber || !pointOfSale) return null;

    // Skip check if editing current document
    const isDuplicate = existingDocuments.some(doc =>
      doc.point_of_sale === pointOfSale &&
      doc.document_number === documentNumber &&
      doc.document_type === documentType &&
      doc.id !== currentDocumentId
    );

    return isDuplicate
      ? `Ya existe un comprobante ${documentType} con número ${pointOfSale}-${documentNumber}`
      : null;
  }, [existingDocuments, currentDocumentId]);

  // Custom field validation with business rules
  const validateField = useCallback((field: keyof FiscalDocumentFormData, value: any) => {
    // Clear previous custom errors
    form.clearErrors(field);

    // Run Zod validation first
    form.trigger(field);

    // Apply business logic validation
    if (field === 'customer_cuit' && typeof value === 'string') {
      if (!validateCUITFormat(value)) {
        form.setError('customer_cuit', {
          type: 'custom',
          message: 'CUIT inválido (formato: 20-12345678-9)'
        });
      }
    }

    if (field === 'cae_expiration' && typeof value === 'string') {
      if (value && !validateCAEExpiration(value)) {
        form.setError('cae_expiration', {
          type: 'custom',
          message: 'La fecha de vencimiento del CAE debe ser futura'
        });
      }
    }
  }, [form, validateCUITFormat, validateCAEExpiration]);

  // Enhanced form validation
  const validateForm = useCallback(async (): Promise<boolean> => {
    // Run Zod validation
    const isZodValid = await form.trigger();

    // Run business logic validation
    const formData = form.getValues();

    // Check CUIT format
    if (!validateCUITFormat(formData.customer_cuit)) {
      form.setError('customer_cuit', {
        type: 'custom',
        message: 'CUIT inválido (formato: 20-12345678-9)'
      });
      return false;
    }

    // Check CAE expiration
    if (formData.cae_expiration && !validateCAEExpiration(formData.cae_expiration)) {
      form.setError('cae_expiration', {
        type: 'custom',
        message: 'La fecha de vencimiento del CAE debe ser futura'
      });
      return false;
    }

    // Check duplicate document
    const duplicateError = checkDuplicateDocument(
      formData.point_of_sale,
      formData.document_number,
      formData.document_type
    );

    if (duplicateError) {
      form.setError('document_number', { type: 'custom', message: duplicateError });
      return false;
    }

    // Validate totals
    const totalsError = validateTotals(formData);

    if (totalsError) {
      form.setError('total', { type: 'custom', message: totalsError });
      return false;
    }

    return isZodValid;
  }, [form, validateCUITFormat, validateCAEExpiration, checkDuplicateDocument, validateTotals]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // Field errors from React Hook Form
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    Object.entries(form.formState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors[field] = error.message;
      }
    });
    return errors;
  }, [form.formState.errors]);

  // Field warnings (business logic hints)
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning for high totals
    if (formData.total && formData.total > 1000000) {
      warnings.total = 'Total muy alto, verifica el importe';
    }

    // Warning for missing CAE (should be obtained from AFIP)
    if (!formData.cae && formData.document_type !== 'nota_credito') {
      warnings.cae = 'Recuerda obtener el CAE de AFIP antes de emitir';
    }

    // Warning for CAE expiring soon
    if (formData.cae_expiration) {
      const expirationDate = new Date(formData.cae_expiration);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration > 0 && daysUntilExpiration <= 7) {
        warnings.cae_expiration = `El CAE vence en ${daysUntilExpiration} día(s)`;
      }
    }

    // Warning for empty items
    if (!formData.items || formData.items.length === 0) {
      warnings.items = 'Agrega al menos un ítem al comprobante';
    }

    return warnings;
  }, []);

  // Validation state summary
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,
    validateCUITFormat,
    validateCAEExpiration,
    calculateIVA,
    validateTotals
  };
}

export default useFiscalDocumentValidation;
