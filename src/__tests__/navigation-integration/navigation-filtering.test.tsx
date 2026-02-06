import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModuleNavigation } from '@/lib/modules/useModuleNavigation';

// Create a mutable active modules array
let mockActiveModules: string[] = [];

// Mock dependencies
vi.mock('@/lib/modules/ModuleRegistry', () => {
  const mockModules = [
    {
      manifest: {
        id: 'sales',
        name: 'Sales',
        permissionModule: 'sales',
        metadata: {
          navigation: {
            route: '/admin/operations/sales',
            icon: 'CurrencyDollarIcon',
            domain: 'operations',
            color: 'green',
          },
        },
      },
    },
    {
      manifest: {
        id: 'materials',
        name: 'Materials',
        permissionModule: 'materials',
        metadata: {
          navigation: {
            route: '/admin/supply-chain/materials',
            icon: 'CubeIcon',
            domain: 'supply-chain',
            color: 'blue',
          },
        },
      },
    },
    {
      manifest: {
        id: 'scheduling',
        name: 'Scheduling',
        permissionModule: 'scheduling',
        metadata: {
          navigation: {
            route: '/admin/resources/scheduling',
            icon: 'CalendarIcon',
            domain: 'resources',
            color: 'purple',
          },
        },
      },
    },
    {
      manifest: {
        id: 'background-service',
        name: 'Background Service',
        // No navigation metadata - should be filtered out
      },
    },
  ];

  return {
    ModuleRegistry: {
      getInstance: () => ({
        getAll: () => mockModules,
      }),
    },
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    canAccessModule: vi.fn(() => true),
    isAuthenticated: true,
  }),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => selector({ modulesInitialized: true }),
}));

vi.mock('@/contexts/FeatureFlagContext', () => ({
  useFeatureFlags: () => ({
    activeModules: mockActiveModules,
    isLoading: false,
    isModuleActive: (id: string) => mockActiveModules.includes(id),
  }),
}));

vi.mock('@/config/FeatureRegistry', () => ({
  getDynamicModuleFeatureMap: () => ({
    sales: { requiredFeatures: [], alwaysActive: false },
    materials: { requiredFeatures: [], alwaysActive: false },
    scheduling: { requiredFeatures: [], alwaysActive: false },
    dashboard: { alwaysActive: true },
  }),
}));

vi.mock('@/lib/logging', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    performance: vi.fn(),
  },
}));

vi.mock('@/store/capabilityStore', () => ({
  useCapabilityStore: (selector: any) =>
    selector({ getActiveModules: () => mockActiveModules }),
}));

describe('Navigation Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModules = []; // Reset
  });

  it('should only show navigation for active modules', async () => {
    // Set active modules
    mockActiveModules = ['sales', 'materials', 'products', 'dashboard'];

    const { result } = renderHook(() => useModuleNavigation());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const moduleIds = result.current.map((m) => m.id);

    // Should include active modules
    expect(moduleIds).toContain('sales');
    expect(moduleIds).toContain('materials');

    // Should NOT include inactive modules
    expect(moduleIds).not.toContain('scheduling');
  });

  it('should exclude modules without navigation metadata', async () => {
    // Set active modules including one without navigation metadata
    mockActiveModules = ['sales', 'materials', 'background-service'];

    const { result } = renderHook(() => useModuleNavigation());

    await waitFor(() => {
      const allHaveNavigation = result.current.every((m) => m.path && m.icon);
      expect(allHaveNavigation).toBe(true);
    });

    const moduleIds = result.current.map((m) => m.id);

    // background-service has no navigation metadata, should be excluded
    expect(moduleIds).not.toContain('background-service');
  });

  it('should return modules with correct navigation structure', async () => {
    // Set active modules
    mockActiveModules = ['sales'];

    const { result } = renderHook(() => useModuleNavigation());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const salesModule = result.current.find((m) => m.id === 'sales');

    if (salesModule) {
      expect(salesModule).toMatchObject({
        id: 'sales',
        title: 'Sales',
        path: '/admin/operations/sales',
        domain: 'operations',
        color: 'green',
      });
      expect(salesModule.icon).toBeDefined();
    }
  });
});
