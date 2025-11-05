/**
 * ALERT FORMATTING UTILITIES
 * ============================================================================
 * Funciones para enriquecer y formatear descripciones de alertas
 * Reutilizable por todos los Adapters
 *
 * @module shared/alerts/utils/alertFormatting
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EnrichmentOptions {
  /**
   * Mostrar categoría/clase del item
   * @default true
   */
  showCategory?: boolean;

  /**
   * Mostrar desviación del umbral
   * @default true
   */
  showDeviation?: boolean;

  /**
   * Mostrar prioridad de acción
   * @default true
   */
  showPriority?: boolean;

  /**
   * Mostrar recomendación
   * @default true
   */
  showRecommendation?: boolean;

  /**
   * Usar emojis en el formato
   * @default true
   */
  emojis?: boolean;

  /**
   * Formato de la desviación
   * - 'percentage': Mostrar como porcentaje (ej: "15%")
   * - 'absolute': Mostrar valor absoluto (ej: "15 unidades")
   * @default 'percentage'
   */
  deviationFormat?: 'percentage' | 'absolute';
}

/**
 * Alert mínima para enriquecimiento
 */
export interface EnrichableAlert {
  description: string;
  category?: string;
  deviation?: number;
  currentValue?: number;
  thresholdValue?: number;
  actionPriority?: number;
  recommendedAction?: string;
  [key: string]: unknown;
}

// ============================================================================
// ENRICHMENT FUNCTIONS
// ============================================================================

/**
 * Enriquece la descripción de una alerta con información adicional
 *
 * Agrega automáticamente:
 * - Categoría del item (si existe)
 * - Desviación del umbral
 * - Prioridad de acción
 * - Recomendación sugerida
 *
 * @param alert - Alerta a enriquecer
 * @param options - Opciones de enriquecimiento
 * @returns Descripción enriquecida
 *
 * @example
 * ```typescript
 * const alert = {
 *   description: 'Stock bajo detectado',
 *   category: 'Clase A',
 *   deviation: 15.5,
 *   currentValue: 10,
 *   thresholdValue: 50,
 *   actionPriority: 5,
 *   recommendedAction: 'Contactar proveedor inmediatamente'
 * };
 *
 * const enriched = enrichDescription(alert);
 * // Resultado: Descripción + información de categoría, desviación, prioridad y recomendación
 * ```
 */
export function enrichDescription<T extends EnrichableAlert>(
  alert: T,
  options: EnrichmentOptions = {}
): string {
  const {
    showCategory = true,
    showDeviation = true,
    showPriority = true,
    showRecommendation = true,
    emojis = true,
    deviationFormat = 'percentage'
  } = options;

  let enriched = alert.description;

  // Agregar categoría
  if (showCategory && alert.category) {
    const emoji = emojis ? '📊 ' : '';
    enriched += `\n\n${emoji}**Categoría**: ${alert.category}`;
  }

  // Agregar desviación
  if (showDeviation && alert.deviation !== undefined && alert.deviation > 0) {
    enriched += '\n' + formatDeviation(alert, deviationFormat, emojis);
  }

  // Agregar prioridad
  if (showPriority && alert.actionPriority !== undefined) {
    const emoji = emojis ? '⏰ ' : '';
    const priorityText = getPriorityText(alert.actionPriority);
    enriched += `\n${emoji}**Prioridad**: ${priorityText}`;
  }

  // Agregar recomendación
  if (showRecommendation && alert.recommendedAction) {
    const emoji = emojis ? '\n\n💡 ' : '\n\n';
    enriched += `${emoji}**Recomendación**: ${alert.recommendedAction}`;
  }

  return enriched;
}

/**
 * Formatea la desviación de una alerta
 */
function formatDeviation<T extends EnrichableAlert>(
  alert: T,
  format: 'percentage' | 'absolute',
  useEmojis: boolean
): string {
  const emoji = useEmojis ? '📈 ' : '';
  const direction = alert.currentValue && alert.thresholdValue && alert.currentValue > alert.thresholdValue
    ? 'por encima'
    : 'por debajo';

  let deviationText: string;

  if (format === 'percentage') {
    deviationText = `${alert.deviation!.toFixed(1)}%`;
  } else {
    const absoluteDeviation = Math.abs((alert.currentValue || 0) - (alert.thresholdValue || 0));
    deviationText = `${absoluteDeviation.toFixed(1)} unidades`;
  }

  return `${emoji}**Desviación**: ${deviationText} ${direction} del umbral`;
}

/**
 * Obtiene el texto en español para el nivel de prioridad
 *
 * @param priority - Nivel de prioridad (1-5)
 * @returns Texto descriptivo
 */
export function getPriorityText(priority: number): string {
  if (priority >= 5) return 'Muy Alta';
  if (priority >= 4) return 'Alta';
  if (priority >= 3) return 'Media';
  if (priority >= 2) return 'Baja';
  return 'Muy Baja';
}

// ============================================================================
// CLASS/CATEGORY DESCRIPTIONS
// ============================================================================

/**
 * Obtiene descripción para clase ABC
 *
 * @param abcClass - Clase ABC (A, B, C)
 * @returns Descripción de la clase
 */
export function getABCClassDescription(abcClass: 'A' | 'B' | 'C'): string {
  const descriptions = {
    'A': 'Alta rotación - Crítico para operación',
    'B': 'Rotación media - Importante',
    'C': 'Baja rotación - Complementario'
  };

  return descriptions[abcClass];
}

/**
 * Obtiene emoji para clase ABC
 */
export function getABCClassEmoji(abcClass: 'A' | 'B' | 'C'): string {
  const emojis = {
    'A': '🔴',
    'B': '🟡',
    'C': '🟢'
  };

  return emojis[abcClass];
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Formatea tiempo hasta acción requerida
 *
 * @param timeToAction - Tiempo hasta acción
 * @returns Texto formateado
 */
export function formatTimeToAction(
  timeToAction: 'immediate' | 'within_1h' | 'within_24h' | 'within_week' | 'next_month'
): string {
  const timeMap = {
    'immediate': 'Inmediato',
    'within_1h': 'En 1 hora',
    'within_24h': 'En 24 horas',
    'within_week': 'Esta semana',
    'next_month': 'Próximo mes'
  };

  return timeMap[timeToAction] || 'Sin especificar';
}

/**
 * Formatea tiempo relativo
 *
 * @param date - Fecha a formatear
 * @returns Texto en formato relativo (ej: "Hace 2h")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Hace un momento';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
  return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
}

// ============================================================================
// TRUNCATION
// ============================================================================

/**
 * Trunca descripción si excede longitud máxima
 *
 * @param description - Descripción a truncar
 * @param maxLength - Longitud máxima (default: 500)
 * @returns Descripción truncada si es necesario
 */
export function truncateDescription(description: string, maxLength: number = 500): string {
  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// MARKDOWN FORMATTING
// ============================================================================

/**
 * Convierte texto plano a markdown básico
 *
 * @param text - Texto a convertir
 * @returns Texto en formato markdown
 */
export function toMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '**$1**') // Bold
    .replace(/\n/g, '\n\n'); // Double line breaks
}

/**
 * Limpia markdown de un texto (útil para notificaciones de texto plano)
 *
 * @param text - Texto con markdown
 * @returns Texto sin formato markdown
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\n\n/g, ' ') // Remove double line breaks
    .replace(/[📊📈⏰💡🔴🟡🟢]/g, ''); // Remove emojis
}
