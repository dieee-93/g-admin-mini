/**
 * BILLING WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Billing:
 * - Facturas pendientes
 * - Monto vencido
 * - Facturación recurrente mensual
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface BillingStats {
  pendingInvoices: number;
  overdueAmount: number;
  monthlyRecurring: number;
}

export default function BillingWidget() {
  const navigate = useNavigate();

  // ✅ MOCK DATA - Replace with actual store when available
  const stats: BillingStats = useMemo(() => ({
    pendingInvoices: 0,
    overdueAmount: 0,
    monthlyRecurring: 0
  }), []);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="green"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <Icon icon={CreditCardIcon} size="md" color="green.500" />
            <Typography variant="body" size="md" weight="medium">
              Billing Status
            </Typography>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Facturas Pendientes
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.pendingInvoices}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Monto Vencido
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="red.600">
                  ${stats.overdueAmount.toLocaleString()}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Recurrente Mensual
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="green.600">
                  ${stats.monthlyRecurring.toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            size="sm"
            colorPalette="green"
            variant="outline"
            onClick={() => navigate('/admin/finance/billing')}
          >
            Ver Facturación
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
