/**
 * Profit & Loss Report Component
 * Estado de Resultados
 * Muestra Ingresos - Gastos = Resultado Neto
 */

import { Box, Heading, Stack, Table, Text } from '@chakra-ui/react';
import { formatCurrency } from '@/lib/decimal';
import type { ProfitAndLoss } from '@/modules/accounting/types/reports';

interface ProfitAndLossReportProps {
  data: ProfitAndLoss | null;
}

export function ProfitAndLossReport({ data }: ProfitAndLossReportProps) {
  if (!data) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Selecciona un período y genera el reporte</Text>
      </Box>
    );
  }

  const { startDate, endDate, revenue, expenses, grossProfit, operatingIncome, netIncome, grossMargin, netMargin } = data;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg">Profit & Loss Statement</Heading>
          <Text fontSize="sm" color="gray.600">
            Estado de Resultados
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.600">
            Período: {new Date(startDate).toLocaleDateString('es-AR')} - {new Date(endDate).toLocaleDateString('es-AR')}
          </Text>
        </Box>
      </Stack>

      <Stack gap={6}>
        {/* INGRESOS */}
        <Box>
          <Heading size="md" mb={3} color="teal.700">
            INGRESOS
          </Heading>

          {revenue.accounts.length > 0 ? (
            <Box mb={4}>
              <Table.Root size="sm">
                <Table.Body>
                  {revenue.accounts.map((account) => (
                    <Table.Row key={account.account_id}>
                      <Table.Cell>
                        <Text fontSize="sm">{account.account_code}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{account.account_name}</Text>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(Math.abs(account.balance))}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Text fontSize="sm" color="gray.500" mb={4}>
              No hay ingresos registrados en este período
            </Text>
          )}

          {/* Total Ingresos */}
          <Box bg="teal.50" p={3} borderRadius="md">
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" color="teal.800">
                TOTAL INGRESOS
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="teal.800">
                {formatCurrency(revenue.total)}
              </Text>
            </Stack>
          </Box>
        </Box>

        {/* COSTO DE VENTAS */}
        {expenses.cogs > 0 && (
          <Box>
            <Stack direction="row" justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">Costo de Ventas (COGS)</Text>
              <Text fontWeight="bold" color="red.600">
                -{formatCurrency(expenses.cogs)}
              </Text>
            </Stack>
          </Box>
        )}

        {/* UTILIDAD BRUTA */}
        <Box bg="green.50" p={4} borderRadius="md" borderWidth={1} borderColor="green.200">
          <Stack direction="row" justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="green.800">
                UTILIDAD BRUTA
              </Text>
              <Text fontSize="sm" color="gray.600">
                Margen: {grossMargin.toFixed(2)}%
              </Text>
            </Box>
            <Text fontWeight="bold" fontSize="xl" color="green.800">
              {formatCurrency(grossProfit)}
            </Text>
          </Stack>
        </Box>

        {/* GASTOS OPERATIVOS */}
        <Box>
          <Heading size="md" mb={3} color="orange.700">
            GASTOS OPERATIVOS
          </Heading>

          <Stack gap={2}>
            {expenses.payroll > 0 && (
              <Stack direction="row" justify="space-between" p={2}>
                <Text fontSize="sm">Gastos de Personal</Text>
                <Text fontSize="sm" fontWeight="medium" color="red.600">
                  -{formatCurrency(expenses.payroll)}
                </Text>
              </Stack>
            )}

            {expenses.operating > 0 && (
              <Stack direction="row" justify="space-between" p={2}>
                <Text fontSize="sm">Gastos Operativos</Text>
                <Text fontSize="sm" fontWeight="medium" color="red.600">
                  -{formatCurrency(expenses.operating)}
                </Text>
              </Stack>
            )}

            {expenses.other > 0 && (
              <Stack direction="row" justify="space-between" p={2}>
                <Text fontSize="sm">Otros Gastos</Text>
                <Text fontSize="sm" fontWeight="medium" color="red.600">
                  -{formatCurrency(expenses.other)}
                </Text>
              </Stack>
            )}
          </Stack>

          {/* Detalle de Gastos */}
          {expenses.breakdown.length > 0 && (
            <Box mt={4} p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
                Detalle por Cuenta
              </Text>
              <Table.Root size="sm">
                <Table.Body>
                  {expenses.breakdown.map((account) => (
                    <Table.Row key={account.account_id}>
                      <Table.Cell>
                        <Text fontSize="xs">{account.account_code}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="xs">{account.account_name}</Text>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Text fontSize="xs" fontWeight="medium" color="red.600">
                          -{formatCurrency(Math.abs(account.balance))}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

          {/* Total Gastos */}
          <Box bg="orange.50" p={3} borderRadius="md" mt={4}>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" color="orange.800">
                TOTAL GASTOS
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="orange.800">
                -{formatCurrency(expenses.total)}
              </Text>
            </Stack>
          </Box>
        </Box>

        {/* RESULTADO OPERATIVO */}
        <Box bg="blue.50" p={4} borderRadius="md" borderWidth={1} borderColor="blue.200">
          <Stack direction="row" justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="blue.800">
                RESULTADO OPERATIVO
              </Text>
              <Text fontSize="sm" color="gray.600">
                Utilidad Bruta - Gastos Operativos
              </Text>
            </Box>
            <Text
              fontWeight="bold"
              fontSize="xl"
              color={operatingIncome >= 0 ? 'blue.800' : 'red.700'}
            >
              {formatCurrency(operatingIncome)}
            </Text>
          </Stack>
        </Box>

        {/* RESULTADO NETO */}
        <Box
          bg={netIncome >= 0 ? 'green.100' : 'red.100'}
          p={5}
          borderRadius="md"
          borderWidth={3}
          borderColor={netIncome >= 0 ? 'green.400' : 'red.400'}
        >
          <Stack gap={3}>
            <Stack direction="row" justify="space-between" align="center">
              <Box>
                <Heading size="lg" color={netIncome >= 0 ? 'green.800' : 'red.800'}>
                  RESULTADO NETO
                </Heading>
                <Text fontSize="sm" color="gray.700">
                  Ingresos Totales - Gastos Totales
                </Text>
              </Box>
              <Text
                fontWeight="bold"
                fontSize="3xl"
                color={netIncome >= 0 ? 'green.800' : 'red.800'}
              >
                {formatCurrency(netIncome)}
              </Text>
            </Stack>

            <Box height="1px" bg={netIncome >= 0 ? 'green.300' : 'red.300'} />

            <Stack direction="row" justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                Margen Neto:
              </Text>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={netIncome >= 0 ? 'green.700' : 'red.700'}
              >
                {netMargin.toFixed(2)}%
              </Text>
            </Stack>

            {netIncome >= 0 ? (
              <Text fontSize="sm" color="green.700" fontWeight="medium">
                ✓ Resultado positivo - El negocio es rentable en este período
              </Text>
            ) : (
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                ⚠️ Resultado negativo - Revisar estructura de costos y gastos
              </Text>
            )}
          </Stack>
        </Box>

        {/* RESUMEN DE MÁRGENES */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <Heading size="sm" mb={3}>
            Indicadores de Rentabilidad
          </Heading>
          <Stack gap={2}>
            <Stack direction="row" justify="space-between">
              <Text fontSize="sm">Margen Bruto</Text>
              <Text fontSize="sm" fontWeight="bold" color={grossMargin >= 0 ? 'green.600' : 'red.600'}>
                {grossMargin.toFixed(2)}%
              </Text>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text fontSize="sm">Margen Neto</Text>
              <Text fontSize="sm" fontWeight="bold" color={netMargin >= 0 ? 'green.600' : 'red.600'}>
                {netMargin.toFixed(2)}%
              </Text>
            </Stack>
            <Box height="1px" bg="gray.300" />
            <Stack direction="row" justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                Ratio Gastos/Ingresos
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                {revenue.total > 0 ? ((expenses.total / revenue.total) * 100).toFixed(2) : 0}%
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
