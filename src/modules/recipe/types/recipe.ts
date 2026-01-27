/**
 * Recipe System - Core Types
 *
 * Definición de tipos para el sistema de recetas, BOMs, kits y composiciones de recursos.
 * No se limita a gastronomía - es una abstracción genérica para cualquier entidad
 * que se compone de otras entidades.
 *
 * @module recipe/types
 */

/**
 * Recipe: Composición genérica de recursos
 *
 * @template TInput - Tipo de recurso de entrada (Material, Product, Asset, etc.)
 * @template TOutput - Tipo de recurso de salida (Material, Product, Service, etc.)
 *
 * IMPORTANTE - Execution Mode:
 * - executionMode='immediate': Para materials (consume stock al crear)
 * - executionMode='on_demand': Para products/kits (consume stock al vender)
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
  category?: RecipeCategory
  tags?: string[]
  difficulty?: DifficultyLevel

  // Timing
  preparationTime?: number  // minutos
  cookingTime?: number      // minutos
  totalTime?: number        // minutos

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

  // Stage (para recetas multi-paso)
  stage?: number
  stageName?: string

  // Display order
  displayOrder?: number
}

/**
 * RecipeItem: Tipo base para items en recipe
 * Puede ser Material, Product, Asset, Service, etc.
 */
export interface RecipeItem {
  id: string
  name: string
  type: RecipeItemType
  unit?: string
  currentStock?: number
  unitCost?: number
}

/**
 * RecipeInstruction: Paso de preparación
 */
export interface RecipeInstruction {
  step: number
  description: string
  duration?: number  // minutos
  temperature?: number  // °C
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

  // Costing method (para materials)
  costingMethod?: CostingMethod
}

/**
 * RecipeMetrics: Métricas y analytics
 */
export interface RecipeMetrics {
  popularityScore?: number      // 0-100
  profitabilityScore?: number   // 0-100
  efficiencyScore?: number      // 0-100
  timesProduced?: number
  lastProducedAt?: Date
  averageProductionTime?: number  // minutos
}

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Tipo de entidad que usa la receta
 */
export enum RecipeEntityType {
  MATERIAL = 'material',    // Material elaborado
  PRODUCT = 'product',      // Producto con BOM
  KIT = 'kit',              // Kit de productos
  SERVICE = 'service'       // Servicio con recursos
}

/**
 * Tipo de item en recipe
 */
export enum RecipeItemType {
  MATERIAL = 'material',
  PRODUCT = 'product',
  ASSET = 'asset',
  SERVICE = 'service'
}

/**
 * Modo de ejecución de la receta
 * - immediate: Ejecutar al crear (Materials) → Consume stock inmediatamente
 * - on_demand: Ejecutar al vender/usar (Products, Kits, Services) → Consume stock después
 */
export enum RecipeExecutionMode {
  IMMEDIATE = 'immediate',
  ON_DEMAND = 'on_demand'
}

/**
 * Categorías de recetas
 */
export enum RecipeCategory {
  // Gastronomía
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SAUCE = 'sauce',

  // Producción
  ASSEMBLY = 'assembly',
  MANUFACTURING = 'manufacturing',
  PACKAGING = 'packaging',

  // Servicios
  PROCEDURE = 'procedure',
  MAINTENANCE = 'maintenance',

  // Otros
  KIT = 'kit',
  BUNDLE = 'bundle',
  OTHER = 'other'
}

/**
 * Nivel de dificultad
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

/**
 * Grado de calidad
 */
export enum QualityGrade {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  ECONOMY = 'economy'
}

/**
 * Método de costeo (para materials)
 */
export enum CostingMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  AVERAGE = 'AVERAGE',
  STANDARD = 'STANDARD'
}

// ============================================================================
// CREATE/UPDATE TYPES
// ============================================================================

/**
 * Input para crear una receta
 */
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
  category?: RecipeCategory
  tags?: string[]
  difficulty?: DifficultyLevel

  // Timing
  preparationTime?: number
  cookingTime?: number

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

/**
 * Input para actualizar una receta
 */
export type UpdateRecipeInput = Partial<CreateRecipeInput>

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Error de validación de receta
 */
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
