/**
 * Credit Utilization Widget
 *
 * Dashboard widget showing credit utilization across all corporate accounts.
 * Displays high-level metrics and risk indicators.
 *
 * @module finance/components/CreditUtilizationWidget
 */

import { Box, Heading, Text, Stat } from '@/shared/ui';
import { useCorporateAccounts } from '../hooks';
import Decimal from 'decimal.js';

export const CreditUtilizationWidget = () => {
  const { accounts, loading } = useCorporateAccounts({ activeOnly: true });

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Calculate totals
  const totalCreditLimit = accounts.reduce(
    (sum, acc) => sum.plus(new Decimal(acc.credit_limit || 0)),
    new Decimal(0)
  );

  const totalOutstanding = accounts.reduce(
    (sum, acc) => sum.plus(new Decimal(acc.current_balance || 0)),
    new Decimal(0)
  );

  const totalAvailable = totalCreditLimit.minus(totalOutstanding);
  const utilizationPct = totalCreditLimit.isZero()
    ? 0
    : totalOutstanding.dividedBy(totalCreditLimit).times(100).toNumber();

  // Risk assessment
  const highRiskAccounts = accounts.filter((acc) => acc.credit_utilization > 90).length;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <Heading size="sm" mb={3}>
        B2B Credit Overview
      </Heading>

      <Box spaceY={2}>
        <Stat.Root>
          <Stat.Label>Total Credit Extended</Stat.Label>
          <Stat.ValueText>${totalCreditLimit.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Outstanding Balance</Stat.Label>
          <Stat.ValueText>${totalOutstanding.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Available Credit</Stat.Label>
          <Stat.ValueText>${totalAvailable.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Utilization Rate</Stat.Label>
          <Stat.ValueText>{utilizationPct.toFixed(1)}%</Stat.ValueText>
        </Stat.Root>

        {highRiskAccounts > 0 && (
          <Box mt={2} p={2} bg="red.50" borderRadius="sm">
            <Text fontSize="sm" color="red.700">
              ⚠️ {highRiskAccounts} account(s) over 90% utilization
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
