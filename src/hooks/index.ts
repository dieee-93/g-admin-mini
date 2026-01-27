// Main hooks exports - organized by category

// ===================================
// Core Hooks (Generic Utilities)
// ===================================
export * from './core';

// ===================================
// Navigation Hooks
// ===================================
export * from './navigation';

// ===================================
// System Hooks (Permissions, Setup, Zustand wrappers)
// ===================================
export * from './system';

// ===================================
// Context Hooks
// ===================================
export { useLocation } from './useLocation';
export { useOrganization } from './useOrganization';

// ===================================
// Validation Hooks (Remaining - awaiting modules)
// ===================================
// These hooks are temporarily in root until their modules are created:
// - useRentalValidation → needs src/modules/rental/hooks/
// - useRecurringBillingValidation → needs src/modules/recurring-billing/hooks/
export { useRentalValidation } from './useRentalValidation';
export { useRecurringBillingValidation } from './useRecurringBillingValidation';
