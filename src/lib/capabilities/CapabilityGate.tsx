/**
 * CapabilityGate Component - G-Admin Mini v2.1
 * Sistema de control de acceso basado en Business Capabilities
 * Integración completa con Business Capability System
 */

import React, { memo, useState, useEffect } from 'react';
import { useCapabilities } from './hooks/useCapabilities';
import { getBusinessModuleFeatures, shouldShowBusinessModule } from './businessCapabilitySystem';
import type { BusinessCapability } from './types/BusinessCapabilities';

// Loading component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '14px'
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    }} />
    {message}
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

interface CapabilityGateProps {
  /**
   * Single capability or array of capabilities to check
   */
  capabilities?: BusinessCapability | BusinessCapability[];

  /**
   * Module ID to check (will verify module visibility + features)
   */
  moduleId?: string;

  /**
   * Specific module feature to check
   */
  moduleFeature?: string;

  /**
   * Component to render when capabilities are not met
   */
  fallback?: React.ReactNode;

  /**
   * Component to render while loading
   */
  loading?: React.ReactNode;

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
   * Show loading state while checking capabilities
   */
  showLoading?: boolean;

  /**
   * Unique identifier for debugging
   */
  gateName?: string;
}

/**
 * CapabilityGate - Control de acceso condicional
 *
 * @example
 * // Basic capability check
 * <CapabilityGate capabilities="sells_products">
 *   <ProductManagement />
 * </CapabilityGate>
 *
 * @example
 * // Module-based check
 * <CapabilityGate moduleId="scheduling">
 *   <SchedulingModule />
 * </CapabilityGate>
 *
 * @example
 * // Feature-specific check
 * <CapabilityGate
 *   moduleId="scheduling"
 *   moduleFeature="approve_timeoff"
 *   fallback={<div>Time-off approval not available</div>}
 * >
 *   <TimeOffApprovalComponent />
 * </CapabilityGate>
 */
export const CapabilityGate: React.FC<CapabilityGateProps> = memo(({
  capabilities,
  moduleId,
  moduleFeature,
  fallback = null,
  loading,
  children,
  mode = 'any',
  debug = false,
  showLoading = false,
  gateName
}) => {
  const [isLoading, setIsLoading] = useState(showLoading);
  const componentName = gateName || 'CapabilityGate';

  const {
    hasCapability,
    hasAllCapabilities,
    activeCapabilities,
    resolvedCapabilities
  } = useCapabilities();

  // Loading simulation
  useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [showLoading]);

  try {
    // Determine access based on different check types
    let hasAccess = false;
    let debugInfo: any = {};

    if (moduleId) {
      // Module-based check
      hasAccess = shouldShowBusinessModule(moduleId, resolvedCapabilities);

      if (moduleFeature) {
        // Feature-specific check within module
        const moduleFeatures = getBusinessModuleFeatures(moduleId, resolvedCapabilities);
        const allFeatures = [...moduleFeatures.required, ...moduleFeatures.optional];
        hasAccess = hasAccess && allFeatures.includes(moduleFeature);

        debugInfo = {
          checkType: 'moduleFeature',
          moduleId,
          moduleFeature,
          moduleVisible: shouldShowBusinessModule(moduleId, resolvedCapabilities),
          featureAvailable: allFeatures.includes(moduleFeature),
          moduleFeatures
        };
      } else {
        debugInfo = {
          checkType: 'module',
          moduleId,
          moduleVisible: hasAccess
        };
      }
    } else if (capabilities) {
      // Capability-based check
      const capabilityArray = Array.isArray(capabilities) ? capabilities : [capabilities];

      hasAccess = mode === 'all'
        ? hasAllCapabilities(capabilityArray)
        : capabilityArray.some(cap => hasCapability(cap));

      debugInfo = {
        checkType: 'capabilities',
        requiredCapabilities: capabilityArray,
        mode,
        activeCapabilities: activeCapabilities.filter(cap => capabilityArray.includes(cap))
      };
    } else {
      // No criteria specified - allow access with warning
      hasAccess = true;
      if (debug) {
        console.warn('⚠️ CapabilityGate: No capabilities or moduleId specified - allowing access');
      }
    }

    // Debug logging
    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`🔒 ${componentName} Debug:`, {
        ...debugInfo,
        hasAccess,
        totalActiveCapabilities: activeCapabilities.length,
        totalResolvedCapabilities: resolvedCapabilities.length
      });
    }

    // Loading state
    if (isLoading) {
      return <>{loading || <LoadingSpinner message="Checking access..." />}</>;
    }

    // Access decision
    return hasAccess ? <>{children}</> : <>{fallback}</>;

  } catch (err) {
    if (debug) {
      console.error('❌ CapabilityGate Error:', err);
    }
    return <>{fallback}</>;
  }
});

