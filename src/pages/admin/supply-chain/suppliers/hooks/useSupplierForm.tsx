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
import { useSuppliers } from './useSuppliers';
import { useSupplierValidation } from '@/hooks/useSupplierValidation';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { SupplierFormData, Supplier } from '../types/supplierTypes';

interface UseSupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function useSupplierForm({ isOpen, onClose, supplier }: UseSupplierFormProps) {
  const { suppliers, createSupplier, updateSupplier } = useSuppliers();
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
    payment_terms: '30 días',
    rating: null,
    notes: '',
    is_active: true
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

  const handleFieldChange = useCallback((field: keyof SupplierFormData) =>
    (value: SupplierFormData[keyof SupplierFormData]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []
  );

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
        payment_terms: supplier.payment_terms || '30 días',
        rating: supplier.rating || null,
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
        payment_terms: '30 días',
        rating: null,
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
    // Update form values in React Hook Form
    Object.keys(formData).forEach(key => {
      form.setValue(key as keyof SupplierFormData, formData[key as keyof SupplierFormData]);
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

      // Step 2: Save supplier
      setLoadingStates(prev => ({ ...prev, saving: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      if (isEditMode) {
        await updateSupplier(supplier.id, formData);
      } else {
        await createSupplier(formData);
      }

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
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (error) {
      logger.error('SupplierForm', 'Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar proveedor',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
      setLoadingStates({
        validating: false,
        saving: false
      });
    }
  }, [validateForm, isEditMode, supplier, formData, updateSupplier, createSupplier, onClose]);

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
    onClose
  };
}
