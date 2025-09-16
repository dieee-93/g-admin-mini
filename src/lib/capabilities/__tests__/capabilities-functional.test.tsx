/**
 * Functional tests for CapabilityGate System
 * Tests core functionality without external dependencies
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the external dependencies to avoid import errors
const mockBusinessCapabilitiesStore = {
  profile: {
    capabilities: {
      sells_products: true,
      sells_products_for_onsite_consumption: true,
      sells_services: false,
      manages_events: false,
      manages_recurrence: false,
      sells_products_for_pickup: false,
      sells_products_with_delivery: false,
      sells_digital_products: false,
      sells_services_by_appointment: false,
      sells_services_by_class: false,
      sells_space_by_reservation: false,
      hosts_private_events: false,
      manages_offsite_catering: false,
      manages_rentals: false,
      manages_memberships: false,
      manages_subscriptions: false,
      has_online_store: false,
      is_b2b_focused: false,
    },
    setupCompleted: true,
    operationalTier: 'Intermedio'
  },
  dashboardModules: ['dashboard', 'sales', 'materials', 'products'],
  setCapability: vi.fn(),
  getOperationalTier: vi.fn(() => 'Intermedio')
};

// Mock the store before importing our components
vi.mock('@/store/businessCapabilitiesStore', () => ({
  useBusinessCapabilities: () => mockBusinessCapabilitiesStore
}));

// Now import our components
import { CapabilityGate } from '../CapabilityGate';
import { CapabilityProvider } from '../CapabilityProvider';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CapabilityProvider debugMode={false}>
    {children}
  </CapabilityProvider>
);

describe('CapabilityGate Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when single capability is available', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="sells_products">
          <div data-testid="products-module">Products Module</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('products-module')).toBeInTheDocument();
  });

  it('renders fallback when single capability is not available', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities="appointment_booking"
          fallback={<div data-testid="fallback">Feature not available</div>}
        >
          <div data-testid="appointments-module">Appointments Module</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('appointments-module')).not.toBeInTheDocument();
  });

  it('handles multiple capabilities with OR logic (default)', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities={["sells_products", "appointment_booking"]}>
          <div data-testid="or-feature">OR Logic Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render because sells_products is available (OR logic)
    expect(screen.getByTestId('or-feature')).toBeInTheDocument();
  });

  it('handles multiple capabilities with AND logic', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities={["sells_products", "appointment_booking"]}
          mode="all"
          fallback={<div data-testid="and-fallback">Missing requirements</div>}
        >
          <div data-testid="and-feature">AND Logic Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render fallback because appointment_booking is not available (AND logic)
    expect(screen.getByTestId('and-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('and-feature')).not.toBeInTheDocument();
  });

  it('renders null fallback by default when capabilities not met', () => {
    const { container } = render(
      <TestWrapper>
        <CapabilityGate capabilities="appointment_booking">
          <div>Hidden Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(container.firstChild?.textContent).toBe('');
  });

  it('handles mapped capabilities correctly', () => {
    // Test that legacy capabilities are mapped to new system
    render(
      <TestWrapper>
        <CapabilityGate capabilities="pos_system">
          <div data-testid="pos-system">POS System</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // pos_system should be available because sells_products_for_onsite_consumption is true
    expect(screen.getByTestId('pos-system')).toBeInTheDocument();
  });

  it('includes core capabilities always', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="customer_management">
          <div data-testid="core-feature">Core Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Core capabilities should always be available
    expect(screen.getByTestId('core-feature')).toBeInTheDocument();
  });
});

describe('Business Model Detection', () => {
  it('detects restaurant business model correctly', () => {
    const TestChild = () => {
      const { useCapabilities } = require('../hooks/useCapabilities');
      const { businessModel } = useCapabilities();

      return <div data-testid="business-model">{businessModel || 'none'}</div>;
    };

    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>
    );

    // Should detect restaurant based on sells_products_for_onsite_consumption
    expect(screen.getByTestId('business-model')).toHaveTextContent('restaurant');
  });
});

describe('Capability System Integration', () => {
  it('provides correct active capabilities count', () => {
    const TestChild = () => {
      const { useCapabilities } = require('../hooks/useCapabilities');
      const { activeCapabilities } = useCapabilities();

      return (
        <div data-testid="capabilities-count">
          {activeCapabilities.length}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>
    );

    const capabilitiesCount = screen.getByTestId('capabilities-count');
    const count = parseInt(capabilitiesCount.textContent || '0');

    // Should have multiple capabilities active (at least core + mapped ones)
    expect(count).toBeGreaterThan(5);
  });

  it('includes payment gateway for selling businesses', () => {
    const TestChild = () => {
      const { useCapabilities } = require('../hooks/useCapabilities');
      const { hasCapability } = useCapabilities();

      return (
        <div data-testid="has-payment">
          {hasCapability('payment_gateway') ? 'yes' : 'no'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>
    );

    // Should have payment gateway because sells_products is true
    expect(screen.getByTestId('has-payment')).toHaveTextContent('yes');
  });

  it('shows enabled modules correctly', () => {
    const TestChild = () => {
      const { useCapabilities } = require('../hooks/useCapabilities');
      const { enabledModules } = useCapabilities();

      return (
        <div data-testid="enabled-modules">
          {enabledModules.join(',')}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>
    );

    const enabledModules = screen.getByTestId('enabled-modules').textContent;
    expect(enabledModules).toContain('dashboard');
    expect(enabledModules).toContain('sales');
    expect(enabledModules).toContain('materials');
  });
});

describe('Error Handling', () => {
  it('handles missing capability gracefully', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="non_existent_capability" fallback={<div data-testid="safe-fallback">Safe fallback</div>}>
          <div>Should not show</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('safe-fallback')).toBeInTheDocument();
  });

  it('handles empty capabilities array', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities={[]} fallback={<div data-testid="empty-fallback">Empty fallback</div>}>
          <div data-testid="empty-children">Should not show</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Empty array should show children (no requirements)
    expect(screen.getByTestId('empty-children')).toBeInTheDocument();
  });
});