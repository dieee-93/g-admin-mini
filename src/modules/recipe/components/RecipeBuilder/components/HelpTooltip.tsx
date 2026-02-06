/**
 * HelpTooltip - Tooltip helper para ayuda contextual
 *
 * Componente reutilizable para mostrar tooltips informativos
 * Usa el wrapper completo de Tooltip de shared/ui
 */

import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Tooltip, Box, Typography } from '@/shared/ui'

// ============================================
// PROPS
// ============================================

interface HelpTooltipProps {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

// ============================================
// COMPONENT
// ============================================

export function HelpTooltip({ content, placement = 'top', size = 'sm' }: HelpTooltipProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <Tooltip.Root positioning={{ placement }}>
      <Tooltip.Trigger asChild>
        <Box
          as="button"
          type="button"
          display="inline-flex"
          alignItems="center"
          cursor="help"
          color="fg.muted"
          _hover={{ color: 'blue.500' }}
          transition="color 0.2s"
        >
          <QuestionMarkCircleIcon className={iconSize} />
        </Box>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content maxW="300px" p="3">
          <Typography variant="caption">
            {content}
          </Typography>
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// PRESET TOOLTIPS - Contenido predefinido
// ============================================

export const RecipeTooltips = {
  yieldPercentage: (
    <HelpTooltip
      content="Porcentaje del rendimiento esperado. Por ejemplo, 90% significa que de 100g de ingrediente obtienes 90g útiles (10% se pierde en preparación)."
      placement="top"
    />
  ),

  wastePercentage: (
    <HelpTooltip
      content="Porcentaje de desperdicio esperado. Es la inversa del yield: si el yield es 90%, el waste es 10%."
      placement="top"
    />
  ),

  executionMode: (
    <HelpTooltip
      content="Immediate: consume stock al crear el material elaborado. On-demand: consume stock al vender el producto."
      placement="right"
    />
  ),

  substitutionRatio: (
    <HelpTooltip
      content="Ratio de sustitución. 1.0 significa misma cantidad, 1.2 significa usar 20% más del sustituto, 0.8 significa usar 20% menos."
      placement="top"
    />
  ),

  outputQuantity: (
    <HelpTooltip
      content="Cantidad que produce esta receta. Por ejemplo, si la receta produce 1 hamburguesa completa, ingresa 1."
      placement="top"
    />
  ),

  inputQuantity: (
    <HelpTooltip
      content="Cantidad del ingrediente necesaria para esta receta. Por ejemplo, 200g de carne molida."
      placement="top"
    />
  ),

  difficulty: (
    <HelpTooltip
      label="Complejidad de la receta"
      description="Nivel de experiencia requerido para ejecutar esta receta."
    />
  ),

  costCalculation: (
    <HelpTooltip
      content="El costo se calcula automáticamente sumando el costo de todos los ingredientes, ajustado por yield y waste."
      placement="right"
    />
  ),
}
