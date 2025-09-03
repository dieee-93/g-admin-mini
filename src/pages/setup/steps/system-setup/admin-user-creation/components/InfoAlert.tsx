import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ADMIN_USER_CONFIG } from '../config/constants';

export function InfoAlert() {
  const { infoAlert } = ADMIN_USER_CONFIG.TEXTS;

  return (
    <Box
      bg="blue.50"
      border="1px solid"
      borderColor="blue.200"
      borderRadius="md"
      p={4}
    >
      <Stack direction="row" gap={3} align="start">
        <InformationCircleIcon width={20} height={20} color="#3182ce" />
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="blue.800">
            {infoAlert.title}
          </Text>
          <Text fontSize="sm" color="blue.700">
            {infoAlert.description}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}