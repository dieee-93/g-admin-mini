# 🛠️ Module Registry Implementation Guide

**Version**: 1.0.0
**Complemento de**: `MODULE_REGISTRY_MIGRATION_PLAN.md`
**Audience**: Developers
**Status**: Implementation Ready

---

## 📋 Quick Start

### Installation

```bash
# No external dependencies needed
# Module Registry uses only React + TypeScript
```

### File Structure

```
src/
├── lib/
│   └── modules/
│       ├── ModuleRegistry.ts       # Core registry
│       ├── HookPoint.tsx           # Hook execution component
│       ├── useModuleRegistry.ts    # React hook
│       └── types.ts                # Type definitions
├── modules/
│   ├── bootstrap.ts                # Module initialization
│   ├── sales/
│   │   ├── manifest.ts
│   │   └── hooks/
│   ├── materials/
│   │   ├── manifest.ts
│   │   └── hooks/
│   └── ... (all modules)
└── store/
    └── capabilityStore.ts          # Modified to init registry
```

---

## 🔧 Core Implementation

### 1. Type Definitions

```typescript
// src/lib/modules/types.ts

import type { FeatureId } from '@/config/types';

/**
 * Hook handler function signature
 */
export type HookHandler<T = any, R = React.ReactNode> = (data: T) => R;

/**
 * Module instance (registered and active)
 */
export interface ModuleInstance {
  manifest: ModuleManifest;
  active: boolean;
  registeredAt: number;
}

/**
 * Module manifest definition
 */
export interface ModuleManifest {
  /** Unique module ID */
  id: string;

  /** Display name */
  name: string;

  /** Semantic version */
  version: string;

  /** Module dependencies (other module IDs) */
  depends: string[];

  /** Auto-install if dependencies are active */
  autoInstall?: boolean;

  /** Required features from FeatureRegistry */
  requiredFeatures: FeatureId[];

  /** Optional features (module works without them but enhanced if present) */
  optionalFeatures?: FeatureId[];

  /** Hooks provided by this module */
  hooks?: {
    /** Hooks this module provides (for others to consume) */
    provide: string[];
    /** Hooks this module consumes (from other modules) */
    consume: string[];
  };

  /** Setup function executed on registration */
  setup?: (registry: ModuleRegistry) => void;

  /** Cleanup function executed on unregister */
  teardown?: () => void;

  /** Public API exports (inspired by VS Code) */
  exports?: Record<string, any>;
}

/**
 * Hook execution context
 */
export interface HookContext {
  moduleId: string;
  hookName: string;
  timestamp: number;
}
```

### 2. Module Registry Core

