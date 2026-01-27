/**
 * Sales Page Services - Re-exports from Module
 * 
 * This file re-exports services from the sales module for backward compatibility.
 * New code should import directly from @/modules/sales
 */

// ⚠️ DEPRECATED: Import from @/modules/sales/services instead
// Keeping for backward compatibility with existing page code

// POS Sales API - Now in module
export {
  fetchSales,
  fetchSaleById,
  deleteSale,
  validateSaleStock,
  getSalesSummary,
  fetchCustomers,
  fetchProductsWithAvailability,
  fetchTransactions,
  fetchOrders,
  getTopSellingProducts,
  getCustomerPurchases,
  processSale,
} from '@/modules/sales/services/posApi';

// Table Management - Now in module
export { 
  fetchTables,
  fetchTableById,
  seatParty,
  clearTable,
  updateTableStatus,
  logServiceEvent,
  getServiceTimeline
} from '@/modules/sales/services/tableApi';

// Sales Analytics - Now in module
export * from '@/modules/sales/services/salesAnalytics';

// Sales Intelligence - Now in module
export { 
  SalesIntelligenceEngine 
} from '@/modules/sales/services/salesIntelligenceEngine';

// Tax Calculations - Now in cash module
export { 
  taxService,
  TAX_RATES,
  DEFAULT_TAX_CONFIG
} from '@/modules/cash/services/taxCalculationService';

// Types - Now in module
export type {
  SalesAlert,
  SalesAlertSeverity,
  SalesAlertType,
  SalesAnalysisData,
  RevenueThresholds,
  SalesIntelligenceConfig
} from '@/modules/sales/services/salesIntelligenceEngine';

// Alerts Adapter - Page-specific (needs consolidation with module version)
export * from './SalesAlertsAdapter';

