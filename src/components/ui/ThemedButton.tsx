import { Button as ChakraButton, type ButtonProps } from '@chakra-ui/react'

interface ThemedButtonProps extends Omit<ButtonProps, 'colorPalette'> {
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle'
  useCurrentTheme?: boolean
}

export function ThemedButton({
  variant = 'solid',
  useCurrentTheme = true,
  children,
  ...props
}: ThemedButtonProps) {

  if (!useCurrentTheme) {
    return <ChakraButton variant={variant} {...props}>{children}</ChakraButton>
  }

  // Apply theme colors based on variant using Chakra UI v3 tokens
  const variantStyles = {
    solid: {
      bg: 'purple.500',
      color: 'white',
      _hover: { bg: 'purple.600' },
    },
    outline: {
      borderColor: 'purple.500',
      color: 'purple.500',
      _hover: { bg: 'purple.50' },
    },
    ghost: {
      color: 'purple.500',
      _hover: { bg: 'purple.50' },
    },
    subtle: {
      bg: 'purple.50',
      color: 'purple.500',
      _hover: { bg: 'purple.600', color: 'white' },
    }
  }

  return (
    <ChakraButton
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}
