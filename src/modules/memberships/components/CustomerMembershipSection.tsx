/**
 * Customer Membership Section
 *
 * Displays membership information in customer profile view.
 * Injected into customers.profile_sections hook.
 */

import React from 'react';
import { Box, Text, Badge, Stack, Skeleton } from '@/shared/ui';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

interface CustomerMembershipSectionProps {
  customerId: string;
}

interface Membership {
  id: string;
  tier: string;
  status: 'active' | 'expired' | 'suspended';
  start_date: string;
  end_date: string | null;
}

export const CustomerMembershipSection: React.FC<CustomerMembershipSectionProps> = ({ customerId }) => {
  const { data: membership, isLoading, error } = useQuery({
    queryKey: ['customer-membership', customerId],
    queryFn: async () => {
      logger.debug('Memberships', 'Fetching membership for customer', { customerId });

      const { data, error: fetchError } = await supabase
        .from('memberships')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        logger.error('Memberships', 'Failed to fetch membership', fetchError);
        throw fetchError;
      }

      return data as Membership | null;
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Skeleton height="20px" mb={2} />
        <Skeleton height="16px" width="60%" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="red.200">
        <Text color="red.600" fontSize="sm">
          Error loading membership information
        </Text>
      </Box>
    );
  }

  if (!membership) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text fontSize="sm" color="gray.600">
          No active membership
        </Text>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'suspended':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Stack gap={3}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Membership Status
          </Text>
          <Badge colorPalette={getStatusColor(membership.status)}>
            {membership.status.toUpperCase()}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Tier
          </Text>
          <Text fontSize="sm" color="gray.600">
            {membership.tier || 'Standard'}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
            Membership Period
          </Text>
          <Text fontSize="sm" color="gray.600">
            {new Date(membership.start_date).toLocaleDateString()}
            {membership.end_date && ` - ${new Date(membership.end_date).toLocaleDateString()}`}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default CustomerMembershipSection;
