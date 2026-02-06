/**
 * Material Validation Index
 *
 * Clean exports for validation schemas and utilities
 */

export {
  MaterialFormSchema,
  ProductionConfigSchema,
  StaffAssignmentSchema,
  EquipmentUsageSchema,
  PackagingSchema,
  SupplierDataSchema,
  validateMaterialForm,
  validateField,
  getValidationErrors,
  isFormValid,
} from './materialFormSchema';

export type {
  MaterialFormData,
  ProductionConfigData,
  StaffAssignmentData,
  EquipmentUsageData,
  PackagingData,
  SupplierData,
} from './materialFormSchema';
