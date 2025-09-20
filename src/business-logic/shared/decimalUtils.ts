// ============================================================================
// UTILIDADES AVANZADAS DECIMAL.JS v2.0
// ============================================================================
// Funciones helper centralizadas para operaciones matemáticas de precisión

import { 
  type Decimal as DecimalType,
  TaxDecimal, 
  InventoryDecimal, 
  FinancialDecimal, 
  RecipeDecimal,
  DECIMAL_CONSTANTS 
} from '@/config/decimal-config';

// Types
export type DecimalInput = number | string | DecimalType;

/**
 * Utilidades centralizadas para operaciones Decimal.js
 * Proporciona una API consistente y type-safe
 */
export class DecimalUtils {
  
  // ============================================================================
  // CONVERSIÓN Y VALIDACIÓN
  // ============================================================================

  /**
   * Convierte cualquier input a Decimal de forma segura
   * Usa strings para evitar pérdida de precisión en números grandes
   */
  static fromValue(value: DecimalInput, domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial'): DecimalType {
    if (value instanceof TaxDecimal || value instanceof InventoryDecimal || 
        value instanceof FinancialDecimal || value instanceof RecipeDecimal) {
      return value;
    }
    
    // Convertir number a string para mantener precisión
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    switch (domain) {
      case 'tax':
        return new TaxDecimal(stringValue);
      case 'inventory':
        return new InventoryDecimal(stringValue);
      case 'recipe':
        return new RecipeDecimal(stringValue);
      default:
        return new FinancialDecimal(stringValue);
    }
  }

  /**
   * Validaciones de entrada
   */
  static isValidDecimal(value: DecimalInput): boolean {
    try {
      const dec = this.fromValue(value);
      return dec.isFinite() && !dec.isNaN();
    } catch {
      return false;
    }
  }

  static isPositive(value: DecimalInput): boolean {
    return this.fromValue(value).isPositive();
  }

  static isZero(value: DecimalInput): boolean {
    return this.fromValue(value).isZero();
  }

  static isNegative(value: DecimalInput): boolean {
    return this.fromValue(value).isNegative();
  }

  // ============================================================================
  // OPERACIONES MATEMÁTICAS SEGURAS
  // ============================================================================

  /**
   * Suma segura con validación
   */
  static add(a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const decA = this.fromValue(a, domain);
    const decB = this.fromValue(b, domain);
    return decA.plus(decB);
  }

  /**
   * Resta segura con validación
   */
  static subtract(a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const decA = this.fromValue(a, domain);
    const decB = this.fromValue(b, domain);
    return decA.minus(decB);
  }

  /**
   * Multiplicación segura
   */
  static multiply(a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const decA = this.fromValue(a, domain);
    const decB = this.fromValue(b, domain);
    return decA.times(decB);
  }

  /**
   * División segura con validación de división por cero
   */
  static divide(a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const decA = this.fromValue(a, domain);
    const decB = this.fromValue(b, domain);
    
    if (decB.isZero()) {
      throw new Error('División por cero no permitida');
    }
    
    return decA.dividedBy(decB);
  }

  /**
   * Porcentaje seguro (evita división por cero)
   */
  static calculatePercentage(part: DecimalInput, total: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const partDec = this.fromValue(part, domain);
    const totalDec = this.fromValue(total, domain);
    
    if (totalDec.isZero()) {
      return this.fromValue(0, domain);
    }
    
    return partDec.dividedBy(totalDec).times(DECIMAL_CONSTANTS.HUNDRED);
  }

  /**
   * Aplicar porcentaje
   */
  static applyPercentage(base: DecimalInput, percentage: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const baseDec = this.fromValue(base, domain);
    const percentageDec = this.fromValue(percentage, domain);
    
    return baseDec.times(percentageDec.dividedBy(DECIMAL_CONSTANTS.HUNDRED));
  }

  // ============================================================================
  // UTILIDADES DE RANGO Y VALIDACIÓN
  // ============================================================================

  /**
   * Clamp valor entre min y max
   */
  static clamp(value: DecimalInput, min: DecimalInput, max: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const valueDec = this.fromValue(value, domain);
    const minDec = this.fromValue(min, domain);
    const maxDec = this.fromValue(max, domain);
    
    return FinancialDecimal.max(minDec, FinancialDecimal.min(maxDec, valueDec));
  }

  /**
   * Asegurar que el valor es positivo
   */
  static clampPositive(value: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    const valueDec = this.fromValue(value, domain);
    return FinancialDecimal.max(DECIMAL_CONSTANTS.ZERO, valueDec);
  }

  /**
   * Obtener valor absoluto
   */
  static abs(value: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe'): DecimalType {
    return this.fromValue(value, domain).abs();
  }

