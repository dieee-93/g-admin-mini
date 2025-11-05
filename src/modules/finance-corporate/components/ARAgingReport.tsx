/**
 * AR Aging Report Component
 *
 * Displays accounts receivable aging report showing outstanding balances
 * by age buckets (Current, 31-60, 61-90, 90+).
 *
 * @module finance/components/ARAgingReport
 */

import { Box, Heading, Text, Stat } from '@/shared/ui';
import { useCreditManagement } from '../hooks';
import { useEffect, useState } from 'react';
import type { ARAgingSummary } from '../types';

/**
 * ARAgingReport Component
 *
 * Shows summary of all outstanding invoices by aging bucket
 */
export const ARAgingReport = () => {
  const { getARAgingSummary } = useCreditManagement();
  const [summary, setSummary] = useState<ARAgingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getARAgingSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to load AR aging summary', error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [getARAgingSummary]);

  if (loading) {
    return <Text>Loading AR aging report...</Text>;
  }

  if (!summary) {
    return <Text>No data available</Text>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <Heading size="sm" mb={4}>
        Accounts Receivable Aging
      </Heading>

      <Box spaceY={3}>
        <Stat.Root>
          <Stat.Label>Total Outstanding</Stat.Label>
          <Stat.ValueText>${summary.total_outstanding.toFixed(2)}</Stat.ValueText>
        </Stat.Root>

        <Box>
          <Text fontWeight="semibold" mb={2}>
            Aging Breakdown
          </Text>

          <Box spaceY={1}>
            <Stat.Root>
              <Stat.Label>Current (0-30 days)</Stat.Label>
              <Stat.ValueText>${summary.total_current.toFixed(2)}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>31-60 days</Stat.Label>
              <Stat.ValueText>${summary.total_31_60.toFixed(2)}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>61-90 days</Stat.Label>
              <Stat.ValueText>${summary.total_61_90.toFixed(2)}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>90+ days (Overdue)</Stat.Label>
              <Stat.ValueText color="red.500">
                ${summary.total_over_90.toFixed(2)}
              </Stat.ValueText>
            </Stat.Root>
          </Box>
        </Box>

        <Stat.Root>
          <Stat.Label>Accounts with Outstanding Balance</Stat.Label>
          <Stat.ValueText>{summary.account_count}</Stat.ValueText>
        </Stat.Root>
      </Box>
    </Box>
  );
};

export default ARAgingReport;
