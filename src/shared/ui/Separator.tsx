import { Separator as ChakraSeparator } from '@chakra-ui/react'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  colorPalette?: string
  variant?: 'solid' | 'dashed' | 'dotted'
  thickness?: string
  className?: string
  [key: string]: any // Allow additional Chakra props
}

export function Separator({
  orientation = 'horizontal',
  size = 'md',
  colorPalette = 'gray',
  variant = 'solid',
  thickness,
  className,
  ...rest
}: SeparatorProps) {
  return (
    <ChakraSeparator
      orientation={orientation}
      size={size}
      colorPalette={colorPalette}
      variant={variant}
      thickness={thickness}
      className={className}
      {...rest}
    />
  )
}