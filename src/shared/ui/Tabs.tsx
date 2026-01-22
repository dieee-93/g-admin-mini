// ============================================
// TABS - Chakra UI v3 Wrapper
// ============================================
// Wrapper for Chakra UI v3 Tabs component
// Provides tabbed interfaces

import { Tabs as ChakraTabs } from '@chakra-ui/react';
import type { TabsRootProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

// ============================================
// ROOT
// ============================================

/**
 * Tabs Root Component
 * Main container for tabs interface
 */
export const TabsRoot = ChakraTabs.Root;

// ============================================
// LIST
// ============================================

/**
 * Tabs List Component
 * Container for tab triggers
 */
export const TabsList = forwardRef<HTMLDivElement, ComponentProps<typeof ChakraTabs.List>>((props, ref) => (
  <ChakraTabs.List 
    ref={ref} 
    borderColor="border.default" 
    {...props} 
  />
));
TabsList.displayName = "TabsList";

// ============================================
// TRIGGER
// ============================================

/**
 * Tabs Trigger Component
 * Individual tab button
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, ComponentProps<typeof ChakraTabs.Trigger>>((props, ref) => (
  <ChakraTabs.Trigger
    ref={ref}
    color="text.secondary"
    _hover={{ bg: 'bg.subtle' }}
    _selected={{ 
      color: 'interactive.primary',
      ...props._selected
    }}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// ============================================
// CONTENT
// ============================================

/**
 * Tabs Content Component
 * Tab panel content
 */
export const TabsContent = ChakraTabs.Content;

// ============================================
// INDICATOR
// ============================================

/**
 * Tabs Indicator Component
 * Visual indicator for active tab
 */
export const TabsIndicator = forwardRef<HTMLDivElement, ComponentProps<typeof ChakraTabs.Indicator>>((props, ref) => (
  <ChakraTabs.Indicator 
    ref={ref} 
    bg="interactive.primary" 
    {...props} 
  />
));
TabsIndicator.displayName = "TabsIndicator";

// ============================================
// CONTENT GROUP
// ============================================

/**
 * Tabs Content Group Component
 * Container for multiple tab contents
 */
export const TabsContentGroup = ChakraTabs.ContentGroup;

// ============================================
// COMPOUND COMPONENT EXPORT
// ============================================

/**
 * Tabs Compound Component
 *
 * @example
 * ```tsx
 * import { Tabs } from '@/shared/ui';
 *
 * // Basic usage
 * <Tabs.Root defaultValue="members">
 *   <Tabs.List>
 *     <Tabs.Trigger value="members">Members</Tabs.Trigger>
 *     <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
 *     <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="members">Manage your team members</Tabs.Content>
 *   <Tabs.Content value="projects">Manage your projects</Tabs.Content>
 *   <Tabs.Content value="tasks">Manage your tasks</Tabs.Content>
 * </Tabs.Root>
 *
 * // Controlled state
 * const [value, setValue] = useState('first');
 * <Tabs.Root value={value} onValueChange={(e) => setValue(e.value)}>
 *   <Tabs.List>
 *     <Tabs.Trigger value="first">First</Tabs.Trigger>
 *     <Tabs.Trigger value="second">Second</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="first">First panel</Tabs.Content>
 *   <Tabs.Content value="second">Second panel</Tabs.Content>
 * </Tabs.Root>
 *
 * // With variants
 * <Tabs.Root defaultValue="tab-1" variant="line">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab-1">Line variant (default)</Tabs.Content>
 *   <Tabs.Content value="tab-2">Content 2</Tabs.Content>
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" variant="subtle">
 *   // Subtle variant
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" variant="enclosed">
 *   // Enclosed variant
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" variant="outline">
 *   // Outline variant
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" variant="plain">
 *   // Plain variant (use with Indicator)
 * </Tabs.Root>
 *
 * // With indicator (for plain variant)
 * <Tabs.Root defaultValue="members" variant="plain">
 *   <Tabs.List bg="bg.muted" rounded="l3" p="1">
 *     <Tabs.Trigger value="members">Members</Tabs.Trigger>
 *     <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
 *     <Tabs.Indicator rounded="l2" />
 *   </Tabs.List>
 *   <Tabs.Content value="members">Members content</Tabs.Content>
 *   <Tabs.Content value="projects">Projects content</Tabs.Content>
 * </Tabs.Root>
 *
 * // With icons
 * import { UserIcon, FolderIcon } from '@heroicons/react/24/outline';
 *
 * <Tabs.Root defaultValue="members">
 *   <Tabs.List>
 *     <Tabs.Trigger value="members">
 *       <UserIcon width={16} height={16} />
 *       Members
 *     </Tabs.Trigger>
 *     <Tabs.Trigger value="projects">
 *       <FolderIcon width={16} height={16} />
 *       Projects
 *     </Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="members">Content</Tabs.Content>
 *   <Tabs.Content value="projects">Content</Tabs.Content>
 * </Tabs.Root>
 *
 * // Disabled tab
 * <Tabs.Root defaultValue="members">
 *   <Tabs.List>
 *     <Tabs.Trigger value="members">Members</Tabs.Trigger>
 *     <Tabs.Trigger value="projects" disabled>
 *       Projects (Disabled)
 *     </Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="members">Content</Tabs.Content>
 * </Tabs.Root>
 *
 * // Lazy mounted (unmounts on exit)
 * <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab-1">Lazy content 1</Tabs.Content>
 *   <Tabs.Content value="tab-2">Lazy content 2</Tabs.Content>
 * </Tabs.Root>
 *
 * // Vertical orientation
 * <Tabs.Root defaultValue="members" orientation="vertical">
 *   <Tabs.List>
 *     <Tabs.Trigger value="members">Members</Tabs.Trigger>
 *     <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="members">Content</Tabs.Content>
 *   <Tabs.Content value="projects">Content</Tabs.Content>
 * </Tabs.Root>
 *
 * // Sizes
 * <Tabs.Root defaultValue="tab-1" size="sm">
 *   // Small
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" size="md">
 *   // Medium (default)
 * </Tabs.Root>
 *
 * <Tabs.Root defaultValue="tab-1" size="lg">
 *   // Large
 * </Tabs.Root>
 *
 * // Color palette
 * <Tabs.Root defaultValue="tab-1" colorPalette="blue">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab-1">Blue palette</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab-1">Content</Tabs.Content>
 * </Tabs.Root>
 *
 * // Fitted tabs
 * <Tabs.Root defaultValue="tab-1" variant="enclosed" fitted maxW="md">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
 *     <Tabs.Trigger value="tab-3">Tab 3</Tabs.Trigger>
 *   </Tabs.List>
 * </Tabs.Root>
 * ```
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
  ContentGroup: TabsContentGroup
};

// ============================================
// TYPE EXPORTS
// ============================================

export type { TabsRootProps };
