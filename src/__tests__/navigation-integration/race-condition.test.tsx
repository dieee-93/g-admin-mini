import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModuleNavigation } from '@/lib/modules/useModuleNavigation';

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
                        icon: 'CurrencyDollarIcon',
                        color: 'teal',
                        route: '/admin/sales',
                        domain: 'operations'
                    }
                },
                depends: []
            }
        }
    ];
    return {
        ModuleRegistry: {
            getInstance: () => ({
                getAll: () => mockModules,
                get: (id: string) => mockModules.find(m => m.manifest.id === id)
            })
        }
    };
});

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        user: { role: 'ADMIN' },
        canAccessModule: () => true
    })
}));

// Mock FeatureFlagContext
vi.mock('@/contexts/FeatureFlagContext', () => ({
    useFeatureFlags: () => ({
        activeModules: ['sales'], // Sales is active
        isLoading: false
    })
}));

// Mutable store mock
let mockStoreState = {
    modulesInitialized: false
};

vi.mock('@/store/appStore', () => ({
    useAppStore: (selector: any) => selector(mockStoreState)
}));

vi.mock('@/lib/logging', () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        performance: vi.fn()
    }
}));

describe('Migration Race Condition', () => {
    beforeEach(() => {
        // Reset store state
        mockStoreState = { modulesInitialized: false };
        vi.clearAllMocks();
    });

    it('should start with empty navigation and update when initialized', async () => {
        const { result, rerender } = renderHook(() => useModuleNavigation());

        // 1. Initially empty because modulesInitialized is false
        expect(result.current).toEqual([]);

        console.log('🔄 Simulating initialization...');

        // 2. Set initialized to true
        mockStoreState = { modulesInitialized: true };

        // Force re-render (since our mock store doesn't subscribe, we rely on React re-render or the hook re-running)
        // In real app, Zustand triggers re-render. Here renderHook might need a nudge if we only mock selector.
        // However, useAppStore is usually a hook. If we mock it as a function returning value, it won't trigger update.
        // We need to simulate the hook return value changing.

        rerender();

        // 3. Should now have modules
        await waitFor(() => {
            expect(result.current.length).toBeGreaterThan(0);
            expect(result.current[0].id).toBe('sales');
        });
    });
});
