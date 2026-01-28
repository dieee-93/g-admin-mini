/**
 * Customer Billing Section
 *
 * Displays billing information in customer profile view.
 * Injected into customers.profile_sections hook.
 */

import React from 'react';
import { Box, Text, Badge, Stack, Skeleton, HStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { DecimalUtils } from '@/lib/decimal';

interface CustomerBillingSectionProps {
  customerId: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
}

export const CustomerBillingSection: React.FC<CustomerBillingSectionProps> = ({ customerId }) => {
  // Fetch customer's recent invoices
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: async () => {
      logger.debug('Billing', 'Fetching invoices for customer', { customerId });

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) {
        logger.error('Billing', 'Failed to fetch invoices', fetchError);
        throw fetchError;
      }

      return (data || []) as Invoice[];
    },
    enabled: !!customerId,
  });

  // Fetch customer's payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['customer-payment-methods', customerId],
    queryFn: async () => {
      logger.debug('Billing', 'Fetching payment methods for customer', { customerId });

      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_active', true);

      if (fetchError) {
        logger.error('Billing', 'Failed to fetch payment methods', fetchError);
        return [];
      }

      return data || [];
    },
    enabled: !!customerId,
  });

  const isLoading = invoicesLoading || paymentMethodsLoading;

  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Skeleton height="20px" mb={2} />
        <Skeleton height="16px" width="60%" mb={2} />
        <Skeleton height="16px" width="40%" />
      </Box>
    );
  }

  if (invoicesError) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="red.200">
        <Text color="red.600" fontSize="sm">
          Error loading billing information
        </Text>
      </Box>
    );
  }

  // Calculate billing summary
  const totalOwed = invoices
    ?.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

  const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'blue';
      case 'overdue':
        return 'red';
      case 'draft':
        return 'gray';
      case 'cancelled':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Stack gap={3}>
        {/* Billing Summary */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
            Billing Summary
          </Text>
          <HStack gap={4}>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Total Owed
              </Text>
              <Text fontSize="lg" fontWeight="bold" color={totalOwed > 0 ? 'red.600' : 'gray.700'}>
                ${DecimalUtils.format(totalOwed)}
              </Text>
            </Box>
            {overdueInvoices > 0 && (
              <Box>
                <Text fontSize="xs" color="gray.600">
                  Overdue Invoices
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  {overdueInvoices}
                </Text>
              </Box>
            )}
          </HStack>
        </Box>

        {/* Recent Invoices */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
            Recent Invoices
          </Text>
          {invoices && invoices.length > 0 ? (
            <Stack gap={2}>
              {invoices.slice(0, 3).map((invoice) => (
                <HStack key={invoice.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <Box>
                    <Text fontSize="xs" fontWeight="medium">
                      #{invoice.invoice_number}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </Text>
                  </Box>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      ${DecimalUtils.format(invoice.total_amount)}
                    </Text>
                    <Badge colorPalette={getStatusColor(invoice.status)} size="sm">
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </HStack>
                </HStack>
              ))}
            </Stack>
          ) : (
            <Text fontSize="sm" color="gray.600">
              No invoices yet
            </Text>
          )}
        </Box>

        {/* Payment Methods */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
            Payment Methods
          </Text>
          {paymentMethods && paymentMethods.length > 0 ? (
            <Text fontSize="sm" color="gray.600">
              {paymentMethods.length} active payment method(s)
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.600">
              No payment methods configured
            </Text>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default CustomerBillingSection;
