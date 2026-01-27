/**
 * Tests para RecipeCostEngine
 *
 * Valida cálculos de costos con precisión decimal
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { RecipeCostEngine } from '../services/costEngine'
import type { CalculateCostInput, RecipeCostOptions } from '../types/costing'
import type { RecipeInput } from '../types/recipe'

describe('RecipeCostEngine', () => {

  describe('calculateYieldFactor', () => {
    it('should calculate yield factor from yield percentage', () => {
      // Access private method via type assertion for testing
      const engine = RecipeCostEngine as any

      // 80% yield = 0.8 factor
      const factor = engine.calculateYieldFactor(80, undefined)
      expect(factor.toNumber()).toBeCloseTo(0.8, 6)
    })

    it('should calculate yield factor from waste percentage', () => {
      const engine = RecipeCostEngine as any

      // 20% waste = 80% yield = 0.8 factor
      const factor = engine.calculateYieldFactor(undefined, 20)
      expect(factor.toNumber()).toBeCloseTo(0.8, 6)
    })

    it('should default to 100% yield when no percentages provided', () => {
      const engine = RecipeCostEngine as any

      const factor = engine.calculateYieldFactor(undefined, undefined)
      expect(factor.toNumber()).toBe(1.0)
    })

    it('should prioritize yield percentage over waste', () => {
      const engine = RecipeCostEngine as any

      // Yield = 75%, Waste = 20% → Usar Yield (75%)
      const factor = engine.calculateYieldFactor(75, 20)
      expect(factor.toNumber()).toBeCloseTo(0.75, 6)
    })

    it('should throw error for invalid yield percentage', () => {
      const engine = RecipeCostEngine as any

      expect(() => engine.calculateYieldFactor(150, undefined)).toThrow()
      expect(() => engine.calculateYieldFactor(-10, undefined)).toThrow()
    })
  })

  describe('estimateQuickCost', () => {
    it('should estimate cost without yield adjustment when waste is 0', () => {
      const inputs: RecipeInput[] = [
        {
          id: '1',
          item: { id: '1', name: 'Flour', type: 'material', unitCost: 10 },
          quantity: 100,
          unit: 'g',
          unitCostOverride: 0.1, // $0.1 per gram
          wastePercentage: 0
        },
        {
          id: '2',
          item: { id: '2', name: 'Water', type: 'material', unitCost: 5 },
          quantity: 50,
          unit: 'ml',
          unitCostOverride: 0.05, // $0.05 per ml
          wastePercentage: 0
        }
      ]

      // Expected: (100 * 0.1) + (50 * 0.05) = 10 + 2.5 = 12.5
      const cost = RecipeCostEngine.estimateQuickCost(inputs)
      expect(cost).toBeCloseTo(12.5, 4)
    })

    it('should adjust cost for waste percentage', () => {
      const inputs: RecipeInput[] = [
        {
          id: '1',
          item: { id: '1', name: 'Beef', type: 'material', unitCost: 20 },
          quantity: 100,
          unit: 'g',
          unitCostOverride: 0.2, // $0.2 per gram
          wastePercentage: 20 // 20% waste
        }
      ]

      // Expected: 100g / (1 - 0.2) * 0.2 = 100 / 0.8 * 0.2 = 125 * 0.2 = 25
      const cost = RecipeCostEngine.estimateQuickCost(inputs)
      expect(cost).toBeCloseTo(25, 4)
    })

    it('should adjust cost for yield percentage', () => {
      const inputs: RecipeInput[] = [
        {
          id: '1',
          item: { id: '1', name: 'Vegetables', type: 'material', unitCost: 15 },
          quantity: 100,
          unit: 'g',
          unitCostOverride: 0.15, // $0.15 per gram
          yieldPercentage: 75 // 75% yield
        }
      ]

      // Expected: 100g / 0.75 * 0.15 = 133.33 * 0.15 = 20
      const cost = RecipeCostEngine.estimateQuickCost(inputs)
      expect(cost).toBeCloseTo(20, 2)
    })
  })

  describe('scaleRecipeCost', () => {
    it('should scale all costs except cost per unit', () => {
      const originalCost = {
        materialsCost: 100,
        laborCost: 20,
        overheadCost: 10,
        packagingCost: 5,
        totalCost: 135,
        costPerUnit: 13.5,
        inputsBreakdown: [],
        yieldAnalysis: {
          theoreticalYield: 10,
          actualYield: 10,
          yieldPercentage: 100,
          wasteFactor: 0,
          efficiencyScore: 100
        },
        calculatedAt: new Date()
      }

      const scaled = RecipeCostEngine.scaleRecipeCost(originalCost, 2)

      expect(scaled.materialsCost).toBeCloseTo(200, 4)
      expect(scaled.laborCost).toBeCloseTo(40, 4)
      expect(scaled.overheadCost).toBeCloseTo(20, 4)
      expect(scaled.packagingCost).toBeCloseTo(10, 4)
      expect(scaled.totalCost).toBeCloseTo(270, 4)
      // Cost per unit should remain the same
      expect(scaled.costPerUnit).toBeCloseTo(13.5, 4)
    })

    it('should scale down with factor < 1', () => {
      const originalCost = {
        materialsCost: 100,
        laborCost: 20,
        overheadCost: 10,
        packagingCost: 5,
        totalCost: 135,
        costPerUnit: 13.5,
        inputsBreakdown: [],
        yieldAnalysis: {
          theoreticalYield: 10,
          actualYield: 10,
          yieldPercentage: 100,
          wasteFactor: 0,
          efficiencyScore: 100
        },
        calculatedAt: new Date()
      }

      const scaled = RecipeCostEngine.scaleRecipeCost(originalCost, 0.5)

      expect(scaled.materialsCost).toBeCloseTo(50, 4)
      expect(scaled.totalCost).toBeCloseTo(67.5, 4)
    })
  })

  describe('Yield Analysis', () => {
    it('should calculate yield analysis correctly', () => {
      const engine = RecipeCostEngine as any

      const input: CalculateCostInput = {
        recipeId: 'test',
        inputs: [],
        output: {
          item: 'test-output',
          quantity: 100,
          unit: 'g',
          yieldPercentage: 90,
          wastePercentage: 10
        },
        costConfig: {}
      }

      const analysis = engine.calculateYieldAnalysis(input)

      expect(analysis.theoreticalYield).toBe(100)
      expect(analysis.actualYield).toBeCloseTo(90, 2)
      expect(analysis.yieldPercentage).toBe(90)
      expect(analysis.wasteFactor).toBe(10)
      expect(analysis.efficiencyScore).toBeGreaterThan(0)
      expect(analysis.efficiencyScore).toBeLessThanOrEqual(100)
    })
  })
})