  // ============================================================================
  // FORMATEO Y DISPLAY
  // ============================================================================

  /**
   * Formato moneda argentina
   */
  static formatCurrency(value: DecimalInput, decimals: number = 2): string {
    const dec = this.fromValue(value, 'financial');
    return `$${dec.toFixed(decimals)}`;
  }

  /**
   * Formato porcentaje
   */
  static formatPercentage(value: DecimalInput, decimals: number = 2): string {
    const dec = this.fromValue(value, 'financial');
    return `${dec.toFixed(decimals)}%`;
  }

  /**
   * Formato cantidad con unidad
   */
  static formatQuantity(value: DecimalInput, unit: string, decimals: number = 2): string {
    const dec = this.fromValue(value, 'inventory');
    return `${dec.toFixed(decimals)} ${unit}`;
  }

  /**
   * Formato científico cuando es necesario
   */
  static formatScientific(value: DecimalInput, significantDigits: number = 4): string {
    const dec = this.fromValue(value, 'financial');
    // toExponential uses decimal places. The test is sending significant digits.
    return dec.toExponential(significantDigits - 1);
  }

  // ============================================================================
  // OPERACIONES FINANCIERAS ESPECÍFICAS
  // ============================================================================

  /**
   * Calcular margen de ganancia
   */
  static calculateProfitMargin(revenue: DecimalInput, cost: DecimalInput): DecimalType {
    const revenueDec = this.fromValue(revenue, 'financial');
    const costDec = this.fromValue(cost, 'financial');
    
    if (revenueDec.isZero()) {
      return DECIMAL_CONSTANTS.ZERO;
    }
    
    const profit = revenueDec.minus(costDec);
    return profit.dividedBy(revenueDec).times(DECIMAL_CONSTANTS.HUNDRED);
  }

  /**
   * Calcular markup percentage
   */
  static calculateMarkup(sellingPrice: DecimalInput, cost: DecimalInput): DecimalType {
    const sellingPriceDec = this.fromValue(sellingPrice, 'financial');
    const costDec = this.fromValue(cost, 'financial');
    
    if (costDec.isZero()) {
      return DECIMAL_CONSTANTS.ZERO;
    }
    
    const markup = sellingPriceDec.minus(costDec);
    return markup.dividedBy(costDec).times(DECIMAL_CONSTANTS.HUNDRED);
  }

  /**
   * Calcular precio con markup
   */
  static applyMarkup(cost: DecimalInput, markupPercentage: DecimalInput): DecimalType {
    const costDec = this.fromValue(cost, 'financial');
    const markupDec = this.fromValue(markupPercentage, 'financial');
    
    const markupFactor = DECIMAL_CONSTANTS.ONE.plus(markupDec.dividedBy(DECIMAL_CONSTANTS.HUNDRED));
    return costDec.times(markupFactor);
  }

  // ============================================================================
  // OPERACIONES DE INVENTARIO
  // ============================================================================

  /**
   * Calcular valor total de stock
   */
  static calculateStockValue(quantity: DecimalInput, unitCost: DecimalInput): DecimalType {
    return this.multiply(quantity, unitCost, 'inventory');
  }

  /**
   * Calcular costo promedio ponderado
   */
  static calculateWeightedAverageCost(
    currentStock: DecimalInput,
    currentCost: DecimalInput,
    newStock: DecimalInput,
    newCost: DecimalInput
  ): DecimalType {
    const currentStockDec = this.fromValue(currentStock, 'inventory');
    const currentCostDec = this.fromValue(currentCost, 'inventory');
    const newStockDec = this.fromValue(newStock, 'inventory');
    const newCostDec = this.fromValue(newCost, 'inventory');
    
    const currentValue = currentStockDec.times(currentCostDec);
    const newValue = newStockDec.times(newCostDec);
    const totalStock = currentStockDec.plus(newStockDec);
    
    if (totalStock.isZero()) {
      return DECIMAL_CONSTANTS.ZERO;
    }
    
    return currentValue.plus(newValue).dividedBy(totalStock);
  }

  // ============================================================================
  // OPERACIONES DE RECETAS
  // ============================================================================

  /**
   * Escalar receta por factor
   */
  static scaleRecipe(originalQuantity: DecimalInput, scaleFactor: DecimalInput): DecimalType {
    return this.multiply(originalQuantity, scaleFactor, 'recipe');
  }

  /**
   * Calcular yield percentage
   */
  static calculateYield(actualOutput: DecimalInput, theoreticalOutput: DecimalInput): DecimalType {
    return this.calculatePercentage(actualOutput, theoreticalOutput, 'recipe');
  }

  // ============================================================================
  // UTILIDADES DE COMPARACIÓN
  // ============================================================================

