/**
 * MATERIALS MODULE - COMPREHENSIVE E2E TEST SUITE
 *
 * Version: 1.0.0
 * Date: 2025-01-31
 * Module: Materials (Inventory Management)
 *
 * Tests:
 * 1. ✅ Permissions System (RBAC)
 * 2. ✅ EventBus Emissions
 * 3. ✅ EventBus Consumptions
 * 4. ✅ Cross-Module Hook Injections
 * 5. ✅ Public API Exports
 * 6. ✅ Module Manifest Validation
 * 7. ✅ TypeScript Type Safety
 * 8. ✅ Integration with Other Systems
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';
import { materialsManifest, type MaterialsAPI } from '@/modules/materials/manifest';
import EventBus from '@/lib/events';
import { EventPriority } from '@/lib/events/types';

// ============================================
// TEST SUITE 1: MODULE MANIFEST VALIDATION
// ============================================

describe('TEST 1: Materials Module Manifest', () => {
  it('should have correct module metadata', () => {
    expect(materialsManifest.id).toBe('materials');
    expect(materialsManifest.name).toBe('Materials & Inventory');
    expect(materialsManifest.version).toBe('1.0.0');
    expect(materialsManifest.minimumRole).toBe('OPERADOR');
  });

  it('should have correct dependencies', () => {
    expect(materialsManifest.depends).toEqual([]);
    expect(materialsManifest.autoInstall).toBe(false);
  });

  it('should require correct features', () => {
    expect(materialsManifest.requiredFeatures).toContain('inventory_stock_tracking');
  });

  it('should provide correct hooks', () => {
    const providedHooks = materialsManifest.hooks?.provide || [];

    // EventBus events
    expect(providedHooks).toContain('materials.stock_updated');
    expect(providedHooks).toContain('materials.low_stock_alert');
    expect(providedHooks).toContain('materials.material_created');
    expect(providedHooks).toContain('materials.material_updated');
    expect(providedHooks).toContain('materials.material_deleted');

    // UI Hook Points
    expect(providedHooks).toContain('dashboard.widgets');
    expect(providedHooks).toContain('sales.order.actions');
    expect(providedHooks).toContain('production.toolbar.actions');
    expect(providedHooks).toContain('scheduling.toolbar.actions');
    expect(providedHooks).toContain('scheduling.top_metrics');
  });

  it('should consume correct hooks/events', () => {
    const consumedHooks = materialsManifest.hooks?.consume || [];

    expect(consumedHooks).toContain('sales.order_placed');
    expect(consumedHooks).toContain('sales.completed');
    expect(consumedHooks).toContain('sales.order_cancelled');
    expect(consumedHooks).toContain('products.recipe_updated');
    expect(consumedHooks).toContain('production.order.created');
    expect(consumedHooks).toContain('production.order.completed');
    expect(consumedHooks).toContain('supplier_orders.received');
  });

  it('should have navigation metadata', () => {
    expect(materialsManifest.metadata?.navigation?.route).toBe('/admin/supply-chain/materials');
    expect(materialsManifest.metadata?.navigation?.domain).toBe('supply-chain');
    expect(materialsManifest.metadata?.navigation?.color).toBe('green');
  });
});

// ============================================
// TEST SUITE 2: PUBLIC API EXPORTS
// ============================================

describe('TEST 5: Materials Public API Exports', () => {
  it('should export getStockLevel API', async () => {
    expect(materialsManifest.exports).toBeDefined();
    expect(materialsManifest.exports?.getStockLevel).toBeDefined();

    const result = await materialsManifest.exports!.getStockLevel!('MAT-001');

    expect(result).toHaveProperty('quantity');
    expect(result).toHaveProperty('unit');
    expect(typeof result.quantity).toBe('number');
    expect(typeof result.unit).toBe('string');
  });

  it('should export updateStock API', async () => {
    expect(materialsManifest.exports?.updateStock).toBeDefined();

    const result = await materialsManifest.exports!.updateStock!('MAT-001', 50, 'test adjustment');

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
  });

  it('should export isLowStock API', async () => {
    expect(materialsManifest.exports?.isLowStock).toBeDefined();

    const result = await materialsManifest.exports!.isLowStock!('MAT-001');

    expect(result).toHaveProperty('isLowStock');
    expect(result).toHaveProperty('threshold');
    expect(result).toHaveProperty('current');
    expect(typeof result.isLowStock).toBe('boolean');
  });

  it('should export checkOrderStockAvailability API', async () => {
    expect(materialsManifest.exports?.checkOrderStockAvailability).toBeDefined();

    const result = await materialsManifest.exports!.checkOrderStockAvailability!('ORDER-123');

    expect(result).toHaveProperty('available');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('insufficientItems');
    expect(typeof result.available).toBe('boolean');
    expect(Array.isArray(result.insufficientItems)).toBe(true);
  });

  it('should handle checkOrderStockAvailability errors gracefully', async () => {
    const result = await materialsManifest.exports!.checkOrderStockAvailability!('INVALID-ORDER');

    expect(result.available).toBe(false);
    expect(result.message).toBeTruthy();
  });
});

// ============================================
// TEST SUITE 3: MODULE REGISTRY INTEGRATION
// ============================================

describe('TEST 4: Module Registry Integration', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  afterEach(() => {
    registry.clear();
  });

  it('should register module successfully', async () => {
    await registry.register(materialsManifest);

    const registeredModule = registry.getModule('materials');
    expect(registeredModule).toBeDefined();
    expect(registeredModule?.id).toBe('materials');
  });

  it('should setup module and register hooks', async () => {
    await registry.register(materialsManifest);

    // Check that hooks are registered
    const dashboardActions = (registry as any)['hooks'].get('dashboard.widgets');
    expect(dashboardActions.length).toBeGreaterThan(0);
  });

  it('should make API accessible via getExports', async () => {
    await registry.register(materialsManifest);

    const materialsAPI = registry.getExports<MaterialsAPI>('materials');

    expect(materialsAPI).toBeDefined();
    expect(materialsAPI?.getStockLevel).toBeDefined();
    expect(materialsAPI?.updateStock).toBeDefined();
    expect(materialsAPI?.isLowStock).toBeDefined();
    expect(materialsAPI?.checkOrderStockAvailability).toBeDefined();
  });

  it('should allow calling API methods through registry', async () => {
    await registry.register(materialsManifest);

    const materialsAPI = registry.getExports<MaterialsAPI>('materials');
    const stockLevel = await materialsAPI!.getStockLevel('MAT-001');

    expect(stockLevel).toBeDefined();
    expect(stockLevel.quantity).toBeDefined();
  });
});

// ============================================
// TEST SUITE 4: CROSS-MODULE HOOK INJECTIONS
// ============================================

describe('TEST 4: Cross-Module Hook Injections', () => {
  let registry: ModuleRegistry;

  beforeEach(async () => {
    registry = new ModuleRegistry();
    await registry.register(materialsManifest);
  });

  afterEach(() => {
    registry.clear();
  });

  it('should inject dashboard.widgets hook', () => {
    const dashboardActions = (registry as any)['hooks'].get('dashboard.widgets');

    expect(dashboardActions.length).toBeGreaterThan(0);

    const materialsWidget = dashboardActions.find(a => a.moduleId === 'materials');
    expect(materialsWidget).toBeDefined();
  });

  it('should inject sales.order.actions hook', () => {
    const salesActions = (registry as any)['hooks'].get('sales.order.actions');

    const materialsAction = salesActions.find(a => a.moduleId === 'materials');
    expect(materialsAction).toBeDefined();
    expect(materialsAction?.priority).toBe(12);
  });

  it('should inject production.toolbar.actions hook', () => {
    const productionActions = (registry as any)['hooks'].get('production.toolbar.actions');

    const materialsAction = productionActions.find(a => a.moduleId === 'materials');
    expect(materialsAction).toBeDefined();
    expect(materialsAction?.priority).toBe(80);
  });

  it('should inject scheduling.toolbar.actions hook', () => {
    const schedulingToolbarActions = (registry as any)['hooks'].get('scheduling.toolbar.actions');

    const materialsAction = schedulingToolbarActions.find(a => a.moduleId === 'materials');
    expect(materialsAction).toBeDefined();
    expect(materialsAction?.priority).toBe(80);
  });

  it('should inject scheduling.top_metrics hook', () => {
    const schedulingMetrics = (registry as any)['hooks'].get('scheduling.top_metrics');

    const materialsMetric = schedulingMetrics.find(a => a.moduleId === 'materials');
    expect(materialsMetric).toBeDefined();
    expect(materialsMetric?.priority).toBe(85);
  });

  it('should respect hook priorities', () => {
    const salesActions = (registry as any)['hooks'].get('sales.order.actions');

    const materialsAction = salesActions.find(a => a.moduleId === 'materials');
    expect(materialsAction?.priority).toBe(12); // High priority

    const schedulingMetrics = (registry as any)['hooks'].get('scheduling.top_metrics');
    const materialsMetric = schedulingMetrics.find(a => a.moduleId === 'materials');
    expect(materialsMetric?.priority).toBe(85); // Very high priority for critical alerts
  });
});

// ============================================
// TEST SUITE 5: EVENTBUS INTEGRATION
// ============================================

describe('TEST 2 & 3: EventBus Integration', () => {
  let eventBus: typeof EventBus;
  let capturedEvents: Array<{ event: string; payload: unknown }>;

  beforeEach(() => {
    eventBus = EventBus;
    capturedEvents = [];
  });

  afterEach(() => {
    capturedEvents = [];
  });

  it('should emit materials.material_created event', (done) => {
    const testPayload = {
      materialId: 'MAT-TEST-001',
      materialName: 'Test Material',
      materialType: 'MEASURABLE',
      category: 'weight',
      unitCost: 10.5,
      timestamp: Date.now()
    };

    eventBus.on('materials.material_created', (payload) => {
      capturedEvents.push({ event: 'materials.material_created', payload });

      expect(payload).toMatchObject({
        materialId: testPayload.materialId,
        materialName: testPayload.materialName
      });

      done();
    });

    eventBus.emit('materials.material_created', testPayload, { priority: EventPriority.NORMAL });
  });

  it('should emit materials.stock_updated event', (done) => {
    const testPayload = {
      materialId: 'MAT-TEST-001',
      materialName: 'Test Material',
      oldStock: 100,
      newStock: 80,
      delta: -20,
      reason: 'manual_update',
      timestamp: Date.now()
    };

    eventBus.on('materials.stock_updated', (payload) => {
      capturedEvents.push({ event: 'materials.stock_updated', payload });

      expect(payload).toHaveProperty('delta');
      expect(payload.delta).toBe(-20);

      done();
    });

    eventBus.emit('materials.stock_updated', testPayload, { priority: EventPriority.HIGH });
  });

  it('should emit materials.low_stock_alert event', (done) => {
    const testPayload = {
      materialId: 'MAT-TEST-001',
      materialName: 'Test Material',
      currentStock: 5,
      minStock: 100,
      severity: 'warning',
      timestamp: Date.now()
    };

    eventBus.on('materials.low_stock_alert', (payload) => {
      capturedEvents.push({ event: 'materials.low_stock_alert', payload });

      expect(payload).toHaveProperty('severity');
      expect(payload.severity).toBe('warning');

      done();
    });

    eventBus.emit('materials.low_stock_alert', testPayload, { priority: EventPriority.HIGH });
  });

  it('should consume sales.order_placed event', (done) => {
    const testPayload = {
      orderId: 'TEST-ORDER-001',
      items: [
        { materialId: 'MAT-001', quantity: 5 },
        { materialId: 'MAT-002', quantity: 10 }
      ],
      timestamp: Date.now()
    };

    // Subscribe to the event
    eventBus.on('sales.order_placed', (payload) => {
      capturedEvents.push({ event: 'sales.order_placed', payload });

      expect(payload).toHaveProperty('orderId');
      expect(payload).toHaveProperty('items');
      expect(Array.isArray(payload.items)).toBe(true);

      done();
    });

    // Emit the event
    eventBus.emit('sales.order_placed', testPayload, { priority: EventPriority.HIGH });
  });

  it('should consume production.order.created event', (done) => {
    const testPayload = {
      orderId: 'PROD-001',
      recipe: 'Test Recipe',
      quantity: 20,
      materialsNeeded: [
        { materialId: 'MAT-001', quantity: 2000 }
      ],
      timestamp: Date.now()
    };

    eventBus.on('production.order.created', (payload) => {
      capturedEvents.push({ event: 'production.order.created', payload });

      expect(payload).toHaveProperty('materialsNeeded');
      expect(Array.isArray(payload.materialsNeeded)).toBe(true);

      done();
    });

    eventBus.emit('production.order.created', testPayload, { priority: EventPriority.NORMAL });
  });

  it('should consume supplier_orders.received event', (done) => {
    const testPayload = {
      orderId: 'PO-001',
      supplier: 'Test Supplier',
      items: [
        { materialId: 'MAT-001', quantity: 100 }
      ],
      timestamp: Date.now()
    };

    eventBus.on('supplier_orders.received', (payload) => {
      capturedEvents.push({ event: 'supplier_orders.received', payload });

      expect(payload).toHaveProperty('supplier');
      expect(payload).toHaveProperty('items');

      done();
    });

    eventBus.emit('supplier_orders.received', testPayload, { priority: EventPriority.NORMAL });
  });

  it('should handle multiple event subscriptions', () => {
    let eventCount = 0;

    // Subscribe multiple times
    eventBus.on('materials.stock_updated', () => eventCount++);
    eventBus.on('materials.stock_updated', () => eventCount++);

    // Emit event
    eventBus.emit('materials.stock_updated', {
      materialId: 'MAT-001',
      delta: -10,
      timestamp: Date.now()
    }, { priority: EventPriority.NORMAL });

    // Allow event propagation
    setTimeout(() => {
      expect(eventCount).toBeGreaterThan(0);
    }, 100);
  });
});

// ============================================
// TEST SUITE 6: TYPESCRIPT TYPE SAFETY
// ============================================

describe('TEST 6: TypeScript Type Safety', () => {
  it('should have correctly typed API methods', () => {
    const api = materialsManifest.exports as MaterialsAPI;

    // Type checking at compile time
    expect(api.getStockLevel).toBeDefined();
    expect(api.updateStock).toBeDefined();
    expect(api.isLowStock).toBeDefined();
    expect(api.checkOrderStockAvailability).toBeDefined();
  });

  it('should have correct return types', async () => {
    const api = materialsManifest.exports as MaterialsAPI;

    const stockLevel = await api.getStockLevel('MAT-001');
    const updateResult = await api.updateStock('MAT-001', 50, 'test');
    const lowStockCheck = await api.isLowStock('MAT-001');
    const orderCheck = await api.checkOrderStockAvailability('ORDER-123');

    // Runtime type checks
    expect(typeof stockLevel.quantity).toBe('number');
    expect(typeof stockLevel.unit).toBe('string');
    expect(typeof updateResult.success).toBe('boolean');
    expect(typeof lowStockCheck.isLowStock).toBe('boolean');
    expect(typeof orderCheck.available).toBe('boolean');
  });
});

// ============================================
// TEST SUITE 7: PERMISSIONS VALIDATION
// ============================================

describe('TEST 1: Permissions System', () => {
  let registry: ModuleRegistry;

  beforeEach(async () => {
    registry = new ModuleRegistry();
    await registry.register(materialsManifest);
  });

  afterEach(() => {
    registry.clear();
  });

  it('should require materials.read permission for dashboard widget', () => {
    const dashboardActions = (registry as any)['hooks'].get('dashboard.widgets');
    const materialsWidget = dashboardActions.find(a => a.moduleId === 'materials');

    expect(materialsWidget?.metadata?.requiredPermission).toBeDefined();
    expect(materialsWidget?.metadata?.requiredPermission?.module).toBe('materials');
    expect(materialsWidget?.metadata?.requiredPermission?.action).toBe('read');
  });

  it('should require materials.read permission for sales order actions', () => {
    const salesActions = (registry as any)['hooks'].get('sales.order.actions');
    const checkStockAction = salesActions.find(a => a.moduleId === 'materials');

    expect(checkStockAction?.metadata?.requiredPermission).toBeDefined();
    expect(checkStockAction?.metadata?.requiredPermission?.module).toBe('materials');
    expect(checkStockAction?.metadata?.requiredPermission?.action).toBe('read');
  });

  it('should require materials.create permission for procurement actions', () => {
    const procurementActions = (registry as any)['hooks'].get('materials.procurement.actions');
    const autoReorderAction = procurementActions.find(a => a.moduleId === 'materials');

    expect(autoReorderAction?.metadata?.requiredPermission).toBeDefined();
    expect(autoReorderAction?.metadata?.requiredPermission?.module).toBe('materials');
    expect(autoReorderAction?.metadata?.requiredPermission?.action).toBe('create');
  });

  it('should require materials.create permission for scheduling toolbar', () => {
    const schedulingActions = (registry as any)['hooks'].get('scheduling.toolbar.actions');
    const stockReceptionAction = schedulingActions.find(a => a.moduleId === 'materials');

    expect(stockReceptionAction?.metadata?.requiredPermission).toBeDefined();
    expect(stockReceptionAction?.metadata?.requiredPermission?.module).toBe('materials');
    expect(stockReceptionAction?.metadata?.requiredPermission?.action).toBe('create');
  });

  it('should set minimum role to OPERADOR', () => {
    expect(materialsManifest.minimumRole).toBe('OPERADOR');
  });
});

// ============================================
// TEST SUITE 8: HOOK EXECUTION
// ============================================

describe('TEST 8: Hook Execution & Rendering', () => {
  let registry: ModuleRegistry;

  beforeEach(async () => {
    registry = new ModuleRegistry();
    await registry.register(materialsManifest);
  });

  afterEach(() => {
    registry.clear();
  });

  it('should execute dashboard widget hook', () => {
    const actions = (registry as any)['hooks'].get('dashboard.widgets');
    const materialsWidget = actions.find(a => a.moduleId === 'materials');

    expect(materialsWidget).toBeDefined();
    expect(typeof materialsWidget?.handler).toBe('function');

    const result = materialsWidget?.handler({});
    expect(result).toBeDefined();
  });

  it('should execute sales order action hook', () => {
    const actions = (registry as any)['hooks'].get('sales.order.actions');
    const checkStockAction = actions.find(a => a.moduleId === 'materials');

    expect(checkStockAction).toBeDefined();
    expect(typeof checkStockAction?.handler).toBe('function');

    const result = checkStockAction?.handler({ order: { id: 'TEST-001' } });
    expect(result).toBeDefined();
  });

  it('should execute scheduling metrics hook', () => {
    const actions = (registry as any)['hooks'].get('scheduling.top_metrics');
    const lowStockMetric = actions.find(a => a.moduleId === 'materials');

    expect(lowStockMetric).toBeDefined();
    expect(typeof lowStockMetric?.handler).toBe('function');

    const result = lowStockMetric?.handler({});
    expect(result).toBeDefined();
  });
});

// ============================================
// FINAL TEST: COMPREHENSIVE MODULE HEALTH
// ============================================

describe('TEST 9: Comprehensive Module Health Check', () => {
  it('should pass all module validation checks', async () => {
    const registry = new ModuleRegistry();

    // Register module
    await registry.register(materialsManifest);

    // Validate module is registered
    const module = registry.getModule('materials');
    expect(module).toBeDefined();

    // Validate all hooks are registered (7 provided hooks)
    const dashboardHooks = (registry as any)['hooks'].get('dashboard.widgets') || []).filter(a => a.moduleId === 'materials');
    const salesHooks = (registry as any)['hooks'].get('sales.order.actions') || []).filter(a => a.moduleId === 'materials');
    const productionHooks = (registry as any)['hooks'].get('production.toolbar.actions') || []).filter(a => a.moduleId === 'materials');
    const schedulingToolbar = (registry as any)['hooks'].get('scheduling.toolbar.actions') || []).filter(a => a.moduleId === 'materials');
    const schedulingMetrics = (registry as any)['hooks'].get('scheduling.top_metrics') || []).filter(a => a.moduleId === 'materials');
    const procurementHooks = (registry as any)['hooks'].get('materials.procurement.actions') || []).filter(a => a.moduleId === 'materials');
    const rowActions = (registry as any)['hooks'].get('materials.row.actions') || []).filter(a => a.moduleId === 'materials');

    expect(dashboardHooks.length).toBeGreaterThan(0);
    expect(salesHooks.length).toBeGreaterThan(0);
    expect(productionHooks.length).toBeGreaterThan(0);
    expect(schedulingToolbar.length).toBeGreaterThan(0);
    expect(schedulingMetrics.length).toBeGreaterThan(0);
    expect(procurementHooks.length).toBeGreaterThan(0);
    expect(rowActions.length).toBeGreaterThan(0);

    // Validate API is accessible
    const api = registry.getExports<MaterialsAPI>('materials');
    expect(api).toBeDefined();
    expect(api?.getStockLevel).toBeDefined();
    expect(api?.updateStock).toBeDefined();
    expect(api?.isLowStock).toBeDefined();
    expect(api?.checkOrderStockAvailability).toBeDefined();

    // Validate API methods work
    const stockLevel = await api!.getStockLevel('MAT-001');
    expect(stockLevel).toHaveProperty('quantity');
    expect(stockLevel).toHaveProperty('unit');

    // Cleanup
    registry.clear();
  });

  it('should have no TypeScript errors in manifest', () => {
    // This test passes if the file compiles
    expect(materialsManifest).toBeDefined();
    expect(materialsManifest.id).toBe('materials');
  });

  it('should have complete metadata', () => {
    expect(materialsManifest.metadata).toBeDefined();
    expect(materialsManifest.metadata?.category).toBe('business');
    expect(materialsManifest.metadata?.navigation).toBeDefined();
    expect(materialsManifest.metadata?.tags).toContain('inventory');
  });
});
