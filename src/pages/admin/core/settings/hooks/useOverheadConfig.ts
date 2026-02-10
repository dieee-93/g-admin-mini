/**
 * useOverheadConfig - Hook to fetch and manage overhead configuration
 *
 * Returns overhead rate and configuration from Settings
 * Used by OverheadSection in material form to get system overhead rate
 *
 * Industry Standard:
 * - Overhead Rate = Total Monthly Overhead / Total Labor Hours
 * - Applied consistently across all products (GAAP compliant)
 * - NO manual override per product
 */

import { useMemo } from 'react';

export interface OverheadConfig {
  // Total monthly overhead
  totalOverhead: number;

  // Allocation method
  allocationBase: 'per_labor_hour' | 'per_machine_hour' | 'per_direct_cost';

  // Calculated rate
  overheadRate: number; // $/hour or %

  // Base data (for calculation)
  totalLaborHours?: number;
  totalMachineHours?: number;
  totalDirectCost?: number;

  // Last updated
  lastUpdated?: string;
}

/**
 * Hook to get overhead configuration from Settings
 *
 * TODO Phase 2:
 * - Fetch from Settings store/database
 * - Real-time updates when Settings change
 * - Integration with other modules (Cash, Staff, Suppliers)
 * - Auto-calculation of total labor hours from production records
 */
export function useOverheadConfig(): {
  config: OverheadConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  // TODO Phase 2: Implement real fetching logic
  // const { data, isLoading, error, refetch } = useQuery({
  //   queryKey: ['settings', 'overhead'],
  //   queryFn: () => fetchOverheadConfig()
  // });

  // TEMPORARY: Hardcoded default config
  const config: OverheadConfig = useMemo(() => ({
    totalOverhead: 14250, // Example: $14,250/month
    allocationBase: 'per_labor_hour',
    overheadRate: 15.0, // $15/labor hour
    totalLaborHours: 950, // Example: 950 hours/month
    lastUpdated: new Date().toISOString()
  }), []);

  return {
    config,
    isLoading: false, // TODO: Real loading state
    error: null, // TODO: Real error handling
    refetch: () => {
      // TODO: Implement refetch logic
      console.log('Refetching overhead config...');
    }
  };
}

/**
 * Helper to get just the overhead rate
 * Most common use case for material forms
 */
export function useOverheadRate(): number {
  const { config } = useOverheadConfig();
  return config?.overheadRate || 15.0; // Fallback to $15/hour
}
