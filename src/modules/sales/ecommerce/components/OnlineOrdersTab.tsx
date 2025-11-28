/**
 * ONLINE ORDERS TAB COMPONENT
 * Manages e-commerce orders from online store
 *
 * FEATURES:
 * - View all online orders
 * - Update order status (pending, processing, shipped, delivered, cancelled)
 * - Update payment status
 * - Filter by status and date
 */

import { useState } from 'react';
import {
  Stack,
  // TODO: Add export/print functionality using Button component
  // Button,
  Badge,
  Alert,
  Icon,
  Text,
  SelectField,
  Spinner,
  Table,
} from '@/shared/ui';
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useOnlineOrders } from '../hooks';
import { logger } from '@/lib/logging';

export function OnlineOrdersTab() {
  const {
    orders,
    loading,
    error,
    filters,
    setFilters,
    updateOrderStatus,
  } = useOnlineOrders();

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Handle status update
  const handleStatusUpdate = async (
    orderId: string,
    field: 'order_status' | 'payment_status',
    value: string
  ) => {
    setProcessingId(orderId);
    try {
      await updateOrderStatus(orderId, { [field]: value });
      logger.info('OnlineOrdersTab', `✅ Updated order ${orderId} ${field} to ${value}`);
    } catch (error) {
      logger.error('OnlineOrdersTab', '❌ Error updating order status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: typeof ClockIcon }> = {
      PENDING: { color: 'yellow', label: 'Pending', icon: ClockIcon },
      PROCESSING: { color: 'blue', label: 'Processing', icon: ShoppingCartIcon },
      SHIPPED: { color: 'purple', label: 'Shipped', icon: TruckIcon },
      DELIVERED: { color: 'green', label: 'Delivered', icon: CheckCircleIcon },
      CANCELLED: { color: 'red', label: 'Cancelled', icon: XCircleIcon },
    };

    const config = statusMap[status] || statusMap.PENDING;

    return (
      <Badge colorPalette={config.color}>
        <Icon as={config.icon} mr="1" />
        {config.label}
      </Badge>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'yellow', label: 'Pending' },
      PAID: { color: 'green', label: 'Paid' },
      FAILED: { color: 'red', label: 'Failed' },
      REFUNDED: { color: 'gray', label: 'Refunded' },
    };

    const config = statusMap[status] || statusMap.PENDING;

    return <Badge colorPalette={config.color}>{config.label}</Badge>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack gap="xs">
          <Text fontSize="xl" fontWeight="semibold">
            <Icon as={ShoppingCartIcon} mr="2" />
            Online Orders
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage orders from your e-commerce store
          </Text>
        </Stack>
        <Badge colorPalette="blue" size="lg">
          {orders.length} Orders
        </Badge>
      </Stack>

      {/* Filters */}
      <Stack direction="row" gap="md">
        <SelectField
          options={[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          value={[filters.status || 'all']}
          onValueChange={(details) => setFilters({ ...filters, status: details.value[0] as 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' })}
          width="200px"
          noPortal
        />

        <SelectField
          options={[
            { value: 'all', label: 'All Payments' },
            { value: 'pending', label: 'Pending Payment' },
            { value: 'paid', label: 'Paid' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' }
          ]}
          value={[filters.payment_status || 'all']}
          onValueChange={(details) => setFilters({ ...filters, payment_status: details.value[0] as 'all' | 'pending' | 'paid' | 'failed' | 'refunded' })}
          width="200px"
          noPortal
        />
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" title="Error loading orders">
          {error.message}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Stack align="center" py="8">
          <Spinner size="lg" />
          <Text>Loading online orders...</Text>
        </Stack>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Order ID</Table.ColumnHeader>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Date</Table.ColumnHeader>
              <Table.ColumnHeader>Total</Table.ColumnHeader>
              <Table.ColumnHeader>Order Status</Table.ColumnHeader>
              <Table.ColumnHeader>Payment Status</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell>
                  <Text fontSize="sm" fontFamily="mono">
                    {order.id.slice(0, 8)}...
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap="1">
                    <Text fontWeight="medium">
                      {order.customer?.name || 'Guest'}
                    </Text>
                    {order.customer?.email && (
                      <Text fontSize="xs" color="gray.600">
                        {order.customer.email}
                      </Text>
                    )}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm">{formatDate(order.created_at)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold">${order.total?.toFixed(2) || '0.00'}</Text>
                </Table.Cell>
                <Table.Cell>{getOrderStatusBadge(order.order_status)}</Table.Cell>
                <Table.Cell>{getPaymentStatusBadge(order.payment_status)}</Table.Cell>
                <Table.Cell>
                  <Stack direction="row" gap="2">
                    <SelectField
                      options={[
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'PROCESSING', label: 'Processing' },
                        { value: 'SHIPPED', label: 'Shipped' },
                        { value: 'DELIVERED', label: 'Delivered' },
                        { value: 'CANCELLED', label: 'Cancelled' }
                      ]}
                      value={[order.order_status]}
                      onValueChange={(details) =>
                        handleStatusUpdate(order.id, 'order_status', details.value[0])
                      }
                      width="150px"
                      size="sm"
                      disabled={processingId === order.id}
                      noPortal
                    />
                  </Stack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <Stack align="center" py="8" gap="md">
          <Icon as={ShoppingCartIcon} boxSize="12" color="gray.400" />
          <Text fontSize="lg" color="gray.600">
            No online orders yet
          </Text>
          <Text fontSize="sm" color="gray.500">
            {filters.status !== 'all' || filters.payment_status !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders from your e-commerce store will appear here'}
          </Text>
        </Stack>
      )}

      {/* Info Alert */}
      <Alert status="info" title="💡 Order Management Tips">
        <Stack gap="2">
          <Text>• Update order status to keep customers informed</Text>
          <Text>• Orders marked as "Delivered" are considered complete</Text>
          <Text>• Payment status is updated automatically by payment gateway</Text>
        </Stack>
      </Alert>
    </Stack>
  );
}
