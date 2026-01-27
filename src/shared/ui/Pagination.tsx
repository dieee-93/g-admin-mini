/* eslint-disable precision/no-native-arithmetic */
import { Stack, Button, Text, Box } from '@chakra-ui/react';
import { SelectField } from './SelectField';

export interface PaginationProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Items per page
   */
  pageSize?: number;
  /**
   * Options for items per page
   */
  pageSizeOptions?: number[];
  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Total items (to show info)
   */
  totalItems?: number;
  /**
   * Show page size selector
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

  const handlePageSizeChange = (details: { value: string[] }) => {
    const newSize = parseInt(details.value[0], 10);
    if (!isNaN(newSize)) {
      onPageSizeChange?.(newSize);
      onPageChange(1); // Reset to first page
    }
  };

  // Generate page numbers to show
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
      py="4"
    >
      {/* Items info */}
      {totalItems !== undefined && (
        <Text fontSize="sm" color="text.secondary">
          Mostrando {startItem} - {endItem} de {totalItems} resultados
        </Text>
      )}

      {/* Pagination controls */}
      <Stack direction="row" gap="2" align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          bg="bg.surface"
          color="text.primary"
          borderColor="border.default"
          _hover={{ bg: "bg.subtle" }}
          _active={{ bg: "bg.muted" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          Anterior
        </Button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`ellipsis-${index}`} px="2" color="text.secondary">
                ...
              </Text>
            );
          }
          
          const isCurrent = currentPage === page;
          
          return (
            <Button
              key={page}
              size="sm"
              variant={isCurrent ? 'solid' : 'outline'}
              onClick={() => onPageChange(page as number)}
              bg={isCurrent ? "interactive.primary" : "bg.surface"}
              color={isCurrent ? "white" : "text.primary"}
              borderColor={isCurrent ? "transparent" : "border.default"}
              _hover={{ 
                bg: isCurrent ? "interactive.primary.hover" : "bg.subtle" 
              }}
              _active={{ 
                bg: isCurrent ? "interactive.primary.active" : "bg.muted" 
              }}
            >
              {page}
            </Button>
          );
        })}

        <Button
          size="sm"
          variant="outline"
          onClick={handleNext}
          disabled={!canGoNext}
          bg="bg.surface"
          color="text.primary"
          borderColor="border.default"
          _hover={{ bg: "bg.subtle" }}
          _active={{ bg: "bg.muted" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          Siguiente
        </Button>
      </Stack>

      {/* Page size selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <Stack direction="row" align="center" gap="2">
          <Text fontSize="sm" color="text.secondary">
            Items por página:
          </Text>
          <Box width="80px">
            <SelectField
              size="sm"
              value={[pageSize.toString()]}
              onValueChange={handlePageSizeChange}
              options={pageSizeOptions.map((size) => ({
                value: size,
                label: size.toString()
              }))}
              collection={undefined} // ensure we use options
              noPortal // Avoid portal issues inside layouts if needed, though usually fine
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
