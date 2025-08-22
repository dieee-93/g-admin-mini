import React, { Suspense } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyWithErrorBoundaryProps {
  children: React.ReactNode;
  moduleName: string;
  fallback?: React.ReactNode;
}

const DefaultLoadingFallback = ({ moduleName }: { moduleName: string }) => (
  <Box 
    display="flex" 
    alignItems="center" 
    justifyContent="center" 
    minH="400px"
    w="full"
  >
    <VStack gap="4">
      <Spinner size="lg" colorPalette="blue" />
      <Text color="gray.600" fontSize="sm">
        Cargando {moduleName}...
      </Text>
    </VStack>
  </Box>
);

export const LazyWithErrorBoundary: React.FC<LazyWithErrorBoundaryProps> = ({
  children,
  moduleName,
  fallback
}) => {
  return (
    <ErrorBoundary moduleName={moduleName}>
      <Suspense 
        fallback={fallback || <DefaultLoadingFallback moduleName={moduleName} />}
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};