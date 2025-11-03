/**
 * ALERT UTILITIES
 * ============================================================================
 * Funciones compartidas para Intelligence Engines y Adapters
 * Centralizadas para evitar duplicación de código
 *
 * @module shared/alerts/utils
 */

// ============================================================================
// SEVERITY MAPPING
// ============================================================================

export {
  // Constants
  SEVERITY_TO_UNIFIED,
  SEVERITY_ORDER,
  SEVERITY_COLORS,

  // Functions
  mapSeverity,
  compareSeverity,
  getSeverityLevel,
  isHighPriority,
  getSeverityColor,
  getSeverityText
} from './severityMapping';

// ============================================================================
// ALERT PRIORITIZATION
// ============================================================================

export {
  // Functions
  prioritizeAlerts,
  filterBySeverity,
  filterByType,
  filterByContext,
  deduplicateAlerts,

  // Types
  type PrioritizationConfig,
  type PrioritizableAlert
} from './alertPrioritization';

// ============================================================================
// ALERT FORMATTING
// ============================================================================

export {
  // Functions
  enrichDescription,
  getPriorityText,
  getABCClassDescription,
  getABCClassEmoji,
  formatTimeToAction,
  formatRelativeTime,
  truncateDescription,
  toMarkdown,
  stripMarkdown,

  // Types
  type EnrichmentOptions,
  type EnrichableAlert
} from './alertFormatting';

// ============================================================================
// ALERT LIFECYCLE
// ============================================================================

export {
  // Constants
  DEFAULT_TTL,
  MIN_TTL,
  MAX_TTL,

  // Functions
  calculateExpiration,
  shouldBePersistent,
  isExpired,
  getTimeUntilExpiration,
  formatTimeRemaining,
  getAutoExpireTime,
  getStockAlertExpiration,
  getBusinessAlertExpiration,

  // Types
  type LifecycleConfig
} from './alertLifecycle';
