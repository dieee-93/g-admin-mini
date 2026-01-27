/**
 * Supplier Form Hook
 * Manages all business logic for Supplier form modal
 *
 * ARCHITECTURE:
 * - Separates business logic from UI
 * - Integrates useSupplierValidation hook
 * - Manages form state, loading states, success states
 * - Provides computed values (modalTitle, submitButtonContent, formStatusBadge)
 *
 * PATTERN: Same as useMaterialForm.tsx
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, HStack, Spinner, Text } from '@/shared/ui';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from '@/modules/suppliers/hooks';
import { useSupplierValidation } from '@/modules/suppliers/hooks';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { SupplierFormData, Supplier } from '../types/supplierTypes';

interface UseSupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function useSupplierForm({ isOpen, onClose, supplier }: UseSupplierFormProps) {
  // ✅ TanStack Query hooks
  const { data: suppliers = [] } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const isEditMode = !!supplier;

  // ========================================================================
  // FORM DATA STATE
  // ========================================================================

  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    iibb_number: '',
    iibb_condition: undefined,
    payment_terms: '30 días',
    rating: undefined,
    notes: '',
    is_active: true
  });

  const [iibbSameAsCuit, setIibbSameAsCuit] = useState(true);

  // Helper para formatear CUIT (XX-XXXXXXXX-X)
  const formatCuit = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  }, []);

  // Helper para limpiar formato
  const cleanCuit = useCallback((value: string) => value.replace(/\D/g, ''), []);



  // ========================================================================
  // VALIDATION HOOK INTEGRATION
  // ========================================================================

  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm: optimizedValidateForm,
    clearValidation
  } = useSupplierValidation(
    formData,
    suppliers,
    supplier?.id
  );

  // ========================================================================
  // LOADING & SUCCESS STATES
  // ========================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    validating: false,
    saving: false
  });

  const [successStates, setSuccessStates] = useState({
    validationPassed: false,
    supplierSaved: false
  });

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  const updateFormData = useCallback((updates: Partial<SupplierFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // OPTIMIZED: Single stable handler instead of factory function
  // Reduces re-renders from 56 to ~3 per keystroke
  const handleFieldChange = useCallback((field: keyof SupplierFormData, value: SupplierFormData[keyof SupplierFormData]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Sync IIBB synchronously if tax_id changes and sync is enabled
      if (field === 'tax_id' && iibbSameAsCuit && typeof value === 'string') {
        newData.iibb_number = value; // value is already cleaned in the UI handler
      }

      return newData;
    });
  }, [iibbSameAsCuit]);

  const toggleIibbSync = useCallback((checked: boolean) => {
    setIibbSameAsCuit(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, iibb_number: prev.tax_id }));
    }
  }, []);

  // ========================================================================
  // FORM INITIALIZATION
  // ========================================================================

  useEffect(() => {
    if (isOpen && supplier) {
      // Edit mode - populate with supplier data
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        tax_id: supplier.tax_id || '',
        iibb_number: supplier.iibb_number || '',
        iibb_condition: supplier.iibb_condition || undefined,
        payment_terms: supplier.payment_terms || '30 días',
        rating: supplier.rating || undefined,
        notes: supplier.notes || '',
        is_active: supplier.is_active ?? true
      });
    } else if (isOpen) {
      // Create mode - reset to defaults
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        iibb_number: '',
        iibb_condition: undefined,
        payment_terms: '30 días',
        rating: undefined,
        notes: '',
        is_active: true
      });
    }
  }, [isOpen, supplier]);

  // Clear validation when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearValidation();
      setSuccessStates({
        validationPassed: false,
        supplierSaved: false
      });
    }
  }, [isOpen, clearValidation]);

  // ========================================================================
  // FORM SUBMISSION
  // ========================================================================

  const validateForm = useCallback(async () => {
    logger.debug('SuppliersStore', '🔍 [VALIDATE] Starting form validation');
    logger.debug('SuppliersStore', '📋 [VALIDATE] Form data:', formData);

    // Update form values in React Hook Form
    Object.keys(formData).forEach(key => {
      form.setValue(key as keyof SupplierFormData, formData[key as keyof SupplierFormData]);
    });

    logger.debug('SuppliersStore', '🚀 [VALIDATE] Calling optimizedValidateForm()');
    const result = await optimizedValidateForm();
    logger.debug('SuppliersStore', `✅ [VALIDATE] Validation result: ${result}`);

    return result;
  }, [formData, form, optimizedValidateForm]);

  const handleSubmit = useCallback(async () => {
    console.log('🚀 [DEBUG SUBMIT] START - isSubmitting:', false, '→ true');
    logger.info('SuppliersStore', '🚀 [SUBMIT] Form submission started');
    setIsSubmitting(true);
    setLoadingStates(prev => ({ ...prev, validating: true }));

    try {
      // Step 1: Validate form
      logger.debug('SuppliersStore', '⏱️ [SUBMIT] Waiting 300ms before validation');
      await new Promise(resolve => setTimeout(resolve, 300));

      logger.info('SuppliersStore', '🔍 [SUBMIT] Calling validateForm()');
      const isValid = await validateForm();
      logger.info('SuppliersStore', `✅ [SUBMIT] Validation completed. isValid: ${isValid}`);

      setLoadingStates(prev => ({ ...prev, validating: false }));

      if (!isValid) {
        console.log('❌ [DEBUG SUBMIT] VALIDATION FAILED - isSubmitting:', true, '→ false');
        logger.warn('SuppliersStore', '❌ [SUBMIT] Validation failed, stopping submission');
        // CRITICAL: Reset isSubmitting BEFORE showing error to unblock button
        setIsSubmitting(false);
        console.log('✅ [DEBUG SUBMIT] isSubmitting resetted to false');
        toaster.create({
          title: 'Validación fallida',
          description: 'Por favor corrige los errores antes de continuar',
          type: 'error',
          duration: 3000
        });
        return;
      }

      logger.debug('SuppliersStore', '✅ [SUBMIT] Setting validationPassed to true');
      setSuccessStates(prev => ({ ...prev, validationPassed: true }));

      // Step 2: Save supplier
      logger.info('SuppliersStore', '💾 [SUBMIT] Starting supplier save process');
      setLoadingStates(prev => ({ ...prev, saving: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      if (isEditMode) {
        logger.debug('SuppliersStore', `📝 [SUBMIT] Updating supplier ${supplier.id}`);
        await updateMutation.mutateAsync({ id: supplier.id, data: formData });
      } else {
        logger.debug('SuppliersStore', '➕ [SUBMIT] Creating new supplier');
        await createMutation.mutateAsync(formData as any);
      }

      logger.info('SuppliersStore', '✅ [SUBMIT] Supplier saved successfully');
      setLoadingStates(prev => ({ ...prev, saving: false }));
      setSuccessStates(prev => ({ ...prev, supplierSaved: true }));

      // Success notification
      toaster.create({
        title: isEditMode ? 'Proveedor actualizado' : 'Proveedor creado',
        description: `${formData.name} ${isEditMode ? 'actualizado' : 'creado'} exitosamente`,
        type: 'success',
        duration: 3000
      });

      // Wait a bit before closing to show success state
      logger.debug('SuppliersStore', '⏱️ [SUBMIT] Waiting 500ms before closing modal');
      await new Promise(resolve => setTimeout(resolve, 500));
      logger.info('SuppliersStore', '🏁 [SUBMIT] Closing modal');
      onClose();
    } catch (error) {
      logger.error('SuppliersStore', '❌ [SUBMIT] Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar proveedor',
        type: 'error',
        duration: 5000
      });
    } finally {
      console.log('🧹 [DEBUG SUBMIT] CLEANUP - isSubmitting → false');
      logger.debug('SuppliersStore', '🧹 [SUBMIT] Cleanup: resetting states');
      setIsSubmitting(false);
      setLoadingStates({
        validating: false,
        saving: false
      });
    }
  }, [validateForm, isEditMode, supplier, formData, updateMutation, createMutation, onClose]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor';
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
    if (loadingStates.saving) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>{isEditMode ? 'Actualizando...' : 'Creando...'}</Text>
        </HStack>
      );
    }
    if (successStates.supplierSaved) {
      return (
        <HStack gap="2">
          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
          <Text>¡Completado!</Text>
        </HStack>
      );
    }
    return `${isEditMode ? 'Actualizar' : 'Crear'} Proveedor`;
  }, [loadingStates, successStates, isEditMode]);

  const operationProgress = useMemo(() => {
    if (!isSubmitting) return null;

    let progress = 0;
    let currentStep = '';

    if (loadingStates.validating) {
      progress = 33;
      currentStep = 'Validando formulario';
    } else if (successStates.validationPassed && !successStates.supplierSaved) {
      progress = 66;
      currentStep = isEditMode ? 'Actualizando proveedor' : 'Creando proveedor';
    } else if (successStates.supplierSaved) {
      progress = 100;
      currentStep = '¡Operación completada!';
    }

    return { progress, currentStep };
  }, [isSubmitting, loadingStates, successStates, isEditMode]);

  const formStatusBadge = useMemo(() => {
    // Required field missing
    if (!formData.name || formData.name.trim() === '') {
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
  }, [formData.name, validationState]);

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

    // Computed values
    modalTitle,
    submitButtonContent,
    operationProgress,
    formStatusBadge,

    // Handlers
    handleSubmit,
    onClose,

    // CUIT/IIBB helpers
    iibbSameAsCuit,
    setIibbSameAsCuit,
    toggleIibbSync,
    formatCuit,
    cleanCuit
  };
}
