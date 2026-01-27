/**
 * Recipe System - Execution Types
 *
 * Tipos para ejecución y tracking de producción de recetas
 *
 * @module recipe/types/execution
 */

import type { RecipeInput, QualityGrade } from './recipe'

/**
 * Ejecución de receta (producción)
 */
export interface RecipeExecution {
  id: string
  recipeId: string
  recipeName: string

  // Cantidades
  batches: number
  outputQuantity: number
  outputUnit: string

  // Inputs consumidos
  inputsConsumed: RecipeInputConsumed[]

  // Costos
  expectedCost: number
  actualCost: number
  costVariance: number

  // Timing
  startedAt: Date
  completedAt?: Date
  expectedDuration?: number  // minutos
  actualDuration?: number    // minutos

  // Calidad y rendimiento
  yieldPercentage?: number
  qualityGrade?: QualityGrade

  // Metadata
  executedBy?: string
  notes?: string
  status: ExecutionStatus

  // Audit
  createdAt: Date
}

/**
 * Input consumido en una ejecución
 */
export interface RecipeInputConsumed {
  inputId: string
  itemId: string
  itemName: string
  quantityPlanned: number
  quantityActual: number
  variance: number
  unit: string
  cost: number
}

/**
 * Estado de ejecución
 */
export enum ExecutionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

/**
 * Input para ejecutar receta
 */
export interface ExecuteRecipeInput {
  recipeId: string
  batches?: number
  notes?: string
}

/**
 * Input para completar ejecución
 */
export interface CompleteExecutionInput {
  executionId: string
  actualCost?: number
  actualDuration?: number
  yieldPercentage?: number
  qualityGrade?: QualityGrade
  notes?: string
}

/**
 * Viabilidad de receta (verificación antes de ejecutar)
 */
export interface RecipeViability {
  isViable: boolean
  canExecute: boolean
  issues: ViabilityIssue[]
  estimatedCost: number
  availableStock: Record<string, number>
}

export interface ViabilityIssue {
  type: 'stock' | 'cost' | 'equipment' | 'staff' | 'other'
  severity: 'critical' | 'warning' | 'info'
  message: string
  itemId?: string
}
