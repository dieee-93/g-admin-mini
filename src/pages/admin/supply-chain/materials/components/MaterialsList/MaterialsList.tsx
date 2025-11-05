// MaterialsList.tsx - Lista principal de materiales con filtros y grilla
import React from 'react';
import { Section } from '@/shared/ui';
import { useMaterialsPage } from '../../hooks/useMaterialsPage';
import type { MaterialItem } from '../../types';

// Sub-componentes internos
import { MaterialsInventoryGrid } from './MaterialsInventoryGrid';

interface MaterialsListProps {
  onStockChange?: (material: MaterialItem) => void;
}

export function MaterialsList({ onStockChange }: MaterialsListProps) {
  const {
    materials,
    search,
    searchQuery,
    searchResults,
    actions
  } = useMaterialsPage();

  // Enhanced stock change handler with EventBus integration
  const handleStockChangeWithEvents = (item: MaterialItem) => {
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