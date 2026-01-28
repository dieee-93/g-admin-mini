/**
 * Cash Session Manager
 * Componente principal para gestionar sesiones de caja
 */

import { Box, Heading, Stack, Text, Button, Badge, Grid } from '@chakra-ui/react';
import { ClockIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/decimal';
import type { MoneyLocationWithAccount, CashSessionRow } from '@/modules/accounting/types';

interface CashSessionManagerProps {
  moneyLocations: MoneyLocationWithAccount[];
  activeSessions: CashSessionRow[];
  onOpenSession: (location: MoneyLocationWithAccount) => void;
  onCloseSession: (session: CashSessionRow) => void;
  loading?: boolean;
}

export function CashSessionManager({
  moneyLocations,
  activeSessions,
  onOpenSession,
  onCloseSession,
  loading,
}: CashSessionManagerProps) {
  // Obtener sesión activa para cada ubicación que requiere sesión
  const getSessionForLocation = (locationId: string) => {
    return activeSessions.find((s) => s.money_location_id === locationId);
  };

  const locationsWithSessions = moneyLocations.filter(
    (loc) => loc.requires_session
  );

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Sesiones de Caja
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
        {locationsWithSessions.map((location) => {
          const session = getSessionForLocation(location.id);

          return (
            <LocationCard
              key={location.id}
              location={location}
              session={session}
              onOpen={() => onOpenSession(location)}
              onClose={() => session && onCloseSession(session)}
              loading={loading}
            />
          );
        })}
      </Grid>

      {locationsWithSessions.length === 0 && (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">
            No hay ubicaciones que requieran sesiones de caja
          </Text>
        </Box>
      )}
    </Box>
  );
}

interface LocationCardProps {
  location: MoneyLocationWithAccount;
  session?: CashSessionRow;
  onOpen: () => void;
  onClose: () => void;
  loading?: boolean;
}

function LocationCard({
  location,
  session,
  onOpen,
  onClose,
  loading,
}: LocationCardProps) {
  const isOpen = session?.status === 'OPEN';

  return (
    <Box
      p={4}
      bg="white"
      borderWidth={2}
      borderColor={isOpen ? 'green.200' : 'gray.200'}
      borderRadius="md"
      _hover={{ shadow: 'md' }}
    >
      <Stack gap={3}>
        {/* Header */}
        <Stack direction="row" justify="space-between" align="start">
          <Stack gap={1}>
            <Heading size="sm">{location.name}</Heading>
            <Text fontSize="xs" color="gray.600">
              {location.code}
            </Text>
          </Stack>

          <Badge
            colorPalette={isOpen ? 'green' : 'gray'}
            variant={isOpen ? 'solid' : 'outline'}
          >
            {isOpen ? 'ABIERTA' : 'CERRADA'}
          </Badge>
        </Stack>

        {/* Session Info */}
        {isOpen && session ? (
          <Stack gap={2} pt={2} borderTopWidth={1} borderColor="gray.100">
            <Stack direction="row" align="center" gap={2} fontSize="sm">
              <ClockIcon className="w-4 h-4" />
              <Text>
                Abierta: {new Date(session.opened_at).toLocaleTimeString('es-AR')}
              </Text>
            </Stack>

            <Stack direction="row" justify="space-between" fontSize="sm">
              <Text color="gray.600">Fondo Inicial:</Text>
              <Text fontWeight="medium">
                {formatCurrency(session.starting_cash)}
              </Text>
            </Stack>

            <Stack direction="row" justify="space-between" fontSize="sm">
              <Text color="gray.600">Ventas:</Text>
              <Text fontWeight="medium" color="green.600">
                + {formatCurrency(session.cash_sales)}
              </Text>
            </Stack>

            {session.cash_drops > 0 && (
              <Stack direction="row" justify="space-between" fontSize="sm">
                <Text color="gray.600">Retiros:</Text>
                <Text fontWeight="medium" color="red.600">
                  - {formatCurrency(session.cash_drops)}
                </Text>
              </Stack>
            )}

            <Stack
              direction="row"
              justify="space-between"
              pt={2}
              borderTopWidth={1}
              borderColor="gray.100"
            >
              <Stack direction="row" align="center" gap={1}>
                <BanknotesIcon className="w-5 h-5 text-green-600" />
                <Text fontWeight="bold">En Caja:</Text>
              </Stack>
              <Text fontWeight="bold" fontSize="lg" color="green.600">
                {formatCurrency(
                  session.starting_cash +
                    session.cash_sales -
                    session.cash_refunds +
                    session.cash_in -
                    session.cash_out -
                    session.cash_drops
                )}
              </Text>
            </Stack>
          </Stack>
        ) : (
          <Stack gap={2} pt={2} borderTopWidth={1} borderColor="gray.100">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No hay sesión activa
            </Text>
            {location.default_float && (
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Fondo sugerido: {formatCurrency(location.default_float)}
              </Text>
            )}
          </Stack>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          colorPalette={isOpen ? 'red' : 'green'}
          onClick={isOpen ? onClose : onOpen}
          disabled={loading}
          w="full"
        >
          {isOpen ? (
            <>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Cerrar Caja
            </>
          ) : (
            <>
              <ClockIcon className="w-4 h-4 mr-2" />
              Abrir Caja
            </>
          )}
        </Button>
      </Stack>
    </Box>
  );
}
