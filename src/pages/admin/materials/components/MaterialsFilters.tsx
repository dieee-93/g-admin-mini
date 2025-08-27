import { 
  Box, 
  HStack, 
  VStack, 
  Input, 
  Button, 
  Text
} from '@chakra-ui/react';
import { SelectField } from '@/shared/ui';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMaterials } from '@/hooks/useZustandStores';

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'ok', label: 'Stock Normal' },
  { value: 'low', label: 'Stock Bajo' },
  { value: 'critical', label: 'Stock Crítico' },
  { value: 'out', label: 'Sin Stock' }
];

const sortOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'stock', label: 'Cantidad' },
  { value: 'value', label: 'Valor' },
  { value: 'updated', label: 'Actualizado' }
];

const orderOptions = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' }
];

export const MaterialsFilters = () => {
  const { 
    filters, 
    categories, 
    setFilters, 
    resetFilters 
  } = useMaterials();

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

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
            <SelectField
              label="Categoría"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => setFilters({ category: value })}
              size="sm"
            />
          </Box>

          <Box minW="180px">
            <SelectField
              label="Estado de Stock"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => setFilters({ status: value as any })}
              size="sm"
            />
          </Box>

          <Box minW="150px">
            <SelectField
              label="Ordenar por"
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => setFilters({ sortBy: value as any })}
              size="sm"
            />
          </Box>

          <Box minW="140px">
            <SelectField
              label="Orden"
              options={orderOptions}
              value={filters.sortOrder}
              onChange={(value) => setFilters({ sortOrder: value as any })}
              size="sm"
            />
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};