/**
 * useDashboardConfig - Hook para configuración personalizable del dashboard
 *
 * REFACTORED v2.0 - Dynamic Widgets Support:
 * - Elimina widgets hardcoded (eran estáticos: RevenueMetric, CustomersMetric, etc.)
 * - Ahora trabaja con SlotRegistry (widgets dinámicos según features activas)
 * - Solo persiste configuración de layout (posición, visibilidad, locked)
 * - Los widgets disponibles vienen de Atomic Capabilities v2.0
 *
 * Maneja:
 * - Layout de widgets arrastrables
 * - Persistencia en localStorage
 * - Configuración por usuario
 * - Reset a defaults
 *
 * @version 2.0.0 - Dynamic Widgets Integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logging';

// ===============================
// INTERFACES
// ===============================

/**
 * DashboardWidget - Simplified for dynamic loading
 *
 * ANTES (v1.0): Incluía type, title, data hardcoded
 * DESPUÉS (v2.0): Solo configuración de layout + referencia a componente
 */
export interface DashboardWidget {
  id: string;                     // slot.id desde SlotRegistry
  title: string;                  // Título (cada widget lo define)
  component: string;              // slot.component (nombre del widget)
  position: {
    x: number;
    y: number;
  };
  visible: boolean;
  locked: boolean;
}

/**
 * Configuración de widget almacenada en localStorage
 * Solo persiste lo modificable por el usuario
 */
export interface WidgetConfig {
  id: string;
  position: { x: number; y: number };
  visible: boolean;
  locked: boolean;
}

export interface DashboardLayout {
  widgetConfigs: WidgetConfig[];  // Solo config, NO widgets completos
  columns: number;
  gap: number;
  lastModified: string;
  version: string;
}

export interface DashboardConfigState {
  layout: DashboardLayout;
  isEditMode: boolean;
  isDirty: boolean;
  isLoading: boolean;
}

// ===============================
// DEFAULT LAYOUT
// ===============================

/**
 * DEFAULT_LAYOUT v2.0
 *
 * IMPORTANTE: Ya NO incluye widgets hardcoded.
 * Los widgets vienen dinámicamente de SlotRegistry según features activas.
 * Solo guardamos configuración de layout vacía por defecto.
 */
const DEFAULT_LAYOUT: DashboardLayout = {
  widgetConfigs: [],  // Vacío - los widgets se agregan dinámicamente
  columns: 4,
  gap: 16,
  lastModified: new Date().toISOString(),
  version: '4.0.0'    // Incrementado para forzar reset en usuarios existentes
};

const STORAGE_KEY = 'g-admin-dashboard-config-v2';

// ===============================
// HOOK IMPLEMENTATION  
// ===============================

