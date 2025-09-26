/**
 * useModuleFeatures - Hook para manejar features granulares dentro de módulos
 * Integra con el sistema de capabilities para mostrar/ocultar features específicas
 */

import { useMemo } from 'react';
import { useCapabilities } from './useCapabilities';
import { getBusinessModuleFeatures, BUSINESS_MODULE_CONFIGURATIONS } from '../businessCapabilitySystem';
import type { BusinessCapability } from '../types/BusinessCapabilities';

export interface ModuleFeatureConfig {
  // Features disponibles para este módulo
  availableFeatures: string[];

  // Funciones para verificar features específicas
  hasFeature: (featureName: string) => boolean;

  // Información de debug
  debugInfo: {
    moduleId: string;
    totalFeatures: number;
    availableCount: number;
    missingFeatures: string[];
  };
}

/**
 * Hook principal para manejar features de módulos
 */
export function useModuleFeatures(moduleId: string): ModuleFeatureConfig {
  const { activeCapabilities } = useCapabilities();

  const moduleFeatures = useMemo(() => {
    // Use BUSINESS CAPABILITY system
    const featureCategories = getBusinessModuleFeatures(moduleId, activeCapabilities);
    const availableFeatures = [...featureCategories.required, ...featureCategories.optional];
    const moduleConfig = BUSINESS_MODULE_CONFIGURATIONS[moduleId];

    const hasFeature = (featureName: string): boolean => {
      return availableFeatures.includes(featureName);
    };

    return {
      availableFeatures,
      hasFeature,
      debugInfo: {
        moduleId,
        totalFeatures: moduleConfig ? Object.keys(moduleConfig.features).length : 0,
        availableCount: availableFeatures.length,
        missingFeatures: featureCategories.unavailable
      }
    };
  }, [moduleId, activeCapabilities]);

  return moduleFeatures;
}

/**
 * Hook específico para verificar una sola feature
 */
export function useFeatureAccess(moduleId: string, featureName: string): boolean {
  const { hasFeature } = useModuleFeatures(moduleId);
  return hasFeature(featureName);
}

/**
 * Hook para obtener múltiples features de una vez
 */
export function useMultipleFeatures(
  moduleId: string,
  featureNames: string[]
): Record<string, boolean> {
  const { hasFeature } = useModuleFeatures(moduleId);

  return useMemo(() => {
    const result: Record<string, boolean> = {};
    featureNames.forEach(featureName => {
      result[featureName] = hasFeature(featureName);
    });
    return result;
  }, [hasFeature, featureNames]);
}

/**
 * Hook para debugging de features en desarrollo
 */
export function useModuleFeaturesDebug(moduleId: string) {
  const moduleFeatures = useModuleFeatures(moduleId);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Module Features Debug [${moduleId}]:`, moduleFeatures.debugInfo);
  }

  return moduleFeatures;
}

/**
 * Interface para el componente FeatureGate
 * (El componente se define en un archivo .tsx separado)
 */
export interface FeatureGateProps {
  moduleId: string;
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Types para mejor autocompletado en los módulos específicos
 */
export type SchedulingFeature =
  | 'staff_scheduling'
  | 'appointment_booking'
  | 'calendar_integration'
  | 'schedule_management'
  | 'approve_timeoff'
  | 'view_labor_costs'
  | 'coverage_planning'
  | 'shift_optimization';

export type SalesFeature =
  | 'pos_system'
  | 'online_ordering'
  | 'delivery_management'
  | 'table_management'
  | 'qr_ordering'
  | 'payment_gateway'
  | 'customer_analytics';

export type MaterialsFeature =
  | 'abc_analysis'
  | 'supply_chain_intelligence'
  | 'procurement_optimization'
  | 'supplier_management'
  | 'cost_tracking';

/**
 * Hooks tipados para módulos específicos
 */
export function useSchedulingFeatures() {
  return useModuleFeatures('scheduling');
}

export function useSalesFeatures() {
  return useModuleFeatures('sales');
}

export function useMaterialsFeatures() {
  return useModuleFeatures('materials');
}

export function useProductsFeatures() {
  return useModuleFeatures('products');
}

export function useStaffFeatures() {
  return useModuleFeatures('staff');
}