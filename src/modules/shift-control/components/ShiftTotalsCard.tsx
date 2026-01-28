/**
 * ShiftTotalsCard Component
 *
 * REFACTORED v5.0 - MAGIC PATTERNS DESIGN:
 * ✅ Modern gradient cards with top border accent
 * ✅ Enhanced visual hierarchy with icons and badges
 * ✅ Responsive grid layout (2/4 columns)
 * ✅ Hover effects and transitions
 * ✅ Prominent grand total with gradient background
 * 
 * Based on: 4292c6f5-14a3-4978-b79f-af113030d2f1/src/App.tsx MetricCard pattern
 *
 * @module shift-control/components
 * @version 5.0 - Magic Patterns visual redesign
 */

import { useMemo } from 'react';
import { Box, Stack, Flex, Text, Badge, SimpleGrid } from '@/shared/ui';
import type { CashSessionRow } from '@/modules/accounting/types';
import { DecimalUtils } from '@/lib/decimal';
import type { OperationalShift } from '../types';

interface ShiftTotalsCardProps {
  /**
   * Total shift amount (formatted currency string from store)
   */
  totalAmount: string;

  /**
   * Payment methods breakdown from store
   */
  paymentMethods: Array<{ method: string; amount: string; percentage: number }>;

  /**
   * Current cash session (optional)
   * Used to calculate real-time cash total
   */
  cashSession?: CashSessionRow | null;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Calculate current cash in drawer
 */
function calculateCashInDrawer(cashSession: CashSessionRow | null): number {
  if (!cashSession) return 0;

  return (
    (cashSession.starting_cash ?? 0) +
    (cashSession.cash_sales ?? 0) -
    (cashSession.cash_refunds ?? 0) -
    (cashSession.cash_drops ?? 0)
  );
}

/**
 * Payment method configuration for UI rendering
 * Enhanced with gradient colors for Magic Patterns design
 */
const PAYMENT_METHOD_CONFIG = {
  cash: {
    icon: '💵',
    label: 'Efectivo',
    gradient: 'green.500',
    iconBg: 'green.100',
    textColor: 'text.default',
    valueColor: 'green.700',
  },
  card: {
    icon: '💳',
    label: 'Tarjeta',
    gradient: 'blue.500',
    iconBg: 'blue.100',
    textColor: 'text.default',
    valueColor: 'blue.700',
  },
  transfer: {
    icon: '🏦',
    label: 'Transferencia',
    gradient: 'purple.500',
    iconBg: 'purple.100',
    textColor: 'text.default',
    valueColor: 'purple.700',
  },
  qr: {
    icon: '📱',
    label: 'QR/Digital',
    gradient: 'orange.500',
    iconBg: 'orange.100',
    textColor: 'text.default',
    valueColor: 'orange.700',
  },
} as const;

export function ShiftTotalsCard({
  totalAmount,
  paymentMethods,
  cashSession,
}: ShiftTotalsCardProps) {
  // Real-time cash in drawer (if cash session is open)
  const cashInDrawer = useMemo(
    () => calculateCashInDrawer(cashSession ?? null),
    [cashSession]
  );
  const hasCashSession = !!cashSession;

  return (
    <Stack gap="6">
      {/* Header Section */}
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">
          💰 Resumen Financiero
        </Text>
        <Badge colorPalette="green" size="sm">En vivo</Badge>
      </Flex>

      {/* Grand Total - Prominente con gradiente */}
      <Box
        position="relative"
        overflow="hidden"
        textAlign="center"
        py="8"
        px="6"
        bg="bg.surface"
        borderRadius="2xl"
        shadow="xl"
      >
        {/* Top gradient border */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="linear-gradient(90deg, var(--chakra-colors-blue-500) 0%, var(--chakra-colors-purple-500) 100%)"
        />
        
        <Stack gap="2">
          <Text fontSize="sm" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide">
            Total del Turno
          </Text>
          <Text fontSize="5xl" fontWeight="bold" color="blue.600" lineHeight="1">
            {totalAmount}
          </Text>
          <Text fontSize="xs" color="text.muted">
            Todas las formas de pago consolidadas
          </Text>
        </Stack>
      </Box>

      {/* Payment Methods Grid - Magic Patterns style */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        {paymentMethods.map((pm) => {
          const config = PAYMENT_METHOD_CONFIG[pm.method as keyof typeof PAYMENT_METHOD_CONFIG];
          if (!config) return null;

          const isCash = pm.method === 'cash';

          return (
            <Box
              key={pm.method}
              position="relative"
              overflow="hidden"
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              shadow="md"
              transition="all 0.2s"
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            >
              {/* Top gradient border (3px) */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bg={config.gradient}
              />
              
              <Stack gap="3">
                {/* Icon + Label */}
                <Flex justify="space-between" align="start">
                  <Box
                    p="2"
                    borderRadius="lg"
                    bg={config.iconBg}
                    fontSize="xl"
                  >
                    {config.icon}
                  </Box>
                  {pm.percentage > 0 && (
                    <Badge
                      size="sm"
                      colorPalette={config.gradient.split('.')[0] as 'green' | 'blue' | 'purple' | 'orange'}
                    >
                      {pm.percentage}%
                    </Badge>
                  )}
                </Flex>

                {/* Label */}
                <Text
                  fontSize="xs"
                  color="text.muted"
                  fontWeight="medium"
                >
                  {config.label}
                </Text>

                {/* Amount */}
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={config.valueColor}
                >
                  {pm.amount}
                </Text>

                {/* Cash in drawer info */}
                {isCash && hasCashSession && (
                  <Text fontSize="xs" color="text.muted">
                    💼 En cajón: {DecimalUtils.formatCurrency(DecimalUtils.fromValue(cashInDrawer, 'sales'))}
                  </Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Cash Session Inline (if open) - Redesigned */}
      {hasCashSession && cashSession && (
        <Box
          position="relative"
          overflow="hidden"
          p="4"
          bg="bg.surface"
          borderRadius="xl"
          shadow="md"
        >
          {/* Top gradient border */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg="green.500"
          />
          
          <Flex justify="space-between" align="center">
            <Flex gap="3" align="center">
              <Box fontSize="2xl">🏦</Box>
              <Stack gap="1">
                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                  Caja Abierta
                </Text>
                <Text fontSize="xs" color="text.muted">
                  Cajón activo • {DecimalUtils.formatCurrency(DecimalUtils.fromValue(cashInDrawer, 'sales'))}
                </Text>
              </Stack>
            </Flex>
            <Badge colorPalette="green" size="sm">
              ✓ Activa
            </Badge>
          </Flex>
        </Box>
      )}
    </Stack>
  );
}
