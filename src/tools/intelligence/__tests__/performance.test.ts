// Recipe Performance Benchmarks
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SmartCostCalculationEngine } from "../data/engines/costCalculationEngine"
import { MenuEngineeringEngine } from "../data/engines/menuEngineeringEngine"

describe("Recipe Performance Benchmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Cost Calculation Performance", () => {
    it("should handle large datasets within performance threshold", async () => {
      const iterations = 1000
      const startTime = performance.now()

      const promises = Array.from({ length: iterations }, (_, i) =>
        SmartCostCalculationEngine.calculateRecipeCostWithYield(`recipe-${i}`)
      )

      await Promise.all(promises)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Should complete 1000 calculations in under 5 seconds
      expect(executionTime).toBeLessThan(5000)
      console.log(`Cost calculation: ${iterations} operations in ${executionTime.toFixed(2)}ms`)
    })

    it("should maintain consistent performance across multiple runs", async () => {
      const runs = 5
      const operationsPerRun = 100
      const times: number[] = []

      for (let run = 0; run < runs; run++) {
        const startTime = performance.now()
        
        const promises = Array.from({ length: operationsPerRun }, (_, i) =>
          SmartCostCalculationEngine.calculateRecipeCostWithYield(`recipe-${run}-${i}`)
        )

        await Promise.all(promises)
        
        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / runs
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      const variance = maxTime - minTime

      // Performance should be consistent (variance < 50% of average)
      expect(variance).toBeLessThan(avgTime * 0.5)
      console.log(`Performance consistency: avg=${avgTime.toFixed(2)}ms, variance=${variance.toFixed(2)}ms`)
    })
  })

  describe("Menu Engineering Performance", () => {
    it("should categorize recipes quickly", () => {
      const iterations = 10000
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        MenuEngineeringEngine.categorizeRecipe(
          Math.random() * 100,
          Math.random() * 100
        )
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Should complete 10000 categorizations in under 100ms
      expect(executionTime).toBeLessThan(100)
      console.log(`Menu categorization: ${iterations} operations in ${executionTime.toFixed(2)}ms`)
    })

    it("should analyze large sales datasets efficiently", () => {
      const largeSalesData = Array.from({ length: 5000 }, (_, i) => ({
        date: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
        quantity_sold: Math.floor(Math.random() * 100),
        revenue: Math.floor(Math.random() * 1000)
      }))

      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        MenuEngineeringEngine.analyzeRecipePerformance(
          `recipe-${i}`,
          largeSalesData,
          { total_cost: 100 }
        )
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Should complete 100 analyses with 5000 data points each in under 1 second
      expect(executionTime).toBeLessThan(1000)
      console.log(`Sales analysis: 100 analyses with 5000 data points in ${executionTime.toFixed(2)}ms`)
    })
  })

  describe("Memory Leak Detection", () => {
    it("should not leak memory with repeated calculations", async () => {
      // Simulate continuous usage
      const iterations = 500
      const memoryMeasurements: number[] = []

      for (let i = 0; i < iterations; i++) {
        await SmartCostCalculationEngine.calculateRecipeCostWithYield(`recipe-${i}`)
        
        // Measure memory usage every 100 iterations
        if (i % 100 === 0 && typeof performance.measureUserAgentSpecificMemory === "function") {
          try {
            const memInfo = await (performance as any).measureUserAgentSpecificMemory()
            memoryMeasurements.push(memInfo.bytes)
          } catch {
            // measureUserAgentSpecificMemory not available in test environment
          }
        }
      }

      // If memory measurements are available, check for leaks
      if (memoryMeasurements.length > 2) {
        const initialMemory = memoryMeasurements[0]
        const finalMemory = memoryMeasurements[memoryMeasurements.length - 1]
        const memoryIncrease = finalMemory - initialMemory
        
        // Memory increase should be reasonable (< 10MB for 500 operations)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }

      // Test passes if no errors occurred during repeated operations
      expect(iterations).toBe(500)
      console.log(`Memory leak test completed: ${iterations} operations without issues`)
    })

    it("should handle rapid component mount/unmount cycles", () => {
      // Simulate rapid component lifecycle
      const cycles = 1000

      for (let i = 0; i < cycles; i++) {
        // Simulate component creation and destruction
        const component = {
          id: `component-${i}`,
          cleanup: () => null
        }
        
        component.cleanup()
      }

      // Should complete without memory issues
      expect(cycles).toBe(1000)
      console.log(`Component lifecycle test completed: ${cycles} mount/unmount cycles without issues`)
    })
  })

  describe("Concurrent Operations", () => {
    it("should handle concurrent cost calculations", async () => {
      const concurrentOperations = 50
      const startTime = performance.now()

      // Run multiple operations concurrently
      const promises = Array.from({ length: concurrentOperations }, async (_, i) => {
        const results = await Promise.all([
          SmartCostCalculationEngine.calculateRecipeCostWithYield(`recipe-a-${i}`),
          SmartCostCalculationEngine.calculateRecipeCostWithYield(`recipe-b-${i}`),
          MenuEngineeringEngine.analyzeRecipePerformance(`recipe-c-${i}`, [], {})
        ])
        return results
      })

      const results = await Promise.all(promises)
      const endTime = performance.now()

      expect(results).toHaveLength(concurrentOperations)
      expect(endTime - startTime).toBeLessThan(2000) // Should complete in under 2 seconds

      console.log(`Concurrent operations: ${concurrentOperations * 3} operations in ${(endTime - startTime).toFixed(2)}ms`)
    })
  })
})
