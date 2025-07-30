import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Input,
  Select,
  createListCollection,
  SimpleGrid,
  Table,
  Card,
  Badge,
  Tabs
} from '@chakra-ui/react';
// Iconos SVG inline siguiendo la convención del proyecto
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.518 6.518 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const ChefHatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 11.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 0c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm6.5-5c1.66 0 3 1.34 3 3v1h2c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h2v-1c0-1.66 1.34-3 3-3zm1 4v-1c0-.55-.45-1-1-1s-1 .45-1 1v1h2z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);
import { ItemCard } from './ItemCard';

// Types
interface Item {
  id: string;
  name: string;
  type: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  unit: string;
  stock: number;
  unit_cost?: number;
  created_at?: string;
}

type ViewMode = 'cards' | 'table';
type QuickActionType = 'add_stock' | 'use_in_recipe' | 'view_details' | 'create_product' | 'edit';

interface EnhancedItemListProps {
  items: Item[];
  loading?: boolean;
  onQuickAction: (action: QuickActionType, itemId: string, item?: Item) => void;
  onAddItem?: () => void;
}

// Collections para filtros
const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Unidades', value: 'UNIT' },
    { label: 'Peso', value: 'WEIGHT' },
    { label: 'Volumen', value: 'VOLUME' },
    { label: 'Elaborado', value: 'ELABORATED' },
  ],
});

const STOCK_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todo el stock', value: 'all' },
    { label: 'Con stock', value: 'with_stock' },
    { label: 'Sin stock', value: 'no_stock' },
    { label: 'Stock bajo (≤10)', value: 'low_stock' },
  ],
});

// Mapeo de tipos
const TYPE_LABELS = {
  UNIT: 'Unidades',
  WEIGHT: 'Peso',
  VOLUME: 'Volumen',
  ELABORATED: 'Elaborado'
} as const;

const TYPE_COLORS = {
  UNIT: 'blue',
  WEIGHT: 'green', 
  VOLUME: 'purple',
  ELABORATED: 'orange'
} as const;

