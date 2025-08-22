import { Button as ChakraButton } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle'
  colorPalette?: 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'solid',
  colorPalette = 'brand',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  return (
    <ChakraButton
      variant={variant}
      colorPalette={colorPalette}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      type={type}
      width={fullWidth ? 'full' : 'auto'}
    >
      {children}
    </ChakraButton>
  )
}