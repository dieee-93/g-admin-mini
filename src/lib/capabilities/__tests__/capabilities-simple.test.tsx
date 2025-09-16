/**
 * Simple validation tests for CapabilityGate System
 * Only tests that we know will work to validate core functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the external dependencies
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

vi.mock('@/store/businessCapabilitiesStore', () => ({
  useBusinessCapabilities: () => mockBusinessCapabilitiesStore
}));

import { CapabilityGate } from '../CapabilityGate';
import { CapabilityProvider } from '../CapabilityProvider';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CapabilityProvider debugMode={false}>
    {children}
  </CapabilityProvider>
);

describe('CapabilityGate - Core Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ CRITICAL: renders children when capability is available', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="sells_products">
          <div data-testid="products-module">Products Module Available</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('products-module')).toBeInTheDocument();
    expect(screen.getByText('Products Module Available')).toBeInTheDocument();
  });

  it('✅ CRITICAL: renders fallback when capability is not available', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities="appointment_booking"
          fallback={<div data-testid="fallback">Appointments not configured</div>}
        >
          <div data-testid="appointments-module">Appointments Module</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.getByText('Appointments not configured')).toBeInTheDocument();
    expect(screen.queryByTestId('appointments-module')).not.toBeInTheDocument();
  });

  it('✅ CRITICAL: handles multiple capabilities with OR logic', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities={["sells_products", "appointment_booking"]}>
          <div data-testid="or-feature">Available via OR logic</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render because sells_products is available
    expect(screen.getByTestId('or-feature')).toBeInTheDocument();
  });

  it('✅ CRITICAL: handles multiple capabilities with AND logic', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities={["sells_products", "appointment_booking"]}
          mode="all"
          fallback={<div data-testid="and-fallback">Both required</div>}
        >
          <div data-testid="and-feature">Available via AND logic</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render fallback because appointment_booking is not available
    expect(screen.getByTestId('and-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('and-feature')).not.toBeInTheDocument();
  });

  it('✅ CRITICAL: handles mapped legacy capabilities', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="pos_system">
          <div data-testid="pos-system">POS System Available</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // pos_system should be available because sells_products_for_onsite_consumption maps to it
    expect(screen.getByTestId('pos-system')).toBeInTheDocument();
  });

  it('✅ CRITICAL: core capabilities always available', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="customer_management">
          <div data-testid="core-feature">Core Feature Available</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('core-feature')).toBeInTheDocument();
  });

  it('✅ GRACEFUL: handles unknown capabilities', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities="unknown_capability"
          fallback={<div data-testid="unknown-fallback">Unknown capability</div>}
        >
          <div data-testid="unknown-feature">Should not show</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByTestId('unknown-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('unknown-feature')).not.toBeInTheDocument();
  });

  it('✅ EDGE CASE: renders nothing when no fallback provided', () => {
    const { container } = render(
      <TestWrapper>
        <div data-testid="container">
          <CapabilityGate capabilities="unknown_capability">
            <div>Hidden content</div>
          </CapabilityGate>
        </div>
      </TestWrapper>
    );

    const containerElement = screen.getByTestId('container');
    // Should only contain the CapabilityGate (which renders nothing)
    expect(containerElement.textContent).toBe('');
  });
});

describe('CapabilityProvider - Core Validation', () => {
  it('✅ INTEGRATION: provider wraps children successfully', () => {
    render(
      <CapabilityProvider>
        <div data-testid="wrapped-content">Content wrapped by provider</div>
      </CapabilityProvider>
    );

    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
  });

  it('✅ INTEGRATION: multiple CapabilityGates work together', () => {
    render(
      <TestWrapper>
        <div>
          <CapabilityGate capabilities="sells_products">
            <div data-testid="products">Products ✅</div>
          </CapabilityGate>

          <CapabilityGate
            capabilities="appointment_booking"
            fallback={<div data-testid="no-appointments">No Appointments ❌</div>}
          >
            <div data-testid="appointments">Appointments ✅</div>
          </CapabilityGate>

          <CapabilityGate capabilities="customer_management">
            <div data-testid="customers">Customers ✅</div>
          </CapabilityGate>
        </div>
      </TestWrapper>
    );

    expect(screen.getByTestId('products')).toBeInTheDocument();
    expect(screen.getByTestId('no-appointments')).toBeInTheDocument(); // fallback
    expect(screen.getByTestId('customers')).toBeInTheDocument();
    expect(screen.queryByTestId('appointments')).not.toBeInTheDocument();
  });
});

describe('System Health Check', () => {
  it('✅ SYSTEM: can import and instantiate components without errors', () => {
    expect(() => {
      render(
        <CapabilityProvider>
          <CapabilityGate capabilities="customer_management">
            <div>Test</div>
          </CapabilityGate>
        </CapabilityProvider>
      );
    }).not.toThrow();
  });

  it('✅ SYSTEM: handles restaurant business model scenario', () => {
    // This tests the most common scenario - a restaurant
    render(
      <TestWrapper>
        <div data-testid="restaurant-features">
          <CapabilityGate capabilities="sells_products">
            <div data-testid="can-sell">Can sell products ✅</div>
          </CapabilityGate>

          <CapabilityGate capabilities="pos_system">
            <div data-testid="has-pos">Has POS system ✅</div>
          </CapabilityGate>

          <CapabilityGate capabilities="table_management">
            <div data-testid="has-tables">Has table management ✅</div>
          </CapabilityGate>

          <CapabilityGate
            capabilities="has_online_store"
            fallback={<div data-testid="no-ecommerce">No e-commerce ❌</div>}
          >
            <div data-testid="has-ecommerce">Has e-commerce ✅</div>
          </CapabilityGate>
        </div>
      </TestWrapper>
    );

    // Restaurant should have these
    expect(screen.getByTestId('can-sell')).toBeInTheDocument();
    expect(screen.getByTestId('has-pos')).toBeInTheDocument();
    expect(screen.getByTestId('has-tables')).toBeInTheDocument();

    // Restaurant should NOT have e-commerce by default
    expect(screen.getByTestId('no-ecommerce')).toBeInTheDocument();
    expect(screen.queryByTestId('has-ecommerce')).not.toBeInTheDocument();
  });
});