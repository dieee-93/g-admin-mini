/**
 * AdminHeaderActions - Header actions for Admin Portal
 * 
 * Provides: ConnectionStatus + NavAlertBadge
 * 
 * Used in App.tsx:
 * <AppShell headerActions={<AdminHeaderActions />} />
 */

import { Stack } from '@/shared/ui';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { memo } from 'react';

export const AdminHeaderActions = memo(function AdminHeaderActions() {
  return (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  );
});