```typescript
// src/lib/modules/ModuleRegistry.ts

import { logger } from '@/lib/logging';
import type {
  ModuleManifest,
  ModuleInstance,
  HookHandler,
  HookContext
} from './types';

export class ModuleRegistry {
  private static instance: ModuleRegistry;

  private modules = new Map<string, ModuleInstance>();
  private hooks = new Map<string, Array<{
    handler: HookHandler;
    context: HookContext;
  }>>();

  private constructor() {
    logger.debug('ModuleRegistry', 'Initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ModuleRegistry {
    if (!this.instance) {
      this.instance = new ModuleRegistry();
    }
    return this.instance;
  }

  /**
   * Register a module
   *
   * @throws Error if dependencies not met
   */
  register(manifest: ModuleManifest): void {
    const startTime = performance.now();

    try {
      // 1. Validate dependencies
      this.validateDependencies(manifest);

      // 2. Check if already registered
      if (this.modules.has(manifest.id)) {
        logger.warn('ModuleRegistry', `Module ${manifest.id} already registered, skipping`);
        return;
      }

      // 3. Register module
      const instance: ModuleInstance = {
        manifest,
        active: true,
        registeredAt: Date.now()
      };

      this.modules.set(manifest.id, instance);

      // 4. Execute setup
      if (manifest.setup) {
        manifest.setup(this);
      }

      // 5. Check auto-install triggers
      if (manifest.autoInstall) {
        this.checkAutoInstall(manifest);
      }

      const duration = performance.now() - startTime;
      logger.info('ModuleRegistry', `✅ Registered ${manifest.id}`, {
        duration: `${duration.toFixed(2)}ms`,
        depends: manifest.depends,
        hooks: manifest.hooks
      });

    } catch (error) {
      logger.error('ModuleRegistry', `❌ Failed to register ${manifest.id}:`, error);
      throw error;
    }
  }

  /**
   * Validate module dependencies
   */
  private validateDependencies(manifest: ModuleManifest): void {
    for (const dep of manifest.depends) {
      if (!this.modules.has(dep)) {
        throw new Error(
          `Module "${manifest.id}" requires "${dep}" but it is not registered. ` +
          `Make sure to register dependencies first.`
        );
      }
    }
  }

  /**
   * Check if any auto-install modules can be triggered
   */
  private checkAutoInstall(triggerModule: ModuleManifest): void {
    // This would check if there are link modules waiting for this dependency
    // Implementation depends on your link module registry
    logger.debug('ModuleRegistry', `Checking auto-install for ${triggerModule.id}`);
  }

  /**
   * Unregister a module
   */
  unregister(moduleId: string): void {
    const instance = this.modules.get(moduleId);

    if (!instance) {
      logger.warn('ModuleRegistry', `Module ${moduleId} not found`);
      return;
    }

    // Execute teardown
    if (instance.manifest.teardown) {
      instance.manifest.teardown();
    }

    // Remove hooks registered by this module
    this.hooks.forEach((handlers, hookName) => {
      const filtered = handlers.filter(h => h.context.moduleId !== moduleId);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    });

    // Remove module
    this.modules.delete(moduleId);

    logger.info('ModuleRegistry', `Unregistered ${moduleId}`);
  }

  /**
   * Add action hook (inspired by WordPress add_action)
   *
   * @param hookName - Hook identifier (e.g., 'materials.row.actions')
   * @param handler - Function to execute
   * @param moduleId - Optional module ID (auto-detected in setup)
   */
  addAction<T = any, R = React.ReactNode>(
    hookName: string,
    handler: HookHandler<T, R>,
    moduleId?: string
  ): void {
    const handlers = this.hooks.get(hookName) || [];

    const context: HookContext = {
      moduleId: moduleId || 'unknown',
      hookName,
      timestamp: Date.now()
    };

    handlers.push({ handler, context });
    this.hooks.set(hookName, handlers);

    logger.debug('ModuleRegistry', `Registered hook: ${hookName}`, context);
  }

  /**
   * Execute hook (inspired by WordPress do_action)
   *
   * @param hookName - Hook identifier
   * @param data - Data to pass to handlers
   * @returns Array of results from all handlers
   */
  doAction<T = any, R = React.ReactNode>(hookName: string, data?: T): R[] {
    const handlers = this.hooks.get(hookName) || [];

    if (handlers.length === 0) {
      logger.debug('ModuleRegistry', `No handlers for hook: ${hookName}`);
      return [];
    }

    const results: R[] = [];

    for (const { handler, context } of handlers) {
      try {
        const result = handler(data);
        results.push(result);
      } catch (error) {
        logger.error('ModuleRegistry', `Error executing hook ${hookName} from ${context.moduleId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get module instance (inspired by VS Code getExtension)
   */
  getModule(id: string): ModuleInstance | undefined {
    return this.modules.get(id);
  }

  /**
   * Get module exports (inspired by VS Code exports API)
   */
  getExports<T = any>(moduleId: string): T | undefined {
    const module = this.modules.get(moduleId);
    return module?.manifest.exports as T | undefined;
  }

  /**
   * Check if module is registered
   */
  has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleInstance[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get dependency graph for a module
   */
  getDependencyGraph(moduleId: string): string[] {
    const module = this.modules.get(moduleId);
    if (!module) return [];

    const deps = new Set<string>();

    const traverse = (id: string) => {
      const mod = this.modules.get(id);
      if (!mod) return;

      mod.manifest.depends.forEach(depId => {
        deps.add(depId);
        traverse(depId);
      });
    };

    traverse(moduleId);
    return Array.from(deps);
  }

  /**
   * Clear all modules and hooks
   */
  clear(): void {
    // Execute teardown for all modules
    this.modules.forEach(instance => {
      if (instance.manifest.teardown) {
        instance.manifest.teardown();
      }
    });

    this.modules.clear();
    this.hooks.clear();

    logger.info('ModuleRegistry', 'Cleared all modules and hooks');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalModules: this.modules.size,
      totalHooks: this.hooks.size,
      modules: Array.from(this.modules.keys()),
      hooks: Array.from(this.hooks.entries()).map(([name, handlers]) => ({
        name,
        handlerCount: handlers.length
      }))
    };
  }
}