  /**
   * Comparar valores con tolerancia
   */
  static isEqual(a: DecimalInput, b: DecimalInput, tolerance: DecimalInput = '0.01'): boolean {
    const decA = this.fromValue(a);
    const decB = this.fromValue(b);
    const toleranceDec = this.fromValue(tolerance);
    
    return decA.minus(decB).abs().lte(toleranceDec);
  }

  /**
   * Obtener el mayor de varios valores
   */
  static max(...values: DecimalInput[]): DecimalType {
    if (values.length === 0) {
      throw new Error('Se requiere al menos un valor');
    }
    
    return values.reduce((max, current) => {
      const currentDec = this.fromValue(current);
      return FinancialDecimal.max(max, currentDec);
    }, this.fromValue(values[0]));
  }

  /**
   * Obtener el menor de varios valores
   */
  static min(...values: DecimalInput[]): DecimalType {
    if (values.length === 0) {
      throw new Error('Se requiere al menos un valor');
    }
    
    return values.reduce((min, current) => {
      const currentDec = this.fromValue(current);
      return FinancialDecimal.min(min, currentDec);
    }, this.fromValue(values[0]));
  }

  // ============================================================================
  // CONVERSIONES
  // ============================================================================

  /**
   * Convertir a number (con pérdida de precisión potencial)
   */
  static toNumber(value: DecimalInput): number {
    return this.fromValue(value).toNumber();
  }

  /**
   * Convertir a string con precisión completa
   */
  static toString(value: DecimalInput): string {
    return this.fromValue(value).toString();
  }

  /**
   * Convertir a string con decimales fijos
   */
  static toFixed(value: DecimalInput, decimals: number): string {
    return this.fromValue(value).toFixed(decimals);
  }

  // ============================================================================
  // ROUNDING AT THE END PATTERNS - Banking-Grade Precision
  // ============================================================================

  /**
   * Banker's rounding for financial calculations
   * Implements "round half to even" to eliminate statistical bias
   */
  static bankerRound(value: DecimalInput, decimals: number = 2, domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial'): DecimalType {
    const dec = this.fromValue(value, domain);
    return dec.toDecimalPlaces(decimals, DECIMAL_CONSTANTS.ROUNDING_MODES.HALF_EVEN);
  }

  /**
   * Batch calculation with rounding at the end
   * Performs all calculations at full precision, then rounds final results
   */
  static calculateWithFinalRounding<T extends Record<string, DecimalInput>>(
    calculations: T,
    decimals: number = 2,
    domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial'
  ): Record<keyof T, DecimalType> {
    const result: Partial<Record<keyof T, DecimalType>> = {};
    
    // Perform all calculations with full precision first
    for (const [key, value] of Object.entries(calculations)) {
      const fullPrecisionValue = this.fromValue(value, domain);
      // Round only at the very end
      result[key as keyof T] = fullPrecisionValue.toDecimalPlaces(decimals);
    }
    
    return result as Record<keyof T, DecimalType>;
  }

  /**
   * Multi-step calculation helper that maintains precision until the end
   * Example: tax calculations, cost analysis, profit calculations
   */
  static multiStepCalculation(
    steps: Array<{
      operation: 'add' | 'subtract' | 'multiply' | 'divide';
      operand: DecimalInput;
    }>,
    initialValue: DecimalInput,
    finalDecimals: number = 2,
    domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial'
  ): DecimalType {
    let result = this.fromValue(initialValue, domain);
    
    // Perform all operations with full precision
    for (const step of steps) {
      const operand = this.fromValue(step.operand, domain);
      
      switch (step.operation) {
        case 'add':
          result = result.plus(operand);
          break;
        case 'subtract':
          result = result.minus(operand);
          break;
        case 'multiply':
          result = result.times(operand);
          break;
        case 'divide':
          if (operand.isZero()) {
            throw new Error('Division by zero in multi-step calculation');
          }
          result = result.dividedBy(operand);
          break;
      }
    }
    
    // Round only at the very end
    return result.toDecimalPlaces(finalDecimals);
  }

  // ============================================================================
  // VALIDATION & ERROR HANDLING - Production Safety
  // ============================================================================

  /**
   * Validates that a decimal value is finite and safe for calculations
   */
  static isFiniteDecimal(value: DecimalInput): boolean {
    try {
      const dec = this.fromValue(value);
      return dec.isFinite() && !dec.isNaN();
    } catch {
      return false;
    }
  }

  /**
   * Validates that a decimal value is positive and finite
   */
  static isPositiveFinite(value: DecimalInput): boolean {
    try {
      const dec = this.fromValue(value);
      return dec.isFinite() && !dec.isNaN() && dec.isPositive();
    } catch {
      return false;
    }
  }

