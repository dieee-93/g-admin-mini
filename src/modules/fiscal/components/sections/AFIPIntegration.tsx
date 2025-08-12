import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  Alert,
  SimpleGrid,
  Table,
  Input,
  Switch,
  Textarea,
  Progress,
  IconButton,
  Collapsible
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CogIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WifiIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { type AFIPConfiguration, type Invoice } from '../../types';
import { fiscalApi } from '../../data/fiscalApi';
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
  fecha: string;
  intentos: number;
  ultimo_error?: string;
}

export function AFIPIntegration() {
  const [afipStatus, setAFIPStatus] = useState<AFIPStatus | null>(null);
  const [afipConfig, setAFIPConfig] = useState<AFIPConfiguration | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    fetchAFIPStatus();
    fetchPendingInvoices();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(() => {
      if (autoSync) {
        fetchAFIPStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSync]);

  const fetchAFIPStatus = async () => {
    try {
      const status = await fiscalApi.getAFIPStatus();
      setAFIPStatus(status);
      
      const config = await fiscalApi.getAFIPConfiguration();
      setAFIPConfig(config);
    } catch (error) {
      notify.error('Error al obtener estado de AFIP');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingInvoices = async () => {
    try {
      const pending = await fiscalApi.getPendingInvoices();
      setPendingInvoices(pending);
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
    }
  };

  const testConnection = async () => {
    try {
      setIsConnecting(true);
      await fiscalApi.testAFIPConnection();
      await fetchAFIPStatus();
      notify.success('Conexión con AFIP exitosa');
    } catch (error) {
      notify.error('Error al conectar con AFIP');
    } finally {
      setIsConnecting(false);
    }
  };

  const renewToken = async () => {
    try {
      setIsConnecting(true);
      await fiscalApi.renewAFIPToken();
      await fetchAFIPStatus();
      notify.success('Token renovado exitosamente');
    } catch (error) {
      notify.error('Error al renovar token');
    } finally {
      setIsConnecting(false);
    }
  };

  const retryPendingInvoice = async (invoiceId: string) => {
    try {
      await fiscalApi.retryCAERequest(invoiceId);
      await fetchPendingInvoices();
      await fetchAFIPStatus();
      notify.success('Reintentando obtener CAE...');
    } catch (error) {
      notify.error('Error al reintentar CAE');
    }
  };

  const retryAllPending = async () => {
    try {
      setIsConnecting(true);
      await fiscalApi.retryAllPendingCAE();
      await fetchPendingInvoices();
      await fetchAFIPStatus();
      notify.success('Reintentando todas las facturas pendientes...');
    } catch (error) {
      notify.error('Error al reintentar CAEs pendientes');
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'green';
      case 'maintenance':
        return 'yellow';
      case 'disconnected':
      case 'inactive':
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Error';
      case 'active': return 'Activo';
      case 'maintenance': return 'Mantenimiento';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const isTokenExpiring = afipStatus?.token_expiry ? 
    new Date(afipStatus.token_expiry).getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;

  if (isLoading) {
    return <Text color="gray.600">Cargando estado de AFIP...</Text>;
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Connection Status Header */}
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap="4">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Estado de Conexión AFIP</Text>
              <HStack gap="2">
                <HStack gap="1">
                  <Text fontSize="sm" color="gray.600">Auto-sync:</Text>
                  <Switch
                    checked={autoSync}
                    onCheckedChange={(details) => setAutoSync(details.checked)}
                    size="sm"
                  />
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  onClick={fetchAFIPStatus}
                  isLoading={isConnecting}
                >
                  Actualizar
                </Button>
              </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
              <Card.Root variant="subtle" bg={`${getStatusColor(afipStatus?.connection || 'error')}.50`}>
                <Card.Body p="3" textAlign="center">
                  <VStack gap="1">
                    <HStack gap="1" justify="center">
                      <WifiIcon className={`w-5 h-5 text-${getStatusColor(afipStatus?.connection || 'error')}-600`} />
                      <Badge colorPalette={getStatusColor(afipStatus?.connection || 'error')} size="sm">
                        {getStatusLabel(afipStatus?.connection || 'Error')}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">Conexión</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg={`${getStatusColor(afipStatus?.service_status || 'error')}.50`}>
                <Card.Body p="3" textAlign="center">
                  <VStack gap="1">
                    <HStack gap="1" justify="center">
                      <CogIcon className={`w-5 h-5 text-${getStatusColor(afipStatus?.service_status || 'error')}-600`} />
                      <Badge colorPalette={getStatusColor(afipStatus?.service_status || 'error')} size="sm">
                        {getStatusLabel(afipStatus?.service_status || 'Error')}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">Servicio AFIP</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg={afipStatus?.certificate_valid ? "green.50" : "red.50"}>
                <Card.Body p="3" textAlign="center">
                  <VStack gap="1">
                    <HStack gap="1" justify="center">
                      <DocumentTextIcon className={`w-5 h-5 text-${afipStatus?.certificate_valid ? 'green' : 'red'}-600`} />
                      <Badge colorPalette={afipStatus?.certificate_valid ? 'green' : 'red'} size="sm">
                        {afipStatus?.certificate_valid ? 'Válido' : 'Inválido'}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">Certificado</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg={isTokenExpiring ? "yellow.50" : "green.50"}>
                <Card.Body p="3" textAlign="center">
                  <VStack gap="1">
                    <Text fontSize="sm" fontWeight="bold" color={isTokenExpiring ? "yellow.600" : "green.600"}>
                      {afipStatus?.token_expiry ? 
                        new Date(afipStatus.token_expiry).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">Token Expira</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>

            {/* Action Buttons */}
            <HStack gap="2" wrap="wrap">
              <Button
                size="sm"
                colorPalette="blue"
                leftIcon={<WifiIcon className="w-4 h-4" />}
                onClick={testConnection}
                isLoading={isConnecting}
              >
                Probar Conexión
              </Button>
              
              {isTokenExpiring && (
                <Button
                  size="sm"
                  colorPalette="yellow"
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  onClick={renewToken}
                  isLoading={isConnecting}
                >
                  Renovar Token
                </Button>
              )}
              
              {pendingInvoices.length > 0 && (
                <Button
                  size="sm"
                  colorPalette="green"
                  leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={retryAllPending}
                  isLoading={isConnecting}
                >
                  Reintentar Todos
                </Button>
              )}
            </HStack>

            {/* Warnings and Alerts */}
            {!afipStatus?.certificate_valid && (
              <Alert.Root status="error" variant="subtle">
                <XCircleIcon className="w-5 h-5" />
                <Alert.Title>Certificado AFIP Inválido</Alert.Title>
                <Alert.Description>
                  El certificado AFIP no es válido. Contacte al administrador para renovarlo.
                </Alert.Description>
              </Alert.Root>
            )}

            {isTokenExpiring && (
              <Alert.Root status="warning" variant="subtle">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <Alert.Title>Token Próximo a Expirar</Alert.Title>
                <Alert.Description>
                  El token de autenticación expira en menos de 24 horas. Se recomienda renovarlo.
                </Alert.Description>
              </Alert.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <Card.Root>
          <Card.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="semibold">
                  Facturas Pendientes de CAE ({pendingInvoices.length})
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Última actualización: {afipStatus?.last_sync ? 
                    new Date(afipStatus.last_sync).toLocaleTimeString() : 'Nunca'}
                </Text>
              </HStack>

              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Número</Table.ColumnHeader>
                    <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                    <Table.ColumnHeader>Total</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                    <Table.ColumnHeader>Intentos</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                    <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {pendingInvoices.map((invoice) => (
                    <Table.Row key={invoice.id}>
                      <Table.Cell>
                        <Text fontSize="sm" fontFamily="mono">
                          {String(invoice.numero).padStart(8, '0')}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{invoice.cliente}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          ${invoice.total.toLocaleString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {new Date(invoice.fecha).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <VStack gap="1" align="center">
                          <Badge
                            colorPalette={invoice.intentos > 3 ? 'red' : invoice.intentos > 1 ? 'yellow' : 'blue'}
                            size="sm"
                          >
                            {invoice.intentos}
                          </Badge>
                          <Progress 
                            value={(invoice.intentos / 5) * 100}
                            size="xs"
                            w="40px"
                            colorPalette={invoice.intentos > 3 ? 'red' : invoice.intentos > 1 ? 'yellow' : 'blue'}
                          />
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <VStack align="start" gap="1">
                          <Badge colorPalette="yellow" size="xs">
                            Pendiente
                          </Badge>
                          {invoice.ultimo_error && (
                            <Button
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => setExpandedError(
                                expandedError === invoice.id ? null : invoice.id
                              )}
                              rightIcon={expandedError === invoice.id ? 
                                <ChevronUpIcon className="w-3 h-3" /> : 
                                <ChevronDownIcon className="w-3 h-3" />
                              }
                            >
                              Error
                            </Button>
                          )}
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap="1">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="blue"
                            aria-label="Ver detalles"
                          >
                            <EyeIcon className="w-3 h-3" />
                          </IconButton>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="green"
                            aria-label="Reintentar"
                            onClick={() => retryPendingInvoice(invoice.id)}
                          >
                            <ArrowPathIcon className="w-3 h-3" />
                          </IconButton>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {/* Error Details */}
              {pendingInvoices.map(invoice => (
                expandedError === invoice.id && invoice.ultimo_error && (
                  <Collapsible.Root key={`error-${invoice.id}`} open={true}>
                    <Alert.Root status="error" variant="subtle">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <Alert.Title>Error en Factura {invoice.numero}</Alert.Title>
                      <Alert.Description>
                        <Box mt="2">
                          <Text fontSize="sm" fontFamily="mono" bg="red.100" p="2" borderRadius="md">
                            {invoice.ultimo_error}
                          </Text>
                        </Box>
                      </Alert.Description>
                    </Alert.Root>
                  </Collapsible.Root>
                )
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Configuration Summary */}
      {afipConfig && (
        <Card.Root>
          <Card.Body>
            <VStack align="stretch" gap="4">
              <Text fontSize="md" fontWeight="semibold">Configuración AFIP</Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb="1">CUIT</Text>
                  <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                    {afipConfig.cuit}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb="1">Punto de Venta</Text>
                  <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                    {String(afipConfig.punto_venta).padStart(4, '0')}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb="1">Ambiente</Text>
                  <Badge 
                    colorPalette={afipConfig.environment === 'production' ? 'green' : 'yellow'} 
                    size="sm"
                  >
                    {afipConfig.environment === 'production' ? 'Producción' : 'Testing'}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb="1">Último Comprobante</Text>
                  <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                    {String(afipConfig.ultimo_comprobante || 0).padStart(8, '0')}
                  </Text>
                </Box>
              </SimpleGrid>
              
              <Alert.Root status="info" variant="subtle">
                <Alert.Description>
                  Para modificar la configuración AFIP, contacte al administrador del sistema.
                  Los cambios requieren certificados válidos y permisos especiales.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* No Pending Invoices Message */}
      {pendingInvoices.length === 0 && (
        <Card.Root>
          <Card.Body py="12" textAlign="center">
            <VStack gap="4">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="semibold">Todas las facturas están procesadas</Text>
                <Text color="gray.600">
                  No hay facturas pendientes de autorización CAE
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}