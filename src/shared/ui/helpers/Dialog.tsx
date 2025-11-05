/**
 * Dialog Helpers - Composition patterns for common dialog use cases
 *
 * LAYER 2.5: HELPERS
 * Purpose: Simplifies ChakraUI v3 Dialog for common patterns
 *
 * Why helpers instead of semantic components?
 * - ChakraUI v3 Dialog already has excellent accessibility (WCAG AA+)
 * - Already includes: focus trap, aria-label, role, keyboard nav, scroll lock
 * - Helpers add: auto-generated IDs, simplified API, common patterns
 *
 * Best Practices (based on React Aria + Radix UI):
 * - Auto-generate IDs with useId() for aria-labelledby
 * - Provide common patterns: Confirm, Alert, Form
 * - Maintain ChakraUI flexibility for advanced cases
 *
 * References:
 * - React Aria: useDialog hook patterns
 * - ChakraUI v3: Dialog component (already WCAG compliant)
 * - Radix UI: Dialog composition patterns
 */

import { useId } from 'react';
import {
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
  DialogActionTrigger
} from '../Dialog';
import { Button } from '../Button';
import type { ReactNode } from 'react';

// ===============================
// CONFIRM DIALOG
// ===============================

interface DialogConfirmProps {
  /** Dialog title */
  title: string;

  /** Dialog description/message */
  description?: string;

  /** Confirm button label */
  confirmLabel?: string;

  /** Cancel button label */
  cancelLabel?: string;

  /** Confirm button color palette */
  confirmColorPalette?: string;

  /** Callback when confirmed */
  onConfirm?: () => void;

  /** Callback when cancelled */
  onCancel?: () => void;

  /** Trigger element */
  trigger: ReactNode;

  /** Whether dialog is open (controlled) */
  open?: boolean;

  /** Callback when open state changes */
  onOpenChange?: (details: { open: boolean }) => void;

