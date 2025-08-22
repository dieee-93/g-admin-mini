/**
 * Alerting System - Real Data Version
 * Connected to actual stock alerts and materials data
 */

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Alert,
  Switch,
  IconButton,
  Spinner,
  Input,
  Select,
  createListCollection
} from '@chakra-ui/react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  CubeIcon,
  FireIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Services
import { SupplyChainDataService } from '../services/supplyChainDataService';
import type { StockAlert } from '../services/supplyChainDataService';

// Materials store for additional data
import { useMaterials } from '@/store/materialsStore';

interface AlertSettings {
  enableNotifications: boolean;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  autoReorderEnabled: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

interface ProcessedAlert extends StockAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'stock' | 'system' | 'supplier';
  isNew: boolean;
  requiresAction: boolean;
}

export function AlertingSystemReal() {
  const [isLoading, setIsLoading] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<ProcessedAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ProcessedAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enableNotifications: true,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoReorderEnabled: false,
    emailAlerts: true,
    smsAlerts: false
  });
  const [error, setError] = useState<string | null>(null);

  const { stats } = useMaterials();

  // Load alerts on component mount
  useEffect(() => {
    loadStockAlerts();
  }, [alertSettings.lowStockThreshold]);

  // Filter alerts when filter changes
  useEffect(() => {
    filterAlerts();
  }, [stockAlerts, activeFilter]);

  const loadStockAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const alerts = await SupplyChainDataService.getStockAlerts(alertSettings.lowStockThreshold);
      
      // Process alerts to add additional metadata
      const processedAlerts: ProcessedAlert[] = alerts.map(alert => {
        const severity = getSeverityLevel(alert);
        const isNew = Math.random() > 0.7; // Mock "new" status for now
        
        return {
          ...alert,
          severity,
          category: 'stock' as const,
          isNew,
          requiresAction: severity === 'critical' || severity === 'high'
        };
      });

      setStockAlerts(processedAlerts);

    } catch (error) {
      console.error('Error loading stock alerts:', error);
      setError('Error al cargar las alertas de stock');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityLevel = (alert: StockAlert): 'low' | 'medium' | 'high' | 'critical' => {
    switch (alert.urgency_level?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return FireIcon;
      case 'high': return ExclamationTriangleIcon;
      case 'medium': return ShieldExclamationIcon;
      case 'low': return InformationCircleIcon;
      default: return BellIcon;
    }
  };

  const filterAlerts = () => {
    if (activeFilter === 'all') {
      setFilteredAlerts(stockAlerts);
    } else {
      setFilteredAlerts(stockAlerts.filter(alert => alert.severity === activeFilter));
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setStockAlerts(prev => prev.filter(alert => alert.item_id !== alertId));
  };

  const handleMarkAsRead = (alertId: string) => {
    setStockAlerts(prev => prev.map(alert => 
      alert.item_id === alertId 
        ? { ...alert, isNew: false }
        : alert
    ));
  };

  const updateAlertSettings = (newSettings: Partial<AlertSettings>) => {
    setAlertSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getAlertCounts = () => {
    return {
      total: stockAlerts.length,
      critical: stockAlerts.filter(a => a.severity === 'critical').length,
      high: stockAlerts.filter(a => a.severity === 'high').length,
      medium: stockAlerts.filter(a => a.severity === 'medium').length,
      low: stockAlerts.filter(a => a.severity === 'low').length,
      requiresAction: stockAlerts.filter(a => a.requiresAction).length,
      isNew: stockAlerts.filter(a => a.isNew).length
    };
  };

  const alertCounts = getAlertCounts();

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      
      {/* Header with Summary */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <VStack align="flex-start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold">Sistema de Alertas</Text>
              <Text fontSize="sm" color="gray.600">Monitoreo en tiempo real del inventario</Text>
            </VStack>
            <Button onClick={loadStockAlerts} isLoading={isLoading} size="sm">
              <ArrowPathIcon className="w-4 h-4" />
              Actualizar
            </Button>
          </HStack>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">{alertCounts.critical}</Text>
              <Text fontSize="sm" color="gray.600">Críticas</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">{alertCounts.high}</Text>
              <Text fontSize="sm" color="gray.600">Altas</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">{alertCounts.requiresAction}</Text>
              <Text fontSize="sm" color="gray.600">Requieren Acción</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">{alertCounts.isNew}</Text>
              <Text fontSize="sm" color="gray.600">Nuevas</Text>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Filter Controls */}
      <Card.Root>
        <Card.Body>
          <HStack gap={4}>
            <Text fontSize="sm" color="gray.600">Filtrar por severidad:</Text>
            <HStack gap={2}>
              {[
                { value: 'all', label: 'Todas', count: alertCounts.total },
                { value: 'critical', label: 'Críticas', count: alertCounts.critical },
                { value: 'high', label: 'Altas', count: alertCounts.high },
                { value: 'medium', label: 'Medias', count: alertCounts.medium },
                { value: 'low', label: 'Bajas', count: alertCounts.low }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={activeFilter === filter.value ? 'solid' : 'outline'}
                  onClick={() => setActiveFilter(filter.value as any)}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Alerts List */}
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Alertas Activas ({filteredAlerts.length})
          </Text>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={4} color="gray.600">Cargando alertas...</Text>
            </Box>
          ) : filteredAlerts.length > 0 ? (
            <VStack gap={3} align="stretch">
              {filteredAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <Box
                    key={alert.item_id}
                    p={4}
                    borderRadius="lg"
                    bg={alert.severity === 'critical' ? 'red.50' : 'white'}
                    borderWidth={1}
                    borderColor={alert.severity === 'critical' ? 'red.200' : 'gray.200'}
                    position="relative"
                  >
                    {alert.isNew && (
                      <Badge 
                        position="absolute" 
                        top={2} 
                        right={2} 
                        colorPalette="blue" 
                        size="sm"
                      >
                        NUEVO
                      </Badge>
                    )}
                    
                    <HStack gap={4} align="flex-start">
                      <Box>
                        <SeverityIcon className={`w-6 h-6 text-${getSeverityColor(alert.severity)}-500`} />
                      </Box>
                      
                      <VStack align="stretch" flex={1} gap={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" fontSize="md">
                            Stock Bajo: {alert.item_name}
                          </Text>
                          <Badge colorPalette={getSeverityColor(alert.severity)}>
                            {alert.urgency_level}
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.600">
                          Stock actual: {alert.current_stock} {alert.unit} 
                          (Mínimo: {alert.threshold_used} {alert.unit})
                        </Text>
                        
                        <HStack gap={4} fontSize="sm">
                          <Text>
                            <strong>Sugerido:</strong> {alert.suggested_order_quantity} {alert.unit}
                          </Text>
                          <Text>
                            <strong>Costo est.:</strong> ${alert.estimated_cost.toFixed(2)}
                          </Text>
                        </HStack>
                        
                        <Text fontSize="xs" color="gray.500">
                          Última entrada: {new Date(alert.last_stock_entry_date).toLocaleDateString()} 
                          ({alert.days_since_last_entry} días)
                        </Text>
                        
                        <HStack gap={2} mt={2}>
                          <Button size="xs" onClick={() => handleMarkAsRead(alert.item_id)}>
                            <CheckCircleIcon className="w-3 h-3" />
                            Marcar como leída
                          </Button>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            onClick={() => handleDismissAlert(alert.item_id)}
                          >
                            <XMarkIcon className="w-3 h-3" />
                            Descartar
                          </Button>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text color="gray.500" textAlign="center" py={8}>
              No hay alertas {activeFilter !== 'all' ? `de severidad ${activeFilter}` : 'activas'}
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      {/* Alert Settings */}
      <Card.Root>
        <Card.Header>
          <HStack>
            <Cog6ToothIcon className="w-5 h-5" />
            <Text fontSize="lg" fontWeight="semibold">Configuración de Alertas</Text>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm">Notificaciones habilitadas</Text>
              <Switch
                checked={alertSettings.enableNotifications}
                onCheckedChange={(e) => updateAlertSettings({ enableNotifications: e.checked })}
              />
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Umbral de stock bajo</Text>
              <Input
                type="number"
                value={alertSettings.lowStockThreshold}
                onChange={(e) => updateAlertSettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
                width="100px"
                size="sm"
              />
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Alertas por email</Text>
              <Switch
                checked={alertSettings.emailAlerts}
                onCheckedChange={(e) => updateAlertSettings({ emailAlerts: e.checked })}
              />
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
      
    </VStack>
  );
}

export default AlertingSystemReal;