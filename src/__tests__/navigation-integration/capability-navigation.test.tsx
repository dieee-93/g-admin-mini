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

  it('should activate correct modules for onsite_service capability', async () => {
    const capabilities = ['onsite_service'];
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
    expect(result.current.isModuleActive('onsite')).toBe(true);
  });

  it('should activate correct modules for delivery_shipping capability', async () => {
    const capabilities = ['delivery_shipping'];
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
    expect(result.current.isModuleActive('delivery')).toBe(true);
  });

  it('should activate correct modules for pickup_orders capability', async () => {
    const capabilities = ['pickup_orders'];
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
    expect(result.current.isModuleActive('pickup')).toBe(true);
  });

  it('should activate correct modules for membership_subscriptions capability', async () => {
    const capabilities = ['membership_subscriptions'];
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
    expect(result.current.isModuleActive('memberships')).toBe(true);
    // billing is activated by finance_recurring_invoicing which comes with membership_subscriptions
    expect(result.current.isModuleActive('billing')).toBe(true);
  });

  it('should activate correct modules for professional_services capability', async () => {
    const capabilities = ['professional_services'];
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
    expect(result.current.isModuleActive('scheduling')).toBe(true);
    expect(result.current.isModuleActive('team')).toBe(true);
    expect(result.current.isModuleActive('shift-control')).toBe(true);
  });

  it('should activate correct modules for asset_rental capability', async () => {
    const capabilities = ['asset_rental'];
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
    expect(result.current.isModuleActive('rentals')).toBe(true);
    expect(result.current.isModuleActive('assets')).toBe(true); // Assuming assets is tied to rentals or core
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
