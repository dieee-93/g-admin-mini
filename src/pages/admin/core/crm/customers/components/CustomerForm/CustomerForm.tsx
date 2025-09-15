// src/features/customers/ui/CustomerForm.tsx - Design System v2.0 + Zod Validation
import {
  Stack,
  CardWrapper,
  Typography,
  Button,
  Badge,
  Grid
} from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SchemaType } from '@/lib/validation/zod/CommonSchemas';
import { useCustomers } from '../hooks/useCustomers'; 
import { type CreateCustomerData, type Customer } from '../../types';
import { notify } from '@/lib/notifications';

// Type inference from Zod schema - eliminates manual interface
type CustomerFormData = SchemaType<typeof EntitySchemas.customer>;

interface CustomerFormProps {
  customer?: Customer; // Para modo edición
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { addCustomer, editCustomer } = useCustomers();
  const isEditMode = !!customer;

  // React Hook Form with Zod validation - eliminates manual state + validation
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(EntitySchemas.customer),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      note: customer?.note || ''
    }
  });

  const { handleSubmit, register, formState: { errors, isSubmitting }, reset } = form;

  // Validation is now handled automatically by Zod schema

  // Form handling is now managed by React Hook Form

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const customerData: CreateCustomerData = {
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        note: data.note?.trim() || undefined,
      };

      if (isEditMode) {
        await editCustomer({ id: customer.id, ...customerData });
        notify.success({title: 'UPDATED_CLIENT', description:'Cliente actualizado correctamente' });
      } else {
        await addCustomer(customerData);
        notify.success({title:'CREATED_CLIENT' , description:'Cliente creado correctamente'});
        
        // Resetear formulario solo en modo creación
        reset();
      }

      onSuccess?.();
      
    } catch {
      notify.error({title:'ERROR',  description: `Error al ${isEditMode ? 'actualizar' : 'crear'} el cliente`});
    }
  };

  return (
    <CardWrapper padding="lg" variant="outline">
      <Stack direction="row" justify="space-between" align="center" mb="lg">
        <Typography variant="heading" size="md" color="text.primary">
          {isEditMode ? '✏️ Editar Cliente' : '👥 Nuevo Cliente'}
        </Typography>
        {isEditMode && (
          <Badge colorPalette="cyan" variant="subtle">
            Modo edición
          </Badge>
        )}
      </Stack>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" gap="lg" align="stretch">
        {/* Información básica */}
        <Stack direction="column" gap="sm">
          <Typography size="sm" fontWeight="medium" color="text.muted">
            Información Básica
          </Typography>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="md">
            <Stack direction="column" gap="xs">
              <Typography size="sm" color="text.muted">Nombre completo *</Typography>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                {...register('name')}
                style={{
                  padding: '8px 12px',
                  border: errors.name ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {errors.name && (
                <Typography color="error" size="sm">
                  {errors.name.message}
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
                  border: errors.phone ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {errors.phone && (
                <Typography color="error" size="sm">
                  {errors.phone.message}
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
                  border: errors.email ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {errors.email && (
                <Typography color="error" size="sm">
                  {errors.email.message}
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
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%'
                }}
              />
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
              {...register('note')}
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
    </CardWrapper>
  );
}