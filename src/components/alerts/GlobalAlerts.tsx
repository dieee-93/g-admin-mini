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
  Badge
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
      // TODO: Implementar quick stock modal
      notify.info({
        title: 'Quick Stock',
        description: `Agregando stock para ${itemName}...`
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
                  // TODO: Navegar a página de inventario tab alertas
                  window.location.href = '/inventory?tab=alerts';
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

  // TODO: Implementar UI de configuración
  return (
    <Box p="4">
      <Text fontSize="lg" fontWeight="bold" mb="4">
        Configuración de Alertas Globales
      </Text>
      {/* Aquí va el formulario de configuración */}
    </Box>
  );
}