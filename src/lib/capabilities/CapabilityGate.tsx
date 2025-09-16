/**
 * CapabilityGate Component for G-Admin v3.0
 * Provides conditional rendering based on business capabilities
 * Integrates with existing businessCapabilitiesStore
 * Enhanced with telemetry, caching, and lazy loading (2024 optimizations)
 */

import React, { useEffect, useRef } from 'react';
import { useCapabilities } from './hooks/useCapabilities';
import { getCapabilityTelemetry } from './telemetry/CapabilityTelemetry';
import type { BusinessCapability } from './types/BusinessCapabilities';

interface CapabilityGateProps {
  /**
   * Single capability or array of capabilities to check
   */
  capabilities: BusinessCapability | BusinessCapability[];

  /**
   * Component to render when capabilities are not met
   */
  fallback?: React.ReactNode;

  /**
   * Children to render when capabilities are met
   */
  children: React.ReactNode;

  /**
   * Logic mode for multiple capabilities
   * - 'any': OR logic - any of the capabilities (default)
   * - 'all': AND logic - all capabilities required
   */
  mode?: 'any' | 'all';

  /**
   * Development mode - shows debug info in console
   */
  debug?: boolean;

  /**
   * Enable telemetry tracking (default: true in production)
   */
  telemetry?: boolean;

  /**
   * Enable lazy loading of capability modules (default: true)
   */
  lazyLoading?: boolean;

  /**
   * Track component performance metrics
   */
  trackPerformance?: boolean;

  /**
   * Unique identifier for telemetry tracking
   */
  gateName?: string;
}

/**
 * CapabilityGate - Conditional rendering based on business capabilities
 *
 * @example
 * // Single capability
 * <CapabilityGate capabilities="manages_appointments">
 *   <AppointmentBookingModule />
 * </CapabilityGate>
 *
 * @example
 * // Multiple capabilities with OR logic (default)
 * <CapabilityGate capabilities={["sells_products", "table_management"]}>
 *   <RestaurantPOSModule />
 * </CapabilityGate>
 *
 * @example
 * // Multiple capabilities with AND logic
 * <CapabilityGate
 *   capabilities={["sells_products", "has_online_store"]}
 *   mode="all"
 *   fallback={<div>E-commerce not configured</div>}
 * >
 *   <OnlineStoreModule />
 * </CapabilityGate>
 */
