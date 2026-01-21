import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';
import { Provider } from '@/shared/ui/provider';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    canAccessModule: vi.fn((module) => module !== 'forbidden'),
    hasRole: vi.fn(() => true),
    canPerformAction: vi.fn(() => true),
    isAuthenticated: true,
  })),
}));

vi.mock('@/lib/capabilities', () => ({
  useFeatureFlags: vi.fn(() => ({
    isModuleActive: vi.fn((module) => module !== 'inactive-module'),
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

// Test wrapper with ChakraProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

describe('RoleGuard - Module Activation Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when module is active and user has permission', () => {
    render(
      <TestWrapper>
        <RoleGuard requiredModule="sales" requireModuleActive={true}>
          <div>Sales Page Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Sales Page Content')).toBeInTheDocument();
  });

  it('should show ModuleNotAvailable when module is inactive', () => {
    render(
      <TestWrapper>
        <RoleGuard requiredModule="inactive-module" requireModuleActive={true}>
          <div>Should Not Render</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    expect(screen.getByText(/Module Not Available/i)).toBeInTheDocument();
  });

  it('should bypass module check when requireModuleActive is false', () => {
    render(
      <TestWrapper>
        <RoleGuard requiredModule="inactive-module" requireModuleActive={false}>
          <div>Content Shown</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Content Shown')).toBeInTheDocument();
  });

  it('should default requireModuleActive to true', () => {
    render(
      <TestWrapper>
        <RoleGuard requiredModule="inactive-module">
          <div>Should Not Render</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    expect(screen.getByText(/Module Not Available/i)).toBeInTheDocument();
  });
});