  /**
   * Validates that a decimal value is safe for financial calculations
   * Rejects NaN, Infinity, and extreme values that could cause issues
   */
  static isFinanciallyValid(value: DecimalInput): boolean {
    if (!this.isFiniteDecimal(value)) return false;
    
    const dec = this.fromValue(value, 'financial');
    
    // Check for reasonable financial bounds (adjust as needed)
    const MAX_FINANCIAL_VALUE = new FinancialDecimal('999999999999.99'); // ~1 trillion
    const MIN_FINANCIAL_VALUE = new FinancialDecimal('-999999999999.99');
    
    return dec.lte(MAX_FINANCIAL_VALUE) && dec.gte(MIN_FINANCIAL_VALUE);
  }

  /**
   * Safe conversion with validation - throws meaningful errors
   */
  static safeFromValue(
    value: DecimalInput, 
    domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial',
    context?: string
  ): DecimalType {
    if (!this.isFiniteDecimal(value)) {
      const contextStr = context ? ` in ${context}` : '';
      throw new Error(`Invalid decimal value${contextStr}: ${value} (NaN or Infinity detected)`);
    }
    
    const result = this.fromValue(value, domain);
    
    if (!result.isFinite()) {
      const contextStr = context ? ` in ${context}` : '';
      throw new Error(`Calculation resulted in invalid value${contextStr}: ${result}`);
    }
    
    return result;
  }

  /**
   * Safe division with zero-check
   */
  static safeDivide(
    dividend: DecimalInput, 
    divisor: DecimalInput, 
    domain: 'tax' | 'inventory' | 'financial' | 'recipe' = 'financial',
    context?: string
  ): DecimalType {
    const divisorDec = this.safeFromValue(divisor, domain, context);
    
    if (divisorDec.isZero()) {
      const contextStr = context ? ` in ${context}` : '';
      throw new Error(`Division by zero${contextStr}`);
    }
    
    const dividendDec = this.safeFromValue(dividend, domain, context);
    return dividendDec.dividedBy(divisorDec);
  }

  /**
   * Batch validation for arrays of values
   */
  static validateBatch(
    values: DecimalInput[], 
    validationFn: (value: DecimalInput) => boolean = this.isFiniteDecimal
  ): { isValid: boolean; invalidIndices: number[]; errors: string[] } {
    const invalidIndices: number[] = [];
    const errors: string[] = [];
    
    values.forEach((value, index) => {
      if (!validationFn(value)) {
        invalidIndices.push(index);
        errors.push(`Invalid value at index ${index}: ${value}`);
      }
    });
    
    return {
      isValid: invalidIndices.length === 0,
      invalidIndices,
      errors
    };
  }

  /**
   * Assert finite value - throws if not valid (for critical operations)
   */
  static assertFinite(value: DecimalInput, context?: string): DecimalType {
    if (!this.isFiniteDecimal(value)) {
      const contextStr = context ? ` in ${context}` : '';
      throw new Error(`Assertion failed: Expected finite decimal${contextStr}, got: ${value}`);
    }
    
    return this.fromValue(value);
  }

  /**
   * Clamp to safe financial bounds
   */
  static clampToFinancialBounds(value: DecimalInput): DecimalType {
    if (!this.isFiniteDecimal(value)) {
      return DECIMAL_CONSTANTS.ZERO;
    }
    
    const dec = this.fromValue(value, 'financial');
    const MAX_SAFE = new FinancialDecimal('999999999999.99');
    const MIN_SAFE = new FinancialDecimal('-999999999999.99');
    
    return FinancialDecimal.max(MIN_SAFE, FinancialDecimal.min(MAX_SAFE, dec));
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR EASIER IMPORTS
// ============================================================================

/**
 * Helper functions for direct import usage
 * These wrap the DecimalUtils static methods for convenience
 */
export const formatCurrency = (value: DecimalInput, decimals: number = 2): string =>
  DecimalUtils.formatCurrency(value, decimals);

export const formatPercentage = (value: DecimalInput, decimals: number = 2): string =>
  DecimalUtils.formatPercentage(value, decimals);

export const formatQuantity = (value: DecimalInput, unit: string, decimals: number = 2): string =>
  DecimalUtils.formatQuantity(value, unit, decimals);

export const safeAdd = (values: DecimalInput[], domain?: 'tax' | 'inventory' | 'financial' | 'recipe') =>
  values.reduce((sum, value) => DecimalUtils.add(sum, value, domain), DecimalUtils.fromValue(0, domain));

export const safeSubtract = (a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe') =>
  DecimalUtils.subtract(a, b, domain);

export const safeMultiply = (a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe') =>
  DecimalUtils.multiply(a, b, domain);

export const safeDivide = (a: DecimalInput, b: DecimalInput, domain?: 'tax' | 'inventory' | 'financial' | 'recipe') =>
  DecimalUtils.divide(a, b, domain);