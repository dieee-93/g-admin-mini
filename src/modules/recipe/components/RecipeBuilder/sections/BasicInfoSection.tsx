/**
 * BasicInfoSection v2.1 - Industrial Production Order Basic Info
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
 *
 * CHANGES v2.1:
 * - 🗑️ REMOVAL: Removed 'category' field as per business requirements.
 */

import { memo, useId } from 'react'
import { Stack, Input, TextareaField, Flex, Box, Typography, Field } from '@/shared/ui'
import type { Recipe } from '../../../types/recipe'

// ============================================
// PROPS
// ============================================

interface BasicInfoSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  entityType: 'material' | 'product' | 'kit' | 'service'
}

// ============================================
// COMPONENT
// ============================================

/**
 * BasicInfoSection v2.1 - Industrial basic info section
 */
function BasicInfoSectionComponent({ recipe, updateRecipe }: BasicInfoSectionProps) {
  // Accessibility IDs
  const nameId = useId();
  const descriptionId = useId();

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
          <Field.Label htmlFor={nameId}>
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
            id={nameId}
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
          <Field.Label htmlFor={descriptionId}>
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
            id={descriptionId}
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
      </Stack>
    </Box>
  )
}

// Export memoized version
export const BasicInfoSection = memo(BasicInfoSectionComponent)