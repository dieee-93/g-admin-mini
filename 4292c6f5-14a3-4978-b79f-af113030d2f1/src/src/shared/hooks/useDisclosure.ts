/**
 * useDisclosure - Modal/Drawer State Hook
 *
 * Hook para manejar el estado de apertura/cierre de modals, drawers, etc.
 */

import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
  /**
   * Estado de apertura
   */
  isOpen: boolean;
  /**
   * Abre el modal/drawer
   */
  onOpen: () => void;
  /**
   * Cierra el modal/drawer
   */
  onClose: () => void;
  /**
   * Alterna el estado
   */
  onToggle: () => void;
}

/**
 * Hook para manejar estado de modals/drawers
 */
export function useDisclosure(defaultIsOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle
  };
}