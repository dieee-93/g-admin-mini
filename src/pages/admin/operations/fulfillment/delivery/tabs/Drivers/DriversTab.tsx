import { useState } from 'react';
import { Stack, Button, SimpleGrid, Text, Box } from '@/shared/ui';
import { Input } from '@chakra-ui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import type { DriverPerformance } from '@/modules/fulfillment/delivery/types';
import { DriverCard } from './DriverCard';
import { LoadingSkeleton } from './LoadingSkeleton';

interface DriversTabProps {
  drivers: DriverPerformance[];
  loading: boolean;
}

export default function DriversTab({ drivers, loading }: DriversTabProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'busy'>('all');

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.driver_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'available'
          ? d.is_available && !d.current_delivery_id
          : filter === 'busy'
            ? !!d.current_delivery_id
            : true;
    return matchesSearch && matchesFilter;
  });

  const availableCount = drivers.filter((d) => d.is_available && !d.current_delivery_id).length;
  const busyCount = drivers.filter((d) => !!d.current_delivery_id).length;

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <LoadingSkeleton />
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      {/* Search & Filters */}
      <Stack direction={{ base: 'column', md: 'row' }} gap="sm">
        <Input
          placeholder="Buscar driver por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          flex={1}
        />
        <Stack direction="row" gap="sm">
          <Button
            variant={filter === 'all' ? 'solid' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todos ({drivers.length})
          </Button>
          <Button
            variant={filter === 'available' ? 'solid' : 'outline'}
            onClick={() => setFilter('available')}
            size="sm"
            colorPalette="green"
          >
            Disponibles ({availableCount})
          </Button>
          <Button
            variant={filter === 'busy' ? 'solid' : 'outline'}
            onClick={() => setFilter('busy')}
            size="sm"
            colorPalette="red"
          >
            Ocupados ({busyCount})
          </Button>
        </Stack>
      </Stack>

      {/* Driver Grid */}
      {filteredDrivers.length === 0 ? (
        <Box textAlign="center" py="lg">
          <Stack gap="md" align="center">
            <UserIcon style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
            <Text fontWeight="bold" fontSize="lg">
              {search ? 'No se encontraron drivers' : 'No hay drivers registrados'}
            </Text>
            <Text color="gray.600">
              {search
                ? 'Intenta con otro término de búsqueda'
                : 'Agrega tu primer driver para comenzar'}
            </Text>
          </Stack>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
          {filteredDrivers.map((driver) => (
            <DriverCard key={driver.driver_id} driver={driver} />
          ))}
        </SimpleGrid>
      )}

      {/* Add Driver Button */}
      <Button
        variant="outline"
        onClick={() => alert('TODO: Formulario de agregar driver')}
        width="fit-content"
      >
        + Agregar Nuevo Driver
      </Button>
    </Stack>
  );
}
