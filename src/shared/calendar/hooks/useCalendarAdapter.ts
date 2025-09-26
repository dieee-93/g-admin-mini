/**
 * CALENDAR ADAPTER HOOK - G-ADMIN MINI v3.0
 *
 * Hook for managing and selecting business-specific calendar adapters
 * Provides adapter registry and automatic selection based on business model
 *
 * @version 3.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BaseCalendarAdapter, AdapterConstructor, AdapterRegistry } from '../adapters/BaseCalendarAdapter';
import {
  CalendarConfig,
  ValidationResult,
  ConflictResult,
  BookingType
} from '../types/DateTimeTypes';

// ===============================
// ADAPTER REGISTRY IMPLEMENTATION
// ===============================

/**
 * Internal adapter registry implementation
 */
class CalendarAdapterRegistry implements AdapterRegistry {
  private adapters = new Map<string, AdapterConstructor>();

  register(businessModel: string, adapter: AdapterConstructor): void {
    this.adapters.set(businessModel, adapter);
  }

  get(businessModel: string): AdapterConstructor | undefined {
    return this.adapters.get(businessModel);
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }

  has(businessModel: string): boolean {
    return this.adapters.has(businessModel);
  }

  clear(): void {
    this.adapters.clear();
  }
}

// Global registry instance
const globalAdapterRegistry = new CalendarAdapterRegistry();

// ===============================
// HOOK INTERFACES
// ===============================

/**
 * Adapter state
 */
interface AdapterState {
  currentAdapter: BaseCalendarAdapter | null;
  availableAdapters: string[];
  currentBusinessModel: string | null;
  isInitialized: boolean;
  error: string | null;
  loading: boolean;
}

/**
 * Adapter actions
 */
interface AdapterActions {
  // Adapter management
  selectAdapter: (businessModel: string, config: CalendarConfig) => Promise<void>;
  registerAdapter: (businessModel: string, adapter: AdapterConstructor) => void;
  clearAdapter: () => void;

  // Adapter operations
  validateBookingRules: (bookingData: any) => Promise<ValidationResult>;
  checkBusinessConflicts: (timeSlot: any, resourceIds: string[]) => Promise<ConflictResult>;
  getSupportedBookingTypes: () => BookingType[];
  getSupportedFeatures: () => string[];
  supportsFeature: (feature: string) => boolean;

  // Registry operations
  getAvailableAdapters: () => string[];
  hasAdapter: (businessModel: string) => boolean;
}

// ===============================
// MAIN HOOK
// ===============================

/**
 * Hook for managing calendar adapters
 * Provides adapter selection and business model switching
 */
