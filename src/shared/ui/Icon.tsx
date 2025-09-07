import { Icon as ChakraIcon } from '@chakra-ui/react';
import type { IconProps as ChakraIconProps } from '@chakra-ui/react';
import type { ElementType, ReactElement } from 'react';

// Tamaños estándar usando el sistema de Chakra UI
const sizeMap = {
  xs: '3',
  sm: '4', 
  md: '5',
  lg: '6',
  xl: '8',
  '2xl': '10',
} as const;

type IconSize = keyof typeof sizeMap;

interface IconProps extends Omit<ChakraIconProps, 'children' | 'as' | 'size'> {
  /** El componente de ícono a renderizar (ej: de heroicons, react-icons, etc.) */
  icon?: ElementType;
  /** Tamaño predefinido del ícono */
  size?: IconSize | string;
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
  const finalSize = typeof size === 'string' && size in sizeMap 
    ? sizeMap[size as IconSize] 
    : size;

  // Si usamos el patrón asChild, renderizamos el children directamente
  if (asChild && children) {
    return (
      <ChakraIcon size={finalSize as ChakraIconProps['size']} {...props} asChild>
        {children}
      </ChakraIcon>
    );
  }

  // Si tenemos un componente de ícono, lo renderizamos
  if (IconComponent) {
    return (
      <ChakraIcon 
        as={IconComponent} 
        size={finalSize as ChakraIconProps['size']}
        {...props}
      />
    );
  }

  // Fallback - renderizar ChakraIcon sin contenido
  return (
    <ChakraIcon 
      size={finalSize as ChakraIconProps['size']}
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