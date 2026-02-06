/**
 * Recipe Templates System
 *
 * Permite crear recetas desde templates pre-configurados o guardados
 */

import type { Recipe, RecipeEntityType } from './recipe'

// ============================================
// TEMPLATE TYPES
// ============================================

/**
 * Recipe Template
 */
export interface RecipeTemplate {
  id: string
  name: string
  description?: string
  entityType: RecipeEntityType

  // Template metadata
  isPublic: boolean          // ¿Template público (pre-configurado)?
  createdBy?: string         // User ID del creador
  useCount?: number          // Veces que se usó

  // Recipe configuration
  recipeData: Partial<Recipe>

  // Preview
  imageUrl?: string
  tags?: string[]

  // Audit
  createdAt: Date
  updatedAt: Date
}

/**
 * Template Category
 */
export enum TemplateCategory {
  // Gastronomía
  APPETIZERS = 'appetizers',
  MAINS = 'mains',
  DESSERTS = 'desserts',
  BEVERAGES = 'beverages',

  // Producción
  MANUFACTURING = 'manufacturing',
  ASSEMBLY = 'assembly',

  // Servicios
  SERVICES = 'services',

  // Personalizados
  CUSTOM = 'custom'
}

/**
 * Pre-configured templates (built-in)
 */
export interface BuiltInTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  entityType: RecipeEntityType
  recipeData: Partial<Recipe>
  imageUrl?: string
  tags: string[]
}

// ============================================
// TEMPLATE ACTIONS
// ============================================

export interface CreateTemplateInput {
  name: string
  description?: string
  entityType: RecipeEntityType
  recipeData: Partial<Recipe>
  isPublic?: boolean
  tags?: string[]
  imageUrl?: string
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  id: string
}

export interface ApplyTemplateInput {
  templateId: string
  overrides?: Partial<Recipe>
}
