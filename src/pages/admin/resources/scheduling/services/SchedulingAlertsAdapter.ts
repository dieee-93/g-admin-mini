// SchedulingAlertsAdapter.ts - Integración con Sistema Unificado de Alertas
// Implementa Business Intelligence + EventBus Integration

import {
  IntelligentAlert,
  SchedulingIntelligenceEngine,
  type SchedulingData
} from './SchedulingIntelligenceEngine';

// ✅ SHARED ALERTS SYSTEM INTEGRATION
import { Alert, AlertAction } from '@/shared/alerts/types';
import EventBus from '@/lib/events';

// ✅ BUSINESS LOGIC UTILITIES
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

import { logger } from '@/lib/logging';
// ✅ ALERT MAPPING CONFIGURATION
const ALERT_PRIORITY_MAP = {
  'critical': 1,
  'warning': 2,
  'info': 3
} as const;

const ALERT_URGENCY_MAP = {
  'critical': 'high',
  'warning': 'medium',
  'info': 'low'
} as const;

// ✅ SCHEDULING SPECIFIC ALERT ACTIONS
const SCHEDULING_ALERT_ACTIONS: Record<string, AlertAction[]> = {
  'coverage_gap': [
    { id: 'find_coverage', label: 'Buscar Cobertura', variant: 'primary' },
    { id: 'adjust_shifts', label: 'Ajustar Turnos', variant: 'secondary' },
    { id: 'emergency_call', label: 'Llamada de Emergencia', variant: 'outline' }
  ],
  'overtime_detected': [
    { id: 'review_overtime', label: 'Revisar Horas Extra', variant: 'primary' },
    { id: 'adjust_schedule', label: 'Ajustar Horario', variant: 'secondary' },
    { id: 'approve_overtime', label: 'Aprobar Horas Extra', variant: 'outline' }
  ],
  'understaffing': [
    { id: 'find_coverage', label: 'Buscar Personal', variant: 'primary' },
    { id: 'redistribute_tasks', label: 'Redistribuir Tareas', variant: 'secondary' }
  ],
  'high_labor_cost': [
    { id: 'review_costs', label: 'Revisar Costos', variant: 'primary' },
    { id: 'optimize_schedule', label: 'Optimizar Horario', variant: 'secondary' }
  ],
  'coverage_critical': [
    { id: 'emergency_staffing', label: 'Personal de Emergencia', variant: 'primary' },
    { id: 'improve_coverage', label: 'Mejorar Cobertura', variant: 'secondary' }
  ],
  'efficiency_low': [
    { id: 'analyze_patterns', label: 'Analizar Patrones', variant: 'primary' },
    { id: 'schedule_training', label: 'Programar Entrenamiento', variant: 'secondary' }
  ]
};

// ✅ SCHEDULING ALERTS ADAPTER CLASS
export class SchedulingAlertsAdapter {
  private engine: SchedulingIntelligenceEngine;

  constructor() {
    this.engine = new SchedulingIntelligenceEngine();
  }

  /**
   * Analiza datos de scheduling y convierte alertas inteligentes
   * al formato del sistema unificado de alertas
   */
  async generateUnifiedAlerts(schedulingData: SchedulingData): Promise<Alert[]> {
    try {
      // 🧠 1. ANÁLISIS INTELIGENTE
      const intelligentAlerts = this.engine.analyze(schedulingData);

      // 🔄 2. CONVERSIÓN A FORMATO UNIFICADO
      const unifiedAlerts: Alert[] = intelligentAlerts.map(alert =>
        this.convertToUnifiedAlert(alert, schedulingData)
      );

      // 📊 3. ORDENAR POR PRIORIDAD Y URGENCIA
      const sortedAlerts = this.prioritizeAlerts(unifiedAlerts);

      // 📡 4. EMIT EVENTS PARA TRACKING
      this.emitAnalysisEvents(intelligentAlerts, schedulingData);

      return sortedAlerts;

    } catch (error) {
      logger.error('API', '❌ SchedulingAlertsAdapter: Error generating alerts:', error);
      EventBus.emit('scheduling.alert_generation_error', { error: String(error) });
      return [];
    }
  }

  /**
   * Convierte alerta inteligente al formato del sistema unificado
   */
  private convertToUnifiedAlert(alert: IntelligentAlert, data: SchedulingData): Alert {
    const actions = SCHEDULING_ALERT_ACTIONS[alert.type] || [];

    return {
      id: `scheduling_${alert.type}_${Date.now()}`,
      type: alert.severity,
      title: alert.title,
      description: this.enrichDescription(alert, data),
      timestamp: new Date(),
      source: 'scheduling',
      category: this.mapCategory(alert.type),
      priority: ALERT_PRIORITY_MAP[alert.severity],
      urgency: ALERT_URGENCY_MAP[alert.severity],
      actions,
      metadata: {
        ...(alert.metadata || {}),
        confidence: alert.confidence,
        recommendation: alert.recommendation,
        affectedEntities: alert.affectedAreas,
        businessImpact: this.calculateBusinessImpact(alert, data)
      }
    };
  }

  /**
   * Enriquece la descripción con contexto específico del negocio
   */
  private enrichDescription(alert: IntelligentAlert, data: SchedulingData): string {
    let enriched = alert.description;

    // 💰 CONTEXTO FINANCIERO
    if (alert.type.includes('cost') && alert.metadata && alert.metadata.costImpact) {
      const formattedCost = DecimalUtils.formatCurrency(alert.metadata.costImpact);
      enriched += ` Impacto estimado: ${formattedCost}`;
    }

    // 📊 CONTEXTO DE COBERTURA
    if (alert.type.includes('coverage') && data.schedulingStats) {
      const coverage = data.schedulingStats.coverage_percentage;
      enriched += ` Cobertura actual: ${coverage}%`;
    }

    // ⏱️ CONTEXTO TEMPORAL
    if (alert.metadata && alert.metadata.timeFrame) {
      enriched += ` Período: ${alert.metadata.timeFrame}`;
    }

    // 🎯 RECOMENDACIÓN ESPECÍFICA
    if (alert.recommendation) {
      enriched += ` Recomendación: ${alert.recommendation}`;
    }

    return enriched;
  }

  /**
   * Mapea tipos de alerta a categorías del sistema unificado
   */
  private mapCategory(alertType: string): string {
    const categoryMap: Record<string, string> = {
      'coverage_gap': 'staffing',
      'overtime_detected': 'labor_compliance',
      'understaffing': 'staffing',
      'high_labor_cost': 'financial',
      'coverage_critical': 'operations',
      'efficiency_low': 'performance',
      'compliance_violation': 'compliance',
      'predictive_issue': 'predictive'
    };

    return categoryMap[alertType] || 'general';
  }

  /**
   * Calcula el impacto en el negocio de la alerta
   */
  private calculateBusinessImpact(alert: IntelligentAlert, data: SchedulingData): string {
    const severity = alert.severity;
    const type = alert.type;

    // 🔴 IMPACTO CRÍTICO
    if (severity === 'critical') {
      if (type.includes('coverage')) {
        return 'Alto riesgo de pérdida de ventas y experiencia del cliente';
      }
      if (type.includes('cost')) {
        return 'Impacto financiero significativo en márgenes';
      }
      return 'Requiere atención inmediata para evitar disrupciones operativas';
    }

    // 🟡 IMPACTO MODERADO
    if (severity === 'warning') {
      if (type.includes('efficiency')) {
        return 'Posible reducción en productividad y satisfacción del equipo';
      }
      if (type.includes('overtime')) {
        return 'Incremento en costos laborales y riesgo de burnout';
      }
      return 'Monitoreo cercano requerido para prevenir escalamiento';
    }

    // 🔵 IMPACTO BAJO
    return 'Oportunidad de optimización identificada';
  }

  /**
   * Prioriza alertas según urgencia y impacto en el negocio
   */
  private prioritizeAlerts(alerts: Alert[]): Alert[] {
    return alerts.sort((a, b) => {
      // 1. Por prioridad (crítico primero)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // 2. Por confianza en la predicción
      const confidenceA = (a.metadata && a.metadata.confidence) || 0;
      const confidenceB = (b.metadata && b.metadata.confidence) || 0;
      if (confidenceA !== confidenceB) {
        return confidenceB - confidenceA;
      }

      // 3. Por timestamp (más reciente primero)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Emite eventos para tracking y coordinación con otros módulos
   * ✅ SAFE EVENT EMISSION - No ejecutado durante render cycles
   */
  private emitAnalysisEvents(alerts: IntelligentAlert[], data: SchedulingData): void {
    // ⚡ USAR setTimeout PARA EVITAR RENDER CYCLE EMISSION
    setTimeout(() => {
      // 📊 EVENTO GENERAL DE ANÁLISIS
      EventBus.emit('scheduling.intelligent_analysis_completed', {
        alertsGenerated: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        analysisTimestamp: new Date(),
        dataScope: {
          totalShifts: data.schedulingStats.total_shifts_this_week,
          employeesScheduled: data.schedulingStats.employees_scheduled,
          coveragePercentage: data.schedulingStats.coverage_percentage
        }
      });

      // 🚨 EVENTOS ESPECÍFICOS PARA ALERTAS CRÍTICAS
      alerts
        .filter(alert => alert.severity === 'critical')
        .forEach(alert => {
          EventBus.emit(`scheduling.critical_alert_${alert.type}`, {
            alertId: alert.title,
            confidence: alert.confidence,
            affectedAreas: alert.affectedAreas,
            recommendation: alert.recommendation,
            metadata: alert.metadata || {}
          });
        });

      // 🔗 EVENTOS PARA COORDINACIÓN CROSS-MODULE
      const crossModuleAlerts = alerts.filter(alert =>
        alert.affectedAreas.some(area => ['sales', 'inventory', 'hr'].includes(area))
      );

      if (crossModuleAlerts.length > 0) {
        EventBus.emit('scheduling.cross_module_impact_detected', {
          affectedModules: [...new Set(
            crossModuleAlerts.flatMap(alert => alert.affectedAreas)
          )],
          impactLevel: crossModuleAlerts.some(a => a.severity === 'critical') ? 'high' : 'medium'
        });
      }
    }, 0); // Deferred execution outside render cycle
  }

  /**
   * Maneja acciones de alerta y coordina respuestas
   */
  async handleAlertAction(
    alertId: string,
    actionId: string,
    context: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 📡 EMIT EVENT PARA TRACKING
      EventBus.emit('scheduling.alert_action_triggered', {
        alertId,
        actionId,
        timestamp: new Date(),
        context
      });

      // 🎯 EJECUTAR ACCIÓN ESPECÍFICA
      const result = await this.executeAlertAction(actionId, context);

      if (result.success) {
        EventBus.emit('scheduling.alert_action_completed', {
          alertId,
          actionId,
          result: result.message
        });
      } else {
        EventBus.emit('scheduling.alert_action_failed', {
          alertId,
          actionId,
          error: result.message
        });
      }

      return result;

    } catch (error) {
      logger.error('API', '❌ Error handling alert action:', error);
      return {
        success: false,
        message: `Error ejecutando acción: ${String(error)}`
      };
    }
  }

  /**
   * Ejecuta acciones específicas de alerta
   */
  private async executeAlertAction(
    actionId: string,
    context: any
  ): Promise<{ success: boolean; message: string }> {

    switch (actionId) {
      case 'find_coverage':
        // TODO: Integrar con módulo de Staff para buscar personal disponible
        EventBus.emit('staff.coverage_search_requested', context);
        return { success: true, message: 'Búsqueda de cobertura iniciada' };

      case 'review_overtime':
        // TODO: Navegar a vista de análisis de horas extra
        return { success: true, message: 'Análisis de horas extra activado' };

      case 'optimize_schedule':
        // TODO: Ejecutar algoritmo de optimización automática
        EventBus.emit('scheduling.auto_optimization_requested', context);
        return { success: true, message: 'Optimización automática iniciada' };

      case 'emergency_staffing':
        // TODO: Activar protocolo de personal de emergencia
        EventBus.emit('scheduling.emergency_protocol_activated', context);
        return { success: true, message: 'Protocolo de emergencia activado' };

      default:
        return {
          success: false,
          message: `Acción no reconocida: ${actionId}`
        };
    }
  }
}

// ✅ FACTORY FUNCTION PARA EASY INTEGRATION
export function createSchedulingAlertsAdapter(): SchedulingAlertsAdapter {
  return new SchedulingAlertsAdapter();
}

// ✅ TIPOS PARA EXPORT
export type { Alert } from '@/shared/types/alerts';