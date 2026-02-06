/**
 * Recipe System - Core Types
 *
 * Definición de tipos para el sistema de recetas, BOMs, kits y composiciones de recursos.
 * Modelo industrial genérico para cualquier entidad que se compone de otras.
 *
 * CHANGES v3.0:
 * - 🗑️ REMOVAL: Removed all gastronomic fields (allergens, nutrition, times, etc.)
 * - 🏭 INDUSTRIAL: Focused on Inputs/Outputs and basic identity.
 *
 * @module recipe/types
 */

/**
 * Recipe: Composición genérica de recursos
 */
export interface Recipe<TInput = RecipeItem, TOutput = RecipeItem> {
  // Identity
  id: string
  name: string
  description?: string
  entityType: RecipeEntityType

  // Output (qué produce)
  output: RecipeOutput<TOutput>

  // Inputs (qué consume)
  inputs: RecipeInput<TInput>[]

  // CRÍTICO: Modo de ejecución (consumo de stock)
  executionMode: RecipeExecutionMode

  // Metadata
  tags?: string[]
  difficulty?: DifficultyLevel

  // Instructions
  instructions?: RecipeInstruction[]
  notes?: string

  // Costing
  costConfig?: RecipeCostConfig

  // Analytics
  metrics?: RecipeMetrics

  // Image
  imageUrl?: string

  // Audit
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  version?: number
}

/**
 * RecipeOutput: Qué produce la receta
 */
export interface RecipeOutput<T = RecipeItem> {
  item: T | string  // Entity o ID
  quantity: number
  unit: string

  // Rendimiento
  yieldPercentage?: number  // % de rendimiento esperado (default: 100)
  wastePercentage?: number  // % de desperdicio esperado (default: 0)

  // Calidad
  qualityGrade?: QualityGrade
}

/**
 * RecipeInput: Qué consume la receta
 */
export interface RecipeInput<T = RecipeItem> {
  id: string
  item: T | string  // Entity o ID
  quantity: number
  unit: string

  // Opciones
  optional?: boolean
  substituteFor?: string  // ID del input que reemplaza

  // Rendimiento
  yieldPercentage?: number  // % de rendimiento del input (default: 100)
  wastePercentage?: number  // % de desperdicio del input (default: 0)

  // Costing
  unitCostOverride?: number  // Override del costo unitario
  conversionFactor?: number  // Factor de conversión de unidades

  // Stage (para procesos multi-paso)
  stage?: number
  stageName?: string

  // Display order
  displayOrder?: number
}

/**
 * RecipeItem: Tipo base para items en recipe
 */
export interface RecipeItem {
  id: string
  name: string
  type: string // MEASURABLE, COUNTABLE, etc.
  unit?: string
  currentStock?: number
  unitCost?: number
}

/**
 * RecipeInstruction: Paso de proceso
 */
export interface RecipeInstruction {
  step: number
  description: string
  duration?: number  // minutos
  equipment?: string[]
  image?: string
}

/**
 * RecipeCostConfig: Configuración de cálculo de costos
 */
export interface RecipeCostConfig {
  includeLabor: boolean
  includeProfitability: boolean

  // Labor
  laborCostPerHour?: number
  laborHours?: number

  // Overhead
  overheadPercentage?: number  // % sobre costo de materiales
  overheadFixed?: number       // Monto fijo

  // Packaging
  packagingCost?: number
}

/**
 * RecipeMetrics: Métricas y analytics
 */
export interface RecipeMetrics {
  popularityScore?: number
  profitabilityScore?: number
  efficiencyScore?: number
  timesProduced?: number
  lastProducedAt?: Date
}

// ============================================
// ENUMS
// ============================================

export enum RecipeEntityType {
  MATERIAL = 'material',
  PRODUCT = 'product',
  KIT = 'kit',
  SERVICE = 'service'
}

export enum RecipeExecutionMode {
  IMMEDIATE = 'immediate',
  ON_DEMAND = 'on_demand'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum QualityGrade {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  ECONOMY = 'economy'
}

// ============================================
// CREATE/UPDATE TYPES
// ============================================

export interface CreateRecipeInput {
  name: string
  description?: string
  entityType: RecipeEntityType
  executionMode: RecipeExecutionMode

  // Output
  outputItemId: string
  outputQuantity: number
  outputUnit: string
  outputYieldPercentage?: number
  outputWastePercentage?: number
  outputQualityGrade?: QualityGrade

  // Inputs
  inputs: CreateRecipeInputItem[]

  // Metadata
  tags?: string[]
  difficulty?: DifficultyLevel

  // Instructions
  instructions?: RecipeInstruction[]
  notes?: string

  // Costing
  costConfig?: RecipeCostConfig

  // Image
  imageUrl?: string
}

export interface CreateRecipeInputItem {
  itemId: string
  quantity: number
  unit: string
  optional?: boolean
  substituteFor?: string
  yieldPercentage?: number
  wastePercentage?: number
  unitCostOverride?: number
  conversionFactor?: number
  stage?: number
  stageName?: string
  displayOrder?: number
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class RecipeValidationError extends Error {
  constructor(
    message: string,
    public errors: string[],
    public warnings: string[] = []
  ) {
    super(message)
    this.name = 'RecipeValidationError'
  }
}