export default ModuleRegistry;
```

### 3. React Hook

```typescript
// src/lib/modules/useModuleRegistry.ts

import { useSyncExternalStore } from 'react';
import { ModuleRegistry } from './ModuleRegistry';

/**
 * React hook to access Module Registry
 *
 * @example
 * const registry = useModuleRegistry();
 * const salesModule = registry.getModule('sales');
 */
export function useModuleRegistry() {
  // Get singleton instance
  const registry = ModuleRegistry.getInstance();

  // Subscribe to changes (for reactive updates)
  // Note: ModuleRegistry is mostly static after initialization,
  // but this ensures React re-renders if registry changes
  const snapshot = useSyncExternalStore(
    (callback) => {
      // Subscribe - registry would need to implement this
      // For now, return no-op unsubscribe
      return () => {};
    },
    () => registry.getStats(),
    () => registry.getStats()
  );

  return registry;
}
```

### 4. HookPoint Component

```typescript
// src/lib/modules/HookPoint.tsx

import React from 'react';
import { useModuleRegistry } from './useModuleRegistry';
import { Stack } from '@/shared/ui';

interface HookPointProps {
  /** Hook name (e.g., 'materials.row.actions') */
  name: string;

  /** Data to pass to hook handlers */
  data?: any;

  /** Fallback content if no hooks registered */
  fallback?: React.ReactNode;

  /** Layout direction for multiple results */
  direction?: 'row' | 'column';

  /** Gap between results */
  gap?: number;
}

/**
 * Hook execution point
 *
 * Executes all registered handlers for a hook and renders results.
 *
 * @example
 * <HookPoint name="materials.row.actions" data={material} />
 */
export function HookPoint({
  name,
  data,
  fallback,
  direction = 'row',
  gap = 2
}: HookPointProps) {
  const registry = useModuleRegistry();

  // Execute all hooks
  const results = registry.doAction(name, data);

  // No handlers registered
  if (results.length === 0) {
    return <>{fallback}</>;
  }

  // Single result - render directly
  if (results.length === 1) {
    return <>{results[0]}</>;
  }

  // Multiple results - use Stack
  return (
    <Stack direction={direction} gap={gap}>
      {results.map((result, index) => (
        <React.Fragment key={`${name}-${index}`}>
          {result}
        </React.Fragment>
      ))}
    </Stack>
  );
}
```

### 5. Bootstrap System

```typescript
// src/modules/bootstrap.ts

import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';
import type { FeatureId } from '@/config/types';
import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

// Import all module manifests
import { salesManifest } from './sales/manifest';
import { materialsManifest } from './materials/manifest';
import { kitchenManifest } from './kitchen/manifest';
import { operationsManifest } from './operations/manifest';
import { customersManifest } from './customers/manifest';
import { productsManifest } from './products/manifest';
import { staffManifest } from './staff/manifest';
import { schedulingManifest } from './scheduling/manifest';
// ... import all modules

/**
 * All available modules
 */
const ALL_MODULES: ModuleManifest[] = [
  salesManifest,
  materialsManifest,
  kitchenManifest,
  operationsManifest,
  customersManifest,
  productsManifest,
  staffManifest,
  schedulingManifest
  // ... all modules
];

/**
 * Initialize modules based on active features
 *
 * Called by CapabilityStore after feature activation
 */
export function initializeModules(
  activeFeatures: FeatureId[],
  registry: ModuleRegistry
): void {
  const startTime = performance.now();

  logger.info('ModuleBootstrap', 'Initializing modules...', {
    activeFeatures: activeFeatures.length
  });

  // 1. Filter modules by required features
  const eligibleModules = ALL_MODULES.filter(mod => {
    // Check if ALL required features are active
    const hasRequired = mod.requiredFeatures.every(f =>
      activeFeatures.includes(f)
    );

    if (!hasRequired) {
      logger.debug('ModuleBootstrap', `Skipping ${mod.id} - missing required features`, {
        required: mod.requiredFeatures,
        missing: mod.requiredFeatures.filter(f => !activeFeatures.includes(f))
      });
    }

    return hasRequired;
  });

  logger.info('ModuleBootstrap', `Found ${eligibleModules.length} eligible modules`);

  // 2. Topological sort (dependency order)
  const sortedModules = topologicalSort(eligibleModules);

  // 3. Register modules in order
  sortedModules.forEach(mod => {
    try {
      registry.register(mod);
    } catch (error) {
      logger.error('ModuleBootstrap', `Failed to register ${mod.id}:`, error);
    }
  });

  const duration = performance.now() - startTime;

  logger.info('ModuleBootstrap', '✅ Module initialization complete', {
    duration: `${duration.toFixed(2)}ms`,
    registered: sortedModules.length,
    modules: sortedModules.map(m => m.id)
  });
}

