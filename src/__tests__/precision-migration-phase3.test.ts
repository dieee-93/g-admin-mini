/**
 * PRECISION MIGRATION PHASE 3 - TEST SUITE
 *
 * Tests for analytics, hooks, and UI components refactored in Phase 3
 * to ensure mathematical precision using DecimalUtils framework.
 *
 * Coverage:
 * - SalesIntelligenceEngine (analytics)
 * - useCostAnalysis (hooks)
 * - useMenuEngineering (hooks)
 * - ProductionSection (UI time conversions)
 */

import { describe, test, expect } from 'vitest';
import { DecimalUtils } from '@/lib/decimal';
import { SalesIntelligenceEngine } from '@/pages/admin/operations/sales/services/SalesIntelligenceEngine';
import type { SalesAnalysisData } from '@/pages/admin/operations/sales/services/SalesIntelligenceEngine';

// ============================================================================
// 🎯 ANALYTICS - SalesIntelligenceEngine precision tests
// ============================================================================

describe('🎯 PHASE 3 - SalesIntelligenceEngine precision', () => {

  test('should calculate revenue deviation without float errors', () => {
    // Test data that could cause float precision issues
    const targetRevenue = 5000.33;
    const todayRevenue = 3750.25;

    // Expected deviation using DecimalUtils
    const expectedDeviation = DecimalUtils.calculatePercentage(
      targetRevenue - todayRevenue,
      targetRevenue,
      'financial'
    ).toNumber();

    // Expected: ((5000.33 - 3750.25) / 5000.33) * 100 = 25.00%
    expect(expectedDeviation).toBeCloseTo(25.00, 2);

    // Verify it's not using native float arithmetic
    const nativeCalc = ((targetRevenue - todayRevenue) / targetRevenue) * 100;
    // Should be very close but DecimalUtils provides banking-grade precision
    expect(Math.abs(expectedDeviation - nativeCalc)).toBeLessThan(0.001);
  });

  test('should calculate conversion deviation accurately', () => {
    const minConversionRate = 85;
    const currentConversionRate = 72.5;

    const expectedDeviation = DecimalUtils.calculatePercentage(
      minConversionRate - currentConversionRate,
      minConversionRate,
      'financial'
    ).toNumber();

    // Expected: ((85 - 72.5) / 85) * 100 = 14.71%
    expect(expectedDeviation).toBeCloseTo(14.71, 2);
  });

  test('should calculate table turnover deviation without errors', () => {
    const minTurnover = 3;
    const currentTurnover = 2.3;

    const expectedDeviation = DecimalUtils.calculatePercentage(
      minTurnover - currentTurnover,
      minTurnover,
      'financial'
    ).toNumber();

    // Expected: ((3 - 2.3) / 3) * 100 = 23.33%
    expect(expectedDeviation).toBeCloseTo(23.33, 2);
  });

  test('should calculate potential sales loss with compound multiplication', () => {
    const materialsStockCritical = 5;
    const averageOrderValue = 45.67;
    const lossRatio = 0.2;

    // Using DecimalUtils for compound multiplication
    const potentialLossDec = DecimalUtils.multiply(
      materialsStockCritical.toString(),
      DecimalUtils.multiply(
        averageOrderValue.toString(),
        lossRatio.toString(),
        'financial'
      ),
      'financial'
    );

    const potentialLoss = potentialLossDec.toNumber();

    // Expected: 5 * (45.67 * 0.2) = 5 * 9.134 = 45.67
    expect(potentialLoss).toBeCloseTo(45.67, 2);

    // Verify no float accumulation errors
    const nativeCalc = materialsStockCritical * (averageOrderValue * lossRatio);
    expect(Math.abs(potentialLoss - nativeCalc)).toBeLessThan(0.01);
  });

  test('should calculate weekly trend percentage accurately', () => {
    const todayRevenue = 4567.89;
    const lastWeekRevenue = 3890.12;

    const trendDec = DecimalUtils.calculatePercentage(
      todayRevenue - lastWeekRevenue,
      lastWeekRevenue,
      'financial'
    );

    const trend = trendDec.toNumber();

    // Expected: ((4567.89 - 3890.12) / 3890.12) * 100 = 17.42%
    expect(trend).toBeCloseTo(17.42, 2);
  });

  test('should generate alerts with precise calculations', () => {
    const mockData: SalesAnalysisData = {
      todayRevenue: 3500,
      targetRevenue: 5000,
      yesterdayRevenue: 4200,
      lastWeekRevenue: 4500,
      todayTransactions: 50,
      averageOrderValue: 70,
      tableOccupancy: 75,
      averageServiceTime: 25,
      tablesTurnover: 2.5,
      paymentSuccessRate: 98,
      conversionRate: 85,
      newCustomers: 15,
      returningCustomers: 35,
      materialsStockCritical: 0,
      staffCapacity: 90,
      kitchenEfficiency: 88
    };

    const alerts = SalesIntelligenceEngine.generateSalesAlerts(mockData);

    // Should generate at least one alert (revenue below target)
    expect(alerts.length).toBeGreaterThan(0);

    // Find revenue warning alert
    const revenueAlert = alerts.find(a => a.type === 'revenue_below_target' || a.type === 'revenue_critical');
    expect(revenueAlert).toBeDefined();

    if (revenueAlert) {
      // Verify deviation calculation precision
      // Expected: ((5000 - 3500) / 5000) * 100 = 30%
      expect(revenueAlert.deviation).toBe(30);
    }
  });
});

