/**
 * ALERTS WEB WORKER
 * ============================================================================
 * Calculates inventory and product alerts in a separate thread to avoid
 * blocking the main UI thread during initialization.
 *
 * Benefits:
 * - Non-blocking: UI remains responsive
 * - Parallel processing: Calculations run in background
 * - Better UX: ~500ms saved from initial load blocking
 *
 * @module workers/alerts-worker
 */

// ============================================
// TYPE DEFINITIONS (duplicated for worker isolation)
// ============================================

interface Material {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  unit_cost: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  stock?: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  severity: 'low' | 'medium' | 'high';
  category: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
  source: string;
}

interface WorkerRequest {
  type: 'CALCULATE_INVENTORY_ALERTS' | 'CALCULATE_PRODUCT_ALERTS';
  data: {
    materials?: Material[];
    products?: Product[];
  };
}

interface WorkerResponse {
  type: 'ALERTS_CALCULATED';
  data: {
    alerts: Alert[];
    calculationTime: number;
  };
}

// ============================================
// ALERT CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate inventory (materials) alerts
 */
function calculateInventoryAlerts(materials: Material[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  materials.forEach(material => {
    // Low stock alert
    if (material.stock <= material.min_stock * 0.5) {
      alerts.push({
        id: `material-critical-${material.id}`,
        type: 'error',
        severity: 'high',
        category: 'inventory',
        title: 'Stock crítico',
        message: `${material.name}: Stock muy bajo (${material.stock} unidades)`,
        metadata: {
          materialId: material.id,
          materialName: material.name,
          currentStock: material.stock,
          minStock: material.min_stock,
        },
        timestamp: now,
        source: 'materials',
      });
    } else if (material.stock <= material.min_stock) {
      alerts.push({
        id: `material-low-${material.id}`,
        type: 'warning',
        severity: 'medium',
        category: 'inventory',
        title: 'Stock bajo',
        message: `${material.name}: Considere realizar pedido (${material.stock} unidades)`,
        metadata: {
          materialId: material.id,
          materialName: material.name,
          currentStock: material.stock,
          minStock: material.min_stock,
        },
        timestamp: now,
        source: 'materials',
      });
    }
  });

  return alerts;
}

/**
 * Calculate product alerts
 */
function calculateProductAlerts(products: Product[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  products.forEach(product => {
    // Low margin alert
    if (product.cost && product.price) {
      const margin = ((product.price - product.cost) / product.price) * 100;
      
      if (margin < 10) {
        alerts.push({
          id: `product-margin-${product.id}`,
          type: 'warning',
          severity: 'medium',
          category: 'products',
          title: 'Margen bajo',
          message: `${product.name}: Margen de ganancia bajo (${margin.toFixed(1)}%)`,
          metadata: {
            productId: product.id,
            productName: product.name,
            margin: margin,
            price: product.price,
            cost: product.cost,
          },
          timestamp: now,
          source: 'products',
        });
      }
    }

    // Low stock alert for products
    if (product.stock !== undefined && product.stock < 5) {
      alerts.push({
        id: `product-stock-${product.id}`,
        type: 'warning',
        severity: 'medium',
        category: 'products',
        title: 'Stock de producto bajo',
        message: `${product.name}: Stock bajo (${product.stock} unidades)`,
        metadata: {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
        },
        timestamp: now,
        source: 'products',
      });
    }
  });

  return alerts;
}

// ============================================
// WORKER MESSAGE HANDLER
// ============================================

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const startTime = performance.now();
  
  try {
    const { type, data } = event.data;
    let alerts: Alert[] = [];

    switch (type) {
      case 'CALCULATE_INVENTORY_ALERTS':
        if (data.materials) {
          alerts = calculateInventoryAlerts(data.materials);
        }
        break;

      case 'CALCULATE_PRODUCT_ALERTS':
        if (data.products) {
          alerts = calculateProductAlerts(data.products);
        }
        break;

      default:
        console.warn('[AlertsWorker] Unknown message type:', type);
        return;
    }

    const calculationTime = performance.now() - startTime;

    const response: WorkerResponse = {
      type: 'ALERTS_CALCULATED',
      data: {
        alerts,
        calculationTime,
      },
    };

    self.postMessage(response);
  } catch (error) {
    console.error('[AlertsWorker] Error calculating alerts:', error);
    
    // Send error response
    self.postMessage({
      type: 'ALERTS_CALCULATED',
      data: {
        alerts: [],
        calculationTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
};

// Log worker initialization
console.log('[AlertsWorker] ✅ Initialized and ready');
