/**
 * Recipe Validation Service
 *
 * Validaciones de negocio industriales para recetas según entityType.
 *
 * CHANGES v3.0:
 * - 🗑️ REMOVAL: Removed validation for gastronomic fields and times.
 * - ✅ FIX: Proper check for item types (MEASURABLE, COUNTABLE, ELABORATED).
 */

import type {
  Recipe,
  CreateRecipeInput,
  ValidationResult,
  RecipeValidationError,
  RecipeEntityType,
  RecipeExecutionMode
} from '../types'

/**
 * Valida una receta completa
 */
export function validateRecipe(recipe: Partial<Recipe>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Identity: Name is optional only for materials (intrinsic)
  if ((!recipe.name || recipe.name.trim().length === 0) && recipe.entityType !== 'material') {
    errors.push('El nombre de la receta es requerido')
  }

  if (recipe.name && recipe.name.length > 255) {
    errors.push('El nombre de la receta no puede exceder 255 caracteres')
  }

  if (!recipe.entityType) {
    errors.push('El tipo de entidad es requerido')
  }

  if (!recipe.executionMode) {
    errors.push('El modo de ejecución es requerido')
  }

  // Output Validation
  if (!recipe.output) {
    errors.push('El output de la receta es requerido')
  } else {
    if (!recipe.output.item) {
      errors.push('El item de output es requerido')
    }
    if (!recipe.output.quantity || recipe.output.quantity <= 0) {
      errors.push('La cantidad de output debe ser mayor a 0')
    }
    if (!recipe.output.unit) {
      errors.push('La unidad de output es requerida')
    }
  }

  // Inputs Validation
  if (!recipe.inputs || recipe.inputs.length === 0) {
    errors.push('La receta debe tener al menos un ingrediente/componente')
  } else {
    recipe.inputs.forEach((input, index) => {
      if (!input.item) {
        errors.push(`Input ${index + 1}: El item es requerido`)
      }
      if (!input.quantity || input.quantity <= 0) {
        errors.push(`Input ${index + 1}: La cantidad debe ser mayor a 0`)
      }
      if (!input.unit) {
        errors.push(`Input ${index + 1}: La unidad es requerida`)
      }
    })
  }

  // Entity-specific input rules
  if (recipe.entityType && recipe.inputs) {
    const entityValidation = validateRecipeInputsByEntityType(
      recipe.entityType,
      recipe.inputs
    )
    errors.push(...entityValidation.errors)
    warnings.push(...entityValidation.warnings)
  }

  // Execution Mode consistency
  if (recipe.entityType && recipe.executionMode) {
    const modeValidation = validateExecutionMode(
      recipe.entityType,
      recipe.executionMode
    )
    errors.push(...modeValidation.errors)
    warnings.push(...modeValidation.warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Valida inputs según el entityType (Reglas industriales)
 */
export function validateRecipeInputsByEntityType(
  entityType: RecipeEntityType,
  inputs: any[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const VALID_MATERIAL_TYPES = ['material', 'MEASURABLE', 'COUNTABLE', 'ELABORATED'];

  switch (entityType) {
    case 'material':
      // Materials elaborados solo pueden usar materials como inputs
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && !VALID_MATERIAL_TYPES.includes(itemType)) {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Material elaborado solo puede usar materias primas. ` +
            `Encontrado: ${itemType}`
          )
        }
      })
      break

    case 'product':
      // Products pueden usar materials y otros productos (BOM anidado)
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && !['product', ...VALID_MATERIAL_TYPES].includes(itemType)) {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Producto solo puede usar materiales o productos como componentes. ` +
            `Encontrado: ${itemType}`
          )
        }
      })
      break

    case 'kit':
      // Kits solo usan productos terminados
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && itemType !== 'product') {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Kit solo puede usar productos terminados.`
          )
        }
      })
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Valida consistencia entre entityType y executionMode
 */
export function validateExecutionMode(
  entityType: RecipeEntityType,
  executionMode: RecipeExecutionMode
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Materials DEBEN tener executionMode='immediate'
  if (entityType === 'material' && executionMode !== 'immediate') {
    errors.push('Material elaborado debe consumirse inmediatamente al producirse.')
  }

  // Products, Kits DEBEN tener executionMode='on_demand'
  if (['product', 'kit'].includes(entityType) && executionMode !== 'on_demand') {
    errors.push(`${entityType} debe consumirse al momento de la venta (on_demand).`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Valida CreateRecipeInput antes de enviar a API
 */
export function validateCreateRecipeInput(
  input: CreateRecipeInput
): ValidationResult {
  // Convertir a Recipe parcial para reutilizar validación
  const recipeForValidation: Partial<Recipe> = {
    name: input.name,
    description: input.description,
    entityType: input.entityType,
    executionMode: input.executionMode,
    output: {
      item: input.outputItemId,
      quantity: input.outputQuantity,
      unit: input.outputUnit,
      yieldPercentage: input.outputYieldPercentage,
      wastePercentage: input.outputWastePercentage,
      qualityGrade: input.outputQualityGrade
    },
    inputs: input.inputs.map(i => ({
      id: crypto.randomUUID(),
      item: i.itemId,
      quantity: i.quantity,
      unit: i.unit,
      yieldPercentage: i.yieldPercentage,
      wastePercentage: i.wastePercentage,
      conversionFactor: i.conversionFactor,
      stage: i.stage,
      stageName: i.stageName,
      displayOrder: i.displayOrder
    })),
    tags: input.tags,
    difficulty: input.difficulty,
    instructions: input.instructions,
    notes: input.notes,
    costConfig: input.costConfig,
    imageUrl: input.imageUrl
  }

  return validateRecipe(recipeForValidation)
}

/**
 * Crea un RecipeValidationError
 */
export function createValidationError(
  validation: ValidationResult,
  message: string = 'Validation failed'
): RecipeValidationError {
  return new (class extends Error {
    constructor(
      public message: string,
      public errors: string[],
      public warnings: string[]
    ) {
      super(message)
      this.name = 'RecipeValidationError'
    }
  })(message, validation.errors, validation.warnings) as any
}