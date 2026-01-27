import React, { Component } from 'react';
/**
 * Alert - Inline Alert Component
 *
 * Alertas inline para feedback y notificaciones.
 */

import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Stack } from
'@chakra-ui/react';
export interface AlertProps {
  /**
   * Tipo de alerta
   */
  status: 'info' | 'warning' | 'success' | 'error';
  /**
   * Título de la alerta
   */
  title?: string;
  /**
   * Descripción/mensaje
   */
  description?: string;
  /**
   * Contenido personalizado
   */
  children?: React.ReactNode;
  /**
   * Mostrar botón de cerrar
   */
  closable?: boolean;
  /**
   * Callback al cerrar
   */
  onClose?: () => void;
  /**
   * Variante visual
   */
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
}
export function Alert({
  status,
  title,
  description,
  children,
  closable = false,
  onClose,
  variant = 'left-accent'
}: AlertProps) {
  return (
    <ChakraAlert
      status={status}
      variant={variant}
      borderRadius="lg"
      alignItems="flex-start">

      <AlertIcon mt="1" />

      <Box flex="1">
        {title &&
        <AlertTitle
          fontSize="sm"
          fontWeight="semibold"
          mb={description ? '1' : '0'}>

            {title}
          </AlertTitle>
        }

        {description &&
        <AlertDescription fontSize="sm">{description}</AlertDescription>
        }

        {children &&
        <Box mt={title || description ? '2' : '0'}>{children}</Box>
        }
      </Box>

      {closable && onClose &&
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right="-1"
        top="-1"
        onClick={onClose} />

      }
    </ChakraAlert>);

}