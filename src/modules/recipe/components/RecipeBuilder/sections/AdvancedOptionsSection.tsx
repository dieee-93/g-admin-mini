/**
 * AdvancedOptionsSection - Configuraciones avanzadas
 *
 * Features:
 * - Difficulty level
 * - Tags
 * - Quality grade
 * - Advanced cost config (overhead, packaging)
 *
 * NOTE: Yield & Waste se configuran en OutputConfigSection (evita duplicación)
 *
 * Visible solo en complexity='advanced'
 */

import { Stack, Input, Field, SelectField, SimpleGrid, Box, Typography, Badge, Flex, Text } from '@/shared/ui'
import { CardWrapper } from '@/shared/ui'
import type { Recipe } from '../../../types/recipe'
import type { RecipeBuilderFeatures } from '../types'
import { DifficultyLevel, QualityGrade } from '../../../types/recipe'

// ============================================
// DIFFICULTY OPTIONS
// ============================================

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: DifficultyLevel.BEGINNER, label: 'Principiante', color: 'green' },
  { value: DifficultyLevel.INTERMEDIATE, label: 'Intermedio', color: 'blue' },
  { value: DifficultyLevel.ADVANCED, label: 'Avanzado', color: 'orange' },
  { value: DifficultyLevel.EXPERT, label: 'Experto', color: 'red' },
]

// ============================================
// QUALITY OPTIONS
// ============================================

const QUALITY_OPTIONS: { value: QualityGrade; label: string; color: string }[] = [
  { value: QualityGrade.PREMIUM, label: 'Premium', color: 'purple' },
  { value: QualityGrade.STANDARD, label: 'Estándar', color: 'blue' },
  { value: QualityGrade.ECONOMY, label: 'Económico', color: 'gray' },
]

// ============================================
// COMPONENT
// ============================================

// ============================================
// PROPS
// ============================================

interface AdvancedOptionsSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  features: Required<RecipeBuilderFeatures>
}

// ============================================
// COMPONENT
// ============================================

export function AdvancedOptionsSection({ recipe, updateRecipe }: AdvancedOptionsSectionProps) {

  // ============================================
  // HANDLERS
  // ============================================

  const handleTagsChange = (value: string) => {
    const tags = value ? value.split(',').map((t) => t.trim()) : []
    updateRecipe({ tags })
  }

  const handleQualityGradeChange = (value: string) => {
    const qualityGrade = value ? (value as QualityGrade) : undefined
    updateRecipe({
      output: {
        ...recipe.output,
        qualityGrade,
      },
    })
  }

  const handleCostConfigChange = (field: string, value: string) => {
    const numValue = value ? Number(value) : undefined
    updateRecipe({
      costConfig: {
        ...recipe.costConfig,
        [field]: numValue,
      },
    })
  }

  // ============================================
  // RENDER
  // ============================================

  const selectedDifficulty = DIFFICULTY_OPTIONS.find((d) => d.value === recipe.difficulty)
  const selectedQuality = QUALITY_OPTIONS.find((q) => q.value === recipe.output?.qualityGrade)

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <CardWrapper.Title>Opciones Avanzadas</CardWrapper.Title>
        <CardWrapper.Description>
          Configura nivel de dificultad, etiquetas, calidad del producto y costos avanzados
        </CardWrapper.Description>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Stack gap="5">
          {/* Difficulty & Tags */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {/* Difficulty */}
            <Box>
              <SelectField
                label="Nivel de Dificultad"
                placeholder="Selecciona nivel"
                options={DIFFICULTY_OPTIONS.map(d => ({ value: d.value, label: d.label }))}
                value={recipe.difficulty ? [recipe.difficulty] : []}
                onValueChange={(details) =>
                  updateRecipe({ difficulty: details.value[0] as DifficultyLevel | undefined })
                }
                helperText="Nivel de habilidad requerido para ejecutar esta receta"
              />
              {selectedDifficulty && (
                <Flex mt="1">
                  <Badge colorPalette={selectedDifficulty.color} size="sm">
                    {selectedDifficulty.label}
                  </Badge>
                </Flex>
              )}
            </Box>

            {/* Tags */}
            <Field.Root>
              <Field.Label>Etiquetas</Field.Label>
              <Input
                placeholder="vegetariano, sin gluten, rápido..."
                value={recipe.tags?.join(', ') ?? ''}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              <Field.HelperText>Etiquetas separadas por comas</Field.HelperText>
            </Field.Root>
          </SimpleGrid>

          {/* Output Quality (Quality Grade SOLO - yield/waste están en OutputConfigSection) */}
          {/* Según RECIPE_DESIGN_DEFINITIVO.md: Quality Grade se eliminará, pero por ahora lo dejamos aquí */}
          <Box>
            <Text fontWeight="medium" mb="3">
              Calidad del Producto Final
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {/* Quality Grade */}
              <Box>
                <SelectField
                  label="Grado de Calidad"
                  placeholder="No especificado"
                  options={QUALITY_OPTIONS.map(q => ({ value: q.value, label: q.label }))}
                  value={recipe.output?.qualityGrade ? [recipe.output.qualityGrade] : []}
                  onValueChange={(details) => handleQualityGradeChange(details.value[0] || '')}
                />
                {selectedQuality && (
                  <Flex mt="1">
                    <Badge colorPalette={selectedQuality.color} size="sm">
                      {selectedQuality.label}
                    </Badge>
                  </Flex>
                )}
              </Box>

              {/* Info sobre yield/waste */}
              <Box p="3" bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.700">
                  💡 <strong>Nota:</strong> Los campos de Rendimiento (%) y Desperdicio (%) se configuran en la sección "Configuración de Salida" para evitar duplicación.
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Advanced Costing */}
          <Box>
            <Text fontWeight="medium" mb="3">
              Configuración Avanzada de Costos
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
              {/* Overhead Percentage */}
              <Field.Root>
                <Field.Label>Overhead (%)</Field.Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  value={recipe.costConfig?.overheadPercentage ?? ''}
                  onChange={(e) => handleCostConfigChange('overheadPercentage', e.target.value)}
                />
                <Field.HelperText>% sobre costo de materiales</Field.HelperText>
              </Field.Root>

              {/* Overhead Fixed */}
              <Field.Root>
                <Field.Label>Overhead Fijo ($)</Field.Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={recipe.costConfig?.overheadFixed ?? ''}
                  onChange={(e) => handleCostConfigChange('overheadFixed', e.target.value)}
                />
                <Field.HelperText>Monto fijo de overhead</Field.HelperText>
              </Field.Root>

              {/* Packaging Cost */}
              <Field.Root>
                <Field.Label>Empaquetado ($)</Field.Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={recipe.costConfig?.packagingCost ?? ''}
                  onChange={(e) => handleCostConfigChange('packagingCost', e.target.value)}
                />
                <Field.HelperText>Costo de empaquetado</Field.HelperText>
              </Field.Root>
            </SimpleGrid>
          </Box>

          {/* Info box */}
          <Box p="3" bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              <strong>💡 Tip:</strong> Estas opciones avanzadas afectan el cálculo de costos y la
              trazabilidad del producto. Úsalas para recetas que requieren configuración precisa de
              rendimiento y overhead.
            </Text>
          </Box>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  )
}
