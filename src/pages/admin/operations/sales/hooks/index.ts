/**
 * Sales Page Hooks - Re-exports from Module
 * 
 * ⚠️ DEPRECATED: Import from @/modules/sales/hooks instead
 * This file re-exports hooks from the sales module for backward compatibility.
 */

// Legacy page-specific hooks (will be migrated)
export { useSalesPage } from './useSalesPage';
export * from './useSales';
export * from './useSaleForm';

// ⚠️ DEPRECATED: Use usePOSCart from @/modules/sales/hooks instead
export * from './useSalesCart';

// Re-exports from module for convenience
export {
  useAppointments,
  useTables,
  useAvailableTables,
  usePOSCart,
  usePOSSales,
  usePOSSale,
  usePOSSalesSummary,
  usePOSTransactions,
  usePOSOrders,
  usePOSTopProducts,
  usePOSCustomerPurchases,
} from '@/modules/sales/hooks';
