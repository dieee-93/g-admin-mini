/**
 * Customers Overview Widget - Dynamic Dashboard Component
 *
 * Muestra métricas clave de clientes (CRM):
 * - Total de clientes
 * - Clientes activos
 * - Nuevos este mes
 * - Clientes VIP
 *
 * Visible solo si crm_customer_database o analytics_customer_insights están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React from 'react';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { useCustomerStats } from '@/modules/customers/hooks';

export function CustomersWidget() {
  // ✅ Use TanStack Query hook for server state (MIGRATED)
  const { data: stats, isLoading: loading } = useCustomerStats();

  const totalCustomers = stats?.totalCustomers || 0;
  const activeCustomers = stats?.activeCustomers || 0;
  const newThisMonth = stats?.newThisMonth || 0;
  const vipCustomers = stats?.vipCustomers || 0;

  // Calcular porcentaje de activos
  const activePercentage = totalCustomers > 0
    ? ((activeCustomers / totalCustomers) * 100).toFixed(0)
    : 0;

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="blue"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="3">
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="2" flex={1}>
              <Typography variant="body" size="sm" color="text.secondary">
                Base de Clientes
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  Cargando...
                </Typography>
              ) : (
                <>
                  <Typography variant="heading" level={3} weight="bold">
                    {totalCustomers}
                  </Typography>

                  <Stack direction="row" gap="2" align="center">
                    <Badge variant="subtle" colorPalette="green" size="xs">
                      {activeCustomers} activos ({activePercentage}%)
                    </Badge>
                    {vipCustomers > 0 && (
                      <Badge variant="subtle" colorPalette="purple" size="xs">
                        <Stack direction="row" align="center" gap="1">
                          <Icon size="xs">
                <StarIcon />
              </Icon>
                          {vipCustomers} VIP
                        </Stack>
                      </Badge>
                    )}
                  </Stack>
                </>
              )}
            </Stack>

            <Stack
              p="3"
              bg="blue.100"
              borderRadius="full"
              color="blue.600"
            >
              <Icon size="lg">
                <UserGroupIcon />
              </Icon>
            </Stack>
          </Stack>

          {!loading && newThisMonth > 0 && (
            <Box p="2" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Typography variant="body" size="xs" color="green.700">
                +{newThisMonth} nuevos este mes
              </Typography>
            </Box>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default CustomersWidget;
