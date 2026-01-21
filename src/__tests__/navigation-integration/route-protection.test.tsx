import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { Provider as ChakraProvider } from '@/shared/ui/provider';
import { businessProfileKeys } from '@/lib/capabilities';
import type { UserProfile } from '@/lib/capabilities';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        is: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })
      ),
    },
  },
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    canAccessModule: () => true, // Has permission
    hasRole: () => true,
    canPerformAction: () => true,
    isAuthenticated: true,
  }),
}));

// Helper to create UserProfile
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

describe('Route Protection Integration', () => {
  it('should block access to inactive module routes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Mock: scheduling module is INACTIVE
    // Use capability that doesn't activate scheduling (physical_products only)
    const mockProfile = createMockUserProfile(['physical_products']); // NOT professional_services
    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const SchedulingPage = () => <div>Scheduling Page Content</div>;

    render(
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <ChakraProvider>
            <MemoryRouter initialEntries={['/admin/resources/scheduling']}>
              <Routes>
                <Route
                  path="/admin/resources/scheduling"
                  element={
                    <RoleGuard
                      requiredModule="scheduling"
                      requireModuleActive={true}
                    >
                      <SchedulingPage />
                    </RoleGuard>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ChakraProvider>
        </FeatureFlagProvider>
      </QueryClientProvider>
    );

    // Should NOT see page content
    expect(
      screen.queryByText('Scheduling Page Content')
    ).not.toBeInTheDocument();

    // Should see module not available message
    expect(screen.getByText(/Module Not Available/i)).toBeInTheDocument();
  });

  it('should allow access to active module routes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Mock: materials module is ACTIVE (physical_products)
    const mockProfile = createMockUserProfile(['physical_products']);
    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const MaterialsPage = () => <div>Materials Page Content</div>;

    render(
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <ChakraProvider>
            <MemoryRouter initialEntries={['/admin/supply-chain/materials']}>
              <Routes>
                <Route
                  path="/admin/supply-chain/materials"
                  element={
                    <RoleGuard
                      requiredModule="materials"
                      requireModuleActive={true}
                    >
                      <MaterialsPage />
                    </RoleGuard>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ChakraProvider>
        </FeatureFlagProvider>
      </QueryClientProvider>
    );

    // Should see page content
    expect(screen.getByText('Materials Page Content')).toBeInTheDocument();

    // Should NOT see error message
    expect(
      screen.queryByText(/Module Not Available/i)
    ).not.toBeInTheDocument();
  });

  it('should prevent direct URL navigation to inactive modules', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // User has physical_products but not professional_services
    // So scheduling should be inactive
    const mockProfile = createMockUserProfile(['physical_products']);
    queryClient.setQueryData(businessProfileKeys.detail(), mockProfile);

    const SchedulingPage = () => <div>Scheduling Page</div>;

    render(
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <ChakraProvider>
            <MemoryRouter initialEntries={['/admin/resources/scheduling']}>
              <Routes>
                <Route
                  path="/admin/resources/scheduling"
                  element={
                    <RoleGuard
                      requiredModule="scheduling"
                      requireModuleActive={true}
                    >
                      <SchedulingPage />
                    </RoleGuard>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ChakraProvider>
        </FeatureFlagProvider>
      </QueryClientProvider>
    );

    // Should show error instead of page
    expect(screen.getByText(/Module Not Available/i)).toBeInTheDocument();

    // Can see "Return to Dashboard" button
    const dashboardButton = screen.getByText(/Return to Dashboard/i);
    expect(dashboardButton).toBeInTheDocument();
  });
});
