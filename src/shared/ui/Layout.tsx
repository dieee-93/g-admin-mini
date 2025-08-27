import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  variant?: 'container' | 'section' | 'panel' | 'sidebar' | 'content' | 'header' | 'footer' | 'page'
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
  colorPalette?: string  // Add colorPalette support
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
    borderRadius: 'md',
    border: '1px solid',
  },
  sidebar: {
    width: { base: 'full', lg: '280px' },
    height: 'full',
    borderRight: '1px solid',
  },
  content: {
    flex: 1,
    minHeight: 0, // Para scroll interno
  },
  header: {
    py: 'md',
    px: { base: 'md', lg: 'lg' },
    borderBottom: '1px solid',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  footer: {
    py: 'md',
    px: { base: 'md', lg: 'lg' },
    borderTop: '1px solid',
  },
  page: {
    minHeight: '100vh',
    width: 'full',
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
  colorPalette,
  ...rest
}: LayoutProps & Record<string, any>) {
  const variantProps = variant ? variantStyles[variant] : {}
  
  // ✅ CLEAN: No hardcoded colors - let Chakra handle defaults
  // Dynamic theme system should override default values automatically
  
  return (
    <Box
      colorPalette={colorPalette}
      {...variantProps}
      p={padding ? sizeMap[padding] : undefined}
      m={margin ? sizeMap[margin] : undefined}
      width={width ? widthMap[width] : undefined}
      height={height ? heightMap[height] : undefined}
      position={position}
      overflow={overflow}
      bg={bg}
      borderRadius={borderRadius ? sizeMap[borderRadius] : undefined}
      border={border ? '1px solid' : undefined}
      boxShadow={shadow ? sizeMap[shadow] : undefined}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Box>
  )
}