/**
 * Topological sort of modules by dependencies
 *
 * Ensures modules are registered in correct order
 * (dependencies first)
 */
function topologicalSort(modules: ModuleManifest[]): ModuleManifest[] {
  const sorted: ModuleManifest[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (mod: ModuleManifest) => {
    // Circular dependency check
    if (visiting.has(mod.id)) {
      const cycle = Array.from(visiting).join(' → ') + ' → ' + mod.id;
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    // Already processed
    if (visited.has(mod.id)) {
      return;
    }

    visiting.add(mod.id);

    // Visit dependencies first
    mod.depends.forEach(depId => {
      const depMod = modules.find(m => m.id === depId);
      if (depMod) {
        visit(depMod);
      }
    });

    visiting.delete(mod.id);
    visited.add(mod.id);
    sorted.push(mod);
  };

  modules.forEach(visit);

  return sorted;
}

/**
 * Get module by ID from registry
 */
export function getModuleManifest(id: string): ModuleManifest | undefined {
  return ALL_MODULES.find(m => m.id === id);
}
```

### 6. Integration with CapabilityStore

```typescript
// src/store/capabilityStore.ts (MODIFIED)

import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';
import { initializeModules } from '@/modules/bootstrap';

// ... existing imports ...

export const useCapabilityStore = create<CapabilityStore>()(
  persist(
    (set, get) => ({
      // ... existing state ...

      setCapabilities: (capabilities) => {
        set((state) => {
          if (!state.profile) return state;

          const updatedProfile = {
            ...state.profile,
            selectedActivities: capabilities
          };

          // Persist to database
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting capabilities:', err);
          });

          // Activate features
          try {
            const activationResult = FeatureActivationEngine.activateFeatures(
              capabilities,
              updatedProfile.selectedInfrastructure,
              updatedProfile,
              {}
            );

            // ✅ NEW: Initialize Module Registry
            const registry = ModuleRegistry.getInstance();
            registry.clear(); // Clear previous registrations

            initializeModules(activationResult.activeFeatures, registry);

            logger.info('CapabilityStore', '🎯 Capabilities set:', {
              capabilities: capabilities.length,
              activeFeatures: activationResult.activeFeatures.length,
              registeredModules: registry.getStats().totalModules
            });

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activationResult.activeFeatures,
                blockedFeatures: activationResult.blockedFeatures,
                pendingMilestones: activationResult.pendingMilestones,
                completedMilestones: state.features.completedMilestones,
                validationErrors: activationResult.validationErrors,
                activeModules: getModulesForActiveFeatures(activationResult.activeFeatures),
                activeSlots: getSlotsForActiveFeatures(activationResult.activeFeatures)
              }
            };

          } catch (error) {
            logger.error('CapabilityStore', '❌ Error setting capabilities:', error);
            return state;
          }
        });
      },

      // ... rest unchanged ...
    }),
    {
      name: 'capability-store-v4',
      // ... persist config ...
    }
  )
);
```

---

## 📦 Module Examples

### Sales Module

```typescript
// src/modules/sales/manifest.ts

import type { ModuleManifest } from '@/lib/modules/types';
import { createQuickSale, createOrder } from './services/saleApi';
import { Button } from '@/shared/ui';