export function useCalendarAdapter(
  initialBusinessModel?: string,
  initialConfig?: CalendarConfig
): AdapterState & AdapterActions {
  const [state, setState] = useState<AdapterState>({
    currentAdapter: null,
    availableAdapters: [],
    currentBusinessModel: null,
    isInitialized: false,
    error: null,
    loading: false
  });

  // Initialize adapter on mount if config provided
  useEffect(() => {
    if (initialBusinessModel && initialConfig && !state.isInitialized) {
      selectAdapter(initialBusinessModel, initialConfig);
    }
  }, [initialBusinessModel, initialConfig]);

  // Update available adapters list
  const updateAvailableAdapters = useCallback(() => {
    setState(prev => ({
      ...prev,
      availableAdapters: globalAdapterRegistry.list()
    }));
  }, []);

  // Update available adapters when registry changes
  useEffect(() => {
    updateAvailableAdapters();
  }, [updateAvailableAdapters]);

  // Select adapter for business model
  const selectAdapter = useCallback(async (businessModel: string, config: CalendarConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const AdapterClass = globalAdapterRegistry.get(businessModel);
      if (!AdapterClass) {
        throw new Error(`No adapter registered for business model: ${businessModel}`);
      }

      const adapter = new AdapterClass(businessModel, config);

      setState(prev => ({
        ...prev,
        currentAdapter: adapter,
        currentBusinessModel: businessModel,
        isInitialized: true,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to select adapter'
      }));
    }
  }, []);

  // Register new adapter
  const registerAdapter = useCallback((businessModel: string, adapter: AdapterConstructor) => {
    try {
      globalAdapterRegistry.register(businessModel, adapter);
      updateAvailableAdapters();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to register adapter'
      }));
    }
  }, [updateAvailableAdapters]);

  // Clear current adapter
  const clearAdapter = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentAdapter: null,
      currentBusinessModel: null,
      isInitialized: false
    }));
  }, []);

  // Adapter operations
  const validateBookingRules = useCallback(async (bookingData: any): Promise<ValidationResult> => {
    if (!state.currentAdapter) {
      return {
        isValid: false,
        errors: ['No adapter selected'],
        warnings: []
      };
    }

    try {
      return await state.currentAdapter.validateBookingRules(bookingData);
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      };
    }
  }, [state.currentAdapter]);

  const checkBusinessConflicts = useCallback(async (timeSlot: any, resourceIds: string[]): Promise<ConflictResult> => {
    if (!state.currentAdapter) {
      return {
        hasConflicts: false,
        conflicts: []
      };
    }

    try {
      return await state.currentAdapter.checkBusinessConflicts(timeSlot, resourceIds);
    } catch (error) {
      return {
        hasConflicts: false,
        conflicts: []
      };
    }
  }, [state.currentAdapter]);

  const getSupportedBookingTypes = useCallback((): BookingType[] => {
    if (!state.currentAdapter) {
      return [];
    }
    return state.currentAdapter.getSupportedBookingTypes();
  }, [state.currentAdapter]);

  const getSupportedFeatures = useCallback((): string[] => {
    if (!state.currentAdapter) {
      return [];
    }
    return state.currentAdapter.getSupportedFeatures();
  }, [state.currentAdapter]);

  const supportsFeature = useCallback((feature: string): boolean => {
    if (!state.currentAdapter) {
      return false;
    }
    return state.currentAdapter.supportsFeature(feature);
  }, [state.currentAdapter]);

  // Registry operations
  const getAvailableAdapters = useCallback((): string[] => {
    return globalAdapterRegistry.list();
  }, []);

  const hasAdapter = useCallback((businessModel: string): boolean => {
    return globalAdapterRegistry.has(businessModel);
  }, []);

  // Memoized return object
  return useMemo(() => ({
    // State
    ...state,

    // Actions
    selectAdapter,
    registerAdapter,
    clearAdapter,
    validateBookingRules,
    checkBusinessConflicts,
    getSupportedBookingTypes,
    getSupportedFeatures,
    supportsFeature,
    getAvailableAdapters,
    hasAdapter
  }), [
    state,
    selectAdapter,
    registerAdapter,
    clearAdapter,
    validateBookingRules,
    checkBusinessConflicts,
    getSupportedBookingTypes,
    getSupportedFeatures,
    supportsFeature,
    getAvailableAdapters,
    hasAdapter
  ]);
}

// ===============================
// CONVENIENCE HOOKS
// ===============================

/**
 * Hook for checking adapter capabilities
 */
export function useAdapterCapabilities(adapter: BaseCalendarAdapter | null) {
  return useMemo(() => {
    if (!adapter) {
      return {
        hasBookingValidation: false,
        hasConflictDetection: false,
        hasResourceValidation: false,
        hasRecurringBookings: false,
        supportedBookingTypes: [] as BookingType[],
        supportedFeatures: [] as string[]
      };
    }

    return {
      hasBookingValidation: true,
      hasConflictDetection: true,
      hasResourceValidation: true,
      hasRecurringBookings: adapter.supportsFeature('recurring_bookings'),
      supportedBookingTypes: adapter.getSupportedBookingTypes(),
      supportedFeatures: adapter.getSupportedFeatures()
    };
  }, [adapter]);
}

/**
 * Hook for adapter validation
 */
export function useAdapterValidation(adapter: BaseCalendarAdapter | null) {
  const validateBooking = useCallback(async (bookingData: any) => {
    if (!adapter) {
      return {
        isValid: false,
        errors: ['No adapter available'],
        warnings: []
      };
    }

    return await adapter.validateBookingRules(bookingData);
  }, [adapter]);

  const validateUpdate = useCallback(async (existingBooking: any, updates: any) => {
    if (!adapter) {
      return {
        isValid: false,
        errors: ['No adapter available'],
        warnings: []
      };
    }

    return await adapter.validateBookingUpdate(existingBooking, updates);
  }, [adapter]);

  const validateCancellation = useCallback(async (booking: any) => {
    if (!adapter) {
      return {
        isValid: false,
        errors: ['No adapter available'],
        warnings: []
      };
    }

    return await adapter.validateCancellation(booking);
  }, [adapter]);

  return {
    validateBooking,
    validateUpdate,
    validateCancellation
  };
}

// ===============================
// REGISTRY UTILITIES
// ===============================

/**
 * Register adapter globally
 */
export function registerGlobalAdapter(businessModel: string, adapter: AdapterConstructor): void {
  globalAdapterRegistry.register(businessModel, adapter);
}

/**
 * Get global adapter registry
 */
export function getGlobalAdapterRegistry(): AdapterRegistry {
  return globalAdapterRegistry;
}

/**
 * Clear all registered adapters (useful for testing)
 */
export function clearGlobalAdapterRegistry(): void {
  globalAdapterRegistry.clear();
}