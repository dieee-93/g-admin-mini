import { Text } from '@chakra-ui/react'
import type { ReactNode, CSSProperties } from 'react'

interface TypographyProps {
  children: ReactNode
  variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline' | 'code' | 'label'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string // ✅ Accepts any Chakra UI v3 color token: "white", "red.500", "text.primary"
  
  // ✅ New Chakra-compatible props
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: 'none' | 'underline' | 'line-through'
  
  // 🔄 Backward compatibility aliases (deprecated but supported)
  align?: 'left' | 'center' | 'right' | 'justify' // @deprecated use textAlign
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' // @deprecated use textTransform  
  decoration?: 'none' | 'underline' | 'line-through' // @deprecated use textDecoration
  
  truncate?: boolean
  noWrap?: boolean
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label'
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  onClick?: () => void
  style?: CSSProperties
  [key: string]: any // Allow additional props for Chakra compatibility
}

// ✅ JERARQUÍA TIPOGRÁFICA OPTIMIZADA SEGÚN MEJORES PRÁCTICAS 2024-2025
// Basado en escalas modernas y responsive typography
const variantStyles = {
  display: {
    fontSize: { base: '4xl', md: '5xl', lg: '6xl' }, // Hero typography más impactante
    fontWeight: 'bold',
    lineHeight: { base: 1.1, md: 1.0 }, // Más apretado para display
    letterSpacing: '-0.03em', // Más ajustado para tamaños grandes
  },
  heading: {
    fontSize: { base: '3xl', md: '4xl' }, // ✅ MÁS PROMINENTE: era 2xl→3xl
    fontWeight: 'bold', // ✅ MÁS FUERTE: era semibold
    lineHeight: 1.1, // ✅ MÁS APRETADO para headers grandes
    letterSpacing: '-0.02em', // ✅ Más ajustado para tamaños grandes
  },
  title: {
    fontSize: { base: '2xl', md: '3xl' }, // ✅ AUMENTADO: era xl→2xl
    fontWeight: 'semibold', // ✅ MÁS FUERTE: era medium
    lineHeight: 1.2, // ✅ Optimizado
    letterSpacing: '-0.01em', // ✅ Agregado spacing
  },
  subtitle: {
    fontSize: { base: 'xl', md: '2xl' }, // ✅ AUMENTADO: era lg→xl
    fontWeight: 'medium', // ✅ Mantiene diferencia con title
    lineHeight: 1.3,
  },
  body: {
    fontSize: { base: 'md', lg: 'lg' }, // Responsive body text
    fontWeight: 'normal',
    lineHeight: 1.6, // Óptimo para lectura
  },
  caption: {
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 1.5, // Mejorado para legibilidad
  },
  overline: {
    fontSize: 'xs',
    fontWeight: 'semibold', // Más fuerte para destacar
    textTransform: 'uppercase',
    letterSpacing: '0.12em', // Más spacing para uppercase
    lineHeight: 1.3,
  },
  code: {
    fontSize: 'sm',
    fontFamily: 'mono',
    fontWeight: 'normal',
    px: 2, // Más padding siguiendo 8px grid
    py: 1,
    borderRadius: 'sm',
  },
  label: {
    fontSize: 'sm',
    fontWeight: 'semibold', // Más fuerte para etiquetas
    lineHeight: 1.4,
    letterSpacing: '0.01em', // Sutil mejora
  },
}


const weightMap = {
  light: 'light',
  normal: 'normal',
  medium: 'medium',
  semibold: 'semibold',
  bold: 'bold',
}

// ✅ MAPPING DE NIVELES DE HEADING SEGÚN MEJORES PRÁCTICAS
// Asegura jerarquía semántica correcta
const headingLevelMap = {
  1: { as: 'h1' as const, variant: 'display' as const, weight: undefined as 'semibold' | undefined },
  2: { as: 'h2' as const, variant: 'heading' as const, weight: undefined as 'semibold' | undefined },
  3: { as: 'h3' as const, variant: 'title' as const, weight: undefined as 'semibold' | undefined },
  4: { as: 'h4' as const, variant: 'subtitle' as const, weight: undefined as 'semibold' | undefined },
  5: { as: 'h5' as const, variant: 'body' as const, weight: 'semibold' as const },
  6: { as: 'h6' as const, variant: 'caption' as const, weight: 'semibold' as const },
} as const

export function Typography({
  children,
  variant = 'body',
  size,
  weight,
  color, // ✅ Now accepts any Chakra color token
  textAlign,
  textTransform,
  textDecoration,
  // 🔄 Backward compatibility props
  align,
  transform,
  decoration,
  truncate,
  noWrap,
  as,
  level,
  className,
  onClick,
  style,
  ...rest
}: TypographyProps & Record<string, any>) {
  // ✅ Manejo inteligente de niveles de heading
  let resolvedVariant = variant
  let resolvedAs = as
  let resolvedWeight = weight
  
  if (level) {
    const levelConfig = headingLevelMap[level]
    resolvedVariant = levelConfig.variant as typeof variant
    resolvedAs = levelConfig.as as typeof as
    resolvedWeight = weight || levelConfig.weight || undefined
  }
  
  const variantProps = variantStyles[resolvedVariant] || {}
  
  return (
    <Text
      as={resolvedAs}
      {...variantProps}
      fontSize={size || variantProps.fontSize}
      fontWeight={resolvedWeight ? weightMap[resolvedWeight] : variantProps.fontWeight}
      color={color} // ✅ Pass directly to Chakra - accepts any token
      textAlign={textAlign || align} // 🔄 Backward compatibility
      textTransform={textTransform || transform} // 🔄 Backward compatibility
      textDecoration={textDecoration || decoration} // 🔄 Backward compatibility
      truncate={truncate}
      lineClamp={noWrap ? 1 : undefined}
      className={className}
      onClick={onClick}
      style={style}
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
  return <Typography variant="code" as="span" {...props}>{children}</Typography>
}