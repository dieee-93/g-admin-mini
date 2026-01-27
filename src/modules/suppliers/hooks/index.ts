/**
 * Suppliers Module - Hooks Index
 * 
 * Centralized export for all supplier-related hooks.
 * Following screaming architecture - hooks live within the module.
 * 
 * @module suppliers/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

/**
 * Main suppliers hook - CRUD operations and data management
 */
export { 
  useSuppliers, 
  useSupplierById, 
  useCreateSupplier, 
  useUpdateSupplier, 
  useDeleteSupplier 
} from './useSuppliers';

// ============================================================================
// VALIDATION HOOKS
// ============================================================================

/**
 * Supplier validation rules
 */
export { useSupplierValidation } from './useSupplierValidation';

/**
 * Supplier order validation rules
 */
export { useSupplierOrderValidation } from './useSupplierOrderValidation';
