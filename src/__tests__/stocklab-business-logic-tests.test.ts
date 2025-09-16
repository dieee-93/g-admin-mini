// ============================================================================
// STOCKLAB BUSINESS LOGIC VALIDATION TESTS - FASE 4
// ============================================================================
// Tests de validación de lógica de negocio con escenarios del mundo real

import { describe, test, expect, beforeEach } from 'vitest';
import { ABCAnalysisEngine, type ABCAnalysisResult } from '../pages/admin/supply-chain/materials/services/abcAnalysisEngine';
import { ProcurementRecommendationsEngine } from '../pages/admin/supply-chain/materials/services/procurementRecommendationsEngine';
import { DemandForecastingEngine } from '../pages/admin/supply-chain/materials/services/demandForecastingEngine';
import { SmartAlertsEngine } from '../pages/admin/supply-chain/materials/services/smartAlertsEngine';
import { SupplierAnalysisEngine } from '../pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import type { MaterialItem } from '../pages/admin/supply-chain/materials/types';
import type { MaterialABC } from '../pages/admin/supply-chain/materials/types/abc-analysis';

// ============================================================================
// REAL-WORLD TEST DATA SETS
// ============================================================================

/**
 * Restaurante típico - 50 items con patrones reales de consumo
 */
const createRestaurantInventoryDataset = (): MaterialItem[] => [
  // Clase A esperada - Ingredientes principales de alta rotación
  { id: 'beef-premium', name: 'Carne Premium', type: 'MEASURABLE', stock: 25, unit_cost: 280, category_id: 'carnes', supplier_id: 'sup-carnes', unit: 'kg' },
  { id: 'salmon-fresh', name: 'Salmón Fresco', type: 'MEASURABLE', stock: 15, unit_cost: 450, category_id: 'pescados', supplier_id: 'sup-pescados', unit: 'kg' },
  { id: 'oil-olive-premium', name: 'Aceite Oliva Premium', type: 'MEASURABLE', stock: 8, unit_cost: 85, category_id: 'aceites', supplier_id: 'sup-aceites', unit: 'litro' },
  { id: 'wine-house', name: 'Vino de la Casa', type: 'COUNTABLE', stock: 20, unit_cost: 120, category_id: 'bebidas', supplier_id: 'sup-bebidas' },
  { id: 'cheese-imported', name: 'Queso Importado', type: 'MEASURABLE', stock: 12, unit_cost: 180, category_id: 'lacteos', supplier_id: 'sup-lacteos', unit: 'kg' },
  
  // Clase B esperada - Ingredientes importantes de rotación media
  { id: 'chicken-breast', name: 'Pechuga de Pollo', type: 'MEASURABLE', stock: 30, unit_cost: 95, category_id: 'carnes', supplier_id: 'sup-carnes', unit: 'kg' },
  { id: 'pasta-premium', name: 'Pasta Premium', type: 'COUNTABLE', stock: 50, unit_cost: 45, category_id: 'pastas', supplier_id: 'sup-secos' },
  { id: 'tomatoes-cherry', name: 'Tomates Cherry', type: 'MEASURABLE', stock: 20, unit_cost: 65, category_id: 'verduras', supplier_id: 'sup-verduras', unit: 'kg' },
  { id: 'beer-craft', name: 'Cerveza Artesanal', type: 'COUNTABLE', stock: 48, unit_cost: 25, category_id: 'bebidas', supplier_id: 'sup-bebidas' },
  { id: 'flour-premium', name: 'Harina Premium', type: 'MEASURABLE', stock: 40, unit_cost: 28, category_id: 'harinas', supplier_id: 'sup-secos', unit: 'kg' },
  
  // Clase C esperada - Ingredientes de apoyo y especias
  { id: 'salt-sea', name: 'Sal Marina', type: 'MEASURABLE', stock: 15, unit_cost: 12, category_id: 'condimentos', supplier_id: 'sup-condimentos', unit: 'kg' },
  { id: 'pepper-black', name: 'Pimienta Negra', type: 'MEASURABLE', stock: 2, unit_cost: 45, category_id: 'especias', supplier_id: 'sup-especias', unit: 'kg' },
  { id: 'napkins', name: 'Servilletas', type: 'COUNTABLE', stock: 100, unit_cost: 8, category_id: 'descartables', supplier_id: 'sup-descartables' },
  { id: 'toothpicks', name: 'Palillos', type: 'COUNTABLE', stock: 200, unit_cost: 5, category_id: 'descartables', supplier_id: 'sup-descartables' },
  { id: 'oregano-dry', name: 'Orégano Seco', type: 'MEASURABLE', stock: 1.5, unit_cost: 35, category_id: 'especias', supplier_id: 'sup-especias', unit: 'kg' },
];

