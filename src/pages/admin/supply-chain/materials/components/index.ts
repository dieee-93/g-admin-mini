// ✅ NEW ENTERPRISE COMPONENTS
export { MaterialsMetrics } from './MaterialsMetrics';
export { MaterialsManagement } from './MaterialsManagement';
export { MaterialsActions } from './MaterialsActions';
export { MaterialsAlerts } from './MaterialsAlerts';

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