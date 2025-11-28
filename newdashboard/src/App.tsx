import React from 'react';
import { Box } from '@chakra-ui/react';
import { Dashboard } from './components/dashboard/Dashboard';
export function App() {
  return <Box width="100%" minHeight="100vh" bg="#0a1929">
      <Dashboard />
    </Box>;
}