// ============================================================================
// SMART INVENTORY ALERTS HOOK
// ============================================================================
// Hook para integrar alertas inteligentes de inventario con el sistema unificado

import { useEffect, useCallback, useMemo } from 'react';
import { useMaterials } from './useMaterials';
import { useStockAlerts } from '@/shared/alerts/hooks/useAlerts';
import { useAlertsContext } from '@/shared/alerts/AlertsProvider';
import { ABCAnalysisEngine } from '@/pages/admin/supply-chain/inventory/abcAnalysisEngine';
import { SmartAlertsAdapter } from '@/pages/admin/supply-chain/inventory/smartAlertsAdapter';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import type { Alert } from '@/shared/alerts/types';

interface UseSmartInventoryAlertsOptions {
  // Configuración del análisis ABC
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
  
  // Filtros de alertas
  minValue?: number;
  includeInactive?: boolean;
  
  // Configuración de alertas
  enablePredictive?: boolean;
  autoResolveOutdated?: boolean;
}

interface SmartInventoryAlertsReturn {
  // Estados
  materialsLoading: boolean;
  alertsLoading: boolean;
  isGeneratingAlerts: boolean;
  
  // Datos
  materials: MaterialABC[];
  activeAlerts: Alert[];
  criticalAlerts: Alert[];
  alertsCount: number;
  
  // Acciones
  refreshAlerts: () => Promise<void>;
  resolveOutdatedAlerts: () => Promise<void>;
  generateAndUpdateAlerts: () => Promise<void>;
  
  // Analytics
  analytics: {
    totalItemsMonitored: number;
    itemsWithAlerts: number;
    alertsByClass: Record<'A' | 'B' | 'C', number>;
    mostCriticalItems: Array<{
      id: string;
      name: string;
      abcClass: 'A' | 'B' | 'C';
      alertCount: number;
      maxSeverity: string;
    }>;
  };
  
  // UI helpers
  ui: {
    badgeCount: number;
    badgeColor: 'red' | 'orange' | 'yellow' | 'blue' | 'gray';
    statusText: string;
    shouldShowBadge: boolean;
  };
}

/**
 * Hook para manejo inteligente de alertas de inventario
 * Integra ABC Analysis con el sistema de alertas unificado
 */
