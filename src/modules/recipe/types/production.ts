/**
 * Production Types - Production Execution & Scheduling
 *
 * Types for handling production execution (immediate and scheduled)
 * for elaborated materials.
 *
 * @module recipe/types/production
 */

/**
 * Production batch record
 * Tracks both immediate and scheduled production executions
 */
export interface ProductionBatch {
  id: string
  recipeId: string
  materialId?: string

  // Scheduling
  scheduledAt?: Date
  executedAt?: Date
  status: ProductionBatchStatus

  // Quantities
  expectedQuantity: number
  actualQuantity?: number
  scrapQuantity?: number
  yieldPercentage?: number

  // Quality tracking
  scrapReason?: string
  notes?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

/**
 * Production batch status
 */
export enum ProductionBatchStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Production configuration for a recipe
 * Defines how and when production is executed
 */
export interface ProductionConfig {
  // Immediate execution
  produceNow: boolean
  actualQuantity?: number
  scrapQuantity?: number
  scrapReason?: string
  productionNotes?: string

  // Scheduled execution
  scheduleProduction: boolean
  scheduledAt?: Date
  frequency?: ProductionFrequency
  nextExecution?: Date

  // Validation
  expectedQuantity: number
  unit: string
}

/**
 * Production frequency options
 */
export enum ProductionFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

/**
 * Scrap/waste reasons
 */
export enum ScrapReason {
  NORMAL_WASTE = 'normal_waste',
  QUALITY_ISSUE = 'quality_issue',
  EQUIPMENT_FAILURE = 'equipment_failure',
  OPERATOR_ERROR = 'operator_error',
  MATERIAL_DEFECT = 'material_defect',
  OTHER = 'other'
}

/**
 * Production execution result
 */
export interface ProductionExecutionResult {
  batchId: string
  success: boolean
  actualQuantity: number
  scrapQuantity: number
  yieldPercentage: number
  executedAt: Date
  error?: string
}

/**
 * Production schedule job
 */
export interface ProductionScheduleJob {
  id: string
  recipeId: string
  materialId: string
  frequency: ProductionFrequency
  scheduledAt: Date
  nextExecution: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
