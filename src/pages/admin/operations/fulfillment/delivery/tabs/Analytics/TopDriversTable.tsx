import { useEffect, useState } from 'react';
import { Stack, Text, CardWrapper, Table, Badge, Spinner } from '@/shared/ui';
import { deliveryApi } from '@/modules/delivery/services/deliveryApi';
import type { DriverPerformance } from '@/modules/delivery/types';
import { logger } from '@/lib/logging';

interface TopDriver {
  rank: number;
  driver_id: string;
  name: string;
  totalDeliveries: number;
  rating: number;
  onTimeRate: number;
  avgTime: number;
}

export function TopDriversTable() {
  const [drivers, setDrivers] = useState<TopDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopDrivers() {
      try {
        setLoading(true);
        logger.info('TopDriversTable', 'Fetching driver performance data...');

        // Fetch all drivers from database
        const driversData: DriverPerformance[] = await deliveryApi.getDrivers();

        // Calculate rankings based on performance
        const rankedDrivers = driversData
          .filter(d => d.total_deliveries > 0) // Only drivers with deliveries
          .sort((a, b) => {
            // Sort by: on_time_rate > total_deliveries > avg_delivery_time
            if (b.on_time_rate !== a.on_time_rate) {
              return b.on_time_rate - a.on_time_rate;
            }
            if (b.total_deliveries !== a.total_deliveries) {
              return b.total_deliveries - a.total_deliveries;
            }
            return a.avg_delivery_time_minutes - b.avg_delivery_time_minutes;
          })
          .slice(0, 3) // Top 3
          .map((driver, index) => ({
            rank: index + 1,
            driver_id: driver.driver_id,
            name: driver.driver_name,
            totalDeliveries: driver.total_deliveries,
            rating: driver.customer_rating || 0,
            onTimeRate: Math.round(driver.on_time_rate * 100),
            avgTime: Math.round(driver.avg_delivery_time_minutes)
          }));

        setDrivers(rankedDrivers);
        logger.info('TopDriversTable', `Loaded ${rankedDrivers.length} top drivers`);
      } catch (error) {
        logger.error('TopDriversTable', 'Failed to fetch drivers:', error);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopDrivers();
  }, []);

  if (loading) {
    return (
      <CardWrapper>
        <Stack gap="md" align="center" py="lg">
          <Spinner size="lg" />
          <Text color="gray.600">Cargando drivers...</Text>
        </Stack>
      </CardWrapper>
    );
  }

  if (drivers.length === 0) {
    return (
      <CardWrapper>
        <Stack gap="md">
          <Text fontWeight="bold" fontSize="lg">
            🏆 Top Drivers
          </Text>
          <Text color="gray.600" textAlign="center" py="lg">
            No hay datos de drivers disponibles
          </Text>
        </Stack>
      </CardWrapper>
    );
  }

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
            {drivers.map((driver) => (
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