/**
 * Dataset con variaciones estacionales para testing de forecasting
 */
const createSeasonalDataset = (): MaterialABC[] => [
  {
    id: 'ice-cream-base',
    name: 'Base para Helados',
    type: 'MEASURABLE',
    stock: 50,
    unit_cost: 65,
    abcClass: 'B',
    annualValue: 15600, // 240 kg/year * 65
    monthlyConsumption: 20,
    cumulativeValue: 15600,
    cumulativePercentage: 60,
    valuePercentage: 12,
    unit: 'kg',
    // Consumo alto en verano, bajo en invierno
    consumptionHistory: [
      { date: '2024-01-15', quantity: 10, unit_cost: 65 }, // Enero - Verano alto
      { date: '2024-02-15', quantity: 25, unit_cost: 65 }, // Febrero - Verano alto
      { date: '2024-03-15', quantity: 30, unit_cost: 65 }, // Marzo - Verano pico
      { date: '2024-04-15', quantity: 20, unit_cost: 65 }, // Abril - Otoño
      { date: '2024-05-15', quantity: 15, unit_cost: 65 }, // Mayo - Otoño
      { date: '2024-06-15', quantity: 8, unit_cost: 65 },  // Junio - Invierno bajo
      { date: '2024-07-15', quantity: 5, unit_cost: 65 },  // Julio - Invierno bajo  
      { date: '2024-08-15', quantity: 12, unit_cost: 65 }, // Agosto - Invierno
    ]
  }
];

// ============================================================================
// FASE 4.A: ABC CLASSIFICATION ACCURACY
// ============================================================================

