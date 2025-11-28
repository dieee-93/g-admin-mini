/**
 * Journal Entries Viewer
 * Componente para visualizar journal entries (asientos contables)
 * Implementado siguiendo el patrón de materials (useState + useEffect)
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
import { formatCurrency } from '@/business-logic/shared/decimalUtils';
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
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchJournalEntries({
          cashSessionId,
          limit,
        });

        if (mounted) {
          setEntries(data);
        }
      } catch (err) {
        logger.error('JournalEntriesViewer', 'Failed to load entries', { error: err });
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar asientos');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadEntries();

    return () => {
      mounted = false;
    };
  }, [cashSessionId, limit]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center" bg="red.50" borderRadius="md">
        <Text color="red.600">{error}</Text>
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

function JournalEntryCard({ entry, isExpanded, onToggleExpand }: JournalEntryCardProps) {
  const [entryDetails, setEntryDetails] = useState<JournalEntryWithLines | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      if (!isExpanded || entryDetails) return;

      try {
        setLoading(true);
        const details = await getJournalEntry(entry.id);
        if (mounted) {
          setEntryDetails(details);
        }
      } catch (err) {
        logger.error('JournalEntryCard', 'Failed to load entry details', { error: err });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [isExpanded, entry.id, entryDetails]);

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Button
        onClick={onToggleExpand}
        variant="ghost"
        w="full"
        justifyContent="space-between"
      >
        <Stack direction="row" gap={4} align="center">
          <Icon>
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Icon>
          <Box textAlign="left">
            <Text fontWeight="semibold">{entry.entry_number}</Text>
            <Text fontSize="sm" color="gray.600">
              {new Date(entry.entry_date).toLocaleDateString()}
            </Text>
          </Box>
        </Stack>
        <Badge colorScheme={entry.posted ? 'green' : 'gray'}>
          {entry.posted ? 'Publicado' : 'Borrador'}
        </Badge>
      </Button>

      {isExpanded && (
        <Box mt={4} pl={8}>
          {loading ? (
            <Spinner size="sm" />
          ) : entryDetails ? (
            <Table.Root size="sm" variant="simple">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Cuenta</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Débito</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Crédito</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {entryDetails.lines.map((line) => (
                  <Table.Row key={line.id}>
                    <Table.Cell>
                      <Text fontWeight="medium">{line.account_code}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {line.account_name}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {line.debit ? formatCurrency(line.debit) : '-'}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {line.credit ? formatCurrency(line.credit) : '-'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text color="gray.500">No se pudieron cargar los detalles</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
