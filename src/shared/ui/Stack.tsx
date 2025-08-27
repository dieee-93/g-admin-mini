import { 
  VStack as ChakraVStack, 
  HStack as ChakraHStack, 
  Stack as ChakraStack 
} from '@chakra-ui/react'
import type { ReactNode, CSSProperties } from 'react'

// Responsive types for Chakra UI v3 - based on official documentation
type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T }

interface StackProps {
  children: ReactNode
  direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>
  gap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>
  justify?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>
  wrap?: boolean
  className?: string
  width?: string
  height?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

interface VStackProps {
  children: ReactNode
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  className?: string
  width?: string
  height?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

interface HStackProps {
  children: ReactNode
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: boolean
  className?: string
  width?: string
  height?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

interface ClusterProps {
  children: ReactNode
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  className?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

interface CenterProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

// Main Stack component with responsive direction support
export function Stack({
  children,
  direction = 'column',
  gap = 'md', // ✅ MEJORADO: 16px → 24px para mejor respiración
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  width,
  height,
  style,
  ...rest
}: StackProps) {
  return (
    <ChakraStack
      direction={direction}
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap ? 'wrap' : 'nowrap'}
      className={className}
      w={width}
      h={height}
      style={style}
      {...rest}
    >
      {children}
    </ChakraStack>
  )
}

// VStack component
export function VStack({
  children,
  gap = 'md', // ✅ MEJORADO: 16px → 24px para mejor respiración
  align = 'stretch',
  className,
  width,
  height,
  style,
  ...rest
}: VStackProps) {
  return (
    <ChakraVStack
      gap={gap}
      align={align}
      className={className}
      w={width}
      h={height}
      style={style}
      {...rest}
    >
      {children}
    </ChakraVStack>
  )
}

// HStack component
export function HStack({
  children,
  gap = 'md', // ✅ MEJORADO: 16px → 24px para mejor respiración
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  width,
  height,
  style,
  ...rest
}: HStackProps) {
  return (
    <ChakraHStack
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap ? 'wrap' : 'nowrap'}
      className={className}
      w={width}
      h={height}
      style={style}
      {...rest}
    >
      {children}
    </ChakraHStack>
  )
}

// Cluster for wrapping layouts
export function Cluster({
  children,
  gap = 'md', // ✅ MEJORADO: 16px → 24px para mejor respiración
  align = 'center',
  justify = 'start',
  className,
  style,
  ...rest
}: ClusterProps) {
  return (
    <ChakraHStack
      gap={gap}
      align={align}
      justify={justify}
      wrap="wrap"
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </ChakraHStack>
  )
}

// Center component
export function Center({
  children,
  className,
  style,
  ...rest
}: CenterProps) {
  return (
    <ChakraVStack
      justify="center"
      align="center"
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </ChakraVStack>
  )
}
