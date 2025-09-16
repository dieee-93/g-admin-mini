/**
 * Basic Slot System Tests for G-Admin v3.0
 * Tests core slot functionality without external dependencies
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SlotProvider, Slot, Card } from '../index';

// Mock capabilities hook to avoid dependency issues
import { vi } from 'vitest';

vi.mock('../../capabilities/hooks/useCapabilities', () => ({
  useCapabilities: () => ({
    hasCapability: () => true,
    hasAllCapabilities: () => true,
    activeCapabilities: ['dashboard_analytics'],
    businessModel: 'restaurant'
  })
}));

describe('Slot System - Basic Tests', () => {
  describe('SlotProvider', () => {
    test('renders children without crashing', () => {
      render(
        <SlotProvider>
          <div>Test Content</div>
        </SlotProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
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
          <div data-testid="wrapper">
            <Slot id="empty-slot" name="Empty Slot" />
          </div>
        </SlotProvider>
      );

      const wrapper = screen.getByTestId('wrapper');
      expect(wrapper).toBeEmptyDOMElement();
    });

    test('applies custom className and props', () => {
      render(
        <SlotProvider>
          <Slot
            id="styled-slot"
            name="Styled Slot"
            className="custom-class"
            data-testid="styled-slot"
          >
            <div>Styled Content</div>
          </Slot>
        </SlotProvider>
      );

      const slot = screen.getByTestId('styled-slot');
      expect(slot).toHaveClass('custom-class');
      expect(screen.getByText('Styled Content')).toBeInTheDocument();
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

    test('applies custom styling to card', () => {
      render(
        <SlotProvider>
          <Card className="custom-card" data-testid="custom-card">
            <Card.Body>Content</Card.Body>
          </Card>
        </SlotProvider>
      );

      const card = screen.getByTestId('custom-card');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('Error Handling', () => {
    test('handles slot registration without provider gracefully', () => {
      // Mock console.error to avoid test output pollution
      const originalError = console.error;
      console.error = vi.fn();

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
      expect(screen.getByText('Accessible Content')).toBeInTheDocument();
    });

    test('supports ARIA labelledby', () => {
      render(
        <SlotProvider>
          <div>
            <h2 id="section-title">Section Title</h2>
            <Slot
              id="labeled-slot"
              name="Labeled Slot"
              role="region"
              aria-labelledby="section-title"
            >
              <div>Section Content</div>
            </Slot>
          </div>
        </SlotProvider>
      );

      const slot = screen.getByRole('region');
      expect(slot).toHaveAttribute('aria-labelledby', 'section-title');
    });
  });

  describe('Component Structure', () => {
    test('uses correct default wrapper element', () => {
      render(
        <SlotProvider>
          <Slot id="default-slot" name="Default Slot" data-testid="default-slot">
            <span>Content</span>
          </Slot>
        </SlotProvider>
      );

      const slot = screen.getByTestId('default-slot');
      expect(slot.tagName).toBe('DIV');
    });

    test('uses custom wrapper element', () => {
      render(
        <SlotProvider>
          <Slot
            id="section-slot"
            name="Section Slot"
            as="section"
            data-testid="section-slot"
          >
            <span>Content</span>
          </Slot>
        </SlotProvider>
      );

      const slot = screen.getByTestId('section-slot');
      expect(slot.tagName).toBe('SECTION');
    });
  });

  describe('Multiple Slots', () => {
    test('handles multiple independent slots', () => {
      render(
        <SlotProvider>
          <Slot id="slot-1" name="Slot 1">
            <div>Content 1</div>
          </Slot>
          <Slot id="slot-2" name="Slot 2">
            <div>Content 2</div>
          </Slot>
          <Slot id="slot-3" name="Slot 3" fallback={<div>Fallback 3</div>} />
        </SlotProvider>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Fallback 3')).toBeInTheDocument();
    });
  });
});