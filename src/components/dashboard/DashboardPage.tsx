import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Heading,
  Alert,
  Skeleton,
  Dialog
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  CubeIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '@/features/inventory';
import { StockEntryForm } from '@/features/inventory/components/ItemForm';

export function DashboardPage() {
  const {
    inventoryStats,
    alertSummary,
    alerts,
    loading,
    error,
    hasCriticalAlerts,
    hasAlerts
  } = useInventory({ alertThreshold: 10 });

  // Estados para dialogs
  const [addStockDialog, setAddStockDialog] = useState<{
    open: boolean;
    item?: any;
  }>({ open: false });

  // Handlers
  const handleViewAllAlerts = () => {
    // Navegar a la página de inventory con tab de alerts activo
    window.location.href = '/inventory?tab=alerts';
  };

  const handleQuickAddStock = (alert: any) => {
    setAddStockDialog({
      open: true,
      item: {
        id: alert.item_id,
        name: alert.item_name,
        stock: alert.current_stock,
        unit: alert.unit || 'unidad'
      }
    });
  };

  const handleStockAdded = () => {
    setAddStockDialog({ open: false });
  };

  if (loading && !inventoryStats.totalItems) {
    return (
      <Box p="6">
        <VStack gap="6" align="stretch">
          <Skeleton height="80px" />
          <HStack gap="4">
            <Skeleton height="120px" flex="1" />
            <Skeleton height="120px" flex="1" />
            <Skeleton height="120px" flex="1" />
          </HStack>
          <Skeleton height="300px" />
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error al cargar dashboard</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" gap="1">
            <Heading size="xl">Dashboard</Heading>
            <Text color="gray.600">
              Resumen general de tu negocio
            </Text>
          </VStack>

          {/* Indicador de alertas en header */}
          {hasAlerts && (
            <Card.Root 
              bg={hasCriticalAlerts ? 'red.50' : 'yellow.50'} 
              borderColor={hasCriticalAlerts ? 'red.200' : 'yellow.200'}
              borderWidth="1px"
              cursor="pointer"
              onClick={handleViewAllAlerts}
              _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              <Card.Body p="3">
                <HStack gap="3">
                  <ExclamationTriangleIcon 
                    className={`w-5 h-5 ${hasCriticalAlerts ? 'text-red-500' : 'text-yellow-500'}`} 
                  />
                  <VStack align="start" gap="0">
                    <Text 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color={hasCriticalAlerts ? 'red.700' : 'yellow.700'}
                    >
                      {hasCriticalAlerts ? 'Alertas Críticas' : 'Alertas Activas'}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color={hasCriticalAlerts ? 'red.600' : 'yellow.600'}
                    >
                      {alertSummary.total} item{alertSummary.total > 1 ? 's' : ''} requiere{alertSummary.total > 1 ? 'n' : ''} atención
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    colorPalette={hasCriticalAlerts ? 'red' : 'yellow'}
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAllAlerts();
                    }}
                  >
                    <EyeIcon className="w-3 h-3" />
                    Ver todas
                  </Button>
                </HStack>
              </Card.Body>
            </Card.Root>
          )}
        </HStack>

        {/* Métricas principales */}
        <HStack gap="6" align="stretch">
          {/* Items totales */}
          <Card.Root flex="1">
            <Card.Body>
              <HStack gap="4">
                <Box p="3" bg="blue.100" borderRadius="lg">
                  <CubeIcon className="w-8 h-8 text-blue-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {inventoryStats.totalItems}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Items en inventario
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {inventoryStats.outOfStockItems} sin stock
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Valor total */}
          <Card.Root flex="1">
            <Card.Body>
              <HStack gap="4">
                <Box p="3" bg="green.100" borderRadius="lg">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    ${inventoryStats.totalValue.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Valor total del stock
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Basado en costos unitarios
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Movimientos recientes */}
          <Card.Root flex="1">
            <Card.Body>
              <HStack gap="4">
                <Box p="3" bg="purple.100" borderRadius="lg">
                  <PlusIcon className="w-8 h-8 text-purple-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {inventoryStats.recentMovements}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Movimientos (7 días)
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Entradas de stock
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        </HStack>

        {/* Alertas de stock */}
        {hasAlerts && (
          <Card.Root>
            <Card.Header>
              <HStack justify="space-between">
                <Card.Title>
                  <HStack gap="2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Alertas de Stock
                  </HStack>
                </Card.Title>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewAllAlerts}
                >
                  Ver todas ({alertSummary.total})
                </Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack gap="3" align="stretch">
                {/* Resumen por urgencia */}
                <HStack gap="4" mb="4">
                  {alertSummary.critical > 0 && (
                    <HStack gap="2">
                      <Badge colorPalette="red" size="sm">
                        {alertSummary.critical} Críticas
                      </Badge>
                    </HStack>
                  )}
                  {alertSummary.warning > 0 && (
                    <HStack gap="2">
                      <Badge colorPalette="yellow" size="sm">
                        {alertSummary.warning} Advertencias
                      </Badge>
                    </HStack>
                  )}
                  {alertSummary.info > 0 && (
                    <HStack gap="2">
                      <Badge colorPalette="blue" size="sm">
                        {alertSummary.info} Informativas
                      </Badge>
                    </HStack>
                  )}
                </HStack>

                {/* Lista de alertas más urgentes (máximo 5) */}
                {alerts.slice(0, 5).map((alert) => (
                  <Card.Root key={alert.id} size="sm" variant="outline">
                    <Card.Body p="3">
                      <HStack justify="space-between" align="center">
                        <HStack gap="3">
                          <ExclamationTriangleIcon 
                            className={`w-5 h-5 ${
                              alert.urgency === 'critical' ? 'text-red-500' :
                              alert.urgency === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`}
                          />
                          <VStack align="start" gap="0">
                            <Text fontWeight="medium" fontSize="sm">
                              {alert.item_name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Stock: {alert.current_stock} / Mínimo: {alert.min_threshold}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack gap="2">
                          <Badge 
                            colorPalette={
                              alert.urgency === 'critical' ? 'red' :
                              alert.urgency === 'warning' ? 'yellow' : 'blue'
                            }
                            size="sm"
                          >
                            {alert.urgency === 'critical' ? 'Crítica' :
                             alert.urgency === 'warning' ? 'Advertencia' : 'Info'}
                          </Badge>
                          <Button
                            size="xs"
                            colorPalette="blue"
                            variant="outline"
                            onClick={() => handleQuickAddStock(alert)}
                          >
                            <PlusIcon className="w-3 h-3" />
                            Stock
                          </Button>
                        </HStack>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}

                {alerts.length > 5 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center" pt="2">
                    Y {alerts.length - 5} alertas más...
                  </Text>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Estado cuando no hay alertas */}
        {!hasAlerts && !loading && (
          <Card.Root>
            <Card.Body>
              <VStack gap="4" p="6" textAlign="center">
                <Box p="4" bg="green.100" borderRadius="full">
                  <CubeIcon className="w-12 h-12 text-green-600" />
                </Box>
                <VStack gap="2">
                  <Text fontSize="lg" fontWeight="medium" color="green.600">
                    ¡Inventario bajo control!
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Todos los items tienen stock suficiente
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  onClick={() => window.location.href = '/inventory'}
                >
                  Ver inventario completo
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Dialog para agregar stock rápidamente */}
        <Dialog.Root 
          open={addStockDialog.open} 
          onOpenChange={(e) => setAddStockDialog(prev => ({ ...prev, open: e.open }))}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>
                  Agregar Stock - {addStockDialog.item?.name}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                {addStockDialog.item && (
                  <StockEntryForm
                    item={addStockDialog.item}
                    onSuccess={handleStockAdded}
                    onCancel={() => setAddStockDialog({ open: false })}
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </VStack>
    </Box>
  );
}