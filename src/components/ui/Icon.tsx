// src/components/ui/Icon.tsx
// Sistema de iconos moderno con Heroicons + tamaños estandarizados
// ✅ SOLUCIÓN: Wrapper que maneja sizes + colores + variants dinámicamente

import React from 'react';
import { Box } from '@chakra-ui/react';

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

// ✅ SISTEMA DE TAMAÑOS ESTANDARIZADO
export const ICON_SIZES = {
  xs: 'w-3 h-3',    // 12px - Micro elementos
  sm: 'w-4 h-4',    // 16px - Botones pequeños, badges
  md: 'w-5 h-5',    // 20px - Botones normales, inputs
  lg: 'w-6 h-6',    // 24px - Headers, cards principales
  xl: 'w-8 h-8',    // 32px - Iconos destacados
  '2xl': 'w-10 h-10' // 40px - Hero elements
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
  // ✅ Determinar qué icono usar
  const ResolvedIcon = React.useMemo(() => {
    if (loading) return ArrowPathIcon;
    if (IconComponent) return IconComponent;
    if (category && name && ICONS[category] && ICONS[category][name as any]) {
      return ICONS[category][name as any] as React.ComponentType<{ className?: string }>;
    }
    return null;
  }, [category, name, IconComponent, loading]);

  if (!ResolvedIcon) {
    console.warn(`Icon not found: ${category}.${name}`);
    return null;
  }

  // ✅ Construir className con tamaños estandarizados
  const sizeClass = ICON_SIZES[size];
  const colorClass = color ? `text-${color}` : '';
  const loadingClass = loading ? 'animate-spin' : '';
  
  const finalClassName = [
    sizeClass,
    colorClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return <ResolvedIcon className={finalClassName} {...props} />;
}

// ✅ COMPONENTES DE CONVENIENCIA POR CONTEXTO
export function ActionIcon({ 
  name, 
  size = 'sm', 
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'actions'> }) {
  return <Icon category="actions" name={name} size={size} {...props} />;
}

export function StatusIcon({ 
  name, 
  size = 'md', 
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'status'> }) {
  return <Icon category="status" name={name} size={size} {...props} />;
}

export function NavIcon({ 
  name, 
  size = 'md', 
  ...props 
}: Omit<IconProps, 'category'> & { name: IconName<'navigation'> }) {
  return <Icon category="navigation" name={name} size={size} {...props} />;
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
    <Icon category="status" name="success" color="green.500" />
    <Icon category="status" name="error" color="red.500" />
    <Icon category="status" name="warning" color="yellow.500" />
    
    {/* Loading state */}
    <Icon category="actions" name="save" loading />
    
    {/* Componentes de conveniencia */}
    <ActionIcon name="edit" size="sm" />
    <StatusIcon name="success" color="green.500" />
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