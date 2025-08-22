// CustomerMenuSimple.tsx - Versión simplificada para debuggear
import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export function CustomerMenuSimple() {
  return (
    <Box p="6">
      <Text fontSize="2xl" fontWeight="bold">
        Menú del Cliente - Test
      </Text>
      <Text>
        Esta es una versión simplificada para verificar que funciona
      </Text>
    </Box>
  );
}