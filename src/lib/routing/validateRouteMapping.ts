/**
 * ROUTE MAPPING VALIDATION
 * Script para validar que el nuevo sistema de route mapping funcione correctamente
 */

import { 
  routeToFileMap,
  routeToComponentMap,
  getDomainFromRoute,
  getFilePathFromRoute,
  getComponentFromRoute
} from '@/config/routeMap';

import { routeLazyBridge } from './routeLazyBridge';

import { logger } from '@/lib/logging';
/**
 * Valida que todos los mappings estén correctamente configurados
 */
export function validateRouteMappings(): {
  success: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  logger.debug('NavigationContext', '🔍 Validating Route Mappings...\n');

  // Check 1: All routes have corresponding components
  Object.entries(routeToFileMap).forEach(([route, filePath]) => {
    const componentName = routeToComponentMap[route as keyof typeof routeToComponentMap];
    
    if (!componentName) {
      errors.push(`Route "${route}" missing component mapping`);
    }
    
    if (!filePath) {
      errors.push(`Route "${route}" missing file path mapping`);
    }
    
    logger.info('NavigationContext', `✓ ${route} → ${componentName} (${filePath})`);
  });

  // Check 2: Domain extraction works correctly
  logger.info('NavigationContext', '\n🏗️ Testing Domain Extraction...\n');

  const testRoutes = [
    '/admin/operations/sales',
    '/admin/materials',
    '/admin/settings/integrations',
    '/app/portal'
  ];

  testRoutes.forEach(route => {
    const domain = getDomainFromRoute(route);
    logger.info('NavigationContext', `✓ ${route} → domain: ${domain || 'null'}`);
  });

  // Check 3: Lazy loading integration
  logger.info('NavigationContext', '\n🚀 Testing Lazy Loading Integration...\n');

  const lazyRoutes = [
    '/admin/operations/sales',
    '/admin/materials',
    '/admin/settings'
  ];

  lazyRoutes.forEach(route => {
    const requiresLazy = routeLazyBridge.requiresLazyLoading(route);
    const metadata = routeLazyBridge.getModuleMetadata(route);
    logger.info('NavigationContext', `✓ ${route} → lazy: ${requiresLazy}, size: ${metadata?.estimatedSize || 'unknown'}`);
  });

  // Summary
  logger.info('NavigationContext', '\n📊 Validation Summary:');
  logger.info('NavigationContext', `✅ Routes mapped: ${Object.keys(routeToFileMap).length}`);
  logger.error('NavigationContext', `❌ Errors: ${errors.length}`);
  logger.warn('NavigationContext', `⚠️ Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    logger.error('NavigationContext', '\n❌ Errors found:');
    errors.forEach(error => logger.error('NavigationContext', `  - ${error}`));
  }

  if (warnings.length > 0) {
    logger.warn('NavigationContext', '\n⚠️ Warnings:');
    warnings.forEach(warning => logger.warn('NavigationContext', `  - ${warning}`));
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Debug helper - show complete route information
 */
export function debugRouteSystem() {
  logger.debug('NavigationContext', '🔍 G-Admin Mini Route System Debug\n');
  
  logger.info('NavigationContext', '📋 All Routes:');
  Object.entries(routeToFileMap).forEach(([route, filePath]) => {
    const componentName = getComponentFromRoute(route as any);
    const domain = getDomainFromRoute(route);
    const requiresLazy = routeLazyBridge.requiresLazyLoading(route);
    
    logger.info('NavigationContext', `  ${route}`);
    logger.info('NavigationContext', `    → Component: ${componentName}`);
    logger.info('NavigationContext', `    → File: ${filePath}`);
    logger.info('NavigationContext', `    → Domain: ${domain}`);
    logger.info('NavigationContext', `    → Lazy: ${requiresLazy}`);
    logger.info('NavigationContext', '');
  });
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run validation on import
  // validateRouteMappings();
}