import { lazy, Suspense } from 'react';
import { Box, Spinner, VStack } from '@chakra-ui/react';

// Lazy load the heavy modal component
const MaterialFormModalComplete = lazy(() => 
  import('./MaterialFormModalComplete').then(module => ({
    default: module.MaterialFormModalComplete
  }))
);

// Loading fallback component
const ModalLoadingFallback = () => (
  <Box 
    position="fixed" 
    inset="0" 
    bg="blackAlpha.300" 
    display="flex" 
    alignItems="center" 
    justifyContent="center"
    zIndex="modal"
  >
    <VStack 
      bg="white" 
      p={8} 
      borderRadius="lg" 
      boxShadow="xl"
      gap={4}
    >
      <Spinner size="lg" color="blue.500" />
      <Box textAlign="center" color="gray.600">
        Cargando formulario...
      </Box>
    </VStack>
  </Box>
);

/**
 * Lazy-loaded wrapper for MaterialFormModalComplete
 * Only loads the heavy modal component when needed
 */
export const LazyMaterialFormModal = () => (
  <Suspense fallback={<ModalLoadingFallback />}>
    <MaterialFormModalComplete />
  </Suspense>
);

export default LazyMaterialFormModal;