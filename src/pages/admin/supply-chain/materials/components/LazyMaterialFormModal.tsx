import { lazy, Suspense } from 'react';
import { Box, Spinner, VStack } from '@/shared/ui';

// Lazy load the heavy modal component
const MaterialFormDialog = lazy(() =>
  import('./MaterialsManagement/MaterialFormModalComplete').then(module => ({
    default: module.MaterialFormDialog
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
    <MaterialFormDialog />
  </Suspense>
);

export default LazyMaterialFormModal;