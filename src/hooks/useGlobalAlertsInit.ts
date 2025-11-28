/**
 * USE GLOBAL ALERTS INITIALIZATION HOOK
 * ============================================================================
 * Initializes all module-specific alert generators at the App level
 * to ensure alerts are available before navigating to modules.
 *
 * This prevents the issue where alerts only load after entering a module
 * because the alert generation hook is called inside a lazy-loaded component.
 *
 * @module hooks/useGlobalAlertsInit
 */

import { useEffect } from 'react';
import { useSmartInventoryAlerts } from './useSmartInventoryAlerts';
import { useSmartProductsAlerts } from './useSmartProductsAlerts';
import { logger } from '@/lib/logging';

/**
 * Hook to initialize all module alert systems at the App level
 *
 * ARCHITECTURE (LAZY LOADING + PERSISTENCE):
 *
 * ✅ Materials:
 *    - Has persisted data (Zustand localStorage)
 *    - Alerts generate on app start
 *    - Badge shows immediately
 *
 * ✅ Products:
 *    - NO carga datos al inicio (lazy loading)
 *    - Alerts generan SOLO al entrar al módulo por primera vez
 *    - Alertas PERSISTEN en AlertsProvider (localStorage)
 *    - Badge se actualiza después de primera visita
 *    - Badge PERSISTE al salir del módulo
 *
 * WHY NOT LOAD PRODUCTS AT START?
 * - Innecesario: El usuario puede nunca ir a Products
 * - Ineficiente: Afecta tiempo de carga inicial
 * - Anti-pattern: Va contra lazy loading de módulos
 *
 * PERSISTENCE STRATEGY:
 * - AlertsProvider persiste alertas en localStorage
 * - Una vez generadas, las alertas persisten entre navegaciones
 * - Los badges reflejan alertas persistidas
 * - Solo se regeneran cuando cambian los datos del módulo
 *
 * @example
 * ```typescript
 * // In App.tsx or PerformanceWrapper
 * function App() {
 *   useGlobalAlertsInit();
 *   return <Router>...</Router>;
 * }
 * ```
 */
export function useGlobalAlertsInit() {
  // ✅ Mount alert hooks (they stay active throughout app lifecycle)
  // Each hook has internal useEffect that reacts to data changes

  useSmartInventoryAlerts();
  // ✅ Materials: Generates alerts immediately (has persisted data)

  useSmartProductsAlerts();
  // ✅ Products: Waits for data to load (lazy)
  // - When user navigates to Products module → data loads → alerts generate
  // - Alerts persist in AlertsProvider → badge updates
  // - User navigates away → alerts REMAIN (persisted)

  // Log initialization (for debugging)
  useEffect(() => {
    logger.info('App', '🔔 Alert system initialized (lazy loading strategy)');
    logger.debug('App', 'Materials alerts: immediate | Products alerts: lazy (on module visit)');

    return () => {
      logger.debug('App', '🔕 Alert system hooks unmounting');
    };
  }, []);
}

/**
 * Export default for backward compatibility
 */
export default useGlobalAlertsInit;
