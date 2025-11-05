/**
 * Credit Limit Tracker
 *
 * Component for tracking credit utilization and limits for a specific account.
 * Shows available credit, current balance, and utilization percentage.
 *
 * @module finance/components/CreditLimitTracker
 */

import { Box, Heading, Text, Stat } from '@/shared/ui';
import { useCorporateAccounts } from '../hooks';
import Decimal from 'decimal.js';

interface CreditLimitTrackerProps {
  accountId?: string;
  customerId?: string;
}

/**
 * CreditLimitTracker Component
 *
 * Displays credit limit and utilization for a corporate account
 */
export const CreditLimitTracker: React.FC<CreditLimitTrackerProps> = ({
  accountId,
  customerId,
}) => {
  const { accounts, loading, getAccountById } = useCorporateAccounts();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Find account
  let account;
  if (accountId) {
    account = getAccountById(accountId);
  } else if (customerId) {
    account = accounts.find((acc) => acc.customer_id === customerId);
  }

  if (!account) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text>No corporate account found</Text>
      </Box>
    );
  }

  const creditLimit = new Decimal(account.credit_limit || 0);
  const currentBalance = new Decimal(account.current_balance || 0);
  const availableCredit = new Decimal(account.available_credit || 0);
  const utilization = account.credit_utilization || 0;

  // Determine risk level
  let riskColor = 'green';
  if (utilization > 90) riskColor = 'red';
  else if (utilization > 75) riskColor = 'orange';

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <Heading size="sm" mb={3}>
        Credit Status
      </Heading>

      <Box spaceY={2}>
        <Stat.Root>
          <Stat.Label>Credit Limit</Stat.Label>
          <Stat.ValueText>${creditLimit.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Current Balance</Stat.Label>
          <Stat.ValueText>${currentBalance.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Available Credit</Stat.Label>
          <Stat.ValueText>${availableCredit.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Utilization</Stat.Label>
          <Stat.ValueText color={riskColor}>{utilization.toFixed(1)}%</Stat.ValueText>
        </Stat.Root>
      </Box>
    </Box>
  );
};

export default CreditLimitTracker;
