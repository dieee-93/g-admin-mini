// ============================================
// SUPPLIER ANALYTICS SERVICE
// ============================================
// Wrapper service for SupplierAnalysisEngine integration

import { SupplierAnalysisEngine } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import type {
  SupplierAnalysisResult,
  SupplierAnalysis
} from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import type { Supplier, ProcurementRecommendation } from '../types/supplierTypes';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';
import type { SupplierOrderWithDetails } from '@/pages/admin/supply-chain/supplier-orders/types';
import { logger } from '@/lib/logging';
import Decimal from 'decimal.js';

/**
 * Supplier Analytics Service
 * Provides analytics data for supplier performance dashboard
 */
export const supplierAnalyticsService = {
  /**
   * Run full supplier analysis
   */
  async runAnalysis(
    suppliers: Supplier[],
    materials: MaterialItem[],
    orders: SupplierOrderWithDetails[]
  ): Promise<SupplierAnalysisResult> {
    try {
      logger.info('SupplierAnalyticsService', 'Starting supplier analysis', {
        suppliersCount: suppliers.length,
        materialsCount: materials.length,
        ordersCount: orders.length
      });

      // 1. Transform materials to MaterialABC format with ABC classification
      const materialsABC = this.transformToMaterialABC(materials, orders);

      // 2. Generate procurement recommendations (empty for now, could integrate procurementRecommendationsEngine)
      const procurementRecs: ProcurementRecommendation[] = [];

      // 3. Run engine analysis
      const result = await SupplierAnalysisEngine.analyzeSuppliers(
        suppliers,
        materialsABC,
        procurementRecs
      );

      logger.info('SupplierAnalyticsService', 'Analysis completed', {
        suppliersAnalyzed: result.suppliersAnalyzed,
        averageRating: result.portfolioMetrics.averageRating
      });

      return result;
    } catch (error) {
      logger.error('SupplierAnalyticsService', 'Error running analysis', error);
      throw error;
    }
  },

  /**
   * Transform MaterialItem[] to MaterialABC[] with ABC classification
   */
  transformToMaterialABC(
    materials: MaterialItem[],
    orders: SupplierOrderWithDetails[]
  ): MaterialABC[] {
    return materials.map(material => {
      const annualConsumption = this.calculateAnnualConsumption(material, orders);
      const annualValue = this.calculateAnnualValue(material, orders);
      const abcClass = this.calculateABCClass(material, annualValue, materials, orders);

      return {
        ...material,
        abcClass,
        annualConsumption,
        annualValue
      } as MaterialABC;
    });
  },

  /**
   * Calculate annual consumption for a material
   */
  calculateAnnualConsumption(material: MaterialItem, orders: SupplierOrderWithDetails[]): number {
    // Get all received orders in last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let totalQuantity = new Decimal(0);

    orders
      .filter(order => order.status === 'received' && order.received_at)
      .filter(order => new Date(order.received_at!) >= oneYearAgo)
      .forEach(order => {
        order.items
          .filter(item => item.material_id === material.id)
          .forEach(item => {
            totalQuantity = totalQuantity.plus(item.received_quantity);
          });
      });

    return totalQuantity.toNumber();
  },

  /**
   * Calculate annual value for a material
   */
  calculateAnnualValue(material: MaterialItem, orders: SupplierOrderWithDetails[]): number {
    // Get all received orders in last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let totalValue = new Decimal(0);

    orders
      .filter(order => order.status === 'received' && order.received_at)
      .filter(order => new Date(order.received_at!) >= oneYearAgo)
      .forEach(order => {
        order.items
          .filter(item => item.material_id === material.id)
          .forEach(item => {
            totalValue = totalValue.plus(
              new Decimal(item.received_quantity).times(item.unit_cost)
            );
          });
      });

    return totalValue.toNumber();
  },

  /**
   * Calculate ABC class for a material
   * A class: Top 20% of materials by value (contribute 80% of total value)
   * B class: Next 30% of materials (contribute 15% of total value)
   * C class: Remaining 50% of materials (contribute 5% of total value)
   */
  calculateABCClass(
    material: MaterialItem,
    annualValue: number,
    allMaterials: MaterialItem[],
    orders: SupplierOrderWithDetails[]
  ): 'A' | 'B' | 'C' {
    // Calculate total value for all materials
    const materialValues = allMaterials.map(m => ({
      id: m.id,
      value: this.calculateAnnualValue(m, orders)
    }));

    // Sort by value descending
    materialValues.sort((a, b) => b.value - a.value);

    // Calculate cumulative values
    const totalValue = materialValues.reduce((sum, m) => sum + m.value, 0);

    if (totalValue === 0) return 'C';

    let cumulativeValue = 0;
    for (let i = 0; i < materialValues.length; i++) {
      cumulativeValue += materialValues[i].value;
      const cumulativePercent = (cumulativeValue / totalValue) * 100;

      if (materialValues[i].id === material.id) {
        if (cumulativePercent <= 80) return 'A';
        if (cumulativePercent <= 95) return 'B';
        return 'C';
      }
    }

    return 'C';
  },

  /**
   * Get supplier-specific analysis by ID
   */
  getSupplierAnalysis(
    supplierId: string,
    analysisResult: SupplierAnalysisResult
  ): SupplierAnalysis | undefined {
    return analysisResult.supplierAnalyses.find(s => s.id === supplierId);
  },

  /**
   * Get top performers (by overall rating)
   */
  getTopPerformers(
    analysisResult: SupplierAnalysisResult,
    limit: number = 5
  ): SupplierAnalysis[] {
    return [...analysisResult.supplierAnalyses]
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, limit);
  },

  /**
   * Get bottom performers (by overall rating)
   */
  getBottomPerformers(
    analysisResult: SupplierAnalysisResult,
    limit: number = 5
  ): SupplierAnalysis[] {
    return [...analysisResult.supplierAnalyses]
      .sort((a, b) => a.overallRating - b.overallRating)
      .slice(0, limit);
  },

  /**
   * Get high-risk suppliers
   */
  getHighRiskSuppliers(analysisResult: SupplierAnalysisResult): SupplierAnalysis[] {
    return analysisResult.supplierAnalyses.filter(
      s => s.riskLevel === 'high' || s.riskLevel === 'critical'
    );
  },

  /**
   * Get suppliers by rating category
   */
  getSuppliersByCategory(
    analysisResult: SupplierAnalysisResult,
    category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  ): SupplierAnalysis[] {
    return analysisResult.supplierAnalyses.filter(s => s.ratingCategory === category);
  }
};
