// ============================================
// SUPPLIER FORM MODAL - Create/Edit supplier
// ============================================
// ARCHITECTURE: Wrapper around SupplierFormContent
// - Provides modal UI (open/close, header, footer)
// - Delegates form logic to SupplierFormContent component
// - Maintains backward compatibility with existing usage

import React, { useCallback, useMemo } from 'react';
import { Dialog } from '@/shared/ui';
import { SupplierFormContent } from './SupplierFormContent';
import type { Supplier } from '../types/supplierTypes';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierFormModalComponent({
  isOpen,
  onClose,
  supplier
}: SupplierFormModalProps) {
  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!details.open) {
      onClose();
    }
  }, [onClose]);

  const dialogSize = useMemo(() => ({ base: 'full', md: 'xl' } as const), []);
  const modalTitle = supplier ? 'Editar Proveedor' : 'Nuevo Proveedor';

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      size={dialogSize}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: '100%', md: '800px' }}
          maxH={{ base: '100vh', md: '90vh' }}
          w="full"
          overflowY="auto"
          borderRadius={{ base: '0', md: 'lg' }}
          m={{ base: '0', md: '4' }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body p={{ base: '4', md: '6' }}>
            <SupplierFormContent
              onSuccess={onClose}
              onCancel={onClose}
              supplier={supplier}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export const SupplierFormModal = React.memo(SupplierFormModalComponent);
