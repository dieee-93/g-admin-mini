/**
 * Session History Table Component
 * Historial de sesiones de caja con filtros y exportación
 */

import { Box, Heading, Stack, Table, Text, Badge, Button } from '@/shared/ui';

interface SessionHistoryTableProps {
  data: SessionHistoryReport | null;
  onExportCSV?: () => void;
}

export function SessionHistoryTable({ data, onExportCSV }: SessionHistoryTableProps) {
  if (!data) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Selecciona un período y genera el reporte</Text>
      </Box>
    );
  }

  const { sessions, summary } = data;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg">Historial de Sesiones</Heading>
          <Text fontSize="sm" color="gray.600">
            {summary.totalSessions} sesiones en total
          </Text>
        </Box>
        {onExportCSV && (
          <Button size="sm" variant="outline" onClick={onExportCSV}>
            Exportar CSV
          </Button>
        )}
      </Stack>

      {/* Resumen */}
      <Stack direction="row" gap={4} mb={6} flexWrap="wrap">
        <Box flex={1} p={4} bg="blue.50" borderRadius="md" minW="200px">
          <Text fontSize="sm" color="gray.600" mb={1}>
            Ventas Totales
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="blue.800">
            {formatCurrency(summary.totalSales)}
          </Text>
        </Box>

        <Box flex={1} p={4} bg="purple.50" borderRadius="md" minW="200px">
          <Text fontSize="sm" color="gray.600" mb={1}>
            Diferencia Total
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={summary.totalVariance >= 0 ? 'green.700' : 'red.700'}
          >
            {formatCurrency(summary.totalVariance)}
          </Text>
        </Box>

        <Box flex={1} p={4} bg="orange.50" borderRadius="md" minW="200px">
          <Text fontSize="sm" color="gray.600" mb={1}>
            Diferencia Promedio
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={summary.averageVariance >= 0 ? 'green.700' : 'red.700'}
          >
            {formatCurrency(summary.averageVariance)}
          </Text>
        </Box>

        <Box flex={1} p={4} bg="red.50" borderRadius="md" minW="200px">
          <Text fontSize="sm" color="gray.600" mb={1}>
            Sesiones con Diferencia
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="red.700">
            {summary.sessionsWithDiscrepancy}
          </Text>
        </Box>
      </Stack>

      {/* Tabla de Sesiones */}
      {sessions.length === 0 ? (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">No hay sesiones en el período seleccionado</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth={1} borderColor="gray.200" borderRadius="md">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                <Table.ColumnHeader>Ubicación</Table.ColumnHeader>
                <Table.ColumnHeader>Operador</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Fondo Inicial</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Ventas</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Esperado</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Real</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Diferencia</Table.ColumnHeader>
                <Table.ColumnHeader>Estado</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}

// Fila de sesión
interface SessionRowProps {
  session: SessionHistoryRow;
}

function SessionRow({ session }: SessionRowProps) {
  const {
    opened_at,
    closed_at,
    money_location_name,
    opened_by_name,
    closed_by_name,
    starting_cash,
    cash_sales,
    expected_cash,
    actual_cash,
    variance,
    status,
  } = session;

  return (
    <Table.Row>
      {/* Fecha */}
      <Table.Cell>
        <Stack gap={0}>
          <Text fontSize="xs" fontWeight="medium">
            {new Date(opened_at).toLocaleDateString('es-AR')}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {new Date(opened_at).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {closed_at && (
            <Text fontSize="xs" color="gray.500">
              → {new Date(closed_at).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </Stack>
      </Table.Cell>

      {/* Ubicación */}
      <Table.Cell>
        <Text fontSize="sm">{money_location_name}</Text>
      </Table.Cell>

      {/* Operador */}
      <Table.Cell>
        <Stack gap={0}>
          <Text fontSize="xs">{opened_by_name}</Text>
          {closed_by_name && closed_by_name !== opened_by_name && (
            <Text fontSize="xs" color="gray.500">
              Cerrada por: {closed_by_name}
            </Text>
          )}
        </Stack>
      </Table.Cell>

      {/* Fondo Inicial */}
      <Table.Cell textAlign="right">
        <Text fontSize="sm">{formatCurrency(starting_cash)}</Text>
      </Table.Cell>

      {/* Ventas */}
      <Table.Cell textAlign="right">
        <Text fontSize="sm" fontWeight="medium" color="green.600">
          {formatCurrency(cash_sales)}
        </Text>
      </Table.Cell>

      {/* Esperado */}
      <Table.Cell textAlign="right">
        <Text fontSize="sm">
          {expected_cash !== null && expected_cash !== undefined
            ? formatCurrency(expected_cash)
            : '-'}
        </Text>
      </Table.Cell>

      {/* Real */}
      <Table.Cell textAlign="right">
        <Text fontSize="sm">
          {actual_cash !== null && actual_cash !== undefined
            ? formatCurrency(actual_cash)
            : '-'}
        </Text>
      </Table.Cell>

      {/* Diferencia */}
      <Table.Cell textAlign="right">
        {variance !== null && variance !== undefined ? (
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={
              variance === 0 ? 'gray.600' : variance > 0 ? 'green.600' : 'red.600'
            }
          >
            {variance >= 0 ? '+' : ''}
            {formatCurrency(variance)}
          </Text>
        ) : (
          <Text fontSize="sm" color="gray.400">
            -
          </Text>
        )}
      </Table.Cell>

      {/* Estado */}
      <Table.Cell>
        <SessionStatusBadge status={status} />
      </Table.Cell>
    </Table.Row>
  );
}

// Badge de estado
function SessionStatusBadge({ status }: { status: SessionHistoryRow['status'] }) {
  const config = {
    OPEN: { label: 'Abierta', color: 'blue' },
    CLOSED: { label: 'Cerrada', color: 'green' },
    AUDITED: { label: 'Auditada', color: 'purple' },
    DISCREPANCY: { label: 'Diferencia', color: 'red' },
  };

  const { label, color } = config[status] || { label: status, color: 'gray' };

  return (
    <Badge colorPalette={color} size="sm">
      {label}
    </Badge>
  );
}
