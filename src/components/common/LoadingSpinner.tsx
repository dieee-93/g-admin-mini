// src/components/common/LoadingSpinner.tsx
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ 
  message = 'Cargando...', 
  size = 'lg' 
}: LoadingSpinnerProps) {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
      width="100%"
    >
      <VStack spacing={4}>
        <Spinner size={size} color="blue.500" thickness="3px" />
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}