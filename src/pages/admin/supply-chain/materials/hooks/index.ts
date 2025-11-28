export { useMaterialsPage } from './useMaterialsPage';
export { useRealtimeMaterials } from './useRealtimeMaterials';
export { useInventoryTransferForm } from './useInventoryTransferForm';
export type { InventoryTransfer } from './useInventoryTransferForm';

// ✅ SPLIT HOOKS PATTERN - Selective subscriptions
export { useMaterialsData } from './useMaterialsData';
export { useMaterialsActions } from './useMaterialsActions';
export { useMaterialsFilters } from './useMaterialsFilters';
export { useMaterialsComputed } from './useMaterialsComputed';