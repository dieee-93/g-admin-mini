/**
 * CUSTOMERS WIDGET - Dashboard Integration
 *
 * Simple widget showing customer metrics for the main dashboard
 */

import { Stack, Text, Badge, HStack } from '@/shared/ui';
import { UsersIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { useState, useEffect } from 'react';
import { CustomerAPI } from '../services/customerApi';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';

export function CustomersWidget() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    atRisk: 0,
    avgLifetimeValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const customers = await CustomerAPI.getCustomers(user, {
          status: 'active',
          limit: 1000,
        });

        // Calculate basic metrics
        const total = customers.length;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const active = customers.filter(c => {
          // Consider active if created in last 30 days (simple heuristic)
          return new Date(c.created_at) >= thirtyDaysAgo;
        }).length;

        // TODO: Calculate real at-risk customers using RFM analysis
        const atRisk = 0;

        // TODO: Calculate real CLV from sales data
        const avgCLV = 0;

        setMetrics({
          totalCustomers: total,
          activeCustomers: active,
          atRisk,
          avgLifetimeValue: avgCLV,
        });
      } catch (error) {
        logger.error('CustomersWidget', 'Error loading metrics', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [user]);

  if (loading) {
    return (
      <Stack gap="2" p="4">
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">
          Loading customer metrics...
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="3" p="4">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack gap="2">
          <UsersIcon className="w-5 h-5" />
          <Text fontSize="sm" fontWeight="semibold">
            Customers
          </Text>
        </HStack>
        {metrics.atRisk > 0 && (
          <Badge colorPalette="red" variant="subtle" size="sm">
            {metrics.atRisk} at risk
          </Badge>
        )}
      </HStack>

      {/* Metrics */}
      <Stack gap="2">
        <HStack justify="space-between">
          <Text fontSize="xs" color="fg.muted">
            Total Customers
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {metrics.totalCustomers}
          </Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="xs" color="fg.muted">
            Active (30d)
          </Text>
          <Badge colorPalette="green" variant="subtle" size="sm">
            {metrics.activeCustomers}
          </Badge>
        </HStack>

        {metrics.avgLifetimeValue > 0 && (
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted">
              <CurrencyDollarIcon className="w-3 h-3 inline mr-1" />
              Avg. CLV
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              {DecimalUtils.formatCurrency(metrics.avgLifetimeValue)}
            </Text>
          </HStack>
        )}

        {metrics.atRisk > 0 && (
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted">
              <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
              At Risk
            </Text>
            <Badge colorPalette="red" variant="subtle" size="sm">
              {metrics.atRisk}
            </Badge>
          </HStack>
        )}
      </Stack>
    </Stack>
  );
}
