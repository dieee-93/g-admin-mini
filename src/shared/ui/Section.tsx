/**
 * Section FIXED - Layout profesional con spacing mejorado
 *
 * Problemas identificados y solucionados:
 * - Padding muy pequeño (6 -> 8)
 * - Sin margin-bottom entre secciones
 * - Header con spacing insuficiente
 * - Contenido sin estructura Stack interna
 * - Falta jerarquía visual clara
 */

import { Box, Stack, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Typography, Icon } from '.'

interface SectionProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'flat'
  title?: string
  subtitle?: string
  icon?: React.ComponentType<any>
  actions?: ReactNode
  colorPalette?: string
  className?: string
  [key: string]: any  // Allow any Chakra props for flexibility
}

/**
 * Section FIXED - Semantic wrapper con layout profesional
 *
 * MEJORAS:
 * - Padding generoso para breathing room
 * - Margin-bottom automático entre secciones
 * - Estructura Stack interna para organizar contenido
 * - Header con spacing mejorado
 */
export function Section({
  children,
  variant = 'default',
  title,
  subtitle,
  icon: IconComponent,
  actions,
  colorPalette,
  className,
  ...chakraProps
}: SectionProps) {
  // Recipe-based styles MEJORADOS con spacing profesional
  const variantStyles = {
    default: {
      bg: 'gray.00',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: 'lg',
      p: '8',                    // ✅ FIXED: Más padding (32px en lugar de 24px)
      mb: '8',                   // ✅ FIXED: Margin-bottom entre secciones
      shadow: 'sm'
    },
    elevated: {
      bg: 'gray.50',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: 'lg',
      p: '8',                    // ✅ FIXED: Más padding
      mb: '8',                   // ✅ FIXED: Margin-bottom entre secciones
      shadow: 'lg',
      position: 'relative'
    },
    flat: {
      p: '8',                    // ✅ FIXED: Más padding incluso en flat
      mb: '6',                   // ✅ FIXED: Menos margin para flat pero algo
      bg: 'transparent',
      color: 'text.primary'
    }
  }

  // Header MEJORADO con spacing profesional
  const renderHeader = () => {
    if (!title && !IconComponent && !actions) return null

    return (
      <HStack justify="space-between" align="center" mb={6}> {/* ✅ FIXED: mb=6 en lugar de 4 */}
        <HStack align="center" gap={3}> {/* ✅ FIXED: gap=3 en lugar de 2 */}
          {IconComponent && (
            <Icon
              icon={IconComponent}
              size="xl"                    // ✅ FIXED: Icono más grande
              color="text.muted"
            />
          )}
          <Stack gap={1}>              {/* ✅ FIXED: gap=1 para títulos */}
            {title && (
              <Typography
                variant="heading"
                size="xl"                  // ✅ FIXED: Títulos más grandes
                weight="bold"              // ✅ FIXED: Más bold para jerarquía
                color="text.primary"
                lineHeight="1.2"          // ✅ FIXED: Line height mejorado
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body"
                size="md"                  // ✅ FIXED: Subtítulo más grande
                color="text.muted"
                lineHeight="1.4"          // ✅ FIXED: Line height mejorado
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
        </HStack>
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </HStack>
    )
  }

  return (
    <Box
      {...variantStyles[variant]}
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      {renderHeader()}
      {/* ✅ FIXED: Contenido envuelto en Stack para mejor organización */}
      <Stack gap={4}>
        {children}
      </Stack>
    </Box>
  )
}