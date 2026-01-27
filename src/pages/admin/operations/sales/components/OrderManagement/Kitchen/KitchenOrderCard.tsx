import {
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Progress,
  Alert,
  Separator
} from '@chakra-ui/react';
import { CardWrapper, Button } from '@/shared/ui';
import {
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  type KitchenOrder,
  KitchenItemStatus,
  PriorityLevel
} from '../../../types';
import {
  getOrderTiming,
  getPriorityColor,
  getItemStatusColor,
  getActionButtonText,
  getNextItemStatus
} from './utils';

interface KitchenOrderCardProps {
  order: KitchenOrder;
  selectedStation: string;
  onUpdateItemStatus: (orderId: string, itemId: string, status: KitchenItemStatus) => void;
  onPriorityChange: (orderId: string, priority: PriorityLevel) => void;
  onCompleteOrder: (orderId: string) => void;
}

export function KitchenOrderCard({
  order,
  selectedStation,
  onUpdateItemStatus,
  onPriorityChange,
  onCompleteOrder
}: KitchenOrderCardProps) {
  const timing = getOrderTiming(order);
  const priorityColor = getPriorityColor(order.priority);

  const handleItemAction = (itemId: string, currentStatus: KitchenItemStatus) => {
    const nextStatus = getNextItemStatus(currentStatus);
    if (nextStatus) {
      onUpdateItemStatus(order.order_id, itemId, nextStatus);
    }
  };

  return (
    <CardWrapper
      p={{ base: "3", md: "4" }}
      borderWidth="2px"
      borderColor={timing.isOverdue ? 'red.300' : 'gray.200'}
      bg={timing.isOverdue ? 'red.50' : 'white'}
      role="gridcell"
      aria-label={`Order ${order.order_number}, ${timing.isOverdue ? 'overdue' : 'on time'}, ${order.items.length} items`}
    >
      <VStack gap="4" align="stretch">
        {/* Order Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="0">
            <HStack gap="2">
              <Text fontWeight="bold" fontSize="lg">
                Order #{order.order_number}
              </Text>
              <Badge colorPalette={priorityColor} size="sm">
                {order.priority && order.priority.toUpperCase()}
              </Badge>
            </HStack>
            {order.table_number && (
              <Text fontSize="sm" color="gray.600">
                Table {order.table_number}
              </Text>
            )}
          </VStack>

          <VStack align="end" gap="0">
            <Text fontSize="sm" fontWeight="medium">
              {timing.elapsedMinutes}m elapsed
            </Text>
            <Text
              fontSize="sm"
              color={timing.isOverdue ? 'red.600' : 'gray.600'}
            >
              {timing.isOverdue ?
                `${Math.abs(timing.remainingMinutes)}m overdue` :
                `${timing.remainingMinutes}m remaining`
              }
            </Text>
          </VStack>
        </HStack>

        {/* Progress Bar */}
        <Box>
          <Progress.Root
            value={timing.progressPercentage}
            size="sm"
            colorPalette={timing.isOverdue ? 'red' : 'blue'}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.500" mt="1">
            {order.completion_percentage}% complete
          </Text>
        </Box>

        {/* Special Instructions & Allergies */}
        {((order.special_instructions?.length || 0) > 0 || (order.allergy_warnings?.length || 0) > 0) && (
          <VStack gap="2" align="stretch">
            {(order.special_instructions?.length || 0) > 0 && (
              <Alert.Root status="info" size="sm">
                <Alert.Indicator />
                <Alert.Title>Special Instructions</Alert.Title>
                <Alert.Description>
                  {order.special_instructions?.join(', ') || ''}
                </Alert.Description>
              </Alert.Root>
            )}

            {(order.allergy_warnings?.length || 0) > 0 && (
              <Alert.Root status="warning" size="sm">
                <Alert.Indicator />
                <Alert.Title>Allergy Warnings</Alert.Title>
                <Alert.Description>
                  {order.allergy_warnings?.join(', ') || ''}
                </Alert.Description>
              </Alert.Root>
            )}
          </VStack>
        )}

        {/* Order Items */}
        <VStack gap="3" align="stretch">
          {order.items
            .filter(item => selectedStation === 'all' || item.station === selectedStation)
            .map((item) => {
              const statusColor = getItemStatusColor(item.status);

              return (
                <CardWrapper key={item.item_id} p="3" variant="outline" size="sm">
                  <VStack gap="2" align="stretch">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium">
                          {item.quantity}x {item.product_name}
                        </Text>
                        <Text fontSize="xs" color="gray.600" textTransform="capitalize">
                          {item.station} • ~{item.estimated_prep_time}m
                        </Text>
                      </VStack>

                      <Badge colorPalette={statusColor} size="sm">
                        {item.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </HStack>

                    {/* Item Modifications */}
                    {(item.modifications?.length || 0) > 0 && (
                      <Box p="2" bg="gray.50" borderRadius="sm">
                        <Text fontSize="xs" fontWeight="medium" mb="1">Modifications:</Text>
                        {(item.modifications || []).map((mod, idx) => (
                          <Text key={idx} fontSize="xs" color="gray.600">
                            • {mod.description}
                          </Text>
                        ))}
                      </Box>
                    )}

                    {/* Special Instructions */}
                    {item.special_instructions && (
                      <Text fontSize="xs" color="blue.600" fontStyle="italic">
                        Note: {item.special_instructions}
                      </Text>
                    )}

                    {/* Allergy Warnings */}
                    {(item.allergy_warnings?.length || 0) > 0 && (
                      <HStack gap="1" wrap="wrap">
                        <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                        <Text fontSize="xs" color="red.600" fontWeight="medium">
                          Allergies: {item.allergy_warnings?.join(', ') || ''}
                        </Text>
                      </HStack>
                    )}

                    {/* Action Button */}
                    {item.status !== KitchenItemStatus.SERVED && (
                      <Button
                        size="sm"
                        colorPalette={
                          item.status === KitchenItemStatus.PENDING ? 'blue' :
                            item.status === KitchenItemStatus.IN_PROGRESS ? 'green' :
                              'purple'
                        }
                        onClick={() => handleItemAction(item.item_id, item.status)}
                        variant={item.status === KitchenItemStatus.READY ? 'solid' : 'outline'}
                        aria-label={`${getActionButtonText(item.status)} ${item.product_name}`}
                      >
                        {item.status === KitchenItemStatus.PENDING && <PlayIcon className="w-3 h-3" />}
                        {item.status === KitchenItemStatus.IN_PROGRESS && <CheckCircleIcon className="w-3 h-3" />}
                        {item.status === KitchenItemStatus.READY && <CheckCircleIcon className="w-3 h-3" />}
                        {getActionButtonText(item.status)}
                      </Button>
                    )}
                  </VStack>
                </CardWrapper>
              );
            })}
        </VStack>

        {/* Order Actions */}
        <Separator />
        <HStack gap="2" justify="space-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPriorityChange(order.order_id,
              order.priority === PriorityLevel.RUSH ? PriorityLevel.NORMAL : PriorityLevel.RUSH
            )}
            colorPalette={order.priority === PriorityLevel.RUSH ? 'gray' : 'red'}
          >
            <FireIcon className="w-3 h-3" />
            {order.priority === PriorityLevel.RUSH ? 'Normal' : 'Rush'}
          </Button>

          {order.items.every(item => item.status === KitchenItemStatus.READY) && (
            <Button
              colorPalette="green"
              size="sm"
              onClick={() => onCompleteOrder(order.order_id)}
            >
              <CheckCircleIcon className="w-3 h-3" />
              Order Ready
            </Button>
          )}
        </HStack>
      </VStack>
    </CardWrapper>
  );
}
