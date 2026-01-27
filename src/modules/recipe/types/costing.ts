/**
 * Recipe System - Costing Types
 *
 * Tipos para cálculo de costos de recetas con precisión decimal
 *
 * @module recipe/types/costing
 */

import type { RecipeInput, RecipeOutput } from './recipe'

/**
 * Resultado completo de cálculo de costos
 */
export interface RecipeCostResult {
  // Costos base
  materialsCost: number
  laborCost: number
  overheadCost: number
  packagingCost: number
  totalCost: number

  // Por unidad
  costPerUnit: number
  costPerPortion?: number

  // Breakdown por input
  inputsBreakdown: RecipeInputCost[]

  // Yield analysis
  yieldAnalysis: YieldAnalysis

  // Profitability (opcional)
  profitability?: RecipeProfitability

  // Metadata
  calculatedAt: Date
  costingMethod?: string
}

/**
 * Costo de un input específico
 */
export interface RecipeInputCost {
  inputId: string
  itemId: string
  itemName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  percentageOfTotal: number
  yieldAdjustedCost: number
}

/**
 * Análisis de rendimiento
 */
export interface YieldAnalysis {
  theoreticalYield: number
  actualYield: number
  yieldPercentage: number
  wasteFactor: number
  efficiencyScore: number
}

/**
 * Análisis de rentabilidad
 */
export interface RecipeProfitability {
  sellingPrice?: number
  profitMargin?: number
  profitPercentage?: number
  breakEvenPrice: number
  targetFoodCostPercentage?: number
  actualFoodCostPercentage?: number
}

/**
 * Opciones para cálculo de costos
 */
export interface RecipeCostOptions {
  includeLabor?: boolean
  includeOverhead?: boolean
  includePackaging?: boolean
  includeProfitability?: boolean
  laborCostPerHour?: number
  laborHours?: number
  overheadPercentage?: number
  packagingCost?: number
  sellingPrice?: number
  targetMargin?: number
}

/**
 * Input para cálculo de costos
 */
export interface CalculateCostInput {
  recipeId?: string
  inputs: RecipeInput[]
  output: RecipeOutput
  options?: RecipeCostOptions
}

/**
 * Error de cálculo de costos
 */
export class RecipeCostCalculationError extends Error {
  constructor(
    message: string,
    public recipeId?: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'RecipeCostCalculationError'
  }
}