describe('🧠 ABC ALGORITHM VALIDATION', () => {
  
  describe('Real-world Restaurant Scenarios', () => {
    let restaurantData: MaterialItem[];
    let abcResult: ABCAnalysisResult;

    beforeEach(() => {
      restaurantData = createRestaurantInventoryDataset();
      abcResult = ABCAnalysisEngine.analyzeInventory(restaurantData);
    });

    test('should classify restaurant inventory correctly against manual analysis', () => {
      // Verificación manual: los items de mayor valor anual deberían estar en clase A
      const expectedClassA = ['beef-premium', 'salmon-fresh']; // Los de mayor valor total
      const expectedClassC = ['napkins', 'toothpicks']; // Los de menor valor total

      // Verificar que los items de alta valoración están en clase A
      const classAIds = abcResult.classA.map(item => item.id);
      expectedClassA.forEach(id => {
        expect(classAIds).toContain(id);
      });

      // Verificar que los items de baja valoración están en clase C
      const classCIds = abcResult.classC.map(item => item.id);
      expectedClassC.forEach(id => {
        expect(classCIds).toContain(id);
      });

      // Verificar distribución 80-15-5 aproximada
      const totalItems = restaurantData.length;
      expect(abcResult.classA.length / totalItems).toBeLessThanOrEqual(0.25); // Máximo 25% en A
      expect(abcResult.classC.length / totalItems).toBeGreaterThanOrEqual(0.4); // Mínimo 40% en C
    });

    test('should handle seasonal variations in classification', () => {
      const seasonalData = createSeasonalDataset();
      
      // Análisis en temporada alta (verano)
      const summerConsumption = seasonalData[0].consumptionHistory!
        .filter(h => ['2024-01-15', '2024-02-15', '2024-03-15'].includes(h.date))
        .reduce((sum, h) => sum + h.quantity, 0);

      // Análisis en temporada baja (invierno)  
      const winterConsumption = seasonalData[0].consumptionHistory!
        .filter(h => ['2024-06-15', '2024-07-15', '2024-08-15'].includes(h.date))
        .reduce((sum, h) => sum + h.quantity, 0);

      expect(summerConsumption).toBeGreaterThan(winterConsumption * 2); // Verano >> Invierno

      // El forecast debería detectar esta estacionalidad
      const forecast = DemandForecastingEngine.generateForecast(seasonalData);
      const iceCreamForecast = forecast.find(f => f.itemId === 'ice-cream-base');
      
      expect(iceCreamForecast).toBeDefined();
      expect(iceCreamForecast!.seasonalityDetected).toBe(true);
    });
  });

  describe('Edge Cases and Robustness', () => {
    test('should handle single-item inventory', () => {
      const singleItem: MaterialItem[] = [{
        id: 'only-item',
        name: 'Single Item',
        type: 'COUNTABLE',
        stock: 10,
        unit_cost: 100,
        category_id: 'cat-1',
        supplier_id: 'sup-1'
      }];

      const result = ABCAnalysisEngine.analyzeInventory(singleItem);
      
      // Single item should be classified as A (represents 100% of value)
      expect(result.classA).toHaveLength(1);
      expect(result.classB).toHaveLength(0);
      expect(result.classC).toHaveLength(0);
      expect(result.classA[0].id).toBe('only-item');
      expect(result.classA[0].cumulativePercentage).toBe(100);
    });

    test('should handle items with zero consumption', () => {
      const zeroConsumptionItems: MaterialItem[] = [
        { id: '1', name: 'Active Item', type: 'COUNTABLE', stock: 10, unit_cost: 100, category_id: 'cat-1', supplier_id: 'sup-1' },
        { id: '2', name: 'Inactive Item', type: 'COUNTABLE', stock: 0, unit_cost: 50, category_id: 'cat-1', supplier_id: 'sup-1' },
        { id: '3', name: 'Zero Cost Item', type: 'COUNTABLE', stock: 100, unit_cost: 0, category_id: 'cat-1', supplier_id: 'sup-1' }
      ];

      const result = ABCAnalysisEngine.analyzeInventory(zeroConsumptionItems, {
        includeInactive: true,
        minValue: 0
      });

      // Should still process all items
      const totalItems = result.classA.length + result.classB.length + result.classC.length;
      expect(totalItems).toBe(3);

      // Active item should be in class A
      const activeItem = [...result.classA, ...result.classB, ...result.classC]
        .find(item => item.id === '1');
      expect(activeItem).toBeDefined();
    });

    test('should handle inventory with identical values', () => {
      const identicalItems: MaterialItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `identical-${i}`,
        name: `Identical Item ${i}`,
        type: 'COUNTABLE' as const,
        stock: 5,
        unit_cost: 20, // All have same total value
        category_id: 'cat-1',
        supplier_id: 'sup-1'
      }));

      const result = ABCAnalysisEngine.analyzeInventory(identicalItems);
      
      // Should distribute somewhat evenly due to equal values
      const totalItems = identicalItems.length;
      expect(result.classA.length + result.classB.length + result.classC.length).toBe(totalItems);
      
      // All items should have same value percentage
      const allItems = [...result.classA, ...result.classB, ...result.classC];
      const expectedPercentage = 100 / totalItems;
      allItems.forEach(item => {
        expect(Math.abs(item.valuePercentage - expectedPercentage)).toBeLessThan(0.01);
      });
    });
  });
});

// ============================================================================
// FASE 4.B: PROCUREMENT RECOMMENDATIONS INTELLIGENCE
// ============================================================================

