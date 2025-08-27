// src/components/ui/Icon.tsx
// Sistema de iconos moderno con Heroicons + tamaños estandarizados
// ✅ SOLUCIÓN: Wrapper que maneja sizes + colores + variants dinámicamente

import React from 'react';

// ✅ Heroicons imports - Separados por categoría
// Navigation & Layout
import { 
  HomeIcon, 
  CubeIcon, 
  Cog6ToothIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Actions
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Status & Alerts  
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

// ✅ SISTEMA DE TAMAÑOS SIGUIENDO ESTÁNDARES MODERNOS 2024-2025
// Usando tokens de Chakra UI en lugar de Tailwind
export const ICON_SIZES = {
  xs: { width: '16px', height: '16px' },    // 16px - Dense layouts, pequeños botones
  sm: { width: '20px', height: '20px' },    // 20px - Text pairing, badges, inputs  
  md: { width: '24px', height: '24px' },    // 24px - Default size, navegación, cards
  lg: { width: '32px', height: '32px' },    // 32px - Headers, elementos destacados
  xl: { width: '40px', height: '40px' },    // 40px - Hero elements, iconografía principal
  '2xl': { width: '48px', height: '48px' }  // 48px - Extra large contexts, dashboard highlights
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// ✅ REGISTRO DE ICONOS POR CATEGORÍA
export const ICONS = {
  // Navegación y módulos
  navigation: {
    home: HomeIcon,
    inventory: CubeIcon,
    users: UsersIcon,
    sales: CurrencyDollarIcon,
    settings: Cog6ToothIcon,
  },
  
  // Acciones comunes
  actions: {
    add: PlusIcon,
    edit: PencilIcon,
    delete: TrashIcon,
    search: MagnifyingGlassIcon,
    save: DocumentArrowDownIcon,
    loading: ArrowPathIcon,
  },
  
  // Estados y alertas
  status: {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }
} as const;

// ✅ Types para el sistema
export type IconCategory = keyof typeof ICONS;
export type IconName<T extends IconCategory> = keyof typeof ICONS[T];

// ✅ COMPONENTE WRAPPER PRINCIPAL
interface IconProps {
  // Opción 1: Usar sistema de iconos (recomendado)
  category?: IconCategory;
  name?: string;
  
  // Opción 2: Pasar componente directamente  
  icon?: React.ComponentType<{ className?: string }>;
  
  // Configuración visual
  size?: IconSize;
  color?: string;
  className?: string;
  
  // Loading state
  loading?: boolean;
}

export function Icon({
  category,
  name,
  icon: IconComponent,
  size = 'md',
  color,
  className = '',
  loading = false,
  ...props
}: IconProps) {
  // ✅ Determinar qué icono usar - CORREGIDO: Type-safe access
  const ResolvedIcon = React.useMemo(() => {
    if (loading) return ArrowPathIcon;
    if (IconComponent) return IconComponent;
    
    // ✅ CORREGIDO: Type-safe icon access
    if (category && name) {
      const categoryIcons = ICONS[category];
      if (categoryIcons && name in categoryIcons) {
        return categoryIcons[name as keyof typeof categoryIcons] as React.ComponentType<{ className?: string }>;
      }
    }
    return null;
  }, [category, name, IconComponent, loading]);

  if (!ResolvedIcon) {
    console.warn(`Icon not found: ${category}.${name}`);
    return null;
  }

  // ✅ Aplicar estilos usando props de Chakra UI - SIN TAILWIND
  const sizeStyles = ICON_SIZES[size];
  const loadingStyles = loading ? {
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  } : {};
  
  const combinedStyles = { ...sizeStyles, ...loadingStyles };

  return (
    <ResolvedIcon 
      style={combinedStyles} 
      color={color}
      className={className} 
      {...props} 
    />
  );
}

// ✅ COMPONENTES DE CONVENIENCIA CON CONVENCIONES ESTABLECIDAS
export function ActionIcon({ 
  name, 
  size = 'xs', // 16px - Botones pequeños, controles inline
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'actions'> }) {
  return <Icon category="actions" name={name} size={size} {...props} />;
}

export function StatusIcon({ 
  name, 
  size = 'sm', // 20px - Status badges, text pairing
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'status'> }) {
  return <Icon category="status" name={name} size={size} {...props} />;
}

export function NavIcon({ 
  name, 
  size = 'md', // 24px - Navegación principal, sidebar
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'navigation'> }) {
  return <Icon category="navigation" name={name} size={size} {...props} />;
}

// ✅ NUEVOS: Componentes por contexto siguiendo mejores prácticas
export function HeaderIcon({
  icon,
  size = 'lg', // 32px - Headers de cards, secciones principales
  ...props
}: Omit<IconProps, 'category' | 'name'>) {
  return <Icon icon={icon} size={size} {...props} />;
}

export function HeroIcon({
  icon, 
  size = 'xl', // 40px - Overview cards, elementos destacados
  ...props
}: Omit<IconProps, 'category' | 'name'>) {
  return <Icon icon={icon} size={size} {...props} />;
}

// ✅ HOOK PARA ICONOS DINÁMICOS (Para NavigationContext)
export function useDynamicIcon(iconComponent: React.ComponentType<{ className?: string }>) {
  return React.useCallback((props: { size?: IconSize; color?: string; className?: string }) => {
    return <Icon icon={iconComponent} {...props} />;
  }, [iconComponent]);
}

// ✅ EJEMPLOS DE USO
export const IconExamples = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
    {/* Tamaños diferentes */}
    <Icon category="actions" name="add" size="xs" />
    <Icon category="actions" name="add" size="sm" />
    <Icon category="actions" name="add" size="md" />
    <Icon category="actions" name="add" size="lg" />
    <Icon category="actions" name="add" size="xl" />
    
    {/* Con colores */}
    <Icon category="status" name="success"  />
    <Icon category="status" name="error" color="error.500" />
    <Icon category="status" name="warning" color="warning.500" />
    
    {/* Loading state */}
    <Icon category="actions" name="save" loading />
    
    {/* Componentes de conveniencia */}
    <ActionIcon name="edit" size="sm" />
    <StatusIcon name="success"  />
    <NavIcon name="home" size="lg" />
  </div>
);

// ✅ EXPORTS PARA FACILITAR USO
export {
  HomeIcon,
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export { 
  CheckCircleIcon as CheckSolid,
  XCircleIcon as XSolid,
  ExclamationTriangleIcon as WarningSolid 
} from '@heroicons/react/24/solid';