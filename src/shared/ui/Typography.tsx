import { Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline' | 'code' | 'label'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'inherit'
  align?: 'left' | 'center' | 'right' | 'justify'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  decoration?: 'none' | 'underline' | 'line-through'
  truncate?: boolean
  noWrap?: boolean
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label'
  className?: string
  onClick?: () => void
}

const variantStyles = {
  display: {
    fontSize: { base: '3xl', md: '4xl' },
    fontWeight: 'bold',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  heading: {
    fontSize: { base: 'xl', md: '2xl' },
    fontWeight: 'semibold',
    lineHeight: 1.3,
  },
  title: {
    fontSize: { base: 'lg', md: 'xl' },
    fontWeight: 'medium',
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: { base: 'md', md: 'lg' },
    fontWeight: 'normal',
    lineHeight: 1.5,
  },
  body: {
    fontSize: 'md',
    fontWeight: 'normal',
    lineHeight: 1.6,
  },
  caption: {
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 1.4,
  },
  overline: {
    fontSize: 'xs',
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    lineHeight: 1.2,
  },
  code: {
    fontSize: 'sm',
    fontFamily: 'mono',
    fontWeight: 'normal',
    bg: { base: 'gray.100', _dark: 'gray.800' },
    px: 1,
    py: 0.5,
    borderRadius: 'sm',
  },
  label: {
    fontSize: 'sm',
    fontWeight: 'medium',
    lineHeight: 1.4,
  },
}

const colorMap = {
  primary: { base: 'gray.900', _dark: 'gray.50' },
  secondary: { base: 'gray.700', _dark: 'gray.300' },
  muted: { base: 'gray.600', _dark: 'gray.400' },
  accent: { base: 'brand.600', _dark: 'brand.400' },
  success: { base: 'success.600', _dark: 'success.400' },
  warning: { base: 'warning.600', _dark: 'warning.400' },
  error: { base: 'error.600', _dark: 'error.400' },
  info: { base: 'info.600', _dark: 'info.400' },
  inherit: 'inherit',
}

const weightMap = {
  light: 'light',
  normal: 'normal',
  medium: 'medium',
  semibold: 'semibold',
  bold: 'bold',
}

export function Typography({
  children,
  variant = 'body',
  size,
  weight,
  color = 'primary',
  align,
  transform,
  decoration,
  truncate,
  noWrap,
  as,
  className,
  onClick,
  ...rest
}: TypographyProps & Record<string, any>) {
  const variantProps = variantStyles[variant] || {}
  
  return (
    <Text
      as={as}
      {...variantProps}
      fontSize={size || variantProps.fontSize}
      fontWeight={weight ? weightMap[weight] : variantProps.fontWeight}
      color={colorMap[color]}
      textAlign={align}
      textTransform={transform}
      textDecoration={decoration}
      truncate={truncate}
      noOfLines={noWrap ? 1 : undefined}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Text>
  )
}

// Componentes de conveniencia para casos comunes
export function Heading({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading" as="h2" {...props}>{children}</Typography>
}

export function Title({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title" as="h3" {...props}>{children}</Typography>
}

export function Body({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" as="p" {...props}>{children}</Typography>
}

export function Caption({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" as="span" {...props}>{children}</Typography>
}

export function Label({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" as="label" {...props}>{children}</Typography>
}

export function Code({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="code" as="code" {...props}>{children}</Typography>
}