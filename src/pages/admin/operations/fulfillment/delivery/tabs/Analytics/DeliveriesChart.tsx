import { Stack, Box, Text, CardWrapper } from '@/shared/ui';
import type { DeliveryMetrics } from '@/modules/fulfillment/delivery/types';

interface DeliveriesChartProps {
  metrics: DeliveryMetrics;
}

export function DeliveriesChart({ metrics }: DeliveriesChartProps) {
  const data = [
    { label: 'Pendientes', value: metrics.pending_assignments, color: '#6b7280' },
    { label: 'Activos', value: metrics.active_deliveries, color: '#3b82f6' },
    { label: 'Completados', value: metrics.total_deliveries_today, color: '#10b981' },
    { label: 'Fallidos', value: metrics.failed_deliveries_today, color: '#ef4444' }
  ];

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <CardWrapper>
      <Stack gap="md">
        <Text fontWeight="bold" fontSize="lg">
          📈 Deliveries por Estado
        </Text>
        <Stack gap="sm">
          {data.map((item) => (
            <Stack key={item.label} gap="xs">
              <Stack direction="row" justify="space-between" fontSize="sm">
                <Text fontWeight="medium">{item.label}</Text>
                <Text fontWeight="bold">{item.value}</Text>
              </Stack>
              <Box position="relative" height="24px" bg="gray.100" borderRadius="md" overflow="hidden">
                <Box
                  height="100%"
                  bg={item.color}
                  width={`${(item.value / maxValue) * 100}%`}
                  transition="width 0.3s"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  paddingRight="8px"
                >
                  {item.value > 0 && (
                    <Text color="white" fontSize="sm" fontWeight="bold">
                      {item.value}
                    </Text>
                  )}
                </Box>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </CardWrapper>
  );
}
