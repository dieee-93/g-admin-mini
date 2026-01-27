import React from 'react';
import {
  ContentLayout, FormSection, Section, Stack, Button, Badge, Alert
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

import { logger } from '@/lib/logging';

// Types
interface BankingInfo {
  consortiumStatus: string;
  participatingBanks: string[];
  supportedServices: string[];
  transactionLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    perTransactionLimit: number;
  };
  fees: Record<string, string>;
}

interface ErrorResult {
  error: string;
}

// MODO Configuration Schema
const MODOConfigSchema = z.object({
  // API Credentials
  clientId: z.string().min(1, 'Client ID requerido'),
  clientSecret: z.string().min(1, 'Client Secret requerido'),
  apiKey: z.string().min(1, 'API Key requerido'),

  // Environment
  environment: z.enum(['sandbox', 'production']),

  // Business Information
  merchantId: z.string().min(1, 'Merchant ID requerido'),
  businessName: z.string().min(1, 'Nombre del negocio requerido'),
  cuit: z.string().min(11, 'CUIT debe tener 11 dígitos').max(11),

  // Banking Configuration
  preferredBanks: z.array(z.string()).optional(),
  enableQRPayments: z.boolean().default(true),
  enableTransferencia3: z.boolean().default(true),

  // Transaction Settings
  maxTransactionAmount: z.number().min(1).default(999999),
  minTransactionAmount: z.number().min(1).default(100),

  // Webhook Configuration
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),

  // Compliance Settings
  requireIdVerification: z.boolean().default(false),
  antiLaunderingChecks: z.boolean().default(true)
});

type MODOConfig = z.infer<typeof MODOConfigSchema>;

