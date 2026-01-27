/**
 * Journal Entries Viewer
 * Componente para visualizar journal entries (asientos contables)
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Stack,
  Table,
  Badge,
  Text,
  Spinner,
  Icon,
  Button,
} from '@chakra-ui/react';
import {
  DocumentTextIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/decimal';
import { fetchJournalEntries, getJournalEntry } from '@/modules/cash/services';
import { logger } from '@/lib/logging';
import type { JournalEntryRow, JournalEntryWithLines } from '@/modules/cash/types';

interface JournalEntriesViewerProps {
  cashSessionId?: string;
  limit?: number;
}

export function JournalEntriesViewer({
  cashSessionId,
  limit = 50,
}: JournalEntriesViewerProps) {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journal-entries', cashSessionId],
    queryFn: () =>
      fetchJournalEntries({
        cashSessionId,
        limit,
      }),
  });

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
        <Icon fontSize="3xl" color="gray.400" mb={2}>
          <DocumentTextIcon />
        </Icon>
        <Text color="gray.500">No hay asientos contables registrados</Text>
        {cashSessionId && (
          <Text fontSize="sm" color="gray.400" mt={1}>
            Esta sesión aún no tiene journal entries asociados
          </Text>
        )}
      </Box>
    );
  }

  const toggleExpand = (entryId: string) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Asientos Contables
      </Heading>

      <Stack gap={3}>
        {entries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            isExpanded={expandedEntryId === entry.id}
            onToggleExpand={() => toggleExpand(entry.id)}
          />
        ))}
      </Stack>
    </Box>
  );
}

interface JournalEntryCardProps {
  entry: JournalEntryRow;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function JournalEntryCard({
  entry,
  isExpanded,
  onToggleExpand,
}: JournalEntryCardProps) {
  const { data: entryWithLines, isLoading: loadingLines } = useQuery({
    queryKey: ['journal-entry-details', entry.id],
    queryFn: () => getJournalEntry(entry.id),
    enabled: isExpanded,
  });

  const statusColor = entry.is_posted ? 'green' : 'yellow';
  const typeLabels: Record<string, string> = {
    SALE: 'Venta',
    PURCHASE: 'Compra',
    PAYMENT: 'Pago',
    RECEIPT: 'Cobro',
    TRANSFER: 'Transferencia',
    ADJUSTMENT: 'Ajuste',
    PAYROLL: 'Nómina',
    EXPENSE: 'Gasto',
    CASH_DROP: 'Retiro Parcial',
    DEPOSIT: 'Depósito',
    OPENING: 'Apertura',
    CLOSING: 'Cierre',
  };

  return (
    <Box
      bg="white"
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
      _hover={{ shadow: 'sm' }}
    >
      {/* Header */}
      <Stack
        direction="row"
        p={4}
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={onToggleExpand}
        _hover={{ bg: 'gray.50' }}
      >
        <Stack direction="row" align="center" gap={3} flex={1}>
          <Icon fontSize="xl" color="gray.500">
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Icon>

          <Stack gap={1} flex={1}>
            <Stack direction="row" align="center" gap={2}>
              <Text fontWeight="semibold" fontSize="sm">
                {entry.entry_number || `Entry ${entry.id.slice(0, 8)}`}
              </Text>
              <Badge colorPalette={statusColor} size="sm">
                {entry.is_posted ? 'Contabilizado' : 'Borrador'}
              </Badge>
              <Badge colorPalette="blue" size="sm">
                {typeLabels[entry.entry_type] || entry.entry_type}
              </Badge>
            </Stack>

            <Text fontSize="xs" color="gray.600">
              {entry.description || 'Sin descripción'}
            </Text>

            <Text fontSize="xs" color="gray.400">
              {new Date(entry.transaction_date).toLocaleDateString('es-AR')}
              {entry.posted_at &&
                ` • Contabilizado: ${new Date(entry.posted_at).toLocaleDateString('es-AR')}`}
            </Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Lines Detail */}
      {isExpanded && (
        <Box p={4} pt={0} bg="gray.50">
          {loadingLines ? (
            <Box textAlign="center" py={4}>
              <Spinner size="sm" />
            </Box>
          ) : entryWithLines ? (
            <JournalLinesTable entry={entryWithLines} />
          ) : (
            <Text fontSize="sm" color="gray.500">
              No se pudieron cargar los detalles
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

interface JournalLinesTableProps {
  entry: JournalEntryWithLines;
}

function JournalLinesTable({ entry }: JournalLinesTableProps) {
  const totalDebit = entry.lines
    .filter((line) => line.amount < 0)
    .reduce((sum, line) => sum + Math.abs(line.amount), 0);

  const totalCredit = entry.lines
    .filter((line) => line.amount > 0)
    .reduce((sum, line) => sum + line.amount, 0);

  const balance = entry.lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <Box>
      <Table.Root size="sm" variant="simple">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Cuenta</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Débito</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Crédito</Table.ColumnHeader>
            <Table.ColumnHeader>Descripción</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {entry.lines.map((line) => (
            <Table.Row key={line.id}>
              <Table.Cell>
                <Stack gap={0}>
                  <Text fontSize="xs" fontWeight="semibold">
                    {line.account_code}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {line.account_name}
                  </Text>
                </Stack>
              </Table.Cell>
              <Table.Cell textAlign="right">
                {line.amount < 0 ? (
                  <Text fontWeight="semibold" color="red.600">
                    {formatCurrency(Math.abs(line.amount))}
                  </Text>
                ) : (
                  <Text color="gray.400">-</Text>
                )}
              </Table.Cell>
              <Table.Cell textAlign="right">
                {line.amount > 0 ? (
                  <Text fontWeight="semibold" color="green.600">
                    {formatCurrency(line.amount)}
                  </Text>
                ) : (
                  <Text color="gray.400">-</Text>
                )}
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="xs" color="gray.600">
                  {line.description || '-'}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}

          {/* Totales */}
          <Table.Row bg="gray.100" fontWeight="bold">
            <Table.Cell>
              <Text fontWeight="bold">TOTALES</Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Text fontWeight="bold" color="red.600">
                {formatCurrency(totalDebit)}
              </Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Text fontWeight="bold" color="green.600">
                {formatCurrency(totalCredit)}
              </Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Stack direction="row" align="center" justify="flex-end" gap={2}>
                <Text fontSize="xs" color="gray.600">
                  Balance:
                </Text>
                <Badge
                  colorPalette={Math.abs(balance) < 0.01 ? 'green' : 'red'}
                  size="sm"
                >
                  {formatCurrency(balance)}
                </Badge>
              </Stack>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      {/* Notas adicionales */}
      {entry.notes && (
        <Box mt={4} p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="xs" fontWeight="semibold" color="blue.900" mb={1}>
            Notas:
          </Text>
          <Text fontSize="xs" color="blue.800">
            {entry.notes}
          </Text>
        </Box>
      )}
    </Box>
  );
}
