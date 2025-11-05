/**
 * AUTOMATED LAZY LOADING SYSTEM
 * Crea lazy components automáticamente basado en route mapping
 */

import { lazy } from 'react';
import type { ComponentType } from 'react';
import { routeToFileMap, routeToComponentMap } from '@/config/routeMap';

import { logger } from '@/lib/logging';
// Type for lazy component creation
type LazyComponentCreator = () => Promise<{ default: ComponentType<any> }>;

// Cache for lazy components
const lazyComponentCache = new Map<string, ComponentType<any>>();

/**
 * Crea un lazy component desde un file path
 */
export function createLazyComponent(filePath: string): ComponentType<any> {
  // Check cache first
  if (lazyComponentCache.has(filePath)) {
    return lazyComponentCache.get(filePath)!;
  }

  // Crear import path dinámico
  const importPath = `@/${filePath}`;
  
  const LazyComponent = lazy(() => {
    logger.info('NavigationContext', `🔄 Lazy loading: ${filePath}`);
    return import(importPath).catch((_error) => {
      logger.error('NavigationContext', `❌ Failed to load module: ${filePath}`, error);
      // Fallback to a basic error component
      return import('@/shared/components/ErrorFallback');
    });
  });

  // Cache the component
  lazyComponentCache.set(filePath, LazyComponent);
  
  return LazyComponent;
}

/**
 * Crea todos los lazy components automáticamente
 */
export function createAutoLazyComponents(): Record<string, ComponentType<any>> {
  const lazyComponents: Record<string, ComponentType<any>> = {};

  // Iterate through all routes and create lazy components
  Object.entries(routeToFileMap).forEach(([route, filePath]) => {
    const componentName = routeToComponentMap[route as keyof typeof routeToComponentMap];
    
    // Solo create lazy components para módulos que lo necesiten
    const needsLazyLoading = componentName.startsWith('Lazy') || isModulePage(filePath);
    
    if (needsLazyLoading) {
      lazyComponents[componentName] = createLazyComponent(filePath);
    }
  });

  logger.info('NavigationContext', `✅ Created ${Object.keys(lazyComponents).length} lazy components`);
  
  return lazyComponents;
}

/**
 * Determina si un file path es una página de módulo que necesita lazy loading
 */
function isModulePage(filePath: string): boolean {
  return filePath.startsWith('modules/') && filePath.includes('Page');
}

/**
 * Obtiene un lazy component por route
 */
export function getLazyComponentByRoute(route: string): ComponentType<any> | null {
  const filePath = routeToFileMap[route as keyof typeof routeToFileMap];
  
  if (!filePath) {
    logger.warn('NavigationContext', `⚠️ No file mapping found for route: ${route}`);
    return null;
  }

  return createLazyComponent(filePath);
}

/**
 * Preload specific components
 */
export function preloadComponent(route: string): Promise<void> {
  const filePath = routeToFileMap[route as keyof typeof routeToFileMap];
  
  if (!filePath) {
    logger.warn('NavigationContext', `⚠️ Cannot preload - no file mapping for route: ${route}`);
    return Promise.resolve();
  }

  const importPath = `@/${filePath}`;
  
  return import(importPath)
    .then(() => {
      logger.info('NavigationContext', `✅ Preloaded: ${filePath}`);
    })
    .catch((_error) => {
      logger.error('NavigationContext', `❌ Failed to preload: ${filePath}`, error);
    });
}

/**
 * Preload critical routes (dashboard, sales, operations)
 */
export function preloadCriticalRoutes(): Promise<void[]> {
  const criticalRoutes = [
    '/admin/dashboard',
    '/admin/operations/sales',
    '/admin/operations'
  ];

  logger.info('NavigationContext', '🚀 Preloading critical routes...');
  
  return Promise.all(
    criticalRoutes.map(route => preloadComponent(route))
  );
}