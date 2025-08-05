// src/test/setup.ts
import '@testing-library/jest-dom'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn()
  })),
  rpc: vi.fn(),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn()
  }))
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock notifications
vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChartBarIcon: 'ChartBarIcon',
  UsersIcon: 'UsersIcon',
  ExclamationTriangleIcon: 'ExclamationTriangleIcon',
  TrophyIcon: 'TrophyIcon',
  ArrowTrendingUpIcon: 'ArrowTrendingUpIcon',
  ArrowPathIcon: 'ArrowPathIcon',
  FireIcon: 'FireIcon',
  ShieldCheckIcon: 'ShieldCheckIcon'
}))

// Global test utilities
global.mockSupabase = mockSupabase