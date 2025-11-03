/**
 * Finance Page
 *
 * Main page for B2B Finance module.
 * Manages corporate accounts, credit limits, and AR aging.
 *
 * @module pages/admin/finance
 */

import { Box, Heading, Text, Tabs } from '@/shared/ui';
import { ContentLayout } from '@/shared/layout/ContentLayout';
import { CorporateAccountsManager } from '@/modules/finance/components/CorporateAccountsManager';
import { CreditLimitTracker } from '@/modules/finance/components/CreditLimitTracker';
import { ARAgingReport } from '@/modules/finance/components/ARAgingReport';
import { CreditUtilizationWidget } from '@/modules/finance/components/CreditUtilizationWidget';

/**
 * Finance Page Component
 *
 * Tabs:
 * - Corporate Accounts: Manage B2B customer accounts
 * - Credit Management: Monitor credit limits and utilization
 * - AR Aging: View accounts receivable aging report
 */
const FinancePage = () => {
  return (
    <ContentLayout
      title="Finance - B2B Accounts"
      description="Manage corporate accounts with credit terms and payment tracking"
    >
      <Box>
        {/* Dashboard Widgets Row */}
        <Box mb={6}>
          <CreditUtilizationWidget />
        </Box>

        {/* Tabs */}
        <Tabs.Root defaultValue="accounts" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="accounts">Corporate Accounts</Tabs.Trigger>
            <Tabs.Trigger value="credit">Credit Management</Tabs.Trigger>
            <Tabs.Trigger value="aging">AR Aging</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="accounts">
            <Box p={4}>
              <CorporateAccountsManager />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="credit">
            <Box p={4}>
              <Heading size="md" mb={4}>
                Credit Management
              </Heading>
              <Text mb={4}>
                Monitor credit limits and utilization across all corporate accounts.
              </Text>
              {/* TODO: Add credit utilization table and charts */}
              <CreditLimitTracker />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="aging">
            <Box p={4}>
              <ARAgingReport />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </ContentLayout>
  );
};

export default FinancePage;
