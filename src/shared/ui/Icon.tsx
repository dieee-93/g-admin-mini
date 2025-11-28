import { Icon as ChakraIcon } from '@chakra-ui/react';
import type { IconProps as ChakraIconProps, ConditionalValue } from '@chakra-ui/react';
import { memo } from 'react';
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
// 🛠️ PERFORMANCE: Memoized to prevent re-renders when props don't change
export const Icon = memo(function Icon({
  icon: IconComponent,
  as: AsComponent,
  size = 'md',
  children,
  ...props
}: IconProps) {
  // Prioridad: as > icon > children
  // Si tenemos `as` o `icon` prop, usamos ese componente
  const IconToRender = AsComponent || IconComponent;

  // Validar que sea un componente React válido
  // Heroicons usa React.forwardRef, que retorna un objeto con $$typeof, no una función
  const isValidReactComponent =
    typeof IconToRender === 'function' ||
    (IconToRender && typeof IconToRender === 'object' && IconToRender.$$typeof);

  // CASO 1: Tenemos un componente válido (as o icon prop)
  if (isValidReactComponent) {
    return <ChakraIcon as={IconToRender} size={size} {...props} />;
  }

  // CASO 2: Tenemos children
  if (children) {
    return (
      <ChakraIcon size={size} {...props}>
        {children}
      </ChakraIcon>
    );
  }

  // CASO 3: Tenemos un string (emoji, texto)
  if (typeof IconToRender === 'string') {
    const sizeMap = { 'xs': '12px', 'sm': '14px', 'md': '16px', 'lg': '20px', 'xl': '24px', '2xl': '28px' };
    const fontSize = sizeMap[size as keyof typeof sizeMap] || '16px';
    return (
      <span style={{ fontSize, display: 'inline-block', lineHeight: 1 }}>
        {IconToRender}
      </span>
    );
  }

  // CASO 4: Fallback - Icono vacío (no hay nada válido)
  return <ChakraIcon size={size} {...props} />;
});

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