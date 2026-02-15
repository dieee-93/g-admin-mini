// VirtualizedList.tsx - High-performance virtualized list component
// Handles large datasets with minimal memory footprint

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback
} from 'react';
import type { CSSProperties } from 'react';
import { Box, VStack } from '@/shared/ui';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  scrollToIndex?: number;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  className?: string;
  estimatedItemHeight?: number; // For variable height items
  getItemHeight?: (index: number) => number; // For variable height items
  loadMore?: () => void; // Infinite scroll callback
  hasMore?: boolean;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  bufferSize?: number; // Number of items to keep in memory buffer
}

interface VirtualizedListState {
  scrollTop: number;
  isScrolling: boolean;
  visibleRange: { start: number; end: number };
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeightItem,
  overscan = 5,
  scrollToIndex,
  onScroll,
  className,
  estimatedItemHeight,
  getItemHeight,
  loadMore,
  hasMore = false,
  loading = false,
  loadingComponent,
  emptyComponent,
  bufferSize = 10
}: VirtualizedListProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualizedListState>({
    scrollTop: 0,
    isScrolling: false,
    visibleRange: { start: 0, end: 0 }
  });

  // Memoized calculations for performance
  const { totalHeight, visibleItems, startIndex, endIndex } = useMemo(() => {
    const totalCount = items.length;
    
    // Calculate total height
    let totalH: number;
    if (getItemHeight) {
      totalH = items.reduce((sum, _, index) => sum + getItemHeight(index), 0);
    } else {
      totalH = totalCount * itemHeight;
    }

    // Calculate visible range
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIdx = Math.floor(state.scrollTop / itemHeight);
    const endIdx = Math.min(startIdx + visibleItemCount + overscan * 2, totalCount);
    const actualStartIdx = Math.max(0, startIdx - overscan);

    // Get visible items with buffer
    const visibleSlice = items.slice(actualStartIdx, endIdx);

    return {
      totalHeight: totalH,
      visibleItems: visibleSlice,
      startIndex: actualStartIdx,
      endIndex: endIdx
    };
  }, [items, itemHeight, containerHeight, state.scrollTop, overscan, getItemHeight]);

  // Handle scroll events with throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const scrollHeight = event.currentTarget.scrollHeight;
    
    setState(prev => ({
      ...prev,
      scrollTop,
      isScrolling: true,
      visibleRange: { start: startIndex, end: endIndex }
    }));

    onScroll?.(scrollTop, scrollHeight);

    // Infinite scroll trigger
    if (loadMore && hasMore && !loading) {
      const threshold = scrollHeight - containerHeight - 200; // 200px before end
      if (scrollTop >= threshold) {
        loadMore();
      }
    }

    // Stop scrolling indicator after delay
    const scrollTimeout = setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false }));
    }, 150);

    return () => clearTimeout(scrollTimeout);
  }, [startIndex, endIndex, onScroll, loadMore, hasMore, loading, containerHeight]);

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const scrollTop = scrollToIndex * itemHeight;
      scrollElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollToIndex, itemHeight]);

  // Calculate item offset position
  const getItemOffset = useCallback((index: number): number => {
    if (getItemHeight) {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    }
    return index * itemHeight;
  }, [itemHeight, getItemHeight]);

  // Render visible items
  const renderVisibleItems = () => {
    return visibleItems.map((item, index) => {
      const actualIndex = startIndex + index;
      const offset = getItemOffset(actualIndex);
      const height = getItemHeight ? getItemHeight(actualIndex) : itemHeight;

      const style: CSSProperties = {
        position: 'absolute',
        top: offset,
        left: 0,
        right: 0,
        height,
        display: 'flex',
        alignItems: 'center'
      };

      return (
        <div key={actualIndex} style={style}>
          {renderItem(item, actualIndex, style)}
        </div>
      );
    });
  };

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <Box
        height={containerHeight}
        display="flex"
        alignItems="center"
        justifyContent="center"
        className={className}
      >
        {emptyComponent || <div>No items to display</div>}
      </Box>
    );
  }

  return (
    <Box
      ref={scrollElementRef}
      height={containerHeight}
      overflowY="auto"
      overflowX="hidden"
      onScroll={handleScroll}
      className={className}
      position="relative"
    >
      {/* Virtual container with total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {renderVisibleItems()}
        
        {/* Loading indicator for infinite scroll */}
        {loading && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="60px"
          >
            {loadingComponent || <div>Loading...</div>}
          </Box>
        )}
      </div>
    </Box>
  );
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>(items: T[], options: {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  bufferSize?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const visibleRange = useMemo(() => {
    const { itemHeight, containerHeight, overscan = 5 } = options;
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length, startIndex + visibleItemCount + overscan * 2);
    
    return { start: startIndex, end: endIndex };
  }, [items.length, scrollTop, options]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const scrollToIndex = useCallback((index: number) => {
    const newScrollTop = index * options.itemHeight;
    setScrollTop(newScrollTop);
  }, [options.itemHeight]);

  return {
    scrollTop,
    isScrolling,
    visibleRange,
    visibleItems,
    setScrollTop,
    setIsScrolling,
    scrollToIndex
  };
}

export default VirtualizedList;