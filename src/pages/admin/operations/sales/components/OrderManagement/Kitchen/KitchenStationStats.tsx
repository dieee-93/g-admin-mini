import { Grid, VStack, Text, Badge } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';

export interface StationStats {
  station: string;
  activeOrders: number;
  pendingItems: number;
  averagePrepTime: number;
  backlogMinutes: number;
}

interface KitchenStationStatsProps {
  stats: StationStats[];
}

export function KitchenStationStats({ stats }: KitchenStationStatsProps) {
  return (
    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap="3">
      {stats.map((stat) => (
        <CardWrapper key={stat.station} p="3" size="sm">
          <VStack gap="2" align="center">
            <Text fontWeight="bold" fontSize="sm" textTransform="capitalize">
              {stat.station}
            </Text>
            <VStack gap="1" align="center">
              <Text fontSize="xs" color="gray.600">Pending Items</Text>
              <Badge
                colorPalette={stat.pendingItems > 5 ? 'red' : stat.pendingItems > 2 ? 'yellow' : 'green'}
                size="sm"
              >
                {stat.pendingItems}
              </Badge>
            </VStack>
          </VStack>
        </CardWrapper>
      ))}
    </Grid>
  );
}
