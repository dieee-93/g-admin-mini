// src/features/customers/ui/CustomerForm.tsx - Migrated to useCustomerValidation
import {
  FormSection,
  Stack,
  Typography,
  Button,
  Badge,
  Grid,
  Alert
} from '@/shared/ui';
import { useCustomers } from '../../hooks/existing/useCustomers';
import { type CreateCustomerData, type Customer } from '../../types';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import { useCustomerValidation } from '@/hooks/useCustomerValidation';
import { notify } from '@/lib/notifications';

interface CustomerFormProps {
  customer?: Customer; // Para modo edición
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { customers, addCustomer, editCustomer } = useCustomers();
  const isEditMode = !!customer;

  // Use specialized customer validation hook with business logic
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useCustomerValidation(
    {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      notes: customer?.note || ''
    },
    customers, // Pass existing customers for duplicate validation
    customer?.id // Current customer ID for edit mode
  );

  const { register, handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = handleSubmit(async (data) => {
    // Validate with business logic
    const isValid = await validateForm();

    if (!isValid) {
      notify.error({
        title: 'Validación fallida',
        description: 'Por favor corrige los errores antes de continuar'
      });
      return;
    }

    const customerData: CreateCustomerData = {
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
      note: data.notes?.trim() || undefined,
    };

    if (isEditMode) {
      await CRUDHandlers.update(
        () => editCustomer({ id: customer.id, ...customerData }),
        'Cliente',
        onSuccess
      );
    } else {
      await CRUDHandlers.create(
        () => addCustomer(customerData),
        'Cliente',
        onSuccess
      );
    }
  });

  return (
    <FormSection
      title={isEditMode ? '✏️ Editar Cliente' : '👥 Nuevo Cliente'}
      description="Gestiona la información del cliente"
      actions={isEditMode && (
        <Badge colorPalette="cyan" variant="subtle">
          Modo edición
        </Badge>
      )}
    >
      <form onSubmit={onSubmit}>
        <Stack direction="column" gap="lg" align="stretch">

          {/* Validation summary */}
          {validationState.hasErrors && (
            <Alert status="error" title="Errores de validación">
              Por favor corrige {validationState.errorCount} error(es) antes de continuar
            </Alert>
          )}

          {validationState.hasWarnings && !validationState.hasErrors && (
            <Alert status="warning" title="Advertencias">
              Hay {validationState.warningCount} advertencia(s) que deberías revisar
            </Alert>
          )}

          {/* Información básica */}
          <Stack direction="column" gap="sm">
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="md">
              <Stack direction="column" gap="xs">
                <Typography size="sm" color="text.muted">Nombre completo *</Typography>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  {...register('name')}
                  style={{
                    padding: '8px 12px',
                    border: fieldErrors.name ? '2px solid var(--colors-error)' :
                            fieldWarnings.name ? '2px solid var(--colors-warning)' :
                            '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                {fieldErrors.name && (
                  <Typography color="error" size="sm">
                    ❌ {fieldErrors.name}
                  </Typography>
                )}
                {!fieldErrors.name && fieldWarnings.name && (
                  <Typography color="warning" size="sm">
                    ⚠️ {fieldWarnings.name}
                  </Typography>
                )}
              </Stack>

              <Stack direction="column" gap="xs">
                <Typography size="sm" color="text.muted">Teléfono</Typography>
                <input
                  type="text"
                  placeholder="Ej: +54 11 1234-5678"
                  {...register('phone')}
                  style={{
                    padding: '8px 12px',
                    border: fieldErrors.phone ? '2px solid var(--colors-error)' :
                            fieldWarnings.phone ? '2px solid var(--colors-warning)' :
                            '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                {fieldErrors.phone && (
                  <Typography color="error" size="sm">
                    ❌ {fieldErrors.phone}
                  </Typography>
                )}
                {!fieldErrors.phone && fieldWarnings.phone && (
                  <Typography color="warning" size="sm">
                    ⚠️ {fieldWarnings.phone}
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Stack>

          {/* Contacto */}
          <Stack direction="column" gap="sm">
            <Typography size="sm" fontWeight="medium" color="text.muted">
              Información de Contacto
            </Typography>
            <Stack direction="column" gap="md" align="stretch">
              <Stack direction="column" gap="xs">
                <Typography size="sm" color="text.muted">Email</Typography>
                <input
                  type="email"
                  placeholder="Ej: juan@email.com"
                  {...register('email')}
                  style={{
                    padding: '8px 12px',
                    border: fieldErrors.email ? '2px solid var(--colors-error)' :
                            fieldWarnings.email ? '2px solid var(--colors-warning)' :
                            '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                {fieldErrors.email && (
                  <Typography color="error" size="sm">
                    ❌ {fieldErrors.email}
                  </Typography>
                )}
                {!fieldErrors.email && fieldWarnings.email && (
                  <Typography color="warning" size="sm">
                    ⚠️ {fieldWarnings.email}
                  </Typography>
                )}
              </Stack>

              <Stack direction="column" gap="xs">
                <Typography size="sm" color="text.muted">Dirección</Typography>
                <input
                  type="text"
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  {...register('address')}
                  style={{
                    padding: '8px 12px',
                    border: fieldWarnings.address ? '2px solid var(--colors-warning)' : '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                {fieldWarnings.address && (
                  <Typography color="warning" size="sm">
                    ⚠️ {fieldWarnings.address}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* Separador visual */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Notas adicionales */}
          <Stack direction="column" gap="sm">
            <Typography size="sm" fontWeight="medium" color="text.muted">
              Información Adicional
            </Typography>
            <Stack direction="column" gap="xs">
              <Typography size="sm" color="text.muted">Notas</Typography>
              <textarea
                placeholder="Información adicional sobre el cliente..."
                {...register('notes')}
                rows={3}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </Stack>
          </Stack>

          {/* Botones de acción */}
          <Stack direction="row" gap="sm" pt="sm">
            <div style={{ flex: 1 }}>
              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                loading={isSubmitting}
                disabled={validationState.hasErrors}
              >
                {isEditMode ? '✅ Actualizar Cliente' : '✅ Crear Cliente'}
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
                Cancelar
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </FormSection>
  );
}

/**
 * MIGRATION SUMMARY:
 *
 * ✅ BEFORE: useFormManager (generic hook)
 * ✅ AFTER: useCustomerValidation (specialized hook with business logic)
 *
 * NEW FEATURES:
 * - Email uniqueness validation (checks existing customers)
 * - Phone format validation (Argentina: +54 11 1234-5678)
 * - Field warnings (duplicate email, missing contact info, short name)
 * - Visual validation states (error borders, warning borders)
 * - Validation summary alerts
 * - Disabled submit button when errors exist
 *
 * BUSINESS LOGIC ADDED:
 * - At least email or phone required
 * - Email must be unique across customers
 * - Phone must follow Argentina format
 * - Name must be at least 2 characters
 *
 * MAINTAINED:
 * - Same UI/UX design
 * - Same CRUDHandlers integration
 * - Same onSuccess/onCancel callbacks
 * - Backward compatible with existing code
 */
