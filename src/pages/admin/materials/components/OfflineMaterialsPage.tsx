import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';

export function OfflineMaterialsPage() {
  return (
    <Box p={6}>
      <VStack gap={4} align="start">
        <Text fontSize="2xl" fontWeight="bold">
          Materials - Offline Mode
        </Text>
        <Text color="gray.600">
          You are currently offline. Basic materials functionality is available.
        </Text>
      </VStack>
    </Box>
  );
}