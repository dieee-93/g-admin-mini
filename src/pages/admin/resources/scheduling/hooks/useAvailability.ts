/**
 * Availability Hooks
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Custom hooks for availability configuration following project patterns (NO React Query)
 */

import { useState, useEffect, useCallback } from 'react';
import { availabilityApi } from '../services/availabilityApi';
import { notify } from '@/lib/notifications';
import type {
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRulesQuery,
  ProfessionalAvailability,
  ProfessionalAvailabilityInput,
  ProfessionalAvailabilityQuery,
  ProfessionalAvailabilityWithStaff,
  AvailabilityException,
  AvailabilityExceptionInput,
  AvailabilityExceptionsQuery,
  AvailabilityExceptionWithStaff,
  AvailabilityConfigSummary,
} from '@/types/appointment';

// ============================================================================
// Availability Rules Hooks
// ============================================================================

/**
 * Get availability rules with optional filters
 */
export function useAvailabilityRules(query?: AvailabilityRulesQuery) {
  const [data, setData] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize query to avoid infinite loop
  const queryString = JSON.stringify(query);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedQuery = queryString ? JSON.parse(queryString) : undefined;
      const result = await availabilityApi.getAvailabilityRules(parsedQuery);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get a single availability rule by ID
 */
export function useAvailabilityRule(id: string) {
  const [data, setData] = useState<AvailabilityRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityApi.getAvailabilityRule(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Create a new availability rule
 */
export function useCreateAvailabilityRule() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (input: AvailabilityRuleInput) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.createAvailabilityRule(input);
      notify.success({
        title: 'Availability rule created',
        description: 'The availability rule has been created successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to create availability rule',
        description: error.message || 'An error occurred while creating the availability rule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Update an existing availability rule
 */
export function useUpdateAvailabilityRule() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({ id, updates }: { id: string; updates: Partial<AvailabilityRuleInput> }) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.updateAvailabilityRule(id, updates);
      notify.success({
        title: 'Availability rule updated',
        description: 'The availability rule has been updated successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to update availability rule',
        description: error.message || 'An error occurred while updating the availability rule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Delete an availability rule
 */
export function useDeleteAvailabilityRule() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string) => {
    setIsPending(true);
    try {
      await availabilityApi.deleteAvailabilityRule(id);
      notify.success({
        title: 'Availability rule deleted',
        description: 'The availability rule has been deleted successfully.',
      });
    } catch (error: any) {
      notify.error({
        title: 'Failed to delete availability rule',
        description: error.message || 'An error occurred while deleting the availability rule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Bulk update availability rules
 */
export function useBulkUpdateAvailabilityRules() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (rules: Array<AvailabilityRuleInput & { id?: string }>) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.bulkUpdateAvailabilityRules(rules);
      notify.success({
        title: 'Business hours updated',
        description: 'All business hours have been updated successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to update business hours',
        description: error.message || 'An error occurred while updating business hours.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ============================================================================
// Professional Availability Hooks
// ============================================================================

/**
 * Get professional availability schedules with optional filters
 */
export function useProfessionalAvailability(query?: ProfessionalAvailabilityQuery) {
  const [data, setData] = useState<ProfessionalAvailabilityWithStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize query to avoid infinite loop
  const queryString = JSON.stringify(query);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedQuery = queryString ? JSON.parse(queryString) : undefined;
      const result = await availabilityApi.getProfessionalAvailability(parsedQuery);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get a single professional availability record by ID
 */
export function useProfessionalAvailabilityById(id: string) {
  const [data, setData] = useState<ProfessionalAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityApi.getProfessionalAvailabilityById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Create a new professional availability schedule
 */
export function useCreateProfessionalAvailability() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (input: ProfessionalAvailabilityInput) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.createProfessionalAvailability(input);
      notify.success({
        title: 'Professional schedule created',
        description: 'The professional schedule has been created successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to create schedule',
        description: error.message || 'An error occurred while creating the schedule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Update an existing professional availability schedule
 */
export function useUpdateProfessionalAvailability() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({ id, updates }: { id: string; updates: Partial<ProfessionalAvailabilityInput> }) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.updateProfessionalAvailability(id, updates);
      notify.success({
        title: 'Professional schedule updated',
        description: 'The professional schedule has been updated successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to update schedule',
        description: error.message || 'An error occurred while updating the schedule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Delete a professional availability schedule
 */
export function useDeleteProfessionalAvailability() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string) => {
    setIsPending(true);
    try {
      await availabilityApi.deleteProfessionalAvailability(id);
      notify.success({
        title: 'Professional schedule deleted',
        description: 'The professional schedule has been deleted successfully.',
      });
    } catch (error: any) {
      notify.error({
        title: 'Failed to delete schedule',
        description: error.message || 'An error occurred while deleting the schedule.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Bulk update professional availability for a specific staff member
 */
export function useBulkUpdateProfessionalAvailability() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({
    staff_id,
    schedules,
  }: {
    staff_id: string;
    schedules: Array<ProfessionalAvailabilityInput & { id?: string }>;
  }) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.bulkUpdateProfessionalAvailability(staff_id, schedules);
      notify.success({
        title: 'Professional schedule updated',
        description: 'All schedules have been updated successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to update schedules',
        description: error.message || 'An error occurred while updating schedules.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ============================================================================
// Availability Exceptions Hooks
// ============================================================================

/**
 * Get availability exceptions with optional filters
 */
export function useAvailabilityExceptions(query?: AvailabilityExceptionsQuery) {
  const [data, setData] = useState<AvailabilityExceptionWithStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityApi.getAvailabilityExceptions(query);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get a single availability exception by ID
 */
export function useAvailabilityException(id: string) {
  const [data, setData] = useState<AvailabilityException | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityApi.getAvailabilityException(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Create a new availability exception
 */
export function useCreateAvailabilityException() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (input: AvailabilityExceptionInput) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.createAvailabilityException(input);
      notify.success({
        title: 'Exception created',
        description: 'The availability exception has been created successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to create exception',
        description: error.message || 'An error occurred while creating the exception.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Update an existing availability exception
 */
export function useUpdateAvailabilityException() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({ id, updates }: { id: string; updates: Partial<AvailabilityExceptionInput> }) => {
    setIsPending(true);
    try {
      const result = await availabilityApi.updateAvailabilityException(id, updates);
      notify.success({
        title: 'Exception updated',
        description: 'The availability exception has been updated successfully.',
      });
      return result;
    } catch (error: any) {
      notify.error({
        title: 'Failed to update exception',
        description: error.message || 'An error occurred while updating the exception.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Delete an availability exception
 */
export function useDeleteAvailabilityException() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string) => {
    setIsPending(true);
    try {
      await availabilityApi.deleteAvailabilityException(id);
      notify.success({
        title: 'Exception deleted',
        description: 'The availability exception has been deleted successfully.',
      });
    } catch (error: any) {
      notify.error({
        title: 'Failed to delete exception',
        description: error.message || 'An error occurred while deleting the exception.',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ============================================================================
// Summary & Helper Hooks
// ============================================================================

/**
 * Get availability configuration summary
 */
export function useAvailabilityConfigSummary(location_id?: string) {
  const [data, setData] = useState<AvailabilityConfigSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityApi.getAvailabilityConfigSummary(location_id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [location_id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
