import { 
  VStack as ChakraVStack, 
  HStack as ChakraHStack, 
  Stack as ChakraStack 
} from '@chakra-ui/react'
import type { ReactNode, CSSProperties } from 'react'
import type { ResponsiveValue, SpacingProp } from './types'
import { getSpacingToken } from './types'

interface StackProps {
  children: ReactNode
  direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>
  gap?: SpacingProp
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
  gap?: SpacingProp
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  className?: string
  width?: string
  height?: string
  style?: CSSProperties
  [key: string]: any // Allow additional props
}

interface HStackProps {
  children: ReactNode
  gap?: SpacingProp
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
  gap?: SpacingProp
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
  gap = 'md', // Default semantic token
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
      gap={getSpacingToken(gap)}
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
  gap = 'md', // Default semantic token
  align = 'stretch',
  className,
  width,
  height,
  style,
  ...rest
}: VStackProps) {
  return (
    <ChakraVStack
      gap={getSpacingToken(gap)}
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
  gap = 'md', // Default semantic token
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
      gap={getSpacingToken(gap)}
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
  gap = 'md', // Default semantic token
  align = 'center',
  justify = 'start',
  className,
  style,
  ...rest
}: ClusterProps) {
  return (
    <ChakraHStack
      gap={getSpacingToken(gap)}
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
