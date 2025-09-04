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

// Mock de supabase
vi.mock('@/lib/supabase/client', () => {
  const createQueryBuilder = (initialData = { data: [], error: null }) => {
    let query = Promise.resolve(initialData);
    const builder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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

// Mock de Zustand store
vi.mock('@/store/materialsStore', () => ({
  useMaterials: vi.fn()
}));

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
