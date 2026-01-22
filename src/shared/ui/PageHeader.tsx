import { Box, Button } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Stack } from './Stack'
import { Typography } from './Typography'
import { Icon } from './Icon'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: any // HeroIcon component
  color?: string
  actions?: ReactNode
  colorPalette?: string
  className?: string
  [key: string]: any  // Allow any Chakra props for flexibility
}

/**
 * PageHeader - Enhanced header for main pages
 * 
 * More complex than ModuleHeader, supports:
 * - Large icon + title + subtitle in same line
 * - Actions on the right side
 * - Visual hierarchy for main pages
 * 
 * Usage: 
 * <PageHeader 
 *   title="Configuración" 
 *   subtitle="Centro de comando · G-Admin"
 *   icon={CogIcon}
 *   actions={<Button>Save</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  color = 'gray',
  actions,
  colorPalette,
  className,
  ...chakraProps
}: PageHeaderProps) {
  return (
    <Stack 
      direction="row" 
      justify="space-between" 
      align="end" 
      pb="4"
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      <Stack gap="1">
        <Stack direction="row" align="center" gap="2">
          {icon && <Icon icon={icon} size={'2xl'} color={`${color}.500`} />}
          <Typography variant="heading" size="2xl" weight="bold" color="text.primary">
            {title}
          </Typography>
        </Stack>
        {subtitle && (
          <Typography 
            variant="body" 
            color="text.secondary" 
            size="md" 
            pl={icon ? "12" : "0"}  // Align with title when icon present
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
      
      {actions && (
        <Box>
          {actions}
        </Box>
      )}
    </Stack>
  )
}