// Alerting System - Smart Notifications and Supply Chain Alerts
// Real-time monitoring with intelligent alerting capabilities

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  Switch,
  Textarea,
  NumberInput,
  Input
} from '@chakra-ui/react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  CubeIcon,
  TruckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FireIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SupplyChainAlert {
  id: string;
  type: 'stockout' | 'low_stock' | 'overstock' | 'quality' | 'supplier' | 'cost' | 'delivery' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  materialId?: string;
  materialName?: string;
  supplierId?: string;
  supplierName?: string;
  
  // Alert metadata
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  assignedTo?: string;
  escalationLevel: number;
  
  // Threshold data
  currentValue?: number;
  thresholdValue?: number;
  unit?: string;
  
  // Action suggestions
  suggestedActions: AlertAction[];
  automatedActions: AutomatedAction[];
  
  // Business impact
  estimatedImpact: BusinessImpact;
  affectedOperations: string[];
  
  // Resolution tracking
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: string;
  lastOccurrence?: string;
  occurrenceCount: number;
}

export interface AlertAction {
  id: string;
  type: 'reorder' | 'contact_supplier' | 'adjust_threshold' | 'inspect_quality' | 'update_forecast' | 'escalate';
  title: string;
  description: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'next_week';
  estimatedTime: number; // minutes
  responsible: string;
  canAutomate: boolean;
}

export interface AutomatedAction {
  id: string;
  type: 'auto_reorder' | 'notify_supplier' | 'adjust_forecast' | 'block_usage' | 'escalate_alert';
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  scheduledFor: string;
  executedAt?: string;
  result?: string;
}

export interface BusinessImpact {
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  potentialLoss: number;
  timeToImpact: number; // hours
  affectedRevenue: number;
  operationalDisruption: string;
  customerImpact: string;
}

export interface AlertConfiguration {
  // Stock thresholds
  stockThresholds: {
    critical: number; // percentage
    low: number; // percentage
    overstock: number; // percentage
  };
  
  // Supplier performance
  supplierThresholds: {
    deliveryDelay: number; // days
    qualityScore: number; // percentage
    responseTime: number; // hours
  };
  
  // Cost monitoring
  costThresholds: {
    priceIncrease: number; // percentage
    budgetVariance: number; // percentage
    costPerUnit: number; // percentage change
  };
  
  // Notification settings
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    slack: boolean;
  };
  
  // Escalation rules
  escalation: {
    levels: EscalationLevel[];
    autoEscalate: boolean;
    escalationInterval: number; // minutes
  };
  
  // Business hours
  businessHours: {
    start: string;
    end: string;
    timezone: string;
    workdays: number[];
  };
}

export interface EscalationLevel {
  level: number;
  title: string;
  recipients: string[];
  triggerAfter: number; // minutes
  actions: string[];
}

export interface AlertStats {
  totalActive: number;
  criticalCount: number;
  highCount: number;
  resolvedToday: number;
  averageResolutionTime: number;
  escalatedCount: number;
  automatedResolutions: number;
  topAlertTypes: AlertTypeCount[];
}

export interface AlertTypeCount {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockAlerts = (): SupplyChainAlert[] => {
  const alertTypes = ['stockout', 'low_stock', 'overstock', 'quality', 'supplier', 'cost', 'delivery', 'system'] as const;
  const materials = ['Carne de Res', 'Pollo', 'Papas', 'Tomates', 'Leche', 'Queso', 'Pan', 'Aceite'];
  const suppliers = ['Proveedor A', 'Proveedor B', 'Proveedor C', 'Proveedor D'];
  
