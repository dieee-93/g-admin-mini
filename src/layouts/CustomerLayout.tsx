import React, { useMemo } from 'react';
import { Stack } from '@chakra-ui/react';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { ShoppingCartHeaderIcon } from '@/modules/sales/ecommerce/components/ShoppingCartHeaderIcon';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const headerActions = useMemo(() => (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <ShoppingCartHeaderIcon />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  ), []);

  return (
    <ResponsiveLayout headerActions={headerActions}>
      {children}
    </ResponsiveLayout>
  );
}