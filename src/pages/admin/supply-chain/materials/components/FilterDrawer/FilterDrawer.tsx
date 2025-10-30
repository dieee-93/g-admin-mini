import { Stack, Typography, Button, Icon, Checkbox, Badge } from '@/shared/ui';
import { Drawer } from '@/shared/ui';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Slider } from '@chakra-ui/react';
import type { ItemType } from '../../types';
import { formatCurrency } from '@/business-logic/shared/decimalUtils';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;

  // Type filters
  selectedTypes: ItemType[];
  onTypeToggle: (type: ItemType) => void;

  // Price range
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;

  // Supplier filters
  selectedSuppliers: string[];
  onSupplierToggle: (supplierId: string) => void;
  suppliers?: Array<{ id: string; name: string }>;

  // Stock status
  showOutOfStock: boolean;
  showLowStock: boolean;
  showCritical: boolean;
  onToggleOutOfStock: (value: boolean) => void;
  onToggleLowStock: (value: boolean) => void;
  onToggleCritical: (value: boolean) => void;

  // ABC Classification
  selectedABCClasses: string[];
  onABCToggle: (abcClass: string) => void;

  // Actions
  onApply: () => void;
  onClear: () => void;

  // State
  activeFiltersCount?: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  selectedTypes,
  onTypeToggle,
  priceRange,
  onPriceRangeChange,
  maxPrice = 10000,
  selectedSuppliers,
  onSupplierToggle,
  suppliers = [],
  showOutOfStock,
  showLowStock,
  showCritical,
  onToggleOutOfStock,
  onToggleLowStock,
  onToggleCritical,
  selectedABCClasses,
  onABCToggle,
  onApply,
  onClear,
  activeFiltersCount = 0
}: FilterDrawerProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="end">
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          {/* Header */}
          <Drawer.Header>
            <Stack direction="row" align="center" justify="space-between" width="100%">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={FunnelIcon} size="md" />
                <Typography variant="heading" size="lg">
                  Filtros Avanzados
                </Typography>
                {activeFiltersCount > 0 && (
                  <Badge colorPalette="blue" size="sm">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Stack>
              <Drawer.CloseTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Icon icon={XMarkIcon} size="md" />
                </Button>
              </Drawer.CloseTrigger>
            </Stack>
          </Drawer.Header>

          {/* Body */}
          <Drawer.Body>
            <Stack direction="column" gap="xl">
              {/* Type Filters */}
              <Stack direction="column" gap="md">
                <Typography variant="heading" size="sm">
                  Tipo de Material
                </Typography>
                <Stack direction="column" gap="sm">
                  <Checkbox
                    checked={selectedTypes.includes('MEASURABLE')}
                    onChange={(e) => onTypeToggle('MEASURABLE')}
                  >
                    Medibles (kg, L, m)
                  </Checkbox>
                  <Checkbox
                    checked={selectedTypes.includes('COUNTABLE')}
                    onChange={(e) => onTypeToggle('COUNTABLE')}
                  >
                    Contables (unidades, paquetes)
                  </Checkbox>
                  <Checkbox
                    checked={selectedTypes.includes('ELABORATED')}
                    onChange={(e) => onTypeToggle('ELABORATED')}
                  >
                    Elaborados (recetas)
                  </Checkbox>
                </Stack>
              </Stack>

              {/* Price Range */}
              <Stack direction="column" gap="md">
                <Stack direction="row" justify="space-between" align="center">
                  <Typography variant="heading" size="sm">
                    Rango de Precio
                  </Typography>
                  <Typography variant="body" size="sm" color="gray.600">
                    {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  </Typography>
                </Stack>
                <Slider.Root
                  min={0}
                  max={maxPrice}
                  value={priceRange}
                  onValueChange={({ value }) => onPriceRangeChange(value as [number, number])}
                  minStepsBetweenThumbs={100}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                    <Slider.Thumb index={1} />
                  </Slider.Control>
                </Slider.Root>
              </Stack>

              {/* Stock Status */}
              <Stack direction="column" gap="md">
                <Typography variant="heading" size="sm">
                  Estado de Stock
                </Typography>
                <Stack direction="column" gap="sm">
                  <Checkbox
                    checked={showCritical}
                    onChange={(e) => onToggleCritical(e.target.checked)}
                  >
                    <Stack direction="row" align="center" gap="xs">
                      Crítico
                      <Badge size="xs" colorPalette="red">Alta prioridad</Badge>
                    </Stack>
                  </Checkbox>
                  <Checkbox
                    checked={showLowStock}
                    onChange={(e) => onToggleLowStock(e.target.checked)}
                  >
                    Stock Bajo
                  </Checkbox>
                  <Checkbox
                    checked={showOutOfStock}
                    onChange={(e) => onToggleOutOfStock(e.target.checked)}
                  >
                    Agotado
                  </Checkbox>
                </Stack>
              </Stack>

              {/* ABC Classification */}
              <Stack direction="column" gap="md">
                <Typography variant="heading" size="sm">
                  Clasificación ABC
                </Typography>
                <Stack direction="column" gap="sm">
                  <Checkbox
                    checked={selectedABCClasses.includes('A')}
                    onChange={() => onABCToggle('A')}
                  >
                    <Stack direction="row" align="center" gap="xs">
                      Clase A
                      <Badge size="xs" colorPalette="red">Alto valor</Badge>
                    </Stack>
                  </Checkbox>
                  <Checkbox
                    checked={selectedABCClasses.includes('B')}
                    onChange={() => onABCToggle('B')}
                  >
                    <Stack direction="row" align="center" gap="xs">
                      Clase B
                      <Badge size="xs" colorPalette="yellow">Valor medio</Badge>
                    </Stack>
                  </Checkbox>
                  <Checkbox
                    checked={selectedABCClasses.includes('C')}
                    onChange={() => onABCToggle('C')}
                  >
                    <Stack direction="row" align="center" gap="xs">
                      Clase C
                      <Badge size="xs" colorPalette="green">Bajo valor</Badge>
                    </Stack>
                  </Checkbox>
                </Stack>
              </Stack>

              {/* Suppliers */}
              {suppliers.length > 0 && (
                <Stack direction="column" gap="md">
                  <Typography variant="heading" size="sm">
                    Proveedores
                  </Typography>
                  <Stack direction="column" gap="sm" maxH="200px" overflowY="auto">
                    {suppliers.map(supplier => (
                      <Checkbox
                        key={supplier.id}
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => onSupplierToggle(supplier.id)}
                      >
                        {supplier.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Drawer.Body>

          {/* Footer */}
          <Drawer.Footer>
            <Stack direction="row" gap="md" width="100%">
              <Button
                flex="1"
                variant="outline"
                onClick={onClear}
              >
                Limpiar Filtros
              </Button>
              <Button
                flex="1"
                variant="solid"
                colorPalette="blue"
                onClick={() => {
                  onApply();
                  onClose();
                }}
              >
                Aplicar Filtros
              </Button>
            </Stack>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
