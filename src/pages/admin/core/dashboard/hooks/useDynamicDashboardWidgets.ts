/**
 * useDynamicDashboardWidgets - Unified Dashboard Widget System
 *
 * Combina:
 * - Atomic Capabilities v2.0 (dynamic loading según features activas)
 * - Drag & Drop configuration (useDashboardConfig)
 * - Real-time metrics (Zustand stores)
 *
 * Reemplaza:
 * - useDashboard (obsoleto, no usado)
 * - useDashboardStats (obsoleto, queries directas)
 * - Lógica de ExecutiveOverview (widgets estáticos)
 *
 * @version 1.0.0 - Dashboard Unification
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCapabilityStore } from '@/store/capabilityStore';
import { getSlotsForTarget } from '@/config/FeatureRegistry';
import { useDashboardConfig, type DashboardWidget } from './useDashboardConfig';
import { useSalesStore } from '@/store/salesStore';
import { useMaterialsStore } from '@/store/materialsStore';
import { useStaffStore } from '@/store/staffStore';
import { useCustomersStore } from '@/store/customersStore';
import { logger } from '@/lib/logging';

/**
 * Métricas agregadas por módulo desde stores de Zustand
 */
export interface ModuleMetrics {
  sales: {
    todayTotal: number;
    monthTotal: number;
    todayCount: number;
    monthCount: number;
    averageOrderValue: number;
    loading: boolean;
  };
  materials: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    criticalStockCount: number;
    loading: boolean;
  };
  staff: {
    totalStaff: number;
    activeStaff: number;
    onShift: number;
    productivity: number;
    loading: boolean;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
    topSpenders: number;
    loading: boolean;
  };
}

/**
 * Widget dinámico con información de slot + configuración drag-n-drop
 */
export interface DynamicWidget extends DashboardWidget {
  priority: number;      // Desde SlotRegistry
  featureBased: boolean; // true = dinámico, false = always-visible
}

