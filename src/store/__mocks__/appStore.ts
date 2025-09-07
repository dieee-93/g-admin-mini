import { createStore } from 'zustand/vanilla';

const appStore = createStore(() => ({
  user: null,
  isLoading: false,
  error: null,
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  networkStatus: 'online',
  lastSync: null,
  pendingSyncs: 0,
  settings: {},
  
  // Mocked actions
  setUser: vi.fn(),
  logout: vi.fn(),
  toggleSidebar: vi.fn(),
  setTheme: vi.fn(),
  setLoading: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  setNetworkStatus: vi.fn(),
  updateLastSync: vi.fn(),
  setPendingSyncs: vi.fn(),
  updateSettings: vi.fn(),
  handleError: vi.fn(),
}));

export const useAppStore = vi.fn(() => appStore.getState());

// Expose setState for tests
Object.defineProperty(useAppStore, 'setState', {
  value: appStore.setState,
});

// Expose subscribe for tests
Object.defineProperty(useAppStore, 'subscribe', {
    value: appStore.subscribe,
});

// Expose getState for tests
Object.defineProperty(useAppStore, 'getState', {
    value: appStore.getState,
});
