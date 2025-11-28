import React, { useMemo } from 'react';
import { Stack } from '@chakra-ui/react';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const headerActions = useMemo(() => (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  ), []);

  return (
    <ResponsiveLayout headerActions={headerActions}>
      {children}
    </ResponsiveLayout>
  );
}