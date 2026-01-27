/**
 * BasicInfoSection v2.0 - Industrial Production Order Basic Info
 *
 * REDESIGNED with industrial aesthetics matching OutputConfigSection:
 * - Blue gradient top bar (4px)
 * - Heavy 3px borders
 * - Typography with uppercase labels and letter spacing
 * - Professional manufacturing feel
 *
 * Campos:
 * - Nombre
 * - Descripción
 * - Categoría
 *
 * Architecture:
 * - Receives props (no context) following project pattern
 * - Memoized to prevent unnecessary re-renders
 */

import { memo, useMemo } from 'react'
import { Stack, Input, TextareaField, SelectField, Flex, Box, Typography, Field } from '@/shared/ui'
import { RecipeCategory } from '../../../types/recipe'
import type { Recipe } from '../../../types/recipe'
import { RecipeTooltips } from '../components/HelpTooltip'

// ============================================
// PROPS
// ============================================

interface BasicInfoSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  entityType: 'material' | 'product' | 'kit' | 'service'
}

// ============================================
// CATEGORY OPTIONS
// ============================================

const CATEGORY_OPTIONS: { value: RecipeCategory; label: string }[] = [
  // Gastronomía
  { value: RecipeCategory.APPETIZER, label: 'Entrada' },
  { value: RecipeCategory.SOUP, label: 'Sopa' },
  { value: RecipeCategory.SALAD, label: 'Ensalada' },
  { value: RecipeCategory.MAIN_COURSE, label: 'Plato Principal' },
  { value: RecipeCategory.SIDE_DISH, label: 'Guarnición' },
  { value: RecipeCategory.DESSERT, label: 'Postre' },
  { value: RecipeCategory.BEVERAGE, label: 'Bebida' },
  { value: RecipeCategory.SAUCE, label: 'Salsa' },

  // Producción
  { value: RecipeCategory.ASSEMBLY, label: 'Ensamblaje' },
  { value: RecipeCategory.MANUFACTURING, label: 'Manufactura' },
  { value: RecipeCategory.PACKAGING, label: 'Empaquetado' },

  // Servicios
  { value: RecipeCategory.PROCEDURE, label: 'Procedimiento' },
  { value: RecipeCategory.MAINTENANCE, label: 'Mantenimiento' },

  // Otros
  { value: RecipeCategory.KIT, label: 'Kit' },
  { value: RecipeCategory.BUNDLE, label: 'Bundle' },
  { value: RecipeCategory.OTHER, label: 'Otro' },
]

// ============================================
// HELPER: Filter categories by entity type
// ============================================

function getAvailableCategories(entityType: string): typeof CATEGORY_OPTIONS {
  if (entityType === 'material' || entityType === 'product') {
    // Gastronomía + Producción
    return CATEGORY_OPTIONS.filter((c) =>
      [
        RecipeCategory.APPETIZER,
        RecipeCategory.SOUP,
        RecipeCategory.SALAD,
        RecipeCategory.MAIN_COURSE,
        RecipeCategory.SIDE_DISH,
        RecipeCategory.DESSERT,
        RecipeCategory.BEVERAGE,
        RecipeCategory.SAUCE,
        RecipeCategory.ASSEMBLY,
        RecipeCategory.MANUFACTURING,
        RecipeCategory.PACKAGING,
        RecipeCategory.OTHER,
      ].includes(c.value)
    )
  } else if (entityType === 'kit') {
    // Solo Kit/Bundle
    return CATEGORY_OPTIONS.filter((c) =>
      [RecipeCategory.KIT, RecipeCategory.BUNDLE, RecipeCategory.OTHER].includes(c.value)
    )
  } else if (entityType === 'service') {
    // Solo Procedures
    return CATEGORY_OPTIONS.filter((c) =>
      [RecipeCategory.PROCEDURE, RecipeCategory.MAINTENANCE, RecipeCategory.OTHER].includes(
        c.value
      )
    )
  }

  return CATEGORY_OPTIONS
}

// ============================================
// COMPONENT
// ============================================

/**
 * BasicInfoSection v2.0 - Industrial basic info section
 *
 * @component
 * @description
 * Industrial production order section for basic recipe information.
 * Features heavy borders, blue gradient header, and professional typography.
 *
 * Design:
 * - Blue gradient top bar (4px)
 * - Heavy 3px borders
 * - Uppercase labels with increased letter spacing
 * - Monospace inputs for production data entry
 *
 * @param {BasicInfoSectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function BasicInfoSectionComponent({ recipe, updateRecipe, entityType }: BasicInfoSectionProps) {
  const availableCategories = getAvailableCategories(entityType)

  // Create options for SelectField
  const categoryOptions = useMemo(() => {
    return availableCategories.map(cat => ({
      value: cat.value,
      label: cat.label,
    }))
  }, [availableCategories])

  return (
    <Box
      position="relative"
      p="6"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      css={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        {/* Header */}
        <Typography
          fontSize="xs"
          fontWeight="800"
          color="fg.muted"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Información de la Orden de Producción
        </Typography>

        {/* Nombre */}
        <Field.Root required>
          <Field.Label>
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
            >
              Nombre de la Receta
            </Typography>
          </Field.Label>
          <Input
            placeholder="Ej: Hamburguesa Clásica"
            value={recipe.name ?? ''}
            onChange={(e) => updateRecipe({ name: e.target.value })}
            css={{
              fontFamily: 'var(--chakra-fonts-mono)',
              fontSize: 'var(--chakra-fontSizes-md)',
              fontWeight: '600'
            }}
          />
          <Field.HelperText>
            Nombre descriptivo que identifica esta receta
          </Field.HelperText>
        </Field.Root>

        {/* Descripción */}
        <Field.Root>
          <Field.Label>
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
            >
              Descripción
            </Typography>
          </Field.Label>
          <TextareaField
            placeholder="Describe esta receta..."
            value={recipe.description ?? ''}
            onChange={(e) => updateRecipe({ description: e.target.value })}
            rows={3}
            css={{
              fontFamily: 'var(--chakra-fonts-mono)',
              fontSize: 'var(--chakra-fontSizes-sm)',
            }}
          />
          <Field.HelperText>
            Breve descripción de la receta (opcional)
          </Field.HelperText>
        </Field.Root>

        {/* Categoría */}
        <Field.Root>
          <Field.Label>
            <Flex align="center" gap="2">
              <Typography
                fontSize="xs"
                fontWeight="700"
                letterSpacing="wider"
                textTransform="uppercase"
                color="fg.muted"
              >
                Categoría
              </Typography>
              {RecipeTooltips.recipeCategory}
            </Flex>
          </Field.Label>
          <SelectField
            placeholder="Selecciona una categoría"
            options={categoryOptions}
            value={recipe.category ? [recipe.category] : []}
            onValueChange={(details) =>
              updateRecipe({ category: details.value[0] as RecipeCategory | undefined })
            }
            size="md"
          />
          <Field.HelperText>
            Categoría de la receta (opcional)
          </Field.HelperText>
        </Field.Root>
      </Stack>
    </Box>
  )
}

// Export memoized version
export const BasicInfoSection = memo(BasicInfoSectionComponent)
