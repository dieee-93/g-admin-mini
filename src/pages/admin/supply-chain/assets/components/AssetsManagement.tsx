/**
 * ASSETS MANAGEMENT COMPONENT
 * Main component orchestrating filters, table, and modals
 */

import { Stack } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AssetsFilters } from './AssetsFilters';
import { AssetsTable } from './AssetsTable';
import { AssetFormModal } from './AssetFormModal';
import { AssetDetailModal } from './AssetDetailModal';
import { useAssetsPage } from '../hooks';

export function AssetsManagement() {
  const {
    filteredAssets,
    loading,
    filters,
    isFormOpen,
    isDetailOpen,
    selectedAsset,
    actions,
  } = useAssetsPage();

  return (
    <Stack gap={4}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={actions.handleCreate} size="sm">
          <PlusIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Agregar Asset
        </Button>
      </div>

      {/* Filters */}
      <AssetsFilters
        filters={filters}
        onChange={actions.handleFiltersChange}
        onClear={actions.handleClearFilters}
      />

      {/* Table */}
      <AssetsTable
        assets={filteredAssets}
        onView={actions.handleView}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        isLoading={loading}
      />

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={actions.handleFormClose}
        onSubmit={actions.handleSubmit}
        asset={selectedAsset}
      />

      <AssetDetailModal
        isOpen={isDetailOpen}
        onClose={actions.handleDetailClose}
        asset={selectedAsset}
        onEdit={actions.handleEdit}
      />
    </Stack>
  );
}
