/**
 * USE SMART INVENTORY ALERTS HOOK
 * ============================================================================
 * Intelligent alert generation for inventory/materials management
 * Analyzes stock levels, demand patterns, and generates actionable alerts
 *
 * Integration:
 * - Uses unified alert system (@/shared/alerts)
 * - Integrates with Materials store via SmartAlertsAdapter
 * - EventBus integration for cross-module alerts
 *
 * @module hooks/useSmartInventoryAlerts
 */

import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAlerts } from '@/shared/alerts';
import { useMaterialsStore } from '@/store/materialsStore';
import { SmartAlertsAdapter } from '@/pages/admin/supply-chain/materials/services/smartAlertsAdapter';
import { logger } from '@/lib/logging';

/**
 * Hook for generating and managing smart inventory alerts
 *
 * @returns Object with alert generation methods and state
 *
 * @example
 * ```typescript
 * const { generateAndUpdateAlerts, isGenerating } = useSmartInventoryAlerts();
 *
 * useEffect(() => {
 *   generateAndUpdateAlerts();
 * }, [generateAndUpdateAlerts]);
 * ```
 */
export function useSmartInventoryAlerts() {
  const { actions } = useAlerts();
  // 🔧 FIX: Usar useShallow para prevenir re-renders por cambio de referencia del array
  const materials = useMaterialsStore(
    useShallow(state => state.items)
  );

  // ✅ Circuit breaker: Prevent excessive alert generation
  const lastGenerationRef = useRef<number>(0);
  const MIN_GENERATION_INTERVAL = 3000; // 3 seconds minimum between generations

  /**
   * Generate and update inventory alerts based on current stock levels
   *
   * Features:
   * - Low stock detection (below min_stock threshold)
   * - Out of stock alerts (critical)
   * - Overstock warnings
   * - Slow-moving inventory detection
   * - ABC analysis-based prioritization
   */
  const generateAndUpdateAlerts = useCallback(async () => {
    try {
      logger.debug('Materials', '[useSmartInventoryAlerts] Generating smart alerts...', {
        timestamp: new Date().toISOString(),
        materialCount: materials.length
      });

      // 1. Clear previous materials alerts to avoid duplicates
      // ✅ FIX: Usar clearAll con filtro de context (API correcta)
      await actions.clearAll({ context: 'materials' });

      // 2. Generate alerts via SmartAlertsAdapter
      // The adapter converts SmartAlert[] → CreateAlertInput[] (unified format)
      const alerts = await SmartAlertsAdapter.generateMaterialsAlerts(materials);

      // 3. Add alerts to unified system
      // ✅ FIX: Usar actions.create en lugar de addAlert
      for (const alert of alerts) {
        await actions.create(alert);
      }

      logger.info('Materials', `Generated ${alerts.length} smart inventory alerts`, {
        alertCount: alerts.length,
        severities: alerts.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (error) {
      logger.error('Materials', 'Error generating smart inventory alerts:', error);
    }
  }, [materials, actions]);

  // Auto-generate alerts when materials change
  // ✅ FIX: Remove generateAndUpdateAlerts from deps to prevent circular dependency
  // The function is stable because it's wrapped in useCallback with [materials, actions]
  // ✅ Circuit Breaker: Rate limit to prevent infinite loops
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (materials.length > 0 && timeSinceLastGeneration >= MIN_GENERATION_INTERVAL) {
      lastGenerationRef.current = now;
      generateAndUpdateAlerts();

      logger.debug('Materials', '[useSmartInventoryAlerts] Alert generation allowed', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        materialsCount: materials.length
      });
    } else if (materials.length > 0) {
      logger.warn('Materials', '[useSmartInventoryAlerts] Alert generation throttled', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        minInterval: `${MIN_GENERATION_INTERVAL}ms`,
        message: 'Preventing excessive re-renders'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials]);

  return {
    generateAndUpdateAlerts
  };
}

/**
 * Export default for backward compatibility
 */
export default useSmartInventoryAlerts;
