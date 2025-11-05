// ============================================================================
// SMART ALERTS ADAPTER - Integration Bridge
// ============================================================================
// Adaptador para integrar Smart Alerts Engine con el sistema de alertas unificado
// ✅ REFACTORIZADO para usar shared/alerts/utils (2025-01-30)

import { SmartAlertsEngine, type SmartAlert } from './smartAlertsEngine';
import { type MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import { logger } from '@/lib/logging';
import type {
  CreateAlertInput,
  Alert,
  AlertAction,
  AlertMetadata,
  AlertSeverity as SystemAlertSeverity,
  AlertType as SystemAlertType
} from '@/shared/alerts/types';

// ============================================================================
// SHARED UTILITIES - Lógica reutilizable ✅
// ============================================================================

import {
  // Severity mapping
  mapSeverity,
  shouldBePersistent,

  // Formatting
  enrichDescription as enrichAlert,
  getABCClassDescription,
  getABCClassEmoji,
  getPriorityText,

  // Lifecycle
  getStockAlertExpiration,

  // Types
  type EnrichableAlert
} from '@/shared/alerts/utils';

// ============================================================================
// MAPPING TYPES
// ============================================================================

// Mapeo de tipos: Smart Alerts → Sistema Unificado
const TYPE_MAP: Record<string, SystemAlertType> = {
  'low_stock': 'stock',
  'out_of_stock': 'stock',
  'overstocked': 'stock',
  'slow_moving': 'business',
  'price_variance': 'business',
  'supplier_risk': 'operational',
  'seasonal_demand': 'business',
  'abc_reclassification': 'business'
};

// ============================================================================
// SMART ALERTS ADAPTER CLASS
// ============================================================================

export class SmartAlertsAdapter {
  
  /**
   * Genera alertas inteligentes y las convierte al formato del sistema unificado
   * @param materials Array de materiales con clasificación ABC
   * @returns Array de CreateAlertInput para el sistema unificado
   */
  static async generateMaterialsAlerts(materials: MaterialABC[]): Promise<CreateAlertInput[]> {
    try {
      // 1. Generar alertas inteligentes usando el engine
      const smartAlerts = SmartAlertsEngine.generateSmartAlerts(materials);
      
      // 2. Convertir a formato del sistema unificado
      const unifiedAlerts = smartAlerts.map(alert => 
        this.convertSmartAlertToUnified(alert)
      );
      
      return unifiedAlerts;
    } catch (error) {
      // ✅ FIX: Improved error logging with detailed information
      logger.error('MaterialsStore', 'Error generating smart alerts:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        materialsCount: materials?.length || 0,
        errorType: error?.constructor?.name
      });
      return [];
    }
  }

  /**
   * Convierte una SmartAlert al formato CreateAlertInput del sistema unificado
   * ✅ USA SHARED UTILITIES para evitar duplicación
   */
  private static convertSmartAlertToUnified(smartAlert: SmartAlert): CreateAlertInput {
    // ✅ Usar mapSeverity de shared utils
    const severity = mapSeverity(smartAlert.severity);

    // Mapear tipo
    const type = TYPE_MAP[smartAlert.type] || 'stock';

    // Crear metadata específica para alertas de stock
    const metadata: AlertMetadata = {
      itemId: smartAlert.itemId,
      itemName: smartAlert.itemName,
      currentStock: smartAlert.currentValue,
      minThreshold: smartAlert.thresholdValue,
      affectedRevenue: this.estimateRevenueImpact(smartAlert),
      estimatedImpact: smartAlert.estimatedImpact,
      timeToResolve: this.getEstimatedResolutionTime(smartAlert),
      ...smartAlert.contextData
    };

    // Crear acciones basadas en las recomendaciones
    const actions = this.createActionsFromRecommendation(smartAlert);

    // ✅ Usar shouldBePersistent de shared utils
    const persistent = shouldBePersistent(severity);

    // ✅ Usar getStockAlertExpiration de shared utils
    const autoExpire = getStockAlertExpiration(severity) / 60000; // Convertir a minutos

    return {
      type,
      severity,
      context: 'materials',
      title: smartAlert.title,
      description: this.enrichDescription(smartAlert),
      metadata,
      actions,
      persistent,
      autoExpire,
      isRecurring: false // Por ahora no manejamos recurrencia
    };
  }

  /**
   * Enriquece la descripción con información adicional
   * ✅ USA SHARED UTILITY enrichDescription
   */
  private static enrichDescription(smartAlert: SmartAlert): string {
    // Adaptar SmartAlert a EnrichableAlert format
    const enrichable: EnrichableAlert = {
      description: smartAlert.description,
      category: `${getABCClassEmoji(smartAlert.abcClass)} Clase ${smartAlert.abcClass} - ${getABCClassDescription(smartAlert.abcClass)}`,
      deviation: smartAlert.deviation,
      currentValue: smartAlert.currentValue,
      thresholdValue: smartAlert.thresholdValue,
      actionPriority: smartAlert.actionPriority,
      recommendedAction: smartAlert.recommendedAction
    };

    // ✅ Usar enrichDescription de shared utils
    return enrichAlert(enrichable, {
      showCategory: true,
      showDeviation: true,
      showPriority: true,
      showRecommendation: true,
      emojis: true
    });
  }

  /**
   * Crea acciones UI basadas en las recomendaciones del smart alert
   */
  private static createActionsFromRecommendation(smartAlert: SmartAlert): Omit<AlertAction, 'id'>[] {
    const actions: Omit<AlertAction, 'id'>[] = [];
    
    // Acción principal basada en el tipo de alerta
    switch (smartAlert.type) {
      case 'low_stock':
      case 'out_of_stock':
        actions.push({
          label: 'Reabastecer Ahora',
          variant: 'primary',
          action: async () => {
            // En producción, esto abriría el modal de compras o navegaría a la página de pedidos
            logger.info('MaterialsStore', 'Opening purchase order for item:', smartAlert.itemId);
            // TODO: Implementar navegación a crear pedido de compra
          },
          autoResolve: true
        });
        
        if (smartAlert.abcClass === 'A') {
          actions.push({
            label: 'Contactar Proveedor',
            variant: 'secondary', 
            action: async () => {
              // En producción, esto abriría el contacto del proveedor
              logger.info('MaterialsStore', 'Contacting supplier for item:', smartAlert.itemId);
            }
          });
        }
        break;
        
      case 'overstocked':
        actions.push({
          label: 'Ver Promociones',
          variant: 'primary',
          action: async () => {
            logger.info('MaterialsStore', 'Opening promotions for item:', smartAlert.itemId);
            // TODO: Implementar navegación a crear promoción
          }
        });
        break;
        
      case 'slow_moving':
        actions.push({
          label: 'Analizar Demanda',
          variant: 'primary',
          action: async () => {
            logger.info('MaterialsStore', 'Analyzing demand for item:', smartAlert.itemId);
            // TODO: Implementar navegación a análisis de demanda
          }
        });
        break;
    }
    
    // Acción secundaria para ver detalles del item
    actions.push({
      label: 'Ver Detalles',
      variant: 'secondary',
      action: async () => {
        logger.info('MaterialsStore', 'Viewing item details:', smartAlert.itemId);
        // TODO: Implementar navegación a detalles del material
      }
    });
    
    return actions;
  }

  /**
   * Estima el impacto en revenue de la alerta
   */
  private static estimateRevenueImpact(smartAlert: SmartAlert): number {
    const contextData = smartAlert.contextData;
    
    if (contextData.stockValue) {
      // Para alertas de stock, el impacto es el valor del stock afectado
      return contextData.stockValue;
    }
    
    if (contextData.excessValue) {
      // Para alertas de overstock, el impacto es el valor del exceso
      return contextData.excessValue;
    }
    
    // Estimación por defecto basada en clase ABC
    switch (smartAlert.abcClass) {
      case 'A': return 10000; // Items críticos tienen alto impacto
      case 'B': return 5000;  // Items importantes tienen impacto medio
      case 'C': return 1000;  // Items ordinarios tienen bajo impacto
      default: return 0;
    }
  }

  /**
   * Calcula tiempo estimado de resolución en minutos
   * (Mantener - es específico de dominio Materials)
   */
  private static getEstimatedResolutionTime(smartAlert: SmartAlert): number {
    switch (smartAlert.timeToAction) {
      case 'immediate': return 15;      // 15 minutos
      case 'within_24h': return 120;    // 2 horas
      case 'within_week': return 480;   // 8 horas
      case 'next_month': return 1440;   // 24 horas
      default: return 60; // 1 hora por defecto
    }
  }

  // ❌ ELIMINADOS - Ahora usan shared/alerts/utils:
  // - getAutoExpireTime() → getStockAlertExpiration()
  // - getClassDescription() → getABCClassDescription()
  // - getPriorityText() → getPriorityText() (ya importado)
  // - mapSeverity via SEVERITY_MAP → mapSeverity()

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Filtra alertas existentes para evitar duplicados
   * @param newAlerts Nuevas alertas a crear
   * @param existingAlerts Alertas existentes en el sistema
   * @returns Alertas filtradas sin duplicados
   */
  static filterDuplicateAlerts(
    newAlerts: CreateAlertInput[], 
    existingAlerts: Alert[]
  ): CreateAlertInput[] {
    return newAlerts.filter(newAlert => {
      // Buscar si ya existe una alerta similar para el mismo item
      const duplicate = existingAlerts.find(existing => 
        existing.context === 'materials' &&
        existing.metadata?.itemId === newAlert.metadata?.itemId &&
        existing.type === newAlert.type &&
        existing.status === 'active'
      );
      
      return !duplicate; // Solo incluir si no hay duplicado
    });
  }

  /**
   * Actualiza alertas existentes que han cambiado de severidad
   * @param materials Materiales actuales
   * @param existingAlerts Alertas existentes
   * @returns Array de IDs de alertas que deben actualizarse
   */
  static getAlertsToUpdate(
    materials: MaterialABC[], 
    existingAlerts: Alert[]
  ): Array<{ id: string; updates: Partial<Alert> }> {
    const updates: Array<{ id: string; updates: Partial<Alert> }> = [];
    
    // Generar alertas actuales para comparar
    const currentSmartAlerts = SmartAlertsEngine.generateSmartAlerts(materials);
    
    existingAlerts.forEach(existingAlert => {
      const itemId = existingAlert.metadata?.itemId;
      if (!itemId || existingAlert.context !== 'materials') return;
      
      // Buscar alerta actual correspondiente
      const currentAlert = currentSmartAlerts.find(smart => 
        smart.itemId === itemId && 
        TYPE_MAP[smart.type] === existingAlert.type
      );
      
      if (currentAlert) {
        // ✅ Usar mapSeverity de shared utils
        const newSeverity = mapSeverity(currentAlert.severity);

        // Si la severidad cambió, actualizar
        if (newSeverity !== existingAlert.severity) {
          updates.push({
            id: existingAlert.id,
            updates: {
              severity: newSeverity,
              description: this.enrichDescription(currentAlert),
              metadata: {
                ...existingAlert.metadata,
                currentStock: currentAlert.currentValue,
                affectedRevenue: this.estimateRevenueImpact(currentAlert)
              }
            }
          });
        }
      }
    });
    
    return updates;
  }

  /**
   * Resuelve automáticamente alertas que ya no son válidas
   * @param materials Materiales actuales
   * @param existingAlerts Alertas existentes
   * @returns Array de IDs de alertas que deben resolverse
   */
  static getAlertsToResolve(
    materials: MaterialABC[], 
    existingAlerts: Alert[]
  ): string[] {
    const toResolve: string[] = [];
    
    // Generar alertas actuales
    const currentSmartAlerts = SmartAlertsEngine.generateSmartAlerts(materials);
    const currentItemAlerts = new Set(
      currentSmartAlerts.map(alert => `${alert.itemId}-${alert.type}`)
    );
    
    existingAlerts.forEach(existingAlert => {
      const itemId = existingAlert.metadata?.itemId;
      if (!itemId || existingAlert.context !== 'materials') return;
      
      // Crear key para comparar
      const key = `${itemId}-${Object.keys(TYPE_MAP).find(k => TYPE_MAP[k] === existingAlert.type)}`;
      
      // Si la alerta ya no existe en las actuales, marcar para resolver
      if (!currentItemAlerts.has(key) && existingAlert.status === 'active') {
        toResolve.push(existingAlert.id);
      }
    });
    
    return toResolve;
  }
}