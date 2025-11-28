/**
 * MATERIALS ALERTS ENGINE INSTANCE
 * ============================================================================
 * Pre-configured SmartAlertsEngine for Materials module (StockLab)
 * 
 * @module modules/materials/alerts/engine
 * @see docs/alert/ALERT_ARCHITECTURE_V2.md
 */

import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { MATERIALS_SMART_RULES } from './rules';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

/**
 * Materials smart alerts engine
 * Evaluates materials data against business intelligence rules
 * 
 * Configuration:
 * - Circuit breaker: 3000ms (prevents excessive evaluation)
 * - Max alerts: 100 per evaluation
 * - Context: 'materials' (for alert filtering)
 * - Debug: Disabled (enable for detailed logs)
 * 
 * @example
 * ```typescript
 * import { materialsAlertsEngine } from '@/modules/materials/alerts/engine';
 * 
 * const alerts = materialsAlertsEngine.evaluate(materialsData);
 * await alertsActions.bulkCreate(alerts);
 * ```
 */
export const materialsAlertsEngine = new SmartAlertsEngine<MaterialABC>({
  rules: MATERIALS_SMART_RULES,
  context: 'materials',
  circuitBreakerInterval: 3000, // 3 seconds
  maxAlertsPerEvaluation: 100,
  debug: false // Set to true for detailed evaluation logs
});

/**
 * Re-export rules for testing and documentation
 */
export { MATERIALS_SMART_RULES } from './rules';
export type { MaterialABC };
