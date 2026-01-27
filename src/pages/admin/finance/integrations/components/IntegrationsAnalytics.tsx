import React from 'react';
import { Section, Stack, Badge, Alert, EmptyState, SimpleGrid } from '@/shared/ui';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { usePaymentAnalytics } from '@/modules/finance-integrations/hooks/usePayments';

const IntegrationsAnalytics: React.FC = () => {
  // Fetch last 30 days by default
  const timeRange = React.useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return { startDate, endDate };
  }, []);

  const { data: analytics, isLoading } = usePaymentAnalytics(timeRange);

  if (isLoading) {
    return <Alert status="info" title="Cargando analytics..." />;
  }

  if (!analytics || analytics.totalTransactions === 0) {
    return (
      <EmptyState
        title="No hay datos de analytics"
        description="Las métricas de pago aparecerán aquí cuando se procesen transacciones."
        icon={ChartBarIcon}
      />
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Stack gap="lg">
      {/* Overview Metrics */}
      <Section title="Métricas Generales (Últimos 30 días)" variant="elevated">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          <Stack
            align="center"
            padding="lg"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#3182ce' }}>
              {analytics.totalTransactions}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Total Transacciones</p>
          </Stack>

          <Stack
            align="center"
            padding="lg"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#38a169' }}>
              {formatCurrency(analytics.totalVolume)}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Volumen Total</p>
          </Stack>

          <Stack
            align="center"
            padding="lg"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#805ad5' }}>
              {formatPercent(analytics.successRate)}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Success Rate</p>
          </Stack>

          <Stack
            align="center"
            padding="lg"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#d69e2e' }}>
              {formatCurrency(analytics.avgTransactionAmount)}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>Ticket Promedio</p>
          </Stack>
        </SimpleGrid>
      </Section>

      {/* By Provider */}
      {analytics.byProvider.length > 0 && (
        <Section title="Por Provider" variant="elevated">
          <Stack gap="md">
            {analytics.byProvider.map((provider) => (
              <Stack
                key={provider.provider}
                padding="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {provider.provider}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {provider.count} transacciones • {formatCurrency(provider.volume)}
                    </p>
                  </Stack>
                  <Badge colorPalette={provider.successRate > 95 ? 'green' : 'orange'}>
                    Success: {formatPercent(provider.successRate)}
                  </Badge>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>
      )}

      {/* By Payment Type */}
      {analytics.byPaymentType.length > 0 && (
        <Section title="Por Tipo de Pago" variant="elevated">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
            {analytics.byPaymentType.map((type) => (
              <Stack
                key={type.type}
                padding="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                align="center"
              >
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{type.count}</p>
                <p style={{ fontSize: '14px', fontWeight: '500' }}>{type.type}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(type.volume)}</p>
              </Stack>
            ))}
          </SimpleGrid>
        </Section>
      )}

      {/* By Status */}
      {analytics.byStatus.length > 0 && (
        <Section title="Por Estado" variant="elevated">
          <Stack direction="row" gap="md" flexWrap="wrap">
            {analytics.byStatus.map((status) => (
              <Stack
                key={status.status}
                flex="1"
                minWidth="150px"
                padding="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                align="center"
              >
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{status.count}</p>
                <Badge
                  colorPalette={
                    status.status === 'SETTLED'
                      ? 'green'
                      : status.status === 'FAILED'
                      ? 'red'
                      : 'blue'
                  }
                >
                  {status.status}
                </Badge>
              </Stack>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  );
};

export default IntegrationsAnalytics;
