import { Icon as ChakraIcon } from '@chakra-ui/react';
import type { IconProps as ChakraIconProps, ConditionalValue } from '@chakra-ui/react';
import type { ElementType, ReactElement } from 'react';


interface IconProps extends Omit<ChakraIconProps, 'children' | 'as' | 'size'> {
  /** El componente de ícono a renderizar (ej: de heroicons, react-icons, etc.) */
  icon?: ElementType;
  /** Tamaño predefinido del ícono */
  size?: ConditionalValue<"sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "inherit" | undefined>;
  /** Para compatibilidad con asChild pattern */
  asChild?: boolean;
  /** Children para el patrón asChild */
  children?: ReactElement;
}

/**
 * Componente Icon universal - Wrapper simple para Chakra UI Icon
 * Compatible con Heroicons, React Icons y cualquier SVG component
 * 
 * @example
 * // Con heroicons
 * import { HomeIcon } from '@heroicons/react/24/outline'
 * <Icon icon={HomeIcon} size="md" />
 * 
 * // Con react-icons
 * import { FiHome } from 'react-icons/fi'
 * <Icon icon={FiHome} size="lg" />
 *  
 * // Con tamaño custom
 * <Icon icon={UserIcon} size="8" />
 * 
 * // Patrón asChild (compatible con Chakra UI v3)
 * <Icon asChild>
 *   <CustomSvgIcon />
 * </Icon>
 */
export const Icon = ({ 
  icon: IconComponent, 
  size = 'md', 
  asChild, 
  children,
  ...props 
}: IconProps) => {
  // Determinar el tamaño final - asegurar compatibilidad con Chakra UI


  // Si usamos el patrón asChild, renderizamos el children directamente
  if (asChild && children) {
    return (
      <ChakraIcon size={size} {...props} asChild>
        {children}
      </ChakraIcon>
    );
  }

  // Si tenemos un componente de ícono, lo renderizamos directamente sin ChakraIcon
  // Heroicons v2 son componentes SVG que funcionan mejor sin wrapper
  if (IconComponent) {
    // Map Chakra sizes to pixel values for Heroicons
    const sizeMap = {
      'xs': '16px',
      'sm': '20px',
      'md': '24px',
      'lg': '32px',
      'xl': '40px',
      '2xl': '48px',
      'inherit': 'inherit'
    };

    const pixelSize = sizeMap[size as keyof typeof sizeMap] || size;

    // Extract only valid SVG props (filter out Chakra-specific props)
    const { color, colorPalette, ...svgProps } = props as any;

    // Convert Chakra color to CSS color for SVG
    const svgColor = color && typeof color === 'string' && color.includes('.')
      ? `var(--chakra-colors-${color.replace('.', '-')})`
      : color;

    return (
      <IconComponent
        style={{
          width: pixelSize,
          height: pixelSize,
          color: svgColor,
          ...props.style
        }}
        {...svgProps}
      />
    );
  }

  // Fallback - renderizar ChakraIcon sin contenido
  return (
    <ChakraIcon 
      size={size}
      {...props}
    />
  );
};

// Variantes especializadas para diferentes contextos
/**
 * ButtonIcon - Variante optimizada para botones
 * Tamaño fijo: xs (16px)
 */
export const ButtonIcon = ({ size = 'xs', ...props }: IconProps) => (
  <Icon size={size} {...props} />
);

/**
 * InputIcon - Variante optimizada para inputs y campos de formulario
 * Tamaño fijo: sm (20px)
 */
export const InputIcon = ({ size = 'sm', ...props }: IconProps) => (
  <Icon size={size} {...props} />
);

/**
 * NavIcon - Variante optimizada para navegación
 * Tamaño fijo: md (24px)
 */
export const NavIcon = ({ size = 'md', ...props }: IconProps) => (
  <Icon size={size} {...props} />
);

/**
 * HeaderIcon - Variante optimizada para headers de cards y secciones
 * Tamaño fijo: lg (32px)
 */
export const HeaderIcon = ({ size = 'lg', ...props }: IconProps) => (
  <Icon size={size} {...props} />
);

/**
 * HeroIcon - Variante optimizada para elementos hero y destacados
 * Tamaño fijo: xl (40px)
 */
export const HeroIcon = ({ size = 'xl', ...props }: IconProps) => (
  <Icon size={size} {...props} />
);

export default Icon;