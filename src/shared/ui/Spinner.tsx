import { Spinner as ChakraSpinner } from '@chakra-ui/react'

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit'
  color?: string
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  borderWidth?: string
  animationDuration?: string
  className?: string
  [key: string]: any
}

export function Spinner({
  size = 'md',
  color,
  colorPalette = 'gray',
  borderWidth,
  animationDuration,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <ChakraSpinner
      size={size}
      color={color}
      colorPalette={colorPalette}
      borderWidth={borderWidth}
      animationDuration={animationDuration}
      className={className}
      {...rest}
    />
  )
}

// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/**
 * @example Basic Spinner
 * ```tsx
 * import { Spinner } from '@/shared/ui'
 *
 * function LoadingIndicator() {
 *   return <Spinner size="md" colorPalette="blue" />
 * }
 * ```
 *
 * @example Spinner with custom color
 * ```tsx
 * <Spinner color="teal.500" size="lg" />
 * ```
 *
 * @example Spinner with label
 * ```tsx
 * import { Spinner, VStack, Text } from '@/shared/ui'
 *
 * function LoadingWithLabel() {
 *   return (
 *     <VStack colorPalette="teal">
 *       <Spinner colorPalette="teal" />
 *       <Text>Cargando datos...</Text>
 *     </VStack>
 *   )
 * }
 * ```
 *
 * @example Custom speed and thickness
 * ```tsx
 * <Spinner
 *   colorPalette="blue"
 *   borderWidth="4px"
 *   animationDuration="0.8s"
 * />
 * ```
 */