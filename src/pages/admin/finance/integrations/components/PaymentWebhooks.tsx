import React from 'react';
import {
  ContentLayout, Section, Stack, Button, Badge, Alert, Tabs
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

interface WebhookEvent {
  id: string;
  provider: 'mercadopago' | 'modo' | 'transferencia3';
  event: string;
  timestamp: string;
  status: 'pending' | 'processed' | 'failed' | 'retrying';
  payload: any;
  attempts: number;
  lastError?: string;
}

const PaymentWebhooks: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'events' | 'config' | 'logs'>('dashboard');
  const [webhookEvents, setWebhookEvents] = React.useState<WebhookEvent[]>([]);
  const [systemStatus, setSystemStatus] = React.useState({
    isActive: true,
    processingQueue: 0,
    totalProcessed: 1247,
    failureRate: 2.3,
    avgProcessingTime: '340ms'
  });

  React.useEffect(() => {
    // Load mock webhook events
    loadMockEvents();

    // Emit module loaded event
    ModuleEventUtils.system.moduleLoaded('payment-webhooks');
  }, []);

  const loadMockEvents = () => {
    const mockEvents: WebhookEvent[] = [
      {
        id: 'wh_mp_001',
        provider: 'mercadopago',
        event: 'payment.updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'processed',
        payload: {
          payment_id: '12345678901',
          status: 'approved',
          amount: 15000,
          currency: 'ARS'
        },
        attempts: 1
      },
      {
        id: 'wh_modo_001',
        provider: 'modo',
        event: 'transfer.completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'processed',
        payload: {
          transfer_id: 'TRF_ABC123',
          amount: 25000,
          from_account: '1234567890',
          to_account: '0987654321'
        },
        attempts: 1
      },
      {
        id: 'wh_mp_002',
        provider: 'mercadopago',
        event: 'payment.failed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'processed',
        payload: {
          payment_id: '12345678902',
          status: 'rejected',
          status_detail: 'insufficient_funds'
        },
        attempts: 1
      },
      {
        id: 'wh_t3_001',
        provider: 'transferencia3',
        event: 'qr.payment.completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'failed',
        payload: {
          qr_id: 'QR_XYZ789',
          amount: 8500
        },
        attempts: 3,
        lastError: 'Invalid signature verification'
      }
    ];

    setWebhookEvents(mockEvents);
  };

  const retryWebhook = async (webhookId: string) => {
    // Simulate retry
    setWebhookEvents(prev =>
      prev.map(event =>
        event.id === webhookId
          ? { ...event, status: 'retrying' as const, attempts: event.attempts + 1 }
          : event
      )
    );

    // Simulate processing
    setTimeout(() => {
      setWebhookEvents(prev =>
        prev.map(event =>
          event.id === webhookId
            ? { ...event, status: 'processed' as const }
            : event
        )
      );
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'green';
      case 'pending': return 'blue';
      case 'retrying': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'mercadopago': return 'CreditCardIcon';
      case 'modo': return 'BanknotesIcon';
      case 'transferencia3': return 'QrCodeIcon';
      default: return 'BoltIcon';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WebhookDashboard systemStatus={systemStatus} />;
      case 'events':
        return <WebhookEventsList events={webhookEvents} onRetry={retryWebhook} />;
      case 'config':
        return <WebhookConfiguration />;
      case 'logs':
        return <WebhookLogs />;
      default:
        return <WebhookDashboard systemStatus={systemStatus} />;
    }
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        <Section title="Sistema de Webhooks Argentinos" variant="elevated">
          <Stack gap="md">
            <Stack direction="row" gap="md" align="center">
              <Badge
                colorPalette={systemStatus.isActive ? 'green' : 'red'}
                variant="subtle"
                size="lg"
              >
                {systemStatus.isActive ? '🟢 Sistema Activo' : '🔴 Sistema Inactivo'}
              </Badge>

              <Button
                onClick={() => setSystemStatus(prev => ({ ...prev, isActive: !prev.isActive }))}
                colorPalette={systemStatus.isActive ? 'red' : 'green'}
                variant="outline"
                size="sm"
              >
                <Icon name={systemStatus.isActive ? 'StopIcon' : 'PlayIcon'} />
                {systemStatus.isActive ? 'Detener' : 'Activar'}
              </Button>

              <Button
                onClick={loadMockEvents}
                variant="outline"
                size="sm"
              >
                <Icon name="ArrowPathIcon" />
                Refrescar
              </Button>
            </Stack>

            <Stack direction="row" gap="md" wrap="wrap">
              <Badge colorPalette="blue" variant="outline">
                Cola: {systemStatus.processingQueue} eventos
              </Badge>
              <Badge colorPalette="green" variant="outline">
                Procesados: {systemStatus.totalProcessed.toLocaleString()}
              </Badge>
              <Badge colorPalette="orange" variant="outline">
                Fallo: {systemStatus.failureRate}%
              </Badge>
              <Badge colorPalette="purple" variant="outline">
                Tiempo Prom: {systemStatus.avgProcessingTime}
              </Badge>
            </Stack>
          </Stack>
        </Section>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="dashboard">
              <Icon name="ChartBarIcon" />
              Dashboard
            </Tabs.Trigger>
            <Tabs.Trigger value="events">
              <Icon name="BoltIcon" />
              Eventos
            </Tabs.Trigger>
            <Tabs.Trigger value="config">
              <Icon name="CogIcon" />
              Configuración
            </Tabs.Trigger>
            <Tabs.Trigger value="logs">
              <Icon name="DocumentTextIcon" />
              Logs
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeTab}>
            {renderTabContent()}
          </Tabs.Content>
        </Tabs>
      </Stack>
    </ContentLayout>
  );
};

