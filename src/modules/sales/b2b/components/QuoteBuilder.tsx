/**
 * Quote Builder Component
 *
 * Interface for creating and managing B2B quotes.
 * Includes product selection, quantity, pricing, and approval workflow.
 *
 * @module sales/b2b/components/QuoteBuilder
 */

import { Box, Heading, Text } from '@/shared/ui';

// TODO Phase 3: Implement QuoteFormData interface for quote creation
// import type { QuoteFormData } from '../types';

interface QuoteBuilderProps {
  customerId?: string;
  onQuoteCreated?: (quoteId: string) => void;
}

/**
 * QuoteBuilder Component
 *
 * TODO Phase 3: Implement full quote builder
 * - Customer selection (using customerId prop)
 * - Product/service line items
 * - Tiered pricing calculation
 * - Discount application
 * - Quote preview
 * - Send to customer (using onQuoteCreated callback)
 */
export const QuoteBuilder: React.FC<QuoteBuilderProps> = () => {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Create B2B Quote
      </Heading>

      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text color="gray.500">
          Quote Builder - Implementation in progress
        </Text>
        <Text fontSize="sm" mt={2}>
          Features:
        </Text>
        <ul>
          <li>Customer selection with corporate account validation</li>
          <li>Product catalog with tiered pricing preview</li>
          <li>Automatic volume discount calculation</li>
          <li>Tax calculation integration</li>
          <li>Terms and conditions templates</li>
          <li>PDF quote generation</li>
          <li>Approval workflow routing</li>
        </ul>
      </Box>
    </Box>
  );
};

export default QuoteBuilder;
