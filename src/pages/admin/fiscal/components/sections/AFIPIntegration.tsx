import { useState, useEffect } from 'react';
import {
  CardWrapper ,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Grid,
  Table,
  InputField,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@/shared/ui';
import { IconButton } from '@chakra-ui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CogIcon,
  EyeIcon,
  WifiIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';

interface AFIPStatus {
  connection: 'connected' | 'disconnected' | 'error';
  service_status: 'active' | 'maintenance' | 'inactive';
  token_expiry: string;
  certificate_valid: boolean;
  last_sync: string;
  pending_requests: number;
  failed_requests: number;
}

interface PendingInvoice {
  id: string;
  numero: number;
  cliente: string;
  total: number;
  tipo: 'A' | 'B' | 'C';
  fecha_creacion: string;
  error_description?: string;
  attempts: number;
}

interface AFIPIntegrationProps {
  variant?: 'default' | 'compact' | 'detailed';
}

// Mock data for demonstration
const mockAFIPStatus: AFIPStatus = {
  connection: 'connected',
  service_status: 'active',
  token_expiry: '2024-08-26T18:00:00Z',
  certificate_valid: true,
  last_sync: '2024-08-26T10:30:00Z',
  pending_requests: 3,
  failed_requests: 1
};

const mockPendingInvoices: PendingInvoice[] = [
  {
    id: '1',
    numero: 12345,
    cliente: 'Cliente Demo S.A.',
    total: 156780,
    tipo: 'A',
    fecha_creacion: '2024-08-26T09:15:00Z',
    attempts: 2
  },
  {
    id: '2',
    numero: 12346,
    cliente: 'Empresa XYZ Ltda.',
    total: 89250,
    tipo: 'B',
    fecha_creacion: '2024-08-26T09:30:00Z',
    error_description: 'Error de validación: CUIT inválido',
    attempts: 3
  },
  {
    id: '3',
    numero: 12347,
    cliente: 'Proveedor ABC',
    total: 234560,
    tipo: 'A',
    fecha_creacion: '2024-08-26T10:00:00Z',
    attempts: 1
  }
];

export const AFIPIntegration = ({ variant = 'default' }: AFIPIntegrationProps) => {
  const [afipStatus, setAfipStatus] = useState<AFIPStatus>(mockAFIPStatus);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>(mockPendingInvoices);
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    loadAFIPStatus();
  }, []);

  const loadAFIPStatus = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAfipStatus(mockAFIPStatus);
      setPendingInvoices(mockPendingInvoices);
    } catch (error) {
      notify.error({
        title: 'Error al obtener estado de AFIP',
        description: 'No se pudo conectar con el servicio de AFIP'
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      notify.success({
        title: 'Conexión con AFIP exitosa',
        description: 'La conexión se estableció correctamente'
      });
      loadAFIPStatus();
    } catch (error) {
      notify.error({
        title: 'Error al conectar con AFIP',
        description: 'No se pudo establecer la conexión'
      });
    } finally {
      setLoading(false);
    }
  };

  const renewToken = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      notify.success({
        title: 'Token renovado exitosamente',
        description: 'El token de acceso ha sido actualizado'
      });
      loadAFIPStatus();
    } catch (error) {
      notify.error({
        title: 'Error al renovar token',
        description: 'No se pudo renovar el token de acceso'
      });
    } finally {
      setLoading(false);
    }
  };

  const retryInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      notify.success({
        title: 'Reintentando obtener CAE...',
        description: 'La factura está siendo procesada nuevamente'
      });
      loadAFIPStatus();
    } catch (error) {
      notify.error({
        title: 'Error al reintentar CAE',
        description: 'No se pudo procesar la factura'
      });
    } finally {
      setLoading(false);
    }
  };

  const retryAllPending = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      notify.success({
        title: 'Reintentando todas las facturas pendientes...',
        description: 'Procesando facturas en cola'
      });
      loadAFIPStatus();
    } catch (error) {
      notify.error({
        title: 'Error al reintentar CAEs pendientes',
        description: 'No se pudieron procesar las facturas pendientes'
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionBadge = (status: string) => {
    const statusConfig = {
      connected: { colorPalette: 'success' as const, children: 'Conectado' },
      disconnected: { colorPalette: 'error' as const, children: 'Desconectado' },
      error: { colorPalette: 'error' as const, children: 'Error' }
    };
    
    return <Badge {...statusConfig[status as keyof typeof statusConfig]} />;
  };

  const getServiceBadge = (status: string) => {
    const statusConfig = {
      active: { colorPalette: 'success' as const, children: 'Activo' },
      maintenance: { colorPalette: 'warning' as const, children: 'Mantenimiento' },
      inactive: { colorPalette: 'error' as const, children: 'Inactivo' }
    };
    
    return <Badge {...statusConfig[status as keyof typeof statusConfig]} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR');
  };

  const isTokenExpiringSoon = () => {
    const now = new Date();
    const expiry = new Date(afipStatus.token_expiry);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24;
  };

  if (variant === 'compact') {
    return (
      <CardWrapper colorPalette="brand">
        <VStack gap="md" align="stretch">
          <HStack justify="space-between">
            <Typography variant="heading" size="sm">
              Estado AFIP
            </Typography>
            <HStack gap="sm">
              {getConnectionBadge(afipStatus.connection)}
              <Button
                size="sm"
                onClick={testConnection}
                loading={loading}
              >
                Test
              </Button>
            </HStack>
          </HStack>
          
          <Grid templateColumns="repeat(2, 1fr)" gap="sm">
            <VStack gap="xs">
              <Typography variant="caption" color="text.muted">
                Pendientes
              </Typography>
              <Typography variant="body" fontWeight="bold" color="warning">
                {afipStatus.pending_requests}
              </Typography>
            </VStack>
            <VStack gap="xs">
              <Typography variant="caption" color="text.muted">
                Fallidos
              </Typography>
              <Typography variant="body" fontWeight="bold" color="error">
                {afipStatus.failed_requests}
              </Typography>
            </VStack>
          </Grid>
        </VStack>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="lg" align="stretch">
      {/* Connection Status */}
      <CardWrapper colorPalette="brand">
        <VStack align="stretch" gap="md">
          <HStack justify="space-between">
            <Typography variant="heading" size="lg">Integración AFIP</Typography>
            <HStack gap="sm">
              <Switch
                checked={autoSync}
                onChange={(checked) => setAutoSync(checked)}
              >
                Sincronización automática
              </Switch>
              <Button
                size="sm"
                variant="outline"
                onClick={loadAFIPStatus}
                loading={loading}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </CardWrapper>

      {/* Status Overview */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="md">
        <CardWrapper colorPalette="brand">
          <VStack align="stretch" gap="md">
            <HStack>
              <WifiIcon className="w-5 h-5 text-blue-600" />
              <Typography variant="heading" size="sm">
                Estado de Conexión
              </Typography>
            </HStack>
            {getConnectionBadge(afipStatus.connection)}
            <Typography variant="caption" color="text.muted">
              Última sincronización: {formatDate(afipStatus.last_sync)}
            </Typography>
            <Button
              size="sm"
              onClick={testConnection}
              loading={loading}
            >
              <WifiIcon className="w-4 h-4 mr-2" />
              Probar Conexión
            </Button>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="brand">
          <VStack align="stretch" gap="md">
            <HStack>
              <CogIcon className="w-5 h-5 text-green-600" />
              <Typography variant="heading" size="sm">
                Estado del Servicio
              </Typography>
            </HStack>
            {getServiceBadge(afipStatus.service_status)}
            <HStack justify="space-between">
              <Typography variant="caption" color="text.muted">
                Token válido
              </Typography>
              <Badge colorPalette={afipStatus.certificate_valid ? 'success' : 'error'}>
                {afipStatus.certificate_valid ? 'Sí' : 'No'}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="outline"
              onClick={renewToken}
              loading={loading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Renovar Token
            </Button>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="brand">
          <VStack align="stretch" gap="md">
            <HStack>
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              <Typography variant="heading" size="sm">
                Solicitudes Pendientes
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="warning">
              {afipStatus.pending_requests}
            </Typography>
            <Typography variant="caption" color="text.muted">
              facturas en cola
            </Typography>
            <Button
              size="sm"
              onClick={retryAllPending}
              loading={loading}
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Procesar Todo
            </Button>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="brand">
          <VStack align="stretch" gap="md">
            <HStack>
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <Typography variant="heading" size="sm">
                Solicitudes Fallidas
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="error">
              {afipStatus.failed_requests}
            </Typography>
            <Typography variant="caption" color="text.muted">
              requieren atención
            </Typography>
          </VStack>
        </CardWrapper>
      </Grid>

      {/* Token Expiry Warning */}
      {isTokenExpiringSoon() && (
        <Alert>
          <AlertIcon>
            <ExclamationTriangleIcon className="w-5 h-5" />
          </AlertIcon>
          <VStack align="start" gap="xs">
            <AlertTitle>Token próximo a vencer</AlertTitle>
            <AlertDescription>
              El token de AFIP vence el {formatDate(afipStatus.token_expiry)}. 
              Se recomienda renovarlo antes del vencimiento.
            </AlertDescription>
          </VStack>
        </Alert>
      )}

      {/* Pending Invoices */}
      <CardWrapper colorPalette="brand">
        <VStack align="stretch" gap="md">
          <HStack justify="space-between">
            <Typography variant="heading" size="sm">
              Facturas Pendientes de CAE
            </Typography>
            <Typography variant="caption" color="text.muted">
              {pendingInvoices.length} facturas en cola
            </Typography>
          </HStack>
          
          <Table.Root size="md" variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Número</Table.ColumnHeader>
                <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                <Table.ColumnHeader>Total</Table.ColumnHeader>
                <Table.ColumnHeader>Intentos</Table.ColumnHeader>
                <Table.ColumnHeader>Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pendingInvoices.map((invoice) => (
                <>
                  <Table.Row key={invoice.id}>
                    <Table.Cell>
                      <Typography variant="body" fontWeight="medium">
                        {invoice.numero}
                      </Typography>
                    </Table.Cell>
                    <Table.Cell>
                      <Typography variant="body">
                        {invoice.cliente}
                      </Typography>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette="info">
                        Tipo {invoice.tipo}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Typography variant="body" fontWeight="medium">
                        {formatCurrency(invoice.total)}
                      </Typography>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={invoice.attempts > 2 ? 'error' : 'warning'}>
                        {invoice.attempts} intentos
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap="xs">
                        <IconButton
                          aria-label="Ver detalles"
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedError(
                            expandedError === invoice.id ? null : invoice.id
                          )}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </IconButton>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryInvoice(invoice.id)}
                        >
                          Reintentar
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                  
                  {/* Error Details Row */}
                  {expandedError === invoice.id && invoice.error_description && (
                    <Table.Row>
                      <Table.Cell colSpan={6}>
                        <Alert>
                          <AlertIcon>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                          </AlertIcon>
                          <VStack align="start" gap="xs">
                            <AlertTitle>Error en factura {invoice.numero}</AlertTitle>
                            <AlertDescription>
                              {invoice.error_description}
                            </AlertDescription>
                          </VStack>
                        </Alert>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              ))}
            </Table.Body>
          </Table.Root>
        </VStack>
      </CardWrapper>

      {/* Configuration */}
      <CardWrapper colorPalette="brand">
        <VStack align="stretch" gap="md">
          <Typography variant="heading" size="sm">
            Configuración AFIP
          </Typography>
          
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="md">
            <VStack align="stretch" gap="sm">
              <Typography variant="body" fontWeight="medium">
                CUIT de la empresa
              </Typography>
              <InputField
                value="20-12345678-9"
                placeholder="Ingrese CUIT"
                disabled
              />
            </VStack>
            
            <VStack align="stretch" gap="sm">
              <Typography variant="body" fontWeight="medium">
                Punto de venta
              </Typography>
              <InputField
                value="0001"
                placeholder="Punto de venta"
                disabled
              />
            </VStack>
            
            <VStack align="stretch" gap="sm">
              <Typography variant="body" fontWeight="medium">
                Certificado
              </Typography>
              <HStack>
                <Badge colorPalette={afipStatus.certificate_valid ? 'success' : 'error'}>
                  {afipStatus.certificate_valid ? 'Válido' : 'Expirado'}
                </Badge>
                <Button size="sm" variant="outline">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Renovar
                </Button>
              </HStack>
            </VStack>
          </Grid>
        </VStack>
      </CardWrapper>
    </VStack>
  );
};

export default AFIPIntegration;