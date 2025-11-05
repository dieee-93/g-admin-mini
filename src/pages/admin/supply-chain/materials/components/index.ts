/**
 * Materials Module Component Exports
 *
 * Only exports actively used components to reduce bundle size and improve maintainability.
 * Removed 30+ legacy/unused exports identified in gap analysis (2025-01-16).
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
// REUSABLE COMPONENTS (Phase 3 Enhancement)
// ============================================

export { MaterialCard } from './MaterialCard';
export { InventoryWidget } from './InventoryWidget';

// ============================================
// UI COMPONENTS (Available for future use)
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
export { default as LazyAnalytics } from './LazyAnalytics';

// ============================================
// REMOVED (2025-01-16 Gap Analysis Cleanup)
// ============================================
//
// The following exports were removed because they have ZERO external imports:
//
// - MaterialsList (replaced by MaterialsTable)
// - Overview (pre-redesign legacy)
// - Alerts (replaced by MaterialsAlerts)
// - SmartAlerts (replaced by MaterialsAlerts)
// - OfflineMode (never implemented)
// - MaterialsView (replaced by MaterialsManagement)
// - Analytics (replaced by LazyAnalytics)
// - Procurement (deprecated)
// - LazyOfflineMaterialsPage (offline mode not implemented)
//
// If you need any of these components, they still exist in ./components/
// but are no longer exported from the barrel file.
// ============================================