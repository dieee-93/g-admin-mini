/**
 * Sale Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useFiscalDocumentValidation.ts / useEmployeeValidation.ts
 *
 * FEATURES:
 * - Stock validation with MaterialsStore integration
 * - Cart items validation (array)
 * - Auto-calculation of totals + IVA
 * - Payment method validation
 * - Delivery requirements validation
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SaleFormData } from '@/lib/validation/zod/CommonSchemas';
import { useMaterialsStore } from '@/store/materialsStore';
import { useShallow } from 'zustand/react/shallow';
import { taxService } from '@/pages/admin/operations/sales/services/taxCalculationService';
import type { TaxCalculationResult } from '@/pages/admin/operations/sales/services/taxCalculationService';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
  enableStockValidation?: boolean;
  enableAutoCalculation?: boolean;
}

interface StockValidationResult {
  valid: boolean;
  message?: string;
  available?: number;
}

interface CartStockValidationResult {
  valid: boolean;
  insufficient: Array<{
    product_id: string;
    requested: number;
    available: number;
  }>;
}

interface UseSaleValidationResult {
  form: UseFormReturn<SaleFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof SaleFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation functions
  validateStockAvailability: (productId: string, quantity: number) => StockValidationResult;
  validateCartStock: (items: SaleFormData['items']) => CartStockValidationResult;
  calculateTax: (subtotal: number, items: SaleFormData['items']) => TaxCalculationResult;
  validateTotals: (data: SaleFormData) => string | null;
  validateDeliveryRequirements: (data: SaleFormData) => string | null;

  // Auto-calculation helpers
  recalculateTotals: () => void;
  addItemToCart: (productId: string, quantity: number, unitPrice: number) => void;
  removeItemFromCart: (index: number) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
}

interface Sale {
  id?: string;
  order_type: string;
  customer_id?: string;
  [key: string]: any;
}

export function useSaleValidation(
  initialData: Partial<SaleFormData> = {},
  existingSales: Sale[] = [],
  currentSaleId?: string,
  options: ValidationOptions = {}
): UseSaleValidationResult {

  const {
    enableRealTime = true,
    enableStockValidation = true,
    enableAutoCalculation = true
  } = options;

  // Get materials from store for stock validation
  const { items: materials } = useMaterialsStore(
    useShallow(state => ({ items: state.items }))
  );

  // React Hook Form with Zod validation
  const form = useForm<SaleFormData>({
    resolver: zodResolver(EntitySchemas.sale),
    defaultValues: {
      order_type: 'dine_in',
      payment_method: 'cash',
      subtotal: 0,
      tax_amount: 0,
      total: 0,
      items: [],
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate stock availability for a single product
   */
  const validateStockAvailability = useCallback((
    productId: string,
    quantity: number
  ): StockValidationResult => {
    if (!enableStockValidation) {
      return { valid: true };
    }

    const material = materials.find(m => m.id === productId);

    if (!material) {
      return {
        valid: false,
        message: 'Producto no encontrado',
        available: 0
      };
    }

    const available = material.stock || 0;

    if (available < quantity) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${available}`,
        available
      };
    }

    return { valid: true, available };
  }, [materials, enableStockValidation]);

  /**
   * Validate stock for all items in the cart
   */
  const validateCartStock = useCallback((
    items: SaleFormData['items']
  ): CartStockValidationResult => {
    if (!enableStockValidation) {
      return { valid: true, insufficient: [] };
    }

    const insufficient = [];

    for (const item of items) {
      const result = validateStockAvailability(item.product_id, item.quantity);

      if (!result.valid) {
        insufficient.push({
          product_id: item.product_id,
          requested: item.quantity,
          available: result.available || 0
        });
      }
    }

    return {
      valid: insufficient.length === 0,
      insufficient
    };
  }, [validateStockAvailability, enableStockValidation]);

  /**
   * Calculate taxes using taxService
   */
  const calculateTax = useCallback((
    subtotal: number,
    items: SaleFormData['items']
  ): TaxCalculationResult => {
    // Convert items to taxService format
    const taxItems = items.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price
    }));

    return taxService.calculateTaxesForItems(taxItems);
  }, []);

  /**
   * Validate totals match (subtotal + tax = total)
   */
  const validateTotals = useCallback((data: SaleFormData): string | null => {
    const { subtotal, tax_amount, total, items } = data;

    // Validate items subtotal matches document subtotal
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

    if (Math.abs(itemsSubtotal - subtotal) > 0.01) {
      return `El subtotal (${subtotal}) no coincide con la suma de los ítems (${itemsSubtotal.toFixed(2)})`;
    }

    // Validate total calculation
    const calculatedTotal = subtotal + tax_amount;

    if (Math.abs(calculatedTotal - total) > 0.01) {
      return `El total (${total}) no coincide con subtotal + IVA (${calculatedTotal.toFixed(2)})`;
    }

    return null;
  }, []);

  /**
   * Validate delivery requirements
   */
  const validateDeliveryRequirements = useCallback((
    data: SaleFormData
  ): string | null => {
    if (data.order_type === 'delivery' && !data.customer_id) {
      return 'Delivery requiere seleccionar un cliente con dirección';
    }

    return null;
  }, []);

  // ========================================================================
  // AUTO-CALCULATION HELPERS
  // ========================================================================

  /**
   * Recalculate totals based on current items
   */
  const recalculateTotals = useCallback(() => {
    if (!enableAutoCalculation) return;

    const items = form.getValues('items');

    if (!items || items.length === 0) {
      form.setValue('subtotal', 0);
      form.setValue('tax_amount', 0);
      form.setValue('total', 0);
      return;
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

    // Calculate tax
    const taxResult = calculateTax(subtotal, items);

    // Update form values
    form.setValue('subtotal', subtotal);
    form.setValue('tax_amount', taxResult.totalTaxes);
    form.setValue('total', taxResult.totalAmount);
  }, [form, calculateTax, enableAutoCalculation]);

  /**
   * Add item to cart
   */
  const addItemToCart = useCallback((
    productId: string,
    quantity: number,
    unitPrice: number
  ) => {
    const currentItems = form.getValues('items') || [];
    const lineTotal = quantity * unitPrice;

    const newItem = {
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    };

    form.setValue('items', [...currentItems, newItem]);

    if (enableAutoCalculation) {
      recalculateTotals();
    }
  }, [form, recalculateTotals, enableAutoCalculation]);

  /**
   * Remove item from cart
   */
  const removeItemFromCart = useCallback((index: number) => {
    const currentItems = form.getValues('items') || [];
    const newItems = currentItems.filter((_, i) => i !== index);

    form.setValue('items', newItems);

    if (enableAutoCalculation) {
      recalculateTotals();
    }
  }, [form, recalculateTotals, enableAutoCalculation]);

  /**
   * Update item quantity
   */
  const updateItemQuantity = useCallback((index: number, quantity: number) => {
    const currentItems = form.getValues('items') || [];

    if (currentItems[index]) {
      const unitPrice = currentItems[index].unit_price;
      currentItems[index].quantity = quantity;
      currentItems[index].line_total = quantity * unitPrice;

      form.setValue('items', [...currentItems]);

      if (enableAutoCalculation) {
        recalculateTotals();
      }
    }
  }, [form, recalculateTotals, enableAutoCalculation]);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof SaleFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning: Total muy alto
    if (formData.total > 100000) {
      warnings.total = 'Total muy alto, verifica el importe';
    }

    // Warning: Items con stock bajo
    if (enableStockValidation) {
      formData.items.forEach((item, idx) => {
        const stockCheck = validateStockAvailability(item.product_id, item.quantity);
        if (stockCheck.valid && stockCheck.available !== undefined && stockCheck.available < 10) {
          warnings[`items.${idx}`] = `Stock bajo: ${stockCheck.available} unidades`;
        }
      });
    }

    // Warning: Delivery sin customer
    if (formData.order_type === 'delivery' && !formData.customer_id) {
      warnings.customer_id = 'Delivery requiere un cliente';
    }

    // Warning: Sin items en carrito
    if (formData.items.length === 0) {
      warnings.items = 'El carrito está vacío';
    }

    return warnings;
  }, [form.watch, validateStockAvailability, enableStockValidation]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof SaleFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    // First run Zod validation
    const isZodValid = await form.trigger();

    if (!isZodValid) {
      return false;
    }

    const formData = form.getValues();

    // Validate stock
    if (enableStockValidation) {
      const stockResult = validateCartStock(formData.items);

      if (!stockResult.valid) {
        form.setError('items', {
          type: 'custom',
          message: `Stock insuficiente en ${stockResult.insufficient.length} producto(s)`
        });
        return false;
      }
    }

    // Validate totals
    const totalsError = validateTotals(formData);
    if (totalsError) {
      form.setError('total', {
        type: 'custom',
        message: totalsError
      });
      return false;
    }

    // Validate delivery requirements
    const deliveryError = validateDeliveryRequirements(formData);
    if (deliveryError) {
      form.setError('customer_id', {
        type: 'custom',
        message: deliveryError
      });
      return false;
    }

    return true;
  }, [form, validateCartStock, validateTotals, validateDeliveryRequirements, enableStockValidation]);

  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // ========================================================================
  // AUTO-RECALCULATION EFFECT
  // ========================================================================

  useEffect(() => {
    if (enableAutoCalculation) {
      const subscription = form.watch((value, { name }) => {
        // Recalculate when items change
        if (name?.startsWith('items')) {
          recalculateTotals();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [form, recalculateTotals, enableAutoCalculation]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,

    // Business logic validators
    validateStockAvailability,
    validateCartStock,
    calculateTax,
    validateTotals,
    validateDeliveryRequirements,

    // Auto-calculation helpers
    recalculateTotals,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity
  };
}

/**
 * HOOK FEATURES SUMMARY:
 *
 * ✅ Zod Schema Validation: Uses EntitySchemas.sale
 * ✅ React Hook Form: Full integration with RHF
 * ✅ Stock Validation: Integrates with MaterialsStore via useShallow
 * ✅ Cart Validation: Validates array of items
 * ✅ Auto-Calculation: Recalculates totals when items change
 * ✅ Tax Calculation: Uses taxService for IVA
 * ✅ Field Warnings: Stock bajo, total alto, delivery requirements
 * ✅ Business Logic: Separate validators for stock, totals, delivery
 * ✅ Helper Functions: addItem, removeItem, updateQuantity
 *
 * USAGE EXAMPLE:
 *
 * const {
 *   form,
 *   fieldErrors,
 *   fieldWarnings,
 *   validateForm,
 *   addItemToCart,
 *   validateStockAvailability
 * } = useSaleValidation();
 *
 * // Add item to cart
 * addItemToCart('product-123', 5, 100.50);
 *
 * // Validate before submit
 * const isValid = await validateForm();
 * if (isValid) {
 *   const data = form.getValues();
 *   await createSale(data);
 * }
 */
