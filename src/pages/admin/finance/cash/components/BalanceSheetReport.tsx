/**
 * Balance Sheet Report Component
 * Estado de Situación Patrimonial
 * Muestra Assets = Liabilities + Equity
 */

import { Box, Heading, Stack, Table, Text } from '@chakra-ui/react';
import { formatCurrency } from '@/lib/decimal';
import type { BalanceSheet } from '@/modules/cash/types/reports';

interface BalanceSheetReportProps {
  data: BalanceSheet | null;
}

export function BalanceSheetReport({ data }: BalanceSheetReportProps) {
  if (!data) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Selecciona una fecha y genera el reporte</Text>
      </Box>
    );
  }

  const { asOfDate, assets, liabilities, equity, totalAssets, totalLiabilitiesAndEquity, balanced, variance } = data;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg">Balance Sheet</Heading>
          <Text fontSize="sm" color="gray.600">
            Estado de Situación Patrimonial
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.600">
            Al: {new Date(asOfDate).toLocaleDateString('es-AR')}
          </Text>
          {!balanced && (
            <Text fontSize="sm" color="red.600" fontWeight="bold">
              ⚠️ No balancea (Dif: {formatCurrency(variance)})
            </Text>
          )}
          {balanced && (
            <Text fontSize="sm" color="green.600" fontWeight="bold">
              ✓ Balanceado
            </Text>
          )}
        </Box>
      </Stack>

      <Stack gap={6}>
        {/* ACTIVOS */}
        <Box>
          <Heading size="md" mb={3} color="green.700">
            ACTIVOS
          </Heading>

          {/* Activos Corrientes */}
          {assets.current.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
                Activos Corrientes
              </Text>
              <Table.Root size="sm">
                <Table.Body>
                  {assets.current.map((account) => (
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
          )}

          {/* Activos No Corrientes */}
          {assets.nonCurrent.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
                Activos No Corrientes
              </Text>
              <Table.Root size="sm">
                <Table.Body>
                  {assets.nonCurrent.map((account) => (
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
          )}

          {/* Total Activos */}
          <Box bg="green.50" p={3} borderRadius="md">
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" color="green.800">
                TOTAL ACTIVOS
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="green.800">
                {formatCurrency(Math.abs(totalAssets))}
              </Text>
            </Stack>
          </Box>
        </Box>

        {/* PASIVOS */}
        <Box>
          <Heading size="md" mb={3} color="red.700">
            PASIVOS
          </Heading>

          {/* Pasivos Corrientes */}
          {liabilities.current.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
                Pasivos Corrientes
              </Text>
              <Table.Root size="sm">
                <Table.Body>
                  {liabilities.current.map((account) => (
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
          )}

          {/* Pasivos No Corrientes */}
          {liabilities.nonCurrent.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
                Pasivos No Corrientes
              </Text>
              <Table.Root size="sm">
                <Table.Body>
                  {liabilities.nonCurrent.map((account) => (
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
          )}

          {/* Total Pasivos */}
          <Box bg="red.50" p={3} borderRadius="md">
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" color="red.800">
                TOTAL PASIVOS
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="red.800">
                {formatCurrency(Math.abs(liabilities.total))}
              </Text>
            </Stack>
          </Box>
        </Box>

        {/* PATRIMONIO NETO */}
        <Box>
          <Heading size="md" mb={3} color="blue.700">
            PATRIMONIO NETO
          </Heading>

          {equity.accounts.length > 0 && (
            <Box mb={4}>
              <Table.Root size="sm">
                <Table.Body>
                  {equity.accounts.map((account) => (
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
          )}

          {/* Total Patrimonio */}
          <Box bg="blue.50" p={3} borderRadius="md">
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold" color="blue.800">
                TOTAL PATRIMONIO NETO
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="blue.800">
                {formatCurrency(Math.abs(equity.total))}
              </Text>
            </Stack>
          </Box>
        </Box>

        {/* RESUMEN */}
        <Box bg="gray.100" p={4} borderRadius="md" borderWidth={2} borderColor="gray.300">
          <Stack gap={2}>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold">Total Pasivos + Patrimonio</Text>
              <Text fontWeight="bold" fontSize="lg">
                {formatCurrency(Math.abs(totalLiabilitiesAndEquity))}
              </Text>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="bold">Total Activos</Text>
              <Text fontWeight="bold" fontSize="lg">
                {formatCurrency(Math.abs(totalAssets))}
              </Text>
            </Stack>

            <Box height="1px" bg="gray.400" />

            <Stack direction="row" justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="lg">
                Balance
              </Text>
              <Stack direction="row" align="center" gap={2}>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color={balanced ? 'green.600' : 'red.600'}
                >
                  {balanced ? '✓ BALANCEADO' : '✗ NO BALANCEA'}
                </Text>
                {!balanced && (
                  <Text fontSize="sm" color="red.600">
                    (Dif: {formatCurrency(variance)})
                  </Text>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
