import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { SpacingProp, SpacingToken } from './types'

interface LayoutProps {
  children: ReactNode
  variant?: 'container' | 'section' | 'panel' | 'sidebar' | 'content' | 'header' | 'footer' | 'page'
  padding?: SpacingProp
  margin?: SpacingProp
  width?: 'auto' | 'full' | 'fit' | 'container'
  height?: 'auto' | 'full' | 'screen' | 'fit'
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  bg?: string
  borderRadius?: SpacingProp
  shadow?: SpacingProp
  border?: boolean
  className?: string
  onClick?: () => void
  colorPalette?: string  // Add colorPalette support
}

const variantStyles = {
  container: {
    maxWidth: 'appMaxWidth',
    mx: 'auto',
    px: { base: '4', lg: '6' },
  },
  section: {
    py: { base: '6', lg: '8' },
  },
  panel: {
    borderRadius: '4',
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
    py: '4',
    px: { base: '4', lg: '6' },
    borderBottom: '1px solid',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  footer: {
    py: '4',
    px: { base: '4', lg: '6' },
    borderTop: '1px solid',
  },
  page: {
    minHeight: '100vh',
    width: 'full',
    bg: 'gray.50', // 🎨 Fondo base consistente con sistema de grises
  },
}

// Removemos sizeMap ya que ahora usamos SpacingProp directamente

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
      p={padding}
      m={margin}
      width={width ? widthMap[width] : undefined}
      height={height ? heightMap[height] : undefined}
      position={position}
      overflow={overflow}
      bg={bg}
      borderRadius={borderRadius}
      border={border ? '1px solid' : undefined}
      boxShadow={shadow}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Box>
  )
}