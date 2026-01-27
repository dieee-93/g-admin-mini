import React, { Component } from 'react';
/**
 * LoadingState - Loading State Components
 *
 * Componentes para estados de carga consistentes.
 */

import {
  Box,
  Spinner,
  Stack,
  Text,
  Skeleton,
  SkeletonText } from
'@chakra-ui/react';
interface LoadingSpinnerProps {
  /**
   * Mensaje de carga
   */
  message?: string;
  /**
   * Tamaño del spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
/**
 * Spinner de carga con mensaje opcional
 */
export function LoadingSpinner({ message, size = 'lg' }: LoadingSpinnerProps) {
  return (
    <Stack align="center" justify="center" py="12" gap="4">
      <Spinner size={size} color="blue.500" thickness="3px" speed="0.65s" />
      {message &&
      <Text fontSize="sm" color="text.secondary">
          {message}
        </Text>
      }
    </Stack>);

}
interface LoadingOverlayProps {
  /**
   * Estado de carga
   */
  isLoading: boolean;
  /**
   * Mensaje de carga
   */
  message?: string;
  /**
   * Contenido a mostrar cuando no está cargando
   */
  children: React.ReactNode;
}
/**
 * Overlay de carga sobre contenido
 */
export function LoadingOverlay({
  isLoading,
  message,
  children
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;
  return (
    <Box position="relative">
      <Box opacity="0.4" pointerEvents="none">
        {children}
      </Box>
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="blackAlpha.100"
        borderRadius="lg">

        <LoadingSpinner message={message} />
      </Box>
    </Box>);

}
interface SkeletonCardProps {
  /**
   * Número de líneas de texto
   */
  lines?: number;
}
/**
 * Skeleton para cards
 */
export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <Box
      bg="bg.surface"
      p="6"
      borderRadius="lg"
      shadow="md"
      borderWidth="1px"
      borderColor="border.default">

      <Stack gap="4">
        <Skeleton height="20px" width="60%" />
        <SkeletonText noOfLines={lines} spacing="3" />
      </Stack>
    </Box>);

}
interface SkeletonTableProps {
  /**
   * Número de filas
   */
  rows?: number;
  /**
   * Número de columnas
   */
  columns?: number;
}
/**
 * Skeleton para tablas
 */
export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <Stack gap="2">
      {/* Header */}
      <Stack direction="row" gap="4">
        {Array.from({
          length: columns
        }).map((_, i) =>
        <Skeleton key={i} height="20px" flex="1" />
        )}
      </Stack>
      {/* Rows */}
      {Array.from({
        length: rows
      }).map((_, rowIndex) =>
      <Stack key={rowIndex} direction="row" gap="4">
          {Array.from({
          length: columns
        }).map((_, colIndex) =>
        <Skeleton key={colIndex} height="16px" flex="1" />
        )}
        </Stack>
      )}
    </Stack>);

}