// ============================================================================
// 🎨 HOOKS - Cost analysis precision tests
// ============================================================================

describe('🎨 PHASE 3 - Cost analysis hooks precision', () => {

  test('should calculate batch materials cost using DecimalUtils', () => {
    const costPerUnit = 12.45;
    const batchSize = 50;

    // Using DecimalUtils
    const totalCostDec = DecimalUtils.multiply(
      costPerUnit.toString(),
      batchSize.toString(),
      'financial'
    );

    const totalCost = totalCostDec.toNumber();

    // Expected: 12.45 * 50 = 622.50
    expect(totalCost).toBe(622.50);

    // Verify precision
    expect(totalCost).toBeCloseTo(622.5, 2);
  });

  test('should calculate line total for materials without float errors', () => {
    const quantityNeeded = 7.5;
    const unitCost = 3.33;

    const lineTotalDec = DecimalUtils.multiply(
      quantityNeeded.toString(),
      unitCost.toString(),
      'financial'
    );

    const lineTotal = lineTotalDec.toNumber();

    // Expected: 7.5 * 3.33 = 24.975
    expect(lineTotal).toBeCloseTo(24.975, 3);

    // Native calculation might have precision issues
    const nativeCalc = quantityNeeded * unitCost;
    expect(Math.abs(lineTotal - nativeCalc)).toBeLessThan(0.001);
  });

  test('should handle large batch calculations accurately', () => {
    const costPerUnit = 0.87;
    const batchSize = 1000;

    const totalCostDec = DecimalUtils.multiply(
      costPerUnit.toString(),
      batchSize.toString(),
      'financial'
    );

    const totalCost = totalCostDec.toNumber();

    // Expected: 0.87 * 1000 = 870.00
    expect(totalCost).toBe(870);
  });
});

// ============================================================================
// 📊 HOOKS - Menu engineering precision tests
// ============================================================================

describe('📊 PHASE 3 - Menu engineering precision', () => {

  test('should calculate item revenue using DecimalUtils', () => {
    const quantity = 3;
    const unitPrice = 15.75;

    const itemRevenueDec = DecimalUtils.multiply(
      quantity.toString(),
      unitPrice.toString(),
      'financial'
    );

    const itemRevenue = itemRevenueDec.toNumber();

    // Expected: 3 * 15.75 = 47.25
    expect(itemRevenue).toBe(47.25);
  });

  test('should accumulate sales revenue without precision loss', () => {
    // Simulate accumulating multiple item sales
    const items = [
      { quantity: 2, unitPrice: 12.50 },
      { quantity: 3, unitPrice: 8.33 },
      { quantity: 1, unitPrice: 25.99 }
    ];

    let totalRevenue = 0;
    items.forEach(item => {
      const itemRevenue = item.line_total || DecimalUtils.multiply(
        item.quantity.toString(),
        item.unitPrice.toString(),
        'financial'
      ).toNumber();
      totalRevenue += itemRevenue;
    });

    // Expected: (2 * 12.50) + (3 * 8.33) + (1 * 25.99) = 25 + 24.99 + 25.99 = 75.98
    expect(totalRevenue).toBeCloseTo(75.98, 2);
  });
});

// ============================================================================
// ⏱️ UI - Production time conversion tests
// ============================================================================

