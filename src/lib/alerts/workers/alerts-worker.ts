/**
 * ALERTS CALCULATION WORKER
 * ============================================================================
 * Handles CPU-intensive alert calculations in a separate thread.
 * 
 * Performance critical:
 * - No DOM access
 * - Pure calculations
 * - Minimal imports
 */

import MaterialsAlertsAdapter from '@/modules/materials/alerts/adapter';

// ============================================================================
// TYPES
// ============================================================================

interface WorkerRequest {
  type: 'CALCULATE_INVENTORY_ALERTS' | 'CALCULATE_PRODUCT_ALERTS';
  data: {
    materials?: any[];
    products?: any[];
  };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, data } = event.data;
  const startTime = performance.now();

  try {
    let alerts: any[] = [];

    switch (type) {
      case 'CALCULATE_INVENTORY_ALERTS':
        if (data.materials && Array.isArray(data.materials)) {
          // Use MaterialsAlertsAdapter to generate alerts
          alerts = await MaterialsAlertsAdapter.generateAlerts(data.materials);
        }
        break;

      case 'CALCULATE_PRODUCT_ALERTS':
        // Placeholder for product alerts
        alerts = []; 
        break;
    }

    const endTime = performance.now();

    self.postMessage({
      type: 'ALERTS_CALCULATED',
      data: {
        alerts,
        calculationTime: endTime - startTime
      }
    });

  } catch (error) {
    self.postMessage({
      type: 'ALERTS_CALCULATED',
      data: {
        alerts: [],
        calculationTime: 0,
        error: error instanceof Error ? error.message : 'Unknown worker error'
      }
    });
  }
};

export {}; // Module format
