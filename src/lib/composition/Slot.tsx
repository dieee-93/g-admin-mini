/**
 * Slot Component for G-Admin v3.0 Composition System
 * Implements flexible slot rendering with capability integration
 * Based on 2024 React slot pattern best practices
 */

import React, { ReactNode } from 'react';
import { useSlotContext, useSlotRegistration } from './SlotProvider';
import { useCapabilities } from '../capabilities/hooks/useCapabilities';
import { SlotConfig, CompoundSlotProps } from './types/SlotTypes';

/**
 * Base slot component props
 */
interface SlotProps extends CompoundSlotProps {
  /** Slot identifier */
  id: string;
  /** Display name for debugging */
  name?: string;
  /** Whether this slot is required */
  required?: boolean;
  /** Fallback content when slot is empty */
  fallback?: ReactNode;
  /** Wrapper element type */
  as?: keyof JSX.IntrinsicElements;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Generic Slot component for rendering slot content
 */
export const Slot: React.FC<SlotProps> = ({
  id,
  name = id,
  required = false,
  fallback = null,
  as: Element = 'div',
  className,
  debug = false,
  children,
  ...props
}) => {
  const { getSlot } = useSlotContext();

  // Register slot automatically
  useSlotRegistration({
    id,
    name,
    required
  });

  const slot = getSlot(id);
  const hasContent = slot?.activeContent || children;

  // Debug logging
  if (debug && process.env.NODE_ENV === 'development') {
    console.log(`🎰 Slot ${id} render:`, {
      hasContent: !!hasContent,
      activeContent: !!slot?.activeContent,
      childrenProvided: !!children,
      contentsCount: slot?.contents?.length || 0
    });
  }

  // If no content and required, show warning in development
  if (!hasContent && required && process.env.NODE_ENV === 'development') {
    console.warn(`🚨 Required slot "${id}" (${name}) has no content`);
  }

  // Render priority: slot.activeContent > children > fallback
  const contentToRender = slot?.activeContent || children || fallback;

  if (!contentToRender) {
    return null;
  }

  return (
    <Element className={className} {...props}>
      {contentToRender}
    </Element>
  );
};

/**
 * Capability-aware slot that only renders if user has required capabilities
 */
interface CapabilitySlotProps extends SlotProps {
  /** Required capabilities to render this slot */
  requiredCapabilities?: string[];
  /** Capability check mode */
  capabilityMode?: 'any' | 'all';
}

export const CapabilitySlot: React.FC<CapabilitySlotProps> = ({
  requiredCapabilities = [],
  capabilityMode = 'any',
  ...slotProps
}) => {
  const { hasCapability, hasAllCapabilities } = useCapabilities();

  // Check capabilities if specified
  if (requiredCapabilities.length > 0) {
    const hasAccess = capabilityMode === 'all'
      ? hasAllCapabilities(requiredCapabilities as any[])
      : requiredCapabilities.some(cap => hasCapability(cap as any));

    if (!hasAccess) {
      return null;
    }
  }

  return <Slot {...slotProps} />;
};

/**
 * Compound component base for creating slotted components
 */
interface CompoundComponentProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Creates a compound component with predefined slots
 */
export const createCompoundComponent = <T extends Record<string, SlotConfig>>(
  displayName: string,
  slots: T,
  WrapperComponent: React.ComponentType<CompoundComponentProps> = ({ children, ...props }) => (
    <div {...props}>{children}</div>
  )
) => {
  // Main component
  const CompoundComponent: React.FC<CompoundComponentProps> & {
    [K in keyof T]: React.FC<CompoundSlotProps>
  } = ({ children, ...props }) => {
    return (
      <WrapperComponent {...props}>
        {children}
      </WrapperComponent>
    );
  };

  // Add slot components as static properties
  Object.entries(slots).forEach(([key, slotConfig]) => {
    const SlotComponent: React.FC<CompoundSlotProps> = ({ children, ...props }) => (
      <Slot id={slotConfig.id} name={slotConfig.name} required={slotConfig.required} {...props}>
        {children}
      </Slot>
    );

    SlotComponent.displayName = `${displayName}.${key}`;
    (CompoundComponent as any)[key] = SlotComponent;
  });

  CompoundComponent.displayName = displayName;
  return CompoundComponent;
};

/**
 * Pre-built compound components for common patterns
 */

// Card compound component
export const Card = createCompoundComponent(
  'Card',
  {
    Header: { id: 'card-header', name: 'Card Header' },
    Body: { id: 'card-body', name: 'Card Body', required: true },
    Footer: { id: 'card-footer', name: 'Card Footer' }
  },
  ({ children, className, ...props }) => (
    <div className={`bg-white rounded-lg shadow-sm border ${className || ''}`} {...props}>
      {children}
    </div>
  )
);

// Dashboard compound component
export const Dashboard = createCompoundComponent(
  'Dashboard',
  {
    Header: { id: 'dashboard-header', name: 'Dashboard Header' },
    Sidebar: { id: 'dashboard-sidebar', name: 'Dashboard Sidebar' },
    Content: { id: 'dashboard-content', name: 'Dashboard Content', required: true },
    Footer: { id: 'dashboard-footer', name: 'Dashboard Footer' }
  },
  ({ children, className, ...props }) => (
    <div className={`min-h-screen flex flex-col ${className || ''}`} {...props}>
      {children}
    </div>
  )
);

// Module compound component
export const Module = createCompoundComponent(
  'Module',
  {
    Header: { id: 'module-header', name: 'Module Header' },
    Toolbar: { id: 'module-toolbar', name: 'Module Toolbar' },
    Content: { id: 'module-content', name: 'Module Content', required: true },
    Sidebar: { id: 'module-sidebar', name: 'Module Sidebar' },
    Footer: { id: 'module-footer', name: 'Module Footer' }
  },
  ({ children, className, ...props }) => (
    <div className={`flex-1 flex flex-col ${className || ''}`} {...props}>
      {children}
    </div>
  )
);