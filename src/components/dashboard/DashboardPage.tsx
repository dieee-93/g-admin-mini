import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Heading,
  Card,
  Badge,
  Dialog
} from '@chakra-ui/react';
import {
  PlusIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import existing dashboard components
import { useDashboardStats } from '@/hooks/useDashboardStats'; 

// Import new stock alerts components
import { StockAlertsWidget } from '../../features/stock/components/StockAlertsWidget';
import { StockAlertsList } from '../../features/stock/components/StockAlertsList';
import { AlertConfigDialog } from '../../features/stock/components/AlertConfigDialog';
import { AlertsBadge, useAlertsStatus } from '../navigation/AlertsBadge'; 

// Mock components for existing features (replace with actual imports)
interface AddStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
  itemName?: string;
}

function AddStockDialog({ isOpen, onClose, itemId, itemName }: AddStockDialogProps) {
  // This should be imported from existing stock management module
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Agregar Stock - {itemName}</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Dialog.Body>
            <Text>Modal de agregar stock (implementar con componente existente)</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={onClose}>Cerrar</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { hasCriticalAlerts, totalCount: alertCount } = useAlertsStatus();

  // State for modals and dialogs
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [addStockDialog, setAddStockDialog] = useState<{
    isOpen: boolean;
    itemId?: string;
    itemName?: string;
  }>({
    isOpen: false
  });
  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean;
    itemId?: string;
    itemName?: string;
    currentStock?: number;
    unit?: string;
    itemType?: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  }>({
    isOpen: false
  });

  // Handlers for stock alerts actions
  const handleViewAllAlerts = () => {
    setShowAllAlerts(true);
  };

  const handleQuickAddStock = (alertId: string, itemName: string) => {
    setAddStockDialog({
      isOpen: true,
      itemId: alertId,
      itemName
    });
  };

  const handleConfigureAlert = (alertId: string) => {
    // In real implementation, fetch item details
    setConfigDialog({
      isOpen: true,
      itemId: alertId,
      itemName: 'Item Name', // Replace with actual item data
      currentStock: 10,       // Replace with actual stock
      unit: 'kg',            // Replace with actual unit
      itemType: 'WEIGHT'     // Replace with actual type
    });
  };

  const handleMarkOrdered = (alertId: string) => {
    // Implement mark as ordered logic
    console.log('Mark ordered:', alertId);
  };

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

          {/* Alerts indicator in header */}
          {alertCount > 0 && (
            <Card.Root 
              bg={hasCriticalAlerts ? 'red.50' : 'yellow.50'} 
              borderColor={hasCriticalAlerts ? 'red.200' : 'yellow.200'}
              borderWidth="1px"
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
                      {alertCount} item{alertCount > 1 ? 's' : ''} requiere{alertCount > 1 ? 'n' : ''} atención
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    colorPalette={hasCriticalAlerts ? 'red' : 'yellow'}
                    variant="outline"
                    onClick={handleViewAllAlerts}
                  >
                    Ver Todas
                  </Button>
                </HStack>
              </Card.Body>
            </Card.Root>
          )}
        </HStack>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="4">
          <Card.Root>
            <Card.Body p="4">
              <HStack gap="3">
                <Box p="2" bg="blue.100" borderRadius="md">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold">
                    {statsLoading ? '...' : stats?.totalItems || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Items Registrados
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body p="4">
              <HStack gap="3">
                <Box p="2" bg="green.100" borderRadius="md">
                  <ShoppingCartIcon className="w-6 h-6 text-green-600" />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold">
                    {statsLoading ? '...' : stats?.todaySales || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Ventas Hoy
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body p="4">
              <HStack gap="3">
                <Box p="2" bg="purple.100" borderRadius="md">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold">
                    ${statsLoading ? '...' : stats?.monthlyRevenue || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Ingresos del Mes
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body p="4">
              <HStack gap="3">
                <Box p="2" bg="orange.100" borderRadius="md">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold">
                    {alertCount}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Alertas de Stock
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Main Content Grid */}
        <Grid 
          templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} 
          gap="6"
          templateRows={{ lg: 'auto' }}
        >
          {/* Stock Alerts Widget - Takes full width on mobile, 2 columns on desktop */}
          <Box gridColumn={{ base: '1', lg: 'span 2' }}>
            <StockAlertsWidget
              maxItems={8}
              onViewAll={handleViewAllAlerts}
              onQuickAction={handleQuickAddStock}
            />
          </Box>

          {/* Quick Actions */}
          <Card.Root>
            <Card.Header>
              <Text fontSize="lg" fontWeight="semibold">
                Acciones Rápidas
              </Text>
            </Card.Header>
            <Card.Body>
              <VStack gap="3">
                <Button 
                  width="100%" 
                  colorPalette="blue" 
                  variant="outline"
                  justifyContent="start"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nuevo Item
                </Button>
                
                <Button 
                  width="100%" 
                  colorPalette="green" 
                  variant="outline"
                  justifyContent="start"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Nueva Venta
                </Button>
                
                <Button 
                  width="100%" 
                  colorPalette="purple" 
                  variant="outline"
                  justifyContent="start"
                >
                  <CubeIcon className="w-4 h-4" />
                  Gestionar Inventario
                </Button>

                {hasCriticalAlerts && (
                  <Button 
                    width="100%" 
                    colorPalette="red" 
                    variant="solid"
                    justifyContent="start"
                    onClick={handleViewAllAlerts}
                  >
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Revisar Alertas Críticas
                  </Button>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Recent Activity placeholder */}
        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="semibold">
              Actividad Reciente
            </Text>
          </Card.Header>
          <Card.Body>
            <Text fontSize="sm" color="gray.600">
              Últimas ventas, movimientos de stock y alertas...
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>

      {/* Modals and Dialogs */}
      
      {/* Full Alerts List Dialog */}
      <Dialog.Root open={showAllAlerts} onOpenChange={(e) => setShowAllAlerts(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxWidth="1000px" height="80vh">
            <Dialog.Header>
              <Dialog.Title>Alertas de Stock</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body overflow="auto">
              <StockAlertsList
                onAddStock={handleQuickAddStock}
                onConfigure={handleConfigureAlert}
                onMarkOrdered={handleMarkOrdered}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Add Stock Dialog */}
      <AddStockDialog
        isOpen={addStockDialog.isOpen}
        onClose={() => setAddStockDialog({ isOpen: false })}
        itemId={addStockDialog.itemId}
        itemName={addStockDialog.itemName}
      />

      {/* Alert Configuration Dialog */}
      <AlertConfigDialog
        isOpen={configDialog.isOpen}
        onClose={() => setConfigDialog({ isOpen: false })}
        itemId={configDialog.itemId || ''}
        itemName={configDialog.itemName || ''}
        currentStock={configDialog.currentStock || 0}
        unit={configDialog.unit || ''}
        itemType={configDialog.itemType || 'UNIT'}
      />
    </Box>
  );
}