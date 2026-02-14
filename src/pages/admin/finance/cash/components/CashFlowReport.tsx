/**
 * Cash Flow Report Component
 * Estado de Flujo de Efectivo - Método Directo
 * Muestra flujos por actividad: Operativo, Inversión, Financiamiento
 */

import { Box, Heading, Stack, Table, Text, Collapsible, Button } from '@/shared/ui';

interface CashFlowReportProps {
  data: CashFlowStatement | null;
}

export function CashFlowReport({ data }: CashFlowReportProps) {
  if (!data) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Selecciona un período y genera el reporte</Text>
      </Box>
    );
  }

  const { startDate, endDate, operating, investing, financing, netCashFlow, openingBalance, closingBalance } = data;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg">Cash Flow Statement</Heading>
          <Text fontSize="sm" color="gray.600">
            Estado de Flujo de Efectivo - Método Directo
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.600">
            Período: {new Date(startDate).toLocaleDateString('es-AR')} - {new Date(endDate).toLocaleDateString('es-AR')}
          </Text>
        </Box>
      </Stack>

      <Stack gap={6}>
        {/* Saldo Inicial */}
        <Box bg="gray.100" p={3} borderRadius="md">
          <Stack direction="row" justify="space-between">
            <Text fontWeight="bold">Saldo Inicial de Efectivo</Text>
            <Text fontWeight="bold" fontSize="lg">
              {formatCurrency(openingBalance)}
            </Text>
          </Stack>
        </Box>

        {/* Actividades Operativas */}
        <ActivitySection
          title="Actividades Operativas"
          description="Flujos de efectivo de operaciones principales del negocio"
          activity={operating}
          color="blue"
        />

        {/* Actividades de Inversión */}
        <ActivitySection
          title="Actividades de Inversión"
          description="Flujos de efectivo de compra/venta de activos"
          activity={investing}
          color="purple"
        />

        {/* Actividades de Financiamiento */}
        <ActivitySection
          title="Actividades de Financiamiento"
          description="Flujos de efectivo de préstamos y aportes de capital"
          activity={financing}
          color="orange"
        />

        {/* Flujo Neto */}
        <Box
          bg={netCashFlow >= 0 ? 'green.50' : 'red.50'}
          p={4}
          borderRadius="md"
          borderWidth={2}
          borderColor={netCashFlow >= 0 ? 'green.300' : 'red.300'}
        >
          <Stack direction="row" justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                Flujo Neto de Efectivo
              </Text>
              <Text fontSize="sm" color="gray.600">
                Suma de todas las actividades
              </Text>
            </Box>
            <Text
              fontWeight="bold"
              fontSize="2xl"
              color={netCashFlow >= 0 ? 'green.700' : 'red.700'}
            >
              {formatCurrency(netCashFlow)}
            </Text>
          </Stack>
        </Box>

        {/* Saldo Final */}
        <Box bg="gray.100" p={4} borderRadius="md" borderWidth={2} borderColor="gray.300">
          <Stack gap={2}>
            <Stack direction="row" justify="space-between">
              <Text>Saldo Inicial</Text>
              <Text>{formatCurrency(openingBalance)}</Text>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text>Flujo Neto del Período</Text>
              <Text color={netCashFlow >= 0 ? 'green.600' : 'red.600'}>
                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </Text>
            </Stack>
            <Box height="1px" bg="gray.400" />
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" fontSize="lg">
                Saldo Final de Efectivo
              </Text>
              <Text fontWeight="bold" fontSize="xl">
                {formatCurrency(closingBalance)}
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// Componente auxiliar para cada actividad
interface ActivitySectionProps {
  title: string;
  description: string;
  activity: CashFlowActivity;
  color: 'blue' | 'purple' | 'orange';
}

function ActivitySection({ title, description, activity, color }: ActivitySectionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { inflows, outflows, net, transactions } = activity;

  return (
    <Box>
      <Box bg={`${color}.50`} p={4} borderRadius="md" borderWidth={1} borderColor={`${color}.200`}>
        <Stack gap={3}>
          <Box>
            <Heading size="md" color={`${color}.700`}>
              {title}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {description}
            </Text>
          </Box>

          <Stack gap={2}>
            <Stack direction="row" justify="space-between">
              <Text fontSize="sm">Entradas de efectivo</Text>
              <Text fontSize="sm" fontWeight="medium" color="green.600">
                +{formatCurrency(inflows)}
              </Text>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text fontSize="sm">Salidas de efectivo</Text>
              <Text fontSize="sm" fontWeight="medium" color="red.600">
                -{formatCurrency(outflows)}
              </Text>
            </Stack>
            <Box height="1px" bg={`${color}.200`} />
            <Stack direction="row" justify="space-between" align="center">
              <Text fontWeight="bold">Flujo Neto</Text>
              <Text
                fontWeight="bold"
                fontSize="lg"
                color={net >= 0 ? 'green.700' : 'red.700'}
              >
                {net >= 0 ? '+' : ''}{formatCurrency(net)}
              </Text>
            </Stack>
          </Stack>

          {/* Botón para mostrar detalles */}
          {transactions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Ver'} detalles ({transactions.length} transacciones)
            </Button>
          )}
        </Stack>
      </Box>

      {/* Detalles de transacciones */}
      {showDetails && transactions.length > 0 && (
        <Box mt={2} p={3} bg="white" borderWidth={1} borderColor="gray.200" borderRadius="md">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                <Table.ColumnHeader>Descripción</Table.ColumnHeader>
                <Table.ColumnHeader>Nº Asiento</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Monto</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {transactions.map((transaction, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Text fontSize="xs">
                      {new Date(transaction.date).toLocaleDateString('es-AR')}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="xs">{transaction.description}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600">
                      {transaction.entry_number || '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color={transaction.amount < 0 ? 'green.600' : 'red.600'}
                    >
                      {transaction.amount < 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
