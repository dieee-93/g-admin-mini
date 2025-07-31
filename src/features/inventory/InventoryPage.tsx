// src/features/inventory/InventoryPage.tsx
// Módulo unificado que reemplaza ItemsPage y StockPage - COMPLETAMENTE CORREGIDO

import { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tabs,
  Card,
  Badge,
  Input,
  Select,
  createListCollection,
  Dialog,
  Table,
  Skeleton,
  Alert
} from '@chakra-ui/react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useInventory } from './logic/useInventory';
import { ItemForm, StockEntryForm } from './components/ItemForm';
import { AlertsTab } from './components/AlertsTab';
import type { InventoryItem } from './types';

// ✅ FIX: Definir colección fuera del componente para performance
const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Contables (unidad)', value: 'UNIT' },
    { label: 'Por peso (kg)', value: 'WEIGHT' },
    { label: 'Por volumen (lt)', value: 'VOLUME' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

export function InventoryPage() {
  // ✅ FIX: Solo usar variables necesarias del hook
  const {
    items,
    alerts,
    stockEntries,
    alertSummary,
    inventoryStats,
    loading,
    error,
    hasAlerts,
    hasCriticalAlerts
  } = useInventory();

  // Local state
  const [activeTab, setActiveTab] = useState('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState<{
    open: boolean;
    item?: InventoryItem;
  }>({ open: false });

  // ✅ FIX: Usar useMemo correctamente con dependencias
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  // ✅ FIX: Handlers simplificados
  const handleAddStock = (item: InventoryItem) => {
    setShowStockDialog({ open: true, item });
  };

  const handleStockAdded = () => {
    setShowStockDialog({ open: false });
    // ✅ refresh se maneja automáticamente por el hook useInventory
  };

  const handleItemAdded = () => {
    setShowItemDialog(false);
    // ✅ refresh se maneja automáticamente por el hook useInventory
  };

  // ✅ FIX: Manejo de errores
  if (error) {
    return (
      <Box p="6">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error al cargar inventario</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  // ✅ FIX: Loading state mejorado
  if (loading && items.length === 0) {
    return (
      <Box p="6">
        <VStack gap="6" align="stretch">
          <Skeleton height="60px" />
          <HStack gap="4">
            <Skeleton height="120px" flex="1" />
            <Skeleton height="120px" flex="1" />
            <Skeleton height="120px" flex="1" />
          </HStack>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header con estadísticas */}
        <HStack justify="space-between" align="start">
          <VStack align="start" gap="1">
            <Text fontSize="2xl" fontWeight="bold">Inventario</Text>
            <Text color="gray.600">
              Gestión unificada de items y stock
            </Text>
          </VStack>

          {/* Stats cards */}
          <HStack gap="4">
            <Card.Root size="sm" bg="blue.50" borderColor="blue.200">
              <Card.Body p="3">
                <HStack gap="2">
                  <CubeIcon className="w-5 h-5 text-blue-500" />
                  <VStack align="start" gap="0">
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {inventoryStats.totalItems}
                    </Text>
                    <Text fontSize="xs" color="blue.600">Items</Text>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>

            <Card.Root size="sm" bg="green.50" borderColor="green.200">
              <Card.Body p="3">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="bold" color="green.600">$</Text>
                  <VStack align="start" gap="0">
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {inventoryStats.totalValue.toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color="green.600">Valor total</Text>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>

            {hasAlerts && (
              <Card.Root 
                size="sm" 
                bg={hasCriticalAlerts ? "red.50" : "yellow.50"} 
                borderColor={hasCriticalAlerts ? "red.200" : "yellow.200"}
              >
                <Card.Body p="3">
                  <HStack gap="2">
                    <ExclamationTriangleIcon 
                      className={`w-5 h-5 ${hasCriticalAlerts ? 'text-red-500' : 'text-yellow-500'}`} 
                    />
                    <VStack align="start" gap="0">
                      <Text 
                        fontSize="lg" 
                        fontWeight="bold" 
                        color={hasCriticalAlerts ? "red.600" : "yellow.600"}
                      >
                        {alertSummary.total}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={hasCriticalAlerts ? "red.600" : "yellow.600"}
                      >
                        Alertas
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            )}
          </HStack>
        </HStack>

        {/* Tabs principales */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(details) => setActiveTab(details.value)}
          variant="enclosed"
        >
          <Tabs.List>
            <Tabs.Trigger value="items">
              <CubeIcon className="w-4 h-4" />
              Items ({items.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="movements">
              <ArrowRightIcon className="w-4 h-4" />
              Movimientos ({stockEntries.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="alerts">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Alertas
              {hasAlerts && (
                <Badge 
                  size="sm" 
                  colorPalette={hasCriticalAlerts ? "red" : "yellow"}
                  ml="2"
                >
                  {alertSummary.total}
                </Badge>
              )}
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Items */}
          <Tabs.Content value="items">
            <VStack gap="4" align="stretch">
              {/* Controles */}
              <HStack gap="4">
                <HStack flex="1" gap="3">
                  <Input
                    placeholder="Buscar items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxW="300px"
                  />
                  <Select.Root
                    collection={TYPE_FILTER_COLLECTION}
                    value={typeFilter ? [typeFilter] : []}
                    onValueChange={(details) => setTypeFilter(details.value[0] || 'all')}
                    maxW="200px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Filtrar por tipo" />
                    </Select.Trigger>
                    <Select.Content>
                      {TYPE_FILTER_COLLECTION.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                <Button
                  colorPalette="blue"
                  onClick={() => setShowItemDialog(true)}
                >
                  <PlusIcon className="w-4 h-4" />
                  Nuevo Item
                </Button>
              </HStack>

              {/* Items table */}
              <Card.Root>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                      <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader>Stock</Table.ColumnHeader>
                      <Table.ColumnHeader>Costo unitario</Table.ColumnHeader>
                      <Table.ColumnHeader>Valor total</Table.ColumnHeader>
                      <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredItems.map((item) => {
                      const totalValue = item.stock * (item.unit_cost || 0);
                      // ✅ FIX: Verificar que alerts existe y no esté vacío
                      const hasLowStock = alerts.length > 0 && alerts.some(alert => alert.item_id === item.id);
                      
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>
                            <HStack gap="2">
                              <Text fontWeight="medium">{item.name}</Text>
                              {hasLowStock && (
                                <Badge colorPalette="yellow" size="sm">
                                  Stock bajo
                                </Badge>
                              )}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge 
                              colorPalette={
                                item.type === 'ELABORATED' ? 'purple' :
                                item.type === 'WEIGHT' ? 'orange' :
                                item.type === 'VOLUME' ? 'blue' : 'gray'
                              }
                              size="sm"
                            >
                              {item.type}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text 
                              color={item.stock === 0 ? 'red.500' : item.stock < 10 ? 'yellow.600' : 'inherit'}
                              fontWeight={item.stock < 10 ? 'medium' : 'normal'}
                            >
                              {item.stock} {item.unit}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            {item.unit_cost ? `$${item.unit_cost.toLocaleString()}` : '-'}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            ${totalValue.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell>
                            <HStack gap="2">
                              <Button
                                size="sm"
                                variant="outline"
                                colorPalette="blue"
                                onClick={() => handleAddStock(item)}
                              >
                                <PlusIcon className="w-3 h-3" />
                                Stock
                              </Button>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>

                {filteredItems.length === 0 && (
                  <Box p="8" textAlign="center">
                    <VStack gap="3" color="gray.500">
                      <CubeIcon className="w-12 h-12" />
                      <Text>No se encontraron items</Text>
                      {searchTerm && (
                        <Text fontSize="sm">
                          Intenta ajustar los filtros de búsqueda
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </Card.Root>
            </VStack>
          </Tabs.Content>

          {/* Tab Movements */}
          <Tabs.Content value="movements">
            <Card.Root>
              <Card.Header>
                <Card.Title>Movimientos de Stock Recientes</Card.Title>
              </Card.Header>
              <Card.Body>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                      <Table.ColumnHeader>Item</Table.ColumnHeader>
                      <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                      <Table.ColumnHeader>Costo unitario</Table.ColumnHeader>
                      <Table.ColumnHeader>Total</Table.ColumnHeader>
                      <Table.ColumnHeader>Nota</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {stockEntries.slice(0, 20).map((entry) => {
                      const item = items.find(i => i.id === entry.item_id);
                      const total = entry.quantity * entry.unit_cost;
                      
                      return (
                        <Table.Row key={entry.id}>
                          <Table.Cell>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            {item?.name || 'Item eliminado'}
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="green.600" fontWeight="medium">
                              +{entry.quantity} {item?.unit}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            ${entry.unit_cost.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            ${total.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize="sm" color="gray.600">
                              {entry.note || '-'}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>

                {/* ✅ FIX: Manejar estado vacío */}
                {stockEntries.length === 0 && (
                  <Box p="8" textAlign="center">
                    <VStack gap="3" color="gray.500">
                      <ArrowRightIcon className="w-12 h-12" />
                      <Text>No hay movimientos registrados</Text>
                      <Text fontSize="sm">
                        Los movimientos aparecerán cuando agregues stock
                      </Text>
                    </VStack>
                  </Box>
                )}
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* Tab Alerts */}
          <Tabs.Content value="alerts">
            <AlertsTab 
              alerts={alerts}
              alertSummary={alertSummary}
              onAddStock={handleAddStock}
              loading={loading}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Dialogs */}
        <Dialog.Root open={showItemDialog} onOpenChange={(e) => setShowItemDialog(e.open)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Agregar Nuevo Item</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <ItemForm
                  onSuccess={handleItemAdded}
                  onCancel={() => setShowItemDialog(false)}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        <Dialog.Root 
          open={showStockDialog.open} 
          onOpenChange={(e) => setShowStockDialog(prev => ({ ...prev, open: e.open }))}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  Agregar Stock - {showStockDialog.item?.name}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {showStockDialog.item && (
                  <StockEntryForm
                    item={showStockDialog.item}
                    onSuccess={handleStockAdded}
                    onCancel={() => setShowStockDialog({ open: false })}
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