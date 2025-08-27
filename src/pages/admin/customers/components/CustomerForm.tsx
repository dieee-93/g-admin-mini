// src/features/customers/ui/CustomerForm.tsx - Design System v2.0
import {
  Stack,
  Card,
  Typography,
  Button,
  Badge,
  Grid
} from '@/shared/ui';
import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers'; 
import { type CreateCustomerData, type Customer } from '../types';
import { notify } from '@/lib/notifications';

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

interface CustomerFormProps {
  customer?: Customer; // Para modo edición
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { addCustomer, editCustomer } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    note: customer?.note || '',
  });

  const isEditMode = !!customer;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validación básica de email si se proporciona
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validación básica de teléfono si se proporciona
    if (form.phone && form.phone.length < 8) {
      newErrors.phone = 'Teléfono debe tener al menos 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario escriba
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const customerData: CreateCustomerData = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        note: form.note.trim() || undefined,
      };

      if (isEditMode) {
        await editCustomer({ id: customer.id, ...customerData });
        notify.success({title: 'UPDATED_CLIENT', description:'Cliente actualizado correctamente' });
      } else {
        await addCustomer(customerData);
        notify.success({title:'CREATED_CLIENT' , description:'Cliente creado correctamente'});
        
        // Resetear formulario solo en modo creación
        setForm({
          name: '',
          phone: '',
          email: '',
          address: '',
          note: '',
        });
      }

      onSuccess?.();
      
    } catch {
      notify.error({title:'ERROR',  description: `Error al ${isEditMode ? 'actualizar' : 'crear'} el cliente`});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg" variant="outline">
      <Stack direction="row" justify="space-between" align="center" mb="lg">
        <Typography variant="heading" size="md" color="accent">
          {isEditMode ? '✏️ Editar Cliente' : '👥 Nuevo Cliente'}
        </Typography>
        {isEditMode && (
          <Badge colorPalette="accent" variant="subtle">
            Modo edición
          </Badge>
        )}
      </Stack>
      
      <Stack direction="column" gap="lg" align="stretch">
        {/* Información básica */}
        <Stack direction="column" gap="sm">
          <Typography size="sm" fontWeight="medium" color="muted">
            Información Básica
          </Typography>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="md">
            <Stack direction="column" gap="xs">
              <Typography size="sm" color="muted">Nombre completo *</Typography>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                name="name"
                value={form.name}
                onChange={handleChange}
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
                  {errors.name}
                </Typography>
              )}
            </Stack>

            <Stack direction="column" gap="xs">
              <Typography size="sm" color="muted">Teléfono</Typography>
              <input
                type="text"
                placeholder="Ej: +54 11 1234-5678"
                name="phone"
                value={form.phone}
                onChange={handleChange}
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
                  {errors.phone}
                </Typography>
              )}
            </Stack>
          </Grid>
        </Stack>

        {/* Contacto */}
        <Stack direction="column" gap="sm">
          <Typography size="sm" fontWeight="medium" color="muted">
            Información de Contacto
          </Typography>
          <Stack direction="column" gap="md" align="stretch">
            <Stack direction="column" gap="xs">
              <Typography size="sm" color="muted">Email</Typography>
              <input
                type="email"
                placeholder="Ej: juan@email.com"
                name="email"
                value={form.email}
                onChange={handleChange}
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
                  {errors.email}
                </Typography>
              )}
            </Stack>
            
            <Stack direction="column" gap="xs">
              <Typography size="sm" color="muted">Dirección</Typography>
              <input
                type="text"
                placeholder="Ej: Av. Corrientes 1234, CABA"
                name="address"
                value={form.address}
                onChange={handleChange}
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
          <Typography size="sm" fontWeight="medium" color="muted">
            Información Adicional
          </Typography>
          <Stack direction="column" gap="xs">
            <Typography size="sm" color="muted">Notas</Typography>
            <textarea
              placeholder="Información adicional sobre el cliente..."
              name="note"
              value={form.note}
              onChange={handleChange}
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
              colorPalette="brand"
              size="lg"
              onClick={handleSubmit}
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
    </CardWrapper>
  );
}