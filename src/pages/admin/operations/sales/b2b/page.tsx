/**
 * B2B Sales Page
 *
 * Main page for B2B sales operations including quotes, contracts, and tiered pricing.
 * Integrates with Finance module for credit management.
 *
 * @module pages/admin/operations/sales/b2b
 */

import { Box, Heading, Text, Tabs, Stat } from '@/shared/ui';
import { ContentLayout } from '@/shared/layout/ContentLayout';
import { QuoteBuilder, TieredPricingManager } from '@/modules/sales/b2b/components';

/**
 * B2B Sales Page Component
 *
 * Tabs:
 * - Quotes: Manage B2B quotes and quotations
 * - Contracts: Manage long-term contracts with customers
 * - Pricing: Configure tiered pricing and volume discounts
 */
const B2BSalesPage = () => {
  return (
    <ContentLayout
      title="B2B Sales"
      description="Manage quotes, contracts, and tiered pricing for business customers"
    >
      <Box>
        {/* Quick Stats */}
        <Box mb={6} display="flex" gap={4}>
          <Stat.Root>
            <Stat.Label>Active Quotes</Stat.Label>
            <Stat.ValueText>0</Stat.ValueText>
            <Stat.HelpText>Pending customer approval</Stat.HelpText>
          </Stat.Root>

          <Stat.Root>
            <Stat.Label>Active Contracts</Stat.Label>
            <Stat.ValueText>0</Stat.ValueText>
            <Stat.HelpText>Currently in effect</Stat.HelpText>
          </Stat.Root>

          <Stat.Root>
            <Stat.Label>Pricing Tiers</Stat.Label>
            <Stat.ValueText>0</Stat.ValueText>
            <Stat.HelpText>Volume discount configurations</Stat.HelpText>
          </Stat.Root>
        </Box>

        {/* Tabs */}
        <Tabs.Root defaultValue="quotes" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="quotes">Quotes</Tabs.Trigger>
            <Tabs.Trigger value="contracts">Contracts</Tabs.Trigger>
            <Tabs.Trigger value="pricing">Tiered Pricing</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="quotes">
            <Box p={4}>
              <QuoteBuilder />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="contracts">
            <Box p={4}>
              <Heading size="md" mb={4}>
                Contract Management
              </Heading>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text color="gray.500">
                  Contract management - Implementation in progress
                </Text>
                <Text fontSize="sm" mt={2}>
                  Features:
                </Text>
                <ul>
                  <li>Long-term customer contracts</li>
                  <li>Minimum order values/quantities</li>
                  <li>Automatic renewal management</li>
                  <li>Contract compliance tracking</li>
                  <li>Digital signature integration</li>
                </ul>
              </Box>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="pricing">
            <Box p={4}>
              <TieredPricingManager />
            </Box>
          </Tabs.Content>
        </Tabs.Root>

        {/* Integration Notes */}
        <Box mt={6} p={4} bg="blue.50" borderRadius="md">
          <Heading size="sm" mb={2}>
            Finance Integration
          </Heading>
          <Text fontSize="sm">
            B2B sales are integrated with the Finance module:
          </Text>
          <ul style={{ fontSize: '14px', marginTop: '8px' }}>
            <li><strong>Credit Validation</strong>: Checks available credit before quote approval</li>
            <li><strong>NET Payment Terms</strong>: Automatically applies NET 30/60/90 from corporate account</li>
            <li><strong>Invoice Tracking</strong>: Creates finance invoices on order conversion</li>
            <li><strong>AR Management</strong>: Tracks outstanding balances in AR aging reports</li>
          </ul>
        </Box>
      </Box>
    </ContentLayout>
  );
};

export default B2BSalesPage;
