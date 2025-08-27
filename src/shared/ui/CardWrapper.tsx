import { Card as ChakraCard, Box } from '@chakra-ui/react'
import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'elevated' | 'outline' | 'subtle' | 'filled' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  colorPalette?: 'gray' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  interactive?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  width?: 'auto' | 'full' | 'fit'
  height?: 'auto' | 'full' | 'fit'
}

interface CardHeaderProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface CardBodyProps {
  children: ReactNode
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  scrollable?: boolean
  className?: string
}

interface CardFooterProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

// ✅ Sistema de padding siguiendo 8px grid (mejores prácticas 2024-2025)
const paddingMap = {
  none: 0,
  xs: 2,     // 8px - Para dense layouts
  sm: 4,     // 16px - Contenido compacto
  md: 6,     // 24px - Estándar moderno
  lg: 8,     // 32px - Contenido espaciado
  xl: 12,    // 48px - Secciones destacadas
}

const sizeMap = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
}

const widthMap = {
  auto: 'auto',
  full: 'full',
  fit: 'fit-content',
}

const heightMap = {
  auto: 'auto',
  full: 'full',
  fit: 'fit-content',
}

export function CardWrapper({ 
  children, 
  variant = 'elevated', 
  size = 'md',
  padding = 'lg',
  colorPalette,
  interactive = false,
  disabled = false,
  loading = false,
  onClick,
  className,
  width = 'auto',
  height = 'auto',
  ...rest
}: CardProps) {

  // Detectar si children contienen subcomponentes Card.Header/Body/Footer
  const hasSubcomponents = React.Children.toArray(children).some(child =>
    React.isValidElement(child) && 
    ['CardHeader', 'CardBody', 'CardFooter'].includes((child.type as any)?.displayName || '')
  );

  return (
    <ChakraCard.Root 
      variant={variant as any} 
      size={sizeMap[size] as any}
      {...(colorPalette && { colorPalette })}
      cursor={interactive || onClick ? 'pointer' : 'default'}
      opacity={disabled ? 0.6 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
      onClick={onClick}
      className={className}
      width={widthMap[width]}
      height={heightMap[height]}
      _hover={interactive || onClick ? { 
        shadow: 'md', 
        transform: 'translateY(-1px)',
        borderColor: 'border.emphasized'
      } : {}}
      transition="all 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
      {...rest}
    >
      {/* Solo aplicar padding si NO hay subcomponentes y no está loading */}
      {loading ? (
        <Box p={paddingMap[padding]} display="flex" alignItems="center" justifyContent="center">
          <Box>Cargando...</Box>
        </Box>
      ) : hasSubcomponents ? (
        // Si tiene subcomponentes, no aplicar padding wrapper
        <>{children}</>
      ) : (
        // Si NO tiene subcomponentes, aplicar padding wrapper
        <Box p={padding !== 'none' ? paddingMap[padding] : undefined}>
          {children}
        </Box>
      )}
    </ChakraCard.Root>
  )
}

export function CardHeader({ 
  children, 
  align = 'start',
  justify = 'start',
  padding = 'md',
  className,
  ...rest 
}: CardHeaderProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }
  
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
  }

  return (
    <ChakraCard.Header 
      display="flex"
      alignItems={alignMap[align]}
      justifyContent={justifyMap[justify]}
      p={paddingMap[padding]}
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard.Header>
  )
}

export function CardBody({ 
  children, 
  padding = 'md',
  scrollable = false,
  className,
  ...rest 
}: CardBodyProps) {
  return (
    <ChakraCard.Body 
      p={paddingMap[padding]}
      overflow={scrollable ? 'auto' : 'visible'}
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard.Body>
  )
}

export function CardFooter({ 
  children, 
  align = 'start',
  justify = 'end',
  padding = 'md',
  className,
  ...rest 
}: CardFooterProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }
  
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
  }

  return (
    <ChakraCard.Footer 
      display="flex"
      alignItems={alignMap[align]}
      justifyContent={justifyMap[justify]}
      p={paddingMap[padding]}
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard.Footer>
  )
}

// Agregar displayName para la detección de subcomponentes
CardHeader.displayName = 'CardHeader'
CardBody.displayName = 'CardBody'
CardFooter.displayName = 'CardFooter'

// Compound component pattern
CardWrapper.Header = CardHeader
CardWrapper.Body = CardBody
CardWrapper.Footer = CardFooter