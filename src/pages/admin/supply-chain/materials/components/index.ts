// ✅ NEW ENTERPRISE COMPONENTS
export { MaterialsMetrics } from './MaterialsMetrics';
export { MaterialsManagement } from './MaterialsManagement';
export { MaterialsActions } from './MaterialsActions';
export { MaterialsAlerts } from './MaterialsAlerts';

// ✅ NEW UI COMPONENTS (v2.1 - Professional Redesign)
export { MaterialsToolbar } from './MaterialsToolbar';
export { MaterialsTable } from './MaterialsTable';
export { BulkActionsBar } from './BulkActionsBar';
export { FilterDrawer } from './FilterDrawer';

// ✅ CHARTS COMPONENTS
export * from './MaterialsCharts';

// ✅ LEGACY COMPONENTS (for backward compatibility)
export * from './MaterialsList';
export * from './Overview';
export * from './Alerts';
export * from './SmartAlerts';
export * from './OfflineMode';
export * from './MaterialsView';
export * from './Analytics';
// MaterialManagement moved to MaterialsManagement
export * from './Procurement';

// Standalone legacy components (to be cleaned up)
export { default as LazyAnalytics } from './LazyAnalytics';
export { default as LazyMaterialFormModal } from './LazyMaterialFormModal';
export { default as LazyOfflineMaterialsPage } from './LazyOfflineMaterialsPage';