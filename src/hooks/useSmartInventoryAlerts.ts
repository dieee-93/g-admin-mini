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
import { useAlertsActions } from '@/shared/alerts';
import { useMaterialsStore } from '@/store/materialsStore';
import { useAlertsWorker } from './useAlertsWorker';
import { logger } from '@/lib/logging';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';

/**
 * Converts MaterialItem[] to MaterialABC[] with default ABC classification
 * Materials without ABC analysis get assigned default class 'C' with basic metrics
 */
function convertToMaterialABC(materials: MaterialItem[]): MaterialABC[] {
  return materials.map(material => {
    // If material already has ABC classification, return as-is
    if ('abcClass' in material && material.abcClass) {
      return material as MaterialABC;
    }

    // Otherwise, create MaterialABC with default values
    const materialABC: MaterialABC = {
      ...material,
      // Default to class 'C' (lowest priority) for materials without classification
      abcClass: 'C',

      // Analysis metrics (defaults)
      annualConsumption: 0,
      annualValue: 0,
      revenuePercentage: 0,
      cumulativeRevenue: 0,

      // Current stock
      currentStock: material.stock || 0,

      // Optional fields with safe defaults
      consumptionFrequency: 0,
      monthlyConsumption: 0,
      totalStockValue: (material.stock || 0) * (material.unit_cost || 0)
    };

    return materialABC;
  });
}

/**
 * Hook for generating and managing smart inventory alerts
 * Now uses Web Worker for non-blocking calculation
 *
 * @returns Object with alert generation methods and state
 */
export function useSmartInventoryAlerts() {
  // 🛠️ PERFORMANCE: Use useAlertsActions to avoid re-renders when alerts change
  const actions = useAlertsActions();
  // 🔧 FIX: Usar useShallow para prevenir re-renders por cambio de referencia del array
  const materials = useMaterialsStore(
    useShallow(state => state.items)
  );

  // ✅ Circuit breaker: Prevent excessive alert generation
  const lastGenerationRef = useRef<number>(0);
  const MIN_GENERATION_INTERVAL = 3000; // 3 seconds minimum between generations

  // 🚀 PERFORMANCE: Web Worker for non-blocking alert calculation
  const { calculateInventoryAlerts } = useAlertsWorker({
    onAlertsCalculated: async (alerts) => {
      try {
        // Clear previous materials alerts
        await actions.clearAll({ context: 'materials' });

        // Add new alerts via bulk create
        if (alerts.length > 0) {
          await actions.bulkCreate(alerts);
          
          logger.info('Materials', `✅ [Web Worker] Bulk created ${alerts.length} alerts`, {
            alertCount: alerts.length,
            severities: alerts.reduce((acc, alert) => {
              acc[alert.severity] = (acc[alert.severity] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          });
        }
      } catch (error) {
        logger.error('Materials', '❌ Error processing worker alerts:', error);
      }
    },
    onError: (error) => {
      logger.error('Materials', '❌ Web Worker error:', error);
    }
  });

  // Auto-generate alerts when materials change
  // ✅ Circuit Breaker: Rate limit to prevent infinite loops
  // ⚡ PERFORMANCE: Web Worker runs in separate thread (non-blocking)
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (materials.length > 0 && timeSinceLastGeneration >= MIN_GENERATION_INTERVAL) {
      lastGenerationRef.current = now;
      
      // 🚀 PERFORMANCE FIX: Calculate in Web Worker (separate thread)
      // No need for startTransition - already non-blocking
      calculateInventoryAlerts(materials);

      logger.debug('Materials', '🔧 [Web Worker] Alert calculation dispatched', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        materialsCount: materials.length
      });
    } else if (materials.length > 0) {
      logger.debug('Materials', '[useSmartInventoryAlerts] Alert generation throttled', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        minInterval: `${MIN_GENERATION_INTERVAL}ms`,
        message: 'Preventing excessive re-renders'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, calculateInventoryAlerts]);

  return {
    // Expose for manual triggering if needed
    triggerAlertCalculation: () => calculateInventoryAlerts(materials)
  };
}

/**
 * Export default for backward compatibility
 */
export default useSmartInventoryAlerts;
