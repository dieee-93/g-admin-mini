// ============================================================================
// SMART ALERTS ADAPTER - Integration Bridge
// ============================================================================
// Adaptador para integrar Smart Alerts Engine con el sistema de alertas unificado

import { SmartAlertsEngine, type SmartAlert } from './smartAlertsEngine';
import { type MaterialABC } from '@/pages/admin/materials/types/abc-analysis';
import type { 
  CreateAlertInput, 
  Alert, 
  AlertAction,
  AlertMetadata,
  AlertSeverity as SystemAlertSeverity,
  AlertType as SystemAlertType 
} from '@/shared/alerts/types';

// ============================================================================
// MAPPING TYPES
// ============================================================================

// Mapeo de severidades: Smart Alerts → Sistema Unificado
const SEVERITY_MAP: Record<string, SystemAlertSeverity> = {
  'urgent': 'critical',
  'critical': 'high', 
  'warning': 'medium',
  'info': 'low'
};

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
      console.error('Error generating smart alerts:', error);
      return [];
    }
  }

  /**
   * Convierte una SmartAlert al formato CreateAlertInput del sistema unificado
   */
  private static convertSmartAlertToUnified(smartAlert: SmartAlert): CreateAlertInput {
    // Mapear severidad
    const severity = SEVERITY_MAP[smartAlert.severity] || 'medium';
    
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
    
    // Determinar si debe persistir y tiempo de expiración
    const persistent = smartAlert.severity === 'urgent' || smartAlert.severity === 'critical';
    const autoExpire = this.getAutoExpireTime(smartAlert);

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
   */
  private static enrichDescription(smartAlert: SmartAlert): string {
    let description = smartAlert.description;
    
    // Agregar información de clase ABC
    description += `\n\n📊 **Clase ABC**: ${smartAlert.abcClass} (${this.getClassDescription(smartAlert.abcClass)})`;
    
    // Agregar desviación del threshold
    if (smartAlert.deviation > 0) {
      description += `\n📈 **Desviación**: ${smartAlert.deviation}% ${smartAlert.currentValue > smartAlert.thresholdValue ? 'por encima' : 'por debajo'} del umbral`;
    }
    
    // Agregar prioridad de acción
    description += `\n⏰ **Prioridad**: ${this.getPriorityText(smartAlert.actionPriority)} (${smartAlert.timeToAction.replace('_', ' ')})`;
    
    // Agregar recomendación
    if (smartAlert.recommendedAction) {
      description += `\n\n💡 **Recomendación**: ${smartAlert.recommendedAction}`;
    }
    
    return description;
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
            console.log('Opening purchase order for item:', smartAlert.itemId);
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
              console.log('Contacting supplier for item:', smartAlert.itemId);
            }
          });
        }
        break;
        
      case 'overstocked':
        actions.push({
          label: 'Ver Promociones',
          variant: 'primary',
          action: async () => {
            console.log('Opening promotions for item:', smartAlert.itemId);
            // TODO: Implementar navegación a crear promoción
          }
        });
        break;
        
      case 'slow_moving':
        actions.push({
          label: 'Analizar Demanda',
          variant: 'primary',
          action: async () => {
            console.log('Analyzing demand for item:', smartAlert.itemId);
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
        console.log('Viewing item details:', smartAlert.itemId);
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

  /**
   * Determina tiempo de auto-expiración en minutos
   */
  private static getAutoExpireTime(smartAlert: SmartAlert): number {
    switch (smartAlert.severity) {
      case 'urgent': return 60;        // 1 hora
      case 'critical': return 240;     // 4 horas
      case 'warning': return 1440;     // 24 horas
      case 'info': return 2880;        // 48 horas
      default: return 1440; // 24 horas por defecto
    }
  }

  /**
   * Obtiene descripción de clase ABC
   */
  private static getClassDescription(abcClass: string): string {
    switch (abcClass) {
      case 'A': return 'Crítico - Alto valor';
      case 'B': return 'Importante - Valor medio';
      case 'C': return 'Ordinario - Bajo valor';
      default: return 'Desconocido';
    }
  }

  /**
   * Convierte prioridad numérica a texto
   */
  private static getPriorityText(priority: number): string {
    if (priority >= 5) return 'Urgente';
    if (priority >= 4) return 'Alta';
    if (priority >= 3) return 'Media';
    if (priority >= 2) return 'Baja';
    return 'Muy Baja';
  }

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
        const newSeverity = SEVERITY_MAP[currentAlert.severity];
        
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