// src/features/sales/index.tsx
import { Box, VStack } from '@chakra-ui/react';
import { SaleForm } from './ui/SaleForm';
import { SaleList } from './ui/SaleList';

export default function SalesPage() {
  return (
    <Box p={4}>
      <VStack gap={6} align="stretch">
        <SaleForm />
        <SaleList />
      </VStack>
    </Box>
  );
}