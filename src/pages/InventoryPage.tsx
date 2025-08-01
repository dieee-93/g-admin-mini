// src/pages/InventoryPage.tsx
// ✅ MIGRADO: De features/ al nuevo sistema de navegación
// Módulo unificado de inventario integrado con NavigationContext

import { useState, useMemo, useEffect } from 'react';
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
  Skeleton,
  Alert,
  Grid
} from '@chakra-ui/react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ MIGRADO: Imports de la vieja estructura de features
import { useInventory } from '@/features/inventory/logic/useInventory';
import { ItemForm, StockEntryForm } from '@/features/inventory/components/ItemForm';
import { AlertsTab } from '@/features/inventory/components/AlertsTab';
import type { InventoryItem } from '@/features/inventory/types';

// ✅ Collections para performance
const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Contables (unidad)', value: 'UNIT' },
    { label: 'Por peso (kg)', value: 'WEIGHT' },
    { label: 'Por volumen (lt)', value: 'VOLUME' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

const TAB_COLLECTION = createListCollection({
  items: [
    { label: 'Items', value: 'items' },
    { label: 'Stock', value: 'stock' },
    { label: 'Alertas', value: 'alerts' }
  ]
});

export function InventoryPage() {
  // ✅ NUEVO: Integración con NavigationContext
  const { setQuickActions } = useNavigation();

  // ✅ MIGRADO: Lógica existente del inventario
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

  // ✅ NUEVO: Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'add-item',
        label: 'Nuevo Item',
        icon: CubeIcon,
        action: () => setShowItemDialog(true),
        color: 'blue'
      },
      {
        id: 'add-stock',
        label: 'Agregar Stock',
        icon: ChartBarIcon,
        action: () => setShowStockDialog({ open: true }),
        color: 'green'
      }
    ];

    if (hasAlerts) {
      quickActions.push({
        id: 'view-alerts',
        label: 'Ver Alertas',
        icon: ExclamationTriangleIcon,
        action: () => setActiveTab('alerts'),
        color: hasCriticalAlerts ? 'red' : 'orange'
      });
    }

    setQuickActions(quickActions);

    // Cleanup al desmontar
    return () => setQuickActions([]);
  }, [setQuickActions, hasAlerts, hasCriticalAlerts]);

  // ✅ MIGRADO: Filtros existentes
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  // ✅ MIGRADO: Handlers existentes
  const handleAddStock = (item: InventoryItem) => {
    setShowStockDialog({ open: true, item });
  };

  const handleStockAdded = () => {
    setShowStockDialog({ open: false });
  };

  const handleItemAdded = () => {
    setShowItemDialog(false);
  };

  // ✅ Error handling
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

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* ✅ Header con métricas */}
        <VStack align="start" gap="2">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Inventario</Text>
              <Text color="gray.600">
                Gestión de items, stock y alertas
              </Text>
            </VStack>

            {/* ✅ Estadísticas rápidas */}
            <HStack gap="4">
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {inventoryStats.totalItems}
                </Text>
                <Text fontSize="xs" color="gray.500">Items</Text>
              </VStack>
              
              {hasAlerts && (
                <VStack align="center" gap="0">
                  <Text 
                    fontSize="2xl" 
                    fontWeight="bold" 
                    color={hasCriticalAlerts ? 'red.500' : 'orange.500'}
                  >
                    {alertSummary.total}
                  </Text>
                  <Text fontSize="xs" color="gray.500">Alertas</Text>
                </VStack>
              )}
            </HStack>
          </HStack>

          {/* ✅ Alert banner si hay críticas */}
          {hasCriticalAlerts && (
            <Alert.Root status="error" w="full">
              <Alert.Indicator />
              <Alert.Title>
                {alertSummary.critical} items con stock crítico
              </Alert.Title>
              <Alert.Description>
                <Button 
                  variant="outline" 
                  size="sm" 
                  colorPalette="red"
                  onClick={() => setActiveTab('alerts')}
                >
                  Ver alertas críticas
                </Button>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>

        {/* ✅ MIGRADO: Tabs del contenido */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="items">
              <CubeIcon className="w-4 h-4" />
              Items
              <Badge colorPalette="blue" variant="subtle">
                {items.length}
              </Badge>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="stock">
              <ChartBarIcon className="w-4 h-4" />
              Entradas de Stock
            </Tabs.Trigger>
            
            <Tabs.Trigger value="alerts">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Alertas
              {hasAlerts && (
                <Badge 
                  colorPalette={hasCriticalAlerts ? 'red' : 'orange'} 
                  variant="solid"
                >
                  {alertSummary.total}
                </Badge>
              )}
            </Tabs.Trigger>
          </Tabs.List>

          {/* ✅ TAB: Items */}
          <Tabs.Content value="items">
            <VStack gap="4" align="stretch">
              {/* Filtros y búsqueda */}
              <Card.Root>
                <Card.Body>
                  <HStack gap="4" align="end">
                    <Box flex="2">
                      <Text mb="2" fontSize="sm" fontWeight="medium">
                        Buscar items
                      </Text>
                      <Input
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startElement={<MagnifyingGlassIcon className="w-4 h-4" />}
                      />
                    </Box>

                    <Box flex="1">
                      <Text mb="2" fontSize="sm" fontWeight="medium">
                        Filtrar por tipo
                      </Text>
                      <Select.Root
                        collection={TYPE_FILTER_COLLECTION}
                        value={typeFilter ? [typeFilter] : []}
                        onValueChange={(details) => setTypeFilter(details.value[0] || 'all')}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Todos los tipos" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            {TYPE_FILTER_COLLECTION.items.map((item) => (
                              <Select.Item key={item.value} item={item}>
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Box>

                    <Button
                      colorPalette="blue"
                      onClick={() => setShowItemDialog(true)}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Nuevo Item
                    </Button>
                  </HStack>
                </Card.Body>
              </Card.Root>

              {/* Lista de items */}
              {loading ? (
                <VStack gap="3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height="60px" />
                  ))}
                </VStack>
              ) : filteredItems.length === 0 ? (
                <Card.Root>
                  <Card.Body>
                    <VStack gap="4" py="8">
                      <CubeIcon className="w-12 h-12 text-gray-400" />
                      <VStack gap="2">
                        <Text fontSize="lg" fontWeight="medium">
                          No hay items
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          {searchTerm || typeFilter !== 'all' 
                            ? 'No se encontraron items con los filtros aplicados'
                            : 'Comienza agregando tu primer item al inventario'
                          }
                        </Text>
                      </VStack>
                      {!searchTerm && typeFilter === 'all' && (
                        <Button 
                          colorPalette="blue"
                          onClick={() => setShowItemDialog(true)}
                        >
                          <PlusIcon className="w-4 h-4" />
                          Crear primer item
                        </Button>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ) : (
                <Grid 
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap="4"
                >
                  {filteredItems.map((item) => (
                    <Card.Root key={item.id} variant="outline">
                      <Card.Body>
                        <VStack align="stretch" gap="3">
                          <HStack justify="space-between">
                            <VStack align="start" gap="1">
                              <Text fontWeight="bold">{item.name}</Text>
                              <Badge variant="subtle" colorPalette="blue">
                                {item.type}
                              </Badge>
                            </VStack>
                            
                            <VStack align="end" gap="1">
                              <Text fontSize="lg" fontWeight="bold">
                                {item.stock} {item.unit}
                              </Text>
                              {item.unit_cost && (
                                <Text fontSize="sm" color="gray.500">
                                  ${item.unit_cost}/{item.unit}
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          <HStack gap="2">
                            <Button
                              variant="outline"
                              size="sm"
                              flex="1"
                              onClick={() => handleAddStock(item)}
                            >
                              <ChartBarIcon className="w-4 h-4" />
                              Stock
                            </Button>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Grid>
              )}
            </VStack>
          </Tabs.Content>

          {/* ✅ TAB: Stock Entries */}
          <Tabs.Content value="stock">
            <VStack gap="4" align="stretch">
              <Card.Root>
                <Card.Header>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Entradas de Stock
                    </Text>
                    <Button
                      colorPalette="green"
                      onClick={() => setShowStockDialog({ open: true })}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Nueva Entrada
                    </Button>
                  </HStack>
                </Card.Header>
                
                <Card.Body>
                  {stockEntries.length === 0 ? (
                    <VStack gap="4" py="8">
                      <TrendingUpIcon className="w-12 h-12 text-gray-400" />
                      <VStack gap="2">
                        <Text fontSize="lg" fontWeight="medium">
                          No hay entradas de stock
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Las entradas de stock aparecerán aquí cuando agregues inventario
                        </Text>
                      </VStack>
                    </VStack>
                  ) : (
                    <VStack gap="3" align="stretch">
                      {stockEntries.slice(0, 10).map((entry) => (
                        <HStack 
                          key={entry.id} 
                          justify="space-between" 
                          p="3" 
                          bg="gray.50" 
                          borderRadius="md"
                        >
                          <VStack align="start" gap="1">
                            <Text fontWeight="medium">
                              +{entry.quantity} unidades
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </Text>
                          </VStack>
                          
                          <VStack align="end" gap="1">
                            <Text fontWeight="bold">
                              ${entry.unit_cost}/unidad
                            </Text>
                            {entry.note && (
                              <Text fontSize="sm" color="gray.500">
                                {entry.note}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Card.Body>
              </Card.Root>
            </VStack>
          </Tabs.Content>

          {/* ✅ TAB: Alertas */}
          <Tabs.Content value="alerts">
            <AlertsTab alerts={alerts} alertSummary={alertSummary} />
          </Tabs.Content>
        </Tabs.Root>

        {/* ✅ MIGRADO: Dialogs */}
        
        {/* Dialog para crear item */}
        <Dialog.Root open={showItemDialog} onOpenChange={(e) => setShowItemDialog(e.open)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Crear Nuevo Item</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              
              <Dialog.Body>
                <ItemForm onSuccess={handleItemAdded} onCancel={() => setShowItemDialog(false)} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Dialog para agregar stock */}
        <Dialog.Root 
          open={showStockDialog.open} 
          onOpenChange={(e) => setShowStockDialog({ open: e.open })}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {showStockDialog.item 
                    ? `Agregar Stock: ${showStockDialog.item.name}`
                    : 'Agregar Stock'
                  }
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              
              <Dialog.Body>
                <StockEntryForm 
                  selectedItem={showStockDialog.item}
                  onSuccess={handleStockAdded} 
                  onCancel={() => setShowStockDialog({ open: false })} 
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </VStack>
    </Box>
  );
}