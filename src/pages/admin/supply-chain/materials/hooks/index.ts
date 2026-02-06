export { useRealtimeMaterials } from './useRealtimeMaterials';
export { useInventoryTransferForm } from './useInventoryTransferForm';
export type { InventoryTransfer } from './useInventoryTransferForm';

// ✅ SPLIT HOOKS PATTERN - Selective subscriptions
export { useMaterialsActions } from './useMaterialsActions';
export { useMaterialsFilters } from './useMaterialsFilters';
export { useMaterialsComputed } from './useMaterialsComputed';

// 🆕 Form validation hook with Zod
export { useMaterialFormValidation } from './useMaterialFormValidation';
export type { ValidationResult, FieldValidationResult } from './useMaterialFormValidation';