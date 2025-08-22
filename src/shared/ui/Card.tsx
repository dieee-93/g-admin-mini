import { Card as ChakraCard, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

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

const paddingMap = {
  none: 0,
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
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

export function Card({ 
  children, 
  variant = 'elevated', 
  size = 'md',
  padding = 'md',
  colorPalette = 'gray',
  interactive = false,
  disabled = false,
  loading = false,
  onClick,
  className,
  width = 'auto',
  height = 'auto',
  ...rest
}: CardProps) {
  return (
    <ChakraCard.Root 
      variant={variant} 
      size={sizeMap[size]}
      colorPalette={colorPalette}
      cursor={interactive || onClick ? 'pointer' : 'default'}
      opacity={disabled ? 0.6 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
      onClick={onClick}
      className={className}
      width={widthMap[width]}
      height={heightMap[height]}
      _hover={interactive || onClick ? { 
        shadow: 'lg', 
        transform: 'translateY(-2px)' 
      } : {}}
      transition="all 0.2s ease"
      {...rest}
    >
      {/* Solo aplicar padding si no hay subcomponentes Header/Body/Footer */}
      {loading ? (
        <Box p={paddingMap[padding]} display="flex" alignItems="center" justifyContent="center">
          <Box>Cargando...</Box>
        </Box>
      ) : (
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

// Compound component pattern
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter