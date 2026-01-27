import {
  KitchenItemStatus,
  PriorityLevel,
  type KitchenOrder
} from '../../../types';

// Get priority color
export const getPriorityColor = (priority: PriorityLevel) => {
  switch (priority) {
    case PriorityLevel.VIP: return 'purple';
    case PriorityLevel.RUSH: return 'red';
    case PriorityLevel.NORMAL: return 'blue';
    default: return 'gray';
  }
};

// Get item status color
export const getItemStatusColor = (status: KitchenItemStatus) => {
  switch (status) {
    case KitchenItemStatus.PENDING: return 'gray';
    case KitchenItemStatus.IN_PROGRESS: return 'yellow';
    case KitchenItemStatus.READY: return 'green';
    case KitchenItemStatus.SERVED: return 'blue';
    default: return 'gray';
  }
};

// Calculate order timing
export const getOrderTiming = (order: KitchenOrder) => {
  const orderTime = new Date(order.order_time);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

  const estimatedTime = new Date(order.estimated_ready_time);
  const remainingMinutes = Math.floor((estimatedTime.getTime() - now.getTime()) / (1000 * 60));

  return {
    elapsedMinutes,
    remainingMinutes,
    isOverdue: remainingMinutes < 0,
    progressPercentage: Math.min(100, (elapsedMinutes / (elapsedMinutes + Math.max(0, remainingMinutes))) * 100)
  };
};

// Get action button text
export const getActionButtonText = (status: KitchenItemStatus) => {
  switch (status) {
    case KitchenItemStatus.PENDING: return 'Start';
    case KitchenItemStatus.IN_PROGRESS: return 'Ready';
    case KitchenItemStatus.READY: return 'Served';
    default: return '';
  }
};

// Get next status logic
export const getNextItemStatus = (currentStatus: KitchenItemStatus): KitchenItemStatus | null => {
  switch (currentStatus) {
    case KitchenItemStatus.PENDING:
      return KitchenItemStatus.IN_PROGRESS;
    case KitchenItemStatus.IN_PROGRESS:
      return KitchenItemStatus.READY;
    case KitchenItemStatus.READY:
      return KitchenItemStatus.SERVED;
    default:
      return null;
  }
};
