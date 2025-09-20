// MaterialsList.tsx - Lista principal de materiales con filtros y grilla
import React from 'react';
import { Section } from '@/shared/ui';
import { useMaterialsPage } from '../../hooks/useMaterialsPage';

// Sub-componentes internos
import { MaterialsFilters } from './MaterialsFilters';
import { MaterialsInventoryGrid } from './MaterialsInventoryGrid';

interface MaterialsListProps {
  onStockChange?: (material: any) => void;
}

export function MaterialsList({ onStockChange }: MaterialsListProps) {
  const {
    materials,
    search,
    searchQuery,
    searchResults,
    loading,
    error,
    actions
  } = useMaterialsPage();

  // Enhanced stock change handler with EventBus integration
  const handleStockChangeWithEvents = (item: any) => {
    // Call parent handler for EventBus integration
    onStockChange?.(item);
  };

  return (
    <Section variant="elevated" title="Materials Inventory">
      <MaterialsInventoryGrid
        items={searchQuery ? searchResults : materials}
        searchTerm={searchQuery}
        typeFilter=""
        onSearchChange={search}
        onTypeFilterChange={() => {}}
        onEditItem={actions.handleOpenAddModal}
        onAddStock={handleStockChangeWithEvents}
        onViewDetails={() => {}}
      />
    </Section>
  );
}

export default MaterialsList;