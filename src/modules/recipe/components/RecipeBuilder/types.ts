/**
 * RecipeBuilder Types
 *
 * Props y tipos para el componente RecipeBuilder
 */

import type { Recipe, RecipeItem } from '../../types/recipe'

// ============================================
// BUILDER PROPS
// ============================================

/**
 * Complejidad del RecipeBuilder
 * - minimal: Solo campos básicos (para materials elaborados)
 * - standard: Campos completos (para products)
 * - advanced: Todas las features + analytics
 */
export type RecipeBuilderComplexity = 'minimal' | 'standard' | 'advanced'

/**
 * Features opcionales del RecipeBuilder
 *
 * @updated 2026-01-07 - Simplified based on theory and real usage
 * Changes:
 * - ❌ Removed: showQualityConfig (obsolete)
 * - ❌ Removed: showScrapConfig (moved to ProductionConfigSection)
 * - ✅ Added: showScalingLite (quick scaling buttons)
 * - ✅ Added: allowProductInputs (for BOM with products)
 */
export interface RecipeBuilderFeatures {
  showCostCalculation?: boolean
  showAnalytics?: boolean
  showInstructions?: boolean
  showScalingLite?: boolean // 🆕 Quick scaling buttons (×2, ÷2, Custom)
  allowSubstitutions?: boolean
  enableAiSuggestions?: boolean
  allowProductInputs?: boolean // 🆕 Allow products as inputs (for BOM)
}

/**
 * Props del RecipeBuilder
 */
export interface RecipeBuilderProps {
  // Modo
  mode: 'create' | 'edit'

  // Tipo de entidad
  entityType: 'material' | 'product' | 'kit' | 'service'

  // Complejidad de UI
  complexity?: RecipeBuilderComplexity

  // Features habilitados
  features?: RecipeBuilderFeatures

  // Data inicial
  initialData?: Partial<Recipe>
  recipeId?: string // Para modo edit

  // Output configuration (pre-filled)
  outputItem?: RecipeItem
  outputQuantity?: number

  // Callbacks
  onSave?: (recipe: Recipe) => void | Promise<void>
  onCancel?: () => void
  onChange?: (recipe: Partial<Recipe>) => void

  // UI Control
  hideActions?: boolean // Hide save/cancel buttons when embedded in a parent form

  // Validación
  validateOnChange?: boolean
  customValidation?: (recipe: Partial<Recipe>) => ValidationResult
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// ============================================
// BUILDER CONTEXT
// ============================================

/**
 * Context value del RecipeBuilder
 */
export interface RecipeBuilderContextValue {
  // State
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void

  // Validation
  validation: ValidationResult
  validateRecipe: () => ValidationResult

  // Submission
  isSubmitting: boolean
  saveRecipe: () => Promise<Recipe | null>

  // Metadata
  mode: 'create' | 'edit'
  entityType: 'material' | 'product' | 'kit' | 'service'
  complexity: RecipeBuilderComplexity
  features: Required<RecipeBuilderFeatures>
}

// ============================================
// SECTION PROPS
// ============================================

/**
 * Props base para secciones del builder
 */
export interface RecipeBuilderSectionProps {
  onChange: (updates: Partial<Recipe>) => void
}