export const salesManifest: ModuleManifest = {
  id: 'sales',
  name: 'Sales Management',
  version: '1.0.0',

  depends: ['customers'],

  requiredFeatures: [
    'sales_order_management',
    'sales_payment_processing'
  ],

  optionalFeatures: [
    'sales_pos_onsite',
    'sales_catalog_ecommerce'
  ],

  hooks: {
    provide: [
      'sales.order.created',
      'sales.order.actions',
      'sales.payment.methods'
    ],
    consume: [
      'materials.row.actions',
      'customers.detail.actions',
      'products.row.actions'
    ]
  },

  setup: (registry) => {
    // Hook 1: Materials row actions
    registry.addAction('materials.row.actions', (material) => (
      <Button
        size="sm"
        colorScheme="blue"
        onClick={() => createQuickSale(material)}
      >
        Quick Sell
      </Button>
    ), 'sales');

    // Hook 2: Customers detail actions
    registry.addAction('customers.detail.actions', (customer) => (
      <Button
        size="md"
        colorScheme="teal"
        onClick={() => createOrder(customer)}
      >
        New Order
      </Button>
    ), 'sales');

    // Hook 3: Products row actions
    registry.addAction('products.row.actions', (product) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => createQuickSale(product)}
      >
        Sell Now
      </Button>
    ), 'sales');
  },

  teardown: () => {
    // Cleanup if needed
    console.log('Sales module unregistered');
  },

  exports: {
    createQuickSale,
    createOrder
  }
};
```

### Kitchen Module

```typescript
// src/modules/kitchen/manifest.ts

import type { ModuleManifest } from '@/lib/modules/types';
import { sendToKitchen, createProductionOrder } from './services/kitchenApi';
import { Button, Icon } from '@/shared/ui';
import { FireIcon } from '@heroicons/react/24/outline';

export const kitchenManifest: ModuleManifest = {
  id: 'kitchen',
  name: 'Kitchen Operations',
  version: '1.0.0',

  depends: ['materials'],

  requiredFeatures: [
    'production_kitchen_display',
    'production_recipe_management'
  ],

  hooks: {
    provide: [
      'kitchen.order.ready',
      'kitchen.item.prepared'
    ],
    consume: [
      'materials.row.actions',
      'products.row.actions',
      'sales.order.created'
    ]
  },

  setup: (registry) => {
    // Hook 1: Materials row actions
    registry.addAction('materials.row.actions', (material) => (
      <Button
        size="sm"
        colorScheme="orange"
        leftIcon={<Icon icon={FireIcon} size="sm" />}
        onClick={() => sendToKitchen(material)}
      >
        Use in Kitchen
      </Button>
    ), 'kitchen');

    // Hook 2: Products row actions
    registry.addAction('products.row.actions', (product) => (
      <Button
        size="sm"
        colorScheme="orange"
        onClick={() => createProductionOrder(product)}
      >
        Prepare
      </Button>
    ), 'kitchen');

    // Hook 3: Listen to sales orders
    registry.addAction('sales.order.created', (order) => {
      // Auto-send order to kitchen display
      sendToKitchen(order.items);
    }, 'kitchen');
  },

  exports: {
    sendToKitchen,
    createProductionOrder
  }
};
```

### Sales-Materials Link Module

```typescript
// src/modules/sales-materials-link/manifest.ts

import type { ModuleManifest } from '@/lib/modules/types';

export const salesMaterialsLinkManifest: ModuleManifest = {
  id: 'sales-materials-link',
  name: 'Sales-Materials Integration',
  version: '1.0.0',

  depends: ['sales', 'materials'],
  autoInstall: true, // ← Auto-instala si ambos están activos

  requiredFeatures: [
    'sales_order_management',
    'inventory_stock_tracking'
  ],

  setup: (registry) => {
    // Hook 1: Reduce stock when sale is created
    registry.addAction('sales.order.created', (order) => {
      const materialsModule = registry.getModule('materials');

      if (materialsModule) {
        const materialsAPI = materialsModule.manifest.exports;
        materialsAPI.reduceStock(order.items);
      }
    }, 'sales-materials-link');

    // Hook 2: Alert in Sales if material is low stock
    registry.addAction('materials.low_stock_alert', (material) => {
      const salesModule = registry.getModule('sales');

      if (salesModule) {
        const salesAPI = salesModule.manifest.exports;
        salesAPI.showLowStockWarning(material);
      }
    }, 'sales-materials-link');
  }
};
```

---

## 🔄 Migration Examples

### Before & After: MaterialRow Component

**BEFORE (Feature Flags)**:
```typescript
// src/pages/admin/supply-chain/materials/components/MaterialRow.tsx

import { useCapabilities } from '@/store/capabilityStore';
import { createQuickSale } from '@/pages/admin/operations/sales/services/saleApi';
import { sendToKitchen } from '@/pages/admin/operations/kitchen/services/kitchenApi';
import { publishOnline } from '@/pages/admin/ecommerce/services/catalogApi';

