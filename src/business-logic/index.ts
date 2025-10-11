/**
 * Business Logic Centralized Exports
 * Single entry point for shared business logic used across multiple modules
 *
 * Philosophy: This directory should ONLY contain:
 * - Logic shared by 2+ modules
 * - Core utilities used throughout the application
 *
 * Module-specific logic should live within the module's services/ directory
 */

// ===== SHARED UTILITIES =====
// Used across all modules for decimal precision in financial calculations
export * from './shared/decimalUtils';
export * from './shared/FinancialCalculations';

// ===== INVENTORY MANAGEMENT =====
// Shared by: Materials module, Recipes module, Shared components, materialsStore
export * from './inventory/stockCalculation';

// ===== OPERATIONS =====
// Shared by: Sales module, Scheduling module
export * from './operations/tableOperations';

// ===== SCHEDULING =====
// Used by: services/scheduling
export * from './scheduling/schedulingCalculations';
