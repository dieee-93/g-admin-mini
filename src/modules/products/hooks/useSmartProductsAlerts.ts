/**
 * USE SMART PRODUCTS ALERTS HOOK
 * ============================================================================
 * Intelligent alert generation for products management
 * Analyzes product configuration, pricing, availability and generates actionable alerts
 *
 * Integration:
 * - Uses unified alert system (@/shared/alerts)
 * - Integrates with Products store via ProductsAlertsAdapter
 * - EventBus integration for cross-module alerts
 *
 * @module hooks/useSmartProductsAlerts
 */

import { useCallback, useEffect, useRef, startTransition } from 'react';
import { useProducts } from '@/modules/products';
import { useAlertsActions } from '@/shared/alerts';
import { ProductsAlertsAdapter } from '@/modules/products/services/productsAlertsAdapter';
import { logger } from '@/lib/logging';

/**
 * Hook for generating and managing smart product alerts
 *
 * @returns Object with alert generation methods and state
 *
 * @example
 * ```typescript
 * const { generateAndUpdateAlerts } = useSmartProductsAlerts();
 *
 * useEffect(() => {
 *   generateAndUpdateAlerts();
 * }, [generateAndUpdateAlerts]);
 * ```
 */
export function useSmartProductsAlerts() {
  // 🛠️ PERFORMANCE: Use useAlertsActions to avoid re-renders when alerts change
  const actions = useAlertsActions();
  
  // Get products from TanStack Query
  const { data: products = [] } = useProducts();

  // Circuit breaker: Prevent excessive alert generation
  const lastGenerationRef = useRef<number>(0);
  const MIN_GENERATION_INTERVAL = 3000; // 3 seconds minimum between generations

  /**
   * Generate and update product alerts based on current configuration
   *
   * Features:
   * - Low margin detection
   * - Recipe unavailability detection
   * - Configuration validation
   * - Staff availability checks
   * - Booking capacity warnings
   */
  const generateAndUpdateAlerts = useCallback(async () => {
    try {
      logger.debug('Products', '[useSmartProductsAlerts] Generating smart alerts...', {
        timestamp: new Date().toISOString(),
        productCount: products.length
      });

      // 1. Clear previous products alerts to avoid duplicates
      await actions.clearAll({ context: 'products' });

      // 2. Generate alerts via ProductsAlertsAdapter
      const alerts = await ProductsAlertsAdapter.generateProductAlerts(products);

      // 3. Add alerts to unified system
      for (const alert of alerts) {
        await actions.create(alert);
      }

      logger.info('Products', `Generated ${alerts.length} smart product alerts`, {
        alertCount: alerts.length,
        severities: alerts.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (error) {
      logger.error('Products', 'Error generating smart product alerts:', error);
    }
  }, [products, actions]);

  // Auto-generate alerts when products change
  // Circuit Breaker: Rate limit to prevent infinite loops
  // ⚡ PERFORMANCE: Use startTransition to mark alert generation as non-urgent
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (products.length > 0 && timeSinceLastGeneration >= MIN_GENERATION_INTERVAL) {
      lastGenerationRef.current = now;
      
      // 🚀 PERFORMANCE FIX: Wrap in startTransition to prevent blocking UI
      // React 18 Concurrent Feature: Marks this update as non-urgent
      // UI renders immediately, alerts load in background
      startTransition(() => {
        generateAndUpdateAlerts();
      });

      logger.debug('Products', '[useSmartProductsAlerts] Alert generation allowed (non-blocking)', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        productsCount: products.length
      });
    } else if (products.length > 0) {
      logger.debug('Products', '[useSmartProductsAlerts] Alert generation throttled', {
        timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
        minInterval: `${MIN_GENERATION_INTERVAL}ms`,
        message: 'Preventing excessive re-renders'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return {
    generateAndUpdateAlerts
  };
}

/**
 * Export default for backward compatibility
 */
export default useSmartProductsAlerts;
