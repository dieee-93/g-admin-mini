import { SimpleGrid as ChakraSimpleGrid, Grid as ChakraGrid } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// Responsive types for Chakra UI v3
type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T }

interface SimpleGridProps {
  children: ReactNode
  columns?: ResponsiveValue<number>
  minChildWidth?: ResponsiveValue<string>
  gap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  rowGap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  columnGap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  className?: string
}

interface GridProps {
  children: ReactNode
  templateColumns?: ResponsiveValue<string>
  templateRows?: ResponsiveValue<string>
  templateAreas?: ResponsiveValue<string>
  gap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  rowGap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  columnGap?: ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>
  className?: string
}

// SimpleGrid component for auto-responsive layouts
export function SimpleGrid({
  children,
  columns,
  minChildWidth,
  gap = 'md',
  rowGap,
  columnGap,
  className,
}: SimpleGridProps) {
  return (
    <ChakraSimpleGrid
      columns={columns}
      minChildWidth={minChildWidth}
      gap={gap}
      rowGap={rowGap}
      columnGap={columnGap}
      className={className}
    >
      {children}
    </ChakraSimpleGrid>
  )
}

// Grid component for complex layouts
export function Grid({
  children,
  templateColumns,
  templateRows,
  templateAreas,
  gap = 'md',
  rowGap,
  columnGap,
  className,
}: GridProps) {
  return (
    <ChakraGrid
      templateColumns={templateColumns}
      templateRows={templateRows}
      templateAreas={templateAreas}
      gap={gap}
      rowGap={rowGap}
      columnGap={columnGap}
      className={className}
    >
      {children}
    </ChakraGrid>
  )
}
