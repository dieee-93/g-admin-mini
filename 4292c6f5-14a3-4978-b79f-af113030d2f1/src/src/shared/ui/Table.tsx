import React, { Component } from 'react';
/**
 * Table - Data Table Component
 *
 * Tabla estandarizada con sorting, selección y estados.
 * Optimizada para mostrar datos tabulares.
 */

import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Box,
  Stack,
  Text,
  IconButton } from
'@chakra-ui/react';
export interface TableColumn<T = any> {
  /**
   * Key del campo en los datos
   */
  key: string;
  /**
   * Label del header
   */
  label: string;
  /**
   * Render personalizado de la celda
   */
  render?: (value: any, row: T) => React.ReactNode;
  /**
   * Ancho de la columna
   */
  width?: string;
  /**
   * Alineación del contenido
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Columna sorteable
   */
  sortable?: boolean;
}
export interface TableProps<T = any> {
  /**
   * Columnas de la tabla
   */
  columns: TableColumn<T>[];
  /**
   * Datos a mostrar
   */
  data: T[];
  /**
   * Key única para cada fila
   */
  rowKey: string;
  /**
   * Permitir selección de filas
   */
  selectable?: boolean;
  /**
   * Filas seleccionadas
   */
  selectedRows?: string[];
  /**
   * Callback cuando cambia la selección
   */
  onSelectionChange?: (selectedIds: string[]) => void;
  /**
   * Columna de sorting actual
   */
  sortColumn?: string;
  /**
   * Dirección del sorting
   */
  sortDirection?: 'asc' | 'desc';
  /**
   * Callback cuando cambia el sorting
   */
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  /**
   * Mensaje cuando no hay datos
   */
  emptyMessage?: string;
  /**
   * Tamaño de la tabla
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Hover en filas
   */
  hoverable?: boolean;
}
export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSortChange,
  emptyMessage = 'No hay datos para mostrar',
  size = 'md',
  hoverable = true
}: TableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected =
  selectedRows.length > 0 && selectedRows.length < data.length;
  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((row) => row[rowKey]));
    }
  };
  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      onSelectionChange?.(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange?.([...selectedRows, id]);
    }
  };
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    const newDirection =
    sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column.key, newDirection);
  };
  if (data.length === 0) {
    return (
      <Box
        bg="bg.surface"
        p="12"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.default"
        textAlign="center">

        <Text color="text.secondary" fontSize="sm">
          {emptyMessage}
        </Text>
      </Box>);

  }
  return (
    <Box
      bg="bg.surface"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      overflow="hidden">

      <Box overflowX="auto">
        <ChakraTable size={size} variant="simple">
          <Thead bg="bg.subtle">
            <Tr>
              {selectable &&
              <Th width="40px" px="4">
                  <Checkbox
                  isChecked={allSelected}
                  isIndeterminate={someSelected}
                  onChange={handleSelectAll} />

                </Th>
              }
              {columns.map((column) =>
              <Th
                key={column.key}
                width={column.width}
                textAlign={column.align || 'left'}
                cursor={column.sortable ? 'pointer' : 'default'}
                onClick={() => handleSort(column)}
                _hover={
                column.sortable ?
                {
                  bg: 'bg.muted'
                } :
                undefined
                }>

                  <Stack direction="row" align="center" gap="2">
                    <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase">

                      {column.label}
                    </Text>
                    {column.sortable && sortColumn === column.key &&
                  <Text fontSize="xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Text>
                  }
                  </Stack>
                </Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => {
              const id = row[rowKey];
              const isSelected = selectedRows.includes(id);
              return (
                <Tr
                  key={id}
                  bg={isSelected ? 'blue.50' : 'transparent'}
                  _hover={
                  hoverable ?
                  {
                    bg: 'bg.subtle'
                  } :
                  undefined
                  }
                  transition="background 150ms ease-in-out">

                  {selectable &&
                  <Td px="4">
                      <Checkbox
                      isChecked={isSelected}
                      onChange={() => handleSelectRow(id)} />

                    </Td>
                  }
                  {columns.map((column) =>
                  <Td key={column.key} textAlign={column.align || 'left'}>
                      {column.render ?
                    column.render(row[column.key], row) :
                    row[column.key]}
                    </Td>
                  )}
                </Tr>);

            })}
          </Tbody>
        </ChakraTable>
      </Box>
    </Box>);

}