// hooks/useSaleStockValidation.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SaleItem {
  product_id: string;
  quantity: number;
}

export interface StockValidationResult {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: Array<{
    product_id: string;
    product_name: string;
    required: number;
    available: number;
    missing: number;
  }>;
}

export function useSaleStockValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StockValidationResult | null>(null);

  const validateStock = useCallback(async (saleItems: SaleItem[]) => {
    if (!saleItems.length) {
      setValidationResult({ is_valid: true });
      return { is_valid: true };
    }

    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.rpc('validate_sale_stock', {
        items_array: saleItems
      });

      if (error) {
        console.error('Error validating stock:', error);
        const result = { 
          is_valid: false, 
          error_message: 'Error al validar stock. Intenta nuevamente.' 
        };
        setValidationResult(result);
        return result;
      }

      const result = data as StockValidationResult;
      setValidationResult(result);
      return result;
      
    } catch (error) {
      console.error('Unexpected error:', error);
      const result = { 
        is_valid: false, 
        error_message: 'Error inesperado al validar stock.' 
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateStock,
    clearValidation,
    isValidating,
    validationResult,
    hasValidation: validationResult !== null,
    isValid: validationResult?.is_valid ?? false
  };
}