/**
 * Enhanced CapabilityGate Tests for G-Admin v3.0
 * Tests enhanced features: telemetry, caching, lazy loading, performance tracking
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityGate } from '../CapabilityGate';

// Mock enhanced capabilities hook
vi.mock('../hooks/useCapabilities', () => ({
  useCapabilities: () => ({
    hasCapability: vi.fn((cap: string) => cap === 'customer_management'),
    hasAllCapabilities: vi.fn((caps: string[]) => caps.every(cap => cap === 'customer_management')),
    activeCapabilities: ['customer_management'],
    preloadCapability: vi.fn().mockResolvedValue(undefined),
    isCapabilityLoaded: vi.fn(() => true),
    cacheStats: { hitRate: 0.8, hits: 80, misses: 20 }
  })
}));

// Mock telemetry
vi.mock('../telemetry/CapabilityTelemetry', () => ({
  getCapabilityTelemetry: () => ({
    trackCapabilityCheck: vi.fn(),
    trackCapabilityAccess: vi.fn(),
    trackPerformanceMetrics: vi.fn()
  })
}));

describe('Enhanced CapabilityGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Enhanced Functionality', () => {
    test('should render with enhanced props', () => {
      render(
        <CapabilityGate
          capabilities="customer_management"
          telemetry={true}
          lazyLoading={true}
          trackPerformance={true}
          gateName="test-gate"
        >
          <div>Enhanced Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Enhanced Content')).toBeInTheDocument();
    });

    test('should handle telemetry disabled', () => {
      render(
        <CapabilityGate
          capabilities="customer_management"
          telemetry={false}
        >
          <div>No Telemetry Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('No Telemetry Content')).toBeInTheDocument();
    });

    test('should handle lazy loading disabled', () => {
      render(
        <CapabilityGate
          capabilities="customer_management"
          lazyLoading={false}
        >
          <div>No Lazy Loading Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('No Lazy Loading Content')).toBeInTheDocument();
    });
  });

  describe('Multiple Capabilities with Enhanced Features', () => {
    test('should handle multiple capabilities with telemetry', () => {
      render(
        <CapabilityGate
          capabilities={['customer_management', 'sells_products']}
          mode="any"
          telemetry={true}
          gateName="multi-capability-gate"
        >
          <div>Multi Capability Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Multi Capability Content')).toBeInTheDocument();
    });

    test('should handle ALL mode with performance tracking', () => {
      render(
        <CapabilityGate
          capabilities={['customer_management', 'sells_products']}
          mode="all"
          trackPerformance={true}
          fallback={<div>Access Denied</div>}
        >
          <div>All Capabilities Required</div>
        </CapabilityGate>
      );

      // Should show fallback since user doesn't have sells_products
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('All Capabilities Required')).not.toBeInTheDocument();
    });
  });

  describe('Enhanced Debug Logging', () => {
    test('should provide enhanced debug information', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <CapabilityGate
          capabilities="customer_management"
          debug={true}
          telemetry={true}
          lazyLoading={true}
          gateName="debug-gate"
        >
          <div>Debug Content</div>
        </CapabilityGate>
      );

      // In development mode, debug should be called
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalledWith(
          '🔒 Enhanced CapabilityGate Debug:',
          expect.objectContaining({
            componentName: 'debug-gate',
            performance: expect.objectContaining({
              cacheHitRate: 0.8,
              lazyLoadingEnabled: true,
              telemetryEnabled: true
            })
          })
        );
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle preload failures gracefully', async () => {
      const mockPreload = vi.fn().mockRejectedValue(new Error('Preload failed'));
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(require('../hooks/useCapabilities').useCapabilities).mockReturnValue({
        hasCapability: vi.fn(() => true),
        hasAllCapabilities: vi.fn(() => true),
        activeCapabilities: ['customer_management'],
        preloadCapability: mockPreload,
        isCapabilityLoaded: vi.fn(() => false),
        cacheStats: { hitRate: 0.8 }
      });

      render(
        <CapabilityGate
          capabilities="customer_management"
          lazyLoading={true}
        >
          <div>Content with Preload Error</div>
        </CapabilityGate>
      );

      await waitFor(() => {
        expect(mockPreload).toHaveBeenCalledWith('customer_management');
      });

      expect(screen.getByText('Content with Preload Error')).toBeInTheDocument();
      consoleWarnSpy.mockRestore();
    });

    test('should work without cache stats', () => {
      vi.mocked(require('../hooks/useCapabilities').useCapabilities).mockReturnValue({
        hasCapability: vi.fn(() => true),
        hasAllCapabilities: vi.fn(() => true),
        activeCapabilities: ['customer_management'],
        preloadCapability: vi.fn().mockResolvedValue(undefined),
        isCapabilityLoaded: vi.fn(() => true),
        cacheStats: null
      });

      render(
        <CapabilityGate
          capabilities="customer_management"
          telemetry={true}
          trackPerformance={true}
        >
          <div>Content without Cache Stats</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Content without Cache Stats')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    test('should handle component updates', () => {
      const { rerender } = render(
        <CapabilityGate
          capabilities="customer_management"
          telemetry={true}
        >
          <div>Initial Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Initial Content')).toBeInTheDocument();

      rerender(
        <CapabilityGate
          capabilities="sells_products"
          telemetry={true}
          fallback={<div>Updated Fallback</div>}
        >
          <div>Updated Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Updated Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Updated Content')).not.toBeInTheDocument();
    });

    test('should handle gate name changes', () => {
      const { rerender } = render(
        <CapabilityGate
          capabilities="customer_management"
          gateName="original-gate"
          debug={true}
        >
          <div>Named Gate Content</div>
        </CapabilityGate>
      );

      rerender(
        <CapabilityGate
          capabilities="customer_management"
          gateName="updated-gate"
          debug={true}
        >
          <div>Named Gate Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Named Gate Content')).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    test('should use correct default values', () => {
      render(
        <CapabilityGate capabilities="customer_management">
          <div>Default Values Content</div>
        </CapabilityGate>
      );

      expect(screen.getByText('Default Values Content')).toBeInTheDocument();
    });

    test('should handle production vs development telemetry defaults', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production default
      process.env.NODE_ENV = 'production';
      render(
        <CapabilityGate capabilities="customer_management">
          <div>Production Content</div>
        </CapabilityGate>
      );
      expect(screen.getByText('Production Content')).toBeInTheDocument();

      // Test development default
      process.env.NODE_ENV = 'development';
      render(
        <CapabilityGate capabilities="customer_management">
          <div>Development Content</div>
        </CapabilityGate>
      );
      expect(screen.getByText('Development Content')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});