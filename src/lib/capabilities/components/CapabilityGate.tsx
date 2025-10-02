/**
 * UNIFIED CAPABILITY GATE - Sistema simplificado y efectivo
 *
 * REEMPLAZA COMPLETAMENTE:
 * - CapabilityGate.tsx complejo (200+ líneas)
 * - Lógica confusa de moduleId + moduleFeature
 * - Sistema de lazy loading innecesario
 *
 * SIMPLIFICA: Una lógica, casos claros, fácil de entender
 */

import React from 'react';
import { useCapabilityStore } from '@/store/capabilityStore';
import { CapabilityEngine } from '../core/CapabilityEngine';
import type { CapabilityId } from '../types/UnifiedCapabilities';

import { logger } from '@/lib/logging';
// ============================================
// CAPABILITY GATE PROPS
// ============================================

interface CapabilityGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;

  // OPTION 1: Check capability directly
  capability?: CapabilityId;

  // OPTION 2: Check module visibility
  moduleId?: string;

  // OPTION 3: Check module feature
  moduleFeature?: {
    moduleId: string;
    feature: string;
    requiredState?: 'enabled' | 'required';
  };

  // OPTION 4: Check UI effect
  uiTarget?: string;

  // Logic mode
  mode?: 'any' | 'all';
}

// ============================================
// CAPABILITY GATE COMPONENT
// ============================================

export function CapabilityGate({
  children,
  fallback = null,
  capability,
  moduleId,
  moduleFeature,
  uiTarget,
  mode = 'any'
}: CapabilityGateProps) {
  const configuration = useCapabilityStore(state => state.configuration);

  // No configuration = no access (setup not completed)
  if (!configuration) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  // OPTION 1: Capability check
  if (capability) {
    hasAccess = CapabilityEngine.hasCapability(configuration, capability);
  }

  // OPTION 2: Module visibility check
  else if (moduleId && !moduleFeature) {
    hasAccess = CapabilityEngine.isModuleVisible(configuration, moduleId);
  }

  // OPTION 3: Module feature check
  else if (moduleFeature) {
    const moduleVisible = CapabilityEngine.isModuleVisible(configuration, moduleFeature.moduleId);
    if (!moduleVisible) {
      hasAccess = false;
    } else {
      const features = CapabilityEngine.getModuleFeatures(configuration, moduleFeature.moduleId);
      const featureState = features[moduleFeature.feature];

      if (moduleFeature.requiredState) {
        hasAccess = featureState === moduleFeature.requiredState;
      } else {
        hasAccess = featureState === 'enabled' || featureState === 'required';
      }
    }
  }

  // OPTION 4: UI target check
  else if (uiTarget) {
    hasAccess = CapabilityEngine.isUIFeatureActive(configuration, uiTarget);
  }

  // Default: deny access if no valid option provided
  else {
    logger.warn('App', 'CapabilityGate: No valid check option provided');
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ============================================
// CONVENIENCE COMPONENTS
// ============================================

/**
 * Gate específico para capabilities
 */
export function CapabilityCheck({
  capability,
  children,
  fallback
}: {
  capability: CapabilityId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <CapabilityGate capability={capability} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

/**
 * Gate específico para módulos
 */
export function ModuleGate({
  moduleId,
  children,
  fallback
}: {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <CapabilityGate moduleId={moduleId} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

/**
 * Gate específico para features de módulo
 */
export function FeatureGate({
  moduleId,
  feature,
  requiredState,
  children,
  fallback
}: {
  moduleId: string;
  feature: string;
  requiredState?: 'enabled' | 'required';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <CapabilityGate
      moduleFeature={{ moduleId, feature, requiredState }}
      fallback={fallback}
    >
      {children}
    </CapabilityGate>
  );
}

/**
 * Gate específico para UI targets
 */
export function UIGate({
  target,
  children,
  fallback
}: {
  target: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <CapabilityGate uiTarget={target} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}

// ============================================
// HOC PATTERN (Advanced)
// ============================================

/**
 * HOC para proteger componentes completos
 */
export function withCapabilityGate<P extends object>(
  Component: React.ComponentType<P>,
  gateProps: Omit<CapabilityGateProps, 'children' | 'fallback'>,
  fallback?: React.ReactNode
) {
  return function CapabilityProtectedComponent(props: P) {
    return (
      <CapabilityGate {...gateProps} fallback={fallback}>
        <Component {...props} />
      </CapabilityGate>
    );
  };
}

// ============================================
// DEBUGGING HELPERS
// ============================================

/**
 * Component para debugging - shows gate status
 */
export function DebugCapabilityGate(props: CapabilityGateProps & { label?: string }) {
  const configuration = useCapabilityStore(state => state.configuration);

  if (process.env.NODE_ENV !== 'development') {
    return <CapabilityGate {...props} />;
  }

  const { label = 'Debug Gate', ...gateProps } = props;

  return (
    <div style={{ border: '1px dashed #ccc', padding: '8px', margin: '4px' }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
        🔍 {label} - Config: {configuration ? '✅' : '❌'}
      </div>
      <CapabilityGate {...gateProps} />
    </div>
  );
}