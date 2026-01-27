export { useAppStore } from './appStore';
// ✅ Migrated to modules:
// - useMaterialsStore → modules/materials/store/
// - useTeamStore → modules/team/store/
// - useCustomersStore → modules/customers/store/
// - useSuppliersStore → modules/suppliers/store/
// - useAssetsStore → modules/assets/store/
export { useSalesStore } from './salesStore';
export { usePaymentsStore } from './paymentsStore';

export type { AppState } from './appStore';
export type { SalesState } from './salesStore';
// ✅ Migrated types to modules