export const useDashboardConfig = () => {
  const [state, setState] = useState<DashboardConfigState>({
    layout: DEFAULT_LAYOUT,
    isEditMode: false,
    isDirty: false,
    isLoading: true
  });


  // ===============================
  // PERSISTENCE
  // ===============================

  const loadConfig = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as DashboardLayout;
        
        // Validate version compatibility
        if (config.version === DEFAULT_LAYOUT.version) {
          setState(prev => ({
            ...prev,
            layout: config,
            isLoading: false,
            isDirty: false
          }));
          
          logger.info('App', 'Loaded saved configuration', {
            widgets: config.widgetConfigs.length,
            version: config.version
          });
        } else {
          logger.warn('App', 'Version mismatch, using defaults', {
            storedVersion: config.version,
            currentVersion: DEFAULT_LAYOUT.version
          });
          
          setState(prev => ({ 
            ...prev, 
            layout: DEFAULT_LAYOUT, 
            isLoading: false 
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          layout: DEFAULT_LAYOUT, 
          isLoading: false 
        }));
      }
    } catch (error) {
      logger.error('App', 'Error loading configuration', error);
      setState(prev => ({ 
        ...prev, 
        layout: DEFAULT_LAYOUT, 
        isLoading: false 
      }));
    }
  }, []);

  const saveConfig = useCallback(async (layout?: DashboardLayout) => {
    try {
      setState(prev => {
        const configToSave = layout || prev.layout;
        const updatedConfig = {
          ...configToSave,
          lastModified: new Date().toISOString()
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
          logger.info('App', 'Configuration saved successfully', {
            widgets: updatedConfig.widgetConfigs.length,
            timestamp: updatedConfig.lastModified
          });
        } catch (storageError) {
          logger.error('App', 'Error saving to localStorage', storageError);
        }

        return {
          ...prev,
          layout: updatedConfig,
          isDirty: false
        };
      });
    } catch (error) {
      logger.error('App', 'Error saving configuration', error);
      throw error;
    }
  }, []); // ✅ Sin dependencias - usa setState con función

  // ===============================
  // WIDGET MANAGEMENT
  // ===============================

  /**
   * Obtiene o crea configuración para un widget
   * Si no existe, crea con defaults
   *
   * ⚠️ NOTA: Este no se usa actualmente en el código, pero se mantiene en el API.
   * Si se necesita en el futuro, considerar memoización externa.
   */
  const getOrCreateWidgetConfig = useCallback((widgetId: string): WidgetConfig => {
    return state.layout.widgetConfigs.find(w => w.id === widgetId) || {
      id: widgetId,
      position: { x: 0, y: 0 },
      visible: true,
      locked: false
    };
  }, [state.layout.widgetConfigs]); // Necesita dependencia para acceso al state actual

  const moveWidget = useCallback((widgetId: string, newPosition: { x: number; y: number }) => {
    setState(prev => {
      // Buscar configuración existente o crear nueva
      const existingIndex = prev.layout.widgetConfigs.findIndex(w => w.id === widgetId);

      let updatedConfigs;
      if (existingIndex >= 0) {
        // Actualizar existente
        updatedConfigs = prev.layout.widgetConfigs.map(config =>
          config.id === widgetId
            ? { ...config, position: newPosition }
            : config
        );
      } else {
        // Crear nuevo
        updatedConfigs = [
          ...prev.layout.widgetConfigs,
          { id: widgetId, position: newPosition, visible: true, locked: false }
        ];
      }

      return {
        ...prev,
        layout: {
          ...prev.layout,
          widgetConfigs: updatedConfigs
        },
        isDirty: true
      };
    });

    logger.debug('App', 'Widget moved', { widgetId, newPosition });
  }, []);

  const toggleWidget = useCallback((widgetId: string) => {
    setState(prev => {
      const existingIndex = prev.layout.widgetConfigs.findIndex(w => w.id === widgetId);

      let updatedConfigs;
      if (existingIndex >= 0) {
        updatedConfigs = prev.layout.widgetConfigs.map(config =>
          config.id === widgetId
            ? { ...config, visible: !config.visible }
            : config
        );
      } else {
        // Crear con visible = false
        updatedConfigs = [
          ...prev.layout.widgetConfigs,
          { id: widgetId, position: { x: 0, y: 0 }, visible: false, locked: false }
        ];
      }

      return {
        ...prev,
        layout: {
          ...prev.layout,
          widgetConfigs: updatedConfigs
        },
        isDirty: true
      };
    });

    logger.debug('App', 'Widget visibility toggled', { widgetId });
  }, []);

  const lockWidget = useCallback((widgetId: string) => {
    setState(prev => {
      const existingIndex = prev.layout.widgetConfigs.findIndex(w => w.id === widgetId);

      let updatedConfigs;
      if (existingIndex >= 0) {
        updatedConfigs = prev.layout.widgetConfigs.map(config =>
          config.id === widgetId
            ? { ...config, locked: !config.locked }
            : config
        );
      } else {
        // Crear con locked = true
        updatedConfigs = [
          ...prev.layout.widgetConfigs,
          { id: widgetId, position: { x: 0, y: 0 }, visible: true, locked: true }
        ];
      }

      return {
        ...prev,
        layout: {
          ...prev.layout,
          widgetConfigs: updatedConfigs
        },
        isDirty: true
      };
    });

    logger.debug('App', 'Widget lock toggled', { widgetId });
  }, []);

  // ===============================
  // EDIT MODE
  // ===============================

  const toggleEditMode = useCallback(() => {
    setState(prev => {
      logger.info('App', 'Edit mode toggled', {
        oldMode: prev.isEditMode,
        newMode: !prev.isEditMode
      });

      return {
        ...prev,
        isEditMode: !prev.isEditMode
      };
    });
  }, []); // ✅ Sin dependencias - usa setState con función

  const resetToDefault = useCallback(() => {
    setState(prev => ({
      ...prev,
      layout: DEFAULT_LAYOUT,
      isDirty: true
    }));

    logger.info('App', 'Configuration reset to default');
  }, []);

  // ===============================
  // EFFECTS
  // ===============================

  // ✅ Solo cargar configuración UNA VEZ al montar el componente
  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = solo ejecutar al montar

  // Auto-save when dirty after delay
  useEffect(() => {
    if (state.isDirty && !state.isLoading) {
      logger.debug('App', '[useDashboardConfig] Auto-save scheduled', {
        isDirty: state.isDirty,
        isLoading: state.isLoading,
        widgetCount: state.layout.widgetConfigs.length
      });

      const timeoutId = setTimeout(() => {
        logger.debug('App', '[useDashboardConfig] Executing auto-save');
        saveConfig();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => {
        logger.debug('App', '[useDashboardConfig] Auto-save cancelled');
        clearTimeout(timeoutId);
      };
    }
  }, [state.isDirty, state.isLoading, state.layout.widgetConfigs.length, saveConfig]);

  // ===============================
  // MEMOIZED COMPUTED VALUES
  // ===============================

  // ✅ CRITICAL FIX: Usar referencia estable basada en contenido serializado
  // Esto evita que cambios de referencia del array causen re-cálculos innecesarios
  const widgetConfigsKey = JSON.stringify(state.layout.widgetConfigs);

  const visibleWidgets = useMemo(() => {
    return state.layout.widgetConfigs.filter(w => w.visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfigsKey]); // Depende del contenido serializado, no de la referencia

  const editableWidgets = useMemo(() => {
    return state.layout.widgetConfigs.filter(w => !w.locked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfigsKey]); // Depende del contenido serializado, no de la referencia

  const totalWidgets = useMemo(() => {
    return state.layout.widgetConfigs.length;
  }, [state.layout.widgetConfigs.length]);

  // ===============================
  // RETURN INTERFACE
  // ===============================

  return {
    // State
    layout: state.layout,
    isEditMode: state.isEditMode,
    isDirty: state.isDirty,
    isLoading: state.isLoading,

    // Widget configuration access
    getOrCreateWidgetConfig,

    // Widget management
    moveWidget,
    toggleWidget,
    lockWidget,

    // Layout management
    toggleEditMode,
    saveConfig: () => saveConfig(),
    resetToDefault,

    // Computed values (memoized)
    visibleWidgets,
    editableWidgets,
    totalWidgets,
    lastModified: state.layout.lastModified
  };
};