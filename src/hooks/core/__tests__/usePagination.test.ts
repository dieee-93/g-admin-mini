import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePagination, generatePageNumbers } from '../usePagination';

describe('usePagination', () => {
  const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination(mockData));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.totalItems).toBe(100);
    expect(result.current.paginatedData).toHaveLength(25);
    expect(result.current.paginatedData[0].id).toBe(1);
    expect(result.current.paginatedData[24].id).toBe(25);
  });

  it('should handle custom initial page and page size', () => {
    const { result } = renderHook(() => usePagination(mockData, 10, { initialPage: 2 }));

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.paginatedData[0].id).toBe(11);
  });

  it('should navigate to next and previous pages', () => {
    const { result } = renderHook(() => usePagination(mockData, 10));

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('should not navigate beyond bounds', () => {
    const { result } = renderHook(() => usePagination(mockData, 25));

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToLastPage();
    });
    expect(result.current.currentPage).toBe(4);

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(4);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination(mockData, 10));

    act(() => {
      result.current.goToPage(5);
    });
    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.goToPage(999); // Out of bounds
    });
    expect(result.current.currentPage).toBe(10); // Max pages
  });

  it('should update page size and adjust current page if needed', () => {
    const { result } = renderHook(() => usePagination(mockData, 10, { initialPage: 10 })); // Last page

    expect(result.current.currentPage).toBe(10);

    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(2); // Should adjust to max page
  });

  it('should return correct range text', () => {
    const { result } = renderHook(() => usePagination(mockData, 10, { initialPage: 1 }));
    expect(result.current.rangeText).toBe('1-10 of 100');

    act(() => {
      result.current.goToLastPage();
    });
    expect(result.current.rangeText).toBe('91-100 of 100');
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() => usePagination([]));

    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPages).toBe(1); // Min 1 page even if empty? Logic says Math.max(1, ceil(0/25)) = 1
    expect(result.current.rangeText).toBe('0-0 of 0');
    expect(result.current.paginatedData).toEqual([]);
  });
});

describe('generatePageNumbers', () => {
  it('should show all pages when total pages is small', () => {
    expect(generatePageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show ellipsis correctly for many pages', () => {
    // Current page 1: [1, 2, 3, '...', 20]
    expect(generatePageNumbers(1, 20, 7)).toEqual([1, 2, 3, '...', 20]);

    // Current page 10: [1, '...', 8, 9, 10, 11, 12, '...', 20]
    expect(generatePageNumbers(10, 20, 7)).toEqual([1, '...', 8, 9, 10, 11, 12, '...', 20]);

    // Current page 20: [1, '...', 18, 19, 20]
    expect(generatePageNumbers(20, 20, 7)).toEqual([1, '...', 18, 19, 20]);
  });
});
