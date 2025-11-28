/**
 * MATERIALS ALERTS ADAPTER
 * ============================================================================
 * Adapts Materials module data to unified alert system
 * Uses V2 SmartAlertsEngine
 * 
 * @module modules/materials/alerts/adapter
 * @see docs/alert/ALERT_ARCHITECTURE_V2.md
 */

import type { CreateAlertInput } from '@/shared/alerts/types';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import { materialsAlertsEngine } from './engine';
import { logger } from '@/lib/logging';

/**
 * Materials Alerts Adapter
 * Generates smart alerts for materials using V2 architecture
 */
export class MaterialsAlertsAdapter {
  /**
   * Generate smart alerts for materials
   * 
   * @param materials - Array of materials with ABC classification
   * @returns Array of CreateAlertInput ready for bulk creation
   * 
   * @example
   * ```typescript
   * const alerts = await MaterialsAlertsAdapter.generateAlerts(materials);
   * const alertIds = await alertsActions.bulkCreate(alerts);
   * ```
   */
  static async generateAlerts(materials: MaterialABC[]): Promise<CreateAlertInput[]> {
    try {
      if (!materials || materials.length === 0) {
        logger.debug('Materials', 'No materials to evaluate for alerts');
        return [];
      }

      // Use V2 SmartAlertsEngine to evaluate all rules
      const alerts = materialsAlertsEngine.evaluate(materials);
      
      logger.info('Materials', `Generated ${alerts.length} alerts from ${materials.length} materials`, {
        materialsCount: materials.length,
        alertsCount: alerts.length,
        severityBreakdown: alerts.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      return alerts;
      
    } catch (error) {
      logger.error('Materials', 'Error generating alerts', error);
      return [];
    }
  }

  /**
   * Generate alerts for a single material
   * Useful for real-time updates when a material changes
   * 
   * @param material - Single material with ABC classification
   * @returns Array of CreateAlertInput (usually 0-3 alerts)
   */
  static async generateAlertsForItem(material: MaterialABC): Promise<CreateAlertInput[]> {
    return this.generateAlerts([material]);
  }
}

/**
 * Default export for convenience
 */
export default MaterialsAlertsAdapter;
