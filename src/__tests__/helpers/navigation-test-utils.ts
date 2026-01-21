import type { BusinessCapabilityId } from '@/config/types/atomic-capabilities';
import type { FeatureId } from '@/config/FeatureRegistry';
import type { NavigationModule } from '@/contexts/NavigationContext';
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import { domainRouteMap } from '@/config/routeMap';
import { vi } from 'vitest';

/**
 * Test utility functions for navigation integration tests
 */

// Mock business profile with specific capabilities
export function createMockBusinessProfile(
  capabilities: BusinessCapabilityId[],
  infrastructure: string[] = ['single_location']
) {
  return {
    id: 'test-profile-id',
    organization_id: 'test-org-id',
    business_name: 'Test Business',
    business_type: null,
    email: 'test@example.com',
    phone: null,
    country: 'AR',
    currency: 'ARS',
    selected_activities: capabilities,
    selected_infrastructure: infrastructure,
    completed_milestones: [],
    is_first_time_dashboard: false,
    setup_completed: true,
    onboarding_step: 5,
    setup_completed_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Legacy fields
    active_capabilities: [],
    business_structure: 'single_location',
    computed_configuration: null,
    auto_resolved_capabilities: [],
  };
}

// Get expected active modules for given capabilities
export function getExpectedModulesForCapabilities(
  capabilities: BusinessCapabilityId[],
  infrastructure: string[] = ['single_location']
): string[] {
  // Use real activation engine for accurate expectations
  const { activeFeatures } = FeatureActivationEngine.activateFeatures(
    capabilities,
    infrastructure
  );

  const modules = getModulesForActiveFeatures(activeFeatures);
  return Array.from(new Set(modules)).sort();
}

// Get expected navigation items for active modules
export function getExpectedNavigationItems(
  activeModules: string[]
): NavigationModule[] {
  // TODO: Implement based on module registry
  return [];
}

// Mock React Router navigation
export function createMockNavigate() {
  return vi.fn();
}

// Mock location object for route tests
export function createMockLocation(pathname: string) {
  return {
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };
}

// Map route paths to required module IDs
const ROUTE_MODULE_MAP: Record<string, string> = {
  '/admin/operations/sales': 'sales',
  '/admin/supply-chain/materials': 'materials',
  '/admin/supply-chain/products': 'products',
  '/admin/supply-chain/suppliers': 'suppliers',
  '/admin/resources/team': 'staff',
  '/admin/resources/scheduling': 'scheduling',
  '/admin/finance/cash': 'cash',
  '/admin/operations/fulfillment/onsite': 'onsite',
  '/admin/operations/fulfillment/delivery': 'delivery',
  '/admin/operations/fulfillment/pickup': 'pickup',
  '/admin/operations/memberships/*': 'memberships',
  '/admin/operations/rentals/*': 'rentals',
  '/admin/supply-chain/assets': 'assets',
  // Core modules always active
  '/admin/dashboard': 'dashboard',
  '/admin/settings': 'settings',
};

export function getRequiredModuleForRoute(route: string): string | null {
  return ROUTE_MODULE_MAP[route] || null;
}

// Verify route is protected by module activation
export function expectRouteProtected(
  route: string,
  requiredModule: string
): boolean {
  const actualModule = getRequiredModuleForRoute(route);
  return actualModule === requiredModule;
}
