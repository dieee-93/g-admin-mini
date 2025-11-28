/**
 * Virtual List Component - High Performance List Rendering
 * 
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 * Only renders visible items in the viewport, dramatically improving performance
 * for lists with 50+ items.
 * 
 * Performance: Renders ~10-15 items instead of entire list (500+)
 * Memory: 95%+ reduction in DOM nodes
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={products}
 *   height={600}
 *   estimateSize={200}
 *   renderItem={(product) => <ProductCard product={product} />}
 * />
 * ```
 */

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box } from './Box';

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  
  /** Height of the scrollable container in pixels */
  height: number | string;
  
  /** Estimated height of each item (can be approximate) */
  estimateSize: number;
  
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /** Optional gap between items in pixels */
  gap?: number;
  
  /** Optional key extractor function */
  getItemKey?: (item: T, index: number) => string | number;
  
  /** Optional callback when scrolling near the end (infinite scroll) */
  onEndReached?: () => void;
  
  /** Distance from end to trigger onEndReached (default: 500px) */
  endReachedThreshold?: number;
  
  /** Optional overscan count (items to render outside viewport) */
  overscan?: number;
}

export function VirtualList<T>({
  items,
  height,
  estimateSize,
  renderItem,
  gap = 0,
  getItemKey,
  onEndReached,
  endReachedThreshold = 500,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    // Performance optimizations
    isScrollingResetDelay: 150,
    onChange: (instance) => {
      // Trigger onEndReached when scrolling near the end
      if (onEndReached) {
        const lastItem = instance.getVirtualItems().at(-1);
        if (lastItem && lastItem.index >= items.length - 3) {
          const scrollElement = instance.scrollElement;
          if (scrollElement) {
            const { scrollHeight, scrollTop, clientHeight } = scrollElement;
            const distanceFromEnd = scrollHeight - scrollTop - clientHeight;
            
            if (distanceFromEnd < endReachedThreshold) {
              onEndReached();
            }
          }
        }
      }
    },
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box
      ref={parentRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto',
        contain: 'strict',
      }}
    >
      <Box
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey 
            ? getItemKey(item, virtualItem.index)
            : virtualItem.index;

          return (
            <Box
              key={key}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                paddingBottom: gap ? `${gap}px` : undefined,
                willChange: virtualizer.isScrolling ? 'transform' : undefined,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * Virtual Grid Component - High Performance Grid Rendering
 * 
 * Similar to VirtualList but for grid layouts.
 * 
 * @example
 * ```tsx
 * <VirtualGrid
 *   items={products}
 *   height={600}
 *   columns={3}
 *   estimateSize={250}
 *   gap={16}
 *   renderItem={(product) => <ProductCard product={product} />}
 * />
 * ```
 */

export interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'gap'> {
  /** Number of columns in the grid */
  columns: number;
  
  /** Gap between items (horizontal and vertical) */
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  height,
  columns,
  estimateSize,
  renderItem,
  gap = 16,
  getItemKey,
  overscan = 5,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows based on columns
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
    // Performance optimizations for smooth scrolling
    isScrollingResetDelay: 150,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box
      ref={parentRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto',
        contain: 'strict',
      }}
    >
      <Box
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <Box
              key={virtualRow.index}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                willChange: virtualizer.isScrolling ? 'transform' : undefined,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex;
                const key = getItemKey 
                  ? getItemKey(item, itemIndex)
                  : itemIndex;

                return (
                  <Box key={key}>
                    {renderItem(item, itemIndex)}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