const MODOIntegration: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [bankingInfo, setBankingInfo] = React.useState<BankingInfo | ErrorResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MODOConfig>({
    resolver: zodResolver(MODOConfigSchema),
    defaultValues: {
      environment: 'sandbox',
      enableQRPayments: true,
      enableTransferencia3: true,
      maxTransactionAmount: 999999,
      minTransactionAmount: 100,
      requireIdVerification: false,
      antiLaunderingChecks: true
    }
  });

  const watchedValues = watch();

  // Test MODO connection
  const testConnection = async () => {
    if (!watchedValues.clientId || !watchedValues.clientSecret || !watchedValues.apiKey) {
      alert('Por favor ingresa todas las credenciales requeridas');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2500));

      const mockBankingInfo = {
        consortiumStatus: 'active',
        participatingBanks: [
          'Banco Galicia', 'Banco Santander', 'BBVA Argentina', 'Banco Macro',
          'Banco Patagonia', 'Banco Supervielle', 'Banco Comafi',
          'Banco de la Nación Argentina', 'Banco de la Provincia de Buenos Aires',
          'Banco Hipotecario', 'Banco Piano', 'Brubank'
        ],
        supportedServices: [
          'QR Payments', 'Transferencias 3.0', 'Real-time transfers',
          'Account verification', 'Balance inquiry'
        ],
        transactionLimits: {
          dailyLimit: 500000,
          monthlyLimit: 5000000,
          perTransactionLimit: 999999
        },
        fees: {
          qrPayment: '0%',
          transfer: '0%',
          verification: '$50'
        }
      };

      setBankingInfo(mockBankingInfo);
      setConnectionStatus('connected');

      // Emit integration event
      ModuleEventUtils.analytics.generated('payment-integrations', {
        integration: 'modo',
        status: 'connected',
        environment: watchedValues.environment,
        bankCount: mockBankingInfo.participatingBanks.length
      });

    } catch (error) {
      logger.error('App', 'MODO connection error:', error);
      setConnectionStatus('error');
      setBankingInfo({ error: 'Error de conexión con MODO Banking API' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MODOConfig) => {
    try {
      // Simulate saving configuration
      logger.info('App', 'Saving MODO config:', data);

      // Emit configuration event
      ModuleEventUtils.analytics.generated('payment-integrations', {
        integration: 'modo',
        action: 'configured',
        environment: data.environment,
        features: {
          qr: data.enableQRPayments,
          transferencia3: data.enableTransferencia3,
          verification: data.requireIdVerification
        }
      });

      alert('Configuración de MODO guardada exitosamente');
    } catch (error) {
      logger.error('App', 'Error saving MODO config:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* Connection Status */}
        <Section title="Estado de Conexión MODO" variant="elevated">
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
                disabled={!watchedValues.clientId || !watchedValues.clientSecret || !watchedValues.apiKey}
                colorPalette="green"
                size="sm"
              >
                <Icon as={BanknotesIcon} />
                Probar Conexión Bancaria
              </Button>
            </Stack>

            {connectionStatus === 'connected' && (
              <Alert status="success">
                <Icon as={CheckCircleIcon} />
                Conexión exitosa con MODO Banking Consortium
              </Alert>
            )}

            {connectionStatus === 'error' && (
              <Alert status="error">
                <Icon as={ExclamationTriangleIcon} />
                Error de conexión. Verifica tus credenciales MODO.
              </Alert>
            )}

            <Section variant="flat" title="Información MODO">
              <Stack gap="sm">
                <p>🏦 <strong>MODO</strong> es el consorcio de pagos digitales de 30+ bancos argentinos</p>
                <p>⚡ <strong>Real-time payments</strong> entre cuentas bancarias participantes</p>
                <p>📱 <strong>QR Interoperable</strong> compatible con cualquier billetera del consorcio</p>
                <p>🔒 <strong>Transferencias 3.0</strong> del BCRA integradas</p>
                <p>🇦🇷 <strong>100% Argentino</strong> y regulado por BCRA</p>
              </Stack>
            </Section>
          </Stack>
        </Section>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="lg">
            {/* API Credentials */}
            <FormSection
              title="Credenciales MODO"
              description="Configuración de acceso al consorcio bancario"
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
                    <label>Client ID *</label>
                    <input
                      type="text"
                      {...register('clientId')}
                      placeholder="modo_client_xxxxxxxx"
                    />
                    {errors.clientId && <span className="error">{errors.clientId.message}</span>}
                  </Stack>
                </Stack>

                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Client Secret *</label>
                    <input
                      type="password"
                      {...register('clientSecret')}
                      placeholder="modo_secret_xxxxxxxx"
                    />
                    {errors.clientSecret && <span className="error">{errors.clientSecret.message}</span>}
                  </Stack>
                  <Stack flex="1">
                    <label>API Key *</label>
                    <input
                      type="password"
                      {...register('apiKey')}
                      placeholder="modo_api_key_xxxxxxxx"
                    />
                    {errors.apiKey && <span className="error">{errors.apiKey.message}</span>}
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Business Information */}
            <FormSection
              title="Información del Comercio"
              description="Datos del negocio para registro en MODO"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Merchant ID *</label>
                    <input
                      type="text"
                      {...register('merchantId')}
                      placeholder="MERCHANT_123456"
                    />
                    {errors.merchantId && <span className="error">{errors.merchantId.message}</span>}
                  </Stack>
                  <Stack flex="2">
                    <label>Nombre del Negocio *</label>
                    <input
                      type="text"
                      {...register('businessName')}
                      placeholder="Mi Empresa S.A."
                    />
                    {errors.businessName && <span className="error">{errors.businessName.message}</span>}
                  </Stack>
                </Stack>

                <Stack>
                  <label>CUIT *</label>
                  <input
                    type="text"
                    {...register('cuit')}
                    placeholder="20123456789"
                    maxLength={11}
                  />
                  {errors.cuit && <span className="error">{errors.cuit.message}</span>}
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    CUIT sin guiones, 11 dígitos
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Banking Configuration */}
            <FormSection
              title="Configuración Bancaria"
              description="Servicios y bancos preferidos"
            >
              <Stack gap="md">
                <Stack>
                  <label>Servicios Habilitados</label>
                  <Stack gap="sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('enableQRPayments')} />
                      Pagos QR Interoperables
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('enableTransferencia3')} />
                      Transferencias 3.0 (BCRA)
                    </label>
                  </Stack>
                </Stack>

                <Stack>
                  <label>Bancos Preferidos (opcional)</label>
                  <Stack gap="sm">
                    {[
                      'Banco Galicia', 'Banco Santander', 'BBVA Argentina', 'Banco Macro',
                      'Banco Patagonia', 'Banco Supervielle', 'Brubank', 'Banco Nación'
                    ].map(bank => (
                      <label key={bank} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          value={bank}
                          {...register('preferredBanks')}
                        />
                        {bank}
                      </label>
                    ))}
                  </Stack>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Bancos prioritarios para procesamiento (opcional)
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Transaction Settings */}
            <FormSection
              title="Configuración de Transacciones"
              description="Límites y validaciones"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Monto Mínimo (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      {...register('minTransactionAmount', { valueAsNumber: true })}
                    />
                  </Stack>
                  <Stack flex="1">
                    <label>Monto Máximo (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      {...register('maxTransactionAmount', { valueAsNumber: true })}
                    />
                  </Stack>
                </Stack>

                <Stack>
                  <label>Configuración de Seguridad</label>
                  <Stack gap="sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('requireIdVerification')} />
                      Requerir verificación de identidad
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('antiLaunderingChecks')} />
                      Controles anti-lavado automáticos
                    </label>
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Webhook Configuration */}
            <FormSection
              title="Configuración de Webhooks"
              description="Notificaciones de transacciones bancarias"
            >
              <Stack gap="md">
                <Stack>
                  <label>Webhook URL</label>
                  <input
                    type="url"
                    {...register('webhookUrl')}
                    placeholder="https://tu-dominio.com/webhooks/modo"
                  />
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    URL para recibir notificaciones de transacciones
                  </p>
                </Stack>

                <Stack>
                  <label>Webhook Secret</label>
                  <input
                    type="password"
                    {...register('webhookSecret')}
                    placeholder="webhook_secret_key"
                  />
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Clave secreta para verificar autenticidad de webhooks
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Banking Info Results */}
            {bankingInfo && (
              <Section title="Información del Consorcio Bancario" variant="elevated">
                <Stack gap="md">
                  {bankingInfo.error ? (
                    <Alert status="error">
                      <Icon as={ExclamationTriangleIcon} />
                      {bankingInfo.error}
                    </Alert>
                  ) : (
                    <>
                      <Stack direction="row" gap="md" flexWrap="wrap">
                        <Badge colorPalette="green" variant="subtle">
                          Status: {bankingInfo.consortiumStatus}
                        </Badge>
                        <Badge colorPalette="blue" variant="subtle">
                          {bankingInfo.participatingBanks.length} Bancos
                        </Badge>
                        <Badge colorPalette="purple" variant="subtle">
                          {bankingInfo.supportedServices.length} Servicios
                        </Badge>
                      </Stack>

                      <Stack>
                        <h4>Bancos Participantes</h4>
                        <Stack direction="row" gap="sm" flexWrap="wrap">
                          {bankingInfo.participatingBanks.map((bank: string, index: number) => (
                            <Badge key={index} colorPalette="gray" variant="outline" size="sm">
                              {bank}
                            </Badge>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack>
                        <h4>Servicios Disponibles</h4>
                        <Stack gap="sm">
                          {bankingInfo.supportedServices.map((service: string, index: number) => (
                            <Stack key={index} direction="row" align="center" gap="sm">
                              <Icon as={CheckCircleIcon} color="green.500" size="sm" />
                              <span>{service}</span>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack>
                        <h4>Límites de Transacción</h4>
                        <Stack gap="sm">
                          <Stack direction="row" justify="space-between">
                            <span>Límite Diario:</span>
                            <span>${bankingInfo.transactionLimits.dailyLimit.toLocaleString()}</span>
                          </Stack>
                          <Stack direction="row" justify="space-between">
                            <span>Límite Mensual:</span>
                            <span>${bankingInfo.transactionLimits.monthlyLimit.toLocaleString()}</span>
                          </Stack>
                          <Stack direction="row" justify="space-between">
                            <span>Por Transacción:</span>
                            <span>${bankingInfo.transactionLimits.perTransactionLimit.toLocaleString()}</span>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack>
                        <h4>Comisiones</h4>
                        <Stack gap="sm">
                          <Stack direction="row" justify="space-between">
                            <span>Pagos QR:</span>
                            <Badge colorPalette="green" variant="subtle">{bankingInfo.fees.qrPayment}</Badge>
                          </Stack>
                          <Stack direction="row" justify="space-between">
                            <span>Transferencias:</span>
                            <Badge colorPalette="green" variant="subtle">{bankingInfo.fees.transfer}</Badge>
                          </Stack>
                          <Stack direction="row" justify="space-between">
                            <span>Verificación:</span>
                            <Badge colorPalette="gray" variant="subtle">{bankingInfo.fees.verification}</Badge>
                          </Stack>
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
                <Icon as={XMarkIcon} />
                Cancelar
              </Button>
              <Button
                type="submit"
                colorPalette="green"
                loading={isSubmitting}
              >
                <Icon as={CheckIcon} />
                Guardar Configuración MODO
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </ContentLayout>
  );
};

export default MODOIntegration;