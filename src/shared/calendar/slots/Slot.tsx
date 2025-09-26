/**
 * SLOT COMPONENT - G-ADMIN MINI v3.0
 *
 * Core slot component for business-model-specific customization
 * Enables dynamic content injection based on business context
 *
 * @version 3.0.0
 */

import React, { useMemo } from 'react';
import { SlotRegistry, getSlotComponent } from './SlotRegistry';

// ===============================
// SLOT INTERFACES
// ===============================

/**
 * Slot component props
 */
export interface SlotProps {
  /**
   * Unique slot name/identifier
   */
  readonly name: string;

  /**
   * Business model context for slot selection
   */
  readonly businessModel: string;

  /**
   * Props to pass to the slot component
   */
  readonly props?: Record<string, unknown>;

  /**
   * Fallback component if no slot is registered
   */
  readonly fallback?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  readonly className?: string;

  /**
   * Inline styles
   */
  readonly style?: React.CSSProperties;

  /**
   * Enable/disable slot rendering
   */
  readonly enabled?: boolean;

  /**
   * Render mode for slot content
   */
  readonly renderMode?: 'replace' | 'wrap' | 'append' | 'prepend';

  /**
   * Wrapper component for slot content
   */
  readonly wrapper?: React.ComponentType<{ children: React.ReactNode }>;

  /**
   * Error boundary for slot errors
   */
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Slot context interface
 */
export interface SlotContext {
  readonly businessModel: string;
  readonly slotName: string;
  readonly props: Record<string, unknown>;
  readonly registry: SlotRegistry;
}

// ===============================
// ERROR BOUNDARY
// ===============================

/**
 * Error boundary for slot components
 */
class SlotErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    slotName: string;
  },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in slot "${this.props.slotName}":`, error);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '16px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #F87171',
          borderRadius: '8px',
          color: '#991B1B'
        }}>
          <strong>Slot Error:</strong> Failed to render slot "{this.props.slotName}"
        </div>
      );
    }

    return this.props.children;
  }
}

// ===============================
// MAIN SLOT COMPONENT
// ===============================

/**
 * Slot Component
 *
 * Renders business-model-specific components based on slot registration
 * Provides fallback and error handling capabilities
 */
export function Slot({
  name,
  businessModel,
  props = {},
  fallback = null,
  className,
  style,
  enabled = true,
  renderMode = 'replace',
  wrapper: Wrapper,
  onError
}: SlotProps) {
  // ===============================
  // SLOT RESOLUTION
  // ===============================

  const slotComponent = useMemo(() => {
    if (!enabled) return null;

    // Try to get business-model-specific slot first
    const specificSlot = getSlotComponent(`${businessModel}-${name}`);
    if (specificSlot) {
      return specificSlot;
    }

    // Fall back to generic slot
    const genericSlot = getSlotComponent(name);
    if (genericSlot) {
      return genericSlot;
    }

    // No slot found
    return null;
  }, [name, businessModel, enabled]);

  // ===============================
  // SLOT CONTEXT
  // ===============================

  const slotContext = useMemo((): SlotContext => ({
    businessModel,
    slotName: name,
    props,
    registry: SlotRegistry.getInstance()
  }), [businessModel, name, props]);

  // ===============================
  // RENDER LOGIC
  // ===============================

  // If disabled, render nothing
  if (!enabled) {
    return null;
  }

  // Prepare slot content
  let slotContent: React.ReactNode = null;

  if (slotComponent) {
    // Render registered slot component
    const SlotComponent = slotComponent;
    slotContent = (
      <SlotComponent
        {...props}
        slotContext={slotContext}
      />
    );
  } else {
    // Use fallback
    slotContent = fallback;
  }

  // Apply render mode
  let finalContent: React.ReactNode;

  switch (renderMode) {
    case 'wrap':
      finalContent = (
        <>
          {fallback}
          {slotContent}
        </>
      );
      break;

    case 'append':
      finalContent = (
        <>
          {fallback}
          {slotContent}
        </>
      );
      break;

    case 'prepend':
      finalContent = (
        <>
          {slotContent}
          {fallback}
        </>
      );
      break;

    case 'replace':
    default:
      finalContent = slotContent || fallback;
      break;
  }

  // Apply wrapper if provided
  if (Wrapper && finalContent) {
    finalContent = <Wrapper>{finalContent}</Wrapper>;
  }

  // If no content to render
  if (!finalContent) {
    return null;
  }

  // Render with error boundary
  return (
    <SlotErrorBoundary
      fallback={fallback}
      onError={onError}
      slotName={name}
    >
      <div
        className={className}
        style={style}
        data-slot={name}
        data-business-model={businessModel}
      >
        {finalContent}
      </div>
    </SlotErrorBoundary>
  );
}

// ===============================
// SPECIALIZED SLOT COMPONENTS
// ===============================

/**
 * Conditional slot that only renders if condition is met
 */
export function ConditionalSlot({
  condition,
  ...slotProps
}: SlotProps & { condition: boolean }) {
  if (!condition) {
    return null;
  }

  return <Slot {...slotProps} />;
}

/**
 * Slot with loading state
 */
export function AsyncSlot({
  loading,
  loadingComponent,
  ...slotProps
}: SlotProps & {
  loading: boolean;
  loadingComponent?: React.ReactNode;
}) {
  if (loading) {
    return loadingComponent || (
      <div style={{ textAlign: 'center', padding: '16px' }}>
        Loading slot...
      </div>
    );
  }

  return <Slot {...slotProps} />;
}

/**
 * Multiple slots in a container
 */
export function SlotGroup({
  slots,
  businessModel,
  direction = 'column',
  gap = '16px',
  className,
  style
}: {
  slots: Array<{
    name: string;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
  }>;
  businessModel: string;
  direction?: 'row' | 'column';
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap,
        ...style
      }}
    >
      {slots.map((slot, index) => (
        <Slot
          key={`${slot.name}-${index}`}
          name={slot.name}
          businessModel={businessModel}
          props={slot.props}
          fallback={slot.fallback}
        />
      ))}
    </div>
  );
}

// ===============================
// SLOT HOOKS
// ===============================

/**
 * Hook to check if a slot is registered
 */
export function useSlotRegistered(name: string, businessModel?: string): boolean {
  return useMemo(() => {
    if (businessModel) {
      const specificSlot = getSlotComponent(`${businessModel}-${name}`);
      if (specificSlot) return true;
    }

    const genericSlot = getSlotComponent(name);
    return !!genericSlot;
  }, [name, businessModel]);
}

/**
 * Hook to get slot context
 */
export function useSlotContext(): SlotContext | null {
  // This would be provided by a SlotProvider in a real implementation
  // For now, return null as we don't have React context set up
  return null;
}

// ===============================
// EXPORTS
// ===============================

export default Slot;
export type { SlotContext };