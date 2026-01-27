/**
 * Payment Gateway Form Modal
 * Modal para crear/editar gateways de pago (MercadoPago, MODO, Stripe, etc.)
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
  Alert,
  Tabs,
} from '@/shared/ui';
import { useCreatePaymentGateway, useUpdatePaymentGateway } from '@/modules/finance-integrations/hooks/usePayments';
import { logger } from '@/lib/logging';
import { MercadoPagoConfigForm, type MercadoPagoConfig } from '../../../components/MercadoPagoConfigForm';
import { MODOConfigForm, type MODOConfig } from '../../../components/MODOConfigForm';

interface PaymentGatewayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateway?: any | null;
}

interface FormData {
  type: string;
  name: string;
  provider: string;
  is_active: boolean;
  is_online: boolean;
  supports_refunds: boolean;
  supports_recurring: boolean;
  supports_webhooks: boolean;
  config_json: string;
}

const INITIAL_FORM: FormData = {
  type: 'card',
  name: '',
  provider: '',
  is_active: false,
  is_online: true,
  supports_refunds: false,
  supports_recurring: false,
  supports_webhooks: false,
  config_json: '{}',
};

const GATEWAY_TYPES = [
  { value: 'card', label: 'Tarjetas' },
  { value: 'digital_wallet', label: 'Billetera Digital' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'qr_payment', label: 'Pago QR' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'crypto', label: 'Criptomonedas' },
  { value: 'bnpl', label: 'Compra Ahora, Paga Después' },
];

const GATEWAY_PROVIDERS = [
  { value: 'mercadopago', label: 'MercadoPago' },
  { value: 'modo', label: 'MODO' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'decidir', label: 'Decidir (First Data)' },
  { value: 'todopago', label: 'Todo Pago' },
  { value: 'mobbex', label: 'Mobbex' },
  { value: '', label: 'Sin proveedor específico' },
];

export function PaymentGatewayFormModal({ isOpen, onClose, gateway }: PaymentGatewayFormModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState<MercadoPagoConfig | null>(null);
  const [modoConfig, setModoConfig] = useState<MODOConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const createMutation = useCreatePaymentGateway();
  const updateMutation = useUpdatePaymentGateway();

  const isEditing = !!gateway;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isMercadoPago = formData.provider === 'mercadopago';
  const isMODO = formData.provider === 'modo';

  // Load gateway data when editing
  useEffect(() => {
    if (isOpen && gateway) {
      const config = gateway.config || {};
      setFormData({
        type: gateway.type || 'card',
        name: gateway.name || '',
        provider: gateway.provider || '',
        is_active: gateway.is_active ?? false,
        is_online: gateway.is_online ?? true,
        supports_refunds: gateway.supports_refunds ?? false,
        supports_recurring: gateway.supports_recurring ?? false,
        supports_webhooks: gateway.supports_webhooks ?? false,
        config_json: JSON.stringify(config, null, 2),
      });

      // If MercadoPago, load its config
      if (gateway.provider === 'mercadopago' && config) {
        setMercadoPagoConfig(config as MercadoPagoConfig);
      }

      // If MODO, load its config
      if (gateway.provider === 'modo' && config) {
        setModoConfig(config as MODOConfig);
      }

      setFieldErrors({});
    } else if (isOpen && !gateway) {
      setFormData(INITIAL_FORM);
      setMercadoPagoConfig(null);
      setModoConfig(null);
      setFieldErrors({});
    }
  }, [isOpen, gateway]);

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

    if (!formData.type) {
      errors.type = 'El tipo es requerido';
    }

    // Validate JSON config
    if (formData.config_json.trim()) {
      try {
        JSON.parse(formData.config_json);
      } catch {
        errors.config_json = 'JSON inválido';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      logger.warn('PaymentGatewayFormModal', 'Validation failed', fieldErrors);
      return;
    }

    try {
      // Use specific config based on provider
      let config: Record<string, unknown>;
      if (isMercadoPago && mercadoPagoConfig) {
        config = mercadoPagoConfig;
      } else if (isMODO && modoConfig) {
        config = modoConfig;
      } else {
        config = formData.config_json.trim() ? JSON.parse(formData.config_json) : {};
      }

      const payload = {
        type: formData.type,
        name: formData.name.trim(),
        provider: formData.provider.trim() || null,
        is_active: formData.is_active,
        is_online: formData.is_online,
        supports_refunds: formData.supports_refunds,
        supports_recurring: formData.supports_recurring,
        supports_webhooks: formData.supports_webhooks,
        config,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: gateway.id, updates: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      logger.info('PaymentGatewayFormModal', isEditing ? 'Gateway updated' : 'Gateway created', payload);
      onClose();
    } catch (error) {
      logger.error('PaymentGatewayFormModal', 'Submit failed', error);
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
        <Dialog.Content maxWidth="700px">
          <Dialog.Header>
            <Dialog.Title>
              {isEditing ? 'Editar Gateway de Pago' : 'Nuevo Gateway de Pago'}
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body maxHeight="70vh" overflowY="auto">
            <Stack gap="lg">
              {/* Basic Information */}
              <FormSection title="Información Básica">
                <Stack gap="md">
                  <SelectField
                    label="Tipo de Gateway *"
                    value={formData.type}
                    onChange={(e) => handleFieldChange('type')(e.target.value)}
                    style={{ borderColor: fieldErrors.type ? 'var(--colors-error)' : undefined }}
                  >
                    {GATEWAY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </SelectField>
                  {fieldErrors.type && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.type}</span>
                  )}

                  <InputField
                    label="Nombre *"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name')(e.target.value)}
                    placeholder="Ej: MercadoPago Argentina, Stripe Global"
                    style={{ borderColor: fieldErrors.name ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.name && (
                    <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.name}</span>
                  )}

                  <SelectField
                    label="Proveedor"
                    value={formData.provider}
                    onChange={(e) => handleFieldChange('provider')(e.target.value)}
                  >
                    {GATEWAY_PROVIDERS.map(provider => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </SelectField>
                </Stack>
              </FormSection>

              {/* Capabilities */}
              <FormSection title="Capacidades">
                <Stack gap="md">
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Pagos Online</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Procesa pagos a través de internet
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.is_online}
                      onCheckedChange={(checked) => handleFieldChange('is_online')(checked.checked)}
                    />
                  </Stack>

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Soporte de Reembolsos</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Permite devolver dinero a los clientes
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.supports_refunds}
                      onCheckedChange={(checked) => handleFieldChange('supports_refunds')(checked.checked)}
                    />
                  </Stack>

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Pagos Recurrentes</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Soporta suscripciones y cobros automáticos
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.supports_recurring}
                      onCheckedChange={(checked) => handleFieldChange('supports_recurring')(checked.checked)}
                    />
                  </Stack>
                </Stack>
              </FormSection>

              {/* Status */}
              <FormSection title="Estado">
                <Stack gap="md">
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0">
                      <strong>Gateway Activo</strong>
                      <small style={{ color: 'var(--colors-gray-600)' }}>
                        Disponible para procesar pagos
                      </small>
                    </Stack>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleFieldChange('is_active')(checked.checked)}
                    />
                  </Stack>
                </Stack>
              </FormSection>

              {/* Webhooks Support */}
              <Stack direction="row" justify="space-between" align="center">
                <Stack gap="0">
                  <strong>Soporte de Webhooks</strong>
                  <small style={{ color: 'var(--colors-gray-600)' }}>
                    Notificaciones automáticas de cambios de estado
                  </small>
                </Stack>
                <Switch
                  checked={formData.supports_webhooks}
                  onCheckedChange={(checked) => handleFieldChange('supports_webhooks')(checked.checked)}
                />
              </Stack>

              {/* Configuration Section: Provider-specific or JSON */}
              <FormSection title="Configuración del Gateway">
                {isMercadoPago ? (
                  <Stack gap="md">
                    <Alert status="info" title="Configuración de MercadoPago">
                      Estás configurando un gateway de MercadoPago. Usa el formulario específico a continuación para configurar las credenciales y opciones.
                    </Alert>
                    <MercadoPagoConfigForm
                      initialConfig={mercadoPagoConfig || undefined}
                      onChange={setMercadoPagoConfig}
                      onTestConnection={async (config) => {
                        try {
                          logger.info('PaymentGatewayFormModal', 'Testing MercadoPago connection', {
                            test_mode: config.test_mode,
                          });

                          // Test connection via backend API (works with vercel dev)
                          const response = await fetch('/api/mercadopago/test-connection', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              access_token: config.access_token,
                              test_mode: config.test_mode,
                            }),
                          });

                          if (!response.ok) {
                            logger.error('PaymentGatewayFormModal', 'MercadoPago API request failed', {
                              status: response.status,
                            });
                            return false;
                          }

                          const result = await response.json();

                          if (!result.success) {
                            logger.error('PaymentGatewayFormModal', 'MercadoPago test failed', result.error);
                            return false;
                          }

                          logger.info('PaymentGatewayFormModal', 'MercadoPago test successful', {
                            user_id: result.data.user_id,
                            email: result.data.email,
                          });

                          // Return account info for professional UX
                          return {
                            user_id: result.data.user_id,
                            email: result.data.email,
                            site_id: result.data.site_id,
                            nickname: result.data.nickname,
                          };
                        } catch (error) {
                          logger.error('PaymentGatewayFormModal', 'MercadoPago test error', error);
                          return false;
                        }
                      }}
                    />
                  </Stack>
                ) : isMODO ? (
                  <Stack gap="md">
                    <Alert status="info" title="Configuración de MODO">
                      🏦 Estás configurando un gateway de MODO (la billetera de los bancos argentinos). Usa el formulario específico a continuación para configurar las credenciales y opciones.
                    </Alert>
                    <MODOConfigForm
                      initialConfig={modoConfig || undefined}
                      onChange={setModoConfig}
                      onTestConnection={async (config) => {
                        try {
                          logger.info('PaymentGatewayFormModal', 'Testing MODO connection', {
                            test_mode: config.test_mode,
                            merchant_id: config.merchant_id,
                          });

                          // Test connection by calling MODO API
                          // Note: Adjust endpoint based on actual MODO API documentation
                          const baseUrl = config.test_mode
                            ? 'https://api-test.modo.com.ar/v1'
                            : 'https://api.modo.com.ar/v1';

                          const response = await fetch(`${baseUrl}/merchant/status`, {
                            headers: {
                              'Authorization': `Bearer ${config.api_key}`,
                              'X-Merchant-Id': config.merchant_id,
                            },
                          });

                          if (!response.ok) {
                            const error = await response.text();
                            logger.error('PaymentGatewayFormModal', 'MODO test failed', { error });
                            return false;
                          }

                          const data = await response.json();
                          logger.info('PaymentGatewayFormModal', 'MODO test successful', {
                            merchant_id: config.merchant_id,
                            status: data.status,
                          });

                          return true;
                        } catch (error) {
                          logger.error('PaymentGatewayFormModal', 'MODO test error', error);
                          return false;
                        }
                      }}
                    />
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Alert status="info" title="Configuración Personalizada (JSON)">
                      Configura el gateway usando JSON. Incluye API keys, secrets, URLs, etc.
                    </Alert>
                    <Textarea
                      value={formData.config_json}
                      onChange={(e) => handleFieldChange('config_json')(e.target.value)}
                      placeholder='{"api_key": "...", "secret": "...", "webhook_url": "...", "currency": "ARS"}'
                      rows={8}
                      style={{
                        fontFamily: 'monospace',
                        borderColor: fieldErrors.config_json ? 'var(--colors-error)' : undefined
                      }}
                    />
                    {fieldErrors.config_json && (
                      <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>{fieldErrors.config_json}</span>
                    )}
                  </Stack>
                )}
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