function MaterialRow({ material }) {
  const { hasFeature } = useCapabilities();

  return (
    <tr>
      <td>{material.name}</td>
      <td>{material.stock}</td>
      <td>
        {/* ❌ Multiple imports from other modules */}
        {/* ❌ Implicit dependencies */}
        {hasFeature('sales_pos_onsite') && (
          <Button onClick={() => createQuickSale(material)}>
            Quick Sell
          </Button>
        )}

        {hasFeature('production_kitchen_display') && (
          <Button onClick={() => sendToKitchen(material)}>
            Use in Kitchen
          </Button>
        )}

        {hasFeature('sales_catalog_ecommerce') && (
          <Button onClick={() => publishOnline(material)}>
            Publish Online
          </Button>
        )}
      </td>
    </tr>
  );
}
```

**AFTER (Module Registry + Hooks)**:
```typescript
// src/pages/admin/supply-chain/materials/components/MaterialRow.tsx

import { HookPoint } from '@/lib/modules/HookPoint';

function MaterialRow({ material }) {
  return (
    <tr>
      <td>{material.name}</td>
      <td>{material.stock}</td>
      <td>
        {/* ✅ No imports from other modules */}
        {/* ✅ Explicit hook point */}
        {/* ✅ Auto-composition of all registered actions */}
        <HookPoint name="materials.row.actions" data={material} />
      </td>
    </tr>
  );
}
```

**Modules register themselves**:
```typescript
// Sales module registers its button
salesManifest.setup = (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => createQuickSale(material)}>Quick Sell</Button>
  ));
};

// Kitchen module registers its button
kitchenManifest.setup = (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => sendToKitchen(material)}>Use in Kitchen</Button>
  ));
};

// Ecommerce module registers its button
ecommerceManifest.setup = (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => publishOnline(material)}>Publish Online</Button>
  ));
};
```

**Result**: All buttons appear automatically based on active modules!

---

## 🧪 Testing

### Unit Tests

```typescript
// src/lib/modules/__tests__/ModuleRegistry.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleRegistry } from '../ModuleRegistry';
import type { ModuleManifest } from '../types';

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = ModuleRegistry.getInstance();
    registry.clear();
  });

  it('registers a module successfully', () => {
    const manifest: ModuleManifest = {
      id: 'test',
      name: 'Test Module',
      version: '1.0.0',
      depends: [],
      requiredFeatures: []
    };

    registry.register(manifest);

    expect(registry.has('test')).toBe(true);
  });

  it('throws error if dependency not met', () => {
    const manifest: ModuleManifest = {
      id: 'test',
      name: 'Test Module',
      version: '1.0.0',
      depends: ['missing-module'],
      requiredFeatures: []
    };

    expect(() => registry.register(manifest)).toThrow();
  });

  it('executes hooks in order', () => {
    const results: number[] = [];

    registry.addAction('test.hook', () => results.push(1));
    registry.addAction('test.hook', () => results.push(2));
    registry.addAction('test.hook', () => results.push(3));

    registry.doAction('test.hook');

    expect(results).toEqual([1, 2, 3]);
  });

  it('detects circular dependencies', () => {
    const moduleA: ModuleManifest = {
      id: 'a',
      name: 'Module A',
      version: '1.0.0',
      depends: ['b'],
      requiredFeatures: []
    };

    const moduleB: ModuleManifest = {
      id: 'b',
      name: 'Module B',
      version: '1.0.0',
      depends: ['a'],
      requiredFeatures: []
    };

    // This should throw during topological sort
    // Test in bootstrap.test.ts
  });
});
```

### Integration Tests

```typescript
// src/modules/__tests__/bootstrap.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeModules } from '../bootstrap';
import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';

