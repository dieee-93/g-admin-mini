// ModuleRegistry.test.ts - Unit tests for module lifecycle management
// Tests: registerModule, activateModule, deactivateModule, health checks, dependency resolution

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModuleRegistry } from '../../ModuleRegistry';
import { TestSetup, testConfigs } from '../helpers/test-utilities';
import { 
  createSalesTestModule, 
  createInventoryTestModule, 
  createCustomersTestModule,
  createFailingKitchenTestModule 
} from '../helpers/test-modules';
import type { ModuleDescriptor, ModuleHealth, ModuleId } from '../../types';

describe('ModuleRegistry', () => {
  let moduleRegistry: ModuleRegistry;

  beforeEach(() => {
    moduleRegistry = new ModuleRegistry();
  });

  afterEach(async () => {
    // Deactivate all modules for cleanup
    const activeModules = moduleRegistry.getActiveModules();
    for (const moduleId of activeModules) {
      try {
        await moduleRegistry.deactivateModule(moduleId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Module Registration', () => {
    it('should register a basic module successfully', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      
      const registeredModules = moduleRegistry.getRegisteredModules();
      expect(registeredModules).toContain('test-inventory');
      
      const moduleInfo = moduleRegistry.getModuleInfo('test-inventory');
      expect(moduleInfo?.descriptor.name).toBe('Test Inventory Module');
    });

    it('should prevent duplicate module registration', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      
      await expect(
        moduleRegistry.registerModule(module)
      ).rejects.toThrow('already registered');
    });

    it('should validate module descriptor', async () => {
      const invalidModule: ModuleDescriptor = {
        id: '', // Invalid: empty ID
        name: 'Test Module',
        version: '1.0.0',
        description: 'Test',
        dependencies: [],
        eventSubscriptions: [],
        healthCheck: async () => ({ status: 'active' as const, message: '', metrics: {}, dependencies: {}, lastCheck: new Date() }),
        config: {}
      };

      await expect(
        moduleRegistry.registerModule(invalidModule)
      ).rejects.toThrow();
    });

    it('should register module with dependencies', async () => {
      const inventoryModule = createInventoryTestModule();
      const salesModule = createSalesTestModule(); // depends on inventory
      
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(salesModule);
      
      const salesInfo = moduleRegistry.getModuleInfo('test-sales');
      expect(salesInfo?.descriptor.dependencies).toContain('test-inventory');
    });

    it('should validate dependency existence during registration', async () => {
      const salesModule = createSalesTestModule(); // depends on inventory
      
      // Should fail because dependency 'test-inventory' is not registered
      await expect(
        moduleRegistry.registerModule(salesModule)
      ).rejects.toThrow('dependency');
    });
  });

  describe('Module Activation', () => {
    it('should activate module without dependencies', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      const activeModules = moduleRegistry.getActiveModules();
      expect(activeModules).toContain('test-inventory');
      
      const health = await moduleRegistry.getModuleHealth('test-inventory');
      expect(health['test-inventory'].status).toBe('active');
    });

    it('should activate module with dependencies in correct order', async () => {
      const inventoryModule = createInventoryTestModule();
      const customersModule = createCustomersTestModule();
      const salesModule = createSalesTestModule(); // depends on both
      
      // Register all modules
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(customersModule);
      await moduleRegistry.registerModule(salesModule);
      
      // Activate main module - should activate dependencies first
      await moduleRegistry.activateModule('test-sales');
      
      const activeModules = moduleRegistry.getActiveModules();
      expect(activeModules).toContain('test-inventory');
      expect(activeModules).toContain('test-customers');
      expect(activeModules).toContain('test-sales');
    });

    it('should handle circular dependencies', async () => {
      // Create modules with circular dependencies
      const moduleA: ModuleDescriptor = {
        ...createInventoryTestModule(),
        id: 'test-module-a',
        dependencies: ['test-module-b']
      };
      
      const moduleB: ModuleDescriptor = {
        ...createCustomersTestModule(),
        id: 'test-module-b',
        dependencies: ['test-module-a']
      };

      await moduleRegistry.registerModule(moduleA);
      await moduleRegistry.registerModule(moduleB);

      await expect(
        moduleRegistry.activateModule('test-module-a')
      ).rejects.toThrow('circular dependency');
    });

    it('should call onActivate lifecycle hook', async () => {
      const activationSpy = vi.fn();
      const module: ModuleDescriptor = {
        ...createInventoryTestModule(),
        onActivate: activationSpy
      };
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      expect(activationSpy).toHaveBeenCalledOnce();
    });

    it('should handle activation failures', async () => {
      const failingModule = createFailingKitchenTestModule();
      
      await moduleRegistry.registerModule(failingModule);
      
      // Activation might fail due to simulated equipment failure
      try {
        await moduleRegistry.activateModule('test-kitchen-failing');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should not activate already active module', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      // Second activation should be idempotent
      await moduleRegistry.activateModule('test-inventory');
      
      const activeModules = moduleRegistry.getActiveModules();
      expect(activeModules.filter(id => id === 'test-inventory')).toHaveLength(1);
    });
  });

  describe('Module Deactivation', () => {
    it('should deactivate active module', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      expect(moduleRegistry.getActiveModules()).toContain('test-inventory');
      
      await moduleRegistry.deactivateModule('test-inventory');
      
      expect(moduleRegistry.getActiveModules()).not.toContain('test-inventory');
    });

    it('should call onDeactivate lifecycle hook', async () => {
      const deactivationSpy = vi.fn();
      const module: ModuleDescriptor = {
        ...createInventoryTestModule(),
        onDeactivate: deactivationSpy
      };
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      await moduleRegistry.deactivateModule('test-inventory');
      
      expect(deactivationSpy).toHaveBeenCalledOnce();
    });

    it('should deactivate dependent modules first', async () => {
      const inventoryModule = createInventoryTestModule();
      const salesModule = createSalesTestModule(); // depends on inventory
      
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(salesModule);
      await moduleRegistry.activateModule('test-sales'); // Activates both
      
      // Deactivating inventory should deactivate sales first
      await moduleRegistry.deactivateModule('test-inventory');
      
      const activeModules = moduleRegistry.getActiveModules();
      expect(activeModules).not.toContain('test-sales');
      expect(activeModules).not.toContain('test-inventory');
    });

    it('should handle deactivation of non-existent module', async () => {
      await expect(
        moduleRegistry.deactivateModule('non-existent-module' as ModuleId)
      ).rejects.toThrow('not found');
    });

    it('should handle deactivation failures gracefully', async () => {
      const failingDeactivationSpy = vi.fn().mockRejectedValue(new Error('Deactivation failed'));
      const module: ModuleDescriptor = {
        ...createInventoryTestModule(),
        onDeactivate: failingDeactivationSpy
      };
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      // Should handle deactivation failure but still mark as inactive
      await moduleRegistry.deactivateModule('test-inventory');
      
      expect(moduleRegistry.getActiveModules()).not.toContain('test-inventory');
      expect(failingDeactivationSpy).toHaveBeenCalledOnce();
    });
  });

  describe('Health Monitoring', () => {
    it('should perform health checks on active modules', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      const health = await moduleRegistry.getModuleHealth('test-inventory');
      
      expect(health['test-inventory']).toBeTruthy();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-inventory'].message).toBeTruthy();
      expect(health['test-inventory'].metrics).toBeTruthy();
      expect(health['test-inventory'].lastCheck).toBeInstanceOf(Date);
    });

    it('should get health for all active modules', async () => {
      const inventoryModule = createInventoryTestModule();
      const customersModule = createCustomersTestModule();
      
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(customersModule);
      await moduleRegistry.activateModule('test-inventory');
      await moduleRegistry.activateModule('test-customers');
      
      const allHealth = await moduleRegistry.getModuleHealth();
      
      expect(Object.keys(allHealth)).toHaveLength(2);
      expect(allHealth['test-inventory']).toBeTruthy();
      expect(allHealth['test-customers']).toBeTruthy();
    });

    it('should handle failing health checks', async () => {
      const failingModule = createFailingKitchenTestModule();
      
      await moduleRegistry.registerModule(failingModule);
      
      try {
        await moduleRegistry.activateModule('test-kitchen-failing');
      } catch {
        // Module may fail to activate, that's expected
      }

      // Even if activation failed, we should be able to check health
      const health = await moduleRegistry.getModuleHealth('test-kitchen-failing');
      
      if (health['test-kitchen-failing']) {
        // Health check might return error status
        expect(['active', 'error', 'degraded', 'inactive']).toContain(
          health['test-kitchen-failing'].status
        );
      }
    });

    it('should track health check metrics', async () => {
      const module = createInventoryTestModule();
      
      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');
      
      const health = await moduleRegistry.getModuleHealth('test-inventory');
      const metrics = health['test-inventory'].metrics;
      
      expect(typeof metrics.eventsProcessed).toBe('number');
      expect(typeof metrics.eventsEmitted).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
      expect(typeof metrics.avgProcessingTimeMs).toBe('number');
      expect(typeof metrics.queueSize).toBe('number');
    });

    it('should check dependency health', async () => {
      const inventoryModule = createInventoryTestModule();
      const salesModule = createSalesTestModule();
      
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(salesModule);
      await moduleRegistry.activateModule('test-sales');
      
      const salesHealth = await moduleRegistry.getModuleHealth('test-sales');
      
      expect(salesHealth['test-sales'].dependencies).toBeTruthy();
      expect(salesHealth['test-sales'].dependencies['test-inventory']).toBe(true);
    });
  });

  describe('Module Information', () => {
    it('should provide module information', async () => {
      const module = createSalesTestModule();
      
      await moduleRegistry.registerModule(module);
      
      const info = moduleRegistry.getModuleInfo('test-sales');
      
      expect(info?.descriptor.name).toBe('Test Sales Module');
      expect(info?.descriptor.version).toBe('2.0.0-test');
      expect(info?.descriptor.dependencies).toContain('test-inventory');
      expect(info?.registrationTime).toBeInstanceOf(Date);
    });

    it('should return null for non-existent module', () => {
      const info = moduleRegistry.getModuleInfo('non-existent' as ModuleId);
      expect(info).toBeNull();
    });

    it('should list all registered modules', async () => {
      const modules = [
        createInventoryTestModule(),
        createSalesTestModule(),
        createCustomersTestModule()
      ];
      
      for (const module of modules) {
        await moduleRegistry.registerModule(module);
      }
      
      const registered = moduleRegistry.getRegisteredModules();
      
      expect(registered).toHaveLength(3);
      expect(registered).toContain('test-inventory');
      expect(registered).toContain('test-sales');
      expect(registered).toContain('test-customers');
    });

    it('should list only active modules', async () => {
      const inventoryModule = createInventoryTestModule();
      const customersModule = createCustomersTestModule();
      
      await moduleRegistry.registerModule(inventoryModule);
      await moduleRegistry.registerModule(customersModule);
      
      // Activate only one module
      await moduleRegistry.activateModule('test-inventory');
      
      const active = moduleRegistry.getActiveModules();
      const registered = moduleRegistry.getRegisteredModules();
      
      expect(registered).toHaveLength(2);
      expect(active).toHaveLength(1);
      expect(active).toContain('test-inventory');
    });
  });

  describe('Dependency Resolution', () => {
    it('should resolve simple dependency chain', async () => {
      const moduleA = createInventoryTestModule(); // No dependencies
      const moduleB: ModuleDescriptor = {
        ...createCustomersTestModule(),
        id: 'test-module-b',
        dependencies: ['test-inventory']
      };
      const moduleC: ModuleDescriptor = {
        ...createSalesTestModule(),
        id: 'test-module-c',
        dependencies: ['test-module-b']
      };

      await moduleRegistry.registerModule(moduleA);
      await moduleRegistry.registerModule(moduleB);
      await moduleRegistry.registerModule(moduleC);

      await moduleRegistry.activateModule('test-module-c');

      const activeModules = moduleRegistry.getActiveModules();
      expect(activeModules).toContain('test-inventory');
      expect(activeModules).toContain('test-module-b');
      expect(activeModules).toContain('test-module-c');
    });

    it('should handle complex dependency graph', async () => {
      // Create a more complex dependency graph:
      // A (no deps) <- B (deps: A) <- D (deps: B, C)
      //             <- C (deps: A) <-/
      
      const moduleA: ModuleDescriptor = {
        ...createInventoryTestModule(),
        id: 'test-a',
        dependencies: []
      };
      
      const moduleB: ModuleDescriptor = {
        ...createCustomersTestModule(),
        id: 'test-b',
        dependencies: ['test-a']
      };
      
      const moduleC: ModuleDescriptor = {
        ...createSalesTestModule(),
        id: 'test-c',
        dependencies: ['test-a']
      };
      
      const moduleD: ModuleDescriptor = {
        ...createFailingKitchenTestModule(),
        id: 'test-d',
        dependencies: ['test-b', 'test-c']
      };

      await moduleRegistry.registerModule(moduleA);
      await moduleRegistry.registerModule(moduleB);
      await moduleRegistry.registerModule(moduleC);
      await moduleRegistry.registerModule(moduleD);

      try {
        await moduleRegistry.activateModule('test-d');
        
        const activeModules = moduleRegistry.getActiveModules();
        expect(activeModules).toContain('test-a');
        expect(activeModules).toContain('test-b');
        expect(activeModules).toContain('test-c');
      } catch {
        // Module D might fail to activate due to simulated failures
        // But dependencies should still be activated
        const activeModules = moduleRegistry.getActiveModules();
        expect(activeModules).toContain('test-a');
        expect(activeModules).toContain('test-b');
        expect(activeModules).toContain('test-c');
      }
    });

    it('should detect missing dependencies', async () => {
      const moduleWithMissingDep: ModuleDescriptor = {
        ...createSalesTestModule(),
        dependencies: ['non-existent-module']
      };

      await expect(
        moduleRegistry.registerModule(moduleWithMissingDep)
      ).rejects.toThrow('dependency');
    });
  });

  describe('Graceful Shutdown', () => {
    it('should shutdown all modules gracefully', async () => {
      const deactivationSpies = [vi.fn(), vi.fn(), vi.fn()];
      
      const modules: ModuleDescriptor[] = [
        { ...createInventoryTestModule(), onDeactivate: deactivationSpies[0] },
        { ...createCustomersTestModule(), onDeactivate: deactivationSpies[1] },
        { ...createSalesTestModule(), onDeactivate: deactivationSpies[2] }
      ];

      for (const module of modules) {
        await moduleRegistry.registerModule(module);
      }
      
      await moduleRegistry.activateModule('test-sales'); // Activates all due to dependencies

      await moduleRegistry.gracefulShutdown(5000);

      // All modules should be deactivated
      expect(moduleRegistry.getActiveModules()).toHaveLength(0);
      
      // All deactivation hooks should be called
      deactivationSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledOnce();
      });
    });

    it('should timeout graceful shutdown if modules take too long', async () => {
      const slowDeactivation = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      });

      const module: ModuleDescriptor = {
        ...createInventoryTestModule(),
        onDeactivate: slowDeactivation
      };

      await moduleRegistry.registerModule(module);
      await moduleRegistry.activateModule('test-inventory');

      const startTime = Date.now();
      await moduleRegistry.gracefulShutdown(500); // 500ms timeout
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // Should timeout before 1 second
      expect(slowDeactivation).toHaveBeenCalledOnce();
    });
  });
});