import { 
  SimpleGrid, 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Badge, 
  IconButton,
  Button,
  Box,
  Alert
} from '@chakra-ui/react';
import { 
  PencilIcon, 
  EyeIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '@/hooks/useZustandStores';
import { InventoryItem } from '@/store/inventoryStore';
import { VirtualizedList } from '@/lib/performance/virtualization/VirtualizedList';

interface MaterialsGridProps {
  onEdit: (item: InventoryItem) => void;
  onView: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const getStatusColor = (status: InventoryItem['stock_status']) => {
  switch (status) {
    case 'ok': return 'green';
    case 'low': return 'orange';
    case 'critical': return 'red';
    case 'out': return 'red';
    default: return 'gray';
  }
};

const getStatusLabel = (status: InventoryItem['stock_status']) => {
  switch (status) {
    case 'ok': return 'Stock Normal';
    case 'low': return 'Stock Bajo';
    case 'critical': return 'Stock Crítico';
    case 'out': return 'Sin Stock';
    default: return 'Desconocido';
  }
};

export const MaterialsGrid = ({ onEdit, onView, onDelete }: MaterialsGridProps) => {
  const { getFilteredItems, loading } = useInventory();
  
  const items = getFilteredItems();

  if (loading) {
    return (
      <Box p={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {Array.from({ length: 6 }, (_, i) => (
            <Card.Root key={i} p={4}>
              <VStack gap={3}>
                <Box bg="gray.200" h="4" w="full" borderRadius="md" />
                <Box bg="gray.200" h="3" w="20" borderRadius="md" />
                <Box bg="gray.200" h="3" w="16" borderRadius="md" />
              </VStack>
            </Card.Root>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <VStack gap={4}>
          <CubeIcon className="w-12 h-12 text-gray-400" />
          <VStack gap={2}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">
              No se encontraron materiales
            </Text>
            <Text fontSize="sm" color="gray.500">
              Intenta ajustar los filtros o agregar nuevos materiales
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Use virtualization for large lists (>50 items)
  if (items.length > 50) {
    return (
      <Box p={6} h="calc(100vh - 200px)">
        <VirtualizedList
          items={items}
          itemHeight={280}
          containerHeight={window.innerHeight - 200}
          renderItem={(item, index, style) => (
            <Box px={2} pb={4}>
              <Card.Root p={4} position="relative">
                <VStack align="stretch" gap={3}>
                  {/* Header */}
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" gap={1} flex={1}>
                      <Text fontWeight="semibold" fontSize="md" noOfLines={2}>
                        {item.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                        {item.category}
                      </Text>
                    </VStack>
                    
                    <Badge 
                      colorPalette={getStatusColor(item.stock_status)}
                      size="sm"
                    >
                      {getStatusLabel(item.stock_status)}
                    </Badge>
                  </HStack>

                  {/* Stock Info */}
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Stock Actual:</Text>
                      <Text 
                        fontSize="sm" 
                        fontWeight="semibold"
                        color={item.stock_status === 'ok' ? 'green.600' : 'red.600'}
                      >
                        {item.current_stock} {item.unit}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Stock Mínimo:</Text>
                      <Text fontSize="sm">{item.min_stock} {item.unit}</Text>
                    </HStack>

                    {item.max_stock && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Stock Máximo:</Text>
                        <Text fontSize="sm">{item.max_stock} {item.unit}</Text>
                      </HStack>
                    )}

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Valor Total:</Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        ${item.total_value.toFixed(2)}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Costo Unitario:</Text>
                      <Text fontSize="sm">
                        ${item.cost_per_unit.toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Location */}
                  {item.location && (
                    <HStack>
                      <Text fontSize="xs" color="gray.500">
                        📍 {item.location}
                      </Text>
                    </HStack>
                  )}

                  {/* Alerts for critical items */}
                  {(item.stock_status === 'critical' || item.stock_status === 'out') && (
                    <Alert.Root status="error" size="sm">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title fontSize="xs">
                          {item.stock_status === 'out' 
                            ? 'Sin stock disponible' 
                            : 'Stock crítico'
                          }
                        </Alert.Title>
                      </Alert.Content>
                    </Alert.Root>
                  )}

                  {/* Actions */}
                  <HStack gap={2} pt={2} borderTopWidth={1} borderColor="gray.100">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onView(item)}
                      flex={1}
                    >
                      <EyeIcon className="w-3 h-3" />
                      Ver
                    </Button>
                    
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      flex={1}
                    >
                      <PencilIcon className="w-3 h-3" />
                      Editar
                    </Button>

                    <IconButton
                      size="xs"
                      variant="outline"
                      colorPalette="red"
                      onClick={() => onDelete(item)}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </IconButton>
                  </HStack>
                </VStack>
              </Card.Root>
            </Box>
          )}
          overscan={5}
          hasMore={false}
          loading={false}
        />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
        {items.map((item) => (
          <Card.Root key={item.id} p={4} position="relative">
            <VStack align="stretch" gap={3}>
              {/* Header */}
              <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" gap={1} flex={1}>
                  <Text fontWeight="semibold" fontSize="md" noOfLines={2}>
                    {item.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                    {item.category}
                  </Text>
                </VStack>
                
                <Badge 
                  colorPalette={getStatusColor(item.stock_status)}
                  size="sm"
                >
                  {getStatusLabel(item.stock_status)}
                </Badge>
              </HStack>

              {/* Stock Info */}
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Stock Actual:</Text>
                  <Text 
                    fontSize="sm" 
                    fontWeight="semibold"
                    color={item.stock_status === 'ok' ? 'green.600' : 'red.600'}
                  >
                    {item.current_stock} {item.unit}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Stock Mínimo:</Text>
                  <Text fontSize="sm">{item.min_stock} {item.unit}</Text>
                </HStack>

                {item.max_stock && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Stock Máximo:</Text>
                    <Text fontSize="sm">{item.max_stock} {item.unit}</Text>
                  </HStack>
                )}

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Valor Total:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    ${item.total_value.toFixed(2)}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Costo Unitario:</Text>
                  <Text fontSize="sm">
                    ${item.cost_per_unit.toFixed(2)}
                  </Text>
                </HStack>
              </VStack>

              {/* Location */}
              {item.location && (
                <HStack>
                  <Text fontSize="xs" color="gray.500">
                    📍 {item.location}
                  </Text>
                </HStack>
              )}

              {/* Alerts for critical items */}
              {(item.stock_status === 'critical' || item.stock_status === 'out') && (
                <Alert.Root status="error" size="sm">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title fontSize="xs">
                      {item.stock_status === 'out' 
                        ? 'Sin stock disponible' 
                        : 'Stock crítico'
                      }
                    </Alert.Title>
                  </Alert.Content>
                </Alert.Root>
              )}

              {/* Actions */}
              <HStack gap={2} pt={2} borderTopWidth={1} borderColor="gray.100">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onView(item)}
                  flex={1}
                >
                  <EyeIcon className="w-3 h-3" />
                  Ver
                </Button>
                
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  flex={1}
                >
                  <PencilIcon className="w-3 h-3" />
                  Editar
                </Button>

                <IconButton
                  size="xs"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(item)}
                >
                  <TrashIcon className="w-3 h-3" />
                </IconButton>
              </HStack>
            </VStack>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
};