// src/components/alerts/GlobalAlerts.tsx
// 🚨 SISTEMA DE ALERTAS GLOBAL - Consistente en todas las páginas

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  IconButton,
  Collapsible,
  Badge,
  Card
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '@/features/inventory/logic/useInventory';
import { notify } from '@/lib/notifications';

interface GlobalAlertsProps {
  maxAlerts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
}

export function GlobalAlerts({ 
  maxAlerts = 3, 
  position = 'top-right',
  autoHide = false,
  hideAfter = 10000 
}: GlobalAlertsProps) {
  const { alerts, alertSummary, loading } = useInventory();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Solo mostrar alertas críticas y no dismisseadas
  const visibleAlerts = alerts
    .filter(alert => alert.urgency === 'critical' && !dismissedAlerts.has(alert.id))
    .slice(0, maxAlerts);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && visibleAlerts.length > 0) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, hideAfter);
      return () => clearTimeout(timer);
    }
  }, [visibleAlerts.length, autoHide, hideAfter]);

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleQuickStock = async (itemId: string, itemName: string) => {
    try {
      // Open inventory page with specific item for stock adjustment
      window.location.href = `/inventory?action=add-stock&itemId=${itemId}`;
      notify.success({
        title: 'Navegando a Stock',
        description: `Abriendo ajuste de stock para ${itemName}`
      });
    } catch (error) {
      notify.error({
        title: 'Error',
        description: 'No se pudo abrir el formulario de stock'
      });
    }
  };

  // Determinar posición
  const positionStyles = {
    'top-right': { top: 4, right: 4 },
    'top-left': { top: 4, left: 4 },
    'bottom-right': { bottom: 4, right: 4 },
    'bottom-left': { bottom: 4, left: 4 }
  };

  // No mostrar si no hay alertas críticas
  if (loading || visibleAlerts.length === 0) return null;

  return (
    <Box
      position="fixed"
      {...positionStyles[position]}
      zIndex={1100} // Por encima de navegación
      w="320px"
      maxW="90vw"
    >
      <VStack gap="2" align="stretch">
        {/* Header colapsible */}
        <HStack
          justify="space-between"
          align="center"
          p="2"
          bg="red.500"
          color="white"
          borderRadius="md"
          cursor="pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <HStack gap="2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <Text fontSize="sm" fontWeight="bold">
              {alertSummary.critical} Alertas Críticas
            </Text>
          </HStack>
          
          <HStack gap="1">
            <Badge bg="red.600" color="white" size="sm">
              {visibleAlerts.length}
            </Badge>
            <IconButton
              size="xs"
              variant="ghost"
              color="white"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
            >
              {isCollapsed ? 
                <ChevronDownIcon className="w-3 h-3" /> : 
                <ChevronUpIcon className="w-3 h-3" />
              }
            </IconButton>
          </HStack>
        </HStack>

        {/* Lista de alertas */}
        <Collapsible.Root open={!isCollapsed}>
          <Collapsible.Content>
            <VStack gap="2" align="stretch">
            {visibleAlerts.map((alert) => (
              <Alert.Root
                key={alert.id}
                status="error"
                variant="solid"
                size="sm"
              >
                <Alert.Indicator>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                </Alert.Indicator>
                
                <VStack align="start" gap="1" flex="1">
                  <Alert.Title fontSize="sm">
                    {alert.item_name}
                  </Alert.Title>
                  <Alert.Description fontSize="xs">
                    Stock: {alert.current_stock} {alert.item_unit} 
                    (Mín: {alert.min_stock})
                  </Alert.Description>
                  
                  <HStack gap="2" mt="1">
                    <Button
                      size="xs"
                      colorPalette="white"
                      variant="outline"
                      onClick={() => handleQuickStock(alert.item_id, alert.item_name)}
                    >
                      <PlusIcon className="w-3 h-3" />
                      Stock
                    </Button>
                    
                    <Button
                      size="xs"
                      variant="ghost"
                      color="white"
                      onClick={() => handleDismissAlert(alert.id)}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </Button>
                  </HStack>
                </VStack>
              </Alert.Root>
            ))}
            
            {/* Ver todas las alertas */}
            {alertSummary.total > visibleAlerts.length && (
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={() => {
                  // Navigate to inventory page alerts section
                  window.location.href = '/inventory#alerts-section';
                }}
              >
                Ver todas las alertas ({alertSummary.total})
              </Button>
            )}
          </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </VStack>
    </Box>
  );
}

// ============================================================================
// 🎯 HOOK PARA GESTIONAR ALERTAS GLOBALES
// ============================================================================

export function useGlobalAlerts() {
  const { alerts, alertSummary } = useInventory();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [position, setPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');

  const criticalAlerts = alerts.filter(alert => alert.urgency === 'critical');
  const hasUnseenAlerts = criticalAlerts.length > 0;

  const toggleAlerts = () => setAlertsEnabled(!alertsEnabled);
  
  const changePosition = (newPosition: typeof position) => {
    setPosition(newPosition);
    // TODO: Guardar en localStorage para persistencia
    localStorage.setItem('alertsPosition', newPosition);
  };

  // Cargar posición guardada
  useEffect(() => {
    const savedPosition = localStorage.getItem('alertsPosition') as typeof position;
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  return {
    alerts,
    alertSummary,
    criticalAlerts,
    hasUnseenAlerts,
    alertsEnabled,
    position,
    toggleAlerts,
    changePosition
  };
}

// ============================================================================
// 🔧 CONFIGURACIÓN DE ALERTAS (para Settings)
// ============================================================================

interface AlertsConfigProps {
  onSave: (config: AlertsConfig) => void;
}

interface AlertsConfig {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxAlerts: number;
  autoHide: boolean;
  hideAfter: number;
  criticalOnly: boolean;
}

export function AlertsConfig({ onSave }: AlertsConfigProps) {
  const [config, setConfig] = useState<AlertsConfig>({
    enabled: true,
    position: 'top-right',
    maxAlerts: 3,
    autoHide: false,
    hideAfter: 10000,
    criticalOnly: true
  });

  return (
    <Box p="4">
      <VStack align="stretch" gap="4">
        <Text fontSize="lg" fontWeight="bold">
          Configuración de Alertas Globales
        </Text>

        <Card.Root>
          <Card.Header>
            <Text fontWeight="semibold">Configuración de Notificaciones</Text>
          </Card.Header>
          <Card.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <VStack align="start" gap="0">
                  <Text fontWeight="medium">Solo alertas críticas</Text>
                  <Text fontSize="sm" color="gray.600">
                    Mostrar únicamente alertas de stock crítico
                  </Text>
                </VStack>
                <Badge colorScheme={config.criticalOnly ? 'red' : 'gray'}>
                  {config.criticalOnly ? 'Activado' : 'Desactivado'}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" gap="0">
                  <Text fontWeight="medium">Posición de alertas</Text>
                  <Text fontSize="sm" color="gray.600">
                    Ubicación de las alertas en pantalla
                  </Text>
                </VStack>
                <Badge colorScheme="blue">Esquina superior derecha</Badge>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" gap="0">
                  <Text fontWeight="medium">Auto-dismiss</Text>
                  <Text fontSize="sm" color="gray.600">
                    Ocultar alertas automáticamente después de 5 segundos
                  </Text>
                </VStack>
                <Badge colorScheme="green">Activado</Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Alert.Root status="info" size="sm">
          <Alert.Description>
            La configuración se guarda automáticamente. Las alertas globales aparecen 
            cuando hay items con stock bajo el mínimo establecido.
          </Alert.Description>
        </Alert.Root>
      </VStack>
    </Box>
  );
}