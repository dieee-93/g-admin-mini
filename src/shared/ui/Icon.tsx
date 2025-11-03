import { Icon as ChakraIcon } from '@chakra-ui/react';
import type { IconProps as ChakraIconProps, ConditionalValue } from '@chakra-ui/react';
import type { ElementType } from 'react';

interface IconProps extends Omit<ChakraIconProps, 'size'> {
  /** El componente de ícono a renderizar - alternativa a `as` prop (ej: de heroicons, react-icons, etc.) */
  icon?: ElementType;
  /** Tamaño predefinido del ícono */
  size?: ConditionalValue<"sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "inherit" | undefined>;
}

/**
 * Componente Icon universal - Wrapper para Chakra UI Icon v3
 * Compatible con Heroicons, React Icons y cualquier SVG component
 *
 * @example
 * // Patrón 1: Con children (estándar Chakra v3)
 * import { HomeIcon } from '@heroicons/react/24/outline'
 * <Icon size="md"><HomeIcon /></Icon>
 *
 * // Patrón 2: Con `as` prop (estándar Chakra v3)
 * <Icon as={HomeIcon} size="md" />
 *
 * // Patrón 3: Con `icon` prop (compatibilidad legacy)
 * <Icon icon={HomeIcon} size="md" />
 *
 * // Con asChild pattern
 * <Icon asChild size="lg">
 *   <CustomSvgIcon />
 * </Icon>
 */
export const Icon = ({
  icon: IconComponent,
  as: AsComponent,
  size = 'md',
  children,
  ...props
}: IconProps) => {
  // Prioridad: as > icon > children
  // Si tenemos `as` o `icon` prop, usamos ese componente
  const IconToRender = AsComponent || IconComponent;

  // FIX: Validar que sea un componente React válido
  // Si es string, undefined, null, o cualquier cosa que no sea función, no usar ChakraIcon
  if (typeof IconToRender !== 'function') {
    // Renderizar como texto simple (emojis, strings, etc)
    const sizeMap = { 'xs': '12px', 'sm': '14px', 'md': '16px', 'lg': '20px', 'xl': '24px', '2xl': '28px' };
    const fontSize = sizeMap[size as keyof typeof sizeMap] || '16px';
    return (
      <span style={{ fontSize, display: 'inline-block', lineHeight: 1 }}>
        {typeof IconToRender === 'string' ? IconToRender : '?'}
      </span>
    );
  }

  // Si llegamos aquí, IconToRender ES una función (componente React válido)
  if (IconToRender) {
    return (
      <ChakraIcon as={IconToRender} size={size} {...props} />
    );
  }

  // Si tenemos children, usamos el patrón children
  if (children) {
    return (
      <ChakraIcon size={size} {...props}>
        {children}
      </ChakraIcon>
    );
  }

  // Fallback - Icon vacío
  return <ChakraIcon size={size} {...props} />;
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