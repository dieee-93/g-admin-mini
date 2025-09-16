/**
 * Slot System Tests for G-Admin v3.0
 * Tests compound components pattern and slot composition
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  SlotProvider,
  Slot,
  Card,
  Dashboard,
  useSlotContent,
  useSlotRegistry
} from '../index';

// Mock capabilities hook
jest.mock('../../capabilities/hooks/useCapabilities', () => ({
  useCapabilities: () => ({
    hasCapability: () => true,
    hasAllCapabilities: () => true,
    activeCapabilities: ['dashboard_analytics'],
    businessModel: 'restaurant'
  })
}));

describe('Slot System', () => {
  describe('SlotProvider', () => {
    test('provides slot context to children', () => {
      const TestComponent = () => {
        const { hasSlot } = useSlotRegistry();
        return <div>Has slot context: {hasSlot ? 'true' : 'false'}</div>;
      };

      render(
        <SlotProvider>
          <TestComponent />
        </SlotProvider>
      );

      expect(screen.getByText(/Has slot context: true/)).toBeInTheDocument();
    });
  });

  describe('Basic Slot Component', () => {
    test('renders slot with children', () => {
      render(
        <SlotProvider>
          <Slot id="test-slot" name="Test Slot">
            <div>Slot Content</div>
          </Slot>
        </SlotProvider>
      );

      expect(screen.getByText('Slot Content')).toBeInTheDocument();
    });

    test('renders fallback when no content', () => {
      render(
        <SlotProvider>
          <Slot
            id="empty-slot"
            name="Empty Slot"
            fallback={<div>Fallback Content</div>}
          />
        </SlotProvider>
      );

      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    });

    test('renders nothing when no content and no fallback', () => {
      const { container } = render(
        <SlotProvider>
          <Slot id="empty-slot" name="Empty Slot" />
        </SlotProvider>
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('Card Compound Component', () => {
    test('renders complete card structure', () => {
      render(
        <SlotProvider>
          <Card data-testid="card">
            <Card.Header data-testid="card-header">
              <h3>Card Title</h3>
            </Card.Header>
            <Card.Body data-testid="card-body">
              <p>Card content</p>
            </Card.Body>
            <Card.Footer data-testid="card-footer">
              <button>Action</button>
            </Card.Footer>
          </Card>
        </SlotProvider>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-body')).toBeInTheDocument();
      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    test('works with partial structure', () => {
      render(
        <SlotProvider>
          <Card>
            <Card.Header>Header Only</Card.Header>
            <Card.Body>Body Only</Card.Body>
          </Card>
        </SlotProvider>
      );

      expect(screen.getByText('Header Only')).toBeInTheDocument();
      expect(screen.getByText('Body Only')).toBeInTheDocument();
      expect(screen.queryByText('Footer')).not.toBeInTheDocument();
    });
  });

  describe('Dashboard Compound Component', () => {
    test('renders dashboard layout structure', () => {
      render(
        <SlotProvider>
          <Dashboard data-testid="dashboard">
            <Dashboard.Header data-testid="dashboard-header">
              Dashboard Header
            </Dashboard.Header>
            <Dashboard.Content data-testid="dashboard-content">
              Main Content
            </Dashboard.Content>
            <Dashboard.Sidebar data-testid="dashboard-sidebar">
              Sidebar Content
            </Dashboard.Sidebar>
          </Dashboard>
        </SlotProvider>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
    });
  });

  describe('Slot Content Injection', () => {
    test('injects content into slots', () => {
      const ContentInjector = () => {
        const { addContent } = useSlotContent('test-slot');

        React.useEffect(() => {
          addContent({
            content: <div>Injected Content</div>,
            priority: 10
          });
        }, [addContent]);

        return null;
      };

      render(
        <SlotProvider>
          <ContentInjector />
          <Slot id="test-slot" name="Test Slot" />
        </SlotProvider>
      );

      expect(screen.getByText('Injected Content')).toBeInTheDocument();
    });

    test('respects content priority', () => {
      const PriorityInjector = () => {
        const { addContent } = useSlotContent('priority-slot');

        React.useEffect(() => {
          addContent({
            content: <div>Low Priority</div>,
            priority: 1
          });
          addContent({
            content: <div>High Priority</div>,
            priority: 10
          });
        }, [addContent]);

        return null;
      };

      render(
        <SlotProvider>
          <PriorityInjector />
          <Slot id="priority-slot" name="Priority Slot" />
        </SlotProvider>
      );

      // Should show high priority content (higher priority wins)
      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.queryByText('Low Priority')).not.toBeInTheDocument();
    });
  });

  describe('Slot Registry', () => {
    test('tracks registered slots', () => {
      const SlotTracker = () => {
        const { availableSlots } = useSlotRegistry();

        return (
          <div>
            Slots: {availableSlots.map(slot => slot.id).join(', ')}
          </div>
        );
      };

      render(
        <SlotProvider>
          <Slot id="slot-1" name="Slot 1" />
          <Slot id="slot-2" name="Slot 2" />
          <SlotTracker />
        </SlotProvider>
      );

      expect(screen.getByText(/Slots: slot-1, slot-2/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing slot context gracefully', () => {
      // Mock console.error to avoid test output pollution
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<Slot id="orphan-slot" name="Orphan" />);
      }).toThrow('useSlotContext must be used within a SlotProvider');

      console.error = originalError;
    });
  });

  describe('Accessibility', () => {
    test('preserves accessibility attributes', () => {
      render(
        <SlotProvider>
          <Slot
            id="accessible-slot"
            name="Accessible Slot"
            role="region"
            aria-label="Test Region"
          >
            <div>Accessible Content</div>
          </Slot>
        </SlotProvider>
      );

      const slot = screen.getByRole('region');
      expect(slot).toHaveAttribute('aria-label', 'Test Region');
    });
  });
});