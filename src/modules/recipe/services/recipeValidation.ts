/**
 * Recipe Validation Service
 *
 * Validaciones de negocio para recetas según entityType
 *
 * @module recipe/services/recipeValidation
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

  // Validaciones básicas
  if (!recipe.name || recipe.name.trim().length === 0) {
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

  // Validar output
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

  // Validar inputs
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

  // Validaciones específicas por entityType
  if (recipe.entityType && recipe.inputs) {
    const entityValidation = validateRecipeInputsByEntityType(
      recipe.entityType,
      recipe.inputs
    )
    errors.push(...entityValidation.errors)
    warnings.push(...entityValidation.warnings)
  }

  // Validar consistencia executionMode vs entityType
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
 * Valida inputs según el entityType
 */
export function validateRecipeInputsByEntityType(
  entityType: RecipeEntityType,
  inputs: any[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  switch (entityType) {
    case 'material':
      // Materials elaborados solo pueden usar materials como inputs
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && itemType !== 'material') {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Material elaborado solo puede usar materials. ` +
            `Encontrado: ${itemType}`
          )
        }
      })
      break

    case 'product':
      // Products pueden usar materials y products
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && !['material', 'product'].includes(itemType)) {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Producto solo puede usar materials o products como inputs. ` +
            `Encontrado: ${itemType}`
          )
        }
      })
      break

    case 'kit':
      // Kits solo usan products
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && itemType !== 'product') {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Kit solo puede usar productos. ` +
            `Encontrado: ${itemType}`
          )
        }
      })
      break

    case 'service':
      // Services pueden usar materials y assets
      inputs.forEach((input, index) => {
        const itemType = typeof input.item === 'object' ? input.item.type : null
        if (itemType && !['material', 'asset'].includes(itemType)) {
          errors.push(
            `Input ${index + 1} ("${input.item.name || input.item}"): ` +
            `Servicio solo puede usar materials o assets. ` +
            `Encontrado: ${itemType}`
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
    errors.push(
      'Material elaborado debe tener executionMode="immediate" ' +
      '(se produce y consume stock al crear)'
    )
  }

  // Products, Kits, Services DEBEN tener executionMode='on_demand'
  if (
    ['product', 'kit', 'service'].includes(entityType) &&
    executionMode !== 'on_demand'
  ) {
    errors.push(
      `${entityType} debe tener executionMode="on_demand" ` +
      '(se consume stock al vender/usar)'
    )
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
  const errors: string[] = []
  const warnings: string[] = []

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
      optional: i.optional,
      substituteFor: i.substituteFor,
      yieldPercentage: i.yieldPercentage,
      wastePercentage: i.wastePercentage,
      unitCostOverride: i.unitCostOverride,
      conversionFactor: i.conversionFactor,
      stage: i.stage,
      stageName: i.stageName,
      displayOrder: i.displayOrder
    })),
    category: input.category,
    tags: input.tags,
    difficulty: input.difficulty,
    preparationTime: input.preparationTime,
    cookingTime: input.cookingTime,
    totalTime: input.preparationTime && input.cookingTime
      ? input.preparationTime + input.cookingTime
      : undefined,
    instructions: input.instructions,
    notes: input.notes,
    costConfig: input.costConfig,
    imageUrl: input.imageUrl
  }

  const validation = validateRecipe(recipeForValidation)
  errors.push(...validation.errors)
  warnings.push(...validation.warnings)

  // Validaciones adicionales específicas de CreateInput
  if (input.outputYieldPercentage !== undefined) {
    if (input.outputYieldPercentage < 0 || input.outputYieldPercentage > 100) {
      errors.push('El porcentaje de rendimiento de output debe estar entre 0 y 100')
    }
  }

  if (input.outputWastePercentage !== undefined) {
    if (input.outputWastePercentage < 0 || input.outputWastePercentage > 100) {
      errors.push('El porcentaje de desperdicio de output debe estar entre 0 y 100')
    }
  }

  input.inputs.forEach((inputItem, index) => {
    if (inputItem.yieldPercentage !== undefined) {
      if (inputItem.yieldPercentage < 0 || inputItem.yieldPercentage > 100) {
        errors.push(
          `Input ${index + 1}: El porcentaje de rendimiento debe estar entre 0 y 100`
        )
      }
    }

    if (inputItem.wastePercentage !== undefined) {
      if (inputItem.wastePercentage < 0 || inputItem.wastePercentage > 100) {
        errors.push(
          `Input ${index + 1}: El porcentaje de desperdicio debe estar entre 0 y 100`
        )
      }
    }

    if (inputItem.conversionFactor !== undefined && inputItem.conversionFactor <= 0) {
      errors.push(
        `Input ${index + 1}: El factor de conversión debe ser mayor a 0`
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Crea un RecipeValidationError desde un ValidationResult
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
