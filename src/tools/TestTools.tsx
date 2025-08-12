// TestTools.tsx - Simple test component to verify routing
import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';

export function TestTools() {
  return (
    <Box p="6">
      <Heading size="xl" mb="4">🎉 Tools Page Working!</Heading>
      <Text>This confirms that the routing to /tools is working correctly.</Text>
    </Box>
  );
}

export default TestTools;