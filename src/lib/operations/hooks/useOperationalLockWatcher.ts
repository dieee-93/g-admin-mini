/**
 * useOperationalLockWatcher Hook
 *
 * This hook is responsible for watching for changes in the application state
 * that could affect the operational readiness of the business capabilities.
 * It calls the OperationalLockService to recalculate the status when needed.
 *
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { checkOperationalReadiness } from '@/lib/operational-lock/OperationalLockService';
import { useBusinessProfile } from '@/lib/capabilities';
import { useSettingsPage } from '@/pages/admin/core/settings/hooks/useSettingsPage';

export function useOperationalLockWatcher() {
  const { profile } = useBusinessProfile();
  const selectedCapabilities = profile?.selectedCapabilities;
  const { settingsData } = useSettingsPage();

  useEffect(() => {
    // This effect will run whenever the selected capabilities or settings data change.
    checkOperationalReadiness(settingsData);
  }, [selectedCapabilities, settingsData]);
}
