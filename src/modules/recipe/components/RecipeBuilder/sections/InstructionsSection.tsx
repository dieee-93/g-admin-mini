/**
 * InstructionsSection - Instrucciones y pasos de preparación
 *
 * Features:
 * - Timing (prep time, cooking time)
 * - Step-by-step instructions
 * - Notes
 */

import { useState } from 'react'
import {
  Stack,
  Input,
  Textarea,
  Field,
  Button,
  IconButton,
  SimpleGrid,
  Box,
  Text,
  Badge,
  Flex
} from '@/shared/ui'
import { CardWrapper } from '@/shared/ui'
import type { Recipe } from '../../../types/recipe'
import type { RecipeInstruction } from '../../../types/recipe'

// ============================================
// STEP EDITOR COMPONENT
// ============================================

interface StepEditorProps {
  step: RecipeInstruction
  stepNumber: number
  onUpdate: (step: RecipeInstruction) => void
  onDelete: () => void
  canDelete: boolean
}

function StepEditor({ step, stepNumber, onUpdate, onDelete, canDelete }: StepEditorProps) {
  return (
    <Box p="4" bg="bg.subtle" borderRadius="md" borderWidth="1px">
      <Flex justify="space-between" align="center" mb="3">
        <Badge colorPalette="blue" size="lg">
          Paso {stepNumber}
        </Badge>
        {canDelete && (
          <IconButton
            aria-label="Eliminar paso"
            variant="ghost"
            colorPalette="red"
            size="sm"
            onClick={onDelete}
          >
            ✕
          </IconButton>
        )}
      </Flex>

      <Stack gap="3">
        {/* Description */}
        <Field.Root required>
          <Field.Label>Descripción</Field.Label>
          <Textarea
            placeholder="Describe el paso..."
            value={step.description}
            onChange={(e) => onUpdate({ ...step, description: e.target.value })}
            rows={3}
          />
        </Field.Root>

        {/* Duration & Temperature */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          <Field.Root>
            <Field.Label>Duración (minutos)</Field.Label>
            <Input
              type="number"
              placeholder="Ej: 10"
              value={step.duration ?? ''}
              onChange={(e) =>
                onUpdate({
                  ...step,
                  duration: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Temperatura (°C)</Field.Label>
            <Input
              type="number"
              placeholder="Ej: 180"
              value={step.temperature ?? ''}
              onChange={(e) =>
                onUpdate({
                  ...step,
                  temperature: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Field.Root>
        </SimpleGrid>

        {/* Equipment */}
        <Field.Root>
          <Field.Label>Equipamiento</Field.Label>
          <Input
            placeholder="Ej: Horno, Sartén, Batidora (separar con comas)"
            value={step.equipment?.join(', ') ?? ''}
            onChange={(e) =>
              onUpdate({
                ...step,
                equipment: e.target.value
                  ? e.target.value.split(',').map((s) => s.trim())
                  : undefined,
              })
            }
          />
          <Field.HelperText>Equipamiento necesario, separado por comas</Field.HelperText>
        </Field.Root>
      </Stack>
    </Box>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

// ============================================
// PROPS
// ============================================

interface InstructionsSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
}

// ============================================
// COMPONENT
// ============================================

export function InstructionsSection({ recipe, updateRecipe }: InstructionsSectionProps) {

  const [localInstructions, setLocalInstructions] = useState<RecipeInstruction[]>(
    recipe.instructions ?? []
  )

  // ============================================
  // HANDLERS
  // ============================================

  const handleTimingChange = (field: 'preparationTime' | 'cookingTime', value: string) => {
    const numValue = value ? Number(value) : undefined
    const updates: Record<string, number | undefined> = { [field]: numValue }

    // Auto-calculate totalTime
    if (field === 'preparationTime') {
      updates.totalTime = (numValue ?? 0) + (recipe.cookingTime ?? 0)
    } else if (field === 'cookingTime') {
      updates.totalTime = (recipe.preparationTime ?? 0) + (numValue ?? 0)
    }

    updateRecipe(updates)
  }

  const handleAddStep = () => {
    const newStep: RecipeInstruction = {
      step: localInstructions.length + 1,
      description: '',
    }
    const updatedSteps = [...localInstructions, newStep]
    setLocalInstructions(updatedSteps)
    updateRecipe({ instructions: updatedSteps })
  }

  const handleUpdateStep = (index: number, updatedStep: RecipeInstruction) => {
    const updatedSteps = [...localInstructions]
    updatedSteps[index] = updatedStep
    setLocalInstructions(updatedSteps)
    updateRecipe({ instructions: updatedSteps })
  }

  const handleDeleteStep = (index: number) => {
    const updatedSteps = localInstructions.filter((_, i) => i !== index)
    // Re-number steps
    const renumbered = updatedSteps.map((step, i) => ({ ...step, step: i + 1 }))
    setLocalInstructions(renumbered)
    updateRecipe({ instructions: renumbered })
  }

  const handleNotesChange = (value: string) => {
    updateRecipe({ notes: value })
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <CardWrapper.Title>Instrucciones de Preparación</CardWrapper.Title>
        <CardWrapper.Description>
          Define los tiempos de preparación, pasos detallados y notas adicionales
        </CardWrapper.Description>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Stack gap="5">
          {/* Timing */}
          <Box>
            <Text fontWeight="medium" mb="3">
              Tiempos de Preparación
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
              <Field.Root>
                <Field.Label>Preparación (min)</Field.Label>
                <Input
                  type="number"
                  placeholder="Ej: 15"
                  value={recipe.preparationTime ?? ''}
                  onChange={(e) => handleTimingChange('preparationTime', e.target.value)}
                />
                <Field.HelperText>Tiempo de prep antes de cocinar</Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Cocción (min)</Field.Label>
                <Input
                  type="number"
                  placeholder="Ej: 30"
                  value={recipe.cookingTime ?? ''}
                  onChange={(e) => handleTimingChange('cookingTime', e.target.value)}
                />
                <Field.HelperText>Tiempo de cocción activa</Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Total (min)</Field.Label>
                <Input
                  type="number"
                  value={recipe.totalTime ?? 0}
                  readOnly
                  disabled
                  bg="bg.muted"
                />
                <Field.HelperText>Calculado automáticamente</Field.HelperText>
              </Field.Root>
            </SimpleGrid>
          </Box>

          {/* Instructions */}
          <Box>
            <Flex justify="space-between" align="center" mb="3">
              <Text fontWeight="medium">Pasos de Preparación</Text>
              <Button size="sm" colorPalette="blue" onClick={handleAddStep}>
                + Agregar Paso
              </Button>
            </Flex>

            {localInstructions.length === 0 ? (
              <Box
                p="8"
                textAlign="center"
                bg="bg.subtle"
                borderRadius="md"
                borderWidth="1px"
                borderStyle="dashed"
              >
                <Text color="fg.muted" mb="2">
                  No hay pasos agregados
                </Text>
                <Button size="sm" variant="outline" onClick={handleAddStep}>
                  Agregar Primer Paso
                </Button>
              </Box>
            ) : (
              <Stack gap="3">
                {localInstructions.map((step, index) => (
                  <StepEditor
                    key={index}
                    step={step}
                    stepNumber={index + 1}
                    onUpdate={(updated) => handleUpdateStep(index, updated)}
                    onDelete={() => handleDeleteStep(index)}
                    canDelete={localInstructions.length > 1}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Notes */}
          <Field.Root>
            <Field.Label>Notas Adicionales</Field.Label>
            <Textarea
              placeholder="Consejos, variaciones, notas importantes..."
              value={recipe.notes ?? ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
            />
            <Field.HelperText>
              Información adicional que no encaja en los pasos (opcional)
            </Field.HelperText>
          </Field.Root>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  )
}
