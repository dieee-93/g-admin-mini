/**
 * MATERIALS MODULE - SERVICE LAYER
 * 
 * Re-exports all services from the current location in pages.
 * This provides a stable import path through the module structure.
 * 
 * @module materials/services
 */

// ============================================================================
// API SERVICES (Data Access Layer)
// ============================================================================

export { inventoryApi } from '@/pages/admin/supply-chain/materials/services/inventoryApi';
export { inventoryTransfersApi } from '@/pages/admin/supply-chain/materials/services/inventoryTransfersApi';
export * as materialsApi from '@/pages/admin/supply-chain/materials/services/materialsApi';

// ============================================================================
// BUSINESS LOGIC ENGINES (Calculation & Analysis)
// ============================================================================

export { ABCAnalysisEngine } from '@/pages/admin/supply-chain/materials/services/abcAnalysisEngine';
export { SupplierAnalysisEngine } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';

// ============================================================================
// ORCHESTRATION SERVICES
// ============================================================================

export { BulkOperationsService } from '@/pages/admin/supply-chain/materials/services/bulkOperationsService';
export { TrendsService } from '@/pages/admin/supply-chain/materials/services/trendsService';
export { InventoryTransfersService } from '@/pages/admin/supply-chain/materials/services/transfersService';
export { CacheService, invalidateMaterialsListCache, invalidateMaterialCache } from '@/pages/admin/supply-chain/materials/services/cacheService';

// ============================================================================
// UTILITY SERVICES
// ============================================================================

export { MaterialsDataNormalizer } from '@/pages/admin/supply-chain/materials/services/materialsDataNormalizer';
export { MaterialsNormalizer } from '@/pages/admin/supply-chain/materials/services/materialsNormalizer';
export { MaterialsMockService } from '@/pages/admin/supply-chain/materials/services/materialsMockService';
export { FormCalculations } from '@/pages/admin/supply-chain/materials/services/formCalculation';

// ============================================================================
// SMART ALERTS SYSTEM
// ============================================================================

export { default as MaterialsAlertsAdapter } from '@/modules/materials/alerts/adapter';

// ============================================================================
// SUPPLY CHAIN SERVICES
// ============================================================================

export { SupplyChainDataService } from '@/pages/admin/supply-chain/materials/services/supplyChainDataService';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export types from services
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

export type {
  SupplierAnalysisResult,
  SupplierAnalysis,
  SupplierRiskFactor,
} from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
