// src/features/customers/index.tsx
import { Box, VStack } from '@chakra-ui/react';
import { CustomerForm } from './ui/CustomerForm';
import { CustomerList } from './ui/CustomerList';

export default function CustomersPage() {
  return (
    <Box p={4}>
      <VStack gap={6} align="stretch">
        <CustomerForm />
        <CustomerList />
      </VStack>
    </Box>
  );
}