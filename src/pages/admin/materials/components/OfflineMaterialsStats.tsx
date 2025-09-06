// OfflineMaterialsStats.tsx - Statistics grid component
import { useMemo } from 'react';
import {
  SimpleGrid,
  CardWrapper ,
  Text
} from '@chakra-ui/react';
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
  const getStockStatus = (stock: number, type: string) => {
    if (stock <= 0) return { severity: 'critical' };
    
    const threshold = type === 'ELABORATED' ? 5 : type === 'MEASURABLE' ? 3 : 20;
    const criticalThreshold = threshold / 2;
    
    if (stock <= criticalThreshold) return { severity: 'critical' };
    if (stock <= threshold) return { severity: 'warning' };
    return { severity: 'ok' };
  };

  const inventoryStats: InventoryStats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => 
      sum + (item.stock * (item.unit_cost || 0)), 0
    );
    
    return {
      totalItems,
      totalValue,
      lowStockItems: items.filter(item => getStockStatus(item.stock, item.type).severity === 'warning').length,
      criticalItems: items.filter(item => getStockStatus(item.stock, item.type).severity === 'critical').length
    };
  }, [items]);

  const lowStockItems = useMemo(() => 
    items.filter(item => getStockStatus(item.stock, item.type).severity === 'warning'),
    [items]
  );
  
  const criticalItems = useMemo(() => 
    items.filter(item => getStockStatus(item.stock, item.type).severity === 'critical'),
    [items]
  );

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
      <CardWrapper .Root variant="subtle" bg="blue.50">
        <CardWrapper .Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            {inventoryStats.totalItems}
          </Text>
          <Text fontSize="sm" color="gray.600">Items Total</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" >
        <CardWrapper .Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            ${inventoryStats.totalValue?.toLocaleString() || '0'}
          </Text>
          <Text fontSize="sm" color="gray.600">Valor Total</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" bg={lowStockItems.length > 0 ? "yellow.50" : "gray.50"}>
        <CardWrapper .Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={lowStockItems.length > 0 ? "yellow.600" : "gray.600"}>
            {lowStockItems.length}
          </Text>
          <Text fontSize="sm" color="gray.600">Stock Bajo</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" bg={criticalItems.length > 0 ? "red.50" : "gray.50"}>
        <CardWrapper .Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={criticalItems.length > 0 ? "red.600" : "gray.600"}>
            {criticalItems.length}
          </Text>
          <Text fontSize="sm" color="gray.600">Críticos</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </SimpleGrid>
  );
}

export default OfflineMaterialsStats;