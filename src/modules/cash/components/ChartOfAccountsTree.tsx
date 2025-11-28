/**
 * Chart of Accounts Tree Component
 * Visualización jerárquica del Plan de Cuentas
 */

import { Box, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { fetchChartOfAccounts, buildAccountTree } from '../services';
import { logger } from '@/lib/logging';
import type { ChartOfAccountsNode } from '../types';

export function ChartOfAccountsTree() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        setIsLoading(true);
        const data = await fetchChartOfAccounts();
        setAccounts(data);
      } catch (err) {
        logger.error('CashModule', 'Error loading chart of accounts', { error: err });
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, []);
  });

  if (isLoading) {
    return (
      <Stack align="center" py={8}>
        <Spinner size="lg" />
        <Text>Cargando plan de cuentas...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.700">Error al cargar plan de cuentas</Text>
      </Box>
    );
  }

  const tree = buildAccountTree(accounts || []);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Plan de Cuentas
      </Heading>

      <Stack gap={2}>
        {tree.map((account) => (
          <AccountNode key={account.id} account={account} />
        ))}
      </Stack>
    </Box>
  );
}

interface AccountNodeProps {
  account: ChartOfAccountsNode;
}

function AccountNode({ account }: AccountNodeProps) {
  const { code, name, is_group, account_type, children, level } = account;

  const indent = level * 24;
  const fontWeight = is_group ? 'bold' : 'normal';
  const fontSize = is_group && level === 0 ? 'lg' : 'md';

  return (
    <Box>
      <Box
        ml={`${indent}px`}
        p={2}
        bg={is_group ? 'gray.50' : 'white'}
        borderRadius="sm"
        borderLeftWidth={is_group ? 3 : 1}
        borderLeftColor={getAccountTypeColor(account_type)}
      >
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap={2}>
            <Text fontWeight={fontWeight} fontSize={fontSize}>
              {code}
            </Text>
            <Text fontWeight={fontWeight} fontSize={fontSize}>
              {name}
            </Text>
          </Stack>

          {is_group && (
            <Text fontSize="xs" color="gray.500">
              {children.length} {children.length === 1 ? 'cuenta' : 'cuentas'}
            </Text>
          )}
        </Stack>
      </Box>

      {children.map((child) => (
        <AccountNode key={child.id} account={child} />
      ))}
    </Box>
  );
}

function getAccountTypeColor(type: string): string {
  switch (type) {
    case 'ASSET':
      return 'green.500';
    case 'LIABILITY':
      return 'red.500';
    case 'EQUITY':
      return 'blue.500';
    case 'INCOME':
      return 'teal.500';
    case 'EXPENSE':
      return 'orange.500';
    default:
      return 'gray.300';
  }
}
