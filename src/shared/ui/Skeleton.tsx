import { Skeleton as ChakraSkeleton, SkeletonText as ChakraSkeletonText } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface SkeletonProps {
  isLoaded?: boolean
  children?: ReactNode
  height?: string | number
  width?: string | number
  startColor?: string
  endColor?: string
  fadeDuration?: number
  speed?: number
  className?: string
  [key: string]: any // Allow additional Chakra props
}

interface SkeletonTextProps {
  isLoaded?: boolean
  children?: ReactNode
  noOfLines?: number
  spacing?: string | number
  skeletonHeight?: string | number
  startColor?: string
  endColor?: string
  fadeDuration?: number
  speed?: number
  className?: string
  [key: string]: any // Allow additional Chakra props
}

export function Skeleton({
  isLoaded = false,
  children,
  height = '20px',
  width = '100%',
  startColor,
  endColor,
  fadeDuration,
  speed,
  className,
  ...rest
}: SkeletonProps) {
  return (
    <ChakraSkeleton
      isLoaded={isLoaded}
      height={height}
      width={width}
      startColor={startColor}
      endColor={endColor}
      fadeDuration={fadeDuration}
      speed={speed}
      className={className}
      {...rest}
    >
      {children}
    </ChakraSkeleton>
  )
}

export function SkeletonText({
  isLoaded = false,
  children,
  noOfLines = 3,
  spacing = '3',
  skeletonHeight = '4',
  startColor,
  endColor,
  fadeDuration,
  speed,
  className,
  ...rest
}: SkeletonTextProps) {
  return (
    <ChakraSkeletonText
      isLoaded={isLoaded}
      noOfLines={noOfLines}
      spacing={spacing}
      skeletonHeight={skeletonHeight}
      startColor={startColor}
      endColor={endColor}
      fadeDuration={fadeDuration}
      speed={speed}
      className={className}
      {...rest}
    >
      {children}
    </ChakraSkeletonText>
  )
}

// Compound component pattern
Skeleton.Text = SkeletonText