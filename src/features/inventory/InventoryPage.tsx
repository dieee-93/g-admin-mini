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
  Card,
  Badge,
  Skeleton,
  Alert,
  IconButton,
  SimpleGrid
} from '@chakra-ui/react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  PencilIcon,
  EyeIcon,
  ScaleIcon,
  HashtagIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

// ✅ IMPORTS REALES
import { useNavigation } from '@/contexts/NavigationContext';
import { useInventory } from './logic/useInventory';
import { UniversalItemForm } from './components/UniversalItemForm';
import { 
  type InventoryItem,
  isMeasurable,
  isCountable,
  isElaborated
} from './types';

// ✅ Collections actualizadas con nuevo modelo
const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Conmensurables', value: 'MEASURABLE' },
    { label: 'Contables', value: 'COUNTABLE' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

// ✅ Utilidades de formateo para nuevo modelo
const formatQuantity = (quantity: number, unit: string, item: InventoryItem): string => {
  if (isMeasurable(item)) {
    if (item.category === 'weight') {
      if (quantity >= 1000) return `${(quantity / 1000).toFixed(1)} ton`;
      if (quantity >= 1) return `${quantity} kg`;
      return `${(quantity * 1000).toFixed(0)} g`;
    }
    if (item.category === 'volume') {
      if (quantity >= 1) return `${quantity} L`;
      return `${(quantity * 1000).toFixed(0)} ml`;
    }
    if (item.category === 'length') {
      if (quantity >= 1000) return `${(quantity / 1000).toFixed(1)} km`;
      if (quantity >= 1) return `${quantity} m`;
      return `${(quantity * 10).toFixed(0)} cm`;
    }
  }
  
  if (isCountable(item) && item.packaging) {
    const packages = Math.floor(quantity / item.packaging.package_size);
    const remaining = quantity % item.packaging.package_size;
    if (packages > 0 && remaining > 0) {
      return `${packages} ${item.packaging.package_unit}${packages !== 1 ? 's' : ''} + ${remaining} unidades`;
    }
    if (packages > 0) {
      return `${packages} ${item.packaging.package_unit}${packages !== 1 ? 's' : ''}`;
    }
  }
  
  return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'MEASURABLE': return ScaleIcon;
    case 'COUNTABLE': return HashtagIcon;
    case 'ELABORATED': return BeakerIcon;
    default: return CubeIcon;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'MEASURABLE': return 'blue';
    case 'COUNTABLE': return 'green';
    case 'ELABORATED': return 'purple';
    default: return 'gray';
  }
};

const getStockStatus = (stock: number, type: string) => {
  if (stock <= 0) return { color: 'red', label: 'Sin stock', severity: 'critical' };
  
  // Umbrales diferentes por tipo
  const threshold = type === 'ELABORATED' ? 5 : type === 'MEASURABLE' ? 3 : 20;
  const criticalThreshold = threshold / 2;
  
  if (stock <= criticalThreshold) return { color: 'red', label: 'Crítico', severity: 'critical' };
  if (stock <= threshold) return { color: 'yellow', label: 'Bajo', severity: 'warning' };
  return { color: 'green', label: 'Disponible', severity: 'ok' };
};