export function EnhancedItemList({ items, loading = false, onQuickAction, onAddItem }: EnhancedItemListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Filtrar items
  const filteredItems = items.filter(item => {
    // Filtro de búsqueda
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de tipo
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    // Filtro de stock
    let matchesStock = true;
    if (stockFilter === 'with_stock') matchesStock = item.stock > 0;
    else if (stockFilter === 'no_stock') matchesStock = item.stock <= 0;
    else if (stockFilter === 'low_stock') matchesStock = item.stock > 0 && item.stock <= 10;
    
    return matchesSearch && matchesType && matchesStock;
  });

  const handleTypeFilterChange = (details: { value: string[] }) => {
    setTypeFilter(details.value[0] || 'all');
  };

  const handleStockFilterChange = (details: { value: string[] }) => {
    setStockFilter(details.value[0] || 'all');
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: 'red', label: 'Sin stock' };
    if (stock <= 10) return { color: 'yellow', label: 'Stock bajo' };
    return { color: 'green', label: 'Disponible' };
  };

  // Vista de tabla
  const TableView = () => (
    <Table.Root size="sm" variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Nombre</Table.ColumnHeader>
          <Table.ColumnHeader>Tipo</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Stock</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Costo/Unidad</Table.ColumnHeader>
          <Table.ColumnHeader>Estado</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.stock);
          return (
            <Table.Row key={item.id}>
              <Table.Cell>
                <VStack align="flex-start" gap="1">
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text fontSize="sm" color="gray.500">{item.unit}</Text>
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={TYPE_COLORS[item.type]} size="sm">
                  {TYPE_LABELS[item.type]}
                </Badge>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Text fontWeight="medium">{item.stock} {item.unit}</Text>
              </Table.Cell>
              <Table.Cell textAlign="right">
                {item.unit_cost ? (
                  <Text color="green.600">${item.unit_cost.toFixed(2)}</Text>
                ) : (
                  <Text color="gray.400">-</Text>
                )}
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={stockStatus.color} size="sm">
                  {stockStatus.label}
                </Badge>
              </Table.Cell>
              <Table.Cell textAlign="center">
                <HStack gap="1" justify="center">
                  <IconButton
                    aria-label="Agregar stock"
                    size="sm"
                    variant="ghost"
                    colorPalette="green"
                    onClick={() => onQuickAction('add_stock', item.id, item)}
                  >
                    <PlusIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Usar en receta"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={() => onQuickAction('use_in_recipe', item.id, item)}
                  >
                    <ChefHatIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Editar"
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={() => onQuickAction('edit', item.id, item)}
                  >
                    <EditIcon />
                  </IconButton>
                </HStack>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );

  if (loading) {
    return (
      <VStack gap="4" p={4}>
        <Text>Cargando items...</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="6">
      {/* Header con controles */}
      <Card.Root>
        <Card.Body p={4}>
          <VStack align="stretch" gap="4">
            {/* Título y botón agregar */}
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  📦 Gestión de Items
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {filteredItems.length} de {items.length} items mostrados
                </Text>
              </VStack>
              
              {onAddItem && (
                <Button colorPalette="blue" onClick={onAddItem}>
                  <PlusIcon />
                  Nuevo Item
                </Button>
              )}
            </HStack>

            {/* Filtros y búsqueda */}
            <HStack gap="4" wrap="wrap">
              {/* Búsqueda */}
              <Box flex="1" minW="250px">
                <Input
                  placeholder="Buscar items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startElement={<SearchIcon />}
                />
              </Box>

              {/* Filtro por tipo */}
              <Box minW="140px">
                <Select.Root
                  collection={TYPE_FILTER_COLLECTION}
                  value={typeFilter ? [typeFilter] : []}
                  onValueChange={handleTypeFilterChange}
                  size="sm"
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Tipo" />
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

              {/* Filtro por stock */}
              <Box minW="140px">
                <Select.Root
                  collection={STOCK_FILTER_COLLECTION}
                  value={stockFilter ? [stockFilter] : []}
                  onValueChange={handleStockFilterChange}
                  size="sm"
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Stock" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {STOCK_FILTER_COLLECTION.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>

              {/* Toggle de vista */}
              <HStack gap="1" bg="gray.100" p="1" rounded="md">
                <IconButton
                  aria-label="Vista en cards"
                  size="sm"
                  variant={viewMode === 'cards' ? 'solid' : 'ghost'}
                  colorPalette={viewMode === 'cards' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('cards')}
                >
                  <GridIcon />
                </IconButton>
                <IconButton
                  aria-label="Vista en tabla"
                  size="sm"
                  variant={viewMode === 'table' ? 'solid' : 'ghost'}
                  colorPalette={viewMode === 'table' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('table')}
                >
                  <ListIcon />
                </IconButton>
              </HStack>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Contenido principal */}
      {filteredItems.length === 0 ? (
        <Card.Root>
          <Card.Body py={8} textAlign="center">
            <VStack gap="3">
              <Text fontSize="lg" color="gray.500">
                📭 No se encontraron items
              </Text>
              <Text fontSize="sm" color="gray.400">
                {items.length === 0 
                  ? "Agrega tu primer item para comenzar"
                  : "Intenta ajustar los filtros de búsqueda"
                }
              </Text>
              {onAddItem && items.length === 0 && (
                <Button colorPalette="blue" onClick={onAddItem} mt={2}>
                  <PlusIcon />
                  Agregar Primer Item
                </Button>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <Box>
          {viewMode === 'cards' ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onQuickAction={(action, itemId) => onQuickAction(action, itemId, item)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Card.Root>
              <Card.Body p={0}>
                <TableView />
              </Card.Body>
            </Card.Root>
          )}
        </Box>
      )}

      {/* Resumen */}
      {filteredItems.length > 0 && (
        <Card.Root bg="blue.50" borderColor="blue.200">
          <Card.Body p={4}>
            <HStack justify="space-between" wrap="wrap" gap="4">
              <VStack align="flex-start" gap="1">
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  📊 Resumen de Inventario
                </Text>
                <Text fontSize="sm" color="blue.700">
                  Total items: {filteredItems.length} | Con stock: {filteredItems.filter(i => i.stock > 0).length} | 
                  Sin stock: {filteredItems.filter(i => i.stock <= 0).length}
                </Text>
              </VStack>
              
              {filteredItems.some(i => i.unit_cost) && (
                <VStack align="flex-end" gap="1">
                  <Text fontSize="sm" fontWeight="medium" color="green.700">
                    💰 Valor Total
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="green.800">
                    ${filteredItems
                      .filter(i => i.unit_cost)
                      .reduce((total, item) => total + (item.stock * (item.unit_cost || 0)), 0)
                      .toFixed(2)}
                  </Text>
                </VStack>
              )}
            </HStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}

// Demo con datos de ejemplo
export default function EnhancedItemListDemo() {
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: 'Harina 000',
      type: 'WEIGHT',
      unit: 'kg',
      stock: 25.5,
      unit_cost: 120.50,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Aceite de Girasol',
      type: 'VOLUME',
      unit: 'litros',
      stock: 8.2,
      unit_cost: 85.00,
      created_at: '2024-01-20T14:45:00Z'
    },
    {
      id: '3',
      name: 'Empanadas de Carne',
      type: 'ELABORATED',
      unit: 'unidades',
      stock: 0,
      unit_cost: 15.75,
      created_at: '2024-01-22T09:15:00Z'
    },
    {
      id: '4',
      name: 'Servilletas',
      type: 'UNIT',
      unit: 'paquetes',
      stock: 45,
      unit_cost: 12.00,
      created_at: '2024-01-18T16:20:00Z'
    },
    {
      id: '5',
      name: 'Huevos',
      type: 'UNIT',
      unit: 'docenas',
      stock: 12,
      unit_cost: 45.00,
      created_at: '2024-01-25T08:00:00Z'
    },
    {
      id: '6',
      name: 'Leche',
      type: 'VOLUME',
      unit: 'litros',
      stock: 5,
      unit_cost: 65.00,
      created_at: '2024-01-26T09:30:00Z'
    }
  ]);

  const handleQuickAction = (action: QuickActionType, itemId: string, item?: Item) => {
    const actionMessages = {
      add_stock: `🔼 Agregar stock para "${item?.name}"`,
      use_in_recipe: `🧪 Usar "${item?.name}" en receta`,
      view_details: `📋 Ver detalles de "${item?.name}"`,
      create_product: `🏷️ Crear producto con "${item?.name}"`,
      edit: `✏️ Editar "${item?.name}"`
    };

    alert(`${actionMessages[action]}\nID: ${itemId}`);
  };

  const handleAddItem = () => {
    alert('🆕 Abrir formulario para agregar nuevo item');
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <EnhancedItemList
        items={items}
        onQuickAction={handleQuickAction}
        onAddItem={handleAddItem}
      />
    </Box>
  );
}