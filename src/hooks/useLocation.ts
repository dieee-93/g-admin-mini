/**
 * USE LOCATION HOOK
 *
 * Wrapper hook for LocationContext
 * Provides easy access to location context
 *
 * @version 1.0.0
 */

import { useContext } from 'react';
import { LocationContext } from '@/contexts/LocationContext';

/**
 * Hook to use location context
 * Throws error if used outside LocationProvider
 */
export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }

  return context;
}
