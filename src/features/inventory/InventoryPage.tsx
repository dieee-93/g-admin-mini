// src/features/inventory/InventoryPage.tsx
// 🚀 DASHBOARD UNIFICADO MODERNO - CORREGIDO: Sin errores de imports ni convenciones

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  createListCollection,
  Dialog,
  Grid,
  Card,
  Badge,
  Skeleton,
  Alert,
  IconButton
} from '@chakra-ui/react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

import { useNavigation } from '@/contexts/NavigationContext';
import { useInventory } from './logic/useInventory';
import { GlobalAlerts } from '@/components/alerts/GlobalAlerts';
import { UniversalItemForm } from './components/UniversalItemForm';
import { 
  type InventoryItem,
  isMeasurable,
  isCountable,
  isElaborated
} from './types';
import { 
  formatQuantity,
  formatWithConversion,
  formatPackagedQuantity,
  getSmartDisplayUnit
} from './utils/conversions';

// ============================================================================
// 📊 COLECCIONES PARA SELECTS (Siguiendo convenciones ChakraUI v3.23.0)
// ============================================================================

const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Conmensurables', value: 'MEASURABLE' },
    { label: 'Contables', value: 'COUNTABLE' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

// ============================================================================
// 📊 COMPONENTES DEL DASHBOARD
// ============================================================================

function ExecutiveSummary({ stats, alertSummary }: any) {
  return (
    <Card.Root>
      <Card.Body p="4">
        <Text fontSize="lg" fontWeight="bold" mb="3">
          📊 Resumen Ejecutivo
        </Text>
        
        <Grid templateColumns="repeat(4, 1fr)" gap="4">
          {/* Total Items */}
          <VStack gap="1">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stats.totalItems}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Items Total
            </Text>
          </VStack>

          {/* Alertas Críticas */}
          <VStack gap="1">
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              color={alertSummary.critical > 0 ? "red.500" : "green.500"}
            >
              {alertSummary.critical}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Alertas Críticas
            </Text>
          </VStack>

          {/* Valor Total */}
          <VStack gap="1">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              ${stats.totalValue?.toLocaleString() || '0'}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Valor Total
            </Text>
          </VStack>

          {/* Movimientos Recientes */}
          <VStack gap="1">
            <Text fontSize="2xl" fontWeight="bold" color="purple.500">
              {stats.recentMovements}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Movimientos (7d)
            </Text>
          </VStack>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}

function QuickActions({ onAddItem, onBulkStock, onQuickStock }: any) {
  return (
    <Card.Root>
      <Card.Body p="4">
        <HStack justify="space-between" mb="3">
          <Text fontSize="lg" fontWeight="bold">⚡ Quick Actions</Text>
          <Badge colorPalette="blue" variant="subtle">Más usados</Badge>
        </HStack>
        
        <HStack gap="3" wrap="wrap">
          <Button 
            colorPalette="green" 
            size="sm"
            onClick={onQuickStock}
          >
            <PlusIcon className="w-4 h-4" />
            Stock Rápido
          </Button>
          
          <Button 
            colorPalette="blue" 
            size="sm"
            onClick={onBulkStock}
          >
            📦 Carga Masiva
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddItem}
          >
            <CubeIcon className="w-4 h-4" />
            Nuevo Item
          </Button>

          <IconButton size="sm" variant="ghost">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </IconButton>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

function ItemCard({ item, onQuickStock, onEdit, onViewDetails }: {
  item: InventoryItem;
  onQuickStock: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}) {
  const isLowStock = item.stock <= 10; // TODO: usar threshold real
  const isCritical = item.stock <= 5;
  
  // Formateo inteligente según tipo
  const formatStock = () => {
    if (isMeasurable(item)) {
      const smartUnit = getSmartDisplayUnit(item.stock, item.unit);
      return formatWithConversion(item.stock, item.unit, smartUnit);
    }
    
    if (isCountable(item) && item.packaging) {
      return formatPackagedQuantity(
        item.stock, 
        item.packaging.package_size || 1, 
        item.packaging.package_unit || 'paquete'
      );
    }
    
    return formatQuantity(item.stock, item.unit || 'unidad');
  };

  const getTypeColor = () => {
    if (isMeasurable(item)) return 'blue';
    if (isCountable(item)) return 'green';
    if (isElaborated(item)) return 'purple';
    return 'gray';
  };

  return (
    <Card.Root 
      variant="outline"
      bg={isCritical ? 'red.50' : isLowStock ? 'yellow.50' : 'white'}
      borderColor={isCritical ? 'red.200' : isLowStock ? 'yellow.200' : 'gray.200'}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap="1" flex="1">
              <Text fontWeight="bold" lineHeight="1.2">
                {item.name}
              </Text>
              <Badge 
                colorPalette={getTypeColor()} 
                variant="subtle" 
                size="xs"
              >
                {item.type}
              </Badge>
            </VStack>
            
            {(isLowStock || isCritical) && (
              <ExclamationTriangleIcon 
                className={`w-5 h-5 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`}
              />
            )}
          </HStack>

          {/* Stock Info */}
          <VStack align="stretch" gap="2">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Stock:</Text>
              <Text fontWeight="bold" fontSize="lg">
                {formatStock()}
              </Text>
            </HStack>
            
            {item.unit_cost && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Costo:</Text>
                <Text fontSize="sm">
                  ${item.unit_cost}/{item.unit}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Quick Actions */}
          <HStack gap="2">
            <Button
              size="sm"
              colorPalette="green"
              flex="1"
              onClick={() => onQuickStock(item)}
            >
              <PlusIcon className="w-3 h-3" />
              +Stock
            </Button>
            
            <IconButton
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(item)}
            >
              <EyeIcon className="w-3 h-3" />
            </IconButton>
            
            <IconButton
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
            >
              <PencilIcon className="w-3 h-3" />
            </IconButton>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// ============================================================================
// 🏠 COMPONENTE PRINCIPAL
// ============================================================================

export function InventoryPage() {
  const { setQuickActions } = useNavigation();
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

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showQuickStockDialog, setShowQuickStockDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // ✅ Configurar quick actions para navegación
  useEffect(() => {
    const quickActions = [
      {
        id: 'quick-stock',
        label: 'Stock Rápido',
        icon: PlusIcon,
        action: () => setShowQuickStockDialog(true),
        color: 'green'
      },
      {
        id: 'bulk-stock',
        label: 'Carga Masiva',
        icon: CubeIcon,
        action: () => setShowBulkDialog(true),
        color: 'blue'
      },
      {
        id: 'new-item',
        label: 'Nuevo Item',
        icon: CubeIcon,
        action: () => setShowItemDialog(true),
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // Filtrado de items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  // Handlers
  const handleQuickStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowQuickStockDialog(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    // TODO: Abrir modal de edición
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    // TODO: Abrir panel de detalles
  };

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
    <Box>
      {/* 🚨 Alertas Globales */}
      <GlobalAlerts position="top-right" maxAlerts={3} />
      
      <VStack gap="6" align="stretch" p="6">
        {/* 📊 Resumen Ejecutivo */}
        <ExecutiveSummary stats={inventoryStats} alertSummary={alertSummary} />

        {/* ⚡ Quick Actions */}
        <QuickActions
          onAddItem={() => setShowItemDialog(true)}
          onBulkStock={() => setShowBulkDialog(true)}
          onQuickStock={() => setShowQuickStockDialog(true)}
        />

        {/* 🚨 Banner de Alertas Críticas (si existen) */}
        {hasCriticalAlerts && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>
              🚨 {alertSummary.critical} items con stock crítico
            </Alert.Title>
            <Alert.Description>
              <Button size="sm" variant="outline" colorPalette="red">
                Ver detalles
              </Button>
            </Alert.Description>
          </Alert.Root>
        )}

        {/* 🔍 Filtros y Búsqueda */}
        <Card.Root>
          <Card.Body p="4">
            <HStack gap="4" align="end">
              <Box flex="2">
                <Text mb="2" fontSize="sm" fontWeight="medium">
                  Buscar items
                </Text>
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>

              <Box flex="1">
                <Text mb="2" fontSize="sm" fontWeight="medium">
                  Filtro
                </Text>
                <Select.Root
                  collection={TYPE_FILTER_COLLECTION}
                  value={[typeFilter]}
                  onValueChange={(details) => setTypeFilter(details.value[0])}
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

              <IconButton
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </IconButton>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* 📦 Grid de Items */}
        {loading ? (
          <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="200px" borderRadius="md" />
            ))}
          </Grid>
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
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"
            }}
            gap="4"
          >
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onQuickStock={handleQuickStock}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
              />
            ))}
          </Grid>
        )}
      </VStack>

      {/* 🔧 MODALS - Formularios modernos */}
      
      {/* Modal Crear Item */}
      <Dialog.Root open={showItemDialog} onOpenChange={(details) => setShowItemDialog(details.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="700px">
            <Dialog.Header>
              <Dialog.Title>🆕 Crear Nuevo Item</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body p="6">
              <UniversalItemForm
                onSuccess={() => setShowItemDialog(false)}
                onCancel={() => setShowItemDialog(false)}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Modal Quick Stock */}
      <Dialog.Root open={showQuickStockDialog} onOpenChange={(details) => setShowQuickStockDialog(details.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                ⚡ Stock Rápido {selectedItem && `- ${selectedItem.name}`}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Text color="gray.600">
                Formulario rápido con conversiones automáticas...
              </Text>
              {/* TODO: Implementar quick stock form */}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Modal Bulk Stock */}
      <Dialog.Root open={showBulkDialog} onOpenChange={(details) => setShowBulkDialog(details.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl">
            <Dialog.Header>
              <Dialog.Title>📦 Carga Masiva de Stock</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Text color="gray.600">
                Formulario para cargar múltiples items (proveedor trae 5+ productos)...
              </Text>
              {/* TODO: Implementar bulk stock form */}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}