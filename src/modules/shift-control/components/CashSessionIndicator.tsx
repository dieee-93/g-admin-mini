/**
 * CashSessionIndicator Component
 *
 * Small compact indicator for cash session status
 * Non-blocking, informative only
 *
 * @module shift-control/components
 * @version 1.1 - More compact layout
 */

import { HStack, Text } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';
import type { CashSessionRow } from '@/modules/cash/types';

interface CashSessionIndicatorProps {
  /**
   * Current cash session (if any)
   */
  cashSession: CashSessionRow | null;

  /**
   * Compact mode (smaller UI)
   */
  compact?: boolean;
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CashSessionIndicator({ cashSession, compact = false }: CashSessionIndicatorProps) {
  const navigate = useNavigate();

  const hasCashSession = !!cashSession;

  // Calculate cash in drawer
  const cashInDrawer = hasCashSession
    ? (cashSession.starting_cash ?? 0) +
      (cashSession.cash_sales ?? 0) -
      (cashSession.cash_refunds ?? 0) -
      (cashSession.cash_drops ?? 0)
    : 0;

  return (
    <HStack
      px="3"
      py="2"
      bg={hasCashSession ? 'green.50' : 'gray.50'}
      borderRadius="md"
      borderWidth="1px"
      borderColor={hasCashSession ? 'green.300' : 'gray.300'}
      cursor="pointer"
      onClick={() => navigate('/admin/finance/cash')}
      _hover={{
        bg: hasCashSession ? 'green.100' : 'gray.100',
        borderColor: hasCashSession ? 'green.400' : 'gray.400',
      }}
      transition="all 0.2s"
      gap="2"
    >
      <Text fontSize="lg">{hasCashSession ? '💵' : '📦'}</Text>
      
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color={hasCashSession ? 'green.700' : 'gray.600'}
        whiteSpace="nowrap"
      >
        {hasCashSession ? 'Caja Abierta' : 'Sin Caja'}
      </Text>
      
      {hasCashSession ? (
        <>
          <Text fontSize="sm" color="green.500">
            •
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="green.900">
            ${formatCurrency(cashInDrawer)}
          </Text>
        </>
      ) : (
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          click para abrir
        </Text>
      )}
    </HStack>
  );
}
