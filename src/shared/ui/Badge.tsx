import { Badge as ChakraBadge, HStack, Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'solid' | 'subtle' | 'outline' | 'surface'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  startIcon?: ReactNode
  endIcon?: ReactNode
  dot?: boolean
  pulse?: boolean
  rounded?: boolean
  clickable?: boolean
  onClick?: () => void
  className?: string
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft'
  text?: string
  showDot?: boolean
}

interface StockBadgeProps {
  level: 'good' | 'low' | 'critical' | 'out' | 'excess'
  value?: number
  showValue?: boolean
}

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  showIcon?: boolean
}

const sizeMap = {
  xs: 'xs',
  sm: 'sm', 
  md: 'md',
  lg: 'lg',
}

const statusConfig = {
  active: { colorPalette: 'green', text: 'Activo' },
  inactive: { colorPalette: 'gray', text: 'Inactivo' },
  pending: { colorPalette: 'orange', text: 'Pendiente' },
  approved: { colorPalette: 'green', text: 'Aprobado' },
  rejected: { colorPalette: 'red', text: 'Rechazado' },
  draft: { colorPalette: 'gray', text: 'Borrador' },
}

const stockConfig = {
  good: { colorPalette: 'green', text: 'En Stock' },
  low: { colorPalette: 'orange', text: 'Stock Bajo' },
  critical: { colorPalette: 'red', text: 'Stock Crítico' },
  out: { colorPalette: 'red', text: 'Agotado' },
  excess: { colorPalette: 'blue', text: 'Exceso' },
}

const priorityConfig = {
  low: { colorPalette: 'gray', text: 'Baja', icon: '⬇️' },
  medium: { colorPalette: 'orange', text: 'Media', icon: '➡️' },
  high: { colorPalette: 'red', text: 'Alta', icon: '⬆️' },
  urgent: { colorPalette: 'red', text: 'Urgente', icon: '🔥' },
}

export function Badge({
  children,
  variant = 'subtle',
  size = 'sm',
  colorPalette = 'gray',
  startIcon,
  endIcon,
  dot = false,
  pulse = false,
  rounded = false,
  clickable = false,
  onClick,
  className,
  ...rest
}: BadgeProps) {

  const badgeContent = (
    <HStack gap="1" align="center">
      {dot && (
        <Box
          boxSize="1.5"
          borderRadius="full"
          bg="currentColor"
          animation={pulse ? 'pulse 2s infinite' : undefined}
        />
      )}
      {startIcon && (
        <Box display="flex" alignItems="center">
          {startIcon}
        </Box>
      )}
      <Box>{children}</Box>
      {endIcon && (
        <Box display="flex" alignItems="center">
          {endIcon}
        </Box>
      )}
    </HStack>
  )

  return (
    <ChakraBadge
      variant={variant as any}
      size={sizeMap[size] as any}
      colorPalette={colorPalette}
      borderRadius={rounded ? 'full' : 'md'}
      cursor={clickable || onClick ? 'pointer' : 'default'}
      onClick={onClick}
      className={className}
      _hover={clickable || onClick ? { 
        opacity: 0.8,
        transform: 'scale(1.05)' 
      } : {}}
      transition="all 0.2s ease"
      {...rest}
    >
      {badgeContent}
    </ChakraBadge>
  )
}

export function StatusBadge({ 
  status, 
  text, 
  showDot = true,
  ...props 
}: StatusBadgeProps & Omit<BadgeProps, 'colorPalette' | 'children'>) {
  const config = statusConfig[status]
  
  return (
    <Badge
      colorPalette={config.colorPalette as any}
      dot={showDot}
      pulse={status === 'pending'}
      {...props}
    >
      {text || config.text}
    </Badge>
  )
}

export function StockBadge({ 
  level, 
  value, 
  showValue = false,
  ...props 
}: StockBadgeProps & Omit<BadgeProps, 'colorPalette' | 'children'>) {
  const config = stockConfig[level]
  const displayText = showValue && value !== undefined 
    ? `${config.text} (${value})` 
    : config.text
  
  return (
    <Badge
      colorPalette={config.colorPalette as any}
      dot={level === 'critical' || level === 'out'}
      pulse={level === 'critical'}
      {...props}
    >
      {displayText}
    </Badge>
  )
}

export function PriorityBadge({ 
  priority, 
  showIcon = true,
  ...props 
}: PriorityBadgeProps & Omit<BadgeProps, 'colorPalette' | 'children' | 'startIcon'>) {
  const config = priorityConfig[priority]
  
  return (
    <Badge
      colorPalette={config.colorPalette as any}
      startIcon={showIcon ? <span>{config.icon}</span> : undefined}
      pulse={priority === 'urgent'}
      {...props}
    >
      {config.text}
    </Badge>
  )
}

export function InventoryBadge({ 
  item, 
  current, 
  minimum,
  ...props 
}: {
  item?: string
  current: number
  minimum: number
} & Omit<BadgeProps, 'colorPalette' | 'children'>) {
  let level: 'good' | 'low' | 'critical' | 'out'
  
  if (current === 0) {
    level = 'out'
  } else if (current <= minimum * 0.5) {
    level = 'critical'
  } else if (current <= minimum) {
    level = 'low'
  } else {
    level = 'good'
  }
  
  const percentage = minimum > 0 ? Math.round((current / minimum) * 100) : 0
  const displayText = item ? `${item}: ${current}` : `${current} (${percentage}%)`
  
  return (
    <StockBadge 
      level={level}
      value={current}
      showValue={true}
      {...props}
    />
  )
}

export function RoleBadge({ 
  role, 
  permissions,
  ...props 
}: {
  role: 'admin' | 'manager' | 'employee' | 'viewer' | 'guest'
  permissions?: string[]
} & Omit<BadgeProps, 'colorPalette' | 'children'>) {
  const roleConfig = {
    admin: { colorPalette: 'red', text: 'Administrador', icon: '👑' },
    manager: { colorPalette: 'orange', text: 'Gerente', icon: '👨‍💼' },
    employee: { colorPalette: 'blue', text: 'Empleado', icon: '👷' },
    viewer: { colorPalette: 'gray', text: 'Visualizador', icon: '👁️' },
    guest: { colorPalette: 'gray', text: 'Invitado', icon: '👤' },
  }
  
  const config = roleConfig[role]
  const title = permissions ? `${config.text}\nPermisos: ${permissions.join(', ')}` : config.text
  
  return (
    <Badge
      colorPalette={config.colorPalette as any}
      startIcon={<span>{config.icon}</span>}
      {...props}
    >
      {config.text}
    </Badge>
  )
}

// Compound component pattern y componentes especializados
Badge.Status = StatusBadge
Badge.Stock = StockBadge
Badge.Priority = PriorityBadge
Badge.Inventory = InventoryBadge
Badge.Role = RoleBadge