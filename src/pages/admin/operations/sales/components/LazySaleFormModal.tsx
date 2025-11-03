/**
 * LazySaleFormModal - Lazy-loaded wrapper for SaleFormModal
 *
 * This component is lazy-loaded to improve initial page load performance.
 * The full SaleFormModal with cart and product selection is loaded on demand.
 */

import { lazy, Suspense } from 'react';
import { Stack, Skeleton } from '@/shared/ui';

// ✅ Lazy-load del modal completo
const SaleFormModal = lazy(() =>
  import('./SaleFormModal').then(module => ({ default: module.SaleFormModal }))
);

interface LazySaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LazySaleFormModal({ isOpen, onClose }: LazySaleFormModalProps) {
  if (!isOpen) return null;

  return (
    <Suspense
      fallback={
        <Stack direction="column" gap="md" p="xl">
          <Skeleton height="60px" />
          <Skeleton height="400px" />
          <Skeleton height="60px" />
        </Stack>
      }
    >
      <SaleFormModal isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}