// ============================================================================
// TESTS AVANZADOS DECIMALUTILS - CASOS EXTREMOS Y PRECISIÓN
// ============================================================================

import { describe, it, expect } from 'vitest';
import { DecimalUtils } from '../decimalUtils';
import { TaxDecimal, InventoryDecimal, FinancialDecimal, RecipeDecimal } from '@/config/decimal-config';

describe('DecimalUtils - Advanced Precision Tests', () => {

  // ============================================================================
  // TESTS DE CONVERSIÓN Y VALIDACIÓN
  // ============================================================================

  describe('Conversión y Validación', () => {
    it('should handle string numbers with high precision', () => {
      const result = DecimalUtils.fromValue('123.456789012345678901234567890', 'financial');
      expect(result.toString()).toBe('123.456789012345678901234567890');
    });

    it('should preserve precision when converting numbers to strings', () => {
      const preciseNumber = 0.1 + 0.2; // JavaScript floating point error
      const result = DecimalUtils.fromValue(preciseNumber, 'financial');
      // Should NOT equal 0.30000000000000004
      expect(DecimalUtils.toFixed(result, 1)).toBe('0.3');
    });

    it('should validate complex decimal inputs', () => {
      expect(DecimalUtils.isValidDecimal('123.456')).toBe(true);
      expect(DecimalUtils.isValidDecimal('invalid')).toBe(false);
      expect(DecimalUtils.isValidDecimal(Infinity)).toBe(false);
      expect(DecimalUtils.isValidDecimal(NaN)).toBe(false);
    });
  });

  // ============================================================================
  // TESTS DE OPERACIONES FINANCIERAS COMPLEJAS
  // ============================================================================

  describe('Operaciones Financieras Avanzadas', () => {
    it('should handle complex tax calculations without precision loss', () => {
      // Escenario: Facturación con IVA 21% + Ingresos Brutos 3% + múltiples descuentos
      const baseAmount = DecimalUtils.fromValue('1234.5678901234567890', 'tax');
      const ivaRate = DecimalUtils.fromValue('0.21', 'tax');
      const ingresosBrutosRate = DecimalUtils.fromValue('0.03', 'tax');
      
      // Aplicar IVA
      const ivaAmount = DecimalUtils.applyPercentage(baseAmount, DecimalUtils.multiply(ivaRate, 100, 'tax'), 'tax');
      
      // Aplicar Ingresos Brutos
      const ingresosBrutosAmount = DecimalUtils.applyPercentage(baseAmount, DecimalUtils.multiply(ingresosBrutosRate, 100, 'tax'), 'tax');
      
      // Total con impuestos
      const totalWithTaxes = DecimalUtils.add(
        DecimalUtils.add(baseAmount, ivaAmount, 'tax'),
        ingresosBrutosAmount,
        'tax'
      );

      // Verificar que la suma sea precisa
      const expectedTotal = DecimalUtils.fromValue('1529.6641777530863325', 'tax');
      expect(DecimalUtils.isEqual(totalWithTaxes, expectedTotal, '0.0000000001')).toBe(true);
    });

    it('should calculate profit margins with extreme precision', () => {
      // Casos de margen muy bajo
      const revenue = DecimalUtils.fromValue('100.000000000000000001', 'financial');
      const cost = DecimalUtils.fromValue('100.000000000000000000', 'financial');
      
      const margin = DecimalUtils.calculateProfitMargin(revenue, cost);
      
      // Margen debería ser prácticamente 0.000000000000000001%
      expect(DecimalUtils.isPositive(margin)).toBe(true);
      expect(DecimalUtils.toNumber(margin)).toBeLessThan(0.000000000000000002);
    });
  });

  // ============================================================================
  // TESTS DE CASOS EXTREMOS DE INVENTARIO
  // ============================================================================

  describe('Cálculos de Inventario Extremos', () => {
    it('should handle massive inventory calculations without overflow', () => {
      // Simular inventario gigante
      const quantity = DecimalUtils.fromValue('999999999.999999999', 'inventory');
      const unitCost = DecimalUtils.fromValue('9999.999999999', 'inventory');
      
      const totalValue = DecimalUtils.calculateStockValue(quantity, unitCost);
      
      // Verificar que el resultado sea correcto y no haya overflow
      const expected = DecimalUtils.fromValue('9999999999999989990.000000001', 'inventory');
      expect(DecimalUtils.isEqual(totalValue, expected, '0.1')).toBe(true);
    });

    it('should calculate weighted average cost with precision', () => {
      // Compras con diferentes costos y cantidades fraccionarias
      const currentStock = DecimalUtils.fromValue('123.456789', 'inventory');
      const currentCost = DecimalUtils.fromValue('45.67890123', 'inventory');
      const newStock = DecimalUtils.fromValue('67.890123', 'inventory');
      const newCost = DecimalUtils.fromValue('78.90123456', 'inventory');
      
      const avgCost = DecimalUtils.calculateWeightedAverageCost(
        currentStock, currentCost, newStock, newCost
      );
      
      // Verificar que el promedio ponderado sea correcto
      expect(DecimalUtils.isValidDecimal(avgCost)).toBe(true);
      expect(DecimalUtils.isPositive(avgCost)).toBe(true);
      
      // El costo promedio debe estar entre los dos costos originales
      const isInRange = DecimalUtils.toNumber(avgCost) >= Math.min(
        DecimalUtils.toNumber(currentCost), 
        DecimalUtils.toNumber(newCost)
      ) && DecimalUtils.toNumber(avgCost) <= Math.max(
        DecimalUtils.toNumber(currentCost), 
        DecimalUtils.toNumber(newCost)
      );
      expect(isInRange).toBe(true);
    });
  });

  // ============================================================================
  // TESTS DE ESCALADO DE RECETAS
  // ============================================================================

  describe('Escalado de Recetas con Precisión', () => {
    it('should scale recipes with fractional factors precisely', () => {
      // Escalar una receta por factor de 1/3 (factor que causa problemas de precisión)
      const originalQuantity = DecimalUtils.fromValue('100', 'recipe');
      const scaleFactor = DecimalUtils.fromValue('0.333333333333333333', 'recipe');
      
      const scaledQuantity = DecimalUtils.scaleRecipe(originalQuantity, scaleFactor);
      
      // Resultado debe ser preciso, no 33.333333333333336
      expect(DecimalUtils.toFixed(scaledQuantity, 18)).toBe('33.333333333333333300');
    });

    it('should handle recipe yield calculations accurately', () => {
      // Yield con números que típicamente causan problemas de floating point
      const actualOutput = DecimalUtils.fromValue('66.66666666666667', 'recipe');
      const theoreticalOutput = DecimalUtils.fromValue('100', 'recipe');
      
      const yieldPercentage = DecimalUtils.calculateYield(actualOutput, theoreticalOutput);
      
      // Debe ser exactamente 66.66666666666667%
      expect(DecimalUtils.toFixed(yieldPercentage, 14)).toBe('66.66666666666667');
    });
  });

  // ============================================================================
  // TESTS DE CASOS LÍMITE Y ERRORES
  // ============================================================================

  describe('Casos Límite y Manejo de Errores', () => {
    it('should handle division by zero gracefully', () => {
      expect(() => {
        DecimalUtils.divide(100, 0);
      }).toThrow('División por cero no permitida');
    });

    it('should handle very small numbers without losing precision', () => {
      // Números muy pequeños que JavaScript no puede manejar precisamente
      const verySmall = DecimalUtils.fromValue('0.000000000000000001', 'financial');
      const multiplier = DecimalUtils.fromValue('1000000000000000000', 'financial');
      
      const result = DecimalUtils.multiply(verySmall, multiplier, 'financial');
      
      expect(DecimalUtils.toNumber(result)).toBe(1);
    });

    it('should clamp values correctly', () => {
      const value = DecimalUtils.fromValue('-100.5', 'financial');
      const clamped = DecimalUtils.clampPositive(value);
      
      expect(DecimalUtils.isZero(clamped)).toBe(true);
      
      const boundedClamp = DecimalUtils.clamp(50, 10, 30, 'financial');
      expect(DecimalUtils.toNumber(boundedClamp)).toBe(30);
    });
  });

  // ============================================================================
  // TESTS DE COMPARACIÓN CON TOLERANCIA
  // ============================================================================

  describe('Comparaciones con Tolerancia', () => {
    it('should compare values with floating point tolerance', () => {
      // Valores que deberían ser iguales pero floating point los hace diferentes
      const a = DecimalUtils.fromValue(0.1 + 0.2, 'financial');
      const b = DecimalUtils.fromValue(0.3, 'financial');
      
      // Sin tolerancia, JavaScript diría que son diferentes
      // Con nuestra función, deberían ser iguales
      expect(DecimalUtils.isEqual(a, b, '0.0001')).toBe(true);
    });

    it('should find min and max values correctly', () => {
      const values = [
        '123.456789012345',
        '123.456789012344',
        '123.456789012346',
        '123.456789012345999'
      ];
      
      const max = DecimalUtils.max(...values);
      const min = DecimalUtils.min(...values);
      
      expect(DecimalUtils.toString(max)).toBe('123.456789012346');
      expect(DecimalUtils.toString(min)).toBe('123.456789012344');
    });
  });

  // ============================================================================
  // TESTS DE FORMATEO AVANZADO
  // ============================================================================

  describe('Formateo y Display', () => {
    it('should format currency with correct locale behavior', () => {
      const amount = DecimalUtils.fromValue('12345.67890', 'financial');
      
      const formatted = DecimalUtils.formatCurrency(amount, 2);
      expect(formatted).toBe('$12345.68'); // Debe redondear correctamente
      
      const formatted3 = DecimalUtils.formatCurrency(amount, 3);
      expect(formatted3).toBe('$12345.679');
    });

    it('should format percentages correctly', () => {
      const percentage = DecimalUtils.fromValue('66.66666666666667', 'financial');
      
      const formatted = DecimalUtils.formatPercentage(percentage, 2);
      expect(formatted).toBe('66.67%'); // Debe redondear correctamente
    });

    it('should handle scientific notation for very large/small numbers', () => {
      const veryLarge = DecimalUtils.fromValue('123456789012345678901234567890', 'financial');
      const scientific = DecimalUtils.formatScientific(veryLarge, 4);
      
      expect(scientific).toMatch(/1\.235e\+29/);
    });
  });

  // ============================================================================
  // TESTS DE RENDIMIENTO Y STRESS
  // ============================================================================

  describe('Rendimiento y Stress Tests', () => {
    it('should handle many consecutive operations without degradation', () => {
      let result = DecimalUtils.fromValue('1', 'financial');
      
      // Realizar 1000 operaciones consecutivas
      for (let i = 0; i < 1000; i++) {
        result = DecimalUtils.multiply(result, '1.0001', 'financial');
        result = DecimalUtils.add(result, '0.0001', 'financial');
        result = DecimalUtils.subtract(result, '0.00005', 'financial');
      }
      
      // El resultado debe seguir siendo válido y positivo
      expect(DecimalUtils.isValidDecimal(result)).toBe(true);
      expect(DecimalUtils.isPositive(result)).toBe(true);
    });
  });

  // ============================================================================
  // TESTS DE INTEGRACIÓN CON DOMINIOS
  // ============================================================================

  describe('Integración con Dominios Especializados', () => {
    it('should use correct precision for different domains', () => {
      const value = '123.456789012345678901234567890';
      
      const tax = DecimalUtils.fromValue(value, 'tax');
      const inventory = DecimalUtils.fromValue(value, 'inventory'); 
      const financial = DecimalUtils.fromValue(value, 'financial');
      const recipe = DecimalUtils.fromValue(value, 'recipe');
      
      // Cada dominio puede tener diferentes comportamientos de precisión
      expect(tax instanceof TaxDecimal).toBe(true);
      expect(inventory instanceof InventoryDecimal).toBe(true);
      expect(financial instanceof FinancialDecimal).toBe(true);
      expect(recipe instanceof RecipeDecimal).toBe(true);
    });
  });
});

