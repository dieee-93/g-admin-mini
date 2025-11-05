/**
 * Form Helpers - Semantic form composition patterns
 *
 * LAYER 2.5: HELPERS
 * Purpose: Simplifies ChakraUI v3 Fieldset for accessible forms
 *
 * Why helpers?
 * - ChakraUI v3 Fieldset already has good accessibility
 * - Helpers add: auto-generated IDs, simplified API, validation patterns
 * - Maintains semantic HTML (<fieldset>, <legend>)
 *
 * Best Practices (based on React Aria + W3C):
 * - Auto-generate IDs with useId() for aria-describedby
 * - Use <fieldset> + <legend> for grouped form controls
 * - Connect errors and descriptions to inputs
 *
 * References:
 * - React Aria: Form field patterns
 * - W3C: Fieldset and Legend elements
 * - ChakraUI v3: Fieldset component
 */

import { useId } from 'react';
import {
  FieldsetRoot,
  FieldsetLegend,
  FieldsetContent,
  FieldsetHelperText,
  FieldsetErrorText
} from '../Fieldset';
import type { ReactNode } from 'react';

// ===============================
// FORM GROUP
// ===============================

interface FormGroupProps {
  /** Legend text (fieldset label) */
  legend: string;

  /** Helper text/description */
  description?: string;

  /** Error message */
  error?: string;

  /** Whether the fieldset is required */
  required?: boolean;

  /** Whether the fieldset is disabled */
  disabled?: boolean;

  /** Form controls */
  children: ReactNode;

  /** Additional props */
  [key: string]: any;
}

/**
 * FormGroup - Semantic fieldset wrapper with automatic ARIA
 *
 * ✅ Auto-generates IDs with useId()
 * ✅ Connects description and error to fieldset
 * ✅ Uses semantic <fieldset> + <legend>
 *
 * @example
 * <Form.Group
 *   legend="Personal Information"
 *   description="Please provide your contact details"
 *   error={errors.personal}
 *   required
 * >
 *   <Field label="Name"><Input /></Field>
 *   <Field label="Email"><Input type="email" /></Field>
 * </Form.Group>
 */
export function FormGroup({
  legend,
  description,
  error,
  required,
  disabled,
  children,
  ...rest
}: FormGroupProps) {
  // ✅ Auto-generate stable IDs for aria-describedby
  const descId = useId();
  const errorId = useId();

  // Build aria-describedby string
  const ariaDescribedBy = [
    description ? `desc-${descId}` : null,
    error ? `error-${errorId}` : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <FieldsetRoot
      invalid={!!error}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      {...rest}
    >
      <FieldsetLegend>
        {legend}
        {required && (
          <span aria-label="required" style={{ color: 'var(--chakra-colors-red-500)', marginLeft: '0.25rem' }}>
            *
          </span>
        )}
      </FieldsetLegend>

      {description && (
        <FieldsetHelperText id={`desc-${descId}`}>
          {description}
        </FieldsetHelperText>
      )}

      <FieldsetContent>
        {children}
      </FieldsetContent>

      {error && (
        <FieldsetErrorText id={`error-${errorId}`}>
          {error}
        </FieldsetErrorText>
      )}
    </FieldsetRoot>
  );
}

// ===============================
// FORM SECTION
// ===============================

interface FormSectionProps {
  /** Section title */
  title: string;

  /** Section description */
  description?: string;

  /** Form fields */
  children: ReactNode;

  /** Additional props */
  [key: string]: any;
}

/**
 * FormSection - Visual form section (not semantic fieldset)
 *
 * Use this for visual grouping without fieldset semantics.
 * For semantic grouping, use FormGroup instead.
 *
 * ✅ Auto-generates IDs with useId()
 * ✅ Uses <section> + <h3> for semantics
 * ✅ Lighter weight than FormGroup
 *
 * @example
 * <Form.Section
 *   title="Account Settings"
 *   description="Manage your account preferences"
 * >
 *   <Field label="Username"><Input /></Field>
 *   <Field label="Password"><Input type="password" /></Field>
 * </Form.Section>
 */
export function FormSection({
  title,
  description,
  children,
  ...rest
}: FormSectionProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <section
      aria-labelledby={`title-${titleId}`}
      aria-describedby={description ? `desc-${descId}` : undefined}
      style={{
        padding: 'var(--chakra-spacing-6)',
        borderRadius: 'var(--chakra-radii-lg)',
        border: '1px solid var(--chakra-colors-border-default)',
        marginBottom: 'var(--chakra-spacing-6)'
      }}
      {...rest}
    >
      <h3
        id={`title-${titleId}`}
        style={{
          fontSize: 'var(--chakra-fontSizes-lg)',
          fontWeight: 'var(--chakra-fontWeights-semibold)',
          marginBottom: description ? 'var(--chakra-spacing-2)' : 'var(--chakra-spacing-4)'
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          id={`desc-${descId}`}
          style={{
            fontSize: 'var(--chakra-fontSizes-sm)',
            color: 'var(--chakra-colors-fg-muted)',
            marginBottom: 'var(--chakra-spacing-4)'
          }}
        >
          {description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--chakra-spacing-4)' }}>
        {children}
      </div>
    </section>
  );
}

// ===============================
// COMPOUND EXPORT
// ===============================

/**
 * Form Helper - Compound component for accessible forms
 *
 * @example
 * import { Form } from '@/shared/ui/helpers';
 *
 * // Semantic fieldset grouping
 * <Form.Group
 *   legend="Shipping Address"
 *   description="Where should we deliver your order?"
 *   required
 * >
 *   <Field label="Street"><Input /></Field>
 *   <Field label="City"><Input /></Field>
 *   <Field label="Zip"><Input /></Field>
 * </Form.Group>
 *
 * // Visual section grouping
 * <Form.Section
 *   title="Account Settings"
 *   description="Manage your preferences"
 * >
 *   <Field label="Email"><Input /></Field>
 *   <Field label="Notifications"><Switch /></Field>
 * </Form.Section>
 */
export const Form = {
  Group: FormGroup,
  Section: FormSection
};
