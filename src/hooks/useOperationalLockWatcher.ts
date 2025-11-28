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
import { checkOperationalReadiness } from '@/services/OperationalLockService';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useSettingsPage } from '@/pages/admin/core/settings/hooks/useSettingsPage';

export function useOperationalLockWatcher() {
  const selectedCapabilities = useCapabilityStore(state => state.profile?.selectedCapabilities);
  const { settingsData } = useSettingsPage();

  useEffect(() => {
    // This effect will run whenever the selected capabilities or settings data change.
    checkOperationalReadiness(settingsData);
  }, [selectedCapabilities, settingsData]);
}
