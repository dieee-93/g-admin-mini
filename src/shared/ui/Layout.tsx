import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  variant?: 'container' | 'section' | 'panel' | 'sidebar' | 'content' | 'header' | 'footer'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  width?: 'auto' | 'full' | 'fit' | 'container'
  height?: 'auto' | 'full' | 'screen' | 'fit'
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  bg?: string
  borderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  className?: string
  onClick?: () => void
}

const variantStyles = {
  container: {
    maxWidth: 'appMaxWidth',
    mx: 'auto',
    px: { base: 'md', lg: 'lg' },
  },
  section: {
    py: { base: 'lg', lg: 'xl' },
  },
  panel: {
    bg: { base: 'white', _dark: 'gray.800' },
    borderRadius: 'md',
    shadow: 'sm',
    border: '1px solid',
    borderColor: { base: 'gray.200', _dark: 'gray.700' },
  },
  sidebar: {
    width: { base: 'full', lg: '280px' },
    height: 'full',
    bg: { base: 'white', _dark: 'gray.900' },
    borderRight: '1px solid',
    borderColor: { base: 'gray.200', _dark: 'gray.700' },
  },
  content: {
    flex: 1,
    minHeight: 0, // Para scroll interno
  },
  header: {
    py: 'md',
    px: { base: 'md', lg: 'lg' },
    bg: { base: 'white', _dark: 'gray.800' },
    borderBottom: '1px solid',
    borderColor: { base: 'gray.200', _dark: 'gray.700' },
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  footer: {
    py: 'md',
    px: { base: 'md', lg: 'lg' },
    bg: { base: 'gray.50', _dark: 'gray.900' },
    borderTop: '1px solid',
    borderColor: { base: 'gray.200', _dark: 'gray.700' },
  },
}

const sizeMap = {
  none: 0,
  xs: 'xs',
  sm: 'sm', 
  md: 'md',
  lg: 'lg',
  xl: 'xl',
}

const widthMap = {
  auto: 'auto',
  full: 'full',
  fit: 'fit-content',
  container: 'appMaxWidth',
}

const heightMap = {
  auto: 'auto',
  full: 'full',
  screen: '100vh',
  fit: 'fit-content',
}

export function Layout({
  children,
  variant,
  padding,
  margin,
  width,
  height,
  position,
  overflow,
  bg,
  borderRadius,
  shadow,
  border,
  className,
  onClick,
  ...rest
}: LayoutProps & Record<string, any>) {
  const variantProps = variant ? variantStyles[variant] : {}
  
  return (
    <Box
      {...variantProps}
      p={padding ? sizeMap[padding] : undefined}
      m={margin ? sizeMap[margin] : undefined}
      width={width ? widthMap[width] : undefined}
      height={height ? heightMap[height] : undefined}
      position={position}
      overflow={overflow}
      bg={bg}
      borderRadius={borderRadius ? sizeMap[borderRadius] : undefined}
      shadow={shadow ? sizeMap[shadow] : undefined}
      border={border ? '1px solid' : undefined}
      borderColor={border ? { base: 'gray.200', _dark: 'gray.700' } : undefined}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Box>
  )
}