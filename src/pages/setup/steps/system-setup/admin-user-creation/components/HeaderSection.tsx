import React from 'react';
import { VStack, Box, Heading, Text } from '@/shared/ui';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { ADMIN_USER_CONFIG } from '../config/constants';

export function HeaderSection() {
  const { header } = ADMIN_USER_CONFIG.TEXTS;

  return (
    <VStack gap="3" textAlign="center">
      <Box
        bg="blue.500"
        color="white"
        borderRadius="full"
        p="3"
        display="inline-flex"
      >
        <UserPlusIcon width={24} height={24} />
      </Box>
      <Heading size="lg" color="gray.700">
        {header.title}
      </Heading>
      <Text color="gray.600" fontSize="md">
        {header.subtitle}
      </Text>
    </VStack>
  );
}