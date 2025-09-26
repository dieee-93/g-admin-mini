import { Heading as ChakraHeading } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  [key: string]: any // Allow additional Chakra props
}

export function Heading({
  children,
  level = 2,
  size,
  weight = 'semibold',
  color,
  align,
  className,
  ...rest
}: HeadingProps) {
  // Auto-size based on level if size not provided
  const defaultSize = size || (['4xl', '3xl', '2xl', 'xl', 'lg', 'md'][level - 1] as HeadingProps['size'])

  return (
    <ChakraHeading
      as={`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}
      fontSize={defaultSize}
      fontWeight={weight}
      color={color}
      textAlign={align}
      className={className}
      {...rest}
    >
      {children}
    </ChakraHeading>
  )
}