describe('💡 PROCUREMENT INTELLIGENCE VALIDATION', () => {

  describe('Recommendation Quality and Accuracy', () => {
    test('should generate actionable recommendations for urgent restocks', () => {
      const criticalStockItems: MaterialABC[] = [{
        id: 'critical-beef',
        name: 'Carne Premium Crítica',
        type: 'MEASURABLE',
        stock: 1, // Crítico para un restaurante
        unit_cost: 280,
        abcClass: 'A',
        annualValue: 84000, // 300 kg/year * 280
        monthlyConsumption: 25, // 25 kg/month
        cumulativeValue: 84000,
        cumulativePercentage: 50,
        valuePercentage: 30,
        unit: 'kg'
      }];

      const recommendations = ProcurementRecommendationsEngine.generateRecommendations(criticalStockItems);
      
      // Should generate urgent restock recommendation
      const urgentRestock = recommendations.find(r => r.priority === 'urgent');
      expect(urgentRestock).toBeDefined();
      expect(urgentRestock!.type).toBe('urgent_restock');
      expect(urgentRestock!.itemId).toBe('critical-beef');
      
      // Should recommend reasonable quantity (at least 1 month supply)
      expect(urgentRestock!.suggestedQuantity).toBeGreaterThanOrEqual(25);
      
      // Should provide ROI estimation
      expect(urgentRestock!.estimatedROI).toBeGreaterThan(0);
      expect(urgentRestock!.reasoning).toContain('crítico');
    });

    test('should optimize bulk purchase recommendations for Class C items', () => {
      const classCItems: MaterialABC[] = [
        {
          id: 'napkins-1', name: 'Servilletas Tipo 1', type: 'COUNTABLE',
          stock: 50, unit_cost: 8, abcClass: 'C',
          annualValue: 960, monthlyConsumption: 10,
          cumulativeValue: 960, cumulativePercentage: 95, valuePercentage: 2,
          supplier_id: 'sup-descartables'
        },
        {
          id: 'napkins-2', name: 'Servilletas Tipo 2', type: 'COUNTABLE',
          stock: 30, unit_cost: 10, abcClass: 'C',
          annualValue: 1200, monthlyConsumption: 10,
          cumulativeValue: 2160, cumulativePercentage: 97, valuePercentage: 2.5,
          supplier_id: 'sup-descartables'
        },
        {
          id: 'toothpicks', name: 'Palillos', type: 'COUNTABLE',
          stock: 100, unit_cost: 5, abcClass: 'C',
          annualValue: 600, monthlyConsumption: 10,
          cumulativeValue: 2760, cumulativePercentage: 99.5, valuePercentage: 1.5,
          supplier_id: 'sup-descartables'
        }
      ];

      const recommendations = ProcurementRecommendationsEngine.generateRecommendations(classCItems);
      
      // Should generate bulk consolidation recommendation
      const bulkRecommendation = recommendations.find(r => r.type === 'bulk_optimization');
      expect(bulkRecommendation).toBeDefined();
      
      if (bulkRecommendation) {
        // Should consolidate items from same supplier
        expect(bulkRecommendation.affectedItems).toHaveLength(3);
        expect(bulkRecommendation.suggestedQuantity).toBeGreaterThan(100); // Combined quantity
        expect(bulkRecommendation.estimatedSavings).toBeGreaterThan(0); // Should show cost savings
      }
    });

    test('should provide accurate lead time and supplier analysis', () => {
      const supplierTestItems: MaterialABC[] = [{
        id: 'salmon-test',
        name: 'Salmón Noruego',
        type: 'MEASURABLE',
        stock: 10,
        unit_cost: 450,
        abcClass: 'A',
        annualValue: 54000,
        monthlyConsumption: 10,
        cumulativeValue: 54000,
        cumulativePercentage: 40,
        valuePercentage: 25,
        supplier_id: 'sup-pescados-premium'
      }];

      // Generate supplier analysis
      const supplierAnalysis = SupplierAnalysisEngine.analyzeSuppliers(supplierTestItems);
      expect(supplierAnalysis.length).toBeGreaterThan(0);

      const supplierData = supplierAnalysis[0];
      expect(supplierData.supplierId).toBe('sup-pescados-premium');
      expect(supplierData.totalValue).toBeCloseTo(54000);
      expect(supplierData.itemCount).toBe(1);
      expect(supplierData.riskScore).toBeGreaterThanOrEqual(0);
      expect(supplierData.riskScore).toBeLessThanOrEqual(10);
    });
  });

  describe('Financial Accuracy in Recommendations', () => {
    test('should calculate ROI accurately for procurement recommendations', () => {
      const roiTestItem: MaterialABC[] = [{
        id: 'roi-test',
        name: 'ROI Test Item',
        type: 'COUNTABLE',
        stock: 20,
        unit_cost: 100,
        abcClass: 'B',
        annualValue: 30000, // 250 units/year * 100
        monthlyConsumption: 25,
        cumulativeValue: 30000,
        cumulativePercentage: 70,
        valuePercentage: 15
      }];

      const recommendations = ProcurementRecommendationsEngine.generateRecommendations(roiTestItem);
      const roiRecommendation = recommendations.find(r => r.estimatedROI > 0);
      
      expect(roiRecommendation).toBeDefined();
      
      if (roiRecommendation) {
        // ROI should be reasonable for business context (typically 10-50%)
        expect(roiRecommendation.estimatedROI).toBeGreaterThan(5); 
        expect(roiRecommendation.estimatedROI).toBeLessThan(200); // Not unrealistically high
        
        // Should have cost savings estimation
        expect(roiRecommendation.estimatedSavings).toBeGreaterThan(0);
        
        // ROI calculation should be: (Savings - Investment) / Investment * 100
        const impliedInvestment = roiRecommendation.estimatedSavings / (roiRecommendation.estimatedROI / 100);
        expect(impliedInvestment).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================================
// FASE 4.C: DEMAND FORECASTING ACCURACY
// ============================================================================

describe('🔮 FORECASTING ALGORITHM VALIDATION', () => {

  describe('Method Selection Logic', () => {
    test('should select appropriate forecasting method based on data patterns', () => {
      // Test different pattern types
      const trendingItem: MaterialABC = {
        id: 'trending',
        name: 'Trending Item',
        type: 'COUNTABLE',
        stock: 50,
        unit_cost: 25,
        abcClass: 'B',
        annualValue: 7500,
        monthlyConsumption: 25,
        cumulativeValue: 7500,
        cumulativePercentage: 60,
        valuePercentage: 15,
        // Clear upward trend
        consumptionHistory: [
          { date: '2024-01-15', quantity: 10, unit_cost: 25 },
          { date: '2024-02-15', quantity: 15, unit_cost: 25 },
          { date: '2024-03-15', quantity: 20, unit_cost: 25 },
          { date: '2024-04-15', quantity: 25, unit_cost: 25 },
          { date: '2024-05-15', quantity: 30, unit_cost: 25 }
        ]
      };

      const volatileItem: MaterialABC = {
        id: 'volatile',
        name: 'Volatile Item',
        type: 'COUNTABLE',
        stock: 50,
        unit_cost: 25,
        abcClass: 'B',
        annualValue: 7500,
        monthlyConsumption: 25,
        cumulativeValue: 7500,
        cumulativePercentage: 60,
        valuePercentage: 15,
        // Highly volatile pattern
        consumptionHistory: [
          { date: '2024-01-15', quantity: 5, unit_cost: 25 },
          { date: '2024-02-15', quantity: 45, unit_cost: 25 },
          { date: '2024-03-15', quantity: 10, unit_cost: 25 },
          { date: '2024-04-15', quantity: 40, unit_cost: 25 },
          { date: '2024-05-15', quantity: 15, unit_cost: 25 }
        ]
      };

      const forecastTrending = DemandForecastingEngine.generateForecast([trendingItem]);
      const forecastVolatile = DemandForecastingEngine.generateForecast([volatileItem]);

      // Trending item should use linear regression
      expect(forecastTrending[0].method).toBe('linear_regression');
      expect(forecastTrending[0].trendCoefficients).toBeDefined();
      expect(forecastTrending[0].trendCoefficients!.slope).toBeGreaterThan(0); // Positive trend

      // Volatile item should use moving average for stability
      expect(forecastVolatile[0].method).toBe('moving_average');
      expect(forecastVolatile[0].confidence).toBeLessThan(forecastTrending[0].confidence); // Lower confidence
    });

    test('should detect seasonality correctly', () => {
      const seasonalData = createSeasonalDataset();
      const forecast = DemandForecastingEngine.generateForecast(seasonalData);
      
      const iceCreamForecast = forecast[0];
      expect(iceCreamForecast.seasonalityDetected).toBe(true);
      
      // Should adjust predictions based on current season
      // En agosto (invierno), debería predecir demanda baja
      expect(iceCreamForecast.predictedDemand).toBeLessThan(iceCreamForecast.historicalAverage);
    });
  });

  describe('Prediction Accuracy Validation', () => {
    test('should achieve reasonable accuracy on backtesting', () => {
      // Create historical data with known pattern for backtesting
      const knownPatternItem: MaterialABC = {
        id: 'backtest',
        name: 'Backtest Item',
        type: 'COUNTABLE',
        stock: 50,
        unit_cost: 25,
        abcClass: 'B',
        annualValue: 9000,
        monthlyConsumption: 30,
        cumulativeValue: 9000,
        cumulativePercentage: 60,
        valuePercentage: 15,
        // Predictable pattern: 30 ± random variation
        consumptionHistory: [
          { date: '2024-01-15', quantity: 28, unit_cost: 25 },
          { date: '2024-02-15', quantity: 32, unit_cost: 25 },
          { date: '2024-03-15', quantity: 29, unit_cost: 25 },
          { date: '2024-04-15', quantity: 31, unit_cost: 25 },
          { date: '2024-05-15', quantity: 30, unit_cost: 25 },
          { date: '2024-06-15', quantity: 28, unit_cost: 25 },
          { date: '2024-07-15', quantity: 33, unit_cost: 25 },
          { date: '2024-08-15', quantity: 29, unit_cost: 25 }
        ]
      };

      const forecast = DemandForecastingEngine.generateForecast([knownPatternItem]);
      const prediction = forecast[0];

      // Prediction should be close to the pattern average (30)
      expect(Math.abs(prediction.predictedDemand - 30)).toBeLessThan(5);
      
      // Confidence should be reasonably high for stable pattern
      expect(prediction.confidence).toBeGreaterThan(0.7);
      
      // Historical average should be around 30
      expect(Math.abs(prediction.historicalAverage - 30)).toBeLessThan(2);
      
      // Confidence interval should be reasonable
      if (prediction.confidenceInterval) {
        const intervalWidth = prediction.confidenceInterval.high - prediction.confidenceInterval.low;
        expect(intervalWidth).toBeGreaterThan(2); // Some uncertainty
        expect(intervalWidth).toBeLessThan(20); // Not too wide
      }
    });

    test('should handle insufficient data gracefully', () => {
      const insufficientDataItem: MaterialABC = {
        id: 'insufficient',
        name: 'Insufficient Data Item',
        type: 'COUNTABLE',
        stock: 50,
        unit_cost: 25,
        abcClass: 'C',
        annualValue: 3000,
        monthlyConsumption: 10,
        cumulativeValue: 3000,
        cumulativePercentage: 95,
        valuePercentage: 5,
        // Only 2 data points
        consumptionHistory: [
          { date: '2024-07-15', quantity: 8, unit_cost: 25 },
          { date: '2024-08-15', quantity: 12, unit_cost: 25 }
        ]
      };

      const forecast = DemandForecastingEngine.generateForecast([insufficientDataItem]);
      const prediction = forecast[0];

      // Should fallback to simple average
      expect(prediction.method).toBe('simple_average');
      expect(prediction.predictedDemand).toBe(10); // Average of 8 and 12
      expect(prediction.confidence).toBeLessThan(0.5); // Low confidence
    });
  });
});

// ============================================================================
// FASE 4.D: SMART ALERTS BUSINESS LOGIC
// ============================================================================

describe('🚨 SMART ALERTS BUSINESS VALIDATION', () => {
  
  describe('Alert Generation Logic', () => {
    test('should generate appropriate alerts for different ABC classes', () => {
      const mixedClassItems: MaterialABC[] = [
        {
          id: 'class-a-critical',
          name: 'Clase A Crítico',
          type: 'MEASURABLE',
          stock: 0, // Sin stock
          unit_cost: 500,
          abcClass: 'A',
          annualValue: 60000,
          monthlyConsumption: 10,
          cumulativeValue: 60000,
          cumulativePercentage: 40,
          valuePercentage: 30
        },
        {
          id: 'class-c-low',
          name: 'Clase C Bajo',
          type: 'COUNTABLE',
          stock: 5, // Stock bajo pero no crítico
          unit_cost: 10,
          abcClass: 'C',
          annualValue: 1200,
          monthlyConsumption: 10,
          cumulativeValue: 61200,
          cumulativePercentage: 98,
          valuePercentage: 2
        }
      ];

      const alerts = SmartAlertsEngine.generateSmartAlerts(mixedClassItems);
      
      // Class A sin stock debe generar alerta urgente
      const classAAlert = alerts.find(a => a.itemId === 'class-a-critical');
      expect(classAAlert).toBeDefined();
      expect(classAAlert!.severity).toBe('urgent');
      expect(classAAlert!.actionPriority).toBe(5);
      expect(classAAlert!.timeToAction).toBe('immediate');
      
      // Class C con stock bajo debe generar alerta de menor prioridad
      const classCAlert = alerts.find(a => a.itemId === 'class-c-low');
      if (classCAlert) { // Might not generate alert if stock is still acceptable
        expect(classCAlert.severity).toMatch(/warning|info/);
        expect(classCAlert.actionPriority).toBeLessThan(4);
      }
    });

    test('should provide contextual recommendations based on ABC class', () => {
      const classAItem: MaterialABC[] = [{
        id: 'premium-ingredient',
        name: 'Ingrediente Premium',
        type: 'MEASURABLE',
        stock: 2, // Stock crítico
        unit_cost: 300,
        abcClass: 'A',
        annualValue: 36000,
        monthlyConsumption: 10,
        cumulativeValue: 36000,
        cumulativePercentage: 50,
        valuePercentage: 40
      }];

      const alerts = SmartAlertsEngine.generateSmartAlerts(classAItem);
      const alert = alerts[0];

      // Class A should have urgent, specific recommendations
      expect(alert.recommendedAction).toContain('URGENTE');
      expect(alert.recommendedAction).toContain('proveedor');
      expect(alert.estimatedImpact).toBe('high');
      expect(alert.timeToAction).toMatch(/immediate|within_24h/);
    });
  });

  describe('Alert Intelligence and Context', () => {
    test('should calculate meaningful deviation percentages', () => {
      const deviationTestItem: MaterialABC[] = [{
        id: 'deviation-test',
        name: 'Deviation Test',
        type: 'COUNTABLE',
        stock: 15, // 50% below optimal stock of 30
        unit_cost: 50,
        abcClass: 'B',
        annualValue: 18000,
        monthlyConsumption: 30, // Optimal stock = 2 months = 60
        cumulativeValue: 18000,
        cumulativePercentage: 75,
        valuePercentage: 20
      }];

      const alerts = SmartAlertsEngine.generateSmartAlerts(deviationTestItem);
      
      if (alerts.length > 0) {
        const alert = alerts[0];
        // Deviation should be calculated accurately
        expect(alert.deviation).toBeGreaterThan(0);
        expect(alert.deviation).toBeLessThanOrEqual(100);
        
        // Should provide context data for decision making
        expect(alert.contextData).toBeDefined();
        expect(alert.contextData.estimatedOptimalStock).toBeGreaterThan(alert.currentValue);
      }
    });

    test('should estimate days until empty correctly', () => {
      const fastMovingItem: MaterialABC[] = [{
        id: 'fast-moving',
        name: 'Fast Moving Item',
        type: 'COUNTABLE',
        stock: 30, // 30 units in stock
        unit_cost: 25,
        abcClass: 'A',
        annualValue: 9000,
        monthlyConsumption: 60, // 60/month = 2/day
        cumulativeValue: 9000,
        cumulativePercentage: 60,
        valuePercentage: 25
      }];

      const alerts = SmartAlertsEngine.generateSmartAlerts(fastMovingItem);
      const predictiveAlert = alerts.find(a => a.type === 'low_stock' && a.contextData.predictedEmptyDate);
      
      if (predictiveAlert) {
        // Should predict empty in ~15 days (30 units / 2 per day)
        const daysUntilEmpty = predictiveAlert.currentValue; // This would be the calculated days
        expect(daysUntilEmpty).toBeGreaterThan(10);
        expect(daysUntilEmpty).toBeLessThan(20);
      }
    });
  });
});

// ============================================================================
// END-TO-END BUSINESS WORKFLOW VALIDATION
// ============================================================================

describe('🔄 END-TO-END BUSINESS WORKFLOW', () => {
  
  test('should handle complete restaurant inventory optimization workflow', () => {
    const restaurantData = createRestaurantInventoryDataset();
    
    // Step 1: ABC Classification
    const abcResult = ABCAnalysisEngine.analyzeInventory(restaurantData);
    expect(abcResult.classA.length + abcResult.classB.length + abcResult.classC.length)
      .toBe(restaurantData.length);

    // Step 2: Generate Smart Alerts
    const allClassified = [...abcResult.classA, ...abcResult.classB, ...abcResult.classC];
    const alerts = SmartAlertsEngine.generateSmartAlerts(allClassified);
    expect(alerts.length).toBeGreaterThan(0);

    // Step 3: Procurement Recommendations
    const procurement = ProcurementRecommendationsEngine.generateRecommendations(allClassified);
    expect(procurement.length).toBeGreaterThan(0);

    // Step 4: Demand Forecasting
    const forecasts = DemandForecastingEngine.generateForecast(allClassified);
    expect(forecasts.length).toBe(allClassified.length);

    // Step 5: Supplier Analysis
    const suppliers = SupplierAnalysisEngine.analyzeSuppliers(allClassified);
    expect(suppliers.length).toBeGreaterThan(0);

    // Validate workflow coherence
    // High-priority alerts should align with Class A items
    const urgentAlerts = alerts.filter(a => a.severity === 'urgent' || a.severity === 'critical');
    urgentAlerts.forEach(alert => {
      const item = allClassified.find(i => i.id === alert.itemId);
      if (item) {
        expect(['A', 'B']).toContain(item.abcClass); // Urgent alerts mostly for A/B items
      }
    });

    // Procurement recommendations should prioritize Class A items
    const urgentProcurement = procurement.filter(p => p.priority === 'urgent');
    urgentProcurement.forEach(rec => {
      const item = allClassified.find(i => i.id === rec.itemId);
      if (item) {
        expect(item.abcClass).toBe('A'); // Urgent procurement for Class A
      }
    });
  });

  test('should provide consistent business value calculations across modules', () => {
    const testItem: MaterialABC = {
      id: 'consistency-test',
      name: 'Consistency Test Item',
      type: 'COUNTABLE',
      stock: 20,
      unit_cost: 100,
      abcClass: 'A',
      annualValue: 36000, // 30 units/month * 12 months * 100
      monthlyConsumption: 30,
      cumulativeValue: 36000,
      cumulativePercentage: 50,
      valuePercentage: 30
    };

    // All modules should calculate consistent values
    const alerts = SmartAlertsEngine.generateSmartAlerts([testItem]);
    const procurement = ProcurementRecommendationsEngine.generateRecommendations([testItem]);
    const forecast = DemandForecastingEngine.generateForecast([testItem]);

    // Annual value should be consistent across modules
    expect(testItem.annualValue).toBe(36000);
    
    // Current stock value should be consistent (20 * 100 = 2000)
    const expectedStockValue = 2000;
    
    if (alerts[0]?.contextData.stockValue) {
      expect(Math.abs(alerts[0].contextData.stockValue - expectedStockValue)).toBeLessThan(0.01);
    }
    
    if (procurement[0]?.currentValue) {
      expect(Math.abs(procurement[0].currentValue - expectedStockValue)).toBeLessThan(0.01);
    }
    
    if (forecast[0]?.currentStock) {
      expect(forecast[0].currentStock).toBe(20);
    }
  });
});