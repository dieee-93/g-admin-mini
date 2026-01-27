/**
 * Asset Form Hook
 * Implements Material Form Pattern for assets management
 *
 * Architecture: Business logic separated from UI
 * - Manages form state and loading states
 * - Integrates with useAssetValidation
 * - Handles depreciation calculations
 * - Computes derived values (modalTitle, badges, progress)
 *
 * Pattern: Same as useSupplierForm, useFiscalDocumentForm
 * Created: 2025-01-31
 */

import { useState, useMemo, useCallback } from 'react';
import { useAssetValidation } from '@/modules/assets/hooks';
import { notify } from '@/lib/notifications';
import type { AssetFormData } from '@/lib/validation/zod/CommonSchemas';

interface Asset {
  id?: string;
  name: string;
  asset_type: 'equipment' | 'furniture' | 'vehicle' | 'technology' | 'other';
  purchase_date: string;
  purchase_price: number;
  current_value?: number;
  depreciation_rate?: number;
  location_id?: string;
  status: 'active' | 'maintenance' | 'retired' | 'disposed';
  serial_number?: string;
  description: string;
}

interface UseAssetFormProps {
  asset?: Asset | null;
  existingAssets: Asset[];
  onSubmit: (data: AssetFormData) => Promise<void>;
  onSuccess?: () => void;
}

interface DepreciationMetrics {
  currentAge: number;
  depreciatedValue: number;
  totalDepreciation: number;
  annualDepreciation: number;
  depreciationPercentage: number;
  remainingValue: number;
}

export function useAssetForm({
  asset,
  existingAssets,
  onSubmit,
  onSuccess
}: UseAssetFormProps) {

  const isEditMode = !!asset;

  // Loading states
  const [isValidating, setIsValidating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Success states
  const [validationPassed, setValidationPassed] = useState(false);
  const [calculationsComplete, setCalculationsComplete] = useState(false);
  const [assetSaved, setAssetSaved] = useState(false);

  // Initialize validation hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    validateSerialNumberUnique,
    validatePriceDecline
  } = useAssetValidation(
    {
      name: asset?.name || '',
      asset_type: asset?.asset_type || 'equipment',
      purchase_date: asset?.purchase_date || new Date().toISOString().split('T')[0],
      purchase_price: asset?.purchase_price || 0,
      current_value: asset?.current_value,
      depreciation_rate: asset?.depreciation_rate,
      location_id: asset?.location_id,
      status: asset?.status || 'active',
      serial_number: asset?.serial_number || '',
      description: asset?.description || ''
    },
    existingAssets,
    asset?.id
  );

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Calculate depreciation metrics in real-time
  const depreciationMetrics = useMemo((): DepreciationMetrics => {
    const purchaseDate = watchedValues.purchase_date ? new Date(watchedValues.purchase_date) : new Date();
    const today = new Date();
    const currentAge = Math.max(0, (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    const purchasePrice = watchedValues.purchase_price || 0;
    const depreciationRate = watchedValues.depreciation_rate || 10; // Default 10% annual
    const currentValue = watchedValues.current_value || purchasePrice;

    // Calculate depreciation (straight-line method)
    const annualDepreciation = purchasePrice * (depreciationRate / 100);
    const totalDepreciation = Math.min(annualDepreciation * currentAge, purchasePrice);
    const depreciatedValue = Math.max(purchasePrice - totalDepreciation, 0);
    const remainingValue = currentValue;
    const depreciationPercentage = purchasePrice > 0 ? (totalDepreciation / purchasePrice) * 100 : 0;

    return {
      currentAge: Number(currentAge.toFixed(2)),
      depreciatedValue: Number(depreciatedValue.toFixed(2)),
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
      annualDepreciation: Number(annualDepreciation.toFixed(2)),
      depreciationPercentage: Number(depreciationPercentage.toFixed(2)),
      remainingValue: Number(remainingValue.toFixed(2))
    };
  }, [watchedValues]);

  // Auto-calculate current value based on depreciation
  const handleCalculateCurrentValue = useCallback(() => {
    setIsCalculating(true);

    try {
      setValue('current_value', depreciationMetrics.depreciatedValue);
      setCalculationsComplete(true);

      notify.success({
        title: 'Valor calculado',
        description: `Valor actual: $${depreciationMetrics.depreciatedValue.toFixed(2)}`
      });
    } catch (error) {
      notify.error({
        title: 'Error en cálculo',
        description: 'No se pudo calcular el valor actual'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [depreciationMetrics, setValue]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: keyof AssetFormData, value: any) => {
    setValue(field, value);

    // Auto-recalculate if purchase date or depreciation rate changes
    if (field === 'purchase_date' || field === 'depreciation_rate' || field === 'purchase_price') {
      setTimeout(() => {
        if (watchedValues.current_value === undefined || watchedValues.current_value === 0) {
          handleCalculateCurrentValue();
        }
      }, 100);
    }
  }, [setValue, handleCalculateCurrentValue, watchedValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (formData: AssetFormData) => {
    try {
      // Stage 1: Validate
      setIsValidating(true);
      setValidationPassed(false);
      setCalculationsComplete(false);
      setAssetSaved(false);

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

      // Verify price decline if current_value is provided
      if (formData.current_value && formData.purchase_price) {
        if (!validatePriceDecline(formData.purchase_price, formData.current_value)) {
          notify.warning({
            title: 'Advertencia de valor',
            description: 'El valor actual es mayor al precio de compra'
          });
        }
      }

      setCalculationsComplete(true);
      setIsCalculating(false);

      // Stage 3: Save
      setIsSaving(true);

      // Process data (trim strings, ensure numbers)
      const processedData: AssetFormData = {
        ...formData,
        name: formData.name.trim(),
        serial_number: formData.serial_number?.trim() || '',
        description: formData.description.trim(),
        purchase_price: Number(formData.purchase_price),
        current_value: formData.current_value ? Number(formData.current_value) : undefined,
        depreciation_rate: formData.depreciation_rate ? Number(formData.depreciation_rate) : undefined
      };

      await onSubmit(processedData);

      setAssetSaved(true);
      setIsSaving(false);

      notify.success({
        title: isEditMode ? 'Activo actualizado' : 'Activo creado',
        description: formData.name
      });

      onSuccess?.();

    } catch (error) {
      setIsSaving(false);
      notify.error({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      });
    }
  }, [isEditMode, validateForm, validatePriceDecline, onSubmit, onSuccess]);

  // Computed values for UI
  const modalTitle = useMemo(() => {
    if (isEditMode) {
      return `Editar Activo: ${asset?.name || ''}`;
    }
    return 'Nuevo Activo';
  }, [isEditMode, asset]);

  const submitButtonContent = useMemo(() => {
    if (isSaving) return 'Guardando activo...';
    if (isCalculating) return 'Calculando depreciación...';
    if (isValidating) return 'Validando...';
    return isEditMode ? 'Actualizar Activo' : 'Crear Activo';
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

    if (watchedValues.status === 'retired' || watchedValues.status === 'disposed') {
      return {
        text: 'Activo inactivo',
        color: 'warning' as const
      };
    }

    if (depreciationMetrics.depreciationPercentage > 80) {
      return {
        text: 'Altamente depreciado',
        color: 'warning' as const
      };
    }

    return {
      text: 'Listo',
      color: 'success' as const
    };
  }, [validationState, watchedValues.status, depreciationMetrics]);

  const operationProgress = useMemo(() => {
    if (assetSaved) return 100;
    if (isSaving) return 80;
    if (calculationsComplete) return 60;
    if (validationPassed) return 40;
    if (isCalculating) return 30;
    if (isValidating) return 20;
    return 0;
  }, [isValidating, isCalculating, validationPassed, calculationsComplete, isSaving, assetSaved]);

  const assetHealthBadge = useMemo(() => {
    const depreciation = depreciationMetrics.depreciationPercentage;
    const age = depreciationMetrics.currentAge;

    if (depreciation < 30 && age < 2) {
      return { text: 'Excelente estado', color: 'success' as const };
    }
    if (depreciation < 60 && age < 5) {
      return { text: 'Buen estado', color: 'info' as const };
    }
    if (depreciation < 80) {
      return { text: 'Estado regular', color: 'warning' as const };
    }
    return { text: 'Estado crítico', color: 'error' as const };
  }, [depreciationMetrics]);

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
    assetSaved,

    // Depreciation metrics
    depreciationMetrics,

    // Computed UI values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    assetHealthBadge,

    // Handlers
    handleFieldChange,
    handleSubmit,
    handleCalculateCurrentValue,

    // Helpers
    validateSerialNumberUnique,
    validatePriceDecline
  };
}

export default useAssetForm;
