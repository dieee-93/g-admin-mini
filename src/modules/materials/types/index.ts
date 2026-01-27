/**
 * MATERIALS MODULE - TYPES INDEX
 * 
 * Re-exports all types from current location in pages.
 * Provides stable import path through module structure.
 * 
 * MIGRATION NOTE:
 * - Phase 1: Re-export from pages (CURRENT)
 * - Phase 2: Move type files to this directory
 * - Phase 3: Update all imports
 */

// ============================================================================
// CORE TYPES
// ============================================================================

// Material & Inventory Types
export type {
  MaterialItem,
  MaterialCategory,
  MaterialType,
  InventoryItem,
  StockEntry,
  MeasurementUnit,
  ItemFormData,
} from '@/pages/admin/supply-chain/materials/types/materialTypes';

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

// ABC Analysis Types
export type {
  ABCAnalysisConfig,
  ABCAnalysisResult,
  MaterialABC,
  ABCClass,
  ABCCategory,
  ABCClassSummary,
  ABCRecommendation,
  AnalysisType,
} from '@/pages/admin/supply-chain/materials/types/abc-analysis';

// ============================================================================
// OPERATIONS TYPES
// ============================================================================

// Inventory Transfer Types
export type {
  InventoryTransfer,
  TransferStatus,
  TransferItem,
} from '@/pages/admin/supply-chain/materials/types/inventoryTransferTypes';

// ============================================================================
// STORE TYPES (Module-native)
// ============================================================================

// Re-export store types
export type {
  MaterialsViewMode,
  MaterialsTab,
  MaterialsFilters,
  MaterialsUIState,
} from '../store/materialsStore';
