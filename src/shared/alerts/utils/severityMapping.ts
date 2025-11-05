/**
 * SEVERITY MAPPING UTILITIES
 * ============================================================================
 * Mapeos estándar entre sistemas de severidad de diferentes módulos
 * Reutilizable por todos los Intelligence Engines y Adapters
 *
 * @module shared/alerts/utils/severityMapping
 */

import type { AlertSeverity } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Mapeo de severidades de módulos específicos → Sistema unificado
 *
 * Mapeos soportados:
 * - 'urgent' → 'critical' (máxima prioridad)
 * - 'critical' → 'high' (alta prioridad)
 * - 'warning' → 'medium' (media prioridad)
 * - 'info' → 'low' (baja prioridad)
 */
export const SEVERITY_TO_UNIFIED: Record<string, AlertSeverity> = {
  'urgent': 'critical',
  'critical': 'high',
  'warning': 'medium',
  'info': 'low',
  // Aliases comunes
  'error': 'high',
  'danger': 'high',
  'success': 'info',
  'notification': 'low'
};

/**
 * Orden numérico de severidades (para sorting)
 * Mayor número = mayor severidad
 */
export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  'critical': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
  'info': 0
};

/**
 * Colores estándar por severidad (compatible con ChakraUI)
 */
export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  'critical': 'red',
  'high': 'orange',
  'medium': 'yellow',
  'low': 'blue',
  'info': 'gray'
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Mapea severidad de módulo a severidad del sistema unificado
 *
 * @param moduleSeverity - Severidad específica del módulo (e.g., 'urgent', 'warning')
 * @returns Severidad del sistema unificado
 *
 * @example
 * ```typescript
 * mapSeverity('urgent')   // → 'critical'
 * mapSeverity('warning')  // → 'medium'
 * mapSeverity('unknown')  // → 'medium' (default)
 * ```
 */
export function mapSeverity(moduleSeverity: string): AlertSeverity {
  return SEVERITY_TO_UNIFIED[moduleSeverity.toLowerCase()] || 'medium';
}

/**
 * Compara dos severidades (para sorting)
 *
 * @param a - Primera severidad
 * @param b - Segunda severidad
 * @returns Número negativo si a < b, positivo si a > b, 0 si iguales
 *
 * @example
 * ```typescript
 * const alerts = [
 *   { severity: 'low' },
 *   { severity: 'critical' },
 *   { severity: 'medium' }
 * ];
 *
 * alerts.sort((a, b) => compareSeverity(a.severity, b.severity));
 * // Resultado: [critical, medium, low] (mayor a menor)
 * ```
 */
export function compareSeverity(a: AlertSeverity, b: AlertSeverity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}

/**
 * Obtiene el nivel numérico de una severidad
 *
 * @param severity - Severidad a evaluar
 * @returns Nivel numérico (0-4)
 *
 * @example
 * ```typescript
 * getSeverityLevel('critical')  // → 4
 * getSeverityLevel('medium')    // → 2
 * getSeverityLevel('info')      // → 0
 * ```
 */
export function getSeverityLevel(severity: AlertSeverity): number {
  return SEVERITY_ORDER[severity];
}

/**
 * Verifica si una severidad es crítica o alta
 *
 * @param severity - Severidad a verificar
 * @returns true si es critical o high
 *
 * @example
 * ```typescript
 * isHighPriority('critical')  // → true
 * isHighPriority('high')      // → true
 * isHighPriority('medium')    // → false
 * ```
 */
export function isHighPriority(severity: AlertSeverity): boolean {
  return severity === 'critical' || severity === 'high';
}

/**
 * Obtiene el color asociado a una severidad
 *
 * @param severity - Severidad
 * @returns Color de ChakraUI
 *
 * @example
 * ```typescript
 * getSeverityColor('critical')  // → 'red'
 * getSeverityColor('warning')   // → 'yellow'
 * ```
 */
export function getSeverityColor(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity];
}

/**
 * Texto en español para severidad
 *
 * @param severity - Severidad
 * @returns Texto en español
 *
 * @example
 * ```typescript
 * getSeverityText('critical')  // → 'Crítica'
 * getSeverityText('medium')    // → 'Media'
 * ```
 */
export function getSeverityText(severity: AlertSeverity): string {
  const textMap: Record<AlertSeverity, string> = {
    'critical': 'Crítica',
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Baja',
    'info': 'Informativa'
  };

  return textMap[severity];
}