  return Array.from({ length: 25 }, (_, index) => {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
    const material = materials[Math.floor(Math.random() * materials.length)];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const isActive = Math.random() > 0.3;
    
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    // Generate alert content based on type
    let title = '';
    let description = '';
    let currentValue = 0;
    let thresholdValue = 0;
    let unit = 'unidades';
    
    switch (type) {
      case 'stockout':
        title = `Stock agotado: ${material}`;
        description = `El material ${material} está completamente agotado. Producción en riesgo.`;
        currentValue = 0;
        thresholdValue = 10;
        break;
      case 'low_stock':
        title = `Stock bajo: ${material}`;
        description = `El stock de ${material} está por debajo del mínimo establecido.`;
        currentValue = Math.random() * 15 + 2;
        thresholdValue = 20;
        break;
      case 'overstock':
        title = `Sobrestock: ${material}`;
        description = `Exceso de inventario detectado para ${material}. Evaluar reducción.`;
        currentValue = Math.random() * 200 + 150;
        thresholdValue = 100;
        break;
      case 'quality':
        title = `Problema de calidad: ${material}`;
        description = `Lote de ${material} reportado con problemas de calidad por ${supplier}.`;
        currentValue = Math.random() * 60 + 30;
        thresholdValue = 90;
        unit = '% calidad';
        break;
      case 'supplier':
        title = `Problema con proveedor: ${supplier}`;
        description = `${supplier} tiene retrasos en entregas o problemas de comunicación.`;
        currentValue = Math.random() * 5 + 2;
        thresholdValue = 1;
        unit = 'días retraso';
        break;
      case 'cost':
        title = `Aumento de costo: ${material}`;
        description = `El costo de ${material} ha aumentado significativamente.`;
        currentValue = Math.random() * 30 + 10;
        thresholdValue = 15;
        unit = '% aumento';
        break;
      case 'delivery':
        title = `Retraso en entrega: ${material}`;
        description = `Entrega de ${material} retrasada por ${supplier}.`;
        currentValue = Math.random() * 7 + 1;
        thresholdValue = 2;
        unit = 'días retraso';
        break;
      case 'system':
        title = `Alerta del sistema`;
        description = `Problema técnico detectado en el sistema de gestión de inventario.`;
        break;
    }
    
    return {
      id: `alert-${index + 1}`,
      type,
      severity,
      title,
      description,
      materialId: type !== 'system' ? `mat-${Math.floor(Math.random() * 10) + 1}` : undefined,
      materialName: type !== 'system' ? material : undefined,
      supplierId: ['supplier', 'delivery', 'quality'].includes(type) ? `sup-${Math.floor(Math.random() * 4) + 1}` : undefined,
      supplierName: ['supplier', 'delivery', 'quality'].includes(type) ? supplier : undefined,
      
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      status: isActive ? 'active' : Math.random() > 0.5 ? 'resolved' : 'acknowledged',
      escalationLevel: Math.floor(Math.random() * 3),
      
      currentValue,
      thresholdValue,
      unit,
      
      suggestedActions: generateMockActions(type),
      automatedActions: Math.random() > 0.7 ? generateMockAutomatedActions(type) : [],
      
      estimatedImpact: {
        severity: severity as any,
        potentialLoss: Math.random() * 5000 + 500,
        timeToImpact: Math.random() * 48 + 2,
        affectedRevenue: Math.random() * 10000 + 1000,
        operationalDisruption: type === 'stockout' ? 'Alto - Producción paralizada' : 'Medio - Impacto operacional',
        customerImpact: type === 'stockout' ? 'Alto - Productos no disponibles' : 'Bajo - Sin impacto directo'
      },
      affectedOperations: ['Cocina', 'Almacén', 'Compras'].filter(() => Math.random() > 0.5),
      
      acknowledgedAt: !isActive && Math.random() > 0.5 ? new Date(createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() : undefined,
      acknowledgedBy: !isActive && Math.random() > 0.5 ? 'Usuario Demo' : undefined,
      resolvedAt: !isActive && Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
      resolvedBy: !isActive && Math.random() > 0.3 ? 'Usuario Demo' : undefined,
      resolutionNotes: !isActive && Math.random() > 0.3 ? 'Resuelto según protocolo estándar' : undefined,
      
      isRecurring: Math.random() > 0.8,
      recurrencePattern: Math.random() > 0.8 ? 'Semanal' : undefined,
      occurrenceCount: Math.floor(Math.random() * 5) + 1
    };
  });
};

const generateMockActions = (type: string): AlertAction[] => {
  const baseActions = [
    {
      id: 'action-1',
      type: 'reorder' as const,
      title: 'Realizar pedido urgente',
      description: 'Contactar proveedor para pedido de emergencia',
      urgency: 'immediate' as const,
      estimatedTime: 30,
      responsible: 'Compras',
      canAutomate: true
    },
    {
      id: 'action-2',
      type: 'contact_supplier' as const,
      title: 'Contactar proveedor',
      description: 'Comunicarse con el proveedor para resolver el problema',
      urgency: 'today' as const,
      estimatedTime: 15,
      responsible: 'Compras',
      canAutomate: false
    }
  ];
  
  return baseActions.slice(0, Math.floor(Math.random() * 2) + 1);
};

const generateMockAutomatedActions = (type: string): AutomatedAction[] => {
  return [{
    id: 'auto-1',
    type: 'auto_reorder' as const,
    title: 'Pedido automático generado',
    description: 'Sistema generó pedido automático basado en reglas configuradas',
    status: Math.random() > 0.5 ? 'completed' : 'executing',
    scheduledFor: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    executedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
    result: Math.random() > 0.5 ? 'Pedido creado exitosamente' : undefined
  }];
};

// ============================================================================
// ALERTING SYSTEM COMPONENT
// ============================================================================

const alertStatusOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las alertas' },
    { value: 'active', label: 'Activas' },
    { value: 'acknowledged', label: 'Reconocidas' },
    { value: 'resolved', label: 'Resueltas' }
  ]
});

const alertSeverityOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las severidades' },
    { value: 'critical', label: 'Críticas' },
    { value: 'high', label: 'Altas' },
    { value: 'medium', label: 'Medias' },
    { value: 'low', label: 'Bajas' }
  ]
});

export function AlertingSystem() {
  // State management
  const [alerts, setAlerts] = useState<SupplyChainAlert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'dashboard' | 'configuration' | 'history'>('alerts');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Configuration
  const [config, setConfig] = useState<AlertConfiguration>({
    stockThresholds: {
      critical: 5,
      low: 20,
      overstock: 150
    },
    supplierThresholds: {
      deliveryDelay: 2,
      qualityScore: 85,
      responseTime: 24
    },
    costThresholds: {
      priceIncrease: 15,
      budgetVariance: 10,
      costPerUnit: 20
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      slack: true
    },
    escalation: {
      levels: [
        {
          level: 1,
          title: 'Supervisor',
          recipients: ['supervisor@example.com'],
          triggerAfter: 30,
          actions: ['notify']
        },
        {
          level: 2,
          title: 'Gerente',
          recipients: ['manager@example.com'],
          triggerAfter: 60,
          actions: ['notify', 'escalate']
        }
      ],
      autoEscalate: true,
      escalationInterval: 30
    },
    businessHours: {
      start: '08:00',
      end: '18:00',
      timezone: 'America/Argentina/Buenos_Aires',
      workdays: [1, 2, 3, 4, 5]
    }
  });

  // Load alerts data
  useEffect(() => {
    loadAlertsData();
  }, []);

  const loadAlertsData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAlerts = generateMockAlerts();
      setAlerts(mockAlerts);
      
      // Calculate stats
      const stats = calculateAlertStats(mockAlerts);
      setAlertStats(stats);
      
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAlertStats = (alertsData: SupplyChainAlert[]): AlertStats => {
    const activeAlerts = alertsData.filter(a => a.status === 'active');
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const highCount = activeAlerts.filter(a => a.severity === 'high').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedToday = alertsData.filter(a => 
      a.status === 'resolved' && 
      new Date(a.resolvedAt!) >= today
    ).length;
    
    // Calculate average resolution time
    const resolvedAlerts = alertsData.filter(a => a.resolvedAt && a.createdAt);
    const avgResolutionTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.createdAt).getTime();
          const resolved = new Date(alert.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedAlerts.length / (1000 * 60 * 60) // Convert to hours
      : 0;
    
    const escalatedCount = activeAlerts.filter(a => a.escalationLevel > 0).length;
    const automatedResolutions = alertsData.filter(a => 
      a.automatedActions.some(action => action.status === 'completed')
    ).length;
    
    // Top alert types
    const typeCounts = alertsData.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAlertTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({
        type,
        count,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      })) as AlertTypeCount[];
    
    return {
      totalActive: activeAlerts.length,
      criticalCount,
      highCount,
      resolvedToday,
      averageResolutionTime: avgResolutionTime,
      escalatedCount,
      automatedResolutions,
      topAlertTypes
    };
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesSearch = searchTerm === '' || 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [alerts, statusFilter, severityFilter, searchTerm]);

  // Alert actions
  const handleAcknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: 'Usuario Actual'
          }
        : alert
    ));
    
    // Emit event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      { type: 'alert_acknowledged', alertId },
      'AlertingSystem'
    );
  };

  const handleResolveAlert = async (alertId: string, notes?: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Usuario Actual',
            resolutionNotes: notes || 'Resuelto manualmente'
          }
        : alert
    ));
    
    // Recalculate stats
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    );
    setAlertStats(calculateAlertStats(updatedAlerts));
    
    // Emit event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      { type: 'alert_resolved', alertId, notes },
      'AlertingSystem'
    );
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'dismissed' }
        : alert
    ));
    
    // Emit event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      { type: 'alert_dismissed', alertId },
      'AlertingSystem'
    );
  };

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="blue" />
          <Text>Cargando sistema de alertas...</Text>
          <Text fontSize="sm" color="gray.600">Analizando alertas de la cadena de suministro</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <BellIcon className="w-6 h-6 text-blue-600" />
                  <Text fontSize="xl" fontWeight="bold">Sistema de Alertas</Text>
                  <Badge colorPalette="blue" size="sm">Smart Monitoring</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Monitoreo inteligente en tiempo real con alertas automáticas y escalamiento
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  colorPalette="blue"
                  onClick={loadAlertsData}
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Actualizar
                </Button>
              </HStack>
            </HStack>

            {/* Alert Summary Cards */}
            {alertStats && (
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {alertStats.criticalCount}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Críticas</Text>
                      <Text fontSize="xs" color="red.600">requieren atención</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="orange.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {alertStats.highCount}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Alta Prioridad</Text>
                      <Text fontSize="xs" color="orange.600">monitorear</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {alertStats.resolvedToday}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Resueltas Hoy</Text>
                      <Text fontSize="xs" color="green.600">completadas</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {alertStats.averageResolutionTime.toFixed(1)}h
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tiempo Prom.</Text>
                      <Text fontSize="xs" color="blue.600">resolución</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="alerts">
            <HStack gap={2}>
              <BellIcon className="w-4 h-4" />
              <Text>Alertas Activas</Text>
              {alertStats && alertStats.totalActive > 0 && (
                <Badge colorPalette="red" size="sm">{alertStats.totalActive}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="dashboard">
            <HStack gap={2}>
              <ChartBarIcon className="w-4 h-4" />
              <Text>Dashboard</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="configuration">
            <HStack gap={2}>
              <Cog6ToothIcon className="w-4 h-4" />
              <Text>Configuración</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="history">
            <HStack gap={2}>
              <ClockIcon className="w-4 h-4" />
              <Text>Historial</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Alerts Tab */}
          <Tabs.Content value="alerts">
            <VStack gap="4" align="stretch">
              {/* Filters */}
              <HStack gap="4" flexWrap="wrap">
                <Box flex="1" minW="250px">
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Box>
                
                <Select.Root
                  collection={alertStatusOptions}
                  value={[statusFilter]}
                  onValueChange={(details) => setStatusFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {alertStatusOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                
                <Select.Root
                  collection={alertSeverityOptions}
                  value={[severityFilter]}
                  onValueChange={(details) => setSeverityFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {alertSeverityOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>
              
              <AlertsTable 
                alerts={filteredAlerts}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onDismiss={handleDismissAlert}
              />
            </VStack>
          </Tabs.Content>

          {/* Dashboard Tab */}
          <Tabs.Content value="dashboard">
            <AlertsDashboard stats={alertStats} alerts={alerts} />
          </Tabs.Content>

          {/* Configuration Tab */}
          <Tabs.Content value="configuration">
            <AlertConfiguration config={config} onConfigChange={setConfig} />
          </Tabs.Content>

          {/* History Tab */}
          <Tabs.Content value="history">
            <AlertsHistory alerts={alerts.filter(a => a.status === 'resolved')} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface AlertsTableProps {
  alerts: SupplyChainAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string, notes?: string) => void;
  onDismiss: (id: string) => void;
}

function AlertsTable({ alerts, onAcknowledge, onResolve, onDismiss }: AlertsTableProps) {
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
      default: return InformationCircleIcon;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stockout':
      case 'low_stock':
      case 'overstock':
        return CubeIcon;
      case 'delivery':
        return TruckIcon;
      case 'supplier':
        return TruckIcon;
      default:
        return BellIcon;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <Text color="green.600" fontWeight="medium">¡Todo en orden!</Text>
            <Text color="gray.500">No hay alertas que coincidan con los filtros aplicados.</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">
          Alertas del Sistema - {alerts.length} encontradas
        </Text>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Severidad</Table.ColumnHeader>
              <Table.ColumnHeader>Alerta</Table.ColumnHeader>
              <Table.ColumnHeader>Valor</Table.ColumnHeader>
              <Table.ColumnHeader>Impacto</Table.ColumnHeader>
              <Table.ColumnHeader>Creada</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {alerts.slice(0, 20).map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity);
              const TypeIcon = getTypeIcon(alert.type);
              
              return (
                <Table.Row key={alert.id}>
                  <Table.Cell>
                    <HStack gap="2">
                      <SeverityIcon className={`w-4 h-4 text-${getSeverityColor(alert.severity)}-500`} />
                      <Badge colorPalette={getSeverityColor(alert.severity)} size="sm">
                        {alert.severity === 'critical' ? 'Crítica' :
                         alert.severity === 'high' ? 'Alta' :
                         alert.severity === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </HStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <HStack gap="2">
                        <TypeIcon className="w-4 h-4 text-gray-400" />
                        <Text fontWeight="medium" fontSize="sm">{alert.title}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {alert.description}
                      </Text>
                      {alert.materialName && (
                        <Badge colorPalette="blue" variant="subtle" size="xs">
                          {alert.materialName}
                        </Badge>
                      )}
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    {alert.currentValue !== undefined && (
                      <VStack align="start" gap="1">
                        <Text fontSize="sm" fontWeight="medium">
                          {alert.currentValue.toFixed(1)} {alert.unit}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Límite: {alert.thresholdValue} {alert.unit}
                        </Text>
                      </VStack>
                    )}
                  </Table.Cell>
                  
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Text fontSize="sm" color="red.600">
                        ${alert.estimatedImpact.potentialLoss.toFixed(0)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {alert.estimatedImpact.timeToImpact.toFixed(0)}h
                      </Text>
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontSize="xs">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <HStack gap="1">
                      {alert.status === 'active' && (
                        <>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="blue"
                            onClick={() => onAcknowledge(alert.id)}
                            aria-label="Reconocer alerta"
                          >
                            <CheckCircleIcon className="w-3 h-3" />
                          </IconButton>
                          
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="green"
                            onClick={() => onResolve(alert.id)}
                            aria-label="Resolver alerta"
                          >
                            <CheckCircleIcon className="w-3 h-3" />
                          </IconButton>
                          
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => onDismiss(alert.id)}
                            aria-label="Descartar alerta"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </IconButton>
                        </>
                      )}
                      
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Ver detalles"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        
        {alerts.length > 20 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 20 de {alerts.length} alertas. Use filtros para refinar la búsqueda.
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

interface AlertsDashboardProps {
  stats: AlertStats | null;
  alerts: SupplyChainAlert[];
}

function AlertsDashboard({ stats, alerts }: AlertsDashboardProps) {
  if (!stats) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ChartBarIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay datos estadísticos disponibles</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {stats.totalActive}
              </Text>
              <Text fontSize="sm" color="gray.600">Alertas Activas</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {stats.escalatedCount}
              </Text>
              <Text fontSize="sm" color="gray.600">Escaladas</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {stats.automatedResolutions}
              </Text>
              <Text fontSize="sm" color="gray.600">Resoluciones Auto.</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {stats.averageResolutionTime.toFixed(1)}h
              </Text>
              <Text fontSize="sm" color="gray.600">Tiempo Promedio</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Top Alert Types */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Tipos de Alertas Más Frecuentes</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="3" align="stretch">
            {stats.topAlertTypes.map((alertType, index) => (
              <HStack key={alertType.type} justify="space-between">
                <HStack gap="2">
                  <Text fontSize="lg">{index + 1}.</Text>
                  <Text fontWeight="medium">{alertType.type.replace('_', ' ')}</Text>
                  <Badge colorPalette={alertType.trend === 'up' ? 'red' : alertType.trend === 'down' ? 'green' : 'gray'} size="sm">
                    {alertType.trend === 'up' ? '↗️' : alertType.trend === 'down' ? '↘️' : '→'}
                  </Badge>
                </HStack>
                <Text color="blue.600" fontWeight="bold">
                  {alertType.count} alertas
                </Text>
              </HStack>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface AlertConfigurationProps {
  config: AlertConfiguration;
  onConfigChange: (config: AlertConfiguration) => void;
}

function AlertConfiguration({ config, onConfigChange }: AlertConfigurationProps) {
  return (
    <VStack gap="6" align="stretch">
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Umbrales de Stock</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Crítico (%)</Text>
              <NumberInput.Root
                value={config.stockThresholds.critical.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  stockThresholds: {
                    ...config.stockThresholds,
                    critical: Number(details.value)
                  }
                })}
                min={1}
                max={50}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Bajo (%)</Text>
              <NumberInput.Root
                value={config.stockThresholds.low.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  stockThresholds: {
                    ...config.stockThresholds,
                    low: Number(details.value)
                  }
                })}
                min={10}
                max={100}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Sobrestock (%)</Text>
              <NumberInput.Root
                value={config.stockThresholds.overstock.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  stockThresholds: {
                    ...config.stockThresholds,
                    overstock: Number(details.value)
                  }
                })}
                min={100}
                max={500}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Configuración de Notificaciones</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">Email</Text>
                <Switch.Root
                  checked={config.notifications.email}
                  onCheckedChange={(details) => onConfigChange({
                    ...config,
                    notifications: { ...config.notifications, email: details.checked }
                  })}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">SMS</Text>
                <Switch.Root
                  checked={config.notifications.sms}
                  onCheckedChange={(details) => onConfigChange({
                    ...config,
                    notifications: { ...config.notifications, sms: details.checked }
                  })}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
            </VStack>
            
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">Push</Text>
                <Switch.Root
                  checked={config.notifications.push}
                  onCheckedChange={(details) => onConfigChange({
                    ...config,
                    notifications: { ...config.notifications, push: details.checked }
                  })}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">Slack</Text>
                <Switch.Root
                  checked={config.notifications.slack}
                  onCheckedChange={(details) => onConfigChange({
                    ...config,
                    notifications: { ...config.notifications, slack: details.checked }
                  })}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface AlertsHistoryProps {
  alerts: SupplyChainAlert[];
}

function AlertsHistory({ alerts }: AlertsHistoryProps) {
  if (alerts.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ClockIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay alertas resueltas en el historial</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">Historial de Alertas Resueltas - {alerts.length}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap="3" align="stretch">
          {alerts.slice(0, 15).map((alert) => (
            <Card.Root key={alert.id} variant="outline" size="sm">
              <Card.Body p="3">
                <HStack justify="space-between">
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">{alert.title}</Text>
                    <Text fontSize="xs" color="gray.600">{alert.description}</Text>
                    {alert.resolutionNotes && (
                      <Text fontSize="xs" color="green.600">
                        Resolución: {alert.resolutionNotes}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" gap="1">
                    <Text fontSize="xs" color="gray.500">
                      {new Date(alert.resolvedAt!).toLocaleDateString()}
                    </Text>
                    <Badge colorPalette="green" size="xs">Resuelto</Badge>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export default AlertingSystem;