/**
 * Generic Form Manager Hook
 * Extracted from customers, materials, products patterns
 */
import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
interface FormManagerConfig<T> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
  successMessage?: { title: string; description: string };
  errorMessage?: { title: string; description: string };
  resetOnSuccess?: boolean;
}

export function useFormManager<T>({
  schema,
  onSubmit,
  defaultValues,
  successMessage = { title: 'SUCCESS', description: 'Operación completada' },
  errorMessage = { title: 'ERROR', description: 'Error en la operación' },
  resetOnSuccess = false
}: FormManagerConfig<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as UseFormProps<T>['defaultValues']
  });

  const { handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  const submit = handleSubmit(async (data: T) => {
    try {
      await onSubmit(data);
      notify.success(successMessage);

      if (resetOnSuccess) {
        reset();
      }
    } catch (error) {
      logger.error('App', 'Form submission error:', error);
      notify.error(errorMessage);
    }
  });

  return {
    ...form,
    submit,
    isSubmitting,
    errors,
    reset
  };
}