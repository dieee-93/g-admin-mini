import { describe, it, expect, vi } from 'vitest';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

/**
 * Revenue Calculation Tests - Financial Precision
 * Validates decimal arithmetic for financial operations
 */

describe('Revenue Calculation - Financial Precision', () => {
  describe('Daily revenue aggregation', () => {
    it('should aggregate revenues without float errors', () => {
      // Arrange
      const revenues = ['100.50', '250.75', '50.25', '0', '300.00'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(701.50);
      expect(parseFloat(total.toString())).toBe(701.50);
    });

    it('should handle large revenue values', () => {
      // Arrange
      const revenues = ['1500.99', '2300.45', '800.55', '4500.01'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(9102.00);
    });

    it('should handle decimal precision edge cases', () => {
      // Arrange - Values that cause float errors in JavaScript
      const revenues = ['0.1', '0.2', '0.3']; // Notorious float problem: 0.1 + 0.2 !== 0.3

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(0.6);
      expect(total.toString()).toBe('0.6');
    });

    it('should handle zero revenue correctly', () => {
      // Arrange
      const revenues = ['0', '0', '0'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toString()).toBe('0');
      expect(total.toNumber()).toBe(0);
    });

    it('should handle single table revenue', () => {
      // Arrange
      const revenue = '125.50';

      // Act
      const total = DecimalUtils.add('0', revenue, 'financial');

      // Assert
      expect(parseFloat(total.toString())).toBe(125.50);
    });
  });

  describe('Average revenue per turn', () => {
    it('should calculate average revenue per turn precisely', () => {
      // Arrange
      const dailyRevenue = '500.00';
      const turnCount = '4';

      // Act
      const avg = DecimalUtils.divide(dailyRevenue, turnCount, 'financial');

      // Assert
      expect(avg.toString()).toBe('125');
      expect(avg.toNumber()).toBe(125);
    });

    it('should handle fractional averages', () => {
      // Arrange
      const dailyRevenue = '1000.00';
      const turnCount = '3';

      // Act
      const avg = DecimalUtils.divide(dailyRevenue, turnCount, 'financial');

      // Assert
      expect(avg.toNumber()).toBeCloseTo(333.33, 2);
    });

    it('should handle zero turns gracefully', () => {
      // Arrange
      const dailyRevenue = '500.00';
      const turnCount = '0';

      // Act & Assert
      expect(() => {
        DecimalUtils.divide(dailyRevenue, turnCount, 'financial');
      }).toThrow(); // Division by zero should throw
    });
  });

  describe('Revenue per table calculations', () => {
    it('should calculate revenue for multiple parties on same table', () => {
      // Arrange
      const parties = [
        { total_spent: '50.25' },
        { total_spent: '75.00' },
        { total_spent: '100.50' }
      ];

      // Act
      const tableRevenue = parties.reduce((sum, party) =>
        DecimalUtils.add(sum, party.total_spent, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(tableRevenue.toString()).toBe('225.75');
      expect(tableRevenue.toNumber()).toBe(225.75);
    });

    it('should handle mixed integer and decimal values', () => {
      // Arrange
      const revenues = ['100', '50.50', '25.25', '200'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(375.75);
    });
  });

  describe('Occupancy revenue calculations', () => {
    it('should calculate revenue per occupied hour', () => {
      // Arrange
      const totalRevenue = '1200.00';
      const occupiedHours = '8';

      // Act
      const revenuePerHour = DecimalUtils.divide(totalRevenue, occupiedHours, 'financial');

      // Assert
      expect(revenuePerHour.toNumber()).toBe(150);
    });

    it('should calculate revenue efficiency ratio', () => {
      // Arrange
      const actualRevenue = '850.50';
      const targetRevenue = '1000.00';

      // Act
      const efficiency = DecimalUtils.multiply(
        DecimalUtils.divide(actualRevenue, targetRevenue, 'financial').toString(),
        '100',
        'financial'
      );

      // Assert
      expect(efficiency.toNumber()).toBeCloseTo(85.05, 2);
    });
  });

  describe('Tax and fee calculations', () => {
    it('should calculate tax accurately', () => {
      // Arrange
      const revenue = '500.00';
      const taxRate = '0.15'; // 15%

      // Act
      const tax = DecimalUtils.multiply(revenue, taxRate, 'financial');

      // Assert
      expect(tax.toNumber()).toBe(75);
    });

    it('should calculate revenue with tax included', () => {
      // Arrange
      const baseRevenue = '500.00';
      const taxRate = '0.15';

      // Act
      const tax = DecimalUtils.multiply(baseRevenue, taxRate, 'financial');
      const totalRevenue = DecimalUtils.add(baseRevenue, tax.toString(), 'financial');

      // Assert
      expect(totalRevenue.toNumber()).toBe(575);
    });

    it('should calculate service charge accurately', () => {
      // Arrange
      const revenue = '1000.00';
      const serviceChargeRate = '0.10'; // 10%

      // Act
      const serviceCharge = DecimalUtils.multiply(revenue, serviceChargeRate, 'financial');

      // Assert
      expect(serviceCharge.toNumber()).toBe(100);
    });
  });

  describe('Complex financial scenarios', () => {
    it('should handle multi-table revenue aggregation with tax', () => {
      // Arrange
      const tables = [
        { revenue: '100.50', tax: '15.08' },
        { revenue: '250.75', tax: '37.61' },
        { revenue: '50.25', tax: '7.54' }
      ];

      // Act
      const totalRevenue = tables.reduce((sum, table) =>
        DecimalUtils.add(sum, table.revenue, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      const totalTax = tables.reduce((sum, table) =>
        DecimalUtils.add(sum, table.tax, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      const grandTotal = DecimalUtils.add(
        totalRevenue.toString(),
        totalTax.toString(),
        'financial'
      );

      // Assert
      expect(totalRevenue.toNumber()).toBe(401.50);
      expect(totalTax.toNumber()).toBe(60.23);
      expect(grandTotal.toNumber()).toBe(461.73);
    });

    it('should calculate tips and service charges separately', () => {
      // Arrange
      const baseRevenue = '500.00';
      const tipRate = '0.18'; // 18%
      const serviceChargeRate = '0.05'; // 5%

      // Act
      const tip = DecimalUtils.multiply(baseRevenue, tipRate, 'financial');
      const serviceCharge = DecimalUtils.multiply(baseRevenue, serviceChargeRate, 'financial');

      const totalWithTip = DecimalUtils.add(baseRevenue, tip.toString(), 'financial');
      const grandTotal = DecimalUtils.add(
        totalWithTip.toString(),
        serviceCharge.toString(),
        'financial'
      );

      // Assert
      expect(tip.toNumber()).toBe(90);
      expect(serviceCharge.toNumber()).toBe(25);
      expect(grandTotal.toNumber()).toBe(615);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle very small amounts', () => {
      // Arrange
      const revenues = ['0.01', '0.02', '0.03'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(0.06);
    });

    it('should handle very large amounts', () => {
      // Arrange
      const revenues = ['99999.99', '99999.99'];

      // Act
      const total = revenues.reduce((sum, rev) =>
        DecimalUtils.add(sum, rev, 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      );

      // Assert
      expect(total.toNumber()).toBe(199999.98);
    });

    it('should maintain precision through multiple operations', () => {
      // Arrange
      const amount = '100.00';

      // Act - Chain of operations
      const result = DecimalUtils.multiply(
        DecimalUtils.divide(
          DecimalUtils.add(amount, '50.50', 'financial').toString(),
          '2',
          'financial'
        ).toString(),
        '3',
        'financial'
      );

      // Assert
      // (100 + 50.50) / 2 * 3 = 150.50 / 2 * 3 = 75.25 * 3 = 225.75
      expect(result.toNumber()).toBe(225.75);
    });
  });
});
