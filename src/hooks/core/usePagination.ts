/**
 * usePagination Hook - Client-Side Pagination
 *
 * Reusable React hook that provides comprehensive pagination functionality
 * for any array of data. Handles page state management, calculations,
 * navigation, and provides utility functions for building pagination UIs.
 *
 * **Features**:
 * - ✅ Client-side pagination (no server requests)
 * - ✅ Configurable page size with dynamic updates
 * - ✅ Automatic page validation and bounds checking
 * - ✅ Navigation utilities (first, last, next, prev)
 * - ✅ Range information for "1-10 of 100" displays
 * - ✅ State checks (hasNextPage, isFirstPage, etc.)
 * - ✅ TypeScript generic support for type safety
 *
 * **Performance**:
 * - Uses React.useMemo for optimized calculations
 * - Uses React.useCallback for stable function references
 * - Minimal re-renders via selective memoization
 *
 * @template T - Type of data items in the array
 *
 * @param data - Array of items to paginate
 * @param defaultPageSize - Default items per page (default: 25)
 * @param options - Optional configuration
 * @param options.initialPage - Starting page number (default: 1)
 * @param options.initialPageSize - Initial page size (overrides defaultPageSize)
 * @returns PaginationResult object with paginated data and utilities
 *
 * @example Basic Usage
 * ```tsx
 * import { usePagination } from '@/hooks/usePagination';
 *
 * function MaterialsTable({ materials }) {
 *   const pagination = usePagination(materials, 25);
 *
 *   return (
 *     <div>
 *       <Table data={pagination.paginatedData} />
 *       <PaginationControls
 *         current={pagination.currentPage}
 *         total={pagination.totalPages}
 *         onPageChange={pagination.goToPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Custom Page Size
 * ```tsx
 * const pagination = usePagination(items, 50, {
 *   initialPage: 2,
 *   initialPageSize: 50
 * });
 *
 * // Allow user to change page size
 * <select onChange={(e) => pagination.setPageSize(Number(e.target.value))}>
 *   <option value="10">10</option>
 *   <option value="25">25</option>
 *   <option value="50">50</option>
 * </select>
 * ```
 *
 * @example Complete Pagination UI
 * ```tsx
 * function PaginatedList({ items }) {
 *   const {
 *     paginatedData,
 *     currentPage,
 *     totalPages,
 *     rangeText,
 *     goToFirstPage,
 *     goToLastPage,
 *     nextPage,
 *     prevPage,
 *     hasNextPage,
 *     hasPrevPage
 *   } = usePagination(items, 20);
 *
 *   return (
 *     <>
 *       <ItemsList items={paginatedData} />
 *
 *       <Stack direction="row" justify="space-between">
 *         <Text>{rangeText}</Text>
 *
 *         <Stack direction="row" gap="2">
 *           <Button onClick={goToFirstPage} disabled={!hasPrevPage}>
 *             First
 *           </Button>
 *           <Button onClick={prevPage} disabled={!hasPrevPage}>
 *             Previous
 *           </Button>
 *           <Text>Page {currentPage} of {totalPages}</Text>
 *           <Button onClick={nextPage} disabled={!hasNextPage}>
 *             Next
 *           </Button>
 *           <Button onClick={goToLastPage} disabled={!hasNextPage}>
 *             Last
 *           </Button>
 *         </Stack>
 *       </Stack>
 *     </>
 *   );
 * }
 * ```
 */

import { useMemo, useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface PaginationResult<T> {
  // Current state
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // Paginated data
  paginatedData: T[];

  // Range info
  startIndex: number;
  endIndex: number;
  rangeText: string; // "1-10 of 100"

  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;

  // State checks
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

// ============================================
// HOOK
// ============================================

/**
 * Create paginated view of data array
 *
 * @see usePagination hook documentation for full details and examples
 */
export function usePagination<T>(
  data: T[],
  defaultPageSize: number = 25,
  options: PaginationOptions = {}
): PaginationResult<T> {
  const { initialPage = 1, initialPageSize = defaultPageSize } = options;

  // State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Calculations
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is valid when data or pageSize changes
  const validCurrentPage = useMemo(() => {
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Calculate indices
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Paginated data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Range text
  const rangeText = useMemo(() => {
    if (totalItems === 0) return '0-0 of 0';
    return `${startIndex + 1}-${endIndex} of ${totalItems}`;
  }, [startIndex, endIndex, totalItems]);

  // State checks
  const hasNextPage = validCurrentPage < totalPages;
  const hasPrevPage = validCurrentPage > 1;
  const isFirstPage = validCurrentPage === 1;
  const isLastPage = validCurrentPage === totalPages;

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    const validSize = Math.max(1, size);
    setPageSizeState(validSize);

    // Adjust current page if needed
    const newTotalPages = Math.ceil(totalItems / validSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [currentPage, totalItems]);

  return {
    // Current state
    currentPage: validCurrentPage,
    pageSize,
    totalItems,
    totalPages,

    // Paginated data
    paginatedData,

    // Range info
    startIndex,
    endIndex,
    rangeText,

    // Navigation
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,

    // State checks
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage
  };
}

// ============================================
// HELPER: Generate page numbers for UI
// ============================================

/**
 * Generate smart page numbers array for pagination UI
 *
 * Creates an intelligent array of page numbers with ellipsis ('...') for
 * compact pagination displays. Always shows first, last, and pages around
 * the current page.
 *
 * **Algorithm**:
 * - If total pages ≤ maxVisible: Show all pages
 * - Otherwise: Show first, last, current ± siblings, with '...' for gaps
 *
 * @param currentPage - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum page numbers to show (default: 7)
 * @returns Array of page numbers and '...' strings
 *
 * @example Few Pages (all visible)
 * ```typescript
 * generatePageNumbers(2, 5)
 * // Result: [1, 2, 3, 4, 5]
 * ```
 *
 * @example Many Pages (with ellipsis)
 * ```typescript
 * generatePageNumbers(1, 20, 7)
 * // Result: [1, 2, 3, '...', 20]
 *
 * generatePageNumbers(10, 20, 7)
 * // Result: [1, '...', 9, 10, 11, '...', 20]
 *
 * generatePageNumbers(20, 20, 7)
 * // Result: [1, '...', 18, 19, 20]
 * ```
 *
 * @example Rendering in UI
 * ```tsx
 * const pageNumbers = generatePageNumbers(currentPage, totalPages);
 *
 * return (
 *   <Stack direction="row" gap="1">
 *     {pageNumbers.map((page, i) =>
 *       typeof page === 'number' ? (
 *         <Button
 *           key={page}
 *           onClick={() => goToPage(page)}
 *           variant={page === currentPage ? 'solid' : 'ghost'}
 *         >
 *           {page}
 *         </Button>
 *       ) : (
 *         <Text key={`ellipsis-${i}`}>...</Text>
 *       )
 *     )}
 *   </Stack>
 * );
 * ```
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | string)[] {
  if (totalPages <= maxVisible) {
    // Show all pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const leftSiblings = Math.floor((maxVisible - 3) / 2);
  const rightSiblings = Math.ceil((maxVisible - 3) / 2);

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const startPage = Math.max(2, currentPage - leftSiblings);
  const endPage = Math.min(totalPages - 1, currentPage + rightSiblings);

  // Add ellipsis before range if needed
  if (startPage > 2) {
    pages.push('...');
  }

  // Add range
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis after range if needed
  if (endPage < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
