import React, { Component } from 'react';
/**
 * Modal - Standardized Modal Component
 *
 * Modal estandarizado con compound components pattern.
 * Proporciona estructura consistente para todos los modals.
 */

import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Heading,
  Stack } from
'@chakra-ui/react';
interface ModalProps {
  /**
   * Estado de apertura
   */
  isOpen: boolean;
  /**
   * Callback al cerrar
   */
  onClose: () => void;
  /**
   * Contenido del modal
   */
  children: React.ReactNode;
  /**
   * Tamaño del modal
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /**
   * Cerrar al hacer click fuera
   */
  closeOnOverlayClick?: boolean;
  /**
   * Cerrar con tecla ESC
   */
  closeOnEsc?: boolean;
}
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true
}: ModalProps) {
  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      isCentered>

      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg="bg.surface" borderRadius="xl" shadow="2xl" mx="4">
        {children}
      </ModalContent>
    </ChakraModal>);

}
// Compound Components
interface ModalHeaderProps {
  /**
   * Título del modal
   */
  title: string;
  /**
   * Subtítulo opcional
   */
  subtitle?: string;
  /**
   * Mostrar botón de cerrar
   */
  showCloseButton?: boolean;
}
Modal.Header = function ModalHeaderComponent({
  title,
  subtitle,
  showCloseButton = true
}: ModalHeaderProps) {
  return (
    <ModalHeader pb="4">
      <Stack gap="1">
        <Heading fontSize="xl" fontWeight="semibold" color="text.primary">
          {title}
        </Heading>
        {subtitle &&
        <Heading fontSize="sm" fontWeight="normal" color="text.secondary">
            {subtitle}
          </Heading>
        }
      </Stack>
      {showCloseButton && <ModalCloseButton />}
    </ModalHeader>);

};
interface ModalBodyProps {
  children: React.ReactNode;
}
Modal.Body = function ModalBodyComponent({ children }: ModalBodyProps) {
  return <ModalBody py="4">{children}</ModalBody>;
};
interface ModalFooterProps {
  children: React.ReactNode;
  /**
   * Justificación de los botones
   */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}
Modal.Footer = function ModalFooterComponent({
  children,
  justify = 'flex-end'
}: ModalFooterProps) {
  return (
    <ModalFooter pt="4" justifyContent={justify}>
      <Stack direction="row" gap="2">
        {children}
      </Stack>
    </ModalFooter>);

};