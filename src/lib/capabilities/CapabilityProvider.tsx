/**
 * CapabilityProvider for G-Admin v3.0
 * Provides React Context for capabilities system
 * Integrates with existing businessCapabilitiesStore
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useCapabilities } from './hooks/useCapabilities';
import type { BusinessCapability } from './types/BusinessCapabilities';
import type { BusinessModel } from './types/BusinessModels';

interface CapabilityContextValue {
  // Current state
  businessModel: BusinessModel | null;
  activeCapabilities: BusinessCapability[];
  enabledModules: string[];

  // Capability checking functions
  hasCapability: (capability: BusinessCapability) => boolean;
  hasAllCapabilities: (capabilities: BusinessCapability[]) => boolean;
  hasAnyCapability: (capabilities: BusinessCapability[]) => boolean;

  // Module checking functions
  hasModule: (moduleId: string) => boolean;

  // Status
  isSetupComplete: boolean;
  operationalTier: string;

  // Debug mode
  debugMode: boolean;
}

const CapabilityContext = createContext<CapabilityContextValue | null>(null);

interface CapabilityProviderProps {
  children: React.ReactNode;
  /**
   * Enable debug mode for development
   * Shows capability checking in console
   */
  debugMode?: boolean;
  /**
   * Fallback component while capabilities are loading
   */
  fallback?: React.ReactNode;
}

/**
 * CapabilityProvider - Provides capability context to the application
 *
 * Should be placed high in the component tree, typically in App.tsx
 *
 * @example
 * <CapabilityProvider debugMode={process.env.NODE_ENV === 'development'}>
 *   <App />
 * </CapabilityProvider>
 */
export const CapabilityProvider: React.FC<CapabilityProviderProps> = ({
  children,
  debugMode = false,
  fallback = null
}) => {
  const capabilities = useCapabilities();

  // Context value with debug mode
  const contextValue: CapabilityContextValue = useMemo(() => ({
    businessModel: capabilities.businessModel,
    activeCapabilities: capabilities.activeCapabilities,
    enabledModules: capabilities.enabledModules,
    hasCapability: capabilities.hasCapability,
    hasAllCapabilities: capabilities.hasAllCapabilities,
    hasAnyCapability: capabilities.hasAnyCapability,
    hasModule: capabilities.hasModule,
    isSetupComplete: capabilities.isSetupComplete,
    operationalTier: capabilities.operationalTier,
    debugMode
  }), [capabilities, debugMode]);

  // Debug logging
  useEffect(() => {
    if (debugMode && process.env.NODE_ENV === 'development') {
      console.log('🔧 CapabilityProvider Debug Info:', {
        businessModel: capabilities.businessModel,
        activeCapabilities: capabilities.activeCapabilities,
        enabledModules: capabilities.enabledModules,
        isSetupComplete: capabilities.isSetupComplete,
        operationalTier: capabilities.operationalTier,
        timestamp: new Date().toISOString()
      });
    }
  }, [capabilities, debugMode]);

  // Show fallback if not setup complete and fallback provided
  if (!capabilities.isSetupComplete && fallback) {
    return <>{fallback}</>;
  }

  return (
    <CapabilityContext.Provider value={contextValue}>
      {children}
    </CapabilityContext.Provider>
  );
};

/**
 * Hook to access capability context
 * Throws error if used outside CapabilityProvider
 */
export const useCapabilityContext = (): CapabilityContextValue => {
  const context = useContext(CapabilityContext);

  if (!context) {
    throw new Error(
      'useCapabilityContext must be used within a CapabilityProvider. ' +
      'Make sure to wrap your app with <CapabilityProvider>.'
    );
  }

  return context;
};

/**
 * Hook to check if capability context is available
 * Returns null if not available, context value if available
 */
export const useOptionalCapabilityContext = (): CapabilityContextValue | null => {
  return useContext(CapabilityContext);
};

/**
 * Higher-order component that ensures capability context is available
 */
export const withCapabilityProvider = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    debugMode?: boolean;
    fallback?: React.ReactNode;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <CapabilityProvider
      debugMode={options?.debugMode}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </CapabilityProvider>
  );

  WrappedComponent.displayName = `withCapabilityProvider(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Development-only component for debugging capabilities
 * Renders capability information in a debug panel
 */
export const CapabilityDebugPanel: React.FC<{
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({
  visible = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}) => {
  const context = useOptionalCapabilityContext();

  if (!visible || !context) return null;

  const positionStyles = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  };

  return (
    <div style={{
      position: 'fixed',
      ...positionStyles[position],
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#4ade80' }}>
        🔧 Capability Debug Panel
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Business Model:</strong> {context.businessModel || 'None'}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Setup Complete:</strong> {context.isSetupComplete ? '✅' : '❌'}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Operational Tier:</strong> {context.operationalTier}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Enabled Modules ({context.enabledModules.length}):</strong>
      </div>
      <div style={{ marginLeft: '8px', marginBottom: '8px' }}>
        {context.enabledModules.map(module => (
          <div key={module} style={{ color: '#60a5fa' }}>
            📦 {module}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Active Capabilities ({context.activeCapabilities.length}):</strong>
      </div>
      <div style={{ marginLeft: '8px', maxHeight: '100px', overflow: 'auto' }}>
        {context.activeCapabilities.map(cap => (
          <div key={cap} style={{ color: '#4ade80', fontSize: '10px' }}>
            ✅ {cap}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Component that shows capability requirements for development
 * Useful for debugging why components are not rendering
 */
export const CapabilityRequirements: React.FC<{
  required: BusinessCapability[];
  mode?: 'any' | 'all';
  showInProduction?: boolean;
}> = ({
  required,
  mode = 'any',
  showInProduction = false
}) => {
  const context = useOptionalCapabilityContext();

  if (!showInProduction && process.env.NODE_ENV === 'production') return null;
  if (!context) return null;

  const hasAccess = mode === 'all'
    ? context.hasAllCapabilities(required)
    : context.hasAnyCapability(required);

  return (
    <div style={{
      background: hasAccess ? '#065f46' : '#7f1d1d',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      margin: '4px 0',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold' }}>
        {hasAccess ? '✅' : '❌'} Requirements ({mode} mode)
      </div>
      {required.map(cap => (
        <div key={cap} style={{
          color: context.hasCapability(cap) ? '#4ade80' : '#f87171',
          marginLeft: '12px'
        }}>
          {context.hasCapability(cap) ? '✅' : '❌'} {cap}
        </div>
      ))}
    </div>
  );
};