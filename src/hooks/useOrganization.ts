/**
 * USE ORGANIZATION HOOK
 *
 * Provides organization context from the selected location
 * Uses LocationContext to derive organization_id
 *
 * @version 1.0.0
 */

import { useLocation } from './useLocation';

interface Organization {
  id: string;
  name?: string;
}

interface UseOrganizationReturn {
  organization: Organization | null;
  isLoading: boolean;
}

/**
 * Hook to get the current organization
 * Derives organization_id from the selected location
 */
export function useOrganization(): UseOrganizationReturn {
  const { selectedLocation, isLoading } = useLocation();

  const organization: Organization | null = selectedLocation?.organization_id
    ? {
        id: selectedLocation.organization_id,
        name: selectedLocation.name // Using location name as fallback
      }
    : null;

  return {
    organization,
    isLoading
  };
}
