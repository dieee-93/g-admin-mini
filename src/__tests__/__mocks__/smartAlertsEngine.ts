/**
 * STOCKLAB TESTS - TEMPORARY COMPATIBILITY WRAPPER
 * ============================================================================
 * This file provides backward compatibility for stocklab tests during V2 migration
 * 
 * @deprecated Tests should import directly from @/modules/materials/alerts/engine
 */

import { materialsAlertsEngine } from '../modules/materials/alerts/engine';
import type { MaterialABC } from '../pages/admin/supply-chain/materials/types/abc-analysis';
import type { CreateAlertInput } from '../shared/alerts/types';

/**
 * @deprecated Use materialsAlertsEngine.evaluate() directly
 */
export class SmartAlertsEngine {
  /**
   * @deprecated Use materialsAlertsEngine.evaluate(materials) instead
   * This method maintains V1 API compatibility for tests
   */
  static generateSmartAlerts(materials: MaterialABC[]): CreateAlertInput[] {
    return materialsAlertsEngine.evaluate(materials);
  }
}

/**
 * @deprecated Import SmartAlert type is no longer needed
 * V2 returns CreateAlertInput[] directly
 */
export type SmartAlert = CreateAlertInput;
