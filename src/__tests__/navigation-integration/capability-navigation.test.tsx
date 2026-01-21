import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { useFeatureFlags, businessProfileKeys } from '@/lib/capabilities';
import type { UserProfile } from '@/lib/capabilities';
import {
  getExpectedModulesForCapabilities,
} from '../helpers/navigation-test-utils';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        is: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            })),
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      })),
    },
  },
}));

// Helper to create UserProfile mock
function createMockUserProfile(capabilities: string[]): UserProfile {
  return {
    businessName: 'Test Business',
    businessType: 'test',
    email: 'test@example.com',
    phone: '',
    country: 'AR',
    currency: 'ARS',
    selectedCapabilities: capabilities as any[],
    selectedInfrastructure: ['single_location'] as any[],
    setupCompleted: true,
    isFirstTimeInDashboard: false,
    onboardingStep: 5,
    completedMilestones: [],
  };
}

describe('Capability → Navigation Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('should activate correct modules for physical_products capability', async () => {
    const capabilities = ['physical_products'];
    const mockProfile = createMockUserProfile(capabilities);
    const expectedModules = getExpectedModulesForCapabilities(capabilities);

    // Set business profile in query cache with correct key
    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify active modules match expected
    expect(result.current.activeModules.sort()).toEqual(expectedModules);
  });

  it('should activate correct modules for combined capabilities', async () => {
    const capabilities = ['physical_products', 'professional_services'];
    const mockProfile = createMockUserProfile(capabilities);
    const expectedModules = getExpectedModulesForCapabilities(capabilities);

    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeModules.sort()).toEqual(expectedModules);

    // Verify core modules are always included
    expect(result.current.activeModules).toContain('dashboard');
    expect(result.current.activeModules).toContain('settings');
  });

  it('should correctly report module activation status', async () => {
    const capabilities = ['physical_products'];
    const mockProfile = createMockUserProfile(capabilities);

    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Modules that SHOULD be active
    expect(result.current.isModuleActive('materials')).toBe(true);
    expect(result.current.isModuleActive('products')).toBe(true);
    expect(result.current.isModuleActive('sales')).toBe(true);

    // Modules that should NOT be active
    expect(result.current.isModuleActive('scheduling')).toBe(false);
    expect(result.current.isModuleActive('staff')).toBe(false);
  });
});
