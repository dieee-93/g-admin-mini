// AFIPIntegration.tsx - AFIP Integration Management - MIGRATED TO DESIGN SYSTEM
// Handles AFIP authentication, certificate management, and service integration

import { useState, useEffect } from 'react';

// DESIGN SYSTEM IMPORTS - Following our conventions
import {
  CardWrapper,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Alert,
  AlertDescription,
  SimpleGrid,
  InputField,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';

import { Icon } from '@/shared/ui';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon,
  ArrowPathIcon,
  CogIcon,
  KeyIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

import { fiscalApi } from '../../services/fiscalApi'; 
import { notify } from '@/lib/notifications';

// AFIP Integration Types
interface AFIPStatus {
  authenticated: boolean;
  certificateValid: boolean;
  certificateExpiry: string;
  lastConnection: string;
  servicesAvailable: string[];
  environment: 'testing' | 'production';
}

interface AFIPConfiguration {
  cuit: string;
  certificatePath: string;
  privateKeyPath: string;
  environment: 'testing' | 'production';
  puntoVenta: number;
  lastUpdate: string;
}

interface AFIPService {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: string;
  endpoint: string;
  version: string;
}

const AFIPIntegration: React.FC = () => {
  const [afipStatus, setAfipStatus] = useState<AFIPStatus | null>(null);
  const [afipConfig, setAfipConfig] = useState<AFIPConfiguration | null>(null);
  const [afipServices, setAfipServices] = useState<AFIPService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRenewingToken, setIsRenewingToken] = useState(false);

  // Load AFIP status and configuration
  useEffect(() => {
    loadAfipData();
  }, []);

  const loadAfipData = async () => {
    try {
      setIsLoading(true);
      const [status, config] = await Promise.all([
        fiscalApi.getAFIPStatus,
        fiscalApi.getAFIPConfiguration()
      ]);
      
      setAfipStatus(status);
      setAfipConfig(config);
      
      // Mock services data
      setAfipServices([
        {
          name: 'Facturación Electrónica',
          status: status.authenticated ? 'active' : 'inactive',
          lastCheck: new Date().toISOString(),
          endpoint: 'wsfe',
          version: '1.2.0'
        },
        {
          name: 'Padrón A5',
          status: status.authenticated ? 'active' : 'inactive',
          lastCheck: new Date().toISOString(),
          endpoint: 'ws_sr_padron_a5',
          version: '1.0.0'
        },
        {
          name: 'Constancia de Inscripción',
          status: status.authenticated ? 'active' : 'inactive',
          lastCheck: new Date().toISOString(),
          endpoint: 'ws_sr_constancia_inscripcion',
          version: '1.0.0'
        }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notify.error({
        title: 'Error',
        description: `Error loading AFIP data: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsConnecting(true);
      await fiscalApi.testAfipConnection();
      notify.success({
        title: 'Éxito',
        description: 'Conexión AFIP exitosa'
      });
      await loadAfipData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notify.error({
        title: 'Error',
        description: `Error testing AFIP connection: ${errorMessage}`
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRenewToken = async () => {
    try {
      setIsRenewingToken(true);
      await fiscalApi.renewAfipToken();
      notify.success({
        title: 'Éxito',
        description: 'Token AFIP renovado exitosamente'
      });
      await loadAfipData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notify.error({
        title: 'Error',
        description: `Error renewing AFIP token: ${errorMessage}`
      });
    } finally {
      setIsRenewingToken(false);
    }
  };

  const getStatusColor = (authenticated: boolean, certificateValid: boolean) => {
    if (authenticated && certificateValid) return 'success';
    if (authenticated && !certificateValid) return 'warning';
    return 'error';
  };

  const getServiceStatusBadge = (status: AFIPService['status']) => {
    switch (status) {
      case 'active':
        return { colorPalette: 'success' as const, label: 'Activo' };
      case 'inactive':
        return { colorPalette: 'gray' as const, label: 'Inactivo' };
      case 'error':
        return { colorPalette: 'error' as const, label: 'Error' };
      default:
        return { colorPalette: 'gray' as const, label: 'Desconocido' };
    }
  };

  if (isLoading) {
    return (
      <VStack gap="md" align="center" padding="lg">
        <Icon icon={ArrowPathIcon} size="2xl" color="blue.500" style={{ animation: 'spin 1s linear infinite' }} />
        <Typography variant="body">Cargando configuración AFIP...</Typography>
      </VStack>
    );
  }

  return (
    <VStack gap="lg">
      {/* AFIP Status Overview */}
      {afipStatus && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          <CardWrapper variant="outline" padding="md">
            <CardWrapper.Body>
              <VStack gap="sm">
                <Icon 
                  icon={ShieldCheckIcon}
                  size="2xl" 
                  color={afipStatus.authenticated ? 'var(--chakra-colors-green-500)' : 'var(--chakra-colors-red-500)'} 
                />
                <Typography variant="title">
                  {afipStatus.authenticated ? 'Conectado' : 'Desconectado'}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Estado de Autenticación
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper.Body>
              <VStack gap="sm">
                <Icon
                  icon={DocumentTextIcon} 
                  size="2xl" 
                  color={afipStatus.certificateValid ? 'var(--chakra-colors-green-500)' : 'var(--chakra-colors-yellow-500)'} 
                />
                <Typography variant="title">
                  {afipStatus.certificateValid ? 'Válido' : 'Por Vencer'}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Certificado
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper.Body>
              <VStack gap="sm">
                <Icon icon={ServerIcon} size="2xl" color="blue.500" />
                <Typography variant="title">
                  {afipServices.filter(s => s.status === 'active').length}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Servicios Activos
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper.Body>
              <VStack gap="sm">
                <Icon icon={CogIcon} size="2xl" color="purple.500" />
                <Typography variant="title">
                  {afipStatus.environment === 'production' ? 'Producción' : 'Testing'}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Ambiente
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
      )}

      {/* Connection Status Alert */}
      {afipStatus && (
        <Alert 
          status={getStatusColor(afipStatus.authenticated, afipStatus.certificateValid)}
          title={afipStatus.authenticated ? 'AFIP Conectado' : 'AFIP Desconectado'}
        >
          <AlertDescription>
            {afipStatus.authenticated 
              ? `Última conexión: ${new Date(afipStatus.lastConnection).toLocaleString()}`
              : 'No hay conexión activa con AFIP. Verifica la configuración y certificados.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="status" variant="enclosed">
        <TabList>
          <Tab value="status">Estado</Tab>
          <Tab value="configuration">Configuración</Tab>
          <Tab value="services">Servicios</Tab>
          <Tab value="certificates">Certificados</Tab>
        </TabList>

        <TabPanels>
          {/* Status Tab */}
          <TabPanel value="status">
            <VStack gap="md">
              <CardWrapper variant="outline" padding="md">
                <CardWrapper.Body>
                  <VStack gap="md">
                    <HStack justify="space-between" align="center">
                      <Typography variant="title">Estado de Conexión</Typography>
                      <HStack gap="sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTestConnection}
                          loading={isConnecting}
                        >
                          <Icon icon={CloudIcon} size="sm" />
                          Probar Conexión
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRenewToken}
                          loading={isRenewingToken}
                        >
                          <Icon icon={KeyIcon} size="sm" />
                          Renovar Token
                        </Button>
                      </HStack>
                    </HStack>

                    {afipStatus && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
                        <VStack align="start" gap="sm">
                          <Typography variant="body" fontWeight="medium">Información de Conexión</Typography>
                          <VStack align="start" gap="xs" color="text.muted">
                            <Typography variant="caption">
                              Estado: {afipStatus.authenticated ? 'Autenticado' : 'No autenticado'}
                            </Typography>
                            <Typography variant="caption">
                              Ambiente: {afipStatus.environment}
                            </Typography>
                            <Typography variant="caption">
                              Última conexión: {new Date(afipStatus.lastConnection).toLocaleString()}
                            </Typography>
                          </VStack>
                        </VStack>

                        <VStack align="start" gap="sm">
                          <Typography variant="body" fontWeight="medium">Certificado</Typography>
                          <VStack align="start" gap="xs" color="text.muted">
                            <Typography variant="caption">
                              Estado: {afipStatus.certificateValid ? 'Válido' : 'Requiere renovación'}
                            </Typography>
                            <Typography variant="caption">
                              Vencimiento: {new Date(afipStatus.certificateExpiry).toLocaleDateString()}
                            </Typography>
                          </VStack>
                        </VStack>
                      </SimpleGrid>
                    )}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </TabPanel>

          {/* Configuration Tab */}
          <TabPanel value="configuration">
            <VStack gap="md">
              <CardWrapper variant="outline" padding="md">
                <CardWrapper.Body>
                  <VStack gap="md">
                    <Typography variant="title">Configuración AFIP</Typography>
                    
                    {afipConfig && (
                      <VStack gap="md" align="stretch">
                        <InputField
                          label="CUIT"
                          value={afipConfig.cuit}
                          readOnly
                        />
                        
                        <InputField
                          label="Punto de Venta"
                          value={afipConfig.puntoVenta.toString()}
                          readOnly
                        />
                        
                        <InputField
                          label="Ambiente"
                          value={afipConfig.environment === 'production' ? 'Producción' : 'Testing'}
                          readOnly
                        />
                        
                        <InputField
                          label="Ruta del Certificado"
                          value={afipConfig.certificatePath}
                          readOnly
                        />
                        
                        <InputField
                          label="Ruta de Clave Privada"
                          value={afipConfig.privateKeyPath}
                          readOnly
                        />
                        
                        <Typography variant="caption" color="text.muted">
                          Última actualización: {new Date(afipConfig.lastUpdate).toLocaleString()}
                        </Typography>
                      </VStack>
                    )}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </TabPanel>

          {/* Services Tab */}
          <TabPanel value="services">
            <VStack gap="md">
              <CardWrapper variant="outline" padding="md">
                <CardWrapper.Body>
                  <VStack gap="md">
                    <Typography variant="title">Servicios AFIP</Typography>
                    
                    <Table.Root>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Versión</TableHead>
                          <TableHead>Última Verificación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {afipServices.map((service, index) => {
                          const statusBadge = getServiceStatusBadge(service.status);
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body" fontWeight="medium">
                                  {service.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Badge colorPalette={statusBadge.colorPalette}>
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.muted">
                                  {service.endpoint}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {service.version}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.muted">
                                  {new Date(service.lastCheck).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table.Root>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </TabPanel>

          {/* Certificates Tab */}
          <TabPanel value="certificates">
            <VStack gap="md">
              <CardWrapper variant="outline" padding="md">
                <CardWrapper.Body>
                  <VStack gap="md">
                    <Typography variant="title">Gestión de Certificados</Typography>
                    
                    <Alert status="info" title="Información">
                      <AlertDescription>
                        Los certificados AFIP deben renovarse periódicamente. 
                        Asegúrate de mantener los archivos de certificado y clave privada actualizados.
                      </AlertDescription>
                    </Alert>

                    {afipStatus && (
                      <VStack gap="md" align="stretch">
                        <HStack justify="space-between" align="center">
                          <Typography variant="body" fontWeight="medium">Estado del Certificado</Typography>
                          <Badge 
                            colorPalette={afipStatus.certificateValid ? 'success' : 'warning'}
                          >
                            {afipStatus.certificateValid ? 'Válido' : 'Requiere Renovación'}
                          </Badge>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
                          <VStack align="start" gap="xs">
                            <Typography variant="caption" color="text.muted">Fecha de Vencimiento</Typography>
                            <Typography variant="body">
                              {new Date(afipStatus.certificateExpiry).toLocaleDateString()}
                            </Typography>
                          </VStack>
                          
                          <VStack align="start" gap="xs">
                            <Typography variant="caption" color="text.muted">Días Restantes</Typography>
                            <Typography variant="body">
                              {DecimalUtils.divide(
                                DecimalUtils.subtract(
                                  new Date(afipStatus.certificateExpiry).getTime().toString(),
                                  Date.now().toString(),
                                  'financial'
                                ).toString(),
                                DecimalUtils.multiply(
                                  DecimalUtils.multiply(
                                    DecimalUtils.multiply('1000', '60', 'financial').toString(),
                                    '60',
                                    'financial'
                                  ).toString(),
                                  '24',
                                  'financial'
                                ).toString(),
                                'financial'
                              ).ceil().toNumber()} días
                            </Typography>
                          </VStack>
                        </SimpleGrid>

                        <HStack gap="sm">
                          <Button variant="outline" size="sm">
                            <Icon icon={DocumentTextIcon} size="sm" />
                            Descargar Certificado
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon icon={KeyIcon} size="sm" />
                            Generar Nueva Clave
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default AFIPIntegration;
