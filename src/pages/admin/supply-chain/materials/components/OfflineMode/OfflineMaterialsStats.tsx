// OfflineMaterialsStats.tsx - Statistics grid component
import { useMemo } from 'react';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import {
  SimpleGrid,
  Text
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { type InventoryItem } from '../types';

interface OfflineMaterialsStatsProps {
  items: InventoryItem[];
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalItems: number;
}

export function OfflineMaterialsStats({ items }: OfflineMaterialsStatsProps) {
  const getStockSeverity = (item: unknown) => {
    const status = StockCalculation.getStockStatus(item);
    if (status === 'out' || status === 'critical') return 'critical';
    if (status === 'low') return 'warning';
    return 'ok';
  };

  const inventoryStats: InventoryStats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => 
      sum + StockCalculation.getTotalValue(item), 0
    );
    
    return {
      totalItems,
      totalValue,
      lowStockItems: items.filter(item => getStockSeverity(item) === 'warning').length,
      criticalItems: items.filter(item => getStockSeverity(item) === 'critical').length
    };
  }, [items]);

  const lowStockItems = useMemo(() => 
    items.filter(item => getStockSeverity(item) === 'warning'),
    [items]
  );
  
  const criticalItems = useMemo(() => 
    items.filter(item => getStockSeverity(item) === 'critical'),
    [items]
  );

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
      <CardWrapper variant="subtle" bg="blue.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            {inventoryStats.totalItems}
          </Text>
          <Text fontSize="sm" color="gray.600">Items Total</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" >
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            ${inventoryStats.totalValue?.toLocaleString() || '0'}
          </Text>
          <Text fontSize="sm" color="gray.600">Valor Total</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg={lowStockItems.length > 0 ? "yellow.50" : "gray.50"}>
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={lowStockItems.length > 0 ? "yellow.600" : "gray.600"}>
            {lowStockItems.length}
          </Text>
          <Text fontSize="sm" color="gray.600">Stock Bajo</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg={criticalItems.length > 0 ? "red.50" : "gray.50"}>
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={criticalItems.length > 0 ? "red.600" : "gray.600"}>
            {criticalItems.length}
          </Text>
          <Text fontSize="sm" color="gray.600">Críticos</Text>
        </CardWrapper.Body>
      </CardWrapper>
    </SimpleGrid>
  );
}

export default OfflineMaterialsStats;