// ✅ Componente de tarjeta mejorada
function ModernItemCard({ 
  item, 
  onEdit, 
  onAddStock, 
  onViewDetails 
}: {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}) {
  const TypeIcon = getTypeIcon(item.type);
  const stockStatus = getStockStatus(item.stock, item.type);
  const typeColor = getTypeColor(item.type);
  
  return (
    <Card.Root 
      variant="outline"
      bg={stockStatus.severity === 'critical' ? 'red.50' : stockStatus.severity === 'warning' ? 'yellow.50' : 'white'}
      borderColor={stockStatus.severity === 'critical' ? 'red.200' : stockStatus.severity === 'warning' ? 'yellow.200' : 'gray.200'}
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-2px)', 
        shadow: 'md',
        borderColor: typeColor === 'blue' ? 'blue.300' : typeColor === 'green' ? 'green.300' : 'purple.300'
      }}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3">
          {/* Header con icono y tipo */}
          <HStack justify="space-between" align="start">
            <HStack gap="2" flex="1">
              <Box p="1" bg={`${typeColor}.100`} borderRadius="md">
                <TypeIcon className={`w-4 h-4 text-${typeColor}-600`} />
              </Box>
              <VStack align="start" gap="0" flex="1">
                <Text fontWeight="bold" lineHeight="1.2" fontSize="sm">
                  {item.name}
                </Text>
                <Badge 
                  colorPalette={typeColor} 
                  variant="subtle" 
                  size="xs"
                >
                  {item.type === 'MEASURABLE' ? 'Conmensurable' : 
                   item.type === 'COUNTABLE' ? 'Contable' : 'Elaborado'}
                </Badge>
              </VStack>
            </HStack>
            
            {stockStatus.severity !== 'ok' && (
              <ExclamationTriangleIcon 
                className={`w-4 h-4 ${stockStatus.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}
              />
            )}
          </HStack>

          {/* Stock info */}
          <VStack align="start" gap="1">
            <HStack justify="space-between" w="full">
              <Text fontSize="xs" color="gray.600">Stock actual:</Text>
              <Badge 
                colorPalette={stockStatus.color} 
                variant="subtle" 
                size="xs"
              >
                {stockStatus.label}
              </Badge>
            </HStack>
            
            <Text fontSize="lg" fontWeight="bold" color={stockStatus.color === 'red' ? 'red.600' : stockStatus.color === 'yellow' ? 'yellow.600' : 'gray.800'}>
              {formatQuantity(item.stock, item.unit, item)}
            </Text>
            
            {/* Costo unitario */}
            {item.unit_cost && (
              <Text fontSize="xs" color="gray.500">
                ${item.unit_cost.toFixed(2)} por {item.unit}
              </Text>
            )}
          </VStack>

          {/* Info específica por tipo */}
          {isElaborated(item) && (
            <VStack align="start" gap="1">
              <Text fontSize="xs" color="purple.600">
                🍳 Producto elaborado
              </Text>
              {item.requires_production && (
                <Text fontSize="xs" color="gray.500">
                  Requiere producción previa
                </Text>
              )}
            </VStack>
          )}

          {isCountable(item) && item.packaging && (
            <VStack align="start" gap="1">
              <Text fontSize="xs" color="green.600">
                📦 Packaging: {item.packaging.package_size} por {item.packaging.package_unit}
              </Text>
            </VStack>
          )}

          {isMeasurable(item) && (
            <VStack align="start" gap="1">
              <Text fontSize="xs" color="blue.600">
                📏 Categoría: {item.category === 'weight' ? 'Peso' : item.category === 'volume' ? 'Volumen' : 'Longitud'}
              </Text>
            </VStack>
          )}

          {/* Quick actions */}
          <HStack gap="2" pt="2" borderTop="1px solid" borderColor="gray.100">
            <Button 
              size="xs" 
              variant="ghost" 
              colorPalette="green"
              onClick={() => onAddStock(item)}
              flex="1"
            >
              <PlusIcon className="w-3 h-3" />
              Stock
            </Button>
            
            <Button 
              size="xs" 
              variant="ghost" 
              colorPalette="blue"
              onClick={() => onEdit(item)}
              flex="1"
            >
              <PencilIcon className="w-3 h-3" />
              Editar
            </Button>
            
            <IconButton 
              size="xs" 
              variant="ghost" 
              colorPalette="gray"
              onClick={() => onViewDetails(item)}
            >
              <EyeIcon className="w-3 h-3" />
            </IconButton>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// ✅ Componente principal
export function InventoryPage() {
  // ✅ HOOKS REALES
  const { setQuickActions } = useNavigation();
  const {
    items,
    alerts,
    inventoryStats,
    loading,
    error,
    addItem,
    updateItem,
    hasAlerts,
    hasCriticalAlerts
  } = useInventory();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // ✅ Filtros optimizados con useMemo
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  // ✅ Cálculos de alertas
  const criticalItems = useMemo(() => 
    filteredItems.filter(item => getStockStatus(item.stock, item.type).severity === 'critical'),
    [filteredItems]
  );
  
  const lowStockItems = useMemo(() => 
    filteredItems.filter(item => getStockStatus(item.stock, item.type).severity === 'warning'),
    [filteredItems]
  );

  // ✅ Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'add-item',
        label: 'Nuevo Item',
        icon: CubeIcon,
        action: () => handleAddNewItem(),
        color: 'blue'
      },
      {
        id: 'add-stock',
        label: 'Agregar Stock',
        icon: ChartBarIcon,
        action: () => handleAddStock(),
        color: 'green'
      }
    ];

    if (hasAlerts) {
      quickActions.push({
        id: 'view-alerts',
        label: 'Ver Alertas',
        icon: ExclamationTriangleIcon,
        action: () => handleViewAlerts(),
        color: hasCriticalAlerts ? 'red' : 'orange'
      });
    }

    setQuickActions(quickActions);

    // Cleanup al desmontar
    return () => setQuickActions([]);
  }, [setQuickActions, hasAlerts, hasCriticalAlerts]);

  // Handlers
  const handleAddStock = (item?: InventoryItem) => {
    if (item) {
      console.log('Agregar stock a:', item.name);
      // TODO: Abrir dialog de stock para item específico
    } else {
      console.log('Abrir dialog de stock general');
      // TODO: Abrir dialog de stock general
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemDialog(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    console.log('Ver detalles de:', item.name);
    // TODO: Implementar vista de detalles expandida
  };

  const handleAddNewItem = () => {
    setSelectedItem(null);
    setShowItemDialog(true);
  };

  const handleViewAlerts = () => {
    console.log('Mostrar alertas de stock');
    // TODO: Implementar vista de alertas o scroll a sección de alertas
  };

  // ✅ Handler para cuando se guarda exitosamente
  const handleFormSuccess = () => {
    setShowItemDialog(false);
    setSelectedItem(null);
    // Los datos se actualizan automáticamente vía useInventory
  };

  const handleFormCancel = () => {
    setShowItemDialog(false);
    setSelectedItem(null);
  };

  // ✅ Estados de loading y error
  if (loading) {
    return (
      <Box p="6" maxW="7xl" mx="auto">
        <VStack gap="6" align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="80px" />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="200px" />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6" maxW="7xl" mx="auto">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error al cargar inventario</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* ✅ Header mejorado */}
        <VStack align="start" gap="3">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Inventario</Text>
              <Text color="gray.600">
                Gestión moderna de items con nuevo modelo de tipos
              </Text>
            </VStack>

            <Button 
              colorPalette="blue" 
              onClick={handleAddNewItem}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Nuevo Item
            </Button>
          </HStack>

          {/* ✅ Estadísticas actualizadas */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
            <Card.Root variant="subtle" bg="blue.50">
              <Card.Body p="4" textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {inventoryStats.totalItems}
                </Text>
                <Text fontSize="sm" color="gray.600">Items Total</Text>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg="green.50">
              <Card.Body p="4" textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${inventoryStats.totalValue?.toLocaleString() || '0'}
                </Text>
                <Text fontSize="sm" color="gray.600">Valor Total</Text>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg={lowStockItems.length > 0 ? "yellow.50" : "gray.50"}>
              <Card.Body p="4" textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={lowStockItems.length > 0 ? "yellow.600" : "gray.600"}>
                  {lowStockItems.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Stock Bajo</Text>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg={criticalItems.length > 0 ? "red.50" : "gray.50"}>
              <Card.Body p="4" textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={criticalItems.length > 0 ? "red.600" : "gray.600"}>
                  {criticalItems.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Críticos</Text>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </VStack>

        {/* ✅ Alertas críticas */}
        {criticalItems.length > 0 && (
          <Alert.Root status="error" variant="subtle">
            <Alert.Indicator>
              <ExclamationTriangleIcon className="w-5 h-5" />
            </Alert.Indicator>
            <Alert.Title>Stock crítico detectado</Alert.Title>
            <Alert.Description>
              {criticalItems.length} item{criticalItems.length !== 1 ? 's' : ''} con stock crítico: {criticalItems.map(item => item.name).join(', ')}
            </Alert.Description>
          </Alert.Root>
        )}

        {/* ✅ Filtros actualizados */}
        <HStack gap="4" flexWrap="wrap">
          <Box flex="1" minW="250px">
            <Input
              placeholder="Buscar items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftElement={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            />
          </Box>
          
          <Select.Root
            collection={TYPE_FILTER_COLLECTION}
            value={[typeFilter]}
            onValueChange={(details) => setTypeFilter(details.value[0])}
            width="200px"
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Tipo de item" />
            </Select.Trigger>
            <Select.Content>
              {TYPE_FILTER_COLLECTION.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </HStack>

        {/* ✅ Grid de tarjetas mejoradas */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb="4">
            Items ({filteredItems.length})
          </Text>
          
          {filteredItems.length === 0 ? (
            <Card.Root>
              <Card.Body p="8" textAlign="center">
                <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Text color="gray.600" mb="2">No se encontraron items</Text>
                <Text fontSize="sm" color="gray.500">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Prueba ajustando los filtros' 
                    : 'Comienza agregando tu primer item'}
                </Text>
              </Card.Body>
            </Card.Root>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
              {filteredItems.map(item => (
                <ModernItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onAddStock={handleAddStock}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* ✅ Dialog con formulario real */}
        <Dialog.Root open={showItemDialog} onOpenChange={(e) => setShowItemDialog(e.open)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>
                  {selectedItem ? `Editar: ${selectedItem.name}` : 'Crear Nuevo Item'}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body p="6">
                {/* ✅ COMPONENTE REAL */}
                <UniversalItemForm
                  editItem={selectedItem}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </VStack>
    </Box>
  );
}

// ✅ Exportación adicional para compatibilidad
export default InventoryPage;