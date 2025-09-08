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
 * Section - Semantic wrapper for content sections
 * 
 * Provides consistent styling for content areas with recipes handling theming.
 * Uses gray.* tokens that adapt to current theme automatically.
 * 
 * Usage: 
 * <Section>Content here</Section>
 * <Section variant="elevated">Elevated content</Section>
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
  // Recipe-based styles - using semantic tokens for proper theming
  const variantStyles = {
    default: {
      bg: 'gray.00',          // Semantic surface background
      color: 'text.primary',     // ✅ Corrected semantic text color
      border: '1px solid',   
      borderColor: 'border.default', // ✅ Corrected semantic border
      borderRadius: 'lg',
      p: '6',
      shadow: 'sm'
    },
    elevated: {
      bg: 'gray.50',          // Semantic surface background
      color: 'text.primary',     // ✅ Corrected semantic text color
      border: '1px solid',
      borderColor: 'border.default', // ✅ Corrected semantic border
      borderRadius: 'lg',
      p: '6',
      shadow: 'lg',              // More elevation
      position: 'relative'
    },
    flat: {
      p: '6',
      bg: 'transparent',
      color: 'text.primary'      // ✅ Corrected semantic text color
    }
  }

  // Render header if title, icon, or actions are provided
  const renderHeader = () => {
    if (!title && !IconComponent && !actions) return null

    return (
      <HStack justify="space-between" align="center" mb={4}>
        <HStack align="center" gap={2}>
          {IconComponent && (
            <Icon 
              icon={IconComponent} 
              size="lg" 
              color="text.muted"
            />
          )}
          <Stack gap={0}>
            {title && (
              <Typography 
                variant="heading" 
                size="lg" 
                weight="semibold"
                color="text.primary"
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body" 
                size="sm" 
                color="text.muted"
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
      {children}
    </Box>
  )
}