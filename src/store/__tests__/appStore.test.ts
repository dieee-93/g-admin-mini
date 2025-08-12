import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../appStore';

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});

// Mock navigator
Object.defineProperty(globalThis, 'navigator', {
  value: {
    onLine: true
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
});

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      user: {
        id: null,
        email: null,
        role: null,
        permissions: []
      },
      ui: {
        sidebarCollapsed: false,
        theme: 'system',
        loading: false,
        notifications: []
      },
      network: {
        isOnline: true,
        lastSyncTimestamp: null,
        pendingSyncs: 0
      },
      settings: {
        businessName: 'Mi Negocio',
        currency: 'ARS',
        timezone: 'America/Argentina/Buenos_Aires',
        language: 'es'
      }
    });
    vi.clearAllMocks();
  });

  describe('User Management', () => {
    it('should set user data', () => {
      const { setUser } = useAppStore.getState();
      
      setUser({
        id: '123',
        email: 'test@example.com',
        role: 'admin'
      });

      const { user } = useAppStore.getState();
      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('admin');
    });

    it('should logout user', () => {
      const { setUser, logout } = useAppStore.getState();
      
      // Set user first
      setUser({
        id: '123',
        email: 'test@example.com',
        role: 'admin'
      });

      // Then logout
      logout();

      const { user } = useAppStore.getState();
      expect(user.id).toBeNull();
      expect(user.email).toBeNull();
      expect(user.role).toBeNull();
      expect(user.permissions).toEqual([]);
    });
  });

  describe('UI State', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useAppStore.getState();
      
      expect(useAppStore.getState().ui.sidebarCollapsed).toBe(false);
      
      toggleSidebar();
      expect(useAppStore.getState().ui.sidebarCollapsed).toBe(true);
      
      toggleSidebar();
      expect(useAppStore.getState().ui.sidebarCollapsed).toBe(false);
    });

    it('should set theme', () => {
      const { setTheme } = useAppStore.getState();
      
      setTheme('dark');
      expect(useAppStore.getState().ui.theme).toBe('dark');
      
      setTheme('light');
      expect(useAppStore.getState().ui.theme).toBe('light');
    });

    it('should set loading state', () => {
      const { setLoading } = useAppStore.getState();
      
      setLoading(true);
      expect(useAppStore.getState().ui.loading).toBe(true);
      
      setLoading(false);
      expect(useAppStore.getState().ui.loading).toBe(false);
    });

    it('should add notifications', () => {
      const { addNotification } = useAppStore.getState();
      
      addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test message',
        autoClose: false
      });

      const { ui } = useAppStore.getState();
      expect(ui.notifications).toHaveLength(1);
      expect(ui.notifications[0].title).toBe('Test');
      expect(ui.notifications[0].type).toBe('success');
      expect(ui.notifications[0].id).toBe('test-uuid-123');
    });

    it('should remove notifications', () => {
      const { addNotification, removeNotification } = useAppStore.getState();
      
      addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message'
      });

      const notificationId = useAppStore.getState().ui.notifications[0].id;
      removeNotification(notificationId);

      expect(useAppStore.getState().ui.notifications).toHaveLength(0);
    });
  });

  describe('Network State', () => {
    it('should set network status', () => {
      const { setNetworkStatus } = useAppStore.getState();
      
      setNetworkStatus(false);
      expect(useAppStore.getState().network.isOnline).toBe(false);
      
      setNetworkStatus(true);
      expect(useAppStore.getState().network.isOnline).toBe(true);
    });

    it('should update last sync timestamp', () => {
      const { updateLastSync } = useAppStore.getState();
      
      const beforeSync = useAppStore.getState().network.lastSyncTimestamp;
      expect(beforeSync).toBeNull();
      
      updateLastSync();
      
      const afterSync = useAppStore.getState().network.lastSyncTimestamp;
      expect(afterSync).toBeInstanceOf(Date);
    });

    it('should set pending syncs count', () => {
      const { setPendingSyncs } = useAppStore.getState();
      
      setPendingSyncs(5);
      expect(useAppStore.getState().network.pendingSyncs).toBe(5);
      
      setPendingSyncs(0);
      expect(useAppStore.getState().network.pendingSyncs).toBe(0);
    });
  });

  describe('Settings', () => {
    it('should update settings', () => {
      const { updateSettings } = useAppStore.getState();
      
      updateSettings({
        businessName: 'New Business',
        currency: 'USD'
      });

      const { settings } = useAppStore.getState();
      expect(settings.businessName).toBe('New Business');
      expect(settings.currency).toBe('USD');
      expect(settings.timezone).toBe('America/Argentina/Buenos_Aires'); // Should remain unchanged
    });
  });

  describe('Error Handling', () => {
    it('should handle errors and add notifications', () => {
      const { handleError } = useAppStore.getState();
      
      const testError = new Error('Test error');
      handleError(testError, { context: 'test' });

      const { ui } = useAppStore.getState();
      expect(ui.notifications).toHaveLength(1);
      expect(ui.notifications[0].type).toBe('error');
      expect(ui.notifications[0].title).toBe('Error');
    });
  });
});