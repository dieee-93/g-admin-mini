import React from 'react';
import {
  Section, Stack, Button, Badge, Alert, Tabs, Table, EmptyState
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import {
  ArrowPathIcon, BoltIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';

import { useWebhookEvents, useWebhookStats } from '@/modules/finance-integrations/hooks/usePayments';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PaymentWebhooks: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'failed'>('all');
  const [selectedProvider, setSelectedProvider] = React.useState<string | undefined>();

  // Fetch webhook events based on filters
  const filters = React.useMemo(() => {
    const f: { status?: string; provider?: string; limit?: number } = { limit: 50 };
    if (activeTab !== 'all') f.status = activeTab;
    if (selectedProvider) f.provider = selectedProvider;
    return f;
  }, [activeTab, selectedProvider]);

  const { data: events = [], isLoading, refetch } = useWebhookEvents(filters);
  const stats = useWebhookStats();

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <Badge colorPalette="green" variant="subtle">
            <Icon as={CheckCircleIcon} />
            Procesado
          </Badge>
        );
      case 'pending':
        return (
          <Badge colorPalette="blue" variant="subtle">
            <Icon as={ClockIcon} />
            Pendiente
          </Badge>
        );
      case 'failed':
        return (
          <Badge colorPalette="red" variant="subtle">
            <Icon as={XCircleIcon} />
            Fallido
          </Badge>
        );
      case 'retrying':
        return (
          <Badge colorPalette="orange" variant="subtle">
            <Icon as={ArrowPathIcon} />
            Reintentando
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Provider badge helper
  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      mercadopago: 'blue',
      modo: 'purple',
      stripe: 'green',
    };
    return (
      <Badge colorPalette={colors[provider] || 'gray'} variant="outline">
        {provider.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Stack gap="lg">
      {/* Stats Section */}
      <Section title="Estadísticas de Webhooks" variant="elevated">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Stack
            flex="1"
            align="center"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3182ce' }}>
              {stats.totalEvents}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Total Eventos</p>
          </Stack>
          <Stack
            flex="1"
            align="center"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#38a169' }}>
              {stats.processedEvents}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Procesados</p>
          </Stack>
          <Stack
            flex="1"
            align="center"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53e3e' }}>
              {stats.failedEvents}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Fallidos</p>
          </Stack>
          <Stack
            flex="1"
            align="center"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#805ad5' }}>
              {stats.byProvider.mercadopago}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>MercadoPago</p>
          </Stack>
          <Stack
            flex="1"
            align="center"
            padding="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#d69e2e' }}>
              {stats.byProvider.modo}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>MODO</p>
          </Stack>
        </Stack>
      </Section>

      {/* Filters and Actions */}
      <Section variant="elevated">
        <Stack direction="row" gap="md" justifyContent="space-between" alignItems="center">
          <Stack direction="row" gap="sm">
            <Button
              size="sm"
              variant={selectedProvider === undefined ? 'solid' : 'outline'}
              onClick={() => setSelectedProvider(undefined)}
            >
              Todos
            </Button>
            <Button
              size="sm"
              variant={selectedProvider === 'mercadopago' ? 'solid' : 'outline'}
              onClick={() => setSelectedProvider('mercadopago')}
            >
              MercadoPago
            </Button>
            <Button
              size="sm"
              variant={selectedProvider === 'modo' ? 'solid' : 'outline'}
              onClick={() => setSelectedProvider('modo')}
            >
              MODO
            </Button>
          </Stack>
          <Button size="sm" onClick={() => refetch()} disabled={isLoading}>
            <Icon as={ArrowPathIcon} />
            Actualizar
          </Button>
        </Stack>
      </Section>

      {/* Events Table */}
      <Section title="Eventos Recientes" variant="elevated">
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="all">
              Todos ({stats.totalEvents})
            </Tabs.Trigger>
            <Tabs.Trigger value="pending">
              Pendientes ({stats.pendingEvents})
            </Tabs.Trigger>
            <Tabs.Trigger value="failed">
              Fallidos ({stats.failedEvents})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeTab}>
            {isLoading ? (
              <Alert status="info" title="Cargando eventos..." />
            ) : events.length === 0 ? (
              <EmptyState
                title="No hay eventos de webhook"
                description="Los webhooks aparecerán aquí cuando los gateways de pago envíen notificaciones."
                icon={BoltIcon}
              />
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Provider</Table.ColumnHeader>
                    <Table.ColumnHeader>Evento</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                    <Table.ColumnHeader>Intentos</Table.ColumnHeader>
                    <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
                    <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {events.map((event) => (
                    <Table.Row key={event.id}>
                      <Table.Cell>{getProviderBadge(event.provider)}</Table.Cell>
                      <Table.Cell>
                        <Stack gap="0">
                          <p style={{ fontWeight: '500' }}>{event.event_type}</p>
                          {event.external_id && (
                            <p style={{ fontSize: '12px', color: '#666' }}>
                              ID: {event.external_id}
                            </p>
                          )}
                        </Stack>
                      </Table.Cell>
                      <Table.Cell>{getStatusBadge(event.status)}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={event.attempts > 1 ? 'solid' : 'subtle'}>
                          {event.attempts}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <p style={{ fontSize: '14px' }}>
                          {formatDistanceToNow(new Date(event.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                        {event.processed_at && (
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            Procesado {formatDistanceToNow(new Date(event.processed_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Stack direction="row" gap="sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log('Event payload:', event.payload);
                              alert(JSON.stringify(event.payload, null, 2));
                            }}
                          >
                            Ver Payload
                          </Button>
                          {event.status === 'failed' && event.error_message && (
                            <Button
                              size="sm"
                              variant="outline"
                              colorPalette="red"
                              onClick={() => alert(event.error_message)}
                            >
                              <Icon as={ExclamationTriangleIcon} />
                              Error
                            </Button>
                          )}
                        </Stack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </Section>

      {/* Info Alert */}
      {stats.totalEvents === 0 && (
        <Alert status="info" title="Webhook System">
          Los webhooks se registrarán automáticamente cuando MercadoPago o MODO envíen
          notificaciones de pago. Asegúrate de configurar las URLs de webhook en los
          paneles de cada proveedor.
        </Alert>
      )}
    </Stack>
  );
};

export default PaymentWebhooks;
