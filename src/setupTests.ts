import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de Web APIs que no están disponibles en jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock de window.scrollTo (usado por Chakra UI y otros componentes)
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock de supabase
vi.mock('./lib/supabase/client', () => {
  const createQueryBuilder = (initialData = { data: [], error: null }) => {
    let query = Promise.resolve(initialData);
    const builder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(() => {
        query = Promise.resolve({ data: {}, error: null });
        return builder;
      }),
      then: (...args) => query.then(...args),
      catch: (...args) => query.catch(...args),
      finally: (...args) => query.finally(...args),
    };
    return builder;
  };

  const supabase = {
    from: vi.fn(() => createQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com/avatar.png' } })),
      })),
    },
  };

  return { supabase };
});

// Mock de ChakraProvider con configuración básica para Chakra UI v3
// Note: ChakraProvider v3 usa "value" prop en lugar de "theme"
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal();
  const React = await import('react');

  return {
    ...actual,
    // Keep the actual ChakraProvider from v3 - don't mock it
    // This allows tests to use defaultSystem properly
    useColorMode: vi.fn(() => ({
      colorMode: 'light',
      toggleColorMode: vi.fn(),
      setColorMode: vi.fn(),
    })),
    useColorModeValue: vi.fn((light, dark) => light),
    useTheme: vi.fn(() => ({
      colors: {},
      space: {},
      sizes: {},
    })),
  };
});

// Mock de heroicons
vi.mock('@heroicons/react/24/outline', async (importOriginal) => {
  const actual = await importOriginal()
  const React = await import('react');
  const createMockIcon = (displayName) => {
    const MockIcon = (props) => React.createElement('svg', { ...props, 'data-testid': `${displayName}-icon` });
    MockIcon.displayName = displayName;
    return MockIcon;
  }
  const mockedIcons = Object.keys(actual).reduce((acc, key) => {
    acc[key] = createMockIcon(key);
    return acc;
  }, {});

  return {
    ...mockedIcons
  };
});

// Mock de Navigation Context
vi.mock('./contexts/NavigationContext', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    NavigationProvider: ({ children, value }: any) => children,
    useNavigation: vi.fn(() => ({
      currentModule: 'staff',
      setCurrentModule: vi.fn(),
      quickActions: [],
      setQuickActions: vi.fn(),
      breadcrumbs: [],
      setBreadcrumbs: vi.fn(),
    }))
  };
});

// Mock de Zustand store
vi.mock('./store/materialsStore', () => ({
  useMaterials: vi.fn()
}));

vi.mock('./store/staffStore', () => {
  const { create: actualCreate } = vi.importActual('zustand');
  const store = actualCreate(vi.importActual('./store/staffStore').useTeamStore);
  return {
    useTeamStore: vi.fn((selector) => store(selector)),
  };
});

// Mock de IndexedDB para tests offline
const mockIDBDatabase = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => ({ onsuccess: null, onerror: null })),
      get: vi.fn(() => ({ onsuccess: null, onerror: null })),
      put: vi.fn(() => ({ onsuccess: null, onerror: null })),
      delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
      clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
      createIndex: vi.fn(),
      index: vi.fn(() => ({
        get: vi.fn(() => ({ onsuccess: null, onerror: null }))
      }))
    }))
  })),
  close: vi.fn()
}

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: mockIDBDatabase
}

global.indexedDB = {
  open: vi.fn(() => mockIDBRequest),
  deleteDatabase: vi.fn(() => mockIDBRequest),
  databases: vi.fn(() => Promise.resolve([]))
} as any

// ============================================================================
// Mock de localStorage para Zustand persist middleware
// ============================================================================
// CRITICAL: Zustand stores use persist middleware which requires localStorage.
// Without this mock, tests hang indefinitely waiting for localStorage operations.

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});
