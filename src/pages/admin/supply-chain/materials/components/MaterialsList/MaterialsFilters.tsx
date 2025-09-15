import { 
  Section, Stack, Input, Button, SelectField 
} from '@/shared/ui';
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
    <Section variant="flat">
      <Stack gap="md">
        {/* Search and Reset */}
        <Stack direction="row" gap="md">
          <div style={{ flex: 1, position: 'relative' }}>
            <Input
              placeholder="Buscar materiales..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <div 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

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
        </Stack>

        {/* Filters Row */}
        <Stack direction="row" gap="md" wrap="wrap">
          <div style={{ minWidth: '200px' }}>
            <SelectField
              label="Categoría"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => setFilters({ category: value })}
              size="sm"
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <SelectField
              label="Estado de Stock"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => setFilters({ status: value as any })}
              size="sm"
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <SelectField
              label="Ordenar por"
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => setFilters({ sortBy: value as any })}
              size="sm"
            />
          </div>

          <div style={{ minWidth: '140px' }}>
            <SelectField
              label="Orden"
              options={orderOptions}
              value={filters.sortOrder}
              onChange={(value) => setFilters({ sortOrder: value as any })}
              size="sm"
            />
          </div>
        </Stack>
      </Stack>
    </Section>
  );
};