/**
 * Componente Slot para renderizado dinámico
 * Integrado con el sistema de capacidades de G-Admin
 */

import React from 'react';
import { Box } from '@/shared/ui';
import { useSlotRegistry } from './SlotRegistry';
import { useCapabilities } from '../capabilities/hooks/useCapabilities';

import { logger } from '@/lib/logging';
export interface SlotProps {
  /**
   * Nombre único del slot
   */
  name: string;

  /**
   * Datos que se pasan a todos los componentes del slot
   */
  data?: Record<string, any>;

  /**
   * Wrapper component para cada componente del slot
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;

  /**
   * Capacidades adicionales requeridas específicamente para este slot
   * (se suman a las capacidades de cada componente)
   */
  additionalRequirements?: string[];

  /**
   * Mostrar solo el primer componente válido (default: false - muestra todos)
   */
  single?: boolean;

  /**
   * Componente fallback si no hay componentes válidos
   */
  fallback?: React.ReactNode;

  /**
   * Props adicionales que se pasan a cada componente
   */
  componentProps?: Record<string, any>;

  /**
   * Debug mode - muestra información en consola
   */
  debug?: boolean;

  /**
   * Clase CSS para el contenedor
   */
  className?: string;

  /**
   * Gap entre componentes (si se renderizan múltiples)
   */
  gap?: number | string;
}

/**
 * Componente Slot - Punto de extensión para módulos
 */
export const Slot: React.FC<SlotProps> = ({
  name,
  data = {},
  wrapper: Wrapper,
  additionalRequirements = [],
  single = false,
  fallback = null,
  componentProps = {},
  debug = false,
  className,
  gap = 0
}) => {
  const registry = useSlotRegistry();
  const { resolvedCapabilities } = useCapabilities();

  // Obtener componentes válidos para este slot
  const validComponents = React.useMemo(() => {
    const components = registry.getComponents(name, resolvedCapabilities);

    // Filtrar por capacidades adicionales si se especifican
    if (additionalRequirements.length > 0) {
      return components.filter(comp => {
        return additionalRequirements.every(req =>
          resolvedCapabilities.includes(req as any)
        );
      });
    }

    return components;
  }, [registry, name, resolvedCapabilities, additionalRequirements]);

  // Debug info
  React.useEffect(() => {
    if (debug && process.env.NODE_ENV === 'development') {
      logger.info('App', `🎯 Slot [${name}]:`, {
        availableComponents: validComponents.length,
        resolvedCapabilities: resolvedCapabilities.length,
        components: validComponents.map(comp => ({
          id: comp.id,
          module: comp.moduleId,
          requirements: comp.requirements
        }))
      });
    }
  }, [debug, name, validComponents, resolvedCapabilities]);

  // Si no hay componentes válidos, mostrar fallback
  if (validComponents.length === 0) {
    return fallback ? <>{fallback}</> : null;
  }

  // Obtener componentes a renderizar
  const componentsToRender = single ? [validComponents[0]] : validComponents;

  // Renderizar componentes
  const renderedComponents = componentsToRender.map((slotComponent, index) => {
    const Component = slotComponent.component;

    const finalProps = {
      ...componentProps,
      ...data,
      slotName: name,
      slotData: data
    };

    const element = <Component key={slotComponent.id} {...finalProps} />;

    return Wrapper ? (
      <Wrapper key={slotComponent.id}>{element}</Wrapper>
    ) : element;
  });

  // Si solo hay un componente, renderizarlo directamente
  if (renderedComponents.length === 1) {
    return <>{renderedComponents[0]}</>;
  }

  // Si hay múltiples componentes, usar un contenedor con gap
  return (
    <Box className={className} display="flex" flexDirection="column" gap={gap}>
      {renderedComponents}
    </Box>
  );
};

/**
 * Hook para verificar si un slot tiene componentes
 */
export function useSlotHasComponents(
  slotName: string,
  additionalRequirements: string[] = []
): boolean {
  const registry = useSlotRegistry();
  const { resolvedCapabilities } = useCapabilities();

  return React.useMemo(() => {
    const hasComponents = registry.hasComponents(slotName, resolvedCapabilities);

    if (!hasComponents || additionalRequirements.length === 0) {
      return hasComponents;
    }

    // Verificar capacidades adicionales
    return additionalRequirements.every(req =>
      resolvedCapabilities.includes(req as any)
    );
  }, [registry, slotName, resolvedCapabilities, additionalRequirements]);
}

/**
 * Componente condicional que solo renderiza si el slot tiene componentes
 */
export const ConditionalSlot: React.FC<SlotProps & {
  children?: React.ReactNode;
}> = ({ children, ...slotProps }) => {
  const hasComponents = useSlotHasComponents(
    slotProps.name,
    slotProps.additionalRequirements
  );

  if (!hasComponents) {
    return children ? <>{children}</> : null;
  }

  return <Slot {...slotProps} />;
};

/**
 * Slot inline - para casos simples
 */
export const InlineSlot: React.FC<{
  name: string;
  data?: any;
  fallback?: React.ReactNode;
}> = ({ name, data, fallback }) => {
  return <Slot name={name} data={data} fallback={fallback} single />;
};