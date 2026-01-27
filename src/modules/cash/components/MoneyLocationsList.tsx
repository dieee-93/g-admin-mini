/**
 * Money Locations List Component
 * Lista de Ubicaciones de Dinero
 */

import { Box, Heading, Spinner, Stack, Text, Badge } from '@chakra-ui/react';
import { useEffect, memo } from 'react';
import { useCashData } from '@/pages/admin/finance/cash/hooks/useCashData';
import { useCashActions } from '@/pages/admin/finance/cash/hooks/useCashActions';
import type { MoneyLocationWithAccount } from '../types';

export function MoneyLocationsList() {
  const { moneyLocations, loading, error } = useCashData();
  // const { refreshLocations } = useCashActions();

  // TODO: Fix refreshLocations action
  // useEffect(() => {
  //   refreshLocations();
  // }, [refreshLocations]);

  /*const { data: locations, isLoading, error } = useQuery({
    
    
  });*/

  if (loading) {
    return (
      <Stack align="center" py={8}>
        <Spinner size="lg" />
        <Text>Cargando ubicaciones...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.700">Error al cargar ubicaciones</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Ubicaciones de Dinero
      </Heading>

      <Stack gap={3}>
        {moneyLocations?.map((location) => (
          <MoneyLocationCard key={location.id} location={location} />
        ))}
      </Stack>

      {moneyLocations?.length === 0 && (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">No hay ubicaciones configuradas</Text>
        </Box>
      )}
    </Box>
  );
}

interface MoneyLocationCardProps {
  location: MoneyLocationWithAccount;
}

// ✅ PERFORMANCE: Memoized to prevent unnecessary re-renders
const MoneyLocationCard = memo(function MoneyLocationCard({ location }: MoneyLocationCardProps) {
  const {
    name,
    code,
    location_type,
    requires_session,
    current_balance,
    account_code,
    account_name,
    default_float,
    max_cash_limit,
  } = location;

  return (
    <Box
      p={4}
      bg="white"
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      _hover={{ borderColor: 'gray.300', shadow: 'sm' }}
    >
      <Stack gap={3}>
        {/* Header */}
        <Stack direction="row" justify="space-between" align="center">
          <Stack gap={1}>
            <Stack direction="row" align="center" gap={2}>
              <Heading size="md">{name}</Heading>
              <Badge colorPalette={getLocationTypeColor(location_type)}>
                {getLocationTypeLabel(location_type)}
              </Badge>
            </Stack>
            <Text fontSize="sm" color="gray.600">
              {code}
            </Text>
          </Stack>

          <Stack align="end" gap={1}>
            <Text fontSize="2xl" fontWeight="bold">
              ${formatCurrency(current_balance)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Saldo actual
            </Text>
          </Stack>
        </Stack>

        {/* Details */}
        <Stack
          direction="row"
          gap={4}
          pt={2}
          borderTopWidth={1}
          borderColor="gray.100"
        >
          <Stack gap={0}>
            <Text fontSize="xs" color="gray.500">
              Cuenta Contable
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              {account_code} - {account_name}
            </Text>
          </Stack>

          {requires_session && (
            <Stack gap={0}>
              <Text fontSize="xs" color="gray.500">
                Fondo Inicial
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                ${formatCurrency(default_float || 0)}
              </Text>
            </Stack>
          )}

          {max_cash_limit && (
            <Stack gap={0}>
              <Text fontSize="xs" color="gray.500">
                Límite Máximo
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                ${formatCurrency(max_cash_limit)}
              </Text>
            </Stack>
          )}

          {requires_session && (
            <Badge colorPalette="blue" alignSelf="center">
              Requiere Sesión
            </Badge>
          )}
        </Stack>
      </Stack>
    </Box>
  );
});

MoneyLocationCard.displayName = 'MoneyLocationCard';

function getLocationTypeColor(type: string): string {
  switch (type) {
    case 'CASH_DRAWER':
      return 'green';
    case 'SAFE':
      return 'orange';
    case 'BANK_ACCOUNT':
      return 'blue';
    case 'DIGITAL_WALLET':
      return 'purple';
    case 'PETTY_CASH':
      return 'gray';
    default:
      return 'gray';
  }
}

function getLocationTypeLabel(type: string): string {
  switch (type) {
    case 'CASH_DRAWER':
      return 'Caja Registradora';
    case 'SAFE':
      return 'Caja Fuerte';
    case 'BANK_ACCOUNT':
      return 'Cuenta Bancaria';
    case 'DIGITAL_WALLET':
      return 'Billetera Digital';
    case 'PETTY_CASH':
      return 'Caja Chica';
    default:
      return type;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
