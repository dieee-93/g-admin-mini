/**
 * Payment Method Form Modal
 * Modal para crear/editar métodos de pago
 * 
 * Campos de payment_methods_config:
 * - name, code, display_name, description
 * - gateway_id, requires_gateway
 * - is_active, sort_order, icon
 * - config (JSONB para datos adicionales)
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  FormSection,
  InputField,
  SelectField,
  Stack,
  Button,
  Switch,
  Textarea,
} from '@/shared/ui';
import { useCreatePaymentMethod, useUpdatePaymentMethod, usePaymentGateways } from '@/modules/finance-integrations/hooks/usePayments';
import { logger } from '@/lib/logging';

interface PaymentMethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  method?: any | null;
}

interface FormData {
  name: string;
  code: string;
  display_name: string;
  description: string;
  gateway_id: string;
  requires_gateway: boolean;
  is_active: boolean;
  sort_order: string;
  icon: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  code: '',
  display_name: '',
  description: '',
  gateway_id: '',
  requires_gateway: false,
  is_active: true,
  sort_order: '0',
  icon: '',
};

export function PaymentMethodFormModal({ isOpen, onClose, method }: PaymentMethodFormModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const { data: gateways = [] } = usePaymentGateways();

  const isEditing = !!method;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Load method data when editing
  useEffect(() => {
    if (isOpen && method) {
      setFormData({
        name: method.name || '',
        code: method.code || '',
        display_name: method.display_name || '',
        description: method.description || '',
        gateway_id: method.gateway_id || '',
        requires_gateway: method.requires_gateway ?? false,
        is_active: method.is_active ?? true,
        sort_order: method.sort_order?.toString() || '0',
        icon: method.icon || '',
      });
      setFieldErrors({});
    } else if (isOpen && !method) {
      setFormData(INITIAL_FORM);
      setFieldErrors({});
    }
  }, [isOpen, method]);

  // Field change handler
  const handleFieldChange = (field: keyof FormData) => (value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      errors.code = 'El código es requerido';
    } else if (!/^[a-z_]+$/.test(formData.code)) {
      errors.code = 'Solo letras minúsculas y guiones bajos';
    }

    if (!formData.display_name.trim()) {
      errors.display_name = 'El nombre para mostrar es requerido';
    }

    if (formData.requires_gateway && !formData.gateway_id) {
      errors.gateway_id = 'Debe seleccionar una pasarela';
    }

    const sortOrder = parseInt(formData.sort_order);
    if (isNaN(sortOrder) || sortOrder < 0) {
      errors.sort_order = 'Debe ser un número positivo';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      logger.warn('PaymentMethodFormModal', 'Validation failed', fieldErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        display_name: formData.display_name.trim(),
        description: formData.description.trim() || null,
        gateway_id: formData.gateway_id || null,
        requires_gateway: formData.requires_gateway,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
        icon: formData.icon.trim() || null,
        config: {},
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: method.id, updates: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      logger.info('PaymentMethodFormModal', isEditing ? 'Method updated' : 'Method created', payload);
      onClose();
    } catch (error) {
      logger.error('PaymentMethodFormModal', 'Submit failed', error);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="600px">
          <Dialog.Header>
            <Dialog.Title>
              {isEditing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="lg">
              {/* Basic Information */}
              <FormSection title="Información Básica">
                <Stack gap="md">
                  <InputField
                    label="Nombre Interno *"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name')(e.target.value)}
                    placeholder="Ej: Cash Payment, Credit Card"
                    style={{ borderColor: fieldErrors.name ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.name && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.name}</span>
                  )}

                  <InputField
                    label="Código *"
                    value={formData.code}
                    onChange={(e) => handleFieldChange('code')(e.target.value)}
                    placeholder="Ej: cash, credit_card, bank_transfer"
                    disabled={isEditing}
                    style={{ borderColor: fieldErrors.code ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.code && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.code}</span>
                  )}

                  <InputField
                    label="Nombre para Mostrar *"
                    value={formData.display_name}
                    onChange={(e) => handleFieldChange('display_name')(e.target.value)}
                    placeholder="Ej: Efectivo, Tarjeta de Crédito"
                    style={{ borderColor: fieldErrors.display_name ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.display_name && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.display_name}</span>
                  )}

                  <Textarea
                    label="Descripción"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description')(e.target.value)}
                    placeholder="Descripción opcional del método de pago"
                    rows={3}
                  />
                </Stack>
              </FormSection>

              {/* Gateway Configuration */}
              <FormSection title="Configuración de Pasarela">
                <Stack gap="md">
                  <SelectField
                    label="Pasarela de Pago"
                    value={formData.gateway_id}
                    onChange={(e) => handleFieldChange('gateway_id')(e.target.value)}
                    disabled={!formData.requires_gateway}
                    style={{ borderColor: fieldErrors.gateway_id ? 'var(--colors-error)' : undefined }}
                  >
                    <option value="">Sin pasarela</option>
                    {gateways.map(gateway => (
                      <option key={gateway.id} value={gateway.id}>
                        {gateway.name} ({gateway.type})
                      </option>
                    ))}
                  </SelectField>
                  {fieldErrors.gateway_id && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.gateway_id}</span>
                  )}

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Requiere Pasarela</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Necesita procesamiento externo (Stripe, MercadoPago, etc.)
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.requires_gateway}
                      onCheckedChange={(checked) => handleFieldChange('requires_gateway')(checked.checked)}
                    />
                  </Stack>
                </Stack>
              </FormSection>

              {/* Status & Display */}
              <FormSection title="Estado y Presentación">
                <Stack gap="md">
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Método Activo</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Disponible para usar en el sistema
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleFieldChange('is_active')(checked.checked)}
                    />
                  </Stack>

                  <InputField
                    label="Orden de Visualización"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleFieldChange('sort_order')(e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ borderColor: fieldErrors.sort_order ? 'var(--colors-error)' : undefined }}
                  />

                  <InputField
                    label="Icono (Opcional)"
                    value={formData.icon}
                    onChange={(e) => handleFieldChange('icon')(e.target.value)}
                    placeholder="Ej: CreditCard, Cash, QrCode"
                  />
                </Stack>
              </FormSection>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
