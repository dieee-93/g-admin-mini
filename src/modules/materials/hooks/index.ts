/**
 * MATERIALS MODULE - HOOKS INDEX
 * 
 * TanStack Query hooks for server state management.
 * 
 * @module materials/hooks
 */

// ============================================================================
// TANSTACK QUERY INFRASTRUCTURE
// ============================================================================

/**
 * Query Keys Factory
 */
export { materialsKeys } from './queryKeys';

// ============================================================================
// QUERY HOOKS - Data Fetching
// ============================================================================

export { useMaterials } from './useMaterials';
export { useMaterial } from './useMaterial';

// ============================================================================
// MUTATION HOOKS - CRUD Operations
// ============================================================================

export { useCreateMaterial } from './useCreateMaterial';
export { useUpdateMaterial } from './useUpdateMaterial';
export { useDeleteMaterial } from './useDeleteMaterial';

// ============================================================================
// MUTATION HOOKS - Stock Management
// ============================================================================

export { useAdjustStock } from './useAdjustStock';
export type { StockAdjustmentInput } from './useAdjustStock';

// ============================================================================
// MUTATION HOOKS - Bulk Operations
// ============================================================================

export {
  useBulkDeleteMaterials,
  useBulkAdjustStock,
  useBulkToggleActive,
} from './useBulkOperations';

// ============================================================================
// QUERY HOOKS - Analysis
// ============================================================================

export { useABCAnalysis, useABCClassification } from './useABCAnalysis';

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

export { useMaterialsPage } from './useMaterialsPage';
export type {
  UseMaterialsPageParams,
  UseMaterialsPageReturn,
  MaterialsPageState,
  MaterialsPageMetrics,
  MaterialsFilters,
  ViewMode,
  ActiveTab,
  StockStatus,
} from './useMaterialsPage';

export { useMaterialValidation } from './useMaterialValidation';
export {
  useInventoryAlertSettings,
  useInventoryAlertSetting,
  useSystemInventoryAlertSettings,
  useUpdateInventoryAlertSettings,
  useToggleAutoReorder,
  useToggleABCAnalysis,
  inventoryAlertsKeys,
} from './useInventoryAlerts';
export { useInventoryTransferValidation } from './useInventoryTransferValidation';
export { useSmartInventoryAlerts } from './useSmartInventoryAlerts';
