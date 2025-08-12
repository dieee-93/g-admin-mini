// Main store exports
export { useAppStore } from './appStore';
export { useMaterialsStore, useInventoryStore } from './materialsStore'; // useInventoryStore for legacy compatibility
export { useSalesStore } from './salesStore';
export { useCustomersStore } from './customersStore';
export { useStaffStore } from './staffStore';

// Types
export type { AppState } from './appStore';
export type { MaterialsState, MaterialItem, MaterialsFilters, InventoryState, InventoryItem, InventoryFilters } from './materialsStore';
export type { SalesState } from './salesStore';
export type { CustomersState } from './customersStore';
export type { StaffState } from './staffStore';