// ============================================================================
// TESTS ESPECÍFICOS PARA CASOS DE NEGOCIO REALES
// ============================================================================

describe('DecimalUtils - Real Business Scenarios', () => {
  
  it('should handle complex restaurant order calculation', () => {
    // Escenario real: Orden compleja de restaurante
    const orderItems = [
      { quantity: 2.5, unitPrice: 45.67 },
      { quantity: 1.333, unitPrice: 78.90 },
      { quantity: 4, unitPrice: 23.45 }
    ];
    
    let subtotal = DecimalUtils.fromValue(0, 'financial');
    
    orderItems.forEach(item => {
      const itemTotal = DecimalUtils.multiply(item.quantity, item.unitPrice, 'financial');
      subtotal = DecimalUtils.add(subtotal, itemTotal, 'financial');
    });
    
    // Aplicar IVA 21%
    const tax = DecimalUtils.applyPercentage(subtotal, 21, 'financial');
    const total = DecimalUtils.add(subtotal, tax, 'financial');
    
    // Verificar que todos los cálculos sean precisos
    expect(DecimalUtils.isValidDecimal(total)).toBe(true);
    expect(DecimalUtils.formatCurrency(total, 2)).toMatch(/^\$\d+\.\d{2}$/);
  });

  it('should handle inventory reorder calculation with multiple suppliers', () => {
    // Escenario: Cálculo de reorden con múltiples proveedores
    const suppliers = [
      { stock: 150, cost: 12.34, leadTime: 7 },
      { stock: 200, cost: 11.89, leadTime: 14 },
      { stock: 300, cost: 12.56, leadTime: 3 }
    ];
    
    let totalValue = DecimalUtils.fromValue(0, 'inventory');
    let totalQuantity = DecimalUtils.fromValue(0, 'inventory');
    
    suppliers.forEach(supplier => {
      const value = DecimalUtils.multiply(supplier.stock, supplier.cost, 'inventory');
      totalValue = DecimalUtils.add(totalValue, value, 'inventory');
      totalQuantity = DecimalUtils.add(totalQuantity, supplier.stock, 'inventory');
    });
    
    const averageCost = DecimalUtils.divide(totalValue, totalQuantity, 'inventory');
    
    // El costo promedio debe estar en rango esperado
    expect(DecimalUtils.toNumber(averageCost)).toBeGreaterThan(11.89);
    expect(DecimalUtils.toNumber(averageCost)).toBeLessThan(12.56);
  });
});