// Setup global para todos los tests
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

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

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

// Mock básico de heroicons - Usando React.createElement para evitar JSX
vi.mock('@heroicons/react/24/outline', () => {
  const React = require('react');
  return {
    HomeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'home-icon', className }),
    PlusIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'plus-icon', className }),
    MagnifyingGlassIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'search-icon', className }),
    AdjustmentsHorizontalIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'filter-icon', className }),
    PencilIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'pencil-icon', className }),
    TrashIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'trash-icon', className }),
    EyeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'eye-icon', className }),
    ChartBarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'chart-bar-icon', className }),
    CogIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cog-icon', className }),
    UsersIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'users-icon', className }),
    BuildingStorefrontIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'storefront-icon', className }),
    CubeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cube-icon', className }),
    DocumentTextIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'document-icon', className }),
    CalendarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'calendar-icon', className }),
    CurrencyDollarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'dollar-icon', className }),
    Cog6ToothIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cog6tooth-icon', className }),
    BellIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'bell-icon', className }),
    ArrowPathIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'refresh-icon', className }),
    DocumentArrowDownIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'download-icon', className }),
  }
})

// Mock de react-router-dom
vi.mock('react-router-dom', () => {
  const React = require('react');
  return {
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
      React.createElement('a', { href: to }, children),
    NavLink: ({ children, to }: { children: React.ReactNode, to: string }) => 
      React.createElement('a', { href: to }, children),
  }
})

// Mock de zustand stores
vi.mock('@/store/appStore', () => ({
  useAppStore: () => ({
    user: null,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/store/materialsStore', () => ({
  useMaterials: () => ({
    items: [],
    loading: false,
    error: null,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    refreshInventory: vi.fn(),
  }),
}))

// Supress console warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})