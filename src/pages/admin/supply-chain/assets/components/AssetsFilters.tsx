/**
 * ASSETS FILTERS COMPONENT
 * Filter panel using shared UI components
 */

import { Stack, InputField, SelectField, Button } from '@/shared/ui';
import type { AssetFilters } from '../types';

interface AssetsFiltersProps {
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
  onClear: () => void;
}

export function AssetsFilters({ filters, onChange, onClear }: AssetsFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value || undefined });
  };

  const handleStatusChange = (details: { value: string[] }) => {
    const statusValue = details.value[0];
    onChange({
      ...filters,
      status: statusValue ? [statusValue as any] : undefined,
    });
  };

  const handleCategoryChange = (details: { value: string[] }) => {
    const categoryValue = details.value[0];
    onChange({
      ...filters,
      category: categoryValue ? [categoryValue as any] : undefined,
    });
  };

  const handleRentableChange = (details: { value: string[] }) => {
    const rentableValue = details.value[0];
    onChange({
      ...filters,
      is_rentable: rentableValue === 'true' ? true : rentableValue === 'false' ? false : undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status?.length ||
    filters.category?.length ||
    filters.is_rentable !== undefined;

  return (
    <Stack gap={3}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <InputField
          label="Buscar"
          placeholder="Buscar por nombre, código..."
          value={filters.search || ''}
          onChange={handleSearchChange}
        />

        <SelectField
          label="Estado"
          options={[
            { value: '', label: 'Todos' },
            { value: 'available', label: 'Disponible' },
            { value: 'in_use', label: 'En Uso' },
            { value: 'maintenance', label: 'Mantenimiento' },
            { value: 'rented', label: 'Alquilado' },
            { value: 'retired', label: 'Retirado' },
          ]}
          value={filters.status?.[0] ? [filters.status[0]] : ['']}
          onValueChange={handleStatusChange}
          size="sm"
          noPortal
        />

        <SelectField
          label="Categoría"
          options={[
            { value: '', label: 'Todas' },
            { value: 'equipment', label: 'Equipamiento' },
            { value: 'vehicle', label: 'Vehículo' },
            { value: 'tool', label: 'Herramienta' },
            { value: 'furniture', label: 'Mobiliario' },
            { value: 'electronics', label: 'Electrónica' },
          ]}
          value={filters.category?.[0] ? [filters.category[0]] : ['']}
          onValueChange={handleCategoryChange}
          size="sm"
          noPortal
        />

        <SelectField
          label="Alquilable"
          options={[
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ]}
          value={[
            filters.is_rentable === true
              ? 'true'
              : filters.is_rentable === false
                ? 'false'
                : ''
          ]}
          onValueChange={handleRentableChange}
          size="sm"
          noPortal
        />

        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="outline" onClick={onClear} size="sm">
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
    </Stack>
  );
}
