/**
 * CustomerHeaderActions - Header actions for Customer Portal
 * 
 * Provides: ConnectionStatus + ShoppingCart + NavAlertBadge
 * 
 * Used in App.tsx:
 * <AppShell headerActions={<CustomerHeaderActions />} />
 */

import { Stack } from '@chakra-ui/react';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { ShoppingCartHeaderIcon } from '@/modules/sales/ecommerce/components/ShoppingCartHeaderIcon';
import { memo } from 'react';

export const CustomerHeaderActions = memo(function CustomerHeaderActions() {
  return (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <ShoppingCartHeaderIcon />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  );
});
