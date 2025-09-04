import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { errorHandler } from '@/lib/error-handling';

export interface AppState {
  // User session
  user: {
    id: string | null;
    email: string | null;
    role: 'admin' | 'manager' | 'employee' | null;
    permissions: string[];
  };

  // UI State
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    loading: boolean;
    notifications: Notification[];
  };

  // Network state
  network: {
    isOnline: boolean;
    lastSyncTimestamp: Date | null;
    pendingSyncs: number;
  };

  // App settings
  settings: {
    businessName: string;
    currency: string;
    timezone: string;
    language: 'es' | 'en';
  };

  // Actions
  setUser: (user: Partial<AppState['user']>) => void;
  logout: () => void;
  
  toggleSidebar: () => void;
  setTheme: (theme: AppState['ui']['theme']) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  
  setNetworkStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  setPendingSyncs: (count: number) => void;
  
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Error handling
  handleError: (error: Error, context?: Record<string, any>) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
}

export const appStoreInitializer = (set, get) => ({
        // Initial state
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
          isOnline: navigator.onLine,
          lastSyncTimestamp: null,
          pendingSyncs: 0
        },

        settings: {
          businessName: 'Mi Negocio',
          currency: 'ARS',
          timezone: 'America/Argentina/Buenos_Aires',
          language: 'es'
        },

        // User actions
        setUser: (userData) => {
          set((state) => ({
            user: { ...state.user, ...userData }
          }), false, 'setUser');
        },

        logout: () => {
          set({
            user: {
              id: null,
              email: null,
              role: null,
              permissions: []
            }
          }, false, 'logout');
        },

        // UI actions
        toggleSidebar: () => {
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
          }), false, 'toggleSidebar');
        },

        setTheme: (theme) => {
          set((state) => ({
            ui: { ...state.ui, theme }
          }), false, 'setTheme');
        },

        setLoading: (loading) => {
          set((state) => ({
            ui: { ...state.ui, loading }
          }), false, 'setLoading');
        },

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date()
          };

          set((state) => ({
            ui: {
              ...state.ui,
              notifications: [...(state.ui.notifications || []), newNotification]
            }
          }), false, 'addNotification');

          // Auto-remove notification after 5 seconds if autoClose is true
          if (notification.autoClose !== false) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, 5000);
          }
        },

        removeNotification: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: (state.ui.notifications || []).filter(n => n.id !== id)
            }
          }), false, 'removeNotification');
        },

        // Network actions
        setNetworkStatus: (isOnline) => {
          set((state) => ({
            network: { ...state.network, isOnline }
          }), false, 'setNetworkStatus');
        },

        updateLastSync: () => {
          set((state) => ({
            network: { ...state.network, lastSyncTimestamp: new Date() }
          }), false, 'updateLastSync');
        },

        setPendingSyncs: (count) => {
          set((state) => ({
            network: { ...state.network, pendingSyncs: count }
          }), false, 'setPendingSyncs');
        },

        // Settings actions
        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }), false, 'updateSettings');
        },

        // Error handling
        handleError: (error, context) => {
          const appError = errorHandler.handle(error, context);
          
          get().addNotification({
            type: 'error',
            title: 'Error',
            message: appError.message,
            autoClose: appError.severity === 'low'
          });
        }
      });

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      appStoreInitializer,
      {
        name: 'g-mini-app-storage',
        partialize: (state) => ({
          user: state.user,
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            theme: state.ui.theme
          },
          settings: state.settings
        })
      }
    ),
    {
      name: 'AppStore'
    }
  )
);

// Network status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setNetworkStatus(true);
  });

  window.addEventListener('offline', () => {
    useAppStore.getState().setNetworkStatus(false);
  });
}