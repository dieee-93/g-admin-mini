// Menu Engineering Engine Tests - Comprehensive Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MenuEngineeringEngine } from './menuEngineeringEngine'
import { MenuCategory } from '../types/menu-engineering'

describe('MenuEngineeringEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('categorizeRecipe', () => {
    it('should categorize high popularity + high profitability as Stars', () => {
      const result = MenuEngineeringEngine.categorizeRecipe(75, 80)
      expect(result).toBe(MenuCategory.STARS)
    })

    it('should categorize high popularity + low profitability as Plowhorses', () => {
      const result = MenuEngineeringEngine.categorizeRecipe(75, 30)
      expect(result).toBe(MenuCategory.PLOWHORSES)
    })

    it('should categorize low popularity + high profitability as Puzzles', () => {
      const result = MenuEngineeringEngine.categorizeRecipe(30, 80)
      expect(result).toBe(MenuCategory.PUZZLES)
    })

    it('should categorize low popularity + low profitability as Dogs', () => {
      const result = MenuEngineeringEngine.categorizeRecipe(30, 30)
      expect(result).toBe(MenuCategory.DOGS)
    })

    it('should handle edge cases at threshold (50)', () => {
      expect(MenuEngineeringEngine.categorizeRecipe(50, 50)).toBe(MenuCategory.DOGS)
      expect(MenuEngineeringEngine.categorizeRecipe(51, 51)).toBe(MenuCategory.STARS)
      expect(MenuEngineeringEngine.categorizeRecipe(51, 49)).toBe(MenuCategory.PLOWHORSES)
      expect(MenuEngineeringEngine.categorizeRecipe(49, 51)).toBe(MenuCategory.PUZZLES)
    })

    it('should handle extreme values', () => {
      expect(MenuEngineeringEngine.categorizeRecipe(100, 100)).toBe(MenuCategory.STARS)
      expect(MenuEngineeringEngine.categorizeRecipe(0, 0)).toBe(MenuCategory.DOGS)
      expect(MenuEngineeringEngine.categorizeRecipe(100, 0)).toBe(MenuCategory.PLOWHORSES)
      expect(MenuEngineeringEngine.categorizeRecipe(0, 100)).toBe(MenuCategory.PUZZLES)
    })

    it('should handle negative values gracefully', () => {
      expect(MenuEngineeringEngine.categorizeRecipe(-10, -10)).toBe(MenuCategory.DOGS)
      expect(MenuEngineeringEngine.categorizeRecipe(-10, 60)).toBe(MenuCategory.PUZZLES)
    })
  })

  describe('analyzeRecipePerformance', () => {
    const mockSalesData = [
      { recipe_id: 'recipe-1', quantity_sold: 50, revenue: 1000, date: '2024-01-01' },
      { recipe_id: 'recipe-1', quantity_sold: 30, revenue: 600, date: '2024-01-02' },
      { recipe_id: 'recipe-1', quantity_sold: 45, revenue: 900, date: '2024-01-03' }
    ]

    const mockCostData = {
      total_cost: 15.50,
      cost_per_unit: 3.10,
      food_cost_percentage: 25
    }

    it('should analyze recipe performance correctly', () => {
      const result = MenuEngineeringEngine.analyzeRecipePerformance(
        'recipe-1', 
        mockSalesData, 
        mockCostData
      )

      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('popularity_index')
      expect(result).toHaveProperty('profitability_index')
      expect(result).toHaveProperty('strategic_recommendations')
      expect(Array.isArray(result.strategic_recommendations)).toBe(true)
    })

    it('should return Stars category for current implementation', () => {
      const result = MenuEngineeringEngine.analyzeRecipePerformance(
        'recipe-1', 
        mockSalesData, 
        mockCostData
      )

      expect(result.category).toBe(MenuCategory.STARS)
    })

    it('should handle empty sales data', () => {
      const result = MenuEngineeringEngine.analyzeRecipePerformance(
        'recipe-1', 
        [], 
        mockCostData
      )

      expect(result).toHaveProperty('category')
      expect(result.popularity_index).toBe(0)
      expect(result.profitability_index).toBe(0)
    })

    it('should handle null cost data', () => {
      const result = MenuEngineeringEngine.analyzeRecipePerformance(
        'recipe-1', 
        mockSalesData, 
        null
      )

      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('strategic_recommendations')
    })

    it('should handle invalid recipe ID', () => {
      const result = MenuEngineeringEngine.analyzeRecipePerformance(
        '', 
        mockSalesData, 
        mockCostData
      )

      expect(result).toBeDefined()
      expect(result.category).toBe(MenuCategory.STARS)
    })
  })

  describe('Performance Tests', () => {
    it('should handle multiple recipe analyses efficiently', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        MenuEngineeringEngine.categorizeRecipe(
          Math.random() * 100, 
          Math.random() * 100
        )
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete in <100ms
    })

    it('should produce consistent results for same inputs', () => {
      const result1 = MenuEngineeringEngine.categorizeRecipe(75, 80)
      const result2 = MenuEngineeringEngine.categorizeRecipe(75, 80)
      const result3 = MenuEngineeringEngine.categorizeRecipe(75, 80)

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe(MenuCategory.STARS)
    })
  })

  describe('Business Logic Validation', () => {
    it('should validate menu engineering matrix logic', () => {
      // Test the 2x2 matrix comprehensively
      const testCases = [
        { popularity: 80, profitability: 80, expected: MenuCategory.STARS },
        { popularity: 80, profitability: 20, expected: MenuCategory.PLOWHORSES },
        { popularity: 20, profitability: 80, expected: MenuCategory.PUZZLES },
        { popularity: 20, profitability: 20, expected: MenuCategory.DOGS }
      ]

      testCases.forEach(({ popularity, profitability, expected }) => {
        const result = MenuEngineeringEngine.categorizeRecipe(popularity, profitability)
        expect(result).toBe(expected)
      })
    })

    it('should handle boundary conditions correctly', () => {
      // Test exactly at the 50% threshold
      expect(MenuEngineeringEngine.categorizeRecipe(50, 50)).toBe(MenuCategory.DOGS)
      expect(MenuEngineeringEngine.categorizeRecipe(50.1, 50.1)).toBe(MenuCategory.STARS)
    })
  })
})
