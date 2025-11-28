import { memo } from 'react';
import { Stack, Button, Icon, InputField, Badge } from '@/shared/ui';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/shared/ui';
import type { ItemType } from '../../types';

interface MaterialsToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Filters
  selectedType: 'all' | ItemType;
  onTypeChange: (type: 'all' | ItemType) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out';
  onStockStatusChange: (status: 'all' | 'ok' | 'low' | 'critical' | 'out') => void;

  // View mode
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;

  // Actions
  onAddMaterial?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onOpenFilters?: () => void;

  // State
  activeFiltersCount?: number;
  categories?: string[];
  disabled?: boolean;
}

export const MaterialsToolbar = memo(function MaterialsToolbar({
  searchValue,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  selectedStockStatus,
  onStockStatusChange,
  viewMode,
  onViewModeChange,
  onAddMaterial,
  onImport,
  onExport,
  onOpenFilters,
  activeFiltersCount = 0,
  categories = ['Todos', 'Lácteos', 'Carnes', 'Verduras', 'Frutas', 'Condimentos', 'Bebidas'],
  disabled = false
}: MaterialsToolbarProps) {
  return (
    <Stack
      direction="column"
      gap="md"
      bg="white"
      p="md"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      {/* Top Row: Search + Primary Actions */}
      <Stack direction="row" gap="md" align="center" wrap="wrap">
        {/* Search Input */}
        <InputField
          placeholder="Buscar materiales..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          leftElement={<Icon icon={MagnifyingGlassIcon} size="sm" color="gray.400" />}
          flex="1"
          minW="250px"
          disabled={disabled}
        />

        {/* View Toggle */}
        <Stack direction="row" gap="xs">
          <Button
            size="md"
            variant={viewMode === 'table' ? 'solid' : 'outline'}
            onClick={() => onViewModeChange('table')}
            disabled={disabled}
          >
            <Icon icon={TableCellsIcon} size="sm" />
          </Button>
          <Button
            size="md"
            variant={viewMode === 'cards' ? 'solid' : 'outline'}
            onClick={() => onViewModeChange('cards')}
            disabled={disabled}
          >
            <Icon icon={Squares2X2Icon} size="sm" />
          </Button>
        </Stack>

        {/* Primary Actions */}
        <Button
          size="md"
          variant="solid"
          colorPalette="blue"
          onClick={onAddMaterial}
          disabled={disabled || !onAddMaterial}
        >
          <Icon icon={PlusIcon} size="sm" />
          Nuevo Material
        </Button>

        <Button
          size="md"
          variant="outline"
          onClick={onImport}
          disabled={disabled || !onImport}
        >
          <Icon icon={ArrowDownTrayIcon} size="sm" />
          Importar
        </Button>

        <Button
          size="md"
          variant="outline"
          onClick={onExport}
          disabled={disabled || !onExport}
        >
          <Icon icon={ArrowUpTrayIcon} size="sm" />
          Exportar
        </Button>
      </Stack>

      {/* Bottom Row: Quick Filters */}
      <Stack direction="row" gap="md" align="center" wrap="wrap">
        {/* Type Filter */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={disabled}>
              Tipo: {selectedType === 'all' ? 'Todos' : selectedType}
              {selectedType !== 'all' && (
                <Badge size="xs" colorPalette="blue" ml="xs">1</Badge>
              )}
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="all" onClick={() => onTypeChange('all')}>
              Todos
            </MenuItem>
            <MenuItem value="MEASURABLE" onClick={() => onTypeChange('MEASURABLE')}>
              Medibles
            </MenuItem>
            <MenuItem value="COUNTABLE" onClick={() => onTypeChange('COUNTABLE')}>
              Contables
            </MenuItem>
            <MenuItem value="ELABORATED" onClick={() => onTypeChange('ELABORATED')}>
              Elaborados
            </MenuItem>
          </MenuContent>
        </MenuRoot>

        {/* Category Filter */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={disabled}>
              Categoría: {selectedCategory === 'all' ? 'Todas' : selectedCategory}
              {selectedCategory !== 'all' && (
                <Badge size="xs" colorPalette="blue" ml="xs">1</Badge>
              )}
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="all" onClick={() => onCategoryChange('all')}>
              Todas
            </MenuItem>
            {categories.filter(c => c !== 'Todos').map(category => (
              <MenuItem
                key={category}
                value={category}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </MenuItem>
            ))}
          </MenuContent>
        </MenuRoot>

        {/* Stock Status Filter */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={disabled}>
              Stock: {selectedStockStatus === 'all' ? 'Todos' : selectedStockStatus}
              {selectedStockStatus !== 'all' && (
                <Badge size="xs" colorPalette="blue" ml="xs">1</Badge>
              )}
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="all" onClick={() => onStockStatusChange('all')}>
              Todos
            </MenuItem>
            <MenuItem value="ok" onClick={() => onStockStatusChange('ok')}>
              Saludable
            </MenuItem>
            <MenuItem value="low" onClick={() => onStockStatusChange('low')}>
              Bajo
            </MenuItem>
            <MenuItem value="critical" onClick={() => onStockStatusChange('critical')}>
              Crítico
            </MenuItem>
            <MenuItem value="out" onClick={() => onStockStatusChange('out')}>
              Agotado
            </MenuItem>
          </MenuContent>
        </MenuRoot>

        {/* Advanced Filters Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenFilters}
          disabled={disabled || !onOpenFilters}
        >
          <Icon icon={FunnelIcon} size="sm" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <Badge size="xs" colorPalette="blue" ml="xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </Stack>
    </Stack>
  );
MaterialsToolbar.displayName = 'MaterialsToolbar';
}, (prevProps, nextProps) => {
  // ✅ PERFORMANCE: Custom comparison to prevent MenuRoot re-renders from TabsContext changes
  return (
    prevProps.searchValue === nextProps.searchValue &&
    prevProps.selectedType === nextProps.selectedType &&
    prevProps.selectedCategory === nextProps.selectedCategory &&
    prevProps.selectedStockStatus === nextProps.selectedStockStatus &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.activeFiltersCount === nextProps.activeFiltersCount &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onSearchChange === nextProps.onSearchChange &&
    prevProps.onTypeChange === nextProps.onTypeChange &&
    prevProps.onCategoryChange === nextProps.onCategoryChange &&
    prevProps.onStockStatusChange === nextProps.onStockStatusChange &&
    prevProps.onViewModeChange === nextProps.onViewModeChange &&
    prevProps.onAddMaterial === nextProps.onAddMaterial &&
    prevProps.onImport === nextProps.onImport &&
    prevProps.onExport === nextProps.onExport &&
    prevProps.onOpenFilters === nextProps.onOpenFilters &&
    // Compare categories array by length (usually stable)
    prevProps.categories?.length === nextProps.categories?.length
  );
});
