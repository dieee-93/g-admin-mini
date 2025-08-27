import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react'

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
  
  // Apply theme colors based on variant
  const variantStyles = {
    solid: {
      bg: primary,
      color: 'white',
      _hover: { bg: primaryHover },
    },
    outline: {
      borderColor: primary,
      color: primary,
      _hover: { bg: primaryLight },
    },
    ghost: {
      color: primary,
      _hover: { bg: primaryLight },
    },
    subtle: {
      bg: primaryLight,
      color: primary,
      _hover: { bg: primaryHover, color: 'white' },
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
