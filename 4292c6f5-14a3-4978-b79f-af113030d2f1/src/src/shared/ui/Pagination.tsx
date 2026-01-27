import React, { Component } from 'react';
/**
 * Pagination - Pagination Component
 *
 * Componente de paginación reutilizable.
 */

import { Stack, Button, Text, Select, Box } from '@chakra-ui/react';
export interface PaginationProps {
  /**
   * Página actual (1-indexed)
   */
  currentPage: number;
  /**
   * Total de páginas
   */
  totalPages: number;
  /**
   * Callback cuando cambia la página
   */
  onPageChange: (page: number) => void;
  /**
   * Items por página
   */
  pageSize?: number;
  /**
   * Opciones de items por página
   */
  pageSizeOptions?: number[];
  /**
   * Callback cuando cambia el tamaño de página
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Total de items (para mostrar info)
   */
  totalItems?: number;
  /**
   * Mostrar selector de tamaño de página
   */
  showPageSizeSelector?: boolean;
}
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  totalItems,
  showPageSizeSelector = true
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange?.(newSize);
    onPageChange(1); // Reset to first page
  };
  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);
  return (
    <Stack
      direction={{
        base: 'column',
        md: 'row'
      }}
      justify="space-between"
      align="center"
      gap="4"
      py="4">

      {/* Info de items */}
      {totalItems !== undefined &&
      <Text fontSize="sm" color="text.secondary">
          Mostrando {startItem} - {endItem} de {totalItems} resultados
        </Text>
      }

      {/* Controles de paginación */}
      <Stack direction="row" gap="2" align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrevious}
          isDisabled={!canGoPrevious}>

          Anterior
        </Button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`ellipsis-${index}`} px="2" color="text.secondary">
                ...
              </Text>);

          }
          return (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? 'solid' : 'outline'}
              colorScheme={currentPage === page ? 'blue' : 'gray'}
              onClick={() => onPageChange(page as number)}>

              {page}
            </Button>);

        })}

        <Button
          size="sm"
          variant="outline"
          onClick={handleNext}
          isDisabled={!canGoNext}>

          Siguiente
        </Button>
      </Stack>

      {/* Selector de tamaño de página */}
      {showPageSizeSelector && onPageSizeChange &&
      <Stack direction="row" align="center" gap="2">
          <Text fontSize="sm" color="text.secondary">
            Items por página:
          </Text>
          <Select
          size="sm"
          value={pageSize}
          onChange={handlePageSizeChange}
          width="20">

            {pageSizeOptions.map((size) =>
          <option key={size} value={size}>
                {size}
              </option>
          )}
          </Select>
        </Stack>
      }
    </Stack>);

}