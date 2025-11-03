import { Table, VStack, Text, HStack, Badge, IconButton } from '@chakra-ui/react';
import { CardWrapper, Icon } from '@/shared/ui';
import type { CompetitorData } from '../types';
import { EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface CompetitorsTableProps {
  competitors: CompetitorData[];
}

export function CompetitorsTable({ competitors }: CompetitorsTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'red';
      case 'indirect': return 'yellow';
      case 'substitute': return 'blue';
      default: return 'gray';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'leader': return 'green';
      case 'challenger': return 'blue';
      case 'follower': return 'yellow';
      case 'niche': return 'purple';
      default: return 'gray';
    }
  };

  if (competitors.length === 0) {
    return (
      <CardWrapper>
        <CardWrapper.Body p="8" textAlign="center">
          <VStack gap="2">
            <Icon icon={UserGroupIcon} size="2xl" color="var(--chakra-colors-gray-400)" />
            <Text color="gray.500">No se encontraron competidores</Text>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">
          Análisis de Competidores - {competitors.length} encontrados
        </Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Competidor</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader>Posición</Table.ColumnHeader>
              <Table.ColumnHeader>Rating</Table.ColumnHeader>
              <Table.ColumnHeader>Ticket Promedio</Table.ColumnHeader>
              <Table.ColumnHeader>Distancia</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {competitors.slice(0, 10).map((competitor) => (
              <Table.Row key={competitor.id}>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{competitor.name}</Text>
                    <Text fontSize="xs" color="gray.600">{competitor.category}</Text>
                    <Text fontSize="xs" color="gray.500">{competitor.location.zone}</Text>
                  </VStack>
                </Table.Cell>

                <Table.Cell>
                  <Badge colorPalette={getTypeColor(competitor.type)} size="sm">
                    {competitor.type === 'direct' ? 'Directo' :
                     competitor.type === 'indirect' ? 'Indirecto' : 'Sustituto'}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge colorPalette={getPositionColor(competitor.performance.marketPosition)} size="sm">
                    {competitor.performance.marketPosition === 'leader' ? 'Líder' :
                     competitor.performance.marketPosition === 'challenger' ? 'Retador' :
                     competitor.performance.marketPosition === 'follower' ? 'Seguidor' : 'Nicho'}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{competitor.performance.customerRating.toFixed(1)}⭐</Text>
                    <Text fontSize="xs" color="gray.600">
                      {competitor.performance.reviewCount} reviews
                    </Text>
                  </VStack>
                </Table.Cell>

                <Table.Cell>
                  <Text fontWeight="medium">
                    ${competitor.businessMetrics.averageTicket.toFixed(2)}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text fontSize="sm">{competitor.location.distance.toFixed(1)} km</Text>
                </Table.Cell>

                <Table.Cell>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Ver detalles"
                  >
                    <Icon icon={EyeIcon} size="xs" />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {competitors.length > 10 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 10 de {competitors.length} competidores. Use filtros para refinar la búsqueda.
          </Text>
        )}
      </CardWrapper.Body>
    </CardWrapper>
  );
}
