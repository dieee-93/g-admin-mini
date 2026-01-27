/**
 * Supplier Order Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 *
 * Created: 2025-02-01
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SupplierOrderFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseSupplierOrderValidationResult {
  form: UseFormReturn<SupplierOrderFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof SupplierOrderFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Helpers
  calculateOrderTotal: (items: SupplierOrderFormData['items']) => number;
  validateDeliveryDate: (orderDate: string, deliveryDate: string) => boolean;
}

export function useSupplierOrderValidation(
  initialData: Partial<SupplierOrderFormData> = {},
  existingOrders: any[] = [],
  currentOrderId?: string,
  options: ValidationOptions = {}
): UseSupplierOrderValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<SupplierOrderFormData>({
    resolver: zodResolver(EntitySchemas.supplierOrder),
    defaultValues: {
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      status: 'pending',
      payment_terms: undefined,
      notes: '',
      items: [
        {
          material_id: '',
          quantity: 1,
          unit_price: 0,
          total: 0
        }
      ],
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ===== HELPERS =====
  const calculateOrderTotal = useCallback((items: SupplierOrderFormData['items']): number => {
    return items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
      return sum + itemTotal;
    }, 0);
  }, []);

  const validateDeliveryDate = useCallback((orderDate: string, deliveryDate: string): boolean => {
    if (!orderDate || !deliveryDate) return true;

    const order = new Date(orderDate);
    const delivery = new Date(deliveryDate);

    return delivery >= order;
  }, []);

  // ===== FIELD ERRORS =====
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof SupplierOrderFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    // Items errors
    if (formErrors.items) {
      errors.items = 'Hay errores en los items de la orden';
    }

    return errors;
  }, [form.formState.errors]);

  // ===== FIELD WARNINGS =====
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Calculate total
    const total = calculateOrderTotal(formData.items);

    // High value warning
    if (total > 100000) {
      warnings.total = `Orden de alto valor: $${total.toLocaleString('es-AR')}`;
    }

    // Delivery date warning
    if (formData.order_date && formData.expected_delivery_date) {
      const order = new Date(formData.order_date);
      const delivery = new Date(formData.expected_delivery_date);
      const daysDiff = Math.ceil((delivery.getTime() - order.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 3) {
        warnings.expected_delivery_date = `Entrega muy rápida (${daysDiff} días)`;
      }

      if (daysDiff > 60) {
        warnings.expected_delivery_date = `Entrega muy lejana (${daysDiff} días)`;
      }
    }

    // Empty items warning
    if (formData.items.length === 0) {
      warnings.items = 'La orden no tiene items';
    }

    // Single item warning
    if (formData.items.length === 1) {
      warnings.items = 'Orden con un solo item';
    }

    // Status warnings
    if (formData.status === 'cancelled') {
      warnings.status = 'Esta orden está cancelada';
    }

    // Payment terms warning
    if (!formData.payment_terms) {
      warnings.payment_terms = 'Términos de pago no especificados';
    }

    return warnings;
  }, [calculateOrderTotal]);

  // ===== VALIDATION STATE =====
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ===== VALIDATE FIELD =====
  const validateField = useCallback((field: keyof SupplierOrderFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  // ===== VALIDATE FORM =====
  const validateForm = useCallback(async (): Promise<boolean> => {
    return await form.trigger();
  }, [form]);

  // ===== CLEAR VALIDATION =====
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
    clearValidation,
    calculateOrderTotal,
    validateDeliveryDate
  };
}
