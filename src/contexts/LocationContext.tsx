// ================================================================
// LOCATION CONTEXT
// ================================================================
// Purpose: Global location selection context for multi-location support
// Pattern: React Context + localStorage persistence
// ================================================================

import { createContext, useContext, useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { locationsApi } from '@/services/locationsApi';
import EventBus from '@/lib/events';
import type { Location } from '@/types/location';
import { logger } from '@/lib/logging';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useShallow } from 'zustand/react/shallow';

interface LocationContextValue {
  locations: Location[];
  selectedLocation: Location | null;
  selectLocation: (locationId: string | null) => void;
  selectAllLocations: () => void;
  isMultiLocationMode: boolean;
  isLoading: boolean;
  error: Error | null;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);
LocationContext.displayName = 'LocationContext';

const STORAGE_KEY = 'selected_location_id';

// 🔧 FIX: Stable empty array to prevent infinite loop in Zustand selector
// NEVER use || [] in selectors - creates new array reference every render
const EMPTY_ARRAY: string[] = [];

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  // 🐛 DEBUG: Track render count
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  logger.debug('LocationContext', `🔵 RENDER #${renderCountRef.current}`);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(() => {
    // Try to restore from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      logger.debug('LocationContext', '📦 Initial selectedLocationId from localStorage:', stored);
      return stored;
    } catch (error) {
      logger.error('LocationContext', 'Error reading from localStorage:', error);
      return null;
    }
  });

  // Fetch locations using useState + useEffect pattern (project convention)
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get selected infrastructure from CapabilityStore
  // 🔧 FIX: Use useShallow to prevent re-renders from array reference changes
  const selectedInfrastructure = useCapabilityStore(
    useShallow(state => state.profile?.selectedInfrastructure || EMPTY_ARRAY)
  );

  // 🐛 DEBUG: Track if the array reference changes on each render
  const prevInfrastructureRef = useRef(selectedInfrastructure);
  const infrastructureChangedRef = useRef(false);

  if (prevInfrastructureRef.current !== selectedInfrastructure) {
    infrastructureChangedRef.current = true;
    logger.warn('LocationContext', '⚠️ selectedInfrastructure CHANGED!', {
      renderCount: renderCountRef.current,
      prevLength: prevInfrastructureRef.current?.length,
      newLength: selectedInfrastructure?.length,
      prevReference: prevInfrastructureRef.current,
      newReference: selectedInfrastructure,
      areSameReference: prevInfrastructureRef.current === selectedInfrastructure
    });
    prevInfrastructureRef.current = selectedInfrastructure;
  } else {
    logger.debug('LocationContext', '✅ selectedInfrastructure unchanged', {
      renderCount: renderCountRef.current,
      length: selectedInfrastructure?.length
    });
  }

  useEffect(() => {
    logger.debug('LocationContext', '🚀 useEffect[fetchLocations] TRIGGERED');
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await locationsApi.getAll();
        logger.debug('LocationContext', '✅ Fetched locations:', data.length);
        setLocations(data);
      } catch (err) {
        logger.error('LocationContext', 'Failed to fetch locations:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Determine if multi-location mode is active
  // Requires BOTH:
  // 1. User has 'multi_location' infrastructure capability active
  // 2. There are actually multiple locations in the database
  const hasMultiLocationCapability = selectedInfrastructure.includes('multi_location');
  const hasMultipleLocations = locations.length > 1;
  const isMultiLocationMode = hasMultiLocationCapability && hasMultipleLocations;

  // Find selected location object
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return locations.find(l => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  // Select a specific location
  const selectLocation = (locationId: string | null) => {
    logger.warn('LocationContext', '🔄 selectLocation CALLED', {
      locationId,
      currentSelectedLocationId: selectedLocationId,
      stackTrace: new Error().stack?.split('\n').slice(2, 5).join('\n')
    });

    setSelectedLocationId(locationId);

    try {
      if (locationId) {
        localStorage.setItem(STORAGE_KEY, locationId);
        const location = locations.find(l => l.id === locationId);

        // Emit event for other components to react
        EventBus.emit('location.changed', {
          locationId,
          location: location || null
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        EventBus.emit('location.changed', {
          locationId: null,
          location: null
        });
      }
    } catch (error) {
      logger.error('LocationContext', 'Error saving to localStorage:', error);
    }
  };

  // Select "All Locations" mode
  const selectAllLocations = () => {
    selectLocation(null);
  };

  // Auto-select on first load
  // 🔧 FIX: Use ref to track if auto-select already ran to prevent infinite loop
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    logger.debug('LocationContext', '🟢 useEffect[autoSelect] TRIGGERED', {
      locationsLength: locations.length,
      isLoading,
      selectedLocationId,
      hasAutoSelected: hasAutoSelectedRef.current
    });

    // Only run once when locations are loaded
    if (locations.length === 0 || isLoading) {
      logger.debug('LocationContext', '⏭️ Skipping: no locations or still loading');
      return;
    }

    if (hasAutoSelectedRef.current) {
      logger.debug('LocationContext', '⏭️ Skipping: already auto-selected');
      return;
    }

    // If already selected and valid, mark as done and keep it
    if (selectedLocationId && locations.some(l => l.id === selectedLocationId)) {
      logger.debug('LocationContext', '✅ Already selected and valid, keeping it');
      hasAutoSelectedRef.current = true;
      return;
    }

    // Auto-select logic:
    // 1. Try main location
    const mainLocation = locations.find(l => l.is_main);
    if (mainLocation) {
      logger.debug('LocationContext', '🎯 Auto-selecting main location:', mainLocation.id);
      selectLocation(mainLocation.id);
      hasAutoSelectedRef.current = true;
      return;
    }

    // 2. If only one location, select it
    if (locations.length === 1) {
      logger.debug('LocationContext', '🎯 Auto-selecting single location:', locations[0].id);
      selectLocation(locations[0].id);
      hasAutoSelectedRef.current = true;
      return;
    }

    // 3. Multi-location mode: default to "All Locations" (null)
    logger.debug('LocationContext', '🎯 Auto-selecting "All Locations" (null)');
    selectLocation(null);
    hasAutoSelectedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, isLoading]); // ✅ FIX: Remove selectedLocationId to prevent loop

  const value: LocationContextValue = {
    locations,
    selectedLocation,
    selectLocation,
    selectAllLocations,
    isMultiLocationMode,
    isLoading,
    error,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access location context
 * @throws Error if used outside LocationProvider
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}

/**
 * Hook to check if multi-location mode is active
 * Convenience hook for quick checks
 */
export function useIsMultiLocation(): boolean {
  const { isMultiLocationMode } = useLocation();
  return isMultiLocationMode;
}

/**
 * Hook to get selected location ID (or null for "All Locations")
 * Convenience hook for API calls
 */
export function useSelectedLocationId(): string | null {
  const { selectedLocation } = useLocation();
  return selectedLocation?.id || null;
}
