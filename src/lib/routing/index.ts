/**
 * ROUTING LIBRARY - G-Admin Mini
 * Automated route mapping and lazy loading system
 */

export * from './createLazyComponents';
export * from './routeLazyBridge';
export * from './validateRouteMapping';
export * from '@/config/routeMap';

// Re-export for convenience
export { getAllRoutes, getNavRoutes, getDefaultRoute } from '@/config/routes';