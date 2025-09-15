/**
 * Business Logic Centralized Exports
 * Single entry point for all business logic modules
 */

// Shared utilities
export * from './shared/decimalUtils';

// Customer analytics - MOVED to customers/services/
// Customer analytics moved to src/pages/admin/core/crm/customers/services/

// Fiscal calculations - MOVED to sales/services/
// taxCalculationService moved to src/pages/admin/operations/sales/services/

// Inventory management - MOVED to materials/services/
// All inventory-specific business logic moved to src/pages/admin/supply-chain/materials/services/

// Pricing calculations
export * from './pricing/useCostCalculation';

// Staff performance - MOVED to staff/services/
// Staff performance analytics moved to src/pages/admin/resources/staff/services/
// Real-time labor cost engine moved to src/pages/admin/resources/staff/services/

// Recipe calculations (NEW)
export * from './recipes/recipeCostCalculationEngine';

// Product cost analysis and menu engineering moved to products/services/

// Scheduling calculations (NEW)
export * from './scheduling/schedulingCalculations';

// Sales analytics - MOVED to sales/services/
// salesAnalytics moved to src/pages/admin/operations/sales/services/

// Operations capacity (NEW)
export * from './operations/tableOperations';
export * from './operations/capacityManagement';

// Financial planning - MOVED to fiscal/services/
// Financial planning engine moved to src/pages/admin/finance/fiscal/services/

// Product materials cost engine moved to products/services/

// Real-time labor cost engine (NEW)

// Consolidated financial calculations (NEW)
export * from './shared/FinancialCalculations';