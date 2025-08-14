import { 
  Box, 
  HStack, 
  VStack, 
  Input, 
  Select, 
  Button, 
  Text,
  createListCollection
} from '@chakra-ui/react';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMaterials } from '@/hooks/useZustandStores';

const statusOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todos los estados' },
    { value: 'ok', label: 'Stock Normal' },
    { value: 'low', label: 'Stock Bajo' },
    { value: 'critical', label: 'Stock Crítico' },
    { value: 'out', label: 'Sin Stock' }
  ]
});

const sortOptions = createListCollection({
  items: [
    { value: 'name', label: 'Nombre' },
    { value: 'stock', label: 'Cantidad' },
    { value: 'value', label: 'Valor' },
    { value: 'updated', label: 'Actualizado' }
  ]
});

const orderOptions = createListCollection({
  items: [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ]
});

export const MaterialsFilters = () => {
  const { 
    filters, 
    categories, 
    setFilters, 
    resetFilters 
  } = useMaterials();

  const categoryOptions = createListCollection({
    items: [
      { value: 'all', label: 'Todas las categorías' },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ]
  });

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.category !== 'all' || 
    filters.status !== 'all' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  return (
    <Box p={4} bg="gray.50" borderBottomWidth={1}>
      <VStack gap={4}>
        {/* Search and Reset */}
        <HStack w="full" gap={4}>
          <Box flex={1} position="relative">
            <Input
              placeholder="Buscar materiales..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              bg="white"
            />
            <Box 
              position="absolute" 
              right={3} 
              top="50%" 
              transform="translateY(-50%)"
              pointerEvents="none"
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </Box>
          </Box>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <XMarkIcon className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </HStack>

        {/* Filters Row */}
        <HStack w="full" gap={4} wrap="wrap">
          <Box minW="200px">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Categoría
            </Text>
            <Select.Root
              collection={categoryOptions}
              value={[filters.category]}
              onValueChange={(e) => setFilters({ category: e.value[0] })}
              size="sm"
            >
              <Select.Trigger bg="white">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {categoryOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box minW="180px">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Estado de Stock
            </Text>
            <Select.Root
              collection={statusOptions}
              value={[filters.status]}
              onValueChange={(e) => setFilters({ status: e.value[0] as any })}
              size="sm"
            >
              <Select.Trigger bg="white">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {statusOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box minW="150px">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Ordenar por
            </Text>
            <Select.Root
              collection={sortOptions}
              value={[filters.sortBy]}
              onValueChange={(e) => setFilters({ sortBy: e.value[0] as any })}
              size="sm"
            >
              <Select.Trigger bg="white">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {sortOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box minW="140px">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Orden
            </Text>
            <Select.Root
              collection={orderOptions}
              value={[filters.sortOrder]}
              onValueChange={(e) => setFilters({ sortOrder: e.value[0] as any })}
              size="sm"
            >
              <Select.Trigger bg="white">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {orderOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};