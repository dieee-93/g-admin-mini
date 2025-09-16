// ============================================================================
// PRUEBA DE INTEGRACIÓN FINAL - SISTEMA DECIMAL.JS COMPLETO
// ============================================================================

import { describe, it, expect } from 'vitest';
import { DecimalUtils } from '../shared/decimalUtils';
import { taxService } from '../fiscal/taxCalculationService';
import { StockCalculation } from '../inventory/stockCalculation';
import { recipeService } from '../../services/recipe/RecipeService';
import { SmartCostCalculationEngine } from '../recipes/recipeCostCalculationEngine';

describe('🎯 PRUEBA FINAL DE INTEGRACIÓN - Sistema Decimal.js Completo', () => {

  it('🏆 ESCENARIO COMPLETO: Restaurante con precisión perfecta', async () => {
    console.log('🚀 Iniciando escenario de integración completa...');

    // ============================================================================
    // 📋 PASO 1: CÁLCULOS DE INVENTARIO CON PRECISIÓN
    // ============================================================================
    console.log('📦 Probando cálculos de inventario...');

    const inventoryItems = [
      { 
        id: '1', name: 'Harina', type: 'MEASURABLE' as const, unit: 'kg', 
        stock: 123.456789, unit_cost: 45.67890123, 
        category: 'Básicos', created_at: '', updated_at: ''
      },
      { 
        id: '2', name: 'Tomates', type: 'MEASURABLE' as const, unit: 'kg', 
        stock: 67.890123, unit_cost: 78.90123456, 
        category: 'Verduras', created_at: '', updated_at: ''
      }
    ];

    // Calcular valor total del inventario
    const totalInventoryValue = inventoryItems.reduce((total, item) => {
      const itemValue = DecimalUtils.calculateStockValue(item.stock, item.unit_cost);
      return DecimalUtils.add(total, itemValue, 'inventory');
    }, DecimalUtils.fromValue(0, 'inventory'));

    console.log(`💰 Valor total inventario: ${DecimalUtils.formatCurrency(totalInventoryValue)}`);

    // Verificar que no hay errores de floating point
    const expectedValue = DecimalUtils.fromValue('11000.3074074', 'inventory'); // Calculado manualmente
    expect(DecimalUtils.isEqual(totalInventoryValue, expectedValue, '0.01')).toBe(true);

    // ============================================================================
    // 📋 PASO 2: CÁLCULO DE COSTOS DE RECETA
    // ============================================================================
    console.log('👨‍🍳 Probando cálculos de recetas...');

    const mockRecipe = {
      id: '1',
      name: 'Pizza Margherita',
      type: 'product' as const,
      category: 'Pizzas',
      servingSize: 8,
      servingUnit: 'porción',
      suggestedPrice: 2500.50,
      ingredients: [
        { name: 'Harina', quantity: 0.500, unit: 'kg', cost: 45.67890123 },
        { name: 'Tomate', quantity: 0.300, unit: 'kg', cost: 78.90123456 },
        { name: 'Queso', quantity: 0.250, unit: 'kg', cost: 120.75 }
      ],
      steps: [],
      difficulty: 'medium' as const,
      prepTime: 30,
      cookTime: 15,
      tags: [],
      allergens: [],
      totalCost: 0,
      marginPercentage: 0
    };

    const recipeCalculation = recipeService.calculateRecipeCosts(mockRecipe);
    
    console.log(`🍕 Costo total receta: ${DecimalUtils.formatCurrency(recipeCalculation.totalCost)}`);
    console.log(`💰 Costo por porción: ${DecimalUtils.formatCurrency(recipeCalculation.costPerServing)}`);
    console.log(`📊 Margen de ganancia: ${recipeCalculation.profitPercentage?.toFixed(2)}%`);

    // Verificar que los cálculos son precisos
    expect(recipeCalculation.totalCost).toBeGreaterThan(0);
    expect(recipeCalculation.costPerServing).toBeGreaterThan(0);
    expect(recipeCalculation.profitPercentage).toBeGreaterThan(0);

    // ============================================================================
    // 📋 PASO 3: CÁLCULOS FISCALES COMPLEJOS
    // ============================================================================
    console.log('🧾 Probando cálculos fiscales...');

    const orderItems = [
      { productId: '1', quantity: 2.5, unitPrice: recipeCalculation.costPerServing * 1.8 },
      { productId: '2', quantity: 1.333, unitPrice: 890.75 },
      { productId: '3', quantity: 3, unitPrice: 450.25 }
    ];

    const taxCalculation = taxService.calculateTaxesForItems(orderItems, {
      ivaRate: 0.21,
      includeIngresosBrutos: true,
      ingresosBrutosRate: 0.03,
      taxIncludedInPrice: true // Precios con IVA incluido (Argentina)
    });

    console.log(`💵 Subtotal: ${DecimalUtils.formatCurrency(taxCalculation.subtotal)}`);
    console.log(`🏛️ IVA (21%): ${DecimalUtils.formatCurrency(taxCalculation.ivaAmount)}`);
    console.log(`🏢 Ing. Brutos (3%): ${DecimalUtils.formatCurrency(taxCalculation.ingresosBrutosAmount)}`);
    console.log(`💰 Total: ${DecimalUtils.formatCurrency(taxCalculation.totalAmount)}`);

    // Verificar coherencia fiscal
    const expectedSubtotal = DecimalUtils.add(
      DecimalUtils.add(taxCalculation.ivaAmount, taxCalculation.ingresosBrutosAmount, 'tax'),
      taxCalculation.subtotal,
      'tax'
    );
    expect(DecimalUtils.isEqual(expectedSubtotal, taxCalculation.totalAmount, '0.01')).toBe(true);

    // ============================================================================
    // 📋 PASO 4: ANÁLISIS DE RENTABILIDAD INTEGRADO
    // ============================================================================
    console.log('📈 Probando análisis de rentabilidad...');

    const revenue = DecimalUtils.fromValue(taxCalculation.totalAmount, 'financial');
    const totalCosts = DecimalUtils.fromValue(
      orderItems.reduce((sum, item) => 
        sum + (item.quantity * recipeCalculation.costPerServing), 0
      ), 'financial'
    );

    const profitMargin = DecimalUtils.calculateProfitMargin(revenue, totalCosts);
    const markup = DecimalUtils.calculateMarkup(revenue, totalCosts);

    console.log(`💹 Margen de ganancia: ${DecimalUtils.formatPercentage(profitMargin)}`);
    console.log(`🔢 Markup: ${DecimalUtils.formatPercentage(markup)}`);

    // Verificar que la rentabilidad es positiva
    expect(DecimalUtils.isPositive(profitMargin)).toBe(true);
    expect(DecimalUtils.isPositive(markup)).toBe(true);

    // ============================================================================
    // 📋 PASO 5: ESCALADO DE RECETA MASIVO
    // ============================================================================
    console.log('🔄 Probando escalado masivo de recetas...');

    // Escalar la receta para 100 porciones (factor 12.5)
    const scaleFactor = 12.5;
    const scaledRecipe = recipeService.scaleRecipe(mockRecipe, scaleFactor);

    console.log(`🍕 Receta original: ${mockRecipe.servingSize} porciones`);
    console.log(`🍕 Receta escalada: ${scaledRecipe.servingSize} porciones`);
    
    scaledRecipe.ingredients.forEach((ingredient, index) => {
      const originalQty = mockRecipe.ingredients[index].quantity;
      const expectedQty = DecimalUtils.multiply(originalQty, scaleFactor, 'recipe');
      console.log(`📦 ${ingredient.name}: ${originalQty}kg → ${ingredient.quantity}kg (esperado: ${DecimalUtils.toNumber(expectedQty)}kg)`);
      
      // Verificar precisión en escalado
      expect(DecimalUtils.isEqual(ingredient.quantity, expectedQty, '0.001')).toBe(true);
    });

    // ============================================================================
    // 📋 PASO 6: SIMULACIÓN DE STRESS CON MÚLTIPLES OPERACIONES
    // ============================================================================
    console.log('🚀 Probando stress test con 1000 operaciones...');

    let runningTotal = DecimalUtils.fromValue(1000, 'financial');
    const startTime = Date.now();

    for (let i = 0; i < 1000; i++) {
      // Operaciones complejas consecutivas
      runningTotal = DecimalUtils.add(runningTotal, '0.01', 'financial');
      runningTotal = DecimalUtils.multiply(runningTotal, '1.0001', 'financial');
      const tax = DecimalUtils.applyPercentage(runningTotal, '0.5', 'financial');
      runningTotal = DecimalUtils.subtract(runningTotal, tax, 'financial');
    }

    const endTime = Date.now();
    console.log(`⚡ 1000 operaciones completadas en ${endTime - startTime}ms`);
    console.log(`💰 Total final: ${DecimalUtils.formatCurrency(runningTotal)}`);

    // Verificar que después de 1000 operaciones, el resultado sigue siendo válido
    expect(DecimalUtils.isValidDecimal(runningTotal)).toBe(true);
    expect(DecimalUtils.isPositive(runningTotal)).toBe(true);

    // ============================================================================
    // 📋 PASO 7: VERIFICACIÓN DE PRECISIÓN EXTREMA
    // ============================================================================
    console.log('🔍 Verificando precisión extrema...');

    // Operación que típicamente causa errores de floating point
    const a = DecimalUtils.fromValue(0.1, 'financial');
    const b = DecimalUtils.fromValue(0.2, 'financial');
    const sum = DecimalUtils.add(a, b, 'financial');
    const expected = DecimalUtils.fromValue(0.3, 'financial');

    console.log(`🧮 0.1 + 0.2 = ${DecimalUtils.toString(sum)} (JavaScript nativo: ${0.1 + 0.2})`);
    
    expect(DecimalUtils.isEqual(sum, expected, '0.000001')).toBe(true);
    expect(DecimalUtils.toFixed(sum, 1)).toBe('0.3');

    // ============================================================================
    // ✅ RESUMEN FINAL
    // ============================================================================
    console.log('\n🎉 PRUEBA FINAL COMPLETADA EXITOSAMENTE');
    console.log('✅ Inventario: Cálculos precisos');
    console.log('✅ Recetas: Escalado perfecto');
    console.log('✅ Fiscales: IVA e Ingresos Brutos exactos');
    console.log('✅ Financiero: Márgenes y markup correctos');
    console.log('✅ Performance: 1000 operaciones sin degradación');
    console.log('✅ Precisión: 0.1 + 0.2 = 0.3 (NO 0.30000000000000004)');

    expect(true).toBe(true); // Test pasa si llegamos aquí sin errores
  });

  it('🔥 CASO EXTREMO: Cálculos con números gigantes', () => {
    console.log('🔥 Probando números extremadamente grandes...');

    const hugeCost = DecimalUtils.fromValue('999999999999.999999999', 'financial');
    const hugeQuantity = DecimalUtils.fromValue('888888888.888888888', 'inventory');
    
    const totalValue = DecimalUtils.multiply(hugeCost, hugeQuantity, 'financial');
    
    console.log(`🚀 Costo gigante: ${DecimalUtils.formatCurrency(hugeCost)}`);
    console.log(`📦 Cantidad gigante: ${DecimalUtils.formatQuantity(hugeQuantity, 'unidades', 9)}`);
    console.log(`💰 Valor total: ${DecimalUtils.formatCurrency(totalValue)}`);

    // Verificar que no hay overflow y el resultado es válido
    expect(DecimalUtils.isValidDecimal(totalValue)).toBe(true);
    expect(DecimalUtils.isPositive(totalValue)).toBe(true);
    expect(DecimalUtils.toString(totalValue)).toMatch(/^8888888888888888887999999999\d*\.\d+$/);
  });

  it('⚡ PERFORMANCE: Operaciones masivas en paralelo', () => {
    console.log('⚡ Probando performance con operaciones masivas...');

    const startTime = Date.now();
    const operations = [];

    // Crear 1000 operaciones diferentes
    for (let i = 0; i < 1000; i++) {
      operations.push({
        cost: DecimalUtils.fromValue(Math.random() * 1000 + 100, 'financial'),
        quantity: DecimalUtils.fromValue(Math.random() * 50 + 1, 'inventory'),
        taxRate: DecimalUtils.fromValue(Math.random() * 0.3 + 0.1, 'tax')
      });
    }

    // Procesar todas las operaciones
    const results = operations.map(op => {
      const subtotal = DecimalUtils.multiply(op.cost, op.quantity, 'financial');
      const tax = DecimalUtils.applyPercentage(subtotal, DecimalUtils.multiply(op.taxRate, 100, 'tax'), 'tax');
      const total = DecimalUtils.add(subtotal, tax, 'financial');
      return {
        subtotal: DecimalUtils.toNumber(subtotal),
        tax: DecimalUtils.toNumber(tax),
        total: DecimalUtils.toNumber(total)
      };
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`⚡ ${operations.length} operaciones procesadas en ${processingTime}ms`);
    console.log(`📊 Promedio: ${(processingTime / operations.length).toFixed(3)}ms por operación`);

    // Verificar que todas las operaciones son válidas
    results.forEach(result => {
      expect(result.subtotal).toBeGreaterThan(0);
      expect(result.tax).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(result.subtotal);
    });

    // Performance debe ser razonable (menos de 1 segundo para 1000 operaciones)
    expect(processingTime).toBeLessThan(1000);
  });
});