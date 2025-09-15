// MaterialsList.tsx - Lista principal de materiales con filtros y grilla
import React from 'react';
import { Section } from '@/shared/ui';

// Sub-componentes internos
import { MaterialsFilters } from './MaterialsFilters';
import { MaterialsInventoryGrid } from './MaterialsInventoryGrid';

export function MaterialsList() {
  return (
    <Section variant="elevated" title="Materials Inventory">
      <MaterialsFilters />
      <MaterialsInventoryGrid />
    </Section>
  );
}

export default MaterialsList;