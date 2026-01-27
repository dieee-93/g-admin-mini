/**
 * FULFILLMENT QUEUE COMPONENT - CORE
 *
 * Shared component for displaying fulfillment queue items.
 * Used by all 3 fulfillment types (onsite, pickup, delivery).
 *
 * Features:
 * - Real-time updates via Supabase subscriptions
 * - Filterable by type, status, location
 * - Priority-based sorting
 * - Action buttons (assign, complete, cancel)
 * - Responsive grid layout
 *
 * REUSE: 85% - Used by all 3 fulfillment channels
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import React from 'react';
import {
  Stack,
  Grid,
  CardWrapper,
  Badge,
  Button,
  Icon,
  Typography,
  HStack,
  VStack,
  Spinner
} from '@/shared/ui';
import {
  ClockIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { fulfillmentService } from '../services/fulfillmentService';
import type {
  QueueItem,
  QueueFilters,
  QueueStatus,
  FulfillmentType
} from '../services/fulfillmentService';
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

// ============================================
// COMPONENT PROPS
// ============================================

export interface FulfillmentQueueProps {
  /**
   * Filter by specific fulfillment type
   * If not provided, shows all types
   */
  type?: FulfillmentType;

  /**
   * Additional filters
   */
  filters?: Partial<QueueFilters>;

  /**
   * Item click handler
   */
  onItemClick?: (item: QueueItem) => void;

  /**
   * Available actions configuration
   */
  actions?: {
    canAssign?: boolean;
    canComplete?: boolean;
    canCancel?: boolean;
    canRefresh?: boolean;
  };

  /**
   * Custom action buttons
   */
  customActions?: (item: QueueItem) => React.ReactNode;

  /**
   * Layout configuration
   */
  layout?: {
    columns?: number; // Grid columns (default: auto-fill)
    gap?: 'sm' | 'md' | 'lg'; // Gap between cards
    minWidth?: string; // Min card width
  };

  /**
   * Show/hide elements
   */
  display?: {
    showPriority?: boolean;
    showAssignedUser?: boolean;
    showCustomer?: boolean;
    showOrderValue?: boolean;
    showEstimatedTime?: boolean;
    showLocation?: boolean;
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FulfillmentQueue({
  type,
  filters = {},
  onItemClick,
  actions = {
    canAssign: true,
    canComplete: true,
    canCancel: true,
    canRefresh: true
  },
  customActions,
  layout = {
    columns: undefined,
    gap: 'md',
    minWidth: '350px'
  },
  display = {
    showPriority: true,
    showAssignedUser: true,
    showCustomer: true,
    showOrderValue: true,
    showEstimatedTime: true,
    showLocation: false
  }
}: FulfillmentQueueProps) {
  // State
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Merge filters - memoize to prevent unnecessary re-renders
  const mergedFilters: QueueFilters = React.useMemo(() => ({
    ...filters,
    type: type || filters.type
  }), [filters, type]);

  // ============================================
  // DATA LOADING
  // ============================================

  /**
   * Load queue data from database
   */
  const loadQueue = React.useCallback(async () => {
    try {
      if (!loading) setRefreshing(true);

      const data = await fulfillmentService.getQueue(mergedFilters);
      setItems(data);

      logger.debug('FulfillmentQueue', 'Queue loaded', {
        itemCount: data.length,
        filters: mergedFilters
      });
    } catch (error) {
      logger.error('FulfillmentQueue', 'Error loading queue', error);
      notify.error({
        title: 'Error loading queue',
        description: 'Please try refreshing'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mergedFilters, loading]);

  /**
   * Initial load
   */
  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  /**
   * Real-time subscription
   */
  React.useEffect(() => {
    logger.debug('FulfillmentQueue', 'Setting up real-time subscription');

    const subscription = supabase
      .channel('fulfillment-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fulfillment_queue'
        },
        (payload) => {
          logger.debug('FulfillmentQueue', 'Real-time update received', payload);
          loadQueue();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      logger.debug('FulfillmentQueue', 'Real-time subscription cleaned up');
    };
  }, [loadQueue]);

  // ============================================
  // ACTION HANDLERS
  // ============================================

  /**
   * Handle assign action
   */
  const handleAssign = async (queueId: string) => {
    try {
      // TODO: Open dialog to select user
      // For now, assign to current user (mock)
      const currentUserId = 'current-user-id'; // Get from auth context

      await fulfillmentService.assignOrder(queueId, currentUserId);

      notify.success({
        title: 'Order assigned',
        description: 'Order has been assigned successfully'
      });

      loadQueue();
    } catch (error) {
      logger.error('FulfillmentQueue', 'Error assigning order', error);
      notify.error({
        title: 'Error assigning order',
        description: 'Please try again'
      });
    }
  };

  /**
   * Handle complete action
   */
  const handleComplete = async (queueId: string) => {
    try {
      await fulfillmentService.transitionStatus(queueId, 'completed');

      notify.success({
        title: 'Order completed',
        description: 'Order marked as completed'
      });

      loadQueue();
    } catch (error) {
      logger.error('FulfillmentQueue', 'Error completing order', error);
      notify.error({
        title: 'Error completing order',
        description: 'Please try again'
      });
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = async (queueId: string) => {
    try {
      // TODO: Add confirmation dialog
      await fulfillmentService.transitionStatus(queueId, 'cancelled');

      notify.info({
        title: 'Order cancelled',
        description: 'Order has been cancelled'
      });

      loadQueue();
    } catch (error) {
      logger.error('FulfillmentQueue', 'Error cancelling order', error);
      notify.error({
        title: 'Error cancelling order',
        description: 'Please try again'
      });
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadQueue();
    notify.success({ title: 'Queue refreshed' });
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Get status badge color
   */
  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'in_progress':
        return 'blue';
      case 'ready':
        return 'green';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'gray';
    }
  };

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'red';
    if (priority >= 2) return 'orange';
    if (priority >= 1) return 'yellow';
    return 'gray';
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return 'Critical';
    if (priority >= 2) return 'Urgent';
    if (priority >= 1) return 'High';
    return 'Normal';
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  /**
   * Format estimated time
   */
  const formatEstimatedTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // RENDER STATES
  // ============================================

  /**
   * Loading state
   */
  if (loading && !items.length) {
    return (
      <Stack align="center" justify="center" h="200px" gap="md">
        <Spinner size="lg" />
        <Typography color="text.muted">Loading queue...</Typography>
      </Stack>
    );
  }

  /**
   * Empty state
   */
  if (!items.length) {
    return (
      <Stack align="center" justify="center" h="200px" gap="sm">
        <Typography fontSize="lg" color="text.muted">
          No orders in queue
        </Typography>
        {actions.canRefresh && (
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <Icon icon={ArrowPathIcon} size="sm" />
            Refresh
          </Button>
        )}
      </Stack>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <VStack gap={layout.gap}>
      {/* Header with refresh button */}
      {actions.canRefresh && (
        <HStack justify="space-between" w="full">
          <Typography fontSize="sm" color="text.muted">
            {items.length} order{items.length !== 1 ? 's' : ''} in queue
          </Typography>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            isLoading={refreshing}
          >
            <Icon icon={ArrowPathIcon} size="sm" />
            Refresh
          </Button>
        </HStack>
      )}

      {/* Queue grid */}
      <Grid
        templateColumns={
          layout.columns
            ? `repeat(${layout.columns}, 1fr)`
            : `repeat(auto-fill, minmax(${layout.minWidth}, 1fr))`
        }
        gap={layout.gap}
      >
        {items.map((item) => (
          <CardWrapper
            key={item.id}
            onClick={() => onItemClick?.(item)}
            cursor={onItemClick ? 'pointer' : 'default'}
            _hover={
              onItemClick
                ? {
                    borderColor: 'blue.500',
                    shadow: 'md'
                  }
                : undefined
            }
          >
            <VStack align="start" gap="sm">
              {/* Header: Order number + Badges */}
              <HStack justify="space-between" w="full">
                <Typography size="lg" fontWeight="bold">
                  Order #{item.order?.number || item.order_id.slice(0, 8)}
                </Typography>
                <HStack gap="xs">
                  {display.showPriority && item.priority > 0 && (
                    <Badge
                      colorPalette={getPriorityColor(item.priority)}
                      size="sm"
                    >
                      {getPriorityLabel(item.priority)}
                    </Badge>
                  )}
                  <Badge colorPalette={getStatusColor(item.status)} size="sm">
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>
              </HStack>

              {/* Type & Customer */}
              <HStack justify="space-between" w="full">
                <Badge colorPalette="gray" variant="subtle">
                  {item.fulfillment_type.toUpperCase()}
                </Badge>
                {display.showCustomer && item.order?.customer && (
                  <Typography size="sm" color="text.muted">
                    {item.order.customer.name}
                  </Typography>
                )}
              </HStack>

              {/* Timing info */}
              {display.showEstimatedTime && (
                <HStack gap="xs" align="center" w="full">
                  <Icon icon={ClockIcon} size="sm" />
                  <Typography size="sm">
                    Est: {formatEstimatedTime(item.estimated_ready_time)}
                  </Typography>
                  {item.actual_ready_time && (
                    <Typography size="sm" color="green.600">
                      (Ready at {formatEstimatedTime(item.actual_ready_time)})
                    </Typography>
                  )}
                </HStack>
              )}

              {/* Created ago */}
              <Typography size="xs" color="text.muted">
                Created {formatTimeAgo(item.created_at)}
              </Typography>

              {/* Assigned user */}
              {display.showAssignedUser && item.assigned_user && (
                <HStack gap="xs" align="center">
                  <Icon icon={UserIcon} size="sm" />
                  <Typography size="sm">{item.assigned_user.name}</Typography>
                </HStack>
              )}

              {/* Location */}
              {display.showLocation && item.location_id && (
                <HStack gap="xs" align="center">
                  <Icon icon={MapPinIcon} size="sm" />
                  <Typography size="sm">
                    Location: {item.location_id.slice(0, 8)}
                  </Typography>
                </HStack>
              )}

              {/* Order value */}
              {display.showOrderValue && item.order?.total && (
                <Typography size="sm" fontWeight="medium">
                  Total: {DecimalUtils.formatCurrency(item.order.total)}
                </Typography>
              )}

              {/* Type-specific metadata preview */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <Stack direction="row" gap="xs" flexWrap="wrap">
                  {item.metadata.table_number && (
                    <Badge colorPalette="cyan" variant="subtle" size="sm">
                      Table #{item.metadata.table_number}
                    </Badge>
                  )}
                  {item.metadata.pickup_code && (
                    <Badge colorPalette="green" variant="subtle" size="sm">
                      Code: {item.metadata.pickup_code}
                    </Badge>
                  )}
                  {item.metadata.driver_name && (
                    <Badge colorPalette="blue" variant="subtle" size="sm">
                      Driver: {item.metadata.driver_name}
                    </Badge>
                  )}
                </Stack>
              )}

              {/* Divider */}
              {(actions.canAssign ||
                actions.canComplete ||
                actions.canCancel ||
                customActions) &&
                item.status !== 'completed' &&
                item.status !== 'cancelled' && <hr />}

              {/* Action buttons */}
              {item.status !== 'completed' && item.status !== 'cancelled' && (
                <HStack gap="xs" justify="end" w="full" pt="2">
                  {/* Custom actions */}
                  {customActions?.(item)}

                  {/* Assign */}
                  {actions.canAssign && item.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssign(item.id);
                      }}
                    >
                      Assign
                    </Button>
                  )}

                  {/* Complete */}
                  {actions.canComplete && item.status === 'ready' && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(item.id);
                      }}
                    >
                      <Icon icon={CheckIcon} size="sm" />
                      Complete
                    </Button>
                  )}

                  {/* Cancel */}
                  {actions.canCancel && (
                    <Button
                      size="sm"
                      colorPalette="red"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(item.id);
                      }}
                    >
                      <Icon icon={XMarkIcon} size="sm" />
                      Cancel
                    </Button>
                  )}
                </HStack>
              )}
            </VStack>
          </CardWrapper>
        ))}
      </Grid>
    </VStack>
  );
}

// ============================================
// EXPORTS
// ============================================

export default FulfillmentQueue;
