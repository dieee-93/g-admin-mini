import React from 'react';
import {
  ContentLayout, Section, Stack, Button, Badge, Typography,
  CardGrid, MetricCard, Icon, Modal
} from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

const integrationSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  type: z.enum(['api', 'database', 'file', 'webhook']),
  endpoint: z.string().url('URL válida requerida'),
  authType: z.enum(['none', 'api_key', 'oauth', 'basic']),
  apiKey: z.string().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily', 'weekly']),
  dataMapping: z.string().min(10, 'Mapeo de datos requerido')
});

type IntegrationData = z.infer<typeof integrationSchema>;

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'webhook';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  recordCount: number;
  endpoint: string;
  syncFrequency: string;
}

const ExternalDataIntegration: React.FC = () => {
  const [dataSources, setDataSources] = React.useState<DataSource[]>([
    {
      id: '1',
      name: 'Google Analytics',
      type: 'api',
      status: 'connected',
      lastSync: new Date(Date.now() - 3600000),
      recordCount: 15420,
      endpoint: 'https://analytics.googleapis.com/v4',
      syncFrequency: 'hourly'
    },
    {
      id: '2',
      name: 'CRM Externo',
      type: 'api',
      status: 'connected',
      lastSync: new Date(Date.now() - 7200000),
      recordCount: 8340,
      endpoint: 'https://api.crm-provider.com/v2',
      syncFrequency: 'daily'
    },
    {
      id: '3',
      name: 'Base de Datos Legada',
      type: 'database',
      status: 'error',
      lastSync: new Date(Date.now() - 86400000),
      recordCount: 0,
      endpoint: 'postgresql://legacy.db.com:5432',
      syncFrequency: 'weekly'
    },
    {
      id: '4',
      name: 'Archivos CSV Contabilidad',
      type: 'file',
      status: 'syncing',
      lastSync: new Date(Date.now() - 1800000),
      recordCount: 2150,
      endpoint: '/uploads/accounting/*.csv',
      syncFrequency: 'daily'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<DataSource | null>(null);
  const [syncLog, setSyncLog] = React.useState<Array<{
    id: string;
    source: string;
    timestamp: Date;
    status: 'success' | 'error' | 'warning';
    message: string;
    recordsProcessed: number;
  }>>([
    {
      id: '1',
      source: 'Google Analytics',
      timestamp: new Date(Date.now() - 3600000),
      status: 'success',
      message: 'Sincronización completada exitosamente',
      recordsProcessed: 342
    },
    {
      id: '2',
      source: 'CRM Externo',
      timestamp: new Date(Date.now() - 7200000),
      status: 'success',
      message: 'Datos de clientes actualizados',
      recordsProcessed: 178
    },
    {
      id: '3',
      source: 'Base de Datos Legada',
      timestamp: new Date(Date.now() - 86400000),
      status: 'error',
      message: 'Error de conexión: Timeout después de 30s',
      recordsProcessed: 0
    }
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IntegrationData>({
    resolver: zodResolver(integrationSchema)
  });

  React.useEffect(() => {
    ModuleEventUtils.system.moduleLoaded('external-data-integration');
  }, []);

  const addIntegration = (data: IntegrationData) => {
    const newSource: DataSource = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      type: data.type,
      status: 'disconnected',
      lastSync: new Date(),
      recordCount: 0,
      endpoint: data.endpoint,
      syncFrequency: data.syncFrequency
    };

    setDataSources(prev => [...prev, newSource]);
    setIsModalOpen(false);
    reset();

    ModuleEventUtils.executive.externalDataSourceAdded({
      sourceId: newSource.id,
      name: data.name,
      type: data.type,
      endpoint: data.endpoint
    });
  };

  const syncSource = async (sourceId: string) => {
    setDataSources(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, status: 'syncing' as const }
        : source
    ));

    setTimeout(() => {
      const recordsProcessed = Math.floor(Math.random() * 500) + 50;
      const success = Math.random() > 0.2;

      setDataSources(prev => prev.map(source =>
        source.id === sourceId
          ? {
              ...source,
              status: success ? 'connected' as const : 'error' as const,
              lastSync: new Date(),
              recordCount: success ? source.recordCount + recordsProcessed : source.recordCount
            }
          : source
      ));

      const newLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        source: dataSources.find(s => s.id === sourceId)?.name || 'Unknown',
        timestamp: new Date(),
        status: success ? 'success' as const : 'error' as const,
        message: success ? 'Sincronización completada exitosamente' : 'Error en la sincronización',
        recordsProcessed: success ? recordsProcessed : 0
      };

      setSyncLog(prev => [newLogEntry, ...prev].slice(0, 20));

      ModuleEventUtils.executive.externalDataSynced({
        sourceId,
        status: success ? 'success' : 'error',
        recordsProcessed,
        timestamp: new Date()
      });
    }, 3000);
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'green';
      case 'syncing': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'CheckCircleIcon';
      case 'syncing': return 'ArrowPathIcon';
      case 'error': return 'XCircleIcon';
      default: return 'QuestionMarkCircleIcon';
    }
  };

  const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'api': return 'CloudIcon';
      case 'database': return 'CircleStackIcon';
      case 'file': return 'DocumentIcon';
      case 'webhook': return 'BoltIcon';
    }
  };

  const totalRecords = dataSources.reduce((sum, source) => sum + source.recordCount, 0);
  const connectedSources = dataSources.filter(s => s.status === 'connected').length;
  const errorSources = dataSources.filter(s => s.status === 'error').length;

  return (
    <ContentLayout spacing="normal">
      <Section variant="elevated" title="Integración de Datos Externos">
        <Stack gap="lg">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Fuentes Conectadas"
              value={connectedSources.toString()}
              subtitle={`de ${dataSources.length} total`}
              icon="CloudIcon"
              trend="up"
              change="+1"
            />
            <MetricCard
              title="Registros Sincronizados"
              value={totalRecords.toLocaleString()}
              subtitle="último período"
              icon="CircleStackIcon"
              trend="up"
              change="+12%"
            />
            <MetricCard
              title="Fuentes con Error"
              value={errorSources.toString()}
              subtitle="requieren atención"
              icon="ExclamationTriangleIcon"
              trend={errorSources > 0 ? "down" : "neutral"}
              change={errorSources > 0 ? "Error" : "OK"}
            />
            <MetricCard
              title="Última Sincronización"
              value="hace 1h"
              subtitle="Google Analytics"
              icon="ClockIcon"
              trend="neutral"
            />
          </CardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section variant="flat" title="Fuentes de Datos">
              <Stack gap="md">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  colorPalette="blue"
                  size="sm"
                >
                  <Icon name="PlusIcon" />
                  Nueva Integración
                </Button>

                <Stack gap="sm">
                  {dataSources.map((source) => (
                    <div
                      key={source.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Icon name={getTypeIcon(source.type)} />
                          <div>
                            <Typography fontWeight="medium">{source.name}</Typography>
                            <Typography fontSize="sm" color="gray.600">
                              {source.endpoint}
                            </Typography>
                          </div>
                        </div>
                        <Badge colorPalette={getStatusColor(source.status)} size="sm">
                          <Icon
                            name={getStatusIcon(source.status)}
                            className={source.status === 'syncing' ? 'animate-spin' : ''}
                          />
                          {source.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Typography fontSize="xs" color="gray.500">Última Sync</Typography>
                          <Typography fontSize="sm">
                            {source.lastSync.toLocaleTimeString()}
                          </Typography>
                        </div>
                        <div>
                          <Typography fontSize="xs" color="gray.500">Registros</Typography>
                          <Typography fontSize="sm">
                            {source.recordCount.toLocaleString()}
                          </Typography>
                        </div>
                        <div>
                          <Typography fontSize="xs" color="gray.500">Frecuencia</Typography>
                          <Typography fontSize="sm">{source.syncFrequency}</Typography>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => syncSource(source.id)}
                          disabled={source.status === 'syncing'}
                        >
                          <Icon name="ArrowPathIcon" />
                          Sincronizar
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setSelectedSource(source)}
                        >
                          <Icon name="Cog6ToothIcon" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Stack>
            </Section>

            <Section variant="flat" title="Registro de Sincronización">
              <Stack gap="sm">
                {syncLog.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Typography fontSize="sm" fontWeight="medium">
                        {entry.source}
                      </Typography>
                      <Badge
                        colorPalette={entry.status === 'success' ? 'green' : entry.status === 'error' ? 'red' : 'yellow'}
                        size="sm"
                      >
                        {entry.status}
                      </Badge>
                    </div>
                    <Typography fontSize="sm" color="gray.600" className="mb-1">
                      {entry.message}
                    </Typography>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{entry.timestamp.toLocaleString()}</span>
                      <span>{entry.recordsProcessed} registros</span>
                    </div>
                  </div>
                ))}
              </Stack>
            </Section>
          </div>
        </Stack>
      </Section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Integración de Datos"
        size="lg"
      >
        <form onSubmit={handleSubmit(addIntegration)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                {...register('name')}
                className="w-full p-2 border rounded"
                placeholder="Mi API Externa"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select {...register('type')} className="w-full p-2 border rounded">
                <option value="api">API REST</option>
                <option value="database">Base de Datos</option>
                <option value="file">Archivos</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Endpoint/URL</label>
            <input
              {...register('endpoint')}
              className="w-full p-2 border rounded"
              placeholder="https://api.ejemplo.com/v1"
            />
            {errors.endpoint && (
              <p className="text-red-500 text-sm mt-1">{errors.endpoint.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Autenticación</label>
              <select {...register('authType')} className="w-full p-2 border rounded">
                <option value="none">Sin autenticación</option>
                <option value="api_key">API Key</option>
                <option value="oauth">OAuth 2.0</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Frecuencia</label>
              <select {...register('syncFrequency')} className="w-full p-2 border rounded">
                <option value="real_time">Tiempo Real</option>
                <option value="hourly">Cada Hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key (opcional)</label>
            <input
              {...register('apiKey')}
              type="password"
              className="w-full p-2 border rounded"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mapeo de Datos</label>
            <textarea
              {...register('dataMapping')}
              className="w-full p-2 border rounded h-20"
              placeholder='{"customer_id": "id", "customer_name": "name", "email": "email"}'
            />
            {errors.dataMapping && (
              <p className="text-red-500 text-sm mt-1">{errors.dataMapping.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" colorPalette="blue">
              Crear Integración
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </ContentLayout>
  );
};

export default ExternalDataIntegration;