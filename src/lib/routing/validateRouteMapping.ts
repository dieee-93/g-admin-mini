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

  console.log('🔍 Validating Route Mappings...\n');

  // Check 1: All routes have corresponding components
  Object.entries(routeToFileMap).forEach(([route, filePath]) => {
    const componentName = routeToComponentMap[route as keyof typeof routeToComponentMap];
    
    if (!componentName) {
      errors.push(`Route "${route}" missing component mapping`);
    }
    
    if (!filePath) {
      errors.push(`Route "${route}" missing file path mapping`);
    }
    
    console.log(`✓ ${route} → ${componentName} (${filePath})`);
  });

  // Check 2: Domain extraction works correctly
  console.log('\n🏗️ Testing Domain Extraction...\n');
  
  const testRoutes = [
    '/admin/sales',
    '/admin/materials',
    '/admin/settings/integrations',
    '/app/portal'
  ];

  testRoutes.forEach(route => {
    const domain = getDomainFromRoute(route);
    console.log(`✓ ${route} → domain: ${domain || 'null'}`);
  });

  // Check 3: Lazy loading integration
  console.log('\n🚀 Testing Lazy Loading Integration...\n');
  
  const lazyRoutes = [
    '/admin/sales',
    '/admin/materials',
    '/admin/settings'
  ];

  lazyRoutes.forEach(route => {
    const requiresLazy = routeLazyBridge.requiresLazyLoading(route);
    const metadata = routeLazyBridge.getModuleMetadata(route);
    console.log(`✓ ${route} → lazy: ${requiresLazy}, size: ${metadata?.estimatedSize || 'unknown'}`);
  });

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Routes mapped: ${Object.keys(routeToFileMap).length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️ Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors found:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
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
  console.log('🔍 G-Admin Mini Route System Debug\n');
  
  console.log('📋 All Routes:');
  Object.entries(routeToFileMap).forEach(([route, filePath]) => {
    const componentName = getComponentFromRoute(route as any);
    const domain = getDomainFromRoute(route);
    const requiresLazy = routeLazyBridge.requiresLazyLoading(route);
    
    console.log(`  ${route}`);
    console.log(`    → Component: ${componentName}`);
    console.log(`    → File: ${filePath}`);
    console.log(`    → Domain: ${domain}`);
    console.log(`    → Lazy: ${requiresLazy}`);
    console.log('');
  });
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run validation on import
  // validateRouteMappings();
}