import { Alert as ChakraAlert, Box, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface AlertProps {
  children: ReactNode
  status?: 'info' | 'warning' | 'success' | 'error' | 'neutral'
  variant?: 'subtle' | 'solid' | 'outline' | 'top-accent' | 'left-accent'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  description?: ReactNode
  icon?: ReactNode | boolean
  closable?: boolean
  onClose?: () => void
  className?: string
  width?: 'auto' | 'full'
}

interface AlertIconProps {
  children: ReactNode
  className?: string
}

interface AlertTitleProps {
  children: ReactNode
  className?: string
}

interface AlertDescriptionProps {
  children: ReactNode
  className?: string
}

interface AlertActionProps {
  children: ReactNode
  className?: string
}

const statusIcons = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  neutral: InformationCircleIcon,
}

const statusColorMap = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  neutral: 'gray',
}

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const widthMap = {
  auto: 'auto',
  full: 'full',
}

export function Alert({
  children,
  status = 'info',
  variant = 'subtle',
  size = 'md',
  title,
  description,
  icon = true,
  closable = false,
  onClose,
  className,
  width = 'full',
  ...rest
}: AlertProps) {
  const StatusIcon = statusIcons[status]
  const showIcon = icon !== false
  const customIcon = typeof icon === 'object' ? icon : null

  return (
    <ChakraAlert.Root
      status={status}
      variant={variant === 'top-accent' || variant === 'left-accent' ? 'subtle' : variant}
      size={sizeMap[size] as any}
      colorPalette={statusColorMap[status as keyof typeof statusColorMap]}
      width={widthMap[width]}
      className={className}
      {...rest}
    >
      <HStack gap="md" width="full" align="start">
        {showIcon && (
          <AlertIcon>
            {customIcon || <StatusIcon style={{ width: '20px', height: '20px' }} />}
          </AlertIcon>
        )}
        
        <Box flex="1" minWidth={0}>
          {title && (
            <AlertTitle>{title}</AlertTitle>
          )}
          
          {description && (
            <AlertDescription>{description}</AlertDescription>
          )}
          
          {children && !title && !description && (
            <Box>{children}</Box>
          )}
          
          {children && (title || description) && (
            <Box mt="sm">{children}</Box>
          )}
        </Box>
        
        {closable && onClose && (
          <AlertAction>
            <Box
              as="button"
              onClick={onClose}
              p={1}
              borderRadius="sm"
              _hover={{ bg: 'blackAlpha.100' }}
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <XMarkIcon style={{ width: '16px', height: '16px' }} />
            </Box>
          </AlertAction>
        )}
      </HStack>
    </ChakraAlert.Root>
  )
}

export function AlertIcon({ children, className, ...rest }: AlertIconProps) {
  return (
    <ChakraAlert.Indicator className={className} {...rest}>
      {children}
    </ChakraAlert.Indicator>
  )
}

export function AlertTitle({ children, className, ...rest }: AlertTitleProps) {
  return (
    <ChakraAlert.Title 
      fontWeight="semibold"
      fontSize="sm"
      className={className}
      {...rest}
    >
      {children}
    </ChakraAlert.Title>
  )
}

export function AlertDescription({ children, className, ...rest }: AlertDescriptionProps) {
  return (
    <ChakraAlert.Description 
      fontSize="sm"
      className={className}
      {...rest}
    >
      {children}
    </ChakraAlert.Description>
  )
}

export function AlertAction({ children, className, ...rest }: AlertActionProps) {
  return (
    <Box className={className} {...rest}>
      {children}
    </Box>
  )
}

// Componentes de conveniencia para casos específicos del negocio
export function InventoryAlert({ 
  level, 
  item, 
  current, 
  minimum,
  onRestock,
  ...props 
}: {
  level: 'low' | 'critical' | 'out'
  item: string
  current: number
  minimum: number
  onRestock?: () => void
} & Omit<AlertProps, 'status' | 'title' | 'description'>) {
  const statusMap = {
    low: 'warning' as const,
    critical: 'error' as const,
    out: 'error' as const,
  }
  
  const messageMap = {
    low: `Stock bajo para ${item}`,
    critical: `Stock crítico para ${item}`,
    out: `Sin stock de ${item}`,
  }

  return (
    <Alert
      status={statusMap[level]}
      title={messageMap[level]}
      description={`Actual: ${current} | Mínimo: ${minimum}`}
      closable={false}
      {...props}
    >
      {onRestock && (
        <AlertAction>
          <button 
            onClick={onRestock}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: 'var(--chakra-colors-brand-500)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reabastecer
          </button>
        </AlertAction>
      )}
    </Alert>
  )
}

export function SystemAlert({
  type,
  message,
  details,
  action,
  ...props
}: {
  type: 'maintenance' | 'update' | 'error' | 'notice'
  message: string
  details?: string
  action?: ReactNode
} & Omit<AlertProps, 'status' | 'title' | 'description'>) {
  const statusMap = {
    maintenance: 'warning' as const,
    update: 'info' as const,
    error: 'error' as const,
    notice: 'neutral' as const,
  }

  return (
    <Alert
      status={statusMap[type]}
      title={message}
      description={details}
      {...props}
    >
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  )
}

// Compound component pattern
Alert.Icon = AlertIcon
Alert.Title = AlertTitle
Alert.Description = AlertDescription
Alert.Action = AlertAction

// Business-specific components
Alert.Inventory = InventoryAlert
Alert.System = SystemAlert