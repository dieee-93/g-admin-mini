import React from 'react';
import {
  ContentLayout, FormSection, Section, Stack, Button, Badge, Alert
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

// QR Configuration Schema
const QRConfigSchema = z.object({
  // Business Information
  merchantName: z.string().min(1, 'Nombre del comercio requerido'),
  merchantId: z.string().min(1, 'ID del comercio requerido'),
  cuit: z.string().min(11, 'CUIT debe tener 11 dígitos').max(11),

  // QR Settings
  enableStaticQR: z.boolean().default(true),
  enableDynamicQR: z.boolean().default(true),
  defaultAmount: z.number().min(0).optional(),
  expirationMinutes: z.number().min(1).max(60).default(10),

  // Integration Settings
  bcraCompliant: z.boolean().default(true),
  enableMultiProvider: z.boolean().default(true),
  preferredProviders: z.array(z.enum(['mercadopago', 'modo', 'galicia', 'santander', 'bbva'])).optional(),

  // Security Settings
  requireCustomerVerification: z.boolean().default(false),
  maxDailyAmount: z.number().min(1).default(500000),
  enableAntifraud: z.boolean().default(true),

  // Display Settings
  qrSize: z.enum(['small', 'medium', 'large']).default('medium'),
  includeBusinessLogo: z.boolean().default(true),
  customMessage: z.string().max(100).optional()
});

type QRConfig = z.infer<typeof QRConfigSchema>;

interface QRCodeData {
  id: string;
  type: 'static' | 'dynamic';
  amount?: number;
  description?: string;
  qrString: string;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
  status: 'active' | 'expired' | 'disabled';
}

const QRInteroperableManager: React.FC = () => {
  const [generatedQRs, setGeneratedQRs] = React.useState<QRCodeData[]>([]);
  const [selectedQR, setSelectedQR] = React.useState<QRCodeData | null>(null);
  const [qrStats, setQrStats] = React.useState({
    totalGenerated: 45,
    activeQRs: 12,
    paymentsToday: 23,
    revenueToday: 156000
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<QRConfig>({
    resolver: zodResolver(QRConfigSchema),
    defaultValues: {
      enableStaticQR: true,
      enableDynamicQR: true,
      expirationMinutes: 10,
      bcraCompliant: true,
      enableMultiProvider: true,
      requireCustomerVerification: false,
      maxDailyAmount: 500000,
      enableAntifraud: true,
      qrSize: 'medium',
      includeBusinessLogo: true
    }
  });

  const watchedValues = watch();

  React.useEffect(() => {
    // Load mock QR codes
    loadMockQRs();
  }, []);

  const loadMockQRs = () => {
    const mockQRs: QRCodeData[] = [
      {
        id: 'qr_static_001',
        type: 'static',
        qrString: '00020101021243650016com.mercadolibre0201306367c96c0040014br.gov.bcb.pix2584qr.example.com/pix/v2/qr12345678901234567890126580014br.gov.bcb.pix...',
        usageCount: 15,
        status: 'active'
      },
      {
        id: 'qr_dynamic_001',
        type: 'dynamic',
        amount: 25000,
        description: 'Mesa 5 - Almuerzo',
        qrString: '00020101021243650016com.mercadolibre0201306367c96c0040014br.gov.bcb.pix2584qr.example.com/pix/v2/qr09876543210987654321126580014br.gov.bcb.pix...',
        expiresAt: new Date(Date.now() + 1000 * 60 * 8).toISOString(),
        usageCount: 0,
        maxUsage: 1,
        status: 'active'
      },
      {
        id: 'qr_dynamic_002',
        type: 'dynamic',
        amount: 12500,
        description: 'Delivery - Orden #123',
        qrString: '00020101021243650016com.mercadolibre0201306367c96c0040014br.gov.bcb.pix2584qr.example.com/pix/v2/qr11223344556677889900126580014br.gov.bcb.pix...',
        expiresAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        usageCount: 0,
        maxUsage: 1,
        status: 'expired'
      }
    ];

    setGeneratedQRs(mockQRs);
  };

  const generateQR = async (type: 'static' | 'dynamic', amount?: number, description?: string) => {
    const newQR: QRCodeData = {
      id: `qr_${type}_${Date.now()}`,
      type,
      amount,
      description,
      qrString: `00020101021243650016com.mercadolibre0201306367c96c0040014br.gov.bcb.pix2584qr.example.com/pix/v2/qr${Math.random().toString(36).substr(2, 20)}126580014br.gov.bcb.pix...`,
      expiresAt: type === 'dynamic' ? new Date(Date.now() + watchedValues.expirationMinutes * 60000).toISOString() : undefined,
      usageCount: 0,
      maxUsage: type === 'dynamic' ? 1 : undefined,
      status: 'active'
    };

    setGeneratedQRs(prev => [newQR, ...prev]);

    // Emit QR generation event
    ModuleEventUtils.analytics.generated('payment-integrations', {
      action: 'qr_generated',
      type,
      amount: amount || 0,
      provider: 'qr_interoperable'
    });

    return newQR;
  };

  const generateStaticQR = () => {
    generateQR('static');
  };

  const generateDynamicQR = () => {
    const amount = prompt('Ingresa el monto (ARS):');
    const description = prompt('Descripción (opcional):');

    if (amount && !isNaN(Number(amount))) {
      generateQR('dynamic', Number(amount), description || undefined);
    }
  };

  const disableQR = (qrId: string) => {
    setGeneratedQRs(prev =>
      prev.map(qr =>
        qr.id === qrId ? { ...qr, status: 'disabled' as const } : qr
      )
    );
  };

  const onSubmit = async (data: QRConfig) => {
    try {
      // Simulate saving configuration
      console.log('Saving QR config:', data);

      // Emit configuration event
      ModuleEventUtils.analytics.generated('payment-integrations', {
        integration: 'qr_interoperable',
        action: 'configured',
        features: {
          static: data.enableStaticQR,
          dynamic: data.enableDynamicQR,
          multiProvider: data.enableMultiProvider
        }
      });

      alert('Configuración de QR Interoperable guardada exitosamente');
    } catch (error) {
      console.error('Error saving QR config:', error);
    }
  };

  const getQRStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'orange';
      case 'disabled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* QR Statistics */}
        <Section title="Estadísticas QR Interoperable" variant="elevated">
          <Stack gap="md">
            <Stack direction="row" gap="md">
              <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>
                  {qrStats.totalGenerated}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>QRs Generados</p>
              </Stack>
              <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>
                  {qrStats.activeQRs}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>QRs Activos</p>
              </Stack>
              <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d69e2e' }}>
                  {qrStats.paymentsToday}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>Pagos Hoy</p>
              </Stack>
              <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#805ad5' }}>
                  ${qrStats.revenueToday.toLocaleString()}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>Ingresos Hoy (ARS)</p>
              </Stack>
            </Stack>

            <Alert status="info">
              <Icon name="InformationCircleIcon" />
              QR Interoperable cumple con estándares BCRA y es compatible con todas las billeteras argentinas
            </Alert>
          </Stack>
        </Section>

        {/* Quick Actions */}
        <Section title="Generación Rápida de QR" variant="elevated">
          <Stack gap="md">
            <Stack direction="row" gap="md">
              <Button
                onClick={generateStaticQR}
                colorPalette="blue"
                disabled={!watchedValues.enableStaticQR}
              >
                <Icon name="QrCodeIcon" />
                Generar QR Estático
              </Button>
              <Button
                onClick={generateDynamicQR}
                colorPalette="green"
                disabled={!watchedValues.enableDynamicQR}
              >
                <Icon name="SparklesIcon" />
                Generar QR Dinámico
              </Button>
              <Button
                onClick={loadMockQRs}
                variant="outline"
              >
                <Icon name="ArrowPathIcon" />
                Refrescar Lista
              </Button>
            </Stack>

            <Section variant="flat" title="Información QR Interoperable">
              <Stack gap="sm">
                <p>📱 <strong>QR Estático</strong>: Permite múltiples pagos, ideal para mostrar en local</p>
                <p>⚡ <strong>QR Dinámico</strong>: Un solo pago por monto específico, ideal para transacciones</p>
                <p>🏦 <strong>Compatible</strong>: MercadoPago, MODO, Galicia, Santander, BBVA, todas las billeteras</p>
                <p>🔒 <strong>Seguro</strong>: Cumple normativas BCRA y estándares de seguridad</p>
                <p>⏱️ <strong>Expiración</strong>: QRs dinámicos con tiempo de vida configurable</p>
              </Stack>
            </Section>
          </Stack>
        </Section>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="lg">
            {/* Business Information */}
            <FormSection
              title="Información del Comercio"
              description="Datos que aparecerán en los códigos QR"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="2">
                    <label>Nombre del Comercio *</label>
                    <input
                      type="text"
                      {...register('merchantName')}
                      placeholder="Mi Restaurante S.A."
                    />
                    {errors.merchantName && <span className="error">{errors.merchantName.message}</span>}
                  </Stack>
                  <Stack flex="1">
                    <label>ID del Comercio *</label>
                    <input
                      type="text"
                      {...register('merchantId')}
                      placeholder="MERCHANT_123"
                    />
                    {errors.merchantId && <span className="error">{errors.merchantId.message}</span>}
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
                    CUIT sin guiones, 11 dígitos (requerido para compliance BCRA)
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* QR Settings */}
            <FormSection
              title="Configuración de QR"
              description="Tipos de QR y configuraciones básicas"
            >
              <Stack gap="md">
                <Stack>
                  <label>Tipos de QR Habilitados</label>
                  <Stack gap="sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('enableStaticQR')} />
                      QR Estático (múltiples pagos, ideal para mostrar en local)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('enableDynamicQR')} />
                      QR Dinámico (un pago específico, ideal para transacciones)
                    </label>
                  </Stack>
                </Stack>

                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Monto por Defecto (ARS) - QR Estático</label>
                    <input
                      type="number"
                      min="0"
                      {...register('defaultAmount', { valueAsNumber: true })}
                      placeholder="0 = Sin monto fijo"
                    />
                  </Stack>
                  <Stack flex="1">
                    <label>Expiración QR Dinámico (minutos)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      {...register('expirationMinutes', { valueAsNumber: true })}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Integration Settings */}
            <FormSection
              title="Configuración de Integración"
              description="Providers y compliance"
            >
              <Stack gap="md">
                <Stack>
                  <label>Configuración de Compatibilidad</label>
                  <Stack gap="sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('bcraCompliant')} />
                      Cumplimiento BCRA (Recomendado)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('enableMultiProvider')} />
                      Multi-provider (Todas las billeteras)
                    </label>
                  </Stack>
                </Stack>

                <Stack>
                  <label>Providers Preferidos (opcional)</label>
                  <Stack gap="sm">
                    {['mercadopago', 'modo', 'galicia', 'santander', 'bbva'].map(provider => (
                      <label key={provider} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          value={provider}
                          {...register('preferredProviders')}
                        />
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </label>
                    ))}
                  </Stack>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Si no seleccionas ninguno, el QR será compatible con todas las billeteras
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Security Settings */}
            <FormSection
              title="Configuración de Seguridad"
              description="Límites y controles de seguridad"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Límite Diario Máximo (ARS)</label>
                    <input
                      type="number"
                      min="1"
                      {...register('maxDailyAmount', { valueAsNumber: true })}
                    />
                  </Stack>
                  <Stack flex="2">
                    <label>Controles de Seguridad</label>
                    <Stack gap="sm">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" {...register('requireCustomerVerification')} />
                        Requerir verificación del cliente
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" {...register('enableAntifraud')} />
                        Controles antifraude automáticos
                      </label>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>

            {/* Display Settings */}
            <FormSection
              title="Configuración de Visualización"
              description="Apariencia y personalización del QR"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md">
                  <Stack flex="1">
                    <label>Tamaño del QR</label>
                    <select {...register('qrSize')}>
                      <option value="small">Pequeño (150x150px)</option>
                      <option value="medium">Mediano (250x250px)</option>
                      <option value="large">Grande (350x350px)</option>
                    </select>
                  </Stack>
                  <Stack flex="1">
                    <label>Personalización</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" {...register('includeBusinessLogo')} />
                      Incluir logo del negocio
                    </label>
                  </Stack>
                </Stack>

                <Stack>
                  <label>Mensaje Personalizado (opcional)</label>
                  <input
                    type="text"
                    maxLength={100}
                    {...register('customMessage')}
                    placeholder="Ej: Gracias por elegirnos"
                  />
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Máximo 100 caracteres
                  </p>
                </Stack>
              </Stack>
            </FormSection>

            {/* Submit Button */}
            <Stack direction="row" gap="md" justify="end">
              <Button variant="outline" type="button">
                <Icon name="XMarkIcon" />
                Cancelar
              </Button>
              <Button
                type="submit"
                colorPalette="purple"
                loading={isSubmitting}
              >
                <Icon name="CheckIcon" />
                Guardar Configuración QR
              </Button>
            </Stack>
          </Stack>
        </form>

        {/* Generated QRs List */}
        <Section title="QRs Generados" variant="elevated">
          <Stack gap="md">
            {generatedQRs.map((qr) => (
              <Stack
                key={qr.id}
                direction="row"
                align="center"
                justify="between"
                padding="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg={qr.status === 'expired' ? 'orange.50' : qr.status === 'disabled' ? 'red.50' : 'white'}
              >
                <Stack direction="row" align="center" gap="md" flex="1">
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}>
                    <Icon name="QrCodeIcon" color="white" size="lg" />
                  </div>

                  <Stack gap="xs">
                    <Stack direction="row" align="center" gap="sm">
                      <Badge colorPalette="purple" variant="outline" size="sm">
                        {qr.type === 'static' ? 'Estático' : 'Dinámico'}
                      </Badge>
                      <Badge colorPalette={getQRStatusColor(qr.status)} variant="subtle" size="sm">
                        {qr.status}
                      </Badge>
                    </Stack>
                    <p style={{ fontWeight: 'bold' }}>
                      {qr.type === 'static' ? 'QR Estático' : `$${qr.amount?.toLocaleString()} - ${qr.description || 'Sin descripción'}`}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      ID: {qr.id} | Usos: {qr.usageCount}{qr.maxUsage ? `/${qr.maxUsage}` : ''}
                    </p>
                    {qr.expiresAt && (
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        Expira: {new Date(qr.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </Stack>
                </Stack>

                <Stack direction="row" gap="sm">
                  <Button
                    onClick={() => setSelectedQR(qr)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="EyeIcon" />
                    Ver QR
                  </Button>

                  <Button
                    onClick={() => navigator.clipboard.writeText(qr.qrString)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="ClipboardIcon" />
                    Copiar
                  </Button>

                  {qr.status === 'active' && (
                    <Button
                      onClick={() => disableQR(qr.id)}
                      colorPalette="red"
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="XMarkIcon" />
                      Deshabilitar
                    </Button>
                  )}
                </Stack>
              </Stack>
            ))}

            {generatedQRs.length === 0 && (
              <Alert status="info">
                <Icon name="InformationCircleIcon" />
                No hay códigos QR generados. Usa los botones de arriba para crear tu primer QR.
              </Alert>
            )}
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
};

export default QRInteroperableManager;