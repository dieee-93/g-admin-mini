import { SimpleGrid as ChakraSimpleGrid, Grid as ChakraGrid } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { ResponsiveValue, SpacingProp } from './types'
import { getSpacingToken } from './types'

interface SimpleGridProps {
  children: ReactNode
  columns?: ResponsiveValue<number>
  minChildWidth?: ResponsiveValue<string>
  gap?: SpacingProp
  rowGap?: SpacingProp
  columnGap?: SpacingProp
  className?: string
}

interface GridProps {
  children: ReactNode
  templateColumns?: ResponsiveValue<string>
  templateRows?: ResponsiveValue<string>
  templateAreas?: ResponsiveValue<string>
  gap?: SpacingProp
  rowGap?: SpacingProp
  columnGap?: SpacingProp
  className?: string
}

// SimpleGrid component for auto-responsive layouts
export function SimpleGrid({
  children,
  columns,
  minChildWidth,
  gap = 'md', // Default semantic token
  rowGap,
  columnGap,
  className,
}: SimpleGridProps) {
  return (
    <ChakraSimpleGrid
      columns={columns}
      minChildWidth={minChildWidth}
      gap={getSpacingToken(gap)}
      rowGap={rowGap ? getSpacingToken(rowGap) : undefined}
      columnGap={columnGap ? getSpacingToken(columnGap) : undefined}
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
  gap = 'md', // Default semantic token
  rowGap,
  columnGap,
  className,
}: GridProps) {
  return (
    <ChakraGrid
      templateColumns={templateColumns}
      templateRows={templateRows}
      templateAreas={templateAreas}
      gap={getSpacingToken(gap)}
      rowGap={rowGap ? getSpacingToken(rowGap) : undefined}
      columnGap={columnGap ? getSpacingToken(columnGap) : undefined}
      className={className}
    >
      {children}
    </ChakraGrid>
  )
}