// Dashboard component
const WebhookDashboard: React.FC<{ systemStatus: any }> = ({ systemStatus }) => {
  return (
    <Stack gap="lg">
      <Section title="Métricas del Sistema" variant="elevated">
        <Stack gap="md">
          <Stack direction="row" gap="md">
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3182ce' }}>
                {systemStatus.totalProcessed.toLocaleString()}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>Total Procesados</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#38a169' }}>
                {systemStatus.avgProcessingTime}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>Tiempo Promedio</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f56565' }}>
                {systemStatus.failureRate}%
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>Tasa de Fallo</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#805ad5' }}>
                {systemStatus.processingQueue}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>En Cola</p>
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section title="Integración por Provider" variant="elevated">
        <Stack gap="md">
          <Stack direction="row" gap="md">
            <Stack flex="1" padding="md" border="1px solid" borderColor="blue.200" borderRadius="md" bg="blue.50">
              <Stack direction="row" align="center" gap="sm">
                <Icon name="CreditCardIcon" color="blue.500" />
                <h4>MercadoPago</h4>
              </Stack>
              <p>✅ Conectado y activo</p>
              <p>📊 847 eventos procesados</p>
              <p>⚡ 98.2% éxito</p>
            </Stack>
            <Stack flex="1" padding="md" border="1px solid" borderColor="green.200" borderRadius="md" bg="green.50">
              <Stack direction="row" align="center" gap="sm">
                <Icon name="BanknotesIcon" color="green.500" />
                <h4>MODO</h4>
              </Stack>
              <p>✅ Conectado y activo</p>
              <p>📊 234 eventos procesados</p>
              <p>⚡ 99.1% éxito</p>
            </Stack>
            <Stack flex="1" padding="md" border="1px solid" borderColor="purple.200" borderRadius="md" bg="purple.50">
              <Stack direction="row" align="center" gap="sm">
                <Icon name="QrCodeIcon" color="purple.500" />
                <h4>Transferencia 3.0</h4>
              </Stack>
              <p>✅ Conectado y activo</p>
              <p>📊 166 eventos procesados</p>
              <p>⚡ 97.6% éxito</p>
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section title="Eventos Recientes" variant="elevated">
        <Stack gap="sm">
          <p>📈 <strong>Actividad alta</strong>: 23 eventos en la última hora</p>
          <p>🔄 <strong>Auto-retry</strong>: 2 eventos reintentados automáticamente</p>
          <p>⚠️ <strong>Alertas</strong>: 1 webhook fallando más de 3 veces</p>
          <p>🎯 <strong>SLA</strong>: 99.7% uptime en las últimas 24 horas</p>
        </Stack>
      </Section>
    </Stack>
  );
};