export function useDynamicDashboardWidgets() {
  // ============================================
  // DYNAMIC LOADING: Features → Slots → Widgets
  // ============================================

  // ✅ CRITICAL FIX: Usar selector directo para evitar objeto nuevo en cada render
  // useCapabilities() retorna nuevo objeto → causa loop infinito
  // useCapabilityStore(selector) solo cambia si el valor cambia → estable
  const activeFeatures = useCapabilityStore(state => state.features.activeFeatures);
  const completedMilestones = useCapabilityStore(state => state.features.completedMilestones);
  const pendingMilestones = useCapabilityStore(state => state.features.pendingMilestones);

  // 🔍 DEBUG: Log cada render del hook
  logger.debug('App', '[useDynamicDashboardWidgets] Hook rendered', {
    activeFeaturesCount: activeFeatures.length,
    timestamp: new Date().toISOString()
  });

  /**
   * Obtener slots dinámicos según features activas
   * Solo widgets que el usuario tiene habilitados por sus capabilities
   */
  const availableSlots = useMemo(() => {
    const slots = getSlotsForTarget(activeFeatures, 'dashboard-widgets');
    logger.debug('App', '[useDynamicDashboardWidgets] availableSlots useMemo executed', {
      slotsCount: slots.length,
      slotIds: slots.map(s => s.id),
      activeFeaturesRef: activeFeatures
    });
    return slots;
  }, [activeFeatures]);

  // ============================================
  // DRAG & DROP: Layout Configuration
  // ============================================

  const {
    layout,
    isEditMode,
    isDirty,
    isLoading: configLoading,
    visibleWidgets: configuredWidgets,
    toggleEditMode,
    moveWidget,
    toggleWidget,
    lockWidget,
    saveConfig,
    resetToDefault,
    lastModified
  } = useDashboardConfig();

  /**
   * Combinar slots disponibles con configuración de usuario
   * - Si el widget existe en config → usar config (posición, visibilidad, locked)
   * - Si es nuevo (feature activada) → agregar con defaults
   * - Si feature desactivada → filtrar widget
   */
  const dynamicWidgets: DynamicWidget[] = useMemo(() => {
    logger.debug('App', '[useDynamicDashboardWidgets] dynamicWidgets useMemo STARTING', {
      availableSlotsCount: availableSlots.length,
      configuredWidgetsCount: configuredWidgets.length,
      availableSlotsRef: availableSlots,
      configuredWidgetsRef: configuredWidgets
    });

    const widgets = availableSlots.map(slot => {
      // Buscar configuración existente para este slot
      const existingConfig = configuredWidgets.find(w => w.id === slot.id);

      if (existingConfig) {
        // Widget ya configurado por usuario
        return {
          ...existingConfig,
          title: `Widget ${slot.component}`, // Título desde slot
          component: slot.component,         // ✅ CRITICAL: component viene del slot, no de config
          priority: slot.priority,
          featureBased: true
        };
      } else {
        // Widget nuevo (feature recién activada)
        return {
          id: slot.id,
          title: `Widget ${slot.component}`, // Temporal, cada widget define su título
          component: slot.component,
          priority: slot.priority,
          position: { x: 0, y: 0, w: 1, h: 1 }, // Default position
          visible: true,
          locked: false,
          featureBased: true
        };
      }
    });

    logger.debug('App', '[useDynamicDashboardWidgets] dynamicWidgets useMemo COMPLETED', {
      totalWidgets: widgets.length,
      widgetIds: widgets.map(w => w.id),
      resultRef: widgets
    });

    return widgets;
  }, [availableSlots, configuredWidgets]);

  /**
   * Widgets visibles, ordenados por prioridad (mayor primero) y posición
   */
  const visibleDynamicWidgets = useMemo(() => {
    logger.debug('App', '[useDynamicDashboardWidgets] visibleDynamicWidgets useMemo STARTING', {
      dynamicWidgetsCount: dynamicWidgets.length,
      dynamicWidgetsRef: dynamicWidgets
    });

    const result = dynamicWidgets
      .filter(w => w.visible)
      .sort((a, b) => {
        // Primero por prioridad (mayor primero)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Luego por posición (y, x)
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    logger.debug('App', '[useDynamicDashboardWidgets] visibleDynamicWidgets useMemo COMPLETED', {
      visibleCount: result.length,
      resultRef: result
    });

    return result;
  }, [dynamicWidgets]);

  // ============================================
  // REAL-TIME METRICS: Zustand Stores
  // ============================================

  // ✅ CRITICAL FIX: Usar useShallow de Zustand v5 para evitar loop infinito
  const salesMetrics = useSalesStore(useShallow(state => ({
    todayTotal: state.stats?.todayTotal || 0,
    monthTotal: state.stats?.monthTotal || 0,
    todayCount: state.stats?.todayCount || 0,
    monthCount: state.stats?.monthCount || 0,
    averageOrderValue: state.stats?.averageOrderValue || 0,
    loading: state.loading
  })));

  const materialsMetrics = useMaterialsStore(useShallow(state => ({
    totalItems: state.stats?.totalItems || 0,
    totalValue: state.stats?.totalValue || 0,
    lowStockCount: state.stats?.lowStockCount || 0,
    criticalStockCount: state.stats?.criticalStockCount || 0,
    loading: state.loading
  })));

  const staffMetrics = useStaffStore(useShallow(state => ({
    totalStaff: state.stats?.totalStaff || 0,
    activeStaff: state.stats?.activeStaff || 0,
    onShift: state.stats?.onShift || 0,
    productivity: state.stats?.productivity || 0,
    loading: state.loading
  })));

  const customersMetrics = useCustomersStore(useShallow(state => ({
    total: state.stats?.totalCustomers || 0,
    active: state.stats?.activeCustomers || 0,
    newThisMonth: state.stats?.newThisMonth || 0,
    topSpenders: state.stats?.topSpenders || 0,
    loading: state.loading
  })));

  const metrics: ModuleMetrics = useMemo(() => ({
    sales: salesMetrics,
    materials: materialsMetrics,
    staff: staffMetrics,
    customers: customersMetrics
  }), [salesMetrics, materialsMetrics, staffMetrics, customersMetrics]);

  // ============================================
  // LOADING & STATUS
  // ============================================

  const isLoading = configLoading ||
    salesMetrics.loading ||
    materialsMetrics.loading ||
    staffMetrics.loading ||
    customersMetrics.loading;

  const hasWidgets = visibleDynamicWidgets.length > 0;
  const hiddenWidgetsCount = dynamicWidgets.filter(w => !w.visible).length;
  const lockedWidgetsCount = dynamicWidgets.filter(w => w.locked).length;

  // ============================================
  // RETURN API
  // ============================================

  return {
    // Dynamic Widgets
    availableSlots,           // Slots según features (raw from SlotRegistry)
    dynamicWidgets,           // Widgets combinados (slots + config)
    visibleDynamicWidgets,    // Solo widgets visibles, ordenados

    // Metrics (Real-time data from stores)
    metrics,

    // Drag & Drop Configuration
    layout,
    isEditMode,
    isDirty,
    lastModified,
    toggleEditMode,
    moveWidget,
    toggleWidget,
    lockWidget,
    saveConfig,
    resetToDefault,

    // Status
    isLoading,
    hasWidgets,
    hiddenWidgetsCount,
    lockedWidgetsCount
  };
}
