/**
 * ALERT LIFECYCLE UTILITIES
 * ============================================================================
 * TTL, expiración, y configuración de ciclo de vida de alertas
 * Reutilizable por todos los Adapters
 *
 * @module shared/alerts/utils/alertLifecycle
 */

import type { AlertSeverity } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface LifecycleConfig {
  /**
   * TTL personalizado por severidad (en milisegundos)
   * Si no se especifica, se usan valores por defecto
   */
  ttlBySeverity?: Partial<Record<AlertSeverity, number>>;

  /**
   * Si la alerta debe ser persistente (no expira nunca)
   * @default false
   */
  persistent?: boolean;

  /**
   * Factor multiplicador del TTL default
   * Útil para ajustar todos los TTL sin especificar cada uno
   * @default 1.0
   */
  ttlMultiplier?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * TTL por defecto para cada nivel de severidad
 *
 * - critical: 2 horas (requiere acción inmediata)
 * - high: 4 horas (requiere acción pronto)
 * - medium: 24 horas (revisar durante el día)
 * - low: 3 días (revisar esta semana)
 * - info: 7 días (informativo)
 */
export const DEFAULT_TTL: Record<AlertSeverity, number> = {
  'critical': 2 * 60 * 60 * 1000,      // 2 hours
  'high': 4 * 60 * 60 * 1000,          // 4 hours
  'medium': 24 * 60 * 60 * 1000,       // 24 hours
  'low': 3 * 24 * 60 * 60 * 1000,      // 3 days
  'info': 7 * 24 * 60 * 60 * 1000      // 7 days
};

/**
 * TTL mínimo recomendado (5 minutos)
 * Evita que las alertas expiren demasiado rápido
 */
export const MIN_TTL = 5 * 60 * 1000;

/**
 * TTL máximo recomendado (30 días)
 * Evita que las alertas persistan indefinidamente
 */
export const MAX_TTL = 30 * 24 * 60 * 60 * 1000;

// ============================================================================
// EXPIRATION FUNCTIONS
// ============================================================================

/**
 * Calcula el timestamp de expiración para una alerta
 *
 * @param severity - Severidad de la alerta
 * @param config - Configuración de lifecycle
 * @returns Timestamp de expiración en milisegundos, o undefined si es persistente
 *
 * @example
 * ```typescript
 * // Usar TTL por defecto
 * calculateExpiration('critical');
 * // → Date.now() + 2 hours
 *
 * // Alerta persistente (no expira)
 * calculateExpiration('critical', { persistent: true });
 * // → undefined
 *
 * // TTL personalizado
 * calculateExpiration('medium', {
 *   ttlBySeverity: { medium: 12 * 60 * 60 * 1000 } // 12 hours
 * });
 * // → Date.now() + 12 hours
 * ```
 */
export function calculateExpiration(
  severity: AlertSeverity,
  config: LifecycleConfig = {}
): number | undefined {
  const {
    persistent = false,
    ttlBySeverity,
    ttlMultiplier = 1.0
  } = config;

  // Si es persistente, no expira
  if (persistent) {
    return undefined;
  }

  // Obtener TTL base
  let ttl = ttlBySeverity?.[severity] || DEFAULT_TTL[severity];

  // Aplicar multiplicador
  ttl = ttl * ttlMultiplier;

  // Asegurar que esté dentro de límites razonables
  ttl = Math.max(MIN_TTL, Math.min(MAX_TTL, ttl));

  return Date.now() + ttl;
}

/**
 * Determina si una alerta debe ser persistente basándose en su severidad
 *
 * 🎯 UPDATED: Ahora persiste critical, high Y medium
 * Las alertas low e info NO se persisten (son informativas/temporales)
 *
 * RATIONALE:
 * - critical/high: Requieren acción inmediata → persisten
 * - medium: Alertas de negocio importantes (stock bajo) → persisten ✅
 * - low/info: Informativas, pueden auto-expirar
 *
 * @param severity - Severidad de la alerta
 * @returns true si debe ser persistente
 *
 * @example
 * ```typescript
 * shouldBePersistent('critical')  // → true
 * shouldBePersistent('high')      // → true
 * shouldBePersistent('medium')    // → true ✅ NEW
 * shouldBePersistent('low')       // → false
 * shouldBePersistent('info')      // → false
 * ```
 */
export function shouldBePersistent(severity: AlertSeverity): boolean {
  // ✅ Persist critical, high AND medium (business-important alerts)
  return severity === 'critical' || severity === 'high' || severity === 'medium';
}

/**
 * Verifica si una alerta ha expirado
 *
 * @param expiresAt - Timestamp de expiración (o undefined si no expira)
 * @returns true si la alerta ha expirado
 *
 * @example
 * ```typescript
 * const expiresAt = Date.now() - 1000; // Expiró hace 1 segundo
 * isExpired(expiresAt);  // → true
 *
 * isExpired(undefined);  // → false (persistente, nunca expira)
 * ```
 */
export function isExpired(expiresAt: number | undefined): boolean {
  if (expiresAt === undefined) {
    return false; // Persistente, nunca expira
  }

  return Date.now() > expiresAt;
}

/**
 * Calcula el tiempo restante hasta expiración (en milisegundos)
 *
 * @param expiresAt - Timestamp de expiración
 * @returns Milisegundos hasta expiración, o Infinity si no expira
 *
 * @example
 * ```typescript
 * const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // Expira en 2 horas
 * getTimeUntilExpiration(expiresAt);  // → ~7200000 (2 horas en ms)
 *
 * getTimeUntilExpiration(undefined);  // → Infinity
 * ```
 */
export function getTimeUntilExpiration(expiresAt: number | undefined): number {
  if (expiresAt === undefined) {
    return Infinity; // No expira
  }

  const remaining = expiresAt - Date.now();
  return Math.max(0, remaining);
}

/**
 * Formatea tiempo restante en texto legible
 *
 * @param expiresAt - Timestamp de expiración
 * @returns Texto descriptivo del tiempo restante
 *
 * @example
 * ```typescript
 * const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutos
 * formatTimeRemaining(expiresAt);  // → "30 minutos"
 *
 * const expiresAt2 = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
 * formatTimeRemaining(expiresAt2);  // → "2 horas"
 * ```
 */
export function formatTimeRemaining(expiresAt: number | undefined): string {
  if (expiresAt === undefined) {
    return 'No expira';
  }

  const remaining = getTimeUntilExpiration(expiresAt);

  if (remaining === 0) {
    return 'Expirado';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  }

  return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
}

// ============================================================================
// AUTO-EXPIRATION HELPERS
// ============================================================================

/**
 * Calcula tiempo de auto-expiración basado en el tipo de alerta
 * (helper legacy para compatibilidad con código existente)
 *
 * @param severity - Severidad de la alerta
 * @returns TTL en milisegundos
 *
 * @deprecated Use calculateExpiration instead
 */
export function getAutoExpireTime(severity: AlertSeverity): number {
  return DEFAULT_TTL[severity];
}

/**
 * Calcula tiempo de auto-expiración para alertas de stock
 * Stock alerts tienden a necesitar menos tiempo
 *
 * @param severity - Severidad de la alerta
 * @returns TTL en milisegundos
 */
export function getStockAlertExpiration(severity: AlertSeverity): number {
  // Stock alerts expiran más rápido (factor 0.5x)
  return calculateExpiration(severity, { ttlMultiplier: 0.5 })!;
}

/**
 * Calcula tiempo de auto-expiración para alertas de negocio/revenue
 * Business alerts persisten más tiempo
 *
 * @param severity - Severidad de la alerta
 * @returns TTL en milisegundos
 */
export function getBusinessAlertExpiration(severity: AlertSeverity): number {
  // Business alerts persisten más (factor 1.5x)
  return calculateExpiration(severity, { ttlMultiplier: 1.5 })!;
}
