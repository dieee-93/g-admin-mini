/**
 * Supplier Order Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useSupplierOrderValidation } from '@/hooks/useSupplierOrderValidation';
import type { SupplierOrderFormData } from '@/lib/validation/zod/CommonSchemas';

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'received' | 'cancelled';
  payment_terms?: 'cash' | 'credit_7' | 'credit_15' | 'credit_30' | 'credit_60';
  notes: string;
  items: Array<{
    material_id: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

interface UseSupplierOrderFormOptions {
  order?: SupplierOrder;
  onSuccess?: () => void;
  onSubmit: (data: SupplierOrderFormData) => Promise<void>;
}

interface OrderMetrics {
  totalAmount: number;
  itemsCount: number;
  averageItemPrice: number;
  daysUntilDelivery: number | null;
  deliveryUrgency: 'urgent' | 'normal' | 'flexible';
  orderComplexity: 'simple' | 'medium' | 'complex';
}

export function useSupplierOrderForm({
  order,
  onSuccess,
  onSubmit
}: UseSupplierOrderFormOptions) {

  // ===== MODO =====
  const isEditMode = !!order;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [metricsCalculated, setMetricsCalculated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    calculateOrderTotal,
    validateDeliveryDate
  } = useSupplierOrderValidation(
    {
      supplier_id: order?.supplier_id || '',
      order_date: order?.order_date || new Date().toISOString().split('T')[0],
      expected_delivery_date: order?.expected_delivery_date || '',
      status: order?.status || 'pending',
      payment_terms: order?.payment_terms,
      notes: order?.notes || '',
      items: order?.items || [{ material_id: '', quantity: 1, unit_price: 0, total: 0 }]
    }
  );

  const { watch, handleSubmit, control } = form;
  const formData = watch();

  // ===== ORDER METRICS CALCULATION =====
  const items = formData.items;
  const orderDate = formData.order_date;
  const expectedDeliveryDate = formData.expected_delivery_date;

  const orderMetrics: OrderMetrics = useMemo(() => {
    setIsCalculating(true);

    // Total amount
    const totalAmount = calculateOrderTotal(items);

    // Items count
    const itemsCount = items.length;

    // Average item price
    const averageItemPrice = itemsCount > 0
      ? totalAmount / itemsCount
      : 0;

    // Days until delivery
    let daysUntilDelivery: number | null = null;
    let deliveryUrgency: 'urgent' | 'normal' | 'flexible' = 'normal';

    if (orderDate && expectedDeliveryDate) {
      const orderDateObj = new Date(orderDate);
      const deliveryDateObj = new Date(expectedDeliveryDate);
      daysUntilDelivery = Math.ceil(
        (deliveryDateObj.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      deliveryUrgency =
        daysUntilDelivery <= 3 ? 'urgent' :
        daysUntilDelivery <= 7 ? 'normal' :
        'flexible';
    }

    // Order complexity
    const orderComplexity: 'simple' | 'medium' | 'complex' =
      itemsCount === 1 ? 'simple' :
      itemsCount <= 5 ? 'medium' :
      'complex';

    setTimeout(() => {
      setIsCalculating(false);
      setMetricsCalculated(true);
    }, 100);

    return {
      totalAmount,
      itemsCount,
      averageItemPrice,
      daysUntilDelivery,
      deliveryUrgency,
      orderComplexity
    };
  }, [items, orderDate, expectedDeliveryDate, calculateOrderTotal]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Orden de Compra' : 'Nueva Orden de Compra';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isCalculating) return 'Calculando totales...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (orderCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Orden' : 'Crear Orden';
  }, [isValidating, isCalculating, isSaving, orderCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.supplier_id || formData.items.length === 0) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.supplier_id, formData.items]);

  const operationProgress = useMemo(() => {
    if (orderCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, orderCreated]);

  const urgencyBadge = useMemo(() => {
    const { deliveryUrgency } = orderMetrics;

    if (deliveryUrgency === 'urgent') {
      return { text: 'Urgente', color: 'red' as const };
    }
    if (deliveryUrgency === 'normal') {
      return { text: 'Normal', color: 'blue' as const };
    }
    return { text: 'Flexible', color: 'green' as const };
  }, [orderMetrics]);

  const complexityBadge = useMemo(() => {
    const { orderComplexity } = orderMetrics;

    if (orderComplexity === 'complex') {
      return { text: 'Compleja', color: 'purple' as const };
    }
    if (orderComplexity === 'medium') {
      return { text: 'Media', color: 'blue' as const };
    }
    return { text: 'Simple', color: 'gray' as const };
  }, [orderMetrics]);

  // ===== AUTO-CALCULATE HELPERS =====
  const autoCalculateItemTotal = useCallback((quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
  }, []);

  const recalculateAllTotals = useCallback(() => {
    const items = formData.items;
    items.forEach((item, index) => {
      const total = autoCalculateItemTotal(item.quantity || 0, item.unit_price || 0);
      form.setValue(`items.${index}.total`, total);
    });
  }, [formData.items, autoCalculateItemTotal, form]);

  // ===== SUBMIT HANDLER =====
  const handleFormSubmit = useCallback(
    async (data: SupplierOrderFormData) => {
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
        setOrderCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setOrderCreated(false);
          setMetricsCalculated(false);
          onSuccess?.();
        }, 1500);

      } catch (error) {
        setIsValidating(false);
        setIsSaving(false);
        setValidationPassed(false);
        throw error;
      }
    },
    [validateForm, onSubmit, onSuccess]
  );

  // ===== RETURN API =====
  return {
    // Form
    form,
    handleSubmit, // Export handleSubmit from react-hook-form
    control, // Para useFieldArray
    formData,
    isEditMode,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // Order metrics
    orderMetrics,

    // Loading states
    isValidating,
    isSaving,
    isCalculating,

    // Success states
    validationPassed,
    orderCreated,
    metricsCalculated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    urgencyBadge,
    complexityBadge,

    // Helpers
    autoCalculateItemTotal,
    recalculateAllTotals,
    validateDeliveryDate,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
