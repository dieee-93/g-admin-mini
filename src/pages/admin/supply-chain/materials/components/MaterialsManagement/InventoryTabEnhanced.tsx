import { useCallback, memo } from 'react';
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

// ✅ PERFORMANCE: Memoize entire component to isolate from TabsContext thrashing
const InventoryTabEnhancedContent = memo(function InventoryTabEnhancedContent({
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  performanceMode = false
}: InventoryTabEnhancedProps) {
  const { openModal, deleteItem } = useMaterials();

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
    selectAll,
    deselectAll
  } = useInventoryState();

  // Bulk actions handlers - Wrapped in useCallback to prevent recreating on every render
  const handleBulkExport = useCallback(async () => {
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
  }, [materials, selectedItems]);

  const handleBulkAddStock = useCallback(async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Agregar stock masivo próximamente'
    });
    // TODO: Implement bulk add stock modal
  }, []);

  const handleBulkRemoveStock = useCallback(async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Reducir stock masivo próximamente'
    });
    // TODO: Implement bulk remove stock modal
  }, []);

  const handleBulkChangeCategory = useCallback(async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Cambiar categoría masivo próximamente'
    });
    // TODO: Implement bulk change category modal
  }, []);

  const handleBulkEdit = useCallback(async () => {
    notify.info({
      title: 'Funcionalidad en desarrollo',
      description: 'Edición masiva próximamente'
    });
    // TODO: Implement bulk edit modal
  }, []);

  const handleBulkDelete = useCallback(async () => {
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
  }, [selectedItems, deleteItem, deselectAll]);

  // Single material actions - Wrapped in useCallback to prevent recreating on every render
  type MaterialType = typeof materials[0];

  const handleEdit = useCallback((material: MaterialType) => {
    openModal('edit', material);
  }, [openModal]);

  const handleView = useCallback((material: MaterialType) => {
    openModal('view', material);
  }, [openModal]);

  const handleDelete = useCallback(async (material: MaterialType) => {
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
  }, [deleteItem]);

  // ✅ CRITICAL FIX: FilterDrawer callbacks - Extract inline functions to useCallback
  // setState functions are stable and don't need to be in dependencies
  const handleCloseFilters = useCallback(() => {
    setIsFiltersDrawerOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ PERFORMANCE: Use functional setState to avoid advancedFilters dependency
  const handleTypeToggle = useCallback((type) => {
    setAdvancedFilters((prev) => {
      const newTypes = prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type];
      return { ...prev, selectedTypes: newTypes };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePriceRangeChange = useCallback((range) => {
    setAdvancedFilters((prev) => ({ ...prev, priceRange: range }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSupplierToggle = useCallback((id) => {
    setAdvancedFilters((prev) => {
      const newSuppliers = prev.selectedSuppliers.includes(id)
        ? prev.selectedSuppliers.filter(s => s !== id)
        : [...prev.selectedSuppliers, id];
      return { ...prev, selectedSuppliers: newSuppliers };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleOutOfStock = useCallback((value) => {
    setAdvancedFilters((prev) => ({ ...prev, showOutOfStock: value }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleLowStock = useCallback((value) => {
    setAdvancedFilters((prev) => ({ ...prev, showLowStock: value }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleCritical = useCallback((value) => {
    setAdvancedFilters((prev) => ({ ...prev, showCritical: value }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleABCToggle = useCallback((abcClass) => {
    setAdvancedFilters((prev) => {
      const newClasses = prev.selectedABCClasses.includes(abcClass)
        ? prev.selectedABCClasses.filter(c => c !== abcClass)
        : [...prev.selectedABCClasses, abcClass];
      return { ...prev, selectedABCClasses: newClasses };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        onClose={handleCloseFilters}
        selectedTypes={advancedFilters.selectedTypes}
        onTypeToggle={handleTypeToggle}
        priceRange={advancedFilters.priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        selectedSuppliers={advancedFilters.selectedSuppliers}
        onSupplierToggle={handleSupplierToggle}
        showOutOfStock={advancedFilters.showOutOfStock}
        showLowStock={advancedFilters.showLowStock}
        showCritical={advancedFilters.showCritical}
        onToggleOutOfStock={handleToggleOutOfStock}
        onToggleLowStock={handleToggleLowStock}
        onToggleCritical={handleToggleCritical}
        selectedABCClasses={advancedFilters.selectedABCClasses}
        onABCToggle={handleABCToggle}
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
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if callbacks or performanceMode change
  return (
    prevProps.onStockUpdate === nextProps.onStockUpdate &&
    prevProps.onBulkAction === nextProps.onBulkAction &&
    prevProps.onAddMaterial === nextProps.onAddMaterial &&
    prevProps.performanceMode === nextProps.performanceMode
  );
});

// Export wrapper component
export function InventoryTabEnhanced(props: InventoryTabEnhancedProps) {
  return <InventoryTabEnhancedContent {...props} />;
}
