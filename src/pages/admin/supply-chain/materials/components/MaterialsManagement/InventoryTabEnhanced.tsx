import { Stack, Typography } from '@/shared/ui';
import { useMaterials } from '@/store/materialsStore';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';

// Import new components
import {
  MaterialsToolbar,
  MaterialsTable,
  BulkActionsBar,
  FilterDrawer
} from '../';

// Import legacy card view (for toggle)
import { InventoryTab as LegacyInventoryTab } from './InventoryTab';

// Import hook
import { useInventoryState } from './hooks/useInventoryState';

interface InventoryTabEnhancedProps {
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  performanceMode?: boolean;
}

export function InventoryTabEnhanced({
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  performanceMode = false
}: InventoryTabEnhancedProps) {
  const { openModal, updateItem, deleteItem } = useMaterials();

  // Use inventory state hook
  const {
    materials,
    selectedItems,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    handleSort,
    searchValue,
    handleSearch,
    selectedType,
    handleTypeChange,
    selectedCategory,
    handleCategoryChange,
    selectedStockStatus,
    handleStockStatusChange,
    isFiltersDrawerOpen,
    setIsFiltersDrawerOpen,
    advancedFilters,
    setAdvancedFilters,
    activeFiltersCount,
    handleApplyAdvancedFilters,
    handleClearAdvancedFilters,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll
  } = useInventoryState();

  // Bulk actions handlers
  const handleBulkExport = async () => {
    try {
      const selectedMaterials = materials.filter(m => selectedItems.includes(m.id));

      // Convert to CSV
      const headers = ['Nombre', 'Tipo', 'Stock', 'Costo', 'Categoría'];
      const rows = selectedMaterials.map(m => [
        m.name,
        m.type,
        m.stock,
        m.unit_cost,
        m.category || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `materials-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      notify.success({
        title: 'Exportación completada',
        description: `${selectedMaterials.length} materiales exportados`
      });
    } catch (error) {
      logger.error('MaterialsStore', 'Error exporting materials:', error);
      notify.error({
        title: 'Error al exportar',
        description: 'No se pudieron exportar los materiales'
      });
    }
  };

  const handleBulkAddStock = async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Agregar stock masivo próximamente'
    });
    // TODO: Implement bulk add stock modal
  };

  const handleBulkRemoveStock = async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Reducir stock masivo próximamente'
    });
    // TODO: Implement bulk remove stock modal
  };

  const handleBulkChangeCategory = async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Cambiar categoría masivo próximamente'
    });
    // TODO: Implement bulk change category modal
  };

  const handleBulkEdit = async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Edición masiva próximamente'
    });
    // TODO: Implement bulk edit modal
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedItems.length} materiales?`)) {
      return;
    }

    try {
      await Promise.all(selectedItems.map(id => deleteItem(id)));
      deselectAll();
      notify.success({
        title: 'Materiales eliminados',
        description: `${selectedItems.length} materiales fueron eliminados`
      });
    } catch (error) {
      logger.error('MaterialsStore', 'Error deleting materials:', error);
      notify.error({
        title: 'Error al eliminar',
        description: 'No se pudieron eliminar los materiales'
      });
    }
  };

  // Single material actions
  const handleEdit = (material: any) => {
    openModal('edit', material);
  };

  const handleView = (material: any) => {
    openModal('view', material);
  };

  const handleDelete = async (material: any) => {
    if (!window.confirm(`¿Eliminar ${material.name}?`)) {
      return;
    }

    try {
      await deleteItem(material.id);
      notify.success({
        title: 'Material eliminado',
        description: `${material.name} fue eliminado`
      });
    } catch (error) {
      logger.error('MaterialsStore', 'Error deleting material:', error);
      notify.error({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el material'
      });
    }
  };

  return (
    <Stack direction="column" gap="xl">
      {/* Toolbar with search and filters */}
      <MaterialsToolbar
        searchValue={searchValue}
        onSearchChange={handleSearch}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedStockStatus={selectedStockStatus}
        onStockStatusChange={handleStockStatusChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddMaterial={onAddMaterial}
        onImport={() => notify.info({ title: 'Importar próximamente' })}
        onExport={handleBulkExport}
        onOpenFilters={() => setIsFiltersDrawerOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <>
          {/* Table Header */}
          <Stack direction="row" justify="space-between" align="center">
            <Typography variant="heading" size="lg">
              Gestión de Inventario ({materials.length} items)
            </Typography>
          </Stack>

          {/* Table View */}
          <MaterialsTable
            materials={materials}
            selectedIds={selectedItems}
            onSelect={selectItem}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </>
      ) : (
        /* Cards View (legacy) */
        <LegacyInventoryTab
          onStockUpdate={onStockUpdate}
          onBulkAction={onBulkAction}
          onAddMaterial={onAddMaterial}
          performanceMode={performanceMode}
        />
      )}

      {/* Bulk Actions Bar (appears when items are selected) */}
      <BulkActionsBar
        selectedCount={selectedItems.length}
        onExport={handleBulkExport}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        onBulkAddStock={handleBulkAddStock}
        onBulkRemoveStock={handleBulkRemoveStock}
        onBulkChangeCategory={handleBulkChangeCategory}
        onClearSelection={deselectAll}
      />

      {/* Advanced Filters Drawer */}
      <FilterDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        selectedTypes={advancedFilters.selectedTypes}
        onTypeToggle={(type) => {
          const newTypes = advancedFilters.selectedTypes.includes(type)
            ? advancedFilters.selectedTypes.filter(t => t !== type)
            : [...advancedFilters.selectedTypes, type];
          setAdvancedFilters({ ...advancedFilters, selectedTypes: newTypes });
        }}
        priceRange={advancedFilters.priceRange}
        onPriceRangeChange={(range) =>
          setAdvancedFilters({ ...advancedFilters, priceRange: range })
        }
        selectedSuppliers={advancedFilters.selectedSuppliers}
        onSupplierToggle={(id) => {
          const newSuppliers = advancedFilters.selectedSuppliers.includes(id)
            ? advancedFilters.selectedSuppliers.filter(s => s !== id)
            : [...advancedFilters.selectedSuppliers, id];
          setAdvancedFilters({ ...advancedFilters, selectedSuppliers: newSuppliers });
        }}
        showOutOfStock={advancedFilters.showOutOfStock}
        showLowStock={advancedFilters.showLowStock}
        showCritical={advancedFilters.showCritical}
        onToggleOutOfStock={(value) =>
          setAdvancedFilters({ ...advancedFilters, showOutOfStock: value })
        }
        onToggleLowStock={(value) =>
          setAdvancedFilters({ ...advancedFilters, showLowStock: value })
        }
        onToggleCritical={(value) =>
          setAdvancedFilters({ ...advancedFilters, showCritical: value })
        }
        selectedABCClasses={advancedFilters.selectedABCClasses}
        onABCToggle={(abcClass) => {
          const newClasses = advancedFilters.selectedABCClasses.includes(abcClass)
            ? advancedFilters.selectedABCClasses.filter(c => c !== abcClass)
            : [...advancedFilters.selectedABCClasses, abcClass];
          setAdvancedFilters({ ...advancedFilters, selectedABCClasses: newClasses });
        }}
        onApply={handleApplyAdvancedFilters}
        onClear={handleClearAdvancedFilters}
        activeFiltersCount={activeFiltersCount}
        suppliers={[]} // TODO: Load from API
      />

      {performanceMode && (
        <Typography variant="caption" color="orange.500">
          Modo de rendimiento activado - Animaciones reducidas
        </Typography>
      )}
    </Stack>
  );
}
