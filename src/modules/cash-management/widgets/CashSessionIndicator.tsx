/**
 * CashSessionIndicator - Widget for ShiftControl
 * 
 * Shows cash session status in shift control widget
 */

import { HStack, Text, Badge, Icon } from '@/shared/ui';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import type { CashSessionRow } from '@/modules/cash/types/cashSessions';

interface CashSessionIndicatorProps {
  cashSession: CashSessionRow | null;
}

export function CashSessionIndicator({ cashSession }: CashSessionIndicatorProps) {
  if (!cashSession) {
    return (
      <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Icon color="gray.400">
          <BanknotesIcon />
        </Icon>
        <Text fontSize="sm" color="gray.500">Sin caja abierta</Text>
      </HStack>
    );
  }

  const balance = cashSession.cash_sales || 0;

  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md" borderColor="green.200" bg="green.50">
      <Icon color="green.600">
        <BanknotesIcon />
      </Icon>
      <Text fontSize="sm" fontWeight="medium">
        Caja: ${balance.toFixed(2)}
      </Text>
      <Badge colorPalette="green" size="sm">Abierta</Badge>
    </HStack>
  );
}
