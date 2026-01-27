/**
 * SubstitutionsSection - Wrapper para SubstitutionsEditor
 *
 * Integra el SubstitutionsEditor en el RecipeBuilder
 * Maneja la actualización de sustituciones en la receta
 */

import { useCallback } from 'react'
import type { Recipe, RecipeInput } from '../../../types/recipe'
import { SubstitutionsEditor } from '../components/SubstitutionsEditor'

// ============================================
// PROPS
// ============================================

interface SubstitutionsSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
}

// ============================================
// TYPES (matching SubstitutionsEditor)
// ============================================

interface Substitution {
  id: string
  originalInputId: string
  substituteItemId: string
  substituteItemName: string
  ratio: number
  notes?: string
}

// ============================================
// COMPONENT
// ============================================

export function SubstitutionsSection(props: SubstitutionsSectionProps) {
  const { recipe, updateRecipe } = props

  const inputs = recipe.inputs ?? []

  // Handler para actualizar sustituciones de un input específico
  const handleUpdateSubstitutions = useCallback(
    (inputId: string, substitutions: Substitution[]) => {
      // Actualizar el input con sus sustituciones
      const updatedInputs = inputs.map((input) => {
        if (input.id === inputId) {
          return {
            ...input,
            substitutions, // Agregar sustituciones al input
          }
        }
        return input
      })

      updateRecipe({
        inputs: updatedInputs,
      })
    },
    [inputs, updateRecipe]
  )

  return (
    <SubstitutionsEditor
      inputs={inputs}
      onUpdate={handleUpdateSubstitutions}
    />
  )
}