// Events List component
const WebhookEventsList: React.FC<{ events: WebhookEvent[], onRetry: (id: string) => void }> = ({ events, onRetry }) => {
  return (
    <Section title="Lista de Eventos de Webhook" variant="elevated">
      <Stack gap="md">
        {events.map((event) => (
          <Stack
            key={event.id}
            direction="row"
            align="center"
            justify="between"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg={event.status === 'failed' ? 'red.50' : 'white'}
          >
            <Stack direction="row" align="center" gap="md" flex="1">
              <Icon name={getProviderIcon(event.provider)} size="lg" />

              <Stack gap="xs">
                <Stack direction="row" align="center" gap="sm">
                  <Badge colorPalette="blue" variant="outline" size="sm">
                    {event.provider}
                  </Badge>
                  <Badge colorPalette={getStatusColor(event.status)} variant="subtle" size="sm">
                    {event.status}
                  </Badge>
                </Stack>
                <p style={{ fontWeight: 'bold' }}>{event.event}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </Stack>

              <Stack gap="xs" flex="1">
                <p style={{ fontSize: '14px' }}>
                  <strong>ID:</strong> {event.id}
                </p>
                <p style={{ fontSize: '14px' }}>
                  <strong>Intentos:</strong> {event.attempts}
                </p>
                {event.lastError && (
                  <p style={{ fontSize: '12px', color: '#f56565' }}>
                    <strong>Error:</strong> {event.lastError}
                  </p>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" gap="sm">
              <Button
                onClick={() => console.log('View payload:', event.payload)}
                variant="outline"
                size="sm"
              >
                <Icon name="EyeIcon" />
                Ver Payload
              </Button>

              {event.status === 'failed' && (
                <Button
                  onClick={() => onRetry(event.id)}
                  colorPalette="orange"
                  size="sm"
                >
                  <Icon name="ArrowPathIcon" />
                  Reintentar
                </Button>
              )}
            </Stack>
          </Stack>
        ))}

        {events.length === 0 && (
          <Alert status="info">
            <Icon name="InformationCircleIcon" />
            No hay eventos de webhook para mostrar
          </Alert>
        )}
      </Stack>
    </Section>
  );
};

// Configuration component
const WebhookConfiguration: React.FC = () => {
  return (
    <Stack gap="lg">
      <Section title="Configuración Global de Webhooks" variant="elevated">
        <Stack gap="md">
          <Stack>
            <h4>Configuración de Retry</h4>
            <Stack gap="sm">
              <p>• <strong>Máximo reintentos:</strong> 5 intentos</p>
              <p>• <strong>Intervalo base:</strong> 1, 2, 4, 8, 16 segundos (exponential backoff)</p>
              <p>• <strong>Timeout por request:</strong> 30 segundos</p>
              <p>• <strong>Timeout total:</strong> 2 minutos</p>
            </Stack>
          </Stack>

          <Stack>
            <h4>Verificación de Seguridad</h4>
            <Stack gap="sm">
              <p>• <strong>Signature verification:</strong> Habilitada (SHA-256)</p>
              <p>• <strong>IP Whitelist:</strong> Solo IPs conocidas de providers</p>
              <p>• <strong>Rate limiting:</strong> 100 requests/minuto por provider</p>
              <p>• <strong>Payload validation:</strong> Schema validation activa</p>
            </Stack>
          </Stack>

          <Stack>
            <h4>Endpoints Configurados</h4>
            <Stack gap="sm">
              <p>• <strong>MercadoPago:</strong> /webhooks/mercadopago</p>
              <p>• <strong>MODO:</strong> /webhooks/modo</p>
              <p>• <strong>Transferencia 3.0:</strong> /webhooks/transferencia3</p>
              <p>• <strong>Health Check:</strong> /webhooks/health</p>
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section title="Configuración por Provider" variant="elevated">
        <Stack gap="md">
          <Alert status="info">
            <Icon name="InformationCircleIcon" />
            Las configuraciones específicas de cada provider se manejan en sus respectivas secciones.
          </Alert>

          <Stack direction="row" gap="md">
            <Button colorPalette="blue" variant="outline">
              <Icon name="CreditCardIcon" />
              Configurar MercadoPago
            </Button>
            <Button colorPalette="green" variant="outline">
              <Icon name="BanknotesIcon" />
              Configurar MODO
            </Button>
            <Button colorPalette="purple" variant="outline">
              <Icon name="QrCodeIcon" />
              Configurar Transferencia 3.0
            </Button>
          </Stack>
        </Stack>
      </Section>
    </Stack>
  );
};

// Logs component
const WebhookLogs: React.FC = () => {
  const mockLogs = [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'MercadoPago webhook processed successfully', provider: 'mercadopago' },
    { timestamp: new Date(Date.now() - 1000 * 60).toISOString(), level: 'WARNING', message: 'MODO webhook retry attempt 2', provider: 'modo' },
    { timestamp: new Date(Date.now() - 1000 * 120).toISOString(), level: 'ERROR', message: 'Transferencia 3.0 signature verification failed', provider: 'transferencia3' },
    { timestamp: new Date(Date.now() - 1000 * 180).toISOString(), level: 'INFO', message: 'Webhook system health check passed', provider: 'system' }
  ];

  return (
    <Section title="Logs del Sistema de Webhooks" variant="elevated">
      <Stack gap="sm">
        {mockLogs.map((log, index) => (
          <Stack
            key={index}
            direction="row"
            align="center"
            gap="md"
            padding="sm"
            borderRadius="md"
            bg={log.level === 'ERROR' ? 'red.50' : log.level === 'WARNING' ? 'orange.50' : 'gray.50'}
          >
            <Badge
              colorPalette={log.level === 'ERROR' ? 'red' : log.level === 'WARNING' ? 'orange' : 'blue'}
              variant="subtle"
              size="sm"
            >
              {log.level}
            </Badge>
            <span style={{ fontSize: '12px', color: '#666', minWidth: '120px' }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span style={{ flex: 1 }}>{log.message}</span>
            <Badge colorPalette="gray" variant="outline" size="sm">
              {log.provider}
            </Badge>
          </Stack>
        ))}
      </Stack>
    </Section>
  );
};

// Helper functions
function getProviderIcon(provider: string): any {
  switch (provider) {
    case 'mercadopago': return 'CreditCardIcon';
    case 'modo': return 'BanknotesIcon';
    case 'transferencia3': return 'QrCodeIcon';
    default: return 'BoltIcon';
  }
}

function getStatusColor(status: string): any {
  switch (status) {
    case 'processed': return 'green';
    case 'pending': return 'blue';
    case 'retrying': return 'orange';
    case 'failed': return 'red';
    default: return 'gray';
  }
}

export default PaymentWebhooks;