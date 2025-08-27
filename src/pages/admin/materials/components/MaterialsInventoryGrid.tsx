// MaterialsInventoryGrid.tsx - Virtualized inventory grid with smart filtering
import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  createListCollection,
  Card,
  SimpleGrid,
  Alert,
  Badge,
  Button,
  IconButton
} from '@chakra-ui/react';
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  ScaleIcon,
  HashtagIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { type InventoryItem } from '../types';
import { VirtualizedList } from '@/lib/performance';

interface MaterialsInventoryGridProps {
  items: InventoryItem[];
  searchTerm: string;
  typeFilter: string;
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (type: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}

const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Conmensurables', value: 'MEASURABLE' },
    { label: 'Contables', value: 'COUNTABLE' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

export function MaterialsInventoryGrid({
  items,
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onEditItem,
  onAddStock,
  onViewDetails
}: MaterialsInventoryGridProps) {
  // Filter items with memoization for performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  const criticalItems = useMemo(() => 
    filteredItems.filter(item => getStockStatus(item.stock, item.type).severity === 'critical'),
    [filteredItems]
  );

  const getStockStatus = (stock: number, type: string) => {
    if (stock <= 0) return { color: 'red', label: 'Sin stock', severity: 'critical' };
    
    const threshold = type === 'ELABORATED' ? 5 : type === 'MEASURABLE' ? 3 : 20;
    const criticalThreshold = threshold / 2;
    
    if (stock <= criticalThreshold) return { color: 'red', label: 'Crítico', severity: 'critical' };
    if (stock <= threshold) return { color: 'yellow', label: 'Bajo', severity: 'warning' };
    return { color: 'green', label: 'Disponible', severity: 'ok' };
  };

  const formatQuantity = (quantity: number, unit: string, item: InventoryItem): string => {
    if (item.type === 'MEASURABLE') {
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
    
    if (item.type === 'COUNTABLE' && item.packaging) {
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

  const renderItem = ({ item, index }: { item: InventoryItem; index: number }) => (
    <ModernItemCard
      key={item.id}
      item={item}
      onEdit={onEditItem}
      onAddStock={onAddStock}
      onViewDetails={onViewDetails}
      formatQuantity={formatQuantity}
      getStockStatus={getStockStatus}
      getTypeIcon={getTypeIcon}
      getTypeColor={getTypeColor}
    />
  );

  return (
    <VStack gap="6" align="stretch">
      {/* Critical alerts */}
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

      {/* Filters */}
      <HStack gap="4" flexWrap="wrap">
        <Box flex="1" minW="250px">
          <Input
            placeholder="Buscar items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftElement={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
          />
        </Box>
        
        <Select.Root
          collection={TYPE_FILTER_COLLECTION}
          value={[typeFilter]}
          onValueChange={(details) => onTypeFilterChange(details.value[0])}
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

      {/* Items Grid */}
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
          <VirtualizedList
            items={filteredItems}
            itemHeight={180}
            renderItem={renderItem}
            containerHeight={600}
            overscan={5}
            className="inventory-grid"
          />
        )}
      </Box>
    </VStack>
  );
}

// Separate component for better performance with memoization
const ModernItemCard = React.memo(({ 
  item, 
  onEdit, 
  onAddStock, 
  onViewDetails,
  formatQuantity,
  getStockStatus,
  getTypeIcon,
  getTypeColor
}: {
  item: InventoryItem & { syncStatus?: string; isOfflineItem?: boolean; localModifications?: any[] };
  onEdit: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
  formatQuantity: (quantity: number, unit: string, item: InventoryItem) => string;
  getStockStatus: (stock: number, type: string) => { color: string; label: string; severity: string };
  getTypeIcon: (type: string) => any;
  getTypeColor: (type: string) => string;
}) => {
  const TypeIcon = getTypeIcon(item.type);
  const stockStatus = getStockStatus(item.stock, item.type);
  const typeColor = getTypeColor(item.type);
  
  return (
    <Card.Root 
      variant="outline"
      bg={stockStatus.severity === 'critical' ? 'red.50' : 
          stockStatus.severity === 'warning' ? 'yellow.50' : 
          item.isOfflineItem ? 'blue.50' : 'white'}
      borderColor={stockStatus.severity === 'critical' ? 'red.200' : 
                  stockStatus.severity === 'warning' ? 'yellow.200' : 
                  item.isOfflineItem ? 'blue.200' : 'gray.200'}
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-2px)', 
        shadow: 'md',
        borderColor: typeColor === 'blue' ? 'blue.300' : 
                    typeColor === 'green' ? 'green.300' : 'purple.300'
      }}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3">
          <HStack justify="space-between" align="start">
            <HStack gap="2" flex="1">
              <Box p="1" bg={`${typeColor}.100`} borderRadius="md">
                <TypeIcon className={`w-4 h-4 text-${typeColor}-600`} />
              </Box>
              <VStack align="start" gap="0" flex="1">
                <HStack>
                  <Text fontWeight="bold" lineHeight="1.2" fontSize="sm">
                    {item.name}
                  </Text>
                  {item.isOfflineItem && (
                    <Badge colorScheme="blue" size="xs">
                      OFFLINE
                    </Badge>
                  )}
                  {item.syncStatus === 'modified' && (
                    <Badge colorScheme="yellow" size="xs">
                      MODIFIED
                    </Badge>
                  )}
                </HStack>
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
            
            <Text fontSize="lg" fontWeight="bold" color={
              stockStatus.color === 'red' ? 'red.600' : 
              stockStatus.color === 'yellow' ? 'yellow.600' : 'gray.800'
            }>
              {formatQuantity(item.stock, item.unit, item)}
            </Text>
            
            {item.unit_cost && (
              <Text fontSize="xs" color="gray.500">
                ${item.unit_cost.toFixed(2)} por {item.unit}
              </Text>
            )}
          </VStack>

          {/* Local modifications indicator */}
          {item.localModifications && item.localModifications.length > 0 && (
            <Badge colorScheme="blue" size="xs">
              {item.localModifications.length} local changes
            </Badge>
          )}

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
});

ModernItemCard.displayName = 'ModernItemCard';

export default MaterialsInventoryGrid;