import {
  HStack,
  VStack,
  Text,
  Select,
  Button,
  createListCollection
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { KITCHEN_STATIONS } from '../../../types';

interface KitchenHeaderProps {
  activeOrdersCount: number;
  pendingItemsCount: number;
  showAllStations: boolean;
  selectedStation: string;
  onSelectStation: (station: string) => void;
  sortBy: string;
  onSortChange: (sort: 'priority' | 'time' | 'table') => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

export function KitchenHeader({
  activeOrdersCount,
  pendingItemsCount,
  showAllStations,
  selectedStation,
  onSelectStation,
  sortBy,
  onSortChange,
  showCompleted,
  onToggleCompleted
}: KitchenHeaderProps) {
  // Station collection
  const stationCollection = createListCollection({
    items: [
      { value: 'all', label: 'All Stations' },
      ...KITCHEN_STATIONS.map(station => ({
        value: station,
        label: station.charAt(0).toUpperCase() + station.slice(1)
      }))
    ]
  });

  // Sort options
  const sortCollection = createListCollection({
    items: [
      { value: 'priority', label: 'Priority' },
      { value: 'time', label: 'Order Time' },
      { value: 'table', label: 'Table Number' }
    ]
  });

  return (
    <CardWrapper p="4">
      <HStack justify="space-between" align="center" wrap="wrap" gap="4">
        <VStack align="start" gap="1">
          <Text fontSize="xl" fontWeight="bold">Kitchen Display System</Text>
          <Text color="gray.600" fontSize="sm">
            {activeOrdersCount} active orders • {pendingItemsCount} pending items
          </Text>
        </VStack>

        <HStack gap="3" wrap="wrap">
          {showAllStations && (
            <Select.Root
              collection={stationCollection}
              value={[selectedStation]}
              onValueChange={(details) => onSelectStation(details.value[0])}
              size="sm"
              width="150px"
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Station" />
              </Select.Trigger>
              <Select.Content>
                {stationCollection.items.map((station) => (
                  <Select.Item key={station.value} item={station}>
                    {station.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}

          <Select.Root
            collection={sortCollection}
            value={[sortBy]}
            onValueChange={(details) => onSortChange(details.value[0] as any)}
            size="sm"
            width="120px"
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Sort by" />
            </Select.Trigger>
            <Select.Content>
              {sortCollection.items.map((sort) => (
                <Select.Item key={sort.value} item={sort}>
                  {sort.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button
            variant={showCompleted ? "solid" : "outline"}
            size="sm"
            onClick={onToggleCompleted}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
        </HStack>
      </HStack>
    </CardWrapper>
  );
}
