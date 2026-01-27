/**
 * Materials Module Component Exports
 *
 * Only exports actively used components to reduce bundle size and improve maintainability.
 */

// ============================================
// ACTIVE COMPONENTS (Used by page.tsx)
// ============================================

export { MaterialsMetrics } from './MaterialsMetrics';
export { MaterialsManagement } from './MaterialsManagement';
export { MaterialsActions } from './MaterialsActions';
export { MaterialsAlerts } from './MaterialsAlerts';
export { default as LazyMaterialFormModal } from './LazyMaterialFormModal';

// ============================================
// REUSABLE COMPONENTS
// ============================================

export { MaterialCard } from './MaterialCard';
export { InventoryWidget } from './InventoryWidget';

// ============================================
// UI COMPONENTS
// ============================================

export { MaterialsToolbar } from './MaterialsToolbar';
export { MaterialsTable } from './MaterialsTable';
export { BulkActionsBar } from './BulkActionsBar';
export { FilterDrawer } from './FilterDrawer';

// ============================================
// INVENTORY TRANSFERS (Multi-Location Feature)
// ============================================

export { TransferStatusBadge } from './TransferStatusBadge';
export { TransfersTable } from './TransfersTable';
export { TransferFormModal } from './TransferFormModal';
export { TransferDetailsModal } from './TransferDetailsModal';

// ============================================
// CHARTS & ANALYTICS
// ============================================

export * from './MaterialsCharts';