  /** Whether confirm action is loading */
  loading?: boolean;

  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * DialogConfirm - Confirmation dialog helper
 *
 * ✅ Auto-generates IDs with useId()
 * ✅ Simplifies common confirm pattern
 * ✅ Maintains ChakraUI accessibility
 *
 * @example
 * <Dialog.Confirm
 *   title="Delete Material"
 *   description="Are you sure? This action cannot be undone."
 *   confirmLabel="Delete"
 *   confirmColorPalette="red"
 *   onConfirm={handleDelete}
 *   trigger={<Button>Delete</Button>}
 * />
 */
export function DialogConfirm({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColorPalette = 'blue',
  onConfirm,
  onCancel,
  trigger,
  open,
  onOpenChange,
  loading,
  size = 'md'
}: DialogConfirmProps) {
  // ✅ Auto-generate stable ID for aria-labelledby
  const titleId = useId();

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      role="dialog"
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogBackdrop />

      <DialogPositioner>
        <DialogContent aria-labelledby={titleId}>
          <DialogHeader>
            <DialogTitle id={titleId}>{title}</DialogTitle>
          </DialogHeader>

          {description && (
            <DialogBody>
              <DialogDescription>{description}</DialogDescription>
            </DialogBody>
          )}

          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            </DialogActionTrigger>

            <Button
              colorPalette={confirmColorPalette}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

// ===============================
// ALERT DIALOG
// ===============================

interface DialogAlertProps {
  /** Alert title */
  title: string;

  /** Alert message */
  message: string;

  /** Acknowledge button label */
  acknowledgeLabel?: string;

  /** Callback when acknowledged */
  onAcknowledge?: () => void;

  /** Trigger element */
  trigger: ReactNode;

  /** Whether dialog is open (controlled) */
  open?: boolean;

  /** Callback when open state changes */
  onOpenChange?: (details: { open: boolean }) => void;

  /** Alert severity */
  severity?: 'info' | 'warning' | 'error' | 'success';

  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * DialogAlert - Alert dialog helper
 *
 * ✅ Uses role="alertdialog" for critical messages
 * ✅ Auto-generates IDs with useId()
 * ✅ Severity-based styling
 *
 * @example
 * <Dialog.Alert
 *   title="Error"
 *   message="Failed to save changes. Please try again."
 *   severity="error"
 *   trigger={<Button>Show Error</Button>}
 * />
 */
export function DialogAlert({
  title,
  message,
  acknowledgeLabel = 'OK',
  onAcknowledge,
  trigger,
  open,
  onOpenChange,
  severity = 'info',
  size = 'sm'
}: DialogAlertProps) {
  const titleId = useId();

  // Map severity to color palette
  const colorPalette = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    success: 'green'
  }[severity];

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      role="alertdialog"  // ✅ Critical: alertdialog role for alerts
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogBackdrop />

      <DialogPositioner>
        <DialogContent aria-labelledby={titleId}>
          <DialogHeader>
            <DialogTitle id={titleId}>{title}</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <DialogDescription>{message}</DialogDescription>
          </DialogBody>

          <DialogFooter>
            <Button
              colorPalette={colorPalette}
              onClick={onAcknowledge}
              width="full"
            >
              {acknowledgeLabel}
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

// ===============================
// FORM DIALOG
// ===============================

interface DialogFormProps {
  /** Dialog title */
  title: string;

  /** Dialog description */
  description?: string;

  /** Form content */
  children: ReactNode;

  /** Submit button label */
  submitLabel?: string;

  /** Cancel button label */
  cancelLabel?: string;

  /** Submit button color palette */
  submitColorPalette?: string;

  /** Callback when form is submitted */
  onSubmit?: () => void;

  /** Callback when cancelled */
  onCancel?: () => void;

  /** Trigger element */
  trigger: ReactNode;

  /** Whether dialog is open (controlled) */
  open?: boolean;

  /** Callback when open state changes */
  onOpenChange?: (details: { open: boolean }) => void;

  /** Whether submit action is loading */
  loading?: boolean;

  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * DialogForm - Form dialog helper
 *
 * ✅ Wraps children in <form> element
 * ✅ Auto-generates IDs with useId()
 * ✅ Handles submit/cancel actions
 *
 * @example
 * <Dialog.Form
 *   title="Add Material"
 *   description="Fill in the material details"
 *   submitLabel="Create"
 *   onSubmit={handleSubmit}
 *   trigger={<Button>Add Material</Button>}
 * >
 *   <Field label="Name">
 *     <Input />
 *   </Field>
 *   <Field label="Quantity">
 *     <NumberInput />
 *   </Field>
 * </Dialog.Form>
 */
export function DialogForm({
  title,
  description,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  submitColorPalette = 'blue',
  onSubmit,
  onCancel,
  trigger,
  open,
  onOpenChange,
  loading,
  size = 'lg'
}: DialogFormProps) {
  const titleId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      role="dialog"
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogBackdrop />

      <DialogPositioner>
        <DialogContent aria-labelledby={titleId}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle id={titleId}>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>

            <DialogBody>
              {children}
            </DialogBody>

            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
              </DialogActionTrigger>

              <Button
                type="submit"
                colorPalette={submitColorPalette}
                loading={loading}
              >
                {submitLabel}
              </Button>
            </DialogFooter>

            <DialogCloseTrigger />
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

// ===============================
// COMPOUND EXPORT
// ===============================

/**
 * Dialog Helper - Compound component for common dialog patterns
 *
 * @example
 * import { Dialog } from '@/shared/ui/helpers';
 *
 * // Confirm dialog
 * <Dialog.Confirm
 *   title="Delete?"
 *   description="Are you sure?"
 *   onConfirm={handleDelete}
 *   trigger={<Button>Delete</Button>}
 * />
 *
 * // Alert dialog
 * <Dialog.Alert
 *   title="Error"
 *   message="Something went wrong"
 *   severity="error"
 *   trigger={<Button>Show Error</Button>}
 * />
 *
 * // Form dialog
 * <Dialog.Form
 *   title="Add Item"
 *   onSubmit={handleSubmit}
 *   trigger={<Button>Add</Button>}
 * >
 *   <Field label="Name"><Input /></Field>
 * </Dialog.Form>
 */
export const Dialog = {
  Confirm: DialogConfirm,
  Alert: DialogAlert,
  Form: DialogForm
};