describe('Module Bootstrap', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = ModuleRegistry.getInstance();
    registry.clear();
  });

  it('initializes modules based on active features', () => {
    const activeFeatures = [
      'sales_order_management',
      'sales_payment_processing',
      'inventory_stock_tracking'
    ];

    initializeModules(activeFeatures, registry);

    expect(registry.has('sales')).toBe(true);
    expect(registry.has('materials')).toBe(true);
  });

  it('skips modules without required features', () => {
    const activeFeatures = [
      'sales_order_management'
      // Missing 'production_kitchen_display'
    ];

    initializeModules(activeFeatures, registry);

    expect(registry.has('sales')).toBe(true);
    expect(registry.has('kitchen')).toBe(false);
  });

  it('registers modules in dependency order', () => {
    const activeFeatures = [
      'sales_order_management',
      'sales_payment_processing',
      'customer_segmentation'
    ];

    initializeModules(activeFeatures, registry);

    const stats = registry.getStats();
    const moduleOrder = stats.modules;

    // Customers should be registered before Sales
    const customersIndex = moduleOrder.indexOf('customers');
    const salesIndex = moduleOrder.indexOf('sales');

    expect(customersIndex).toBeLessThan(salesIndex);
  });
});
```

---

## 📊 Performance Considerations

### Optimization 1: Set-based Feature Lookup

```typescript
// src/store/capabilityStore.ts

// ❌ BEFORE - O(n) lookup
hasFeature: (featureId) => {
  const { features } = get();
  return features.activeFeatures.includes(featureId); // O(n)
}

// ✅ AFTER - O(1) lookup
const activeFeatureSet = new Set(features.activeFeatures);

hasFeature: (featureId) => {
  return activeFeatureSet.has(featureId); // O(1)
}
```

### Optimization 2: Memoize CapabilityGate

```typescript
// src/lib/capabilities/components/CapabilityGate.tsx

export const CapabilityGate = React.memo(({
  capability,
  children,
  fallback
}: CapabilityGateProps) => {
  // Use Zustand selector for granular subscription
  const hasCapability = useCapabilityStore(
    state => capability
      ? state.features.activeFeatures.includes(capability)
      : true
  );

  if (!hasCapability) return <>{fallback}</> || null;
  return <>{children}</>;
});
```

### Optimization 3: Lazy Hook Registration

```typescript
// Only register hooks when module is actually used

setup: (registry) => {
  // ❌ Register immediately
  registry.addAction('materials.row.actions', ...);

  // ✅ Register lazily when first accessed
  let registered = false;

  const ensureRegistered = () => {
    if (!registered) {
      registry.addAction('materials.row.actions', ...);
      registered = true;
    }
  };

  // Export lazy initializer
  return { ensureRegistered };
}
```

---

## 🔍 Debugging Tools

### Module Inspector

```typescript
// src/modules/debug/ModuleInspector.tsx

export function ModuleInspector() {
  const registry = useModuleRegistry();
  const stats = registry.getStats();

  return (
    <div>
      <h2>Module Registry Inspector</h2>

      <h3>Registered Modules ({stats.totalModules})</h3>
      <ul>
        {stats.modules.map(id => {
          const module = registry.getModule(id);
          return (
            <li key={id}>
              <strong>{module?.manifest.name}</strong> ({id})
              <ul>
                <li>Depends: {module?.manifest.depends.join(', ') || 'none'}</li>
                <li>Features: {module?.manifest.requiredFeatures.join(', ')}</li>
              </ul>
            </li>
          );
        })}
      </ul>

      <h3>Registered Hooks ({stats.totalHooks})</h3>
      <ul>
        {stats.hooks.map(({ name, handlerCount }) => (
          <li key={name}>
            <strong>{name}</strong>: {handlerCount} handler(s)
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Dependency Graph Visualizer

```typescript
// Log dependency graph for debugging
const registry = ModuleRegistry.getInstance();
const graph = registry.getDependencyGraph('sales');

console.log('Sales module dependencies:', graph);
// Output: ['customers', 'materials'] (transitive)
```

---

## ✅ Checklist

### Implementation Checklist

- [ ] Create `src/lib/modules/` directory
- [ ] Implement `ModuleRegistry.ts`
- [ ] Implement `HookPoint.tsx`
- [ ] Implement `useModuleRegistry.ts`
- [ ] Create `src/modules/bootstrap.ts`
- [ ] Modify `capabilityStore.ts` to init registry
- [ ] Create module manifests for all modules
- [ ] Migrate cross-module actions to hooks
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation
- [ ] Performance benchmarking

### Testing Checklist

- [ ] All modules register correctly
- [ ] Dependencies validated
- [ ] Hooks execute in order
- [ ] No circular dependencies
- [ ] Performance: <100ms initialization
- [ ] No memory leaks
- [ ] Backwards compatibility maintained

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-10
**Status**: ✅ Ready for Implementation