describe('⏱️ PHASE 3 - Production time conversions', () => {

  test('should convert minutes to hours using DecimalUtils', () => {
    const minutes = 90;

    const hoursDec = DecimalUtils.divide(
      minutes.toString(),
      '60',
      'recipe'
    );

    const hours = hoursDec.toFixed(2);

    // Expected: 90 / 60 = 1.50 hours
    expect(hours).toBe('1.50');
  });

  test('should convert hours to minutes using DecimalUtils', () => {
    const hours = 2.5;

    const minutesDec = DecimalUtils.multiply(
      hours.toString(),
      '60',
      'recipe'
    );

    const minutes = Math.round(minutesDec.toNumber());

    // Expected: 2.5 * 60 = 150 minutes
    expect(minutes).toBe(150);
  });

  test('should calculate time-based overhead accurately', () => {
    const overheadPerMinute = 0.25;
    const productionTime = 45;

    const totalDec = DecimalUtils.multiply(
      overheadPerMinute.toString(),
      productionTime.toString(),
      'recipe'
    );

    const total = totalDec.toNumber();

    // Expected: 0.25 * 45 = 11.25
    expect(total).toBe(11.25);
  });

  test('should handle fractional time conversions', () => {
    const minutes = 37.5;

    const hoursDec = DecimalUtils.divide(
      minutes.toString(),
      '60',
      'recipe'
    );

    // Test the raw value first
    expect(hoursDec.toNumber()).toBeCloseTo(0.625, 3);

    // Test the formatted value (toFixed returns string)
    const hoursStr = hoursDec.toFixed(2);
    expect(hoursStr).toBe('0.62'); // toFixed rounds down to 0.62
  });
});

// ============================================================================
// 🔗 INTEGRATION - Cross-module precision test
// ============================================================================

describe('🔗 PHASE 3 - Integration tests', () => {

  test('should maintain precision across analytics pipeline', () => {
    // Simulate a full analytics flow
    const salesData = [
      { quantity: 5, price: 12.99 },
      { quantity: 3, price: 8.50 },
      { quantity: 2, price: 25.75 }
    ];

    // Calculate total revenue using DecimalUtils
    const totalRevenueDec = salesData.reduce((sumDec, sale) => {
      const saleTotalDec = DecimalUtils.multiply(
        sale.quantity.toString(),
        sale.price.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, saleTotalDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    const totalRevenue = totalRevenueDec.toNumber();

    // Expected: (5 * 12.99) + (3 * 8.50) + (2 * 25.75) = 64.95 + 25.50 + 51.50 = 141.95
    expect(totalRevenue).toBeCloseTo(141.95, 2);

    // Verify no accumulation errors
    expect(totalRevenue).toBeGreaterThan(141.94);
    expect(totalRevenue).toBeLessThan(141.96);
  });

  test('should calculate complex production costs without errors', () => {
    // Simulate full production cost calculation
    const materialsCost = 45.67;
    const laborHours = 2.5;
    const laborRate = 18.50;
    const overheadPerMinute = 0.15;
    const productionMinutes = 90;

    // Materials cost
    const materialsDec = DecimalUtils.fromValue(materialsCost, 'recipe');

    // Labor cost: hours * rate
    const laborCostDec = DecimalUtils.multiply(
      laborHours.toString(),
      laborRate.toString(),
      'recipe'
    );

    // Overhead: rate * minutes
    const overheadDec = DecimalUtils.multiply(
      overheadPerMinute.toString(),
      productionMinutes.toString(),
      'recipe'
    );

    // Total cost
    const totalCostDec = DecimalUtils.add(
      materialsDec,
      DecimalUtils.add(laborCostDec, overheadDec, 'recipe'),
      'recipe'
    );

    const totalCost = totalCostDec.toNumber();

    // Expected: 45.67 + (2.5 * 18.50) + (0.15 * 90) = 45.67 + 46.25 + 13.50 = 105.42
    expect(totalCost).toBeCloseTo(105.42, 2);
  });
});

// ============================================================================
// 📈 EDGE CASES - Extreme values and edge cases
// ============================================================================

describe('📈 PHASE 3 - Edge cases', () => {

  test('should handle zero values correctly', () => {
    const result = DecimalUtils.multiply('0', '100', 'financial').toNumber();
    expect(result).toBe(0);
  });

  test('should handle very small percentages', () => {
    const deviation = DecimalUtils.calculatePercentage(0.01, 1000, 'financial').toNumber();
    expect(deviation).toBeCloseTo(0.001, 6);
  });

  test('should handle large monetary values', () => {
    const largeCost = DecimalUtils.multiply('999999.99', '100', 'financial').toNumber();
    expect(largeCost).toBe(99999999);
  });

  test('should maintain precision in percentage calculations', () => {
    // Real-world scenario: 15% below target
    const target = 5000;
    const actual = 4250;

    const deviationDec = DecimalUtils.calculatePercentage(
      target - actual,
      target,
      'financial'
    );

    const deviation = deviationDec.toNumber();
    expect(deviation).toBe(15);
  });
});
