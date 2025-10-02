import React from 'react';
import {
  ContentLayout, FormSection, Section, Stack, Button, Badge, Alert
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

import { logger } from '@/lib/logging';
// MercadoPago Configuration Schema
const MercadoPagoConfigSchema = z.object({
  // API Credentials
  accessToken: z.string().min(1, 'Access Token requerido'),
  publicKey: z.string().min(1, 'Public Key requerido'),
  webhookSecret: z.string().optional(),

  // Environment
  environment: z.enum(['sandbox', 'production']),

  // Configuration
  appId: z.string().optional(),

  // Payment Settings
  enabledPaymentMethods: z.array(z.enum([
    'credit_card', 'debit_card', 'account_money', 'ticket', 'bank_transfer'
  ])),

  // Fees and Limits
  maxInstallments: z.number().min(1).max(24).default(12),
  minimumAmount: z.number().min(1).default(100),

  // Webhook Configuration
  webhookUrl: z.string().url().optional(),
  webhookEvents: z.array(z.enum([
    'payment', 'merchant_order', 'subscription', 'invoice'
  ])).default(['payment']),

  // Business Settings
  businessCategory: z.string().optional(),
  statementDescriptor: z.string().max(22).optional()
});

type MercadoPagoConfig = z.infer<typeof MercadoPagoConfigSchema>;

const MercadoPagoIntegration: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [testResults, setTestResults] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<MercadoPagoConfig>({
    resolver: zodResolver(MercadoPagoConfigSchema),
    defaultValues: {
      environment: 'sandbox',
      enabledPaymentMethods: ['credit_card', 'debit_card', 'account_money'],
      maxInstallments: 12,
      minimumAmount: 100,
      webhookEvents: ['payment']
    }
  });

  const watchedValues = watch();

  // Test MercadoPago connection
  const testConnection = async () => {
    if (!watchedValues.accessToken || !watchedValues.publicKey) {
      alert('Por favor ingresa Access Token y Public Key');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTestResults = {
        apiStatus: 'active',
        accountId: 'USER-123456789',
        accountType: 'business',
        country: 'AR',
        availablePaymentMethods: [
          { id: 'visa', name: 'Visa', type: 'credit_card' },
          { id: 'master', name: 'Mastercard', type: 'credit_card' },
          { id: 'account_money', name: 'Dinero en cuenta', type: 'account_money' },
          { id: 'rapipago', name: 'Rapipago', type: 'ticket' },
          { id: 'pagofacil', name: 'Pago Fácil', type: 'ticket' }
        ],
        fees: {
          credit_card: '4.99%',
          debit_card: '2.99%',
          account_money: '0%'
        }
      };

      setTestResults(mockTestResults);
      setConnectionStatus('connected');

      // Emit integration event
      ModuleEventUtils.analytics.generated('payment-integrations', {
        integration: 'mercadopago',
        status: 'connected',
        environment: watchedValues.environment,
        paymentMethods: watchedValues.enabledPaymentMethods
      });

    } catch (error) {
      logger.error('App', 'MercadoPago connection error:', error);
      setConnectionStatus('error');
      setTestResults({ error: 'Error de conexión con MercadoPago API' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MercadoPagoConfig) => {
    try {
      // Simulate saving configuration
      logger.info('App', 'Saving MercadoPago config:', data);

      // Emit configuration event
      ModuleEventUtils.analytics.generated('payment-integrations', {
        integration: 'mercadopago',
        action: 'configured',
        environment: data.environment,
        paymentMethods: data.enabledPaymentMethods.length
      });

      alert('Configuración de MercadoPago guardada exitosamente');
    } catch (error) {
      logger.error('App', 'Error saving MercadoPago config:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* Connection Status */}
        <Section title="Estado de Conexión MercadoPago" variant="elevated">
          <Stack gap="md">
            <Stack direction="row" gap="md" align="center">
              <Badge
                colorPalette={
                  connectionStatus === 'connected' ? 'green' :
                  connectionStatus === 'connecting' ? 'blue' :
                  connectionStatus === 'error' ? 'red' : 'gray'
                }
                variant="subtle"
                size="lg"
              >
                {connectionStatus === 'connected' ? '🟢 Conectado' :
                 connectionStatus === 'connecting' ? '🟡 Conectando...' :
                 connectionStatus === 'error' ? '🔴 Error' : '⚪ Desconectado'}
              </Badge>

              <Button
                onClick={testConnection}
                loading={isLoading}
                disabled={!watchedValues.accessToken || !watchedValues.publicKey}
                colorPalette="blue"
                size="sm"
              >
                <Icon name="BoltIcon" />
                Probar Conexión
              </Button>
            </Stack>

            {connectionStatus === 'connected' && (
              <Alert status="success">
                <Icon name="CheckCircleIcon" />
                Conexión exitosa con MercadoPago API
              </Alert>
            )}

            {connectionStatus === 'error' && (
              <Alert status="error">
                <Icon name="ExclamationTriangleIcon" />
                Error de conexión. Verifica tus credenciales.
              </Alert>
            )}
          </Stack>
        </Section>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="lg">
            {/* API Credentials */}
            <FormSection
              title="Credenciales de API"
              description="Configuración de acceso a MercadoPago API"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Entorno</label>
                    <select {...register('environment')}>
                      <option value="sandbox">Sandbox (Pruebas)</option>
                      <option value="production">Producción</option>
                    </select>
                  </Stack>
                  <Stack flex="2">
                    <label>Access Token *</label>
                    <input
                      type="password"
                      {...register('accessToken')}
                      placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    {errors.accessToken && <span className="error">{errors.accessToken.message}</span>}
                  </Stack>
                </Stack>

                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Public Key *</label>
                    <input
                      type="text"
                      {...register('publicKey')}
                      placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    {errors.publicKey && <span className="error">{errors.publicKey.message}</span>}
                  </Stack>
                  <Stack flex="1">
                    <label>App ID (opcional)</label>
                    <input
                      type="text"
                      {...register('appId')}
                      placeholder="1234567890123456"
                    />
                  </Stack>
                </Stack>

                <Stack>
                  <label>Webhook Secret (opcional)</label>
                  <input
                    type="password"
                    {...register('webhookSecret')}
                    placeholder="webhook_secret_key"
                  />
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Usado para verificar la autenticidad de los webhooks
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Payment Methods */}
            <FormSection
              title="Métodos de Pago"
              description="Configuración de métodos de pago disponibles"
            >
              <Stack gap="md">
                <Stack>
                  <label>Métodos de Pago Habilitados</label>
                  <Stack gap="sm">
                    {[
                      { id: 'credit_card', label: 'Tarjeta de Crédito' },
                      { id: 'debit_card', label: 'Tarjeta de Débito' },
                      { id: 'account_money', label: 'Dinero en Cuenta MP' },
                      { id: 'ticket', label: 'Efectivo (Rapipago, Pago Fácil)' },
                      { id: 'bank_transfer', label: 'Transferencia Bancaria' }
                    ].map(method => (
                      <label key={method.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          value={method.id}
                          {...register('enabledPaymentMethods')}
                        />
                        {method.label}
                      </label>
                    ))}
                  </Stack>
                </Stack>

                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Máximo de Cuotas</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      {...register('maxInstallments', { valueAsNumber: true })}
                    />
                  </Stack>
                  <Stack flex="1">
                    <label>Monto Mínimo (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      {...register('minimumAmount', { valueAsNumber: true })}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Webhook Configuration */}
            <FormSection
              title="Configuración de Webhooks"
              description="Notificaciones automáticas de pagos y eventos"
            >
              <Stack gap="md">
                <Stack>
                  <label>Webhook URL</label>
                  <input
                    type="url"
                    {...register('webhookUrl')}
                    placeholder="https://tu-dominio.com/webhooks/mercadopago"
                  />
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    URL donde MercadoPago enviará las notificaciones
                  </p>
                </Stack>

                <Stack>
                  <label>Eventos de Webhook</label>
                  <Stack gap="sm">
                    {[
                      { id: 'payment', label: 'Pagos (Recomendado)' },
                      { id: 'merchant_order', label: 'Órdenes de Comercio' },
                      { id: 'subscription', label: 'Suscripciones' },
                      { id: 'invoice', label: 'Facturas' }
                    ].map(event => (
                      <label key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          value={event.id}
                          {...register('webhookEvents')}
                        />
                        {event.label}
                      </label>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Business Settings */}
            <FormSection
              title="Configuración de Negocio"
              description="Información adicional del comercio"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Categoría de Negocio</label>
                    <select {...register('businessCategory')}>
                      <option value="">Seleccionar categoría</option>
                      <option value="restaurants">Restaurantes</option>
                      <option value="retail">Retail</option>
                      <option value="services">Servicios</option>
                      <option value="health">Salud</option>
                      <option value="education">Educación</option>
                      <option value="other">Otros</option>
                    </select>
                  </Stack>
                  <Stack flex="1">
                    <label>Descriptor en Estado de Cuenta</label>
                    <input
                      type="text"
                      maxLength={22}
                      {...register('statementDescriptor')}
                      placeholder="MI NEGOCIO"
                    />
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Máximo 22 caracteres
                    </p>
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Test Results */}
            {testResults && (
              <Section title="Resultados de Conexión" variant="elevated">
                <Stack gap="md">
                  {testResults.error ? (
                    <Alert status="error">
                      <Icon name="ExclamationTriangleIcon" />
                      {testResults.error}
                    </Alert>
                  ) : (
                    <>
                      <Stack direction="row" gap="md" wrap="wrap">
                        <Badge colorPalette="green" variant="subtle">
                          API Status: {testResults.apiStatus}
                        </Badge>
                        <Badge colorPalette="blue" variant="subtle">
                          Account: {testResults.accountId}
                        </Badge>
                        <Badge colorPalette="purple" variant="subtle">
                          Country: {testResults.country}
                        </Badge>
                      </Stack>

                      <Stack>
                        <h4>Métodos de Pago Disponibles</h4>
                        <Stack gap="sm">
                          {testResults.availablePaymentMethods?.map((method: any, index: number) => (
                            <Stack key={index} direction="row" justify="between" align="center">
                              <span>{method.name} ({method.type})</span>
                              <Badge colorPalette="gray" variant="outline" size="sm">
                                {testResults.fees[method.type] || 'N/A'}
                              </Badge>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Section>
            )}

            {/* Submit Button */}
            <Stack direction="row" gap="md" justify="end">
              <Button variant="outline" type="button">
                <Icon name="XMarkIcon" />
                Cancelar
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                loading={isSubmitting}
              >
                <Icon name="CheckIcon" />
                Guardar Configuración
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </ContentLayout>
  );
};

export default MercadoPagoIntegration;