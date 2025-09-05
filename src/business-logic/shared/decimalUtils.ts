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
    return dec.toExponential(significantDigits);
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
}