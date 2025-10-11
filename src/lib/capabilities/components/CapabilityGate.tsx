/**
 * CapabilityGate - Feature-based conditional rendering
 * Compatible with Feature System v4.0
 */

import React from 'react';
import { useCapabilities } from '@/store/capabilityStore';

interface CapabilityGateProps {
  children: React.ReactNode;

  // Single capability/feature requirement
  capability?: string;

  // Multiple capabilities (OR logic - any one matches)
  requires?: string[];

  // Multiple capabilities (AND logic - all must match)
  requiresAll?: string[];

  // Fallback content when requirements not met
  fallback?: React.ReactNode;

  // Show reason for hiding (development only)
  showReason?: boolean;
}

/**
 * Conditionally render children based on feature availability
 *
 * @example
 * // Single feature check
 * <CapabilityGate capability="advanced_analytics">
 *   <AdvancedChart />
 * </CapabilityGate>
 *
 * @example
 * // Multiple features (OR logic)
 * <CapabilityGate requires={['inventory_management', 'production_tracking']}>
 *   <MaterialsModule />
 * </CapabilityGate>
 *
 * @example
 * // Multiple features (AND logic)
 * <CapabilityGate requiresAll={['scheduling', 'staff_management']}>
 *   <SchedulingModule />
 * </CapabilityGate>
 */
export function CapabilityGate({
  children,
  capability,
  requires,
  requiresAll,
  fallback,
  showReason = false
}: CapabilityGateProps) {
  const { hasFeature } = useCapabilities();

  // Single capability check
  if (capability) {
    const hasCapability = hasFeature(capability);

    if (!hasCapability) {
      if (showReason && process.env.NODE_ENV === 'development') {
        return (
          <div style={{
            padding: '1rem',
            background: '#fef3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            ⚠️ Missing capability: <code>{capability}</code>
          </div>
        );
      }
      return <>{fallback}</> || null;
    }

    return <>{children}</>;
  }

  // OR logic - any one feature matches
  if (requires && requires.length > 0) {
    const hasAnyFeature = requires.some(feat => hasFeature(feat));

    if (!hasAnyFeature) {
      if (showReason && process.env.NODE_ENV === 'development') {
        return (
          <div style={{
            padding: '1rem',
            background: '#fef3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            ⚠️ Requires one of: <code>{requires.join(', ')}</code>
          </div>
        );
      }
      return <>{fallback}</> || null;
    }

    return <>{children}</>;
  }

  // AND logic - all features must be present
  if (requiresAll && requiresAll.length > 0) {
    const hasAllFeatures = requiresAll.every(feat => hasFeature(feat));

    if (!hasAllFeatures) {
      const missingFeatures = requiresAll.filter(feat => !hasFeature(feat));

      if (showReason && process.env.NODE_ENV === 'development') {
        return (
          <div style={{
            padding: '1rem',
            background: '#fef3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            ⚠️ Missing features: <code>{missingFeatures.join(', ')}</code>
          </div>
        );
      }
      return <>{fallback}</> || null;
    }

    return <>{children}</>;
  }

  // No requirements specified - render children
  return <>{children}</>;
}

/**
 * Hook for imperative capability checks in logic
 *
 * @example
 * const { can } = useCapabilityCheck();
 *
 * if (can('advanced_analytics')) {
 *   // Show advanced features
 * }
 */
export function useCapabilityCheck() {
  const { hasFeature } = useCapabilities();

  return {
    can: (capability: string) => hasFeature(capability),
    hasFeature
  };
}
