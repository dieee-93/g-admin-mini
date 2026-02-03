/**
 * Unit tests for Service Worker Registration
 *
 * Tests the registration logic, state management, and fallback behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceWorkerManager } from '../ServiceWorkerRegistration';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({} as ServiceWorkerRegistration),
  controller: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

describe('ServiceWorkerManager', () => {
  let manager: ServiceWorkerManager;
  let originalServiceWorker: any;

  beforeEach(() => {
    manager = new ServiceWorkerManager();

    // Save original
    originalServiceWorker = (navigator as any).serviceWorker;

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
        configurable: true
      });
    } else {
      delete (navigator as any).serviceWorker;
    }
  });

  describe('isSupported', () => {
    it('should return true when Service Workers are supported', () => {
      expect(manager.isSupported()).toBe(true);
    });

    it('should return false when Service Workers are not supported', () => {
      delete (navigator as any).serviceWorker;

      const unsupportedManager = new ServiceWorkerManager();
      expect(unsupportedManager.isSupported()).toBe(false);
    });
  });

  describe('isBackgroundSyncSupported', () => {
    it('should return true when Background Sync API is supported', () => {
      // Mock ServiceWorkerRegistration.prototype.sync
      Object.defineProperty(ServiceWorkerRegistration.prototype, 'sync', {
        value: {},
        writable: true,
        configurable: true
      });

      expect(manager.isBackgroundSyncSupported()).toBe(true);
    });

    it('should return false when Background Sync API is not supported', () => {
      // Remove sync property
      delete (ServiceWorkerRegistration.prototype as any).sync;

      expect(manager.isBackgroundSyncSupported()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register Service Worker successfully', async () => {
      const mockRegistration = {
        scope: '/test-scope/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn()
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      const registration = await manager.register('/test-sw.js');

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/test-sw.js', undefined);
      expect(registration).toBe(mockRegistration);
      expect(manager.getStatus().state).toBe('active');
    });

    it('should handle registration failure', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      const registration = await manager.register('/test-sw.js');

      expect(registration).toBeNull();
      expect(manager.getStatus().state).toBe('error');
      expect(manager.getStatus().error).toBe('Registration failed');
    });

    it('should return null if Service Workers not supported', async () => {
      delete (navigator as any).serviceWorker;

      const unsupportedManager = new ServiceWorkerManager();
      const registration = await unsupportedManager.register();

      expect(registration).toBeNull();
      expect(unsupportedManager.getStatus().state).toBe('unsupported');
    });

    it('should accept custom options', async () => {
      const mockRegistration = {
        scope: '/custom-scope/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn()
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      const options = { scope: '/custom-scope/' };
      await manager.register('/sw.js', options);

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', options);
    });
  });

  describe('unregister', () => {
    it('should unregister Service Worker successfully', async () => {
      const mockRegistration = {
        scope: '/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn(),
        unregister: vi.fn().mockResolvedValue(true)
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await manager.register();
      const success = await manager.unregister();

      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(success).toBe(true);
      expect(manager.getStatus().state).toBe('unsupported');
    });

    it('should return false if no registration to unregister', async () => {
      const success = await manager.unregister();

      expect(success).toBe(false);
    });
  });

  describe('update', () => {
    it('should check for Service Worker updates', async () => {
      const mockRegistration = {
        scope: '/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined)
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await manager.register();
      await manager.update();

      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should handle update failure gracefully', async () => {
      const mockRegistration = {
        scope: '/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn(),
        update: vi.fn().mockRejectedValue(new Error('Update failed'))
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await manager.register();
      await expect(manager.update()).resolves.not.toThrow();
    });
  });

  describe('event system', () => {
    it('should emit statechange events', async () => {
      const mockRegistration = {
        scope: '/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn()
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      const callback = vi.fn();
      manager.on('statechange', callback);

      await manager.register();

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'active',
          registration: mockRegistration
        })
      );
    });

    it('should allow unsubscribing from events', async () => {
      const callback = vi.fn();

      manager.on('statechange', callback);
      manager.off('statechange', callback);

      const mockRegistration = {
        scope: '/',
        active: { state: 'active' },
        installing: null,
        waiting: null,
        addEventListener: vi.fn()
      } as any;

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await manager.register();

      // Callback should not be called after unsubscribing
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return current status', () => {
      const status = manager.getStatus();

      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('registration');
      expect(status).toHaveProperty('isBackgroundSyncSupported');
    });

    it('should return copy of status (not reference)', () => {
      const status1 = manager.getStatus();
      const status2 = manager.getStatus();

      expect(status1).not.toBe(status2);
      expect(status1).toEqual(status2);
    });
  });
});
