import { Stack, Text, CardWrapper, Table, Badge } from '@/shared/ui';

// Mock data for now - TODO: Fetch from deliveryApi
const mockDrivers = [
  {
    rank: 1,
    name: 'Miguel Santos',
    totalDeliveries: 15,
    rating: 4.8,
    onTimeRate: 96,
    avgTime: 28
  },
  {
    rank: 2,
    name: 'Lucía Fernández',
    totalDeliveries: 12,
    rating: 4.9,
    onTimeRate: 98,
    avgTime: 25
  },
  {
    rank: 3,
    name: 'Diego Ramírez',
    totalDeliveries: 10,
    rating: 4.7,
    onTimeRate: 92,
    avgTime: 32
  }
];

export function TopDriversTable() {
  return (
    <CardWrapper>
      <Stack gap="md">
        <Text fontWeight="bold" fontSize="lg">
          🏆 Top Drivers
        </Text>
        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>Nombre</Table.ColumnHeader>
              <Table.ColumnHeader>Deliveries</Table.ColumnHeader>
              <Table.ColumnHeader>Rating</Table.ColumnHeader>
              <Table.ColumnHeader>On-Time</Table.ColumnHeader>
              <Table.ColumnHeader>Tiempo Prom.</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {mockDrivers.map((driver) => (
              <Table.Row key={driver.rank}>
                <Table.Cell>
                  <Badge
                    colorPalette={driver.rank === 1 ? 'yellow' : driver.rank === 2 ? 'gray' : 'orange'}
                  >
                    #{driver.rank}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{driver.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text textAlign="center">{driver.totalDeliveries}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text textAlign="center">⭐ {driver.rating.toFixed(1)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={driver.onTimeRate >= 95 ? 'green' : 'yellow'}>
                    {driver.onTimeRate}%
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text textAlign="center">{driver.avgTime} min</Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Text fontSize="sm" color="gray.600">
          💡 Los datos de los drivers se actualizan en tiempo real
        </Text>
      </Stack>
    </CardWrapper>
  );
}