export function useSmartInventoryAlerts(
  options: UseSmartInventoryAlertsOptions = {}
): SmartInventoryAlertsReturn {
  
  const {
    autoRefresh = true,
    refreshIntervalMs = 300000, // 5 minutos
    minValue = 100,
    includeInactive = false,
    enablePredictive = true,
    autoResolveOutdated = true
  } = options;

  // Hooks dependencies
  const { items: materialItems, loading: materialsLoading } = useMaterials();
  const { 
    alerts: stockAlerts, 
    loading: alertsLoading,
    actions: alertActions,
    activeCount,
    criticalCount,
    ui: alertsUI
  } = useStockAlerts();
  const alertsContext = useAlertsContext();

  // State para controlar la generación de alertas
  const [isGeneratingAlerts, setIsGeneratingAlerts] = React.useState(false);

  // Generar materiales con clasificación ABC
  const materials = useMemo<MaterialABC[]>(() => {
    if (!materialItems || materialItems.length === 0) return [];
    
    try {
      const analysisResult = ABCAnalysisEngine.analyzeInventory(materialItems, {
        minValue,
        includeInactive,
        enablePredictiveAlerts: enablePredictive
      });
      
      return [
        ...analysisResult.classA,
        ...analysisResult.classB, 
        ...analysisResult.classC
      ];
    } catch (error) {
      console.error('Error analyzing materials for alerts:', error);
      return [];
    }
  }, [materialItems, minValue, includeInactive, enablePredictive]);

  // Filtrar alertas activas y críticas
  const activeAlerts = useMemo(() => 
    stockAlerts.filter(alert => alert.status === 'active'),
    [stockAlerts]
  );

  const criticalAlerts = useMemo(() => 
    stockAlerts.filter(alert => alert.severity === 'critical' && alert.status === 'active'),
    [stockAlerts]
  );

  // Función para generar y actualizar alertas
  const generateAndUpdateAlerts = useCallback(async () => {
    if (!materials.length || isGeneratingAlerts) return;
    
    try {
      setIsGeneratingAlerts(true);
      
      // 1. Generar nuevas alertas inteligentes
      const newAlerts = await SmartAlertsAdapter.generateMaterialsAlerts(materials);
      
      // 2. Filtrar duplicados
      const filteredAlerts = SmartAlertsAdapter.filterDuplicateAlerts(newAlerts, stockAlerts);
      
      // 3. Crear nuevas alertas
      const createPromises = filteredAlerts.map(alert => 
        alertActions.create(alert).catch(error => {
          console.error('Error creating alert:', error);
          return null;
        })
      );
      
      await Promise.all(createPromises);
      
      // 4. Actualizar alertas existentes que han cambiado
      const alertsToUpdate = SmartAlertsAdapter.getAlertsToUpdate(materials, stockAlerts);
      const updatePromises = alertsToUpdate.map(({ id, updates }) => 
        alertActions.update(id, updates).catch(error => {
          console.error('Error updating alert:', error);
        })
      );
      
      await Promise.all(updatePromises);
      
      // 5. Resolver alertas outdated si está habilitado
      if (autoResolveOutdated) {
        await resolveOutdatedAlerts();
      }
      
    } catch (error) {
      console.error('Error generating smart alerts:', error);
    } finally {
      setIsGeneratingAlerts(false);
    }
  }, [materials, stockAlerts, alertActions, isGeneratingAlerts, autoResolveOutdated]);

  // Función para resolver alertas outdated
  const resolveOutdatedAlerts = useCallback(async () => {
    if (!materials.length) return;
    
    try {
      const alertsToResolve = SmartAlertsAdapter.getAlertsToResolve(materials, stockAlerts);
      
      const resolvePromises = alertsToResolve.map(alertId => 
        alertActions.resolve(alertId, 'Auto-resuelto: condición ya no se cumple').catch(error => {
          console.error('Error auto-resolving alert:', error);
        })
      );
      
      await Promise.all(resolvePromises);
      
    } catch (error) {
      console.error('Error resolving outdated alerts:', error);
    }
  }, [materials, stockAlerts, alertActions]);

  // Función para refresh manual
  const refreshAlerts = useCallback(async () => {
    await generateAndUpdateAlerts();
  }, [generateAndUpdateAlerts]);

  // Auto-refresh con intervalo
  useEffect(() => {
    if (!autoRefresh || !materials.length) return;
    
    const interval = setInterval(() => {
      generateAndUpdateAlerts();
    }, refreshIntervalMs);
    
    return () => clearInterval(interval);
  }, [autoRefresh, materials.length, refreshIntervalMs, generateAndUpdateAlerts]);

  // Generar alertas inicialmente cuando hay materiales
  useEffect(() => {
    if (materials.length > 0 && !isGeneratingAlerts) {
      // Delay para evitar múltiples ejecuciones
      const timeout = setTimeout(generateAndUpdateAlerts, 1000);
      return () => clearTimeout(timeout);
    }
  }, [materials.length, isGeneratingAlerts, generateAndUpdateAlerts]);

  // Analytics calculados
  const analytics = useMemo(() => {
    const itemsWithAlerts = new Set(
      activeAlerts
        .filter(alert => alert.metadata?.itemId)
        .map(alert => alert.metadata!.itemId!)
    ).size;

    // Alertas por clase ABC
    const alertsByClass = activeAlerts.reduce(
      (acc, alert) => {
        const itemId = alert.metadata?.itemId;
        const material = materials.find(m => m.id === itemId);
        if (material) {
          acc[material.abcClass] = (acc[material.abcClass] || 0) + 1;
        }
        return acc;
      },
      { A: 0, B: 0, C: 0 } as Record<'A' | 'B' | 'C', number>
    );

    // Items más críticos
    const itemAlertCounts = new Map<string, {
      material: MaterialABC;
      alertCount: number;
      maxSeverity: string;
    }>();

    activeAlerts.forEach(alert => {
      const itemId = alert.metadata?.itemId;
      const material = materials.find(m => m.id === itemId);
      if (material) {
        const existing = itemAlertCounts.get(itemId!) || {
          material,
          alertCount: 0,
          maxSeverity: 'low'
        };
        
        existing.alertCount += 1;
        
        // Actualizar severidad máxima
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        if (severityOrder[alert.severity] > severityOrder[existing.maxSeverity]) {
          existing.maxSeverity = alert.severity;
        }
        
        itemAlertCounts.set(itemId!, existing);
      }
    });

    const mostCriticalItems = Array.from(itemAlertCounts.values())
      .sort((a, b) => {
        // Primero por severidad máxima, luego por cantidad de alertas
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        const severityDiff = severityOrder[b.maxSeverity] - severityOrder[a.maxSeverity];
        return severityDiff !== 0 ? severityDiff : b.alertCount - a.alertCount;
      })
      .slice(0, 5)
      .map(({ material, alertCount, maxSeverity }) => ({
        id: material.id,
        name: material.name,
        abcClass: material.abcClass,
        alertCount,
        maxSeverity
      }));

    return {
      totalItemsMonitored: materials.length,
      itemsWithAlerts,
      alertsByClass,
      mostCriticalItems
    };
  }, [materials, activeAlerts]);

  return {
    // Estados
    materialsLoading,
    alertsLoading,
    isGeneratingAlerts,
    
    // Datos
    materials,
    activeAlerts,
    criticalAlerts,
    alertsCount: activeAlerts.length,
    
    // Acciones
    refreshAlerts,
    resolveOutdatedAlerts,
    generateAndUpdateAlerts,
    
    // Analytics
    analytics,
    
    // UI helpers (delegando al sistema de alertas existente)
    ui: {
      badgeCount: alertsUI.badgeCount,
      badgeColor: alertsUI.badgeColor,
      statusText: alertsUI.statusText,
      shouldShowBadge: alertsUI.shouldShowBadge
    }
  };
}

// Fix para useState import
import React from 'react';