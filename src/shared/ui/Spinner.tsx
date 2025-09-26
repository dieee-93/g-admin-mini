import { Spinner as ChakraSpinner } from '@chakra-ui/react'

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  thickness?: string
  speed?: string
  label?: string
  className?: string
  [key: string]: any // Allow additional Chakra props
}

export function Spinner({
  size = 'md',
  color,
  thickness,
  speed,
  label = 'Cargando...',
  className,
  ...rest
}: SpinnerProps) {
  return (
    <ChakraSpinner
      size={size}
      color={color}
      thickness={thickness}
      speed={speed}
      label={label}
      className={className}
      {...rest}
    />
  )
}