CapabilityGate.displayName = 'CapabilityGate';

/**
 * Higher-order component version
 */
export const withCapabilityGate = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    capabilities?: BusinessCapability | BusinessCapability[];
    moduleId?: string;
    moduleFeature?: string;
    mode?: 'any' | 'all';
    fallback?: React.ReactNode;
    loading?: React.ReactNode;
    debug?: boolean;
    gateName?: string;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <CapabilityGate
      capabilities={options.capabilities}
      moduleId={options.moduleId}
      moduleFeature={options.moduleFeature}
      mode={options.mode}
      fallback={options.fallback}
      loading={options.loading}
      debug={options.debug}
      gateName={options.gateName || Component.displayName || Component.name}
    >
      <Component {...props} />
    </CapabilityGate>
  );

  WrappedComponent.displayName = `withCapabilityGate(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for capability checking within components
 */
export const useCapabilityCheck = (options: {
  capabilities?: BusinessCapability | BusinessCapability[];
  moduleId?: string;
  moduleFeature?: string;
  mode?: 'any' | 'all';
}) => {
  const {
    hasCapability,
    hasAllCapabilities,
    resolvedCapabilities,
    activeCapabilities
  } = useCapabilities();

  const { capabilities, moduleId, moduleFeature, mode = 'any' } = options;

  // Module + Feature check
  if (moduleId && moduleFeature) {
    const moduleVisible = shouldShowBusinessModule(moduleId, resolvedCapabilities);
    if (!moduleVisible) return { hasAccess: false, reason: 'Module not visible' };

    const moduleFeatures = getBusinessModuleFeatures(moduleId, resolvedCapabilities);
    const allFeatures = [...moduleFeatures.required, ...moduleFeatures.optional];
    const featureAvailable = allFeatures.includes(moduleFeature);

    return {
      hasAccess: featureAvailable,
      reason: featureAvailable ? 'Feature available' : 'Feature not available',
      debug: { moduleFeatures, moduleVisible, featureAvailable }
    };
  }

  // Module check
  if (moduleId) {
    const moduleVisible = shouldShowBusinessModule(moduleId, resolvedCapabilities);
    return {
      hasAccess: moduleVisible,
      reason: moduleVisible ? 'Module visible' : 'Module not visible',
      debug: { moduleVisible }
    };
  }

  // Capability check
  if (capabilities) {
    const capabilityArray = Array.isArray(capabilities) ? capabilities : [capabilities];
    const hasAccess = mode === 'all'
      ? hasAllCapabilities(capabilityArray)
      : capabilityArray.some(cap => hasCapability(cap));

    return {
      hasAccess,
      reason: hasAccess ? 'Capabilities met' : `Missing capabilities (${mode} mode)`,
      debug: {
        required: capabilityArray,
        active: activeCapabilities.filter(cap => capabilityArray.includes(cap)),
        mode
      }
    };
  }

  // No criteria
  return {
    hasAccess: true,
    reason: 'No criteria specified',
    debug: {}
  };
};

export default CapabilityGate;