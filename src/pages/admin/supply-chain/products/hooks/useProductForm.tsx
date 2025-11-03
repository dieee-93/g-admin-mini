/**
 * Product Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useProductValidation } from '@/hooks/useProductValidation';
import type { ProductFormData } from '@/lib/validation/zod/CommonSchemas';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  category: string;
  unit: string;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  is_active: boolean;
  tags?: string[];
}

interface UseProductFormOptions {
  product?: Product;
  existingProducts?: Product[];
  onSuccess?: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

interface ProductMetrics {
  hasStock: boolean;
  stockHealth: 'healthy' | 'low' | 'out';
  hasProfitMargin: boolean;
  profitMargin: number; // Percentage
  profitMarginHealth: 'excellent' | 'good' | 'fair' | 'poor';
  productRisk: 'low' | 'medium' | 'high';
}

export function useProductForm({
  product,
  existingProducts = [],
  onSuccess,
  onSubmit
}: UseProductFormOptions) {

  // ===== MODO =====
  const isEditMode = !!product;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [productCreated, setProductCreated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useProductValidation(
    {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      cost: product?.cost || 0,
      category: product?.category || '',
      unit: product?.unit || 'unidad',
      stock_quantity: product?.stock_quantity || 0,
      min_stock: product?.min_stock || 0,
      max_stock: product?.max_stock,
      is_active: product?.is_active ?? true,
      tags: product?.tags || []
    },
    existingProducts,
    product?.id
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== PRODUCT METRICS =====
  const productMetrics: ProductMetrics = useMemo(() => {
    setIsCalculating(true);

    const { price, cost, stock_quantity, min_stock } = formData;

    // Stock health
    const hasStock = (stock_quantity || 0) > 0;
    const stockHealth: 'healthy' | 'low' | 'out' =
      !hasStock ? 'out' :
      (stock_quantity || 0) <= (min_stock || 0) ? 'low' :
      'healthy';

    // Profit margin calculation
    const hasProfitMargin = !!(price && cost && cost > 0);
    const profitMargin = hasProfitMargin
      ? ((price - cost) / price) * 100
      : 0;

    const profitMarginHealth: 'excellent' | 'good' | 'fair' | 'poor' =
      profitMargin >= 50 ? 'excellent' :
      profitMargin >= 30 ? 'good' :
      profitMargin >= 15 ? 'fair' :
      'poor';

    // Product risk
    const productRisk: 'low' | 'medium' | 'high' =
      stockHealth === 'out' || profitMarginHealth === 'poor' ? 'high' :
      stockHealth === 'low' || profitMarginHealth === 'fair' ? 'medium' :
      'low';

    setTimeout(() => {
      setIsCalculating(false);
    }, 100);

    return {
      hasStock,
      stockHealth,
      hasProfitMargin,
      profitMargin,
      profitMarginHealth,
      productRisk
    };
  }, [formData.price, formData.cost, formData.stock_quantity, formData.min_stock]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Producto' : 'Nuevo Producto';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isCalculating) return 'Calculando márgenes...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (productCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Producto' : 'Crear Producto';
  }, [isValidating, isCalculating, isSaving, productCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.name || !formData.price) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.name, formData.price]);

  const operationProgress = useMemo(() => {
    if (productCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, productCreated]);

  const profitabilityBadge = useMemo(() => {
    const { profitMarginHealth } = productMetrics;

    if (profitMarginHealth === 'excellent') {
      return { text: 'Excelente Margen', color: 'green' as const };
    }
    if (profitMarginHealth === 'good') {
      return { text: 'Buen Margen', color: 'blue' as const };
    }
    if (profitMarginHealth === 'fair') {
      return { text: 'Margen Justo', color: 'yellow' as const };
    }
    return { text: 'Bajo Margen', color: 'red' as const };
  }, [productMetrics]);

  const stockBadge = useMemo(() => {
    const { stockHealth } = productMetrics;

    if (stockHealth === 'healthy') {
      return { text: 'Stock Normal', color: 'green' as const };
    }
    if (stockHealth === 'low') {
      return { text: 'Stock Bajo', color: 'yellow' as const };
    }
    return { text: 'Sin Stock', color: 'red' as const };
  }, [productMetrics]);

  // ===== AUTO-CALCULATE HELPERS =====
  const calculateProfitMargin = useCallback((price: number, cost: number): number => {
    if (!price || !cost || cost === 0) return 0;
    return ((price - cost) / price) * 100;
  }, []);

  const calculateSuggestedPrice = useCallback((cost: number, targetMargin: number = 30): number => {
    if (!cost || cost === 0) return 0;
    // targetMargin = (price - cost) / price * 100
    // price = cost / (1 - targetMargin/100)
    return cost / (1 - targetMargin / 100);
  }, []);

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
        setProductCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setProductCreated(false);
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

    // Product metrics
    productMetrics,

    // Loading states
    isValidating,
    isSaving,
    isCalculating,

    // Success states
    validationPassed,
    productCreated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    profitabilityBadge,
    stockBadge,

    // Helpers
    calculateProfitMargin,
    calculateSuggestedPrice,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
