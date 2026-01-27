/**
 * StockAlertIndicator - Widget for ShiftControl
 * Shows low stock alerts in shift control widget
 */

import { HStack, Text, Icon } from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StockAlertIndicatorProps {
  lowStockAlerts: number;
}

export function StockAlertIndicator({ lowStockAlerts }: StockAlertIndicatorProps) {
  if (lowStockAlerts === 0) return null;
  
  return (
    <HStack 
      gap="2" 
      padding="3" 
      borderWidth="1px" 
      borderRadius="md" 
      borderColor="orange.200" 
      bg="orange.50"
    >
      <Icon color="orange.600">
        <ExclamationTriangleIcon />
      </Icon>
      <Text fontSize="sm" fontWeight="medium" color="orange.800">
        {lowStockAlerts} alertas de stock
      </Text>
    </HStack>
  );
}
