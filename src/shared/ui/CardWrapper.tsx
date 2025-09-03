import { Card as ChakraCard } from '@chakra-ui/react'
import React, { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'elevated' | 'outline' | 'subtle' 
  size?: 'sm' | 'md' | 'lg'
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  bg?: string // Background color prop
  className?: string
  [key: string]: any
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

interface CardBodyProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

interface CardFooterProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

// ✅ Base CardWrapper component following Chakra UI v3 patterns
function CardWrapper({ 
  children, 
  variant = 'outline',
  size = 'md',
  color = 'gray.900',
  colorPalette,
  bg = 'gray.50', // Default gray background for cards
  ...props 
}: CardProps) {
  return (
    <ChakraCard.Root 
      variant={variant}
      size={size}
      color={color}
      colorPalette={colorPalette}
      bg={bg}
      {...props}
    >
      {children}
    </ChakraCard.Root>
  )
}

function CardHeader({ children, ...props }: CardHeaderProps) {
  return (
    <ChakraCard.Header {...props}>
      {children}
    </ChakraCard.Header>
  )
}

function CardBody({ children, ...props }: CardBodyProps) {
  return (
    <ChakraCard.Body {...props}>
      {children}
    </ChakraCard.Body>
  )
}

function CardFooter({ children, ...props }: CardFooterProps) {
  return (
    <ChakraCard.Footer {...props}>
      {children}
    </ChakraCard.Footer>
  )
}

function CardTitle({ children, ...props }: CardTitleProps) {
  return (
    <ChakraCard.Title {...props}>
      {children}
    </ChakraCard.Title>
  )
}

function CardDescription({ children, ...props }: CardDescriptionProps) {
  return (
    <ChakraCard.Description {...props}>
      {children}
    </ChakraCard.Description>
  )
}

// Compound component pattern
CardWrapper.Header = CardHeader
CardWrapper.Body = CardBody
CardWrapper.Footer = CardFooter
CardWrapper.Title = CardTitle
CardWrapper.Description = CardDescription

// Export all components
export { CardWrapper, CardHeader, CardBody, CardFooter, CardTitle, CardDescription }