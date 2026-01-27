import { lazy, Suspense } from 'react';
import { Box, Spinner, VStack } from '@/shared/ui';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';

// Props interface
export interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  item: MaterialItem | null;
  readOnly?: boolean;
}

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
    bg="gray.100" 
    display="flex" 
    alignItems="center" 
    justifyContent="center"
    zIndex="modal"
  >
    <VStack 
      bg="white" 
      p="8" 
      borderRadius="lg" 
      boxShadow="xl"
      gap="4"
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
 * 
 * Performance: Uses React.lazy + Suspense for code splitting
 * Props are passed through to avoid Zustand subscriptions
 */
export const LazyMaterialFormModal = (props: MaterialFormModalProps) => (
  <Suspense fallback={<ModalLoadingFallback />}>
    <MaterialFormDialog {...props} />
  </Suspense>
);

export default LazyMaterialFormModal;
