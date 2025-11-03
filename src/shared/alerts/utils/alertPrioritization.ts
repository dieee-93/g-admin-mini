/**
 * ALERT PRIORITIZATION UTILITIES
 * ============================================================================
 * Funciones comunes para priorizar y filtrar alertas
 * Reutilizable por todos los Intelligence Engines
 *
 * @module shared/alerts/utils/alertPrioritization
 */

import { compareSeverity } from './severityMapping';
import type { AlertSeverity } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PrioritizationConfig {
  /**
   * Máximo de alertas por grupo
   * @default 3
   */
  maxAlertsPerGroup?: number;

  /**
   * Criterio de agrupación
   * - 'type': Agrupar por tipo de alerta
   * - 'context': Agrupar por contexto (módulo)
   * - 'severity': Agrupar por severidad
   * @default 'type'
   */
  groupBy?: 'type' | 'context' | 'severity';

  /**
   * Si se debe preservar el orden original dentro de cada grupo
   * @default false
   */
  preserveOrder?: boolean;
}

/**
 * Interface mínima requerida para alertas que se pueden priorizar
 */
export interface PrioritizableAlert {
  severity: AlertSeverity | string;
  actionPriority?: number;
  type?: string;
  context?: string;
}

// ============================================================================
// PRIORITIZATION FUNCTIONS
// ============================================================================

/**
 * Prioriza y filtra alertas basándose en prioridad y severidad
 * Función genérica reutilizable por todos los Intelligence Engines
 *
 * @param alerts - Array de alertas a priorizar
 * @param config - Configuración de priorización
 * @returns Array de alertas priorizadas y filtradas
 *
 * @example
 * ```typescript
 * const alerts = [
 *   { type: 'stock', severity: 'medium', actionPriority: 3 },
 *   { type: 'stock', severity: 'critical', actionPriority: 5 },
 *   { type: 'revenue', severity: 'high', actionPriority: 4 }
 * ];
 *
 * const prioritized = prioritizeAlerts(alerts, {
 *   maxAlertsPerGroup: 2,
 *   groupBy: 'type'
 * });
 * // Resultado: Las 2 alertas de mayor prioridad por tipo
 * ```
 */
export function prioritizeAlerts<T extends PrioritizableAlert>(
  alerts: T[],
  config: PrioritizationConfig = {}
): T[] {
  const {
    maxAlertsPerGroup = 3,
    groupBy = 'type',
    preserveOrder = false
  } = config;

  if (alerts.length === 0) {
    return [];
  }

  // 1. Ordenar por prioridad de acción y severidad
  const prioritized = preserveOrder
    ? [...alerts]
    : sortByPriorityAndSeverity(alerts);

  // 2. Agrupar y limitar por grupo
  const grouped = new Map<string, T[]>();

  prioritized.forEach(alert => {
    const groupKey = getGroupKey(alert, groupBy);

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }

    const groupAlerts = grouped.get(groupKey)!;
    if (groupAlerts.length < maxAlertsPerGroup) {
      groupAlerts.push(alert);
    }
  });

  // 3. Convertir de vuelta a array plano
  return Array.from(grouped.values()).flat();
}

/**
 * Ordena alertas por prioridad de acción y severidad
 *
 * @param alerts - Alertas a ordenar
 * @returns Alertas ordenadas (mayor prioridad primero)
 */
function sortByPriorityAndSeverity<T extends PrioritizableAlert>(
  alerts: T[]
): T[] {
  return [...alerts].sort((a, b) => {
    // Primero por actionPriority (si existe)
    if (a.actionPriority !== undefined && b.actionPriority !== undefined) {
      if (a.actionPriority !== b.actionPriority) {
        return b.actionPriority - a.actionPriority;
      }
    }

    // Luego por severidad
    return compareSeverity(a.severity as AlertSeverity, b.severity as AlertSeverity);
  });
}

/**
 * Obtiene la clave de agrupación para una alerta
 */
function getGroupKey<T extends PrioritizableAlert>(
  alert: T,
  groupBy: 'type' | 'context' | 'severity'
): string {
  switch (groupBy) {
    case 'type':
      return alert.type || 'default';
    case 'context':
      return alert.context || 'default';
    case 'severity':
      return alert.severity;
    default:
      return 'default';
  }
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Filtra alertas por severidad mínima
 *
 * @param alerts - Alertas a filtrar
 * @param minSeverity - Severidad mínima
 * @returns Alertas que cumplen la severidad mínima
 *
 * @example
 * ```typescript
 * const alerts = [
 *   { severity: 'critical' },
 *   { severity: 'medium' },
 *   { severity: 'low' }
 * ];
 *
 * filterBySeverity(alerts, 'medium');
 * // Resultado: [critical, medium] (excluye 'low')
 * ```
 */
export function filterBySeverity<T extends PrioritizableAlert>(
  alerts: T[],
  minSeverity: AlertSeverity
): T[] {
  const minLevel = getSeverityLevel(minSeverity);

  return alerts.filter(alert => {
    const alertLevel = getSeverityLevel(alert.severity as AlertSeverity);
    return alertLevel >= minLevel;
  });
}

/**
 * Helper: Obtiene nivel numérico de severidad
 */
function getSeverityLevel(severity: AlertSeverity): number {
  const levels: Record<AlertSeverity, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1,
    'info': 0
  };

  return levels[severity] || 0;
}

/**
 * Filtra alertas por tipo
 *
 * @param alerts - Alertas a filtrar
 * @param types - Tipos permitidos
 * @returns Alertas del tipo especificado
 */
export function filterByType<T extends PrioritizableAlert>(
  alerts: T[],
  types: string[]
): T[] {
  return alerts.filter(alert => alert.type && types.includes(alert.type));
}

/**
 * Filtra alertas por contexto
 *
 * @param alerts - Alertas a filtrar
 * @param contexts - Contextos permitidos
 * @returns Alertas del contexto especificado
 */
export function filterByContext<T extends PrioritizableAlert>(
  alerts: T[],
  contexts: string[]
): T[] {
  return alerts.filter(alert => alert.context && contexts.includes(alert.context));
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

/**
 * Elimina alertas duplicadas basándose en una clave
 *
 * @param alerts - Alertas a deduplicar
 * @param keyFn - Función que genera la clave única
 * @returns Alertas sin duplicados
 *
 * @example
 * ```typescript
 * const alerts = [
 *   { id: '1', type: 'stock', itemId: 'A' },
 *   { id: '2', type: 'stock', itemId: 'A' }, // Duplicado
 *   { id: '3', type: 'stock', itemId: 'B' }
 * ];
 *
 * deduplicateAlerts(alerts, alert => `${alert.type}-${alert.itemId}`);
 * // Resultado: Solo 2 alertas (elimina el duplicado)
 * ```
 */
export function deduplicateAlerts<T extends PrioritizableAlert>(
  alerts: T[],
  keyFn: (alert: T) => string
): T[] {
  const seen = new Map<string, T>();

  alerts.forEach(alert => {
    const key = keyFn(alert);
    if (!seen.has(key)) {
      seen.set(key, alert);
    } else {
      // Si hay duplicado, mantener el de mayor prioridad
      const existing = seen.get(key)!;
      const existingPriority = existing.actionPriority || 0;
      const currentPriority = alert.actionPriority || 0;

      if (currentPriority > existingPriority) {
        seen.set(key, alert);
      }
    }
  });

  return Array.from(seen.values());
}
