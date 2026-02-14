import React from 'react';
import {
  VStack,
  Text,
  Badge,
  SimpleGrid,
  CardWrapper
} from '@/shared/ui';
import {
  UsersIcon,
  TrophyIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import type { AdvancedSalesAnalytics } from '../types';

interface CustomersTabProps {
  analytics: AdvancedSalesAnalytics;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ analytics }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
      <CardWrapper borderTop="4px solid" borderTopColor="green.400">
        <CardWrapper.Body p="4" textAlign="center">
          <VStack gap="3">
            <UsersIcon className="w-12 h-12 text-green-500" />
            <Text fontSize="2xl" fontWeight="bold">{analytics.customers.total_unique}</Text>
            <Text color="gray.600">Total Unique Customers</Text>
            <Badge colorPalette="green">Active</Badge>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper borderTop="4px solid" borderTopColor="blue.400">
        <CardWrapper.Body p="4" textAlign="center">
          <VStack gap="3">
            <TrophyIcon className="w-12 h-12 text-blue-500" />
            <Text fontSize="2xl" fontWeight="bold">{analytics.customers.returning_customers}</Text>
            <Text color="gray.600">Returning Customers</Text>
            <Badge colorPalette="blue">Loyal</Badge>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper borderTop="4px solid" borderTopColor="purple.400">
        <CardWrapper.Body p="4" textAlign="center">
          <VStack gap="3">
            <FireIcon className="w-12 h-12 text-purple-500" />
            <Text fontSize="2xl" fontWeight="bold">{analytics.customers.new_customers}</Text>
            <Text color="gray.600">New Customers</Text>
            <Badge colorPalette="purple">Growing</Badge>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </SimpleGrid>
  );
};
