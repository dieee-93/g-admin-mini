import { Skeleton as ChakraSkeleton, Stack, Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import React from 'react'

interface SkeletonProps {
  isLoaded?: boolean
  loading?: boolean
  children?: ReactNode
  height?: string | number
  width?: string | number
  variant?: 'pulse' | 'shine' | 'none'
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  className?: string
  [key: string]: any
}

interface SkeletonTextProps {
  isLoaded?: boolean
  loading?: boolean
  children?: ReactNode
  noOfLines?: number
  gap?: string | number
  className?: string
  [key: string]: any
}

interface SkeletonCardProps {
  lines?: number
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function Skeleton({
  isLoaded = false,
  loading,
  children,
  height = '20px',
  width = '100%',
  variant = 'pulse',
  colorPalette = 'gray',
  className,
  ...rest
}: SkeletonProps) {
  // Convert isLoaded to loading if not explicitly provided
  const isLoading = loading !== undefined ? loading : !isLoaded

  if (!isLoading && children) {
    return <>{children}</>
  }

  return (
    <ChakraSkeleton
      loading={isLoading}
      height={height}
      width={width}
      variant={variant}
      colorPalette={colorPalette}
      className={className}
      {...rest}
    />
  )
}

export function SkeletonText({
  isLoaded = false,
  loading,
  children,
  noOfLines = 3,
  gap = '3',
  className,
  ...rest
}: SkeletonTextProps) {
  // Convert isLoaded to loading if not explicitly provided
  const isLoading = loading !== undefined ? loading : !isLoaded

  if (!isLoading && children) {
    return <>{children}</>
  }

  return (
    <Stack gap={gap} width="full" className={className}>
      {Array.from({ length: noOfLines }).map((_, index) => (
        <ChakraSkeleton
          key={index}
          height="4"
          loading={isLoading}
          _last={{ maxW: '80%' }}
          {...rest}
        />
      ))}
    </Stack>
  )
}

/**
 * Skeleton para cards
 */
export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <Box
      bg="bg.surface"
      p="6"
      borderRadius="lg"
      shadow="md"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Stack gap="4">
        <Skeleton height="20px" width="60%" />
        <SkeletonText noOfLines={lines} gap="3" />
      </Stack>
    </Box>
  )
}

/**
 * Skeleton para tablas
 */
export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <Stack gap="2">
      {/* Header */}
      <Stack direction="row" gap="4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" flex="1" />
        ))}
      </Stack>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" gap="4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" flex="1" />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

// Compound component pattern
Skeleton.Text = SkeletonText
Skeleton.Card = SkeletonCard
Skeleton.Table = SkeletonTable


// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/**
 * @example Basic Skeleton
 * ```tsx
 * import { Skeleton } from '@/shared/ui'
 *
 * function LoadingCard() {
 *   const { data, isLoading } = useQuery()
 *
 *   return (
 *     <Skeleton isLoaded={!isLoading} height="200px">
 *       <Card>{data?.title}</Card>
 *     </Skeleton>
 *   )
 * }
 * ```
 *
 * @example SkeletonText for multiple lines
 * ```tsx
 * import { SkeletonText } from '@/shared/ui'
 *
 * function LoadingContent() {
 *   const { isLoading } = useData()
 *
 *   return (
 *     <SkeletonText
 *       isLoaded={!isLoading}
 *       noOfLines={4}
 *       gap="4"
 *     />
 *   )
 * }
 * ```
 *
 * @example Skeleton with variants
 * ```tsx
 * <Skeleton variant="shine" height="100px" width="full" />
 * <Skeleton variant="pulse" height="50px" colorPalette="blue" />
 * ```
 */