/**
 * Basic tests for CapabilityGate System
 * Validates core functionality without complex integrations
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the business capabilities store
vi.mock('@/store/businessCapabilitiesStore', () => ({
  useBusinessCapabilities: vi.fn(() => ({
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
  }))
}));

import { CapabilityGate } from '../CapabilityGate';
import { CapabilityProvider } from '../CapabilityProvider';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CapabilityProvider debugMode={false}>
    {children}
  </CapabilityProvider>
);

describe('CapabilityGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when capability is available', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities="sells_products">
          <div>Products Module</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByText('Products Module')).toBeInTheDocument();
  });

  it('should render fallback when capability is not available', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities="manages_appointments"
          fallback={<div>Feature not available</div>}
        >
          <div>Appointments Module</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(screen.getByText('Feature not available')).toBeInTheDocument();
    expect(screen.queryByText('Appointments Module')).not.toBeInTheDocument();
  });

  it('should handle multiple capabilities with OR logic (default)', () => {
    render(
      <TestWrapper>
        <CapabilityGate capabilities={["sells_products", "manages_appointments"]}>
          <div>Available Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render because sells_products is available (OR logic)
    expect(screen.getByText('Available Feature')).toBeInTheDocument();
  });

  it('should handle multiple capabilities with AND logic', () => {
    render(
      <TestWrapper>
        <CapabilityGate
          capabilities={["sells_products", "manages_appointments"]}
          mode="all"
          fallback={<div>Missing requirements</div>}
        >
          <div>Full Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    // Should render fallback because manages_appointments is not available (AND logic)
    expect(screen.getByText('Missing requirements')).toBeInTheDocument();
    expect(screen.queryByText('Full Feature')).not.toBeInTheDocument();
  });

  it('should render null fallback by default', () => {
    const { container } = render(
      <TestWrapper>
        <CapabilityGate capabilities="manages_appointments">
          <div>Hidden Feature</div>
        </CapabilityGate>
      </TestWrapper>
    );

    expect(container.textContent).toBe('');
  });
});

describe('Capability System Integration', () => {
  it('should properly map legacy capabilities to new system', () => {
    // This test would verify the mapping logic
    const { mapLegacyCapabilities } = require('../utils/businessModelMapping');

    const legacyCapabilities = {
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
    };

    const mappedCapabilities = mapLegacyCapabilities(legacyCapabilities);

    expect(mappedCapabilities).toContain('sells_products');
    expect(mappedCapabilities).toContain('pos_system');
    expect(mappedCapabilities).toContain('table_management');
    expect(mappedCapabilities).toContain('customer_management');
    expect(mappedCapabilities).toContain('fiscal_compliance');
  });

  it('should detect business model correctly', () => {
    const { detectBusinessModel } = require('../utils/businessModelMapping');

    const restaurantCapabilities = [
      'customer_management',
      'sells_products',
      'sells_products_for_onsite_consumption',
      'pos_system',
      'table_management',
      'payment_gateway',
      'fiscal_compliance'
    ];

    const detectedModel = detectBusinessModel(restaurantCapabilities);
    expect(detectedModel).toBe('restaurant');
  });
});

describe('CapabilityProvider', () => {
  it('should provide capability context to children', () => {
    const TestChild = () => {
      const { useCapabilityContext } = require('../CapabilityProvider');
      const context = useCapabilityContext();

      return (
        <div>
          Business Model: {context.businessModel || 'None'}
          Capabilities: {context.activeCapabilities.length}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>
    );

    expect(screen.getByText(/Business Model:/)).toBeInTheDocument();
    expect(screen.getByText(/Capabilities:/)).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    const TestChild = () => {
      const { useCapabilityContext } = require('../CapabilityProvider');
      try {
        useCapabilityContext();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>Error caught</div>;
      }
    };

    render(<TestChild />);
    expect(screen.getByText('Error caught')).toBeInTheDocument();
  });
});