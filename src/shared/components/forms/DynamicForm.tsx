/**
 * Dynamic Form Component
 * Reusable form builder extracted from customers, materials, products patterns
 */
import React from 'react';
import {
  FormSection,
  Stack,
  Typography,
  Button,
  Grid
} from '@/shared/ui';
import { ZodSchema } from 'zod';
import { useFormManager } from '@/shared/hooks/business';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  gridColumn?: string;
  description?: string;
}

export interface FormSectionConfig {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

interface DynamicFormProps<T> {
  title: string;
  description?: string;
  schema: ZodSchema<T>;
  sections: FormSectionConfig[];
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  successMessage?: { title: string; description: string };
  resetOnSuccess?: boolean;
}

export function DynamicForm<T extends Record<string, any>>({
  title,
  description,
  schema,
  sections,
  defaultValues,
  onSubmit,
  onCancel,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  successMessage,
  resetOnSuccess = false
}: DynamicFormProps<T>) {
  const { register, errors, submit, isSubmitting } = useFormManager({
    schema,
    defaultValues,
    onSubmit,
    successMessage,
    resetOnSuccess
  });

  const renderField = (field: FormFieldConfig) => {
    const fieldProps = {
      ...register(field.name as keyof T),
      placeholder: field.placeholder,
      style: {
        padding: '8px 12px',
        border: errors[field.name] ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        ...(field.type === 'textarea' && {
          fontFamily: 'inherit',
          resize: 'vertical' as const,
          minHeight: '80px'
        })
      }
    };

    return (
      <Stack direction="column" gap="xs" style={{ gridColumn: field.gridColumn }}>
        <Typography size="sm" color="text.muted">
          {field.label} {field.required && '*'}
        </Typography>
        {field.description && (
          <Typography size="xs" color="text.muted">
            {field.description}
          </Typography>
        )}

        {field.type === 'textarea' ? (
          <textarea {...fieldProps} rows={3} />
        ) : (
          <input {...fieldProps} type={field.type} />
        )}

        {errors[field.name] && (
          <Typography color="error" size="sm">
            {errors[field.name]?.message as string}
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <FormSection title={title} description={description}>
      <form onSubmit={submit}>
        <Stack direction="column" gap="lg" align="stretch">
          {sections.map((section, sectionIndex) => (
            <Stack key={sectionIndex} direction="column" gap="sm">
              <Typography size="sm" fontWeight="medium" color="text.muted">
                {section.title}
              </Typography>
              {section.description && (
                <Typography size="xs" color="text.muted">
                  {section.description}
                </Typography>
              )}

              <Grid
                templateColumns={{ base: "1fr", md: "repeat(auto-fit, minmax(250px, 1fr))" }}
                gap="md"
              >
                {section.fields.map((field) => (
                  <React.Fragment key={field.name}>
                    {renderField(field)}
                  </React.Fragment>
                ))}
              </Grid>
            </Stack>
          ))}

          {/* Action buttons */}
          <Stack direction="row" gap="sm" pt="sm">
            <div style={{ flex: 1 }}>
              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                loading={isSubmitting}
              >
                {submitText}
              </Button>
            </div>

            {onCancel && (
              <Button
                variant="outline"
                colorPalette="gray"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </FormSection>
  );
}