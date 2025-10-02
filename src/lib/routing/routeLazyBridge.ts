/**
 * ROUTE-LAZY BRIDGE
 * Conecta el nuevo sistema de route mapping con el LazyLoadingManager existente
 */

import { logger } from '@/lib/logging';

import { 
  routeToComponentMap, 
  getComponentFromRoute,
  getDomainFromRoute,
  type RoutePathAdmin 
} from '@/config/routeMap';

import {
  lazyModules,
  modulePreloadingConfig,
  moduleMetadata
} from '@/lib/lazy';

/**
 * Obtiene el lazy component correcto basado en la route
 */
export function getLazyComponentByRoute(route: string): any {
  const componentName = getComponentFromRoute(route as RoutePathAdmin);
  
  if (!componentName) {
    logger.warn('NavigationContext', `⚠️ No component mapping found for route: ${route}`);
    return null;
  }

  // Try to get from existing lazy modules first
  if (componentName in lazyModules) {
    return lazyModules[componentName as keyof typeof lazyModules];
  }

  // For non-lazy components, return the component name (will be resolved in App.tsx)
  return componentName;
}

/**
 * Obtiene la configuración de preloading para un dominio
 */
export function getPreloadingConfig(route: string) {
  const domain = getDomainFromRoute(route);
  
  if (!domain) return [];
  
  return modulePreloadingConfig[domain as keyof typeof modulePreloadingConfig] || [];
}

/**
 * Obtiene metadata del módulo basado en la route
 */
export function getModuleMetadata(route: string) {
  const domain = getDomainFromRoute(route);
  
  if (!domain) return null;
  
  return moduleMetadata[domain as keyof typeof moduleMetadata] || null;
}

/**
 * Debug helper - muestra información completa de una route
 */
export function debugRoute(route: string) {
  const componentName = getComponentFromRoute(route as RoutePathAdmin);
  const domain = getDomainFromRoute(route);
  const preloadConfig = getPreloadingConfig(route);
  const metadata = getModuleMetadata(route);
  
  console.group(`🔍 Route Debug: ${route}`);
  logger.info('NavigationContext', `Component: ${componentName}`);
  logger.info('NavigationContext', `Domain: ${domain}`);
  logger.info('NavigationContext', `Preload Config:`, preloadConfig);
  logger.info('NavigationContext', `Metadata:`, metadata);
  console.groupEnd();
  
  return {
    route,
    componentName,
    domain,
    preloadConfig,
    metadata
  };
}

/**
 * Verifica si una route requiere lazy loading
 */
export function requiresLazyLoading(route: string): boolean {
  const componentName = getComponentFromRoute(route as RoutePathAdmin);
  return componentName?.startsWith('Lazy') ?? false;
}

/**
 * Export del bridge completo
 */
export const routeLazyBridge = {
  getLazyComponentByRoute,
  getPreloadingConfig,
  getModuleMetadata,
  debugRoute,
  requiresLazyLoading,
  
  // Quick access to maps
  routeToComponentMap,
  lazyModules,
  modulePreloadingConfig,
  moduleMetadata
};