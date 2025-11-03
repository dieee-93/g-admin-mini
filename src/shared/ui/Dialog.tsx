/**
 * Dialog Component - ChakraUI v3 Wrapper
 *
 * A wrapper for ChakraUI v3 Dialog component (replacement for Modal from v2).
 * Uses namespace pattern (Dialog.Root, Dialog.Header, etc.) for better DX.
 *
 * @see https://www.chakra-ui.com/docs/components/dialog
 *
 * ARCHITECTURE:
 * - Dialog in ChakraUI v3 uses a composition pattern with multiple sub-components
 * - Each Dialog.* component is a separate piece that composes together
 * - Must use Dialog.Root as the outer container (NOT just Dialog)
 *
 * MIGRATION FROM V2 MODAL:
 * - Modal → Dialog.Root
 * - ModalOverlay → Dialog.Backdrop
 * - ModalContent → Dialog.Content (wrapped in Dialog.Positioner)
 * - ModalHeader → Dialog.Header
 * - ModalBody → Dialog.Body
 * - ModalFooter → Dialog.Footer
 * - ModalCloseButton → Dialog.CloseTrigger
 *
 * @example Basic Usage
 * ```tsx
 * import { Dialog, Button } from '@/shared/ui';
 *
 * function MyComponent() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
 *       <Dialog.Backdrop />
 *       <Dialog.Positioner>
 *         <Dialog.Content>
 *           <Dialog.Header>
 *             <Dialog.Title>Dialog Title</Dialog.Title>
 *           </Dialog.Header>
 *
 *           <Dialog.Body>
 *             <p>Your content here</p>
 *           </Dialog.Body>
 *
 *           <Dialog.Footer>
 *             <Dialog.CloseTrigger asChild>
 *               <Button variant="outline">Cancel</Button>
 *             </Dialog.CloseTrigger>
 *             <Button onClick={handleSave}>Save</Button>
 *           </Dialog.Footer>
 *
 *           <Dialog.CloseTrigger />
 *         </Dialog.Content>
 *       </Dialog.Positioner>
 *     </Dialog.Root>
 *   );
 * }
 * ```
 *
 * @example With Trigger Button
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger asChild>
 *     <Button>Open Dialog</Button>
 *   </Dialog.Trigger>
 *
 *   <Dialog.Backdrop />
 *   <Dialog.Positioner>
 *     <Dialog.Content>
 *       <Dialog.Header>
 *         <Dialog.Title>Dialog Title</Dialog.Title>
 *       </Dialog.Header>
 *       <Dialog.Body>Content here</Dialog.Body>
 *     </Dialog.Content>
 *   </Dialog.Positioner>
 * </Dialog.Root>
 * ```
 *
 * @example Controlled State
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Dialog.Root
 *   open={isOpen}
 *   onOpenChange={(e) => setIsOpen(e.open)}
 * >
 *   // ... dialog content
 * </Dialog.Root>
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * // Options: xs, sm, md, lg, xl, full, cover
 * <Dialog.Root size="sm">
 *   // ... dialog content
 * </Dialog.Root>
 * ```
 *
 * @example Different Placements
 * ```tsx
 * // Options: top, center, bottom
 * <Dialog.Root placement="center">
 *   // ... dialog content
 * </Dialog.Root>
 * ```
 *
 * @example Motion Presets
 * ```tsx
 * // Options: scale, slide-in-bottom, slide-in-top, slide-in-left, slide-in-right, none
 * <Dialog.Root motionPreset="slide-in-bottom">
 *   // ... dialog content
 * </Dialog.Root>
 * ```
 *
 * @example Non-Modal (doesn't block interactions)
 * ```tsx
 * <Dialog.Root modal={false} closeOnInteractOutside={false}>
 *   // ... dialog content
 * </Dialog.Root>
 * ```
 *
 * @example With Initial Focus
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 *
 * <Dialog.Root initialFocusEl={() => inputRef.current}>
 *   <Dialog.Body>
 *     <input ref={inputRef} placeholder="This will be focused" />
 *   </Dialog.Body>
 * </Dialog.Root>
 * ```
 *
 * @example Alert Dialog (for confirmations)
 * ```tsx
 * <Dialog.Root role="alertdialog">
 *   <Dialog.Header>
 *     <Dialog.Title>Are you sure?</Dialog.Title>
 *   </Dialog.Header>
 *   <Dialog.Body>
 *     This action cannot be undone.
 *   </Dialog.Body>
 *   <Dialog.Footer>
 *     <Button colorPalette="red">Delete</Button>
 *   </Dialog.Footer>
 * </Dialog.Root>
 * ```
 *
 * KEY PROPS:
 *
 * Dialog.Root:
 * - open: boolean - Controlled open state
 * - onOpenChange: (details: {open: boolean}) => void - State change handler
 * - defaultOpen: boolean - Initial open state (uncontrolled)
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'cover' - Dialog size
 * - placement: 'top' | 'center' | 'bottom' - Vertical placement
 * - motionPreset: 'scale' | 'slide-in-*' | 'none' - Animation style
 * - modal: boolean (default: true) - Whether to block interactions outside
 * - closeOnEscape: boolean (default: true) - Close on ESC key
 * - closeOnInteractOutside: boolean (default: true) - Close on outside click
 * - trapFocus: boolean (default: true) - Trap focus inside dialog
 * - preventScroll: boolean (default: true) - Prevent body scroll
 * - initialFocusEl: () => HTMLElement - Element to focus on open
 * - finalFocusEl: () => HTMLElement - Element to focus on close
 * - role: 'dialog' | 'alertdialog' - ARIA role
 * - lazyMount: boolean - Lazy mount dialog content
 * - unmountOnExit: boolean - Unmount content when closed
 *
 * Dialog.Content:
 * - portalled: boolean - Render in portal (default: true)
 * - backdrop: boolean - Show backdrop (default: true)
 *
 * Dialog.CloseTrigger:
 * - asChild: boolean - Use child as trigger element
 *
 * COMMON PATTERNS:
 *
 * 1. Simple confirmation dialog
 * 2. Form dialog with validation
 * 3. Multi-step wizard dialog
 * 4. Full-screen dialog
 * 5. Non-modal dialog (sidepanel style)
 * 6. Alert/confirmation dialog
 * 7. Nested dialogs
 *
 * ACCESSIBILITY:
 * - Automatically traps focus inside dialog
 * - ESC key closes dialog
 * - Outside click closes dialog
 * - Proper ARIA labels and roles
 * - Focus management on open/close
 * - Screen reader announcements
 */

import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogActionTrigger,
  type DialogRootProps,
  type DialogContentProps,
  type DialogHeaderProps,
  type DialogBodyProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseTriggerProps,
  type DialogBackdropProps,
  type DialogPositionerProps,
  type DialogActionTriggerProps,
  type DialogTriggerProps
} from '@chakra-ui/react';

/**
 * Dialog namespace object
 * Use as: Dialog.Root, Dialog.Header, Dialog.Body, etc.
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  CloseTrigger: DialogCloseTrigger,
  Backdrop: DialogBackdrop,
  Positioner: DialogPositioner,
  ActionTrigger: DialogActionTrigger
};

/**
 * Re-export types for external use
 */
export type {
  DialogRootProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogActionTriggerProps,
  DialogTriggerProps
};

/**
 * Re-export individual components for direct imports if needed
 * (though namespace usage is preferred)
 */
export {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogActionTrigger
};
