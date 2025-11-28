/**
 * MATERIALS SMART ALERTS ADAPTER (Legacy Wrapper)
 * ============================================================================
 * @deprecated This file provides backward compatibility only
 * New code should import directly from @/modules/materials/alerts/adapter
 * 
 * Migration path:
 * Before: import { SmartAlertsAdapter } from '@/pages/.../smartAlertsAdapter'
 * After:  import MaterialsAlertsAdapter from '@/modules/materials/alerts/adapter'
 */

import MaterialsAlertsAdapter from '@/modules/materials/alerts/adapter';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import type { CreateAlertInput } from '@/shared/alerts/types';

/**
 * @deprecated Use MaterialsAlertsAdapter from @/modules/materials/alerts/adapter
 */
export class SmartAlertsAdapter {
  /**
   * @deprecated Use MaterialsAlertsAdapter.generateAlerts() directly
   */
  static async generateAlerts(materials: MaterialABC[]): Promise<CreateAlertInput[]> {
    return MaterialsAlertsAdapter.generateAlerts(materials);
  }

  /**
   * @deprecated Alias for generateAlerts() - use MaterialsAlertsAdapter.generateAlerts()
   */
  static async generateMaterialsAlerts(materials: MaterialABC[]): Promise<CreateAlertInput[]> {
    return MaterialsAlertsAdapter.generateAlerts(materials);
  }
}

export default SmartAlertsAdapter;