export const CapabilityGate: React.FC<CapabilityGateProps> = ({
  capabilities,
  fallback = null,
  children,
  mode = 'any',
  debug = false,
  telemetry = process.env.NODE_ENV === 'production',
  lazyLoading = true,
  trackPerformance = false,
  gateName
}) => {
  const {
    hasCapability,
    hasAllCapabilities,
    activeCapabilities,
    preloadCapability,
    isCapabilityLoaded,
    cacheStats
  } = useCapabilities();

  const telemetryInstance = getCapabilityTelemetry();
  const renderStartTime = useRef<number>(Date.now());
  const componentName = gateName || 'CapabilityGate';

  // Normalize capabilities to array
  const capabilityArray = Array.isArray(capabilities) ? capabilities : [capabilities];

  // Track capability check performance
  useEffect(() => {
    if (telemetry) {
      const checkStartTime = Date.now();

      // Check access based on mode
      const hasAccess = mode === 'all'
        ? hasAllCapabilities(capabilityArray)
        : capabilityArray.some(cap => hasCapability(cap));

      const checkDuration = Date.now() - checkStartTime;
      const cacheHit = cacheStats?.hitRate > 0;

      // Track capability check
      capabilityArray.forEach(cap => {
        telemetryInstance.trackCapabilityCheck(cap, checkDuration, cacheHit);
        telemetryInstance.trackCapabilityAccess(cap, hasAccess);
      });
    }
  }, [capabilities, mode, telemetry, hasCapability, hasAllCapabilities, capabilityArray, cacheStats, telemetryInstance]);

  // Preload capabilities if lazy loading is enabled
  useEffect(() => {
    if (lazyLoading) {
      capabilityArray.forEach(cap => {
        if (!isCapabilityLoaded(cap)) {
          preloadCapability(cap).catch(error => {
            console.warn(`Failed to preload capability ${cap}:`, error);
          });
        }
      });
    }
  }, [capabilityArray, lazyLoading, preloadCapability, isCapabilityLoaded]);

  // Track component render performance
  useEffect(() => {
    if (trackPerformance && telemetry) {
      const renderDuration = Date.now() - renderStartTime.current;

      telemetryInstance.trackPerformanceMetrics({
        capabilityCheckDuration: renderDuration,
        cacheHitRate: cacheStats?.hitRate || 0,
        lazyLoadingTime: 0, // Would be measured from actual lazy loading
        componentRenderTime: renderDuration
      });
    }
  });

  // Check access based on mode (with caching from enhanced useCapabilities)
  const hasAccess = mode === 'all'
    ? hasAllCapabilities(capabilityArray)
    : capabilityArray.some(cap => hasCapability(cap));

  // Enhanced debug logging
  if (debug && process.env.NODE_ENV === 'development') {
    console.log('🔒 Enhanced CapabilityGate Debug:', {
      componentName,
      requiredCapabilities: capabilityArray,
      mode,
      activeCapabilities,
      hasAccess,
      performance: {
        cacheHitRate: cacheStats?.hitRate,
        lazyLoadingEnabled: lazyLoading,
        telemetryEnabled: telemetry
      },
      loadedCapabilities: capabilityArray.map(cap => ({
        capability: cap,
        loaded: isCapabilityLoaded(cap)
      }))
    });
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component version of CapabilityGate
 * Useful for wrapping entire components or pages
 */
export const withCapabilityGate = <P extends object>(
  Component: React.ComponentType<P>,
  requiredCapabilities: BusinessCapability | BusinessCapability[],
  options?: {
    mode?: 'any' | 'all';
    fallback?: React.ReactNode;
    debug?: boolean;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <CapabilityGate
      capabilities={requiredCapabilities}
      mode={options?.mode}
      fallback={options?.fallback}
      debug={options?.debug}
    >
      <Component {...props} />
    </CapabilityGate>
  );

  WrappedComponent.displayName = `withCapabilityGate(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Hook-based capability checking for conditional logic within components
 *
 * @example
 * const MyComponent = () => {
 *   const canShowAdvanced = useCapabilityCheck(['is_b2b_focused', 'has_online_store'], 'all');
 *
 *   return (
 *     <div>
 *       <BasicFeatures />
 *       {canShowAdvanced && <AdvancedFeatures />}
 *     </div>
 *   );
 * };
 */
export const useCapabilityCheck = (
  capabilities: BusinessCapability | BusinessCapability[],
  mode: 'any' | 'all' = 'any'
): boolean => {
  const { hasCapability, hasAllCapabilities } = useCapabilities();

  const capabilityArray = Array.isArray(capabilities) ? capabilities : [capabilities];

  return mode === 'all'
    ? hasAllCapabilities(capabilityArray)
    : capabilityArray.some(cap => hasCapability(cap));
};

/**
 * Component for debugging capabilities in development
 * Shows current active capabilities and their status
 */
export const CapabilityDebugger: React.FC<{
  capabilities?: BusinessCapability[];
  show?: boolean;
}> = ({
  capabilities = [],
  show = process.env.NODE_ENV === 'development'
}) => {
  const { activeCapabilities, businessModel } = useCapabilities();

  if (!show) return null;

  const capabilitiesToCheck = capabilities.length > 0 ? capabilities : activeCapabilities;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        🔍 Capability Debugger
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Business Model:</strong> {businessModel || 'Not set'}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Active Capabilities ({activeCapabilities.length}):</strong>
      </div>
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {capabilitiesToCheck.map(cap => (
          <div key={cap} style={{
            padding: '2px 0',
            color: activeCapabilities.includes(cap) ? '#4ade80' : '#f87171'
          }}>
            {activeCapabilities.includes(cap) ? '✅' : '❌'} {cap}
          </div>
        ))}
      </div>
    </div>
  );
};