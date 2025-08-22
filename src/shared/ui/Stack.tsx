import { VStack as ChakraVStack, HStack as ChakraHStack, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface StackProps {
  children: ReactNode
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: boolean
  divider?: ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' // Legacy support
  width?: 'auto' | 'full' | 'fit'
  height?: 'auto' | 'full' | 'fit'
  className?: string
}

const gapMap = {
  none: 0,
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
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

export function Stack({
  children,
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  divider,
  spacing, // Legacy support - maps to gap
  width,
  height,
  className,
  ...rest
}: StackProps & Record<string, any>) {
  const actualGap = spacing || gap // Legacy support
  
  // Si direction es row o row-reverse, usar HStack
  if (direction === 'row' || direction === 'row-reverse') {
    return (
      <ChakraHStack
        gap={gapMap[actualGap]}
        align={alignMap[align]}
        justify={justifyMap[justify]}
        wrap={wrap ? 'wrap' : 'nowrap'}
        flexDirection={direction}
        separator={divider}
        width={width ? widthMap[width] : undefined}
        height={height ? heightMap[height] : undefined}
        className={className}
        {...rest}
      >
        {children}
      </ChakraHStack>
    )
  }
  
  // Si direction es column o column-reverse, usar VStack
  return (
    <ChakraVStack
      gap={gapMap[actualGap]}
      align={alignMap[align]}
      justify={justifyMap[justify]}
      wrap={wrap ? 'wrap' : 'nowrap'}
      flexDirection={direction}
      separator={divider}
      width={width ? widthMap[width] : undefined}
      height={height ? heightMap[height] : undefined}
      className={className}
      {...rest}
    >
      {children}
    </ChakraVStack>
  )
}

// Componentes de conveniencia para casos específicos
export function VStack({ children, ...props }: Omit<StackProps, 'direction'>) {
  return <Stack direction="column" {...props}>{children}</Stack>
}

export function HStack({ children, ...props }: Omit<StackProps, 'direction'>) {
  return <Stack direction="row" {...props}>{children}</Stack>
}

// Componente especializado para layouts complejos
export function Cluster({
  children,
  gap = 'md',
  justify = 'start',
  align = 'center',
  ...rest
}: Omit<StackProps, 'direction' | 'wrap'>) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={gapMap[gap]}
      justifyContent={justifyMap[justify]}
      alignItems={alignMap[align]}
      {...rest}
    >
      {children}
    </Box>
  )
}

// Componente para centrar contenido
export function Center({
  children,
  width = 'full',
  height = 'full',
  ...rest
}: {
  children: ReactNode
  width?: 'auto' | 'full' | 'fit'
  height?: 'auto' | 'full' | 'fit'
} & Record<string, any>) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width={widthMap[width]}
      height={heightMap[height]}
      {...rest}
    >
      {children}
    </Box>
  )
}