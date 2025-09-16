/**
 * ModuleRegistry Tests for G-Admin v3.0
 * Tests module registration, dependency resolution, and health monitoring
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModuleRegistry, getModuleRegistry, resetModuleRegistry } from '../ModuleRegistry';
import type { ModuleInterface } from '../types/ModuleTypes';

// Mock console methods
const originalConsole = console;
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;

  const createTestModule = (id: string, overrides = {}): ModuleInterface => ({
    metadata: {
      id,
      name: `${id} Module`,
      version: '1.0.0'
    },
    dependencies: {
      requiredCapabilities: ['customer_management']
    },
    components: {
      MainComponent: () => null
    },
    ...overrides
  });

  beforeEach(() => {
    resetModuleRegistry();
    registry = getModuleRegistry();
  });

  afterEach(() => {
    resetModuleRegistry();
  });

  describe('Module Registration', () => {
    test('should register a valid module', () => {
      const module = createTestModule('test-module');

      expect(() => registry.register(module)).not.toThrow();
      expect(registry.hasModule('test-module')).toBe(true);
      expect(registry.getModule('test-module')).toEqual(module);
    });

    test('should prevent duplicate registration', () => {
      const module = createTestModule('duplicate-module');

      registry.register(module);
      expect(() => registry.register(module)).toThrow('Module duplicate-module is already registered');
    });

    test('should validate module metadata', () => {
      const invalidModule = createTestModule('', {
        metadata: { id: '', name: '', version: '' }
      });

      expect(() => registry.register(invalidModule)).toThrow();
    });

    test('should validate module ID format', () => {
      const invalidModule = createTestModule('InvalidModuleID', {
        metadata: { id: 'InvalidModuleID', name: 'Test', version: '1.0.0' }
      });

      expect(() => registry.register(invalidModule)).toThrow('Module ID must be in kebab-case format');
    });
  });

  describe('Module Retrieval', () => {
    test('should retrieve registered modules', () => {
      const module1 = createTestModule('module-1');
      const module2 = createTestModule('module-2');

      registry.register(module1);
      registry.register(module2);

      expect(registry.getModule('module-1')).toEqual(module1);
      expect(registry.getModule('module-2')).toEqual(module2);
      expect(registry.getModule('non-existent')).toBeNull();
    });

    test('should get all modules', () => {
      const module1 = createTestModule('module-1');
      const module2 = createTestModule('module-2');

      registry.register(module1);
      registry.register(module2);

      const allModules = registry.getAllModules();
      expect(allModules.size).toBe(2);
      expect(allModules.get('module-1')).toEqual(module1);
      expect(allModules.get('module-2')).toEqual(module2);
    });

    test('should get modules by capability', () => {
      const module1 = createTestModule('module-1', {
        dependencies: { requiredCapabilities: ['sells_products'] }
      });
      const module2 = createTestModule('module-2', {
        dependencies: { requiredCapabilities: ['customer_management'] }
      });

      registry.register(module1);
      registry.register(module2);

      const salesModules = registry.getModulesByCapability('sells_products');
      expect(salesModules).toHaveLength(1);
      expect(salesModules[0].metadata.id).toBe('module-1');
    });

    test('should get modules by tag', () => {
      const module1 = createTestModule('module-1', {
        metadata: { id: 'module-1', name: 'Module 1', version: '1.0.0', tags: ['pos', 'sales'] }
      });
      const module2 = createTestModule('module-2', {
        metadata: { id: 'module-2', name: 'Module 2', version: '1.0.0', tags: ['inventory'] }
      });

      registry.register(module1);
      registry.register(module2);

      const posModules = registry.getModulesByTag('pos');
      expect(posModules).toHaveLength(1);
      expect(posModules[0].metadata.id).toBe('module-1');
    });
  });

  describe('Module States', () => {
    test('should track loading states', () => {
      const module = createTestModule('state-module');
      registry.register(module);

      expect(registry.isLoaded('state-module')).toBe(false);
      expect(registry.isActive('state-module')).toBe(false);

      registry.setLoadingState('state-module', 'loading');
      expect(registry.isLoaded('state-module')).toBe(false);

      registry.setLoadingState('state-module', 'loaded');
      expect(registry.isLoaded('state-module')).toBe(true);
    });

    test('should handle module activation', async () => {
      const module = createTestModule('activate-module');
      registry.register(module);

      expect(registry.isActive('activate-module')).toBe(false);

      await registry.activate('activate-module');
      expect(registry.isActive('activate-module')).toBe(true);

      await registry.deactivate('activate-module');
      expect(registry.isActive('activate-module')).toBe(false);
    });
  });

  describe('Dependency Resolution', () => {
    test('should resolve dependencies correctly', () => {
      const module = createTestModule('dep-module', {
        dependencies: {
          requiredCapabilities: ['customer_management', 'sells_products'],
          dependsOn: ['base-module']
        }
      });

      registry.register(module);

      const resolution = registry.resolveDependencies('dep-module', ['customer_management']);

      expect(resolution.satisfied).toBe(false);
      expect(resolution.missingCapabilities).toContain('sells_products');
      expect(resolution.missingModules).toContain('base-module');
    });

    test('should detect capability conflicts', () => {
      const module1 = createTestModule('conflicting-module');
      const module2 = createTestModule('main-module', {
        dependencies: {
          requiredCapabilities: ['customer_management'],
          conflicts: ['conflicting-module']
        }
      });

      registry.register(module1);
      registry.register(module2);
      await registry.activate('conflicting-module');

      const resolution = registry.resolveDependencies('main-module', ['customer_management']);
      expect(resolution.conflicts).toContain('conflicting-module');
    });
  });

  describe('Module Unregistration', () => {
    test('should unregister modules', () => {
      const module = createTestModule('unregister-module');
      registry.register(module);

      expect(registry.hasModule('unregister-module')).toBe(true);
      expect(registry.unregister('unregister-module')).toBe(true);
      expect(registry.hasModule('unregister-module')).toBe(false);
      expect(registry.unregister('unregister-module')).toBe(false);
    });

    test('should deactivate before unregistering', async () => {
      const module = createTestModule('deactivate-module');
      registry.register(module);
      await registry.activate('deactivate-module');

      expect(registry.isActive('deactivate-module')).toBe(true);
      registry.unregister('deactivate-module');
      expect(registry.hasModule('deactivate-module')).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    test('should update and retrieve performance metrics', () => {
      const module = createTestModule('perf-module');
      registry.register(module);

      registry.updatePerformanceMetrics('perf-module', {
        loadTime: 500,
        initTime: 100,
        componentCount: 5
      });

      const metrics = registry.getPerformanceMetrics('perf-module');
      expect(metrics?.loadTime).toBe(500);
      expect(metrics?.initTime).toBe(100);
      expect(metrics?.componentCount).toBe(5);
    });

    test('should return null for non-existent module metrics', () => {
      const metrics = registry.getPerformanceMetrics('non-existent');
      expect(metrics).toBeNull();
    });
  });

  describe('Health Checks', () => {
    test('should perform health check on module', async () => {
      const module = createTestModule('health-module');
      registry.register(module);

      const health = await registry.performHealthCheck('health-module');
      expect(health.moduleId).toBe('health-module');
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeGreaterThan(0);
    });

    test('should detect unhealthy modules', async () => {
      const module = createTestModule('unhealthy-module');
      registry.register(module);
      registry.setLoadingState('unhealthy-module', 'error', new Error('Test error'));

      const health = await registry.performHealthCheck('unhealthy-module');
      expect(health.status).toBe('unhealthy');
      expect(health.issues).toContain('Module failed to load');
    });
  });

  describe('Statistics', () => {
    test('should provide registry statistics', () => {
      const module1 = createTestModule('stats-module-1');
      const module2 = createTestModule('stats-module-2');

      registry.register(module1);
      registry.register(module2);
      registry.setLoadingState('stats-module-1', 'loaded');
      registry.setLoadingState('stats-module-2', 'error', new Error('Test'));

      const stats = registry.getStatistics();
      expect(stats.totalModules).toBe(2);
      expect(stats.loadedModules).toBe(1);
      expect(stats.errorModules).toBe(1);
    });
  });

  describe('Event Emission', () => {
    test('should emit events on registration', () => {
      const eventSpy = vi.fn();
      registry.on('module:registered', eventSpy);

      const module = createTestModule('event-module');
      registry.register(module);

      expect(eventSpy).toHaveBeenCalledWith('event-module', module);
    });

    test('should emit events on state changes', () => {
      const loadingSpy = vi.fn();
      const loadedSpy = vi.fn();

      registry.on('module:loading', loadingSpy);
      registry.on('module:loaded', loadedSpy);

      const module = createTestModule('state-event-module');
      registry.register(module);

      registry.setLoadingState('state-event-module', 'loading');
      expect(loadingSpy).toHaveBeenCalledWith('state-event-module');

      registry.setModuleInstance('state-event-module', {});
      expect(loadedSpy).toHaveBeenCalledWith('state-event-module', {});
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same registry instance', () => {
      const registry1 = getModuleRegistry();
      const registry2 = getModuleRegistry();

      expect(registry1).toBe(registry2);
    });

    test('should reset registry instance', () => {
      const registry1 = getModuleRegistry();
      const module = createTestModule('singleton-test');
      registry1.register(module);

      resetModuleRegistry();
      const registry2 = getModuleRegistry();
      expect(registry2.hasModule('singleton-test')).toBe(false);